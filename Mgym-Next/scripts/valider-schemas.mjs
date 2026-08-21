// valider-schemas.mjs — vérifie les schémas SANS connexion à Sanity.
//
// `npx sanity schema validate` exige un vrai projet et une origine CORS
// autorisée. Ce script fait la même vérification structurelle hors ligne :
// types inconnus, références cassées, noms en double, champs mal formés.
//
// Usage :  node scripts/valider-schemas.mjs

import { createSchema } from 'sanity'
import { schemaTypes, SINGLETONS } from '../sanity/schemaTypes/index.js'

let problemes = 0
const signale = (message) => { console.error('  ✗', message); problemes++ }

// ── 1. Compilation du schéma ────────────────────────────────────
const schema = createSchema({ name: 'mgym', types: schemaTypes })

const erreurs = schema._validation || []
for (const groupe of erreurs) {
  for (const p of groupe.problems || []) {
    // Sanity distingue erreurs (bloquantes) et avertissements.
    const ligne = `${groupe.path?.map((s) => s.name || s).join('.') || '?'} — ${p.message}`
    if (p.severity === 'error') signale(ligne)
    else console.warn('  ⚠', ligne)
  }
}

// ── 2. Vérifications propres au projet ──────────────────────────
const noms = schemaTypes.map((t) => t.name)

const doublons = noms.filter((n, i) => noms.indexOf(n) !== i)
if (doublons.length) signale(`noms en double : ${[...new Set(doublons)].join(', ')}`)

for (const s of SINGLETONS) {
  if (!noms.includes(s)) signale(`SINGLETONS cite « ${s} », absent du schéma`)
}

// Chaque document doit avoir un preview : sans lui, les listes du Studio
// affichent « Untitled » et deviennent inutilisables pour la cliente.
for (const t of schemaTypes) {
  if (t.type !== 'document') continue
  if (!t.preview) signale(`${t.name} : aucun preview défini`)
  if (!t.title) signale(`${t.name} : aucun titre lisible`)
}

// Chaque champ éditorial doit porter une description en français : c'est
// la documentation intégrée du back-office.
let sansDescription = []
for (const t of schemaTypes) {
  if (t.type !== 'document') continue
  for (const f of t.fields || []) {
    // Les champs évidents (slug généré, booléen déjà explicite) sont tolérés.
    if (!f.description && f.type !== 'slug') sansDescription.push(`${t.name}.${f.name}`)
  }
}
if (sansDescription.length) {
  console.warn(`  ⚠ ${sansDescription.length} champ(s) sans description :`)
  console.warn('     ' + sansDescription.join(', '))
}

// ── 3. Verdict ──────────────────────────────────────────────────
console.log('')
console.log(`  ${schemaTypes.length} types déclarés · ${schemaTypes.filter((t) => t.type === 'document').length} documents · ${SINGLETONS.length} singletons`)
if (problemes) {
  console.error(`\n  ÉCHEC — ${problemes} problème(s) bloquant(s)\n`)
  process.exit(1)
}
console.log('\n  OK — schéma valide\n')
