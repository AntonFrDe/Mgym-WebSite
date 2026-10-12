// champs.test.mjs — le back-office et le site parlent des mêmes champs.
//
// Les trois documents uniques (« Textes du site », « Infos pratiques »,
// « Référencement ») sont lus EN ENTIER par le site, sans liste de champs :
// le schéma est leur seule description. Deux oublis restent possibles, et
// ce test les attrape au moment du commit :
//
//   1. un composant lit `site.titreAccueil` alors que le champ s'appelle
//      `heroTitre` : le texte n'apparaîtrait jamais, sans erreur ;
//   2. un champ du schéma n'est lu nulle part : la cliente le remplirait
//      pour rien (c'est arrivé : « lieu » des créneaux, « horaires
//      d'accueil », cinq petites étiquettes — tous supprimés en 2026).
//
// Convention vérifiée : les composants lisent ces documents par les noms
// `site`, `infos` et `seo` (voir lib/contenu/index.js).

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { siteContent } from '../../sanity/schemaTypes/siteContent.js'
import { infosPratiques } from '../../sanity/schemaTypes/infosPratiques.js'
import { seoGlobal } from '../../sanity/schemaTypes/seoGlobal.js'

const RACINE = fileURLToPath(new URL('../../', import.meta.url))

/** Tout le code qui affiche quelque chose (les tests exclus). */
function lireCode(dossier) {
  return readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom)
    if (statSync(chemin).isDirectory()) return lireCode(chemin)
    return /\.(js|mjs|jsx)$/.test(nom) && !nom.includes('.test.') ? [readFileSync(chemin, 'utf8')] : []
  })
}
const CODE = ['app', 'components', 'lib'].flatMap((d) => lireCode(join(RACINE, d))).join('\n')

const DOCUMENTS = [
  { variable: 'site', schema: siteContent },
  { variable: 'infos', schema: infosPratiques },
  { variable: 'seo', schema: seoGlobal },
]

for (const { variable, schema } of DOCUMENTS) {
  const champs = new Set(schema.fields.map((f) => f.name))

  test(`${schema.name} : chaque « ${variable}.xxx » lu par le site existe dans le schéma`, () => {
    // site.x, site?.x et site['x'] (les trois façons de lire un champ).
    const motif = new RegExp(`\\b${variable}(?:\\??\\.([a-zA-Z0-9]+)|\\[['"]([a-zA-Z0-9]+)['"]\\])`, 'g')
    const lus = new Set([...CODE.matchAll(motif)].map((m) => m[1] ?? m[2]))
    const inconnus = [...lus].filter((c) => !champs.has(c))
    assert.deepEqual(inconnus, [],
      `Lus par le site mais absents de sanity/schemaTypes/${schema.name}.js : ${inconnus.join(', ')}`)
  })

  test(`${schema.name} : chaque champ du schéma est lu quelque part`, () => {
    // Lu = « site.champ », « site?.champ », « site['champ'] », ou le nom
    // exact entre guillemets (lecture indirecte : `site[onglet.champ]` avec
    // champ: 'plusOngletAteliers'). Pas un simple mot identique ailleurs
    // dans le code (« titre », « nom »…).
    const lu = (c) => new RegExp(`\\b${variable}(?:\\??\\.${c}\\b|\\[['"]${c}['"]\\])|['"]${c}['"]`).test(CODE)
    const inutilises = [...champs].filter((c) => !lu(c))
    assert.deepEqual(inutilises, [],
      `Champs que la cliente remplirait pour rien : ${inutilises.join(', ')}`)
  })
}
