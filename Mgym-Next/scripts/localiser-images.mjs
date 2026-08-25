// localiser-images.mjs — rapatrie dans out/Images/ les photos servies par
// le CDN de Sanity, et réécrit les liens qui les désignent.
//
// POURQUOI
// La copie hors-ligne s'ouvre par double-clic, souvent sans Internet.
// Depuis que le contenu vient du CMS, les photos sont des URL
// « https://cdn.sanity.io/… » : telles quelles, la page livrée
// afficherait des cadres vides chez la cliente.
//
// build-standalone.js sait déjà traiter « /Images/xxx » — il les met en
// base64 ou les copie à côté du HTML. On lui rend donc un out/ qui ne
// contient QUE des chemins locaux : rien à changer en aval.
//
// Les noms de fichiers sont ceux de la médiathèque Sanity
// (« fond1.webp », « SentierYoga.avif »), pas des identifiants : le
// LISEZ-MOI promet à la cliente qu'elle peut remplacer une photo en
// déposant un fichier de même nom.

import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'

const EXTENSIONS = {
  'image/avif': '.avif', 'image/webp': '.webp', 'image/jpeg': '.jpg',
  'image/png': '.png', 'image/gif': '.gif',
}

/** Tous les fichiers d'un dossier dont l'extension figure dans la liste. */
function fichiers(racine, extensions) {
  const trouves = []
  for (const entree of readdirSync(racine, { withFileTypes: true })) {
    const chemin = path.join(racine, entree.name)
    if (entree.isDirectory()) trouves.push(...fichiers(chemin, extensions))
    else if (extensions.includes(path.extname(entree.name))) trouves.push(chemin)
  }
  return trouves
}

/**
 * Nom d'origine de chaque image, demandé à Sanity en une seule requête.
 * En cas d'échec on renvoie une table vide : les identifiants serviront
 * de noms, moins lisibles mais fonctionnels.
 */
async function nomsDOrigine(projectId, dataset, apiVersion) {
  const url = new URL(`https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}`)
  url.searchParams.set('query', '*[_type == "sanity.imageAsset"]{_id, originalFilename}')
  try {
    const reponse = await fetch(url, { signal: AbortSignal.timeout(10_000) })
    if (!reponse.ok) return {}
    const { result = [] } = await reponse.json()
    return Object.fromEntries(result.map((a) => [a._id, a.originalFilename]))
  } catch {
    return {}
  }
}

/**
 * @param {string} sortie   le dossier out/
 * @param {{projectId:string, dataset:string, apiVersion:string}} env
 * @returns {Promise<number>} nombre de photos rapatriées
 */
export async function localiserImages(sortie, env) {
  const cibles = fichiers(sortie, ['.html', '.css', '.txt', '.xml'])
  const motif = /https:\/\/cdn\.sanity\.io\/images\/[^"'\s)]+/g

  // Une même URL s'écrit de trois façons selon l'endroit où Next la pose :
  //   attribut HTML         ?w=2000&amp;q=80
  //   charge JSON de Next   ?w=2000\u0026q=80   suivie de \" fermante
  //   feuille de style      ?w=2000&q=80
  // On enlève l'antislash de fin — il appartient à la chaîne JSON, pas à
  // l'URL — puis on décode les deux échappements pour le téléchargement.
  const sansEchappementFinal = (u) => u.replace(/\\+$/, '')
  const decodee = (u) => u.replaceAll('\\u0026', '&').replaceAll('&amp;', '&')

  // Recensement d'abord : une même photo est souvent citée plusieurs fois.
  const urls = new Set()
  for (const fichier of cibles) {
    for (const trouve of readFileSync(fichier, 'utf8').matchAll(motif)) {
      urls.add(sansEchappementFinal(trouve[0]))
    }
  }
  if (urls.size === 0) return 0

  const noms = await nomsDOrigine(env.projectId, env.dataset, env.apiVersion)
  const dossierImages = path.join(sortie, 'Images')
  mkdirSync(dossierImages, { recursive: true })

  // Clé : l'URL telle qu'elle figure dans le fichier. Valeur : le chemin
  // local à écrire à sa place.
  const correspondances = new Map()

  // La même photo apparaît sous plusieurs écritures (attribut HTML, charge
  // JSON, feuille de style). Une seule doit être téléchargée : sans cette
  // table, la photo de fond de 4 Mo serait rapatriée trois fois.
  const dejaVues = new Map()

  for (const url of urls) {
    const propre = decodee(url)

    if (dejaVues.has(propre)) {
      correspondances.set(url, dejaVues.get(propre))
      continue
    }

    // `auto=format` choisit le format d'après l'en-tête Accept. Sans lui,
    // Sanity renvoie du JPEG : universel, mais deux fois plus lourd que le
    // WebP, que tous les navigateurs lisent depuis 2020.
    const reponse = await fetch(propre, {
      headers: { Accept: 'image/webp,image/*' },
      signal: AbortSignal.timeout(30_000),
    })
    if (!reponse.ok) {
      console.warn(`  !! image non rapatriée (${reponse.status}) : ${propre.slice(0, 80)}`)
      continue
    }

    const octets = Buffer.from(await reponse.arrayBuffer())
    const extension = EXTENSIONS[reponse.headers.get('content-type')?.split(';')[0]] ?? '.jpg'

    // L'URL porte « <assetId>-1200x800.webp » ; l'identifiant du document
    // Sanity correspondant s'écrit « image-<assetId>-1200x800-webp ».
    // C'est un tiret, pas un point : le confondre fait perdre le nom
    // d'origine et livre à la cliente un dossier d'identifiants illisibles.
    const fichierUrl = path.basename(new URL(propre).pathname)
    const identifiant = 'image-' + fichierUrl.replace(/\.([a-z0-9]+)$/i, '-$1')
    const largeur = new URL(propre).searchParams.get('w')
    const origine = noms[identifiant] ?? fichierUrl

    // Le nom d'origine, suffixé par la largeur quand la même photo est
    // servie en plusieurs tailles — sinon la seconde écraserait la première.
    const base = path.basename(origine, path.extname(origine))
    const nom = (largeur ? `${base}-${largeur}` : base) + extension

    writeFileSync(path.join(dossierImages, nom), octets)
    dejaVues.set(propre, `/Images/${nom}`)
    correspondances.set(url, `/Images/${nom}`)
  }

  for (const fichier of cibles) {
    let contenu = readFileSync(fichier, 'utf8')
    let modifie = false
    for (const [url, local] of correspondances) {
      if (contenu.includes(url)) { contenu = contenu.replaceAll(url, local); modifie = true }
    }
    if (modifie) writeFileSync(fichier, contenu)
  }

  supprimerOrphelines(sortie, cibles)
  return dejaVues.size
}

/**
 * Retire de out/Images/ les photos que plus aucune page ne cite.
 *
 * Ce ménage est la conséquence directe du rapatriement : les fichiers de
 * public/Images/ que Next a recopiés dans out/ ne sont plus référencés,
 * puisque les pages pointent désormais vers les rendus du CMS. Sans cette
 * étape, `npm run livraison` les enverrait quand même à la cliente —
 * build-standalone.js copie TOUT out/Images/ — et le LISEZ-MOI lui
 * promet qu'il suffit de remplacer un fichier pour changer une photo.
 * Treize fichiers sans effet rendraient cette promesse fausse.
 */
function supprimerOrphelines(sortie, cibles) {
  const dossierImages = path.join(sortie, 'Images')
  const citees = new Set()
  for (const fichier of cibles) {
    for (const t of readFileSync(fichier, 'utf8').matchAll(/\/Images\/([^"'\s)\\]+)/g)) {
      citees.add(t[1])
    }
  }
  // Garde-fou : si rien n'est cité, c'est que la détection a échoué.
  // Mieux vaut livrer des fichiers en trop que vider le dossier.
  if (citees.size === 0) return

  let retirees = 0
  for (const nom of readdirSync(dossierImages)) {
    if (!citees.has(nom)) { rmSync(path.join(dossierImages, nom)); retirees++ }
  }
  if (retirees) console.log(`  ${retirees} photo(s) devenue(s) inutilisée(s) retirée(s) de out/Images/.`)
}
