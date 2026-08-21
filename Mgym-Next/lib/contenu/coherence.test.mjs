// coherence.test.mjs — vérifie que les trois descriptions du contenu
// racontent la même histoire.
//
// Il y a trois endroits qui décrivent les mêmes champs :
//
//   sanity/schemaTypes/siteContent.js   ce que la cliente peut remplir
//   lib/sanity/queries/groq.js          ce que le site va chercher
//   lib/contenu/source-historique.mjs   ce qu'il affiche à défaut
//
// Rien ne les relie automatiquement. Ajouter un champ au schéma sans
// l'ajouter à la requête donne un champ que la cliente remplit pour rien,
// et personne ne s'en aperçoit — c'est arrivé pendant le développement
// avec aProposTitreFin et outdoorTitreSuite. Ce test rend l'oubli
// impossible.

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { siteContent } from '../../sanity/schemaTypes/siteContent.js'
import { infosPratiques } from '../../sanity/schemaTypes/infosPratiques.js'
import { seoGlobal } from '../../sanity/schemaTypes/seoGlobal.js'
import { activite } from '../../sanity/schemaTypes/activite.js'
import * as requetes from '../sanity/queries/groq.js'
// On compare au contenu NORMALISÉ — celui que les composants reçoivent
// vraiment — et non à sa source brute : les images y sont déclarées
// séparément, et c'est la forme finale qui compte.
import { contenuDefaut } from './defaut.js'
import { seoGlobal as seoDefaut } from './source-historique.mjs'

const siteDefaut = contenuDefaut.site
const infosDefaut = contenuDefaut.infos

/** Les noms des champs déclarés dans un schéma. */
const champsDe = (schema) => schema.fields.map((f) => f.name)

/** Un champ est-il demandé par une requête GROQ ? */
const demandePar = (requete, champ) =>
  new RegExp(`(^|[\\s,{"])${champ}\\b`).test(requete)

describe('siteContent — schéma, requête et contenu par défaut', () => {
  const champs = champsDe(siteContent)

  test('chaque champ du schéma est demandé par la requête', () => {
    const oublies = champs.filter((c) => !demandePar(requetes.SITE_CONTENT, c))
    assert.deepEqual(oublies, [],
      `champs remplis par la cliente mais jamais récupérés : ${oublies.join(', ')}`)
  })

  test('chaque champ du schéma a une valeur par défaut', () => {
    // Sans valeur par défaut, un champ vide dans Sanity laisse un trou
    // dans la page au lieu de retomber sur le texte d'origine.
    const sansDefaut = champs.filter((c) => !(c in siteDefaut))
    assert.deepEqual(sansDefaut, [],
      `champs sans repli : ${sansDefaut.join(', ')}`)
  })

  test('le contenu par défaut ne contient pas de champ inconnu du schéma', () => {
    // L'inverse : un champ affiché par le site mais que la cliente ne
    // peut pas modifier.
    const inconnus = Object.keys(siteDefaut).filter((c) => !champs.includes(c))
    assert.deepEqual(inconnus, [],
      `champs non éditables : ${inconnus.join(', ')}`)
  })
})

describe('infosPratiques — schéma et requête', () => {
  test('chaque champ est demandé par la requête', () => {
    const oublies = champsDe(infosPratiques).filter(
      (c) => !demandePar(requetes.INFOS_PRATIQUES, c)
    )
    assert.deepEqual(oublies, [])
  })

  test('les champs obligatoires ont une valeur par défaut', () => {
    for (const champ of ['adresse', 'telephone', 'email']) {
      assert.ok(infosDefaut[champ], `${champ} absent du contenu par défaut`)
    }
  })
})

describe('seoGlobal — schéma et requête', () => {
  test('chaque champ est demandé par la requête', () => {
    const oublies = champsDe(seoGlobal).filter(
      (c) => !demandePar(requetes.SEO_GLOBAL, c)
    )
    assert.deepEqual(oublies, [])
  })

  test('titre et description ont une valeur par défaut', () => {
    assert.ok(seoDefaut.titre)
    assert.ok(seoDefaut.description)
  })

  test('les limites de longueur du référencement sont respectées', () => {
    // 60 et 155 caractères : au-delà, Google coupe.
    assert.ok(seoDefaut.titre.length <= 60, `titre : ${seoDefaut.titre.length} caractères`)
    assert.ok(seoDefaut.description.length <= 155, `description : ${seoDefaut.description.length} caractères`)
  })
})

describe('activite — schéma et requête', () => {
  test('chaque champ est demandé par la requête', () => {
    // `actif` sert de filtre dans la requête, il n'est pas projeté :
    // le site ne reçoit que les activités actives.
    const oublies = champsDe(activite)
      .filter((c) => c !== 'actif')
      .filter((c) => !demandePar(requetes.ACTIVITES, c))
    assert.deepEqual(oublies, [])
  })
})
