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

import { cpSync, existsSync, mkdirSync, rmSync, symlinkSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

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

console.log('\n  OK — out/ prêt pour build-standalone.js\n')
