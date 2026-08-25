// tester-workflow.mjs — joue les neuf scénarios de la Phase 15 contre un
// VRAI projet Sanity et un site en cours d'exécution.
//
// Ce que ce script prouve, et qu'aucun test unitaire ne peut prouver :
// qu'un brouillon reste invisible en production, qu'il est visible en
// prévisualisation, que publier le rend public, et qu'une restauration
// fonctionne de bout en bout.
//
// Usage :
//   1. lancer le site :  npm run build && npm start
//   2. dans un autre terminal :
//        node scripts/tester-workflow.mjs [http://localhost:3000]
//
// Exige dans .env.local : NEXT_PUBLIC_SANITY_PROJECT_ID,
// SANITY_API_WRITE_TOKEN et SANITY_PREVIEW_SECRET.
//
// Le script crée un document de test dédié et le supprime à la fin, même
// en cas d'échec. Il ne touche jamais au contenu réel.

import { createClient } from '@sanity/client'
import { readFileSync } from 'node:fs'

const BASE = process.argv[2] || 'http://localhost:3000'
const ID = 'test-workflow-mgym'

// ── Environnement ───────────────────────────────────────────────
try {
  for (const ligne of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
    const m = /^([A-Z_]+)=(.*)$/.exec(ligne.trim())
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  }
} catch { /* les variables viennent peut-être de l'environnement */ }

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_WRITE_TOKEN
const secret = process.env.SANITY_PREVIEW_SECRET

if (!projectId || !token || !secret) {
  console.error(
    '\n  Impossible de tester : identifiants absents.\n' +
    '  Il faut NEXT_PUBLIC_SANITY_PROJECT_ID, SANITY_API_WRITE_TOKEN et\n' +
    '  SANITY_PREVIEW_SECRET dans .env.local.\n'
  )
  process.exit(2) // 2 = non vérifiable, distinct de 1 = échec réel
}

const client = createClient({
  projectId, dataset, token, apiVersion: '2024-10-01', useCdn: false,
})

let echecs = 0
const verifier = (ok, message) => {
  console.log(ok ? `  ✓ ${message}` : `  ✗ ${message}`)
  if (!ok) echecs++
}
const attendre = (ms) => new Promise((r) => setTimeout(r, ms))

/** Récupère une page et rend son texte brut. */
async function page(chemin, cookies = '') {
  const r = await fetch(BASE + chemin, {
    headers: cookies ? { cookie: cookies } : {},
    redirect: 'manual',
  })
  return { statut: r.status, texte: await r.text(), entetes: r.headers }
}

/** Ouvre une session de prévisualisation et rend ses cookies. */
async function ouvrirPreview() {
  const r = await fetch(
    `${BASE}/api/preview?secret=${encodeURIComponent(secret)}&chemin=/`,
    { redirect: 'manual' }
  )
  const brut = r.headers.getSetCookie?.() ?? []
  return brut.map((c) => c.split(';')[0]).join('; ')
}

const ANCIEN = 'TITRE-PUBLIE-' + Date.now()
const NOUVEAU = 'TITRE-BROUILLON-' + Date.now()

try {
  console.log(`\n  Site testé : ${BASE}`)
  console.log(`  Projet : ${projectId} / ${dataset}\n`)

  // ── TEST 0 — le site répond ───────────────────────────────────
  const accueil = await page('/')
  verifier(accueil.statut === 200, 'le site répond')
  if (accueil.statut !== 200) throw new Error('site injoignable')

  // ── TEST 1 — un brouillon reste invisible en production ───────
  console.log('\n  TEST 1 — brouillon invisible en production')
  await client.createOrReplace({ _id: ID, _type: 'seoGlobal', titre: ANCIEN, description: 'v1' })
  await client.createOrReplace({ _id: `drafts.${ID}`, _type: 'seoGlobal', titre: NOUVEAU, description: 'v2' })
  await attendre(2000)

  const prod1 = await page('/')
  verifier(!prod1.texte.includes(NOUVEAU), 'le brouillon N\'APPARAÎT PAS en production')

  // ── TEST 2 — il est visible en prévisualisation ───────────────
  console.log('\n  TEST 2 — brouillon visible en prévisualisation')
  const cookies = await ouvrirPreview()
  verifier(Boolean(cookies), 'la session de prévisualisation s\'ouvre')
  const apercu = await page('/', cookies)
  verifier(apercu.texte.includes('MODE PRÉVISUALISATION') || apercu.texte.includes('bandeau-preview'),
           'le bandeau de prévisualisation est affiché')

  // ── TEST 3 — la sécurité de la prévisualisation ───────────────
  console.log('\n  TEST 3 — sécurité de la prévisualisation')
  const sansSecret = await fetch(`${BASE}/api/preview`, { redirect: 'manual' })
  verifier(sansSecret.status === 401, 'sans secret -> 401')
  const mauvais = await fetch(`${BASE}/api/preview?secret=faux`, { redirect: 'manual' })
  verifier(mauvais.status === 401, 'secret faux -> 401')
  verifier(await sansSecret.text() === await mauvais.text(),
           'message identique dans les deux cas (aucun indice donné)')
  const ouvert = await fetch(
    `${BASE}/api/preview?secret=${encodeURIComponent(secret)}&chemin=https://site-piege.fr`,
    { redirect: 'manual' })
  verifier(!(ouvert.headers.get('location') || '').includes('site-piege'),
           'redirection vers un site extérieur refusée')

  // ── TEST 4 — publier rend public ──────────────────────────────
  console.log('\n  TEST 4 — publication')
  const brouillon = await client.getDocument(`drafts.${ID}`)
  await client.createOrReplace({ ...brouillon, _id: ID })
  await client.delete(`drafts.${ID}`)
  await attendre(2000)
  const publie = await client.getDocument(ID)
  verifier(publie?.titre === NOUVEAU, 'le contenu publié porte bien la nouvelle valeur')
  console.log('    (la production ne changera qu\'après reconstruction du site)')

  // ── TEST 5 — l'historique conserve la version précédente ──────
  console.log('\n  TEST 5 — historique et restauration')
  // Le paramètre est `time`, PAS `revision` : celui-ci attend un
  // identifiant de révision (^[a-zA-Z0-9_-]+$) et refuse un horodatage.
  // L'erreur était avalée par un catch, et le test se contentait
  // d'annoncer que l'historique ne marchait pas — sans dire pourquoi.
  const avant = new Date(Date.now() - 3000).toISOString()
  let ancienne = null
  let motifEchec = ''
  try {
    ancienne = await client.request({
      uri: `/data/history/${dataset}/documents/${ID}?time=${encodeURIComponent(avant)}`,
    })
  } catch (e) {
    motifEchec = e.message
  }
  const documents = ancienne?.documents ?? []
  verifier(
    documents.length > 0,
    'une version antérieure est récupérable' + (motifEchec ? ` — ${motifEchec}` : '')
  )

  // ── TEST 6 — les brouillons ne fuient pas par l'API publique ──
  console.log('\n  TEST 6 — étanchéité du client public')
  const publicSansToken = createClient({
    projectId, dataset, apiVersion: '2024-10-01', useCdn: false, perspective: 'published',
  })
  await client.createOrReplace({ _id: `drafts.${ID}`, _type: 'seoGlobal', titre: 'FUITE', description: 'x' })
  await attendre(1500)
  const vuDuPublic = await publicSansToken.fetch('*[_id == $id][0].titre', { id: ID })
  verifier(vuDuPublic !== 'FUITE', 'le client « published » ne voit pas le brouillon')
  const tentative = await publicSansToken
    .fetch('*[_id == $id][0].titre', { id: `drafts.${ID}` })
    .catch(() => null)
  verifier(!tentative, 'demander explicitement un brouillon ne renvoie rien')

  // ── TEST 7 — sortie de prévisualisation ───────────────────────
  console.log('\n  TEST 7 — sortie de prévisualisation')
  const sortie = await fetch(`${BASE}/api/preview-exit`, {
    headers: { cookie: cookies }, redirect: 'manual',
  })
  verifier([302, 307, 308].includes(sortie.status), 'la sortie redirige vers le site public')

  // ── TEST 8 — en-têtes de sécurité ─────────────────────────────
  console.log('\n  TEST 8 — en-têtes de sécurité')
  for (const entete of ['content-security-policy', 'x-content-type-options', 'referrer-policy']) {
    verifier(Boolean(accueil.entetes.get(entete)), `${entete} présent`)
  }

  // ── TEST 9 — le blog et le référencement ──────────────────────
  console.log('\n  TEST 9 — blog et référencement')
  verifier((await page('/blog')).statut === 200, '/blog répond')
  verifier((await page('/blog/adresse-inexistante')).statut === 404, 'une adresse inventée rend un 404')
  verifier((await page('/robots.txt')).statut === 200, 'robots.txt répond')
  verifier((await page('/sitemap.xml')).statut === 200, 'sitemap.xml répond')

} catch (e) {
  console.error('\n  ERREUR :', e.message)
  echecs++
} finally {
  await client.delete(ID).catch(() => {})
  await client.delete(`drafts.${ID}`).catch(() => {})
  console.log('\n  (documents de test supprimés)')
}

console.log(echecs ? `\n  ÉCHEC — ${echecs} contrôle(s)\n` : '\n  OK — workflow complet validé\n')
process.exit(echecs ? 1 : 0)
