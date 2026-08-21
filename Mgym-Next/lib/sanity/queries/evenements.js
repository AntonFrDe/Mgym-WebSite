// evenements.js — stages et ateliers.

import { interroger } from '../fetch.js'
import { EVENEMENTS_A_VENIR, EVENEMENT_PAR_SLUG } from './groq.js'

/**
 * Les événements à venir uniquement : un stage passé n'a rien à faire sur
 * la page d'accueil.
 *
 * `maintenant` est fourni par l'appelant plutôt que calculé dans la
 * requête : une requête qui dépend de l'horloge du serveur Sanity n'est
 * ni reproductible ni testable.
 *
 * @param {boolean} [preview]
 */
export const getEvenementsAVenir = (preview = false) =>
  interroger({
    requete: EVENEMENTS_A_VENIR,
    parametres: { maintenant: new Date().toISOString() },
    preview,
    siEchec: [],
  })

/**
 * @param {string} slug
 * @param {boolean} [preview]
 */
export const getEvenementParSlug = (slug, preview = false) =>
  interroger({
    requete: EVENEMENT_PAR_SLUG,
    parametres: { slug: String(slug ?? '') },
    preview,
    siEchec: null,
  })
