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
import { apiVersion, dataset, projectId } from './env.js'

// Réglages communs. `useCdn: true` sert le contenu publié depuis le cache
// de Sanity : plus rapide et moins coûteux en quota d'API.
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
 */
export const clientPublie = createClient({
  ...communs,
  useCdn: true,
  perspective: 'published',
})

/**
 * Client de PRÉVISUALISATION. Ne fonctionne que si un token de lecture est
 * présent dans l'environnement serveur. `useCdn: false` est obligatoire :
 * le CDN ne connaît que le contenu publié, il servirait une version périmée.
 */
export const clientBrouillon = createClient({
  ...communs,
  useCdn: false,
  perspective: 'drafts',
  token: process.env.SANITY_API_READ_TOKEN,
  // Empêche next-sanity de mettre les brouillons en cache : une
  // prévisualisation doit toujours refléter l'état actuel de la saisie.
  stega: false,
})

/**
 * Le SEUL endroit du projet qui choisit entre les deux clients.
 *
 * @param {boolean} estEnPreview  résultat de draftMode(), jamais un
 *   paramètre d'URL. Voir app/api/preview/route.js.
 * @returns {import('next-sanity').SanityClient}
 */
export function clientPour(estEnPreview) {
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
