// adresse-web.js — fabrique l'adresse web (le « slug ») d'un article ou d'un
// événement à partir de son titre.
//
// POURQUOI
// Le back-office exigeait de cliquer sur « Generate » avant de publier. En
// l'oubliant, la publication était refusée avec un message en rouge : c'est
// l'une des raisons pour lesquelles « l'ajout des événements ne marchait
// pas ». Le bouton « Publier » remplit désormais l'adresse tout seul (voir
// sanity/lib/actions.jsx), avec cette fonction.
//
// Pour un ÉVÉNEMENT, la date est ajoutée : le « Stage Yoga » d'automne et
// celui de printemps n'ont ainsi jamais la même adresse.
//
// Fonction pure, sans dépendance : testée dans adresse-web.test.mjs.

const LONGUEUR_MAX = 80

/** « Taï Chi Chuan & Qi Gong » → « tai-chi-chuan-and-qi-gong ». */
export function versAdresse(titre) {
  return String(titre ?? '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')   // accents retirés
    .toLowerCase()
    .replace(/&/g, ' and ')                               // comme « Generate »
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, LONGUEUR_MAX)
    .replace(/-+$/, '')
}

/** « AAAA-MM-JJ » du jour à Paris : un stage à 23h30 reste le bon jour. */
function jourAParis(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Paris' }).format(d)
}

/**
 * @param {{_type?: string, titre?: string, dateDebut?: string}} doc
 * @returns {string} l'adresse, ou '' si le titre est vide
 */
export function adressePour(doc) {
  const base = versAdresse(doc?.titre)
  if (!base) return ''
  const jour = doc?._type === 'evenement' && doc.dateDebut ? jourAParis(doc.dateDebut) : ''
  return jour ? `${base}-${jour}` : base
}
