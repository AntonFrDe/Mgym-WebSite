// stega.js — quels textes reçoivent les « marques invisibles » de l'aperçu.
//
// Dans l'aperçu du Studio, Sanity glisse des caractères invisibles à la fin
// des textes (le « stega ») : c'est ce qui permet, en cliquant sur un texte
// du site, d'ouvrir le champ qui le contient. Uniquement en APERÇU — le site
// public n'en reçoit jamais.
//
// Le revers : un texte marqué n'est plus égal à lui-même pour le code. Un
// statut « complet » suivi de caractères invisibles n'est plus reconnu, un
// numéro de téléphone donne un lien d'appel cassé, un jour de la semaine
// sort du planning. Ces champs-là, que le code COMPARE ou TRANSFORME au lieu
// de simplement les afficher, sont donc exclus ici.
//
// Fonction pure : testée dans stega.test.mjs.

/** Champs lus par le code, jamais seulement affichés. */
export const CHAMPS_SANS_STEGA = new Set([
  'telephone',   // devient un lien tel:
  'adresse',     // découpée en lignes, envoyée à la carte
  'statut',      // « ouvert » / « complet » / « annule » comparés
  'rubrique',    // range l'activité dans le carrousel ou un onglet
  'source',      // provenance d'un avis, sert de clé
  'jour',        // comparé aux jours du planning
  'heureDebut',  // triée et reformatée (« 19h15 »)
  'nouvelleHeure',
  'type',        // type d'exception du planning (« annule »…)
  'avisNote',    // convertie en nombre d'étoiles
  'avisNombre',
  'lienInterne', // ancre de page (#planning…)
])

/**
 * Le filtre passé au client Sanity (option `stega.filter`).
 *
 * @param {{sourcePath: (string|number)[], value: string, filterDefault: Function}} contexte
 * @returns {boolean} vrai si le texte peut recevoir les marques
 */
export function filtreStega(contexte) {
  const { sourcePath = [], value, filterDefault } = contexte
  // Une chaîne vide reste vide : marquée, elle ne l'est plus pour le code
  // (une ligne vide de liste redeviendrait une puce).
  if (typeof value === 'string' && !value.trim()) return false
  const fin = sourcePath.at(-1)
  if (typeof fin === 'string' && CHAMPS_SANS_STEGA.has(fin)) return false
  // Le nom d'un RÉSEAU choisit son logo ; le nom d'un tarif, lui, s'affiche.
  if (fin === 'nom' && sourcePath.includes('reseauxSociaux')) return false
  return filterDefault(contexte)
}
