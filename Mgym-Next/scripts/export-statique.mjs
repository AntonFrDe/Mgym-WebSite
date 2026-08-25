// export-statique.mjs — fabrique le dossier `out/` pour la copie hors-ligne.
//
// POURQUOI CE DÉTOUR
// Le site n'est plus en `output: 'export'` par défaut : la prévisualisation
// exige des routes serveur, et l'export les interdit. Mais la cliente doit
// toujours pouvoir recevoir une copie du site qui s'ouvre par double-clic.
//
// Ce script réconcilie les deux : il recopie le projet dans un dossier
// temporaire SANS `app/api/`, y lance un build en mode export, puis ramène
// le `out/` obtenu. Le projet réel n'est jamais modifié — pas de fichier
// renommé, pas de route déplacée, donc rien à réparer si le build échoue.
//
// Usage :  node scripts/export-statique.mjs

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, symlinkSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { localiserImages } from './localiser-images.mjs'

const RACINE = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const TEMPO = path.join(RACINE, '.export-tmp')

// Ce qu'il faut recopier pour qu'un build fonctionne.
const A_COPIER = [
  'app', 'components', 'lib', 'public',
  'next.config.js', 'package.json', 'jsconfig.json',
]

console.log('  Préparation d\'une copie de travail…')
rmSync(TEMPO, { recursive: true, force: true })
mkdirSync(TEMPO, { recursive: true })

for (const entree of A_COPIER) {
  const source = path.join(RACINE, entree)
  if (!existsSync(source)) continue
  cpSync(source, path.join(TEMPO, entree), { recursive: true })
}

// Ces routes sont retirées de la COPIE, jamais de l'original.
//
//   app/api    routes serveur : incompatibles avec l'export.
//   app/blog   Next refuse d'exporter une route dynamique dont
//              generateStaticParams ne rend aucun paramètre. Et la copie
//              hors-ligne est un document d'UNE page, destiné à être
//              relu : un blog vide n'y a pas sa place. build-standalone.js
//              n'assemble d'ailleurs que out/index.html.
for (const aRetirer of ['api', 'blog']) {
  const dossier = path.join(TEMPO, 'app', aRetirer)
  if (existsSync(dossier)) {
    rmSync(dossier, { recursive: true, force: true })
    console.log(`  app/${aRetirer} écarté de la copie hors-ligne.`)
  }
}

// node_modules par lien symbolique : recopier 900 Mo serait absurde.
symlinkSync(path.join(RACINE, 'node_modules'), path.join(TEMPO, 'node_modules'), 'dir')

// ── Le contenu du CMS doit suivre ────────────────────────────────
//
// Next lit .env.local dans le dossier où il tourne. Comme le build a lieu
// dans .export-tmp, il n'y trouvait rien : la copie hors-ligne se
// construisait SANS Sanity et livrait le contenu d'origine — pas celui que
// la cliente a modifié. Le défaut était silencieux : la page était juste
// périmée, jamais en erreur.
//
// On transmet donc les identifiants, mais UNIQUEMENT les trois variables
// publiques. Ni le token de lecture, ni le secret de prévisualisation :
// une copie destinée à circuler ne doit pas pouvoir lire un brouillon.
function variablesPubliques() {
  const gardees = [
    'NEXT_PUBLIC_SANITY_PROJECT_ID',
    'NEXT_PUBLIC_SANITY_DATASET',
    'NEXT_PUBLIC_SANITY_API_VERSION',
  ]
  const valeurs = {}
  try {
    for (const ligne of readFileSync(path.join(RACINE, '.env.local'), 'utf8').split('\n')) {
      const m = /^([A-Z_]+)=(.*)$/.exec(ligne.trim())
      if (m && gardees.includes(m[1])) valeurs[m[1]] = m[2].trim()
    }
  } catch { /* pas de .env.local : le contenu par défaut suffit */ }
  for (const nom of gardees) {
    if (process.env[nom]) valeurs[nom] = process.env[nom]
  }
  return valeurs
}

const publiques = variablesPubliques()
console.log(
  publiques.NEXT_PUBLIC_SANITY_PROJECT_ID
    ? `  Contenu lu depuis Sanity (${publiques.NEXT_PUBLIC_SANITY_PROJECT_ID}).`
    : '  Sanity non configuré : contenu par défaut.'
)

console.log('  Build en mode export…')
try {
  execFileSync(
    process.execPath,
    [path.join(RACINE, 'node_modules', 'next', 'dist', 'bin', 'next'), 'build'],
    {
      cwd: TEMPO,
      stdio: 'inherit',
      env: {
        ...process.env,
        ...publiques,
        MGYM_EXPORT: '1',
        // La variante d'affichage se transmet telle quelle.
        MGYM_VARIANT: process.env.MGYM_VARIANT || '',
      },
    }
  )
} catch {
  console.error('\n  Le build d\'export a échoué. Le projet est intact.\n')
  rmSync(TEMPO, { recursive: true, force: true })
  process.exit(1)
}

// Rapatriement du résultat.
const sortie = path.join(RACINE, 'out')
rmSync(sortie, { recursive: true, force: true })
cpSync(path.join(TEMPO, 'out'), sortie, { recursive: true })
rmSync(TEMPO, { recursive: true, force: true })

// Les photos du CMS sont des URL cdn.sanity.io. Une page ouverte par
// double-clic, souvent sans Internet, n'afficherait que des cadres vides.
// On les rapatrie et on réécrit les liens en « /Images/… », la seule forme
// que build-standalone.js sait traiter.
const rapatriees = await localiserImages(sortie, {
  projectId: publiques.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: publiques.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: publiques.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01',
})
if (rapatriees) console.log(`  ${rapatriees} photo(s) du CMS rapatriée(s) dans out/Images/.`)

console.log('\n  OK — out/ prêt pour build-standalone.js\n')
