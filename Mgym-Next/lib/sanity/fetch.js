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
// 2. LE SITE NE TOMBE PAS SI SANITY TOMBE — mais il ne MENT pas non plus.
//    En production, une panne LÈVE une erreur : lors de la relecture
//    horaire, Next garde alors la dernière page bonne et réessaie plus
//    tard. (Seul cas visible : une panne dans les secondes qui suivent un
//    « Publier », la page jetée ne peut pas être refaite — le visiteur
//    voit une erreur jusqu'au rendu suivant réussi.) Avant, la panne
//    renvoyait le contenu par défaut, que Next mettait en cache comme une
//    page normale : le site affichait les anciens tarifs, sans erreur.
//    En développement et en aperçu, une panne rend `siEchec` (une valeur
//    vide) : la page s'affiche sans la section concernée.

import 'server-only'
import { clientPour } from './client.js'

// Au plus tard au bout de ce délai (en secondes), une réponse de Sanity
// gardée en cache est redemandée. MÊME NOMBRE que `revalidate` dans
// app/layout.js : la page et ses données vieillissent ensemble.
const DELAI_FILET = 3600

// Étiquette posée sur chaque réponse de Sanity : la route de publication
// (app/api/revalidation) jette toutes les réponses qui la portent.
export const ETIQUETTE_SANITY = 'sanity'

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
      // Après le build : la réponse est jetée à chaque « Publier » (grâce
      // à l'étiquette) et, au pire, au bout de DELAI_FILET. Sans délai, une
      // page régénérée relirait une réponse mise en cache pour toujours et
      // n'afficherait jamais la modification.
      //
      // Attention, ce cache est écrit sur disque et SURVIT d'un build à
      // l'autre : pendant `next build`, une entrée existante est
      // réutilisée quel que soit son âge. C'est `scripts/vider-cache-
      // donnees.mjs` (script `prebuild`) qui garantit qu'un build reparte
      // du contenu réellement publié.
      ...(preview
        ? { cache: 'no-store' }
        : { next: { revalidate: DELAI_FILET, tags: [ETIQUETTE_SANITY] } }),
    })
  } catch (erreur) {
    // Le message part dans les journaux du serveur, jamais vers le
    // navigateur : il peut contenir des détails d'infrastructure.
    console.error(
      '[sanity] requête en échec :',
      erreur instanceof Error ? erreur.message : String(erreur)
    )
    if (!preview && process.env.NODE_ENV === 'production') throw erreur
    return siEchec
  }
}
