// analyser-formulaires.mjs — mesure ce qui détermine le temps de saisie.
//
// Les objectifs de la Phase 19 (« ajouter un événement en moins de deux
// minutes ») ne se chronomètrent qu'avec un Studio en ligne. Mais ce qui
// FAIT la durée se mesure dès maintenant : le nombre de champs à remplir
// obligatoirement, la présence de valeurs par défaut, et le regroupement
// du formulaire.
//
// Usage :  node scripts/analyser-formulaires.mjs

import { schemaTypes } from '../sanity/schemaTypes/index.js'

/** Un champ est-il obligatoire ? On inspecte la règle de validation. */
function estObligatoire(champ) {
  if (typeof champ.validation !== 'function') return false
  let obligatoire = false
  const faux = new Proxy({}, {
    get(_, prop) {
      if (prop === 'required') { obligatoire = true }
      return () => faux
    },
  })
  try { champ.validation(faux) } catch { /* règle non inspectable */ }
  return obligatoire
}

const documents = schemaTypes.filter((t) => t.type === 'document')

console.log('\n  document          champs  obligatoires  avec défaut  groupes')
console.log('  ' + '─'.repeat(64))

const resume = []
for (const doc of documents) {
  const champs = doc.fields ?? []
  const obligatoires = champs.filter(estObligatoire)
  const defauts = champs.filter((c) => c.initialValue !== undefined)
  const groupes = (doc.groups ?? []).length

  resume.push({ nom: doc.name, total: champs.length, obligatoires: obligatoires.length })
  console.log(
    `  ${doc.name.padEnd(18)}${String(champs.length).padStart(4)}` +
    `${String(obligatoires.length).padStart(13)}` +
    `${String(defauts.length).padStart(13)}` +
    `${String(groupes || '—').padStart(9)}`
  )
  if (obligatoires.length) {
    console.log(`      obligatoires : ${obligatoires.map((c) => c.name).join(', ')}`)
  }
}

console.log('\n  ── Lecture ────────────────────────────────────────────────')
console.log('  Le temps de saisie dépend surtout du nombre de champs')
console.log('  OBLIGATOIRES : ce sont eux qui bloquent la publication.')
console.log('  Un formulaire à plus de 30 champs a besoin de groupes,')
console.log('  sinon il faut faire défiler pour trouver.\n')

let alertes = 0
for (const d of resume) {
  const doc = documents.find((x) => x.name === d.nom)
  if (d.total > 30 && !(doc.groups ?? []).length) {
    console.log(`  ⚠ ${d.nom} : ${d.total} champs sans groupes — difficile à parcourir`)
    alertes++
  }
  if (d.obligatoires > 6) {
    console.log(`  ⚠ ${d.nom} : ${d.obligatoires} champs obligatoires — saisie longue`)
    alertes++
  }
}
if (!alertes) console.log('  Aucune alerte : tous les formulaires sont dans les clous.\n')
