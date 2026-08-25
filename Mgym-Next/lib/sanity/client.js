// client.js — les DEUX clients Sanity du projet, et rien d'autre.
//
// Il y en a exactement deux, et la distinction est le cœur de la sécurité
// du système :
//
//   clientPublie   -> ne voit QUE le contenu publié. Aucun token.
//                     C'est lui qui alimente le site public.
//
//   clientBrouillon-> voit les brouillons. Exige un token de lecture,
//                     disponible uniquement côté serveur. C'est lui qui
//                     alimente le mode prévisualisation.
//
// RÈGLE ABSOLUE : le site public ne doit JAMAIS utiliser clientBrouillon.
// La fonction `clientPour(estEnPreview)` plus bas est le seul point de
// choix ; personne d'autre ne décide.
//
// `import 'server-only'` fait échouer le build si un composant client
// importe ce fichier par mégarde. C'est un garde-fou de compilation :
// il vaut mieux qu'un build casse qu'un token parte dans le navigateur.

import 'server-only'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId, sanityConfigure } from './env.js'

// Réglages communs.
const communs = {
  projectId,
  dataset,
  apiVersion,
}

/**
 * Client du SITE PUBLIC. Sans token, et `perspective: 'published'` :
 * même si une requête demandait explicitement un brouillon, l'API n'en
 * renverrait aucun. La protection est côté serveur Sanity, pas seulement
 * dans nos requêtes.
 *
 * `useCdn: false` alors que le CDN serait plus rapide et moins coûteux :
 * toutes les lectures de ce client ont lieu PENDANT LE BUILD, jamais à la
 * requête d'un visiteur. Le cache n'économise donc rien de significatif —
 * une douzaine de requêtes par build — mais il introduit un décalage.
 * Constaté deux fois sur ce projet : contenu publié, vérifié présent sur
 * le CDN par une requête directe, et pourtant absent du build lancé dans
 * la foulée. Les nœuds du CDN ne se mettent pas à jour ensemble.
 *
 * Or le build est déclenché par « Publier ». Une lecture périmée à cet
 * instant précis, c'est la modification de la cliente qui n'arrive pas
 * sur son site, sans le moindre message d'erreur.
 */
export const clientPublie = sanityConfigure
  ? createClient({ ...communs, useCdn: false, perspective: 'published' })
  : null

/**
 * Client de PRÉVISUALISATION. Ne fonctionne que si un token de lecture est
 * présent dans l'environnement serveur. `useCdn: false` est obligatoire :
 * le CDN ne connaît que le contenu publié, il servirait une version périmée.
 */
export const clientBrouillon = sanityConfigure
  ? createClient({
      ...communs,
      useCdn: false,
      perspective: 'drafts',
      token: process.env.SANITY_API_READ_TOKEN,
      // Pas de couche stega : une prévisualisation doit refléter la
      // saisie de l'instant, pas une version mise en cache.
      stega: false,
    })
  : null

/**
 * Le SEUL endroit du projet qui choisit entre les deux clients.
 *
 * @param {boolean} estEnPreview  résultat de draftMode(), jamais un
 *   paramètre d'URL. Voir app/api/preview/route.js.
 * @returns {import('next-sanity').SanityClient}
 */
export function clientPour(estEnPreview) {
  // Projet non configuré : aucun client. L'appelant retombera sur le
  // contenu par défaut.
  if (!sanityConfigure) return null

  if (!estEnPreview) return clientPublie

  if (!process.env.SANITY_API_READ_TOKEN) {
    // Repli volontairement silencieux vers le contenu publié : mieux vaut
    // une prévisualisation qui montre l'ancien contenu qu'une page en
    // erreur. L'avertissement n'apparaît que dans les journaux serveur.
    console.warn(
      '[sanity] SANITY_API_READ_TOKEN absent : la prévisualisation retombe ' +
      'sur le contenu publié.'
    )
    return clientPublie
  }

  return clientBrouillon
}
