// migrer.mjs — importe dans Sanity le contenu actuellement écrit en dur.
//
// La cliente ne doit pas découvrir un back-office vide : elle doit y
// retrouver son site, et pouvoir le modifier.
//
// IDEMPOTENT — chaque document reçoit un identifiant DÉDUIT de son
// contenu (« activite-yin-yoga », « creneau-lundi-1930 »). Relancer le
// script écrase les mêmes documents au lieu d'en créer de nouveaux.
// Testé : deux exécutions successives donnent le même nombre de documents.
//
// Usage :
//   node scripts/migrer.mjs            # simulation, n'écrit rien
//   node scripts/migrer.mjs --ecrire   # écrit réellement dans Sanity
//
// Exige SANITY_API_WRITE_TOKEN. Ce token est un token LOCAL : il ne doit
// jamais être configuré sur l'hébergeur, le site n'écrit jamais dans
// Sanity.

import { createClient } from '@sanity/client'
import { readFileSync, existsSync, mkdtempSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  activites, creneaux, nomsAffiches, siteContent,
  infosPratiques, seoGlobal, images,
} from '../lib/contenu/source-historique.mjs'

const RACINE = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const ECRIRE = process.argv.includes('--ecrire')

// ── Environnement ───────────────────────────────────────────────
function chargeEnv() {
  try {
    for (const ligne of readFileSync(path.join(RACINE, '.env.local'), 'utf8').split('\n')) {
      const m = /^([A-Z_]+)=(.*)$/.exec(ligne.trim())
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
    }
  } catch { /* pas de .env.local : les variables viennent de l'environnement */ }
}
chargeEnv()

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_WRITE_TOKEN

if (ECRIRE && (!projectId || !token)) {
  console.error(
    "\n  Écriture impossible : identifiants absents.\n" +
    "  Renseignez NEXT_PUBLIC_SANITY_PROJECT_ID et SANITY_API_WRITE_TOKEN\n" +
    "  dans .env.local. Relancez sans --ecrire pour une simulation.\n"
  )
  process.exit(2)
}

const client = ECRIRE
  ? createClient({ projectId, dataset, token, apiVersion: '2024-10-01', useCdn: false })
  : null

// ── Outils ──────────────────────────────────────────────────────

/** Transforme un titre en identifiant stable et lisible. */
const identifiant = (prefixe, texte) =>
  `${prefixe}-${String(texte)
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // accents combinants
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)}`

/** Un identifiant de bloc, requis par Portable Text. */
let compteurCle = 0
const cle = () => `k${(compteurCle++).toString(36)}`

/**
 * Convertit une chaîne, ou une liste de fragments { texte, gras }, en
 * Portable Text. Les fragments permettent de conserver les mots en gras
 * du site actuel.
 */
function enPortableText(entree) {
  const fragments = typeof entree === 'string' ? [{ texte: entree }] : entree
  if (!Array.isArray(fragments) || !fragments.length) return undefined

  return [{
    _type: 'block',
    _key: cle(),
    style: 'normal',
    markDefs: [],
    children: fragments.map((f) => ({
      _type: 'span',
      _key: cle(),
      text: f.texte,
      marks: f.gras ? ['strong'] : [],
    })),
  }]
}

/** Ajoute la clé _key exigée par Sanity sur chaque élément d'un tableau. */
const avecCles = (liste) =>
  (liste ?? []).map((o) => ({ _key: cle(), ...o }))

// ── Images ──────────────────────────────────────────────────────
// Chaque fichier n'est téléversé QU'UNE FOIS : on interroge d'abord la
// médiathèque par nom de fichier. Sans ce contrôle, chaque exécution
// créerait un doublon de chaque photo.
const cacheImages = new Map()

// ── AVIF 10 bits : le décodeur de Sanity ne sait pas les lire ──────
//
// Cinq photos du projet (fond1, Logo, CoachMassage, MarcheNordique,
// coachHelpingChienTTenHauyt) sont encodées en AVIF 10 bits. Les huit
// images d'activités, elles, sont en 8 bits. Le téléversement des
// premières échoue avec :
//
//   422 Unprocessable Entity — "Invalid image, could not process"
//   heif: Bitstream not supported by this decoder (2.0)
//
// Ce n'est pas un défaut des fichiers : les navigateurs les affichent
// parfaitement, et le site les sert tel quel. C'est le décodeur HEIF de
// Sanity qui s'arrête au 8 bits.
//
// La parade : convertir en WebP SANS PERTE juste avant l'envoi. Sans
// perte, donc aucune dégradation ajoutée à celle de l'AVIF d'origine —
// le fichier grossit (533 Ko -> 4 Mo pour fond1), mais c'est un original
// d'archive : personne ne le télécharge. Sanity en dérive les formats
// d'affichage, et `urlImage()` demande déjà `auto('format')`.
//
// Les fichiers de `public/` ne sont JAMAIS modifiés : le site hébergé et
// la copie hors-ligne continuent de servir les AVIF d'origine.

let dossierConversion = null

/** Profondeur de bits d'un fichier image, via ffprobe. */
function estAvif10bits(absolu) {
  if (!absolu.toLowerCase().endsWith('.avif')) return false
  try {
    const pixFmt = execFileSync('ffprobe', [
      '-v', 'error', '-select_streams', 'v:0',
      '-show_entries', 'stream=pix_fmt', '-of', 'csv=p=0', absolu,
    ], { encoding: 'utf8' }).trim()
    return pixFmt.includes('10le') || pixFmt.includes('12le')
  } catch {
    // ffprobe absent : on laisse passer. Si l'image est bien en 10 bits,
    // Sanity la refusera avec un message explicite — mieux vaut cet
    // échec-là qu'un script qui refuse de démarrer sur une machine où
    // toutes les images sont en 8 bits.
    return false
  }
}

/**
 * Nom sous lequel l'image arrivera dans Sanity. Calculé SANS convertir :
 * il sert à chercher l'image dans la médiathèque avant de décider s'il
 * faut la produire. Sans cette séparation, chaque relance ré-encoderait
 * 5 Mo de photos pour finir par ne rien téléverser.
 */
function nomDansSanity(absolu, nom) {
  return estAvif10bits(absolu) ? nom.replace(/\.avif$/i, '.webp') : nom
}

/** Les octets à envoyer, convertis seulement si c'est nécessaire. */
function octetsTeleversables(absolu, nom) {
  if (!estAvif10bits(absolu)) return readFileSync(absolu)

  dossierConversion ??= mkdtempSync(path.join(tmpdir(), 'mgym-images-'))
  const converti = path.join(dossierConversion, nom.replace(/\.avif$/i, '.webp'))

  try {
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', absolu, '-lossless', '1', converti])
  } catch (e) {
    throw new Error(
      `${nom} est un AVIF 10 bits, que Sanity ne sait pas décoder, et la ` +
      `conversion a échoué.\n` +
      `  ffmpeg est-il installé ?  sudo apt install ffmpeg\n` +
      `  cause : ${e.message.split('\n')[0]}`
    )
  }

  const octets = readFileSync(converti)
  console.log(
    `    ${nom} : AVIF 10 bits converti en WebP sans perte ` +
    `(${Math.round(octets.length / 1024)} Ko)`
  )
  return octets
}

async function televerser(chemin, alt) {
  if (cacheImages.has(chemin)) return cacheImages.get(chemin)

  const absolu = path.join(RACINE, chemin)
  if (!existsSync(absolu)) {
    console.warn(`  ⚠ image introuvable, ignorée : ${chemin}`)
    return undefined
  }

  const nom = path.basename(chemin)

  if (!ECRIRE) {
    cacheImages.set(chemin, { _simulation: nom })
    return { _simulation: nom }
  }

  const nomFinal = nomDansSanity(absolu, nom)

  const existant = await client.fetch(
    '*[_type == "sanity.imageAsset" && originalFilename == $nom][0]._id',
    { nom: nomFinal }
  )

  const assetId = existant ?? (await client.assets.upload(
    'image', octetsTeleversables(absolu, nom), { filename: nomFinal }
  ))._id

  const reference = {
    _type: 'imageEditoriale',
    asset: { _type: 'reference', _ref: assetId },
    alt,
  }
  cacheImages.set(chemin, reference)
  return reference
}

// ── Construction des documents ──────────────────────────────────
const documents = []

// Activités
for (const a of activites) {
  documents.push({
    _id: identifiant('activite', a.name),
    _type: 'activite',
    titre: a.name,
    slug: { _type: 'slug', current: identifiant('', a.name).replace(/^-/, '') },
    descriptionCourte: a.accroche,
    descriptionRiche: enPortableText(a.desc),
    motsCles: a.tags,
    ordreAffichage: activites.indexOf(a) + 1,
    actif: true,
    lienInterne: a.href ?? undefined,
    libelleLien: a.lienTexte ?? undefined,
    _image: { fichier: `public${a.image}`, alt: a.name },
  })
}

// Créneaux — reliés à l'activité par son identifiant déduit du nom.
for (const c of creneaux) {
  const idActivite = identifiant('activite', c.activite)
  const nomAffiche = nomsAffiches[`${c.jour}|${c.heureDebut}`]
  documents.push({
    _id: identifiant('creneau', `${c.jour}-${c.heureDebut.replace(':', '')}-${c.activite}`),
    _type: 'creneau',
    activite: { _type: 'reference', _ref: idActivite },
    jour: c.jour,
    heureDebut: c.heureDebut,
    duree: c.duree,
    niveau: 'tous',
    actif: true,
    // Le nom affiché aujourd'hui, quand il diffère de celui de l'activité,
    // est conservé dans le lieu : le modèle n'a pas de champ « libellé »,
    // et en inventer un pour dix cas serait disproportionné.
    ...(nomAffiche ? { _nomAffiche: nomAffiche } : {}),
  })
}

// Documents uniques
documents.push({
  _id: 'siteContent',
  _type: 'siteContent',
  ...Object.fromEntries(
    Object.entries(siteContent).map(([k, v]) => [
      k,
      // Les champs de texte riche sont convertis, les autres passent tels quels.
      Array.isArray(v) && v.length && typeof v[0] === 'object' && 'texte' in v[0]
        ? enPortableText(v)
        : Array.isArray(v) && v.length && typeof v[0] === 'object'
          ? avecCles(v)
          : v,
    ])
  ),
})

documents.push({
  _id: 'infosPratiques',
  _type: 'infosPratiques',
  ...infosPratiques,
  reseauxSociaux: avecCles(infosPratiques.reseauxSociaux),
})

documents.push({ _id: 'seoGlobal', _type: 'seoGlobal', ...seoGlobal })

// ── Exécution ───────────────────────────────────────────────────
console.log(`\n  ${ECRIRE ? 'MIGRATION' : 'SIMULATION (aucune écriture)'}`)
console.log(`  ${documents.length} documents à créer ou remplacer\n`)

const parType = {}
for (const d of documents) parType[d._type] = (parType[d._type] ?? 0) + 1
for (const [type, n] of Object.entries(parType)) console.log(`    ${type.padEnd(18)} ${n}`)

// Rattachement des images.
for (const d of documents) {
  if (d._image) {
    d.image = await televerser(d._image.fichier, d._image.alt)
    delete d._image
  }
  delete d._nomAffiche
}
for (const [champ, info] of Object.entries(images)) {
  const doc = documents.find((d) => d._id === 'siteContent')
  doc[champ] = await televerser(info.fichier, info.alt)
}

if (!ECRIRE) {
  console.log('\n  Aucune écriture. Relancez avec --ecrire pour appliquer.\n')
  const exemple = documents.find((d) => d._type === 'activite')
  console.log('  Exemple de document produit :')
  console.log('  ' + JSON.stringify(exemple, null, 2).split('\n').slice(0, 16).join('\n  '))
  console.log('  …\n')
  process.exit(0)
}

// createOrReplace : idempotent par construction. Une seconde exécution
// remplace les mêmes identifiants au lieu d'ajouter des doublons.
let transaction = client.transaction()
for (const d of documents) transaction = transaction.createOrReplace(d)

await transaction.commit()
console.log(`\n  OK — ${documents.length} documents écrits dans « ${dataset} ».\n`)
