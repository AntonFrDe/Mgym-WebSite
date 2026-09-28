// resume.js — le résumé d'un article, quand la cliente n'en a pas écrit.
//
// Le champ « Résumé » est devenu facultatif dans le back-office : une
// contrainte de moins pour publier. À sa place, on reprend le début du
// texte, coupé à la fin d'un mot, jamais au milieu. Testé dans resume.test.mjs.

/**
 * @param {string} texte   le texte brut de l'article
 * @param {number} [max]   longueur maximale, points de suspension compris
 */
export function resume(texte, max = 200) {
  const propre = String(texte ?? '').replace(/\s+/g, ' ').trim()
  if (propre.length <= max) return propre
  const coupe = propre.slice(0, max - 1)
  // Si le caractère suivant est une espace, la coupe tombe déjà entre deux
  // mots : on la garde. Sinon on recule jusqu'au dernier mot entier.
  const entre = propre[max - 1] === ' '
  const finDeMot = coupe.lastIndexOf(' ')
  const garde = entre || finDeMot <= max / 2 ? coupe : coupe.slice(0, finDeMot)
  return `${garde.replace(/[\s,;:.!?-]+$/, '')}…`
}
