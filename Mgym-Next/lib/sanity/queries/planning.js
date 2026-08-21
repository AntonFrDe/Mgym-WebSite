// planning.js — les trois jeux de données du planning.
//
// Cette couche ne CALCULE rien : elle rapporte les créneaux, les exceptions
// et les fermetures tels qu'ils sont saisis. Le calcul des séances réelles
// est fait par lib/planning/moteur.js, fonction pure, sans accès réseau.
// Cette séparation rend le calcul testable sans Sanity.

import { interroger } from '../fetch.js'
import { CRENEAUX, EXCEPTIONS, FERMETURES } from './groq.js'

/**
 * @param {string} du  date ISO (AAAA-MM-JJ) incluse
 * @param {string} au  date ISO (AAAA-MM-JJ) incluse
 * @param {boolean} [preview]
 * @returns {Promise<{creneaux: any[], exceptions: any[], fermetures: any[]}>}
 */
export async function getDonneesPlanning(du, au, preview = false) {
  const parametres = { du: String(du), au: String(au) }

  // Trois requêtes indépendantes : aucune raison de les enchaîner.
  const [creneaux, exceptions, fermetures] = await Promise.all([
    interroger({ requete: CRENEAUX, preview, siEchec: [] }),
    interroger({ requete: EXCEPTIONS, parametres, preview, siEchec: [] }),
    interroger({ requete: FERMETURES, parametres, preview, siEchec: [] }),
  ])

  return {
    creneaux: creneaux ?? [],
    exceptions: exceptions ?? [],
    fermetures: fermetures ?? [],
  }
}
