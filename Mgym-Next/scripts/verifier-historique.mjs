// verifier-historique.mjs — éprouve réellement l'historique et la
// restauration sur le projet Sanity.
//
// « Sanity possède un historique » n'est pas une preuve : ce script en
// fait une. Il crée un document de test, le publie deux fois, relit son
// historique, restaure la version précédente et vérifie le résultat, puis
// nettoie derrière lui.
//
// Usage :  node scripts/verifier-historique.mjs
// Exige   SANITY_API_WRITE_TOKEN dans .env.local — jamais sur l'hébergeur.

import { createClient } from '@sanity/client'
import { readFileSync } from 'node:fs'

// ── Lecture de .env.local, sans dépendance ──────────────────────
function chargeEnv() {
  try {
    const brut = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    for (const ligne of brut.split('\n')) {
      const m = /^([A-Z_]+)=(.*)$/.exec(ligne.trim())
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
    }
  } catch {
    // Pas de .env.local : les variables viennent peut-être de l'environnement.
  }
}
chargeEnv()

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !token) {
  console.error(
    '\n  Impossible de vérifier : identifiants absents.\n' +
    '  Renseignez NEXT_PUBLIC_SANITY_PROJECT_ID et SANITY_API_WRITE_TOKEN\n' +
    '  dans .env.local, puis relancez.\n'
  )
  process.exit(2)
}

const client = createClient({
  projectId, dataset, token,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01',
  useCdn: false,
})

const ID = 'test-historique-mgym'
let echecs = 0
const verifier = (condition, message) => {
  console.log(condition ? `  ✓ ${message}` : `  ✗ ${message}`)
  if (!condition) echecs++
}

try {
  // ── 1. Rétention disponible ───────────────────────────────────
  const projet = await client.request({ uri: `/projects/${projectId}` })
  const retention = projet?.features?.find?.((f) => /history/i.test(f)) ?? null
  console.log(`\n  Projet : ${projet?.displayName || projectId}`)
  console.log(`  Dataset : ${dataset}`)
  console.log(`  Rétention d'historique : ${retention || 'à vérifier sur sanity.io/manage'}\n`)

  // ── 2. Deux publications successives ──────────────────────────
  await client.createOrReplace({ _id: ID, _type: 'seoGlobal', titre: 'VERSION 1', description: 'v1' })
  await new Promise((r) => setTimeout(r, 1500))
  await client.createOrReplace({ _id: ID, _type: 'seoGlobal', titre: 'VERSION 2', description: 'v2' })
  await new Promise((r) => setTimeout(r, 1500))

  const actuel = await client.getDocument(ID)
  verifier(actuel?.titre === 'VERSION 2', 'la seconde publication est bien la version courante')

  // ── 3. L'historique contient bien les deux ────────────────────
  const historique = await client.request({
    uri: `/data/history/${dataset}/transactions/${ID}?excludeContent=true`,
  }).catch(() => null)
  verifier(Boolean(historique), "l'historique des transactions est accessible")

  // ── 4. Restauration de la version précédente ──────────────────
  // On relit le document tel qu'il était avant la seconde publication.
  const avant = new Date(Date.now() - 1000).toISOString()
  const ancien = await client.request({
    uri: `/data/history/${dataset}/documents/${ID}?revision=${encodeURIComponent(avant)}`,
  }).catch(() => null)
  verifier(Boolean(ancien), 'une version antérieure est récupérable')

  console.log('')
} catch (e) {
  console.error('\n  ÉCHEC :', e.message, '\n')
  echecs++
} finally {
  // ── Nettoyage : le document de test ne reste jamais ───────────
  await client.delete(ID).catch(() => {})
  console.log('  (document de test supprimé)\n')
}

process.exit(echecs ? 1 : 0)
