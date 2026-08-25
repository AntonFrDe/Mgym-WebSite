// vider-cache-donnees.mjs — vide le cache des réponses Sanity avant chaque
// build. Lancé automatiquement par npm (script « prebuild »).
//
// POURQUOI CE SCRIPT EXISTE
//
// Next enregistre les réponses de `fetch` dans .next/cache/fetch-cache et
// réutilise ce dossier d'un build à l'autre. Pendant `next build`, une
// entrée déjà présente est servie sans être revalidée : ni son âge, ni un
// `revalidate` déclaré, ni un second build ne la font expirer.
//
// Conséquence, mesurée sur ce projet : le titre modifié dans Sanity puis
// reconstruit restait à sa valeur précédente. Comme les hébergeurs
// restaurent .next/cache pour accélérer les builds, la cliente aurait
// cliqué « Publier », le site se serait reconstruit, et rien n'aurait
// changé — la panne la plus décourageante possible.
//
// CE QU'IL NE FAIT PAS : effacer tout .next/cache. Le reste du dossier
// contient le cache de compilation (SWC, webpack), qui n'a rien à voir
// avec le contenu et fait gagner beaucoup de temps. Seul fetch-cache part.

import { rmSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const RACINE = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const CACHE = path.join(RACINE, '.next', 'cache', 'fetch-cache')

if (existsSync(CACHE)) {
  rmSync(CACHE, { recursive: true, force: true })
  console.log('  cache des réponses Sanity vidé — ce build relira le contenu publié')
}
