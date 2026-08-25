// fetch.js — le SEUL endroit du projet qui parle à Sanity.
//
// Tout passe par `interroger()`. Aucune requête GROQ n'est écrite dans un
// composant : les composants reçoivent des données déjà prêtes, ils ne
// savent pas d'où elles viennent.
//
// DEUX GARANTIES PORTÉES ICI :
//
// 1. PARAMÈTRES. Les valeurs variables (un slug d'URL, une date) sont
//    passées séparément de la requête, jamais collées dedans. Une requête
//    construite par concaténation serait exploitable exactement comme une
//    injection SQL.
//
// 2. LE SITE NE TOMBE PAS SI SANITY TOMBE. Une panne de Sanity renvoie
//    `null` et laisse le composant afficher son état vide, plutôt que de
//    faire échouer le rendu de toute la page.

import 'server-only'
import { clientPour } from './client.js'
import { DELAI_REVALIDATION } from '../revalidation.js'

// Au-delà, on considère que Sanity ne répondra pas. Sans cette borne, un
// build peut rester bloqué indéfiniment sur une requête.
const DELAI_MAX_MS = 10_000

/**
 * @template T
 * @param {object} options
 * @param {string} options.requete       la requête GROQ
 * @param {Record<string, unknown>} [options.parametres]  valeurs variables
 * @param {boolean} [options.preview]    true = lire les brouillons
 * @param {T} [options.siEchec]          valeur renvoyée en cas de panne
 * @returns {Promise<T>}
 */
export async function interroger({
  requete,
  parametres = {},
  preview = false,
  siEchec = null,
}) {
  const client = clientPour(preview)

  // Sanity pas encore branché : on rend la valeur de repli sans bruit.
  // Ce n'est pas une erreur, c'est l'état du projet avant migration.
  if (!client) return siEchec

  try {
    return await client.fetch(requete, parametres, {
      signal: AbortSignal.timeout(DELAI_MAX_MS),
      // En prévisualisation, jamais de cache : la cliente doit voir sa
      // saisie de l'instant, pas celle d'il y a trois minutes.
      // Deux rôles, un seul réglage.
      //
      // Pendant le build : mutualise les requêtes identiques — la page et
      // le layout demandent tous deux le contenu du site, Sanity n'est
      // interrogé qu'une fois.
      //
      // Après le build : le même délai fait expirer la réponse, ce qui
      // permet à la page de redemander son contenu au CMS sans qu'on
      // reconstruise quoi que ce soit. Sans cela, une page régénérée
      // relirait une réponse mise en cache pour toujours et n'afficherait
      // jamais la modification.
      //
      // Attention, ce cache est écrit sur disque et SURVIT d'un build à
      // l'autre : pendant `next build`, une entrée existante est
      // réutilisée quel que soit son âge. C'est `scripts/vider-cache-
      // donnees.mjs` (script `prebuild`) qui garantit qu'un build reparte
      // du contenu réellement publié.
      ...(preview
        ? { cache: 'no-store' }
        : { next: { revalidate: DELAI_REVALIDATION } }),
    })
  } catch (erreur) {
    // Le message part dans les journaux du serveur, jamais vers le
    // navigateur : il peut contenir des détails d'infrastructure.
    console.error(
      '[sanity] requête en échec :',
      erreur instanceof Error ? erreur.message : String(erreur)
    )
    return siEchec
  }
}
