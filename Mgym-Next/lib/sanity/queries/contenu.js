// contenu.js — les textes du site, les coordonnées et le référencement.
// Trois documents uniques : les requêtes prennent le premier avec [0].

import { interroger } from '../fetch.js'
import { SITE_CONTENT, INFOS_PRATIQUES, SEO_GLOBAL } from './groq.js'

/** @param {boolean} [preview] */
export const getSiteContent = (preview = false) =>
  interroger({ requete: SITE_CONTENT, preview, siEchec: null })

/** @param {boolean} [preview] */
export const getInfosPratiques = (preview = false) =>
  interroger({ requete: INFOS_PRATIQUES, preview, siEchec: null })

/** @param {boolean} [preview] */
export const getSeoGlobal = (preview = false) =>
  interroger({ requete: SEO_GLOBAL, preview, siEchec: null })
