// activites.js — les activités du bloc « Nos pratiques ».
//
// Le tri et le filtrage des activités désactivées se font dans la requête :
// un composant ne doit pas avoir à se demander s'il doit afficher une
// donnée qu'on lui a passée.

import { interroger } from '../fetch.js'
import { ACTIVITES, ACTIVITE_PAR_SLUG } from './groq.js'

/** @param {boolean} [preview] */
export const getActivites = (preview = false) =>
  interroger({ requete: ACTIVITES, preview, siEchec: [] })

/**
 * @param {string} slug  valeur venant de l'URL : passée en PARAMÈTRE,
 *   jamais concaténée dans la requête.
 * @param {boolean} [preview]
 */
export const getActiviteParSlug = (slug, preview = false) =>
  interroger({
    requete: ACTIVITE_PAR_SLUG,
    parametres: { slug: String(slug ?? '') },
    preview,
    siEchec: null,
  })
