// valider-requetes.mjs — vérifie que chaque requête GROQ compile, et
// qu'aucune ne concatène de donnée variable.
//
// Ces deux contrôles se font hors ligne : ni Sanity, ni réseau, ni token.
//
// Usage :  node scripts/valider-requetes.mjs

import { parse } from 'groq-js'
import { readFileSync } from 'node:fs'
import * as requetes from '../lib/sanity/queries/groq.js'

let problemes = 0
const signale = (m) => { console.error('  ✗', m); problemes++ }

// ── 1. Chaque requête exportée doit compiler ────────────────────
// On ne garde que celles qui commencent par *[ : IMAGE et TEXTE_RICHE sont
// des fragments de projection, pas des requêtes autonomes.
const aTester = Object.entries(requetes).filter(([, v]) =>
  typeof v === 'string' && v.trim().startsWith('*[')
)

for (const [nom, requete] of aTester) {
  try {
    parse(requete)
  } catch (e) {
    signale(`${nom} ne compile pas : ${e.message}`)
  }
}
console.log(`  ${aTester.length} requêtes compilées`)

// ── 2. Aucune donnée variable concaténée ────────────────────────
// Le fichier source ne doit interpoler que des fragments déclarés en
// MAJUSCULES juste au-dessus. Un ${slug} ou ${id} signalerait une requête
// construite à la main, donc une injection possible.
const brut = readFileSync(new URL('../lib/sanity/queries/groq.js', import.meta.url), 'utf8')

// Les commentaires sont retirés avant analyse : un contrôle qui se
// déclenche sur un commentaire d'explication n'apprend rien.
const source = brut.replace(/^\s*\/\/.*$/gm, '')

const interpolations = [...source.matchAll(/\$\{([^}]+)\}/g)].map((m) => m[1].trim())
const suspectes = interpolations.filter((i) => !/^[A-Z][A-Z_]*$/.test(i))

if (suspectes.length) {
  signale(`interpolation non constante : ${[...new Set(suspectes)].join(', ')}`)
} else {
  console.log(`  ${interpolations.length} interpolations, toutes des fragments constants`)
}

// ── 3. Les valeurs extérieures passent bien par des paramètres ──
const parametres = [...source.matchAll(/\$([a-z][a-zA-Z]*)/g)].map((m) => m[1])
const attendus = ['slug', 'du', 'au', 'maintenant']
for (const p of new Set(parametres)) {
  if (!attendus.includes(p)) {
    signale(`paramètre inattendu : $${p} — à documenter ou à retirer`)
  }
}
console.log(`  paramètres utilisés : ${[...new Set(parametres)].map((p) => '$' + p).join(', ')}`)

// ── 4. Aucune requête ne doit viser les brouillons explicitement ─
// La séparation publié / brouillon est portée par la `perspective` du
// client, pas par les requêtes. Une requête qui mentionne drafts. serait
// une porte dérobée.
if (/drafts\s*\./.test(source)) {
  signale('une requête mentionne « drafts. » : la séparation doit rester portée par la perspective du client')
}

console.log('')
if (problemes) {
  console.error(`  ÉCHEC — ${problemes} problème(s)\n`)
  process.exit(1)
}
console.log('  OK — requêtes valides et paramétrées\n')
