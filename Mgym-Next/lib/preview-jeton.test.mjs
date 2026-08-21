// preview-jeton.test.mjs — les garde-fous de la prévisualisation.
//
// Chaque cas exigé par le plan (Phase 7.6) a son test.

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  egaliteConstante,
  creerJeton,
  jetonValide,
  cheminInterne,
  DUREE_PREVIEW_MS,
} from './preview-jeton.js'

const SECRET = 'un-secret-de-test-suffisamment-long-0123456789'

describe('Comparaison du secret', () => {
  test('deux chaînes identiques sont égales', () => {
    assert.equal(egaliteConstante('abc', 'abc'), true)
  })

  test('un secret faux est refusé', () => {
    assert.equal(egaliteConstante('abc', 'abd'), false)
  })

  test('un secret absent est refusé', () => {
    assert.equal(egaliteConstante(undefined, SECRET), false)
    assert.equal(egaliteConstante(null, SECRET), false)
    assert.equal(egaliteConstante('', SECRET), false)
  })

  test('des longueurs différentes ne font pas lever d\'erreur', () => {
    // timingSafeEqual exige des longueurs égales : c'est le passage par
    // des empreintes qui l'évite. Sans lui, ce test planterait.
    assert.doesNotThrow(() => egaliteConstante('a', 'une chaîne beaucoup plus longue'))
    assert.equal(egaliteConstante('a', 'une chaîne beaucoup plus longue'), false)
  })
})

describe('Jeton de session', () => {
  test('un jeton fraîchement créé est valide', () => {
    assert.equal(jetonValide(creerJeton(SECRET), SECRET), true)
  })

  test('un jeton expiré est refusé', () => {
    const expire = creerJeton(SECRET, Date.now() - 1000)
    assert.equal(jetonValide(expire, SECRET), false)
  })

  test('un jeton expire bien au bout d\'une heure', () => {
    const t0 = 1_000_000_000_000
    const jeton = creerJeton(SECRET, t0 + DUREE_PREVIEW_MS)
    assert.equal(jetonValide(jeton, SECRET, t0), true, 'valide à l\'ouverture')
    assert.equal(jetonValide(jeton, SECRET, t0 + DUREE_PREVIEW_MS - 1), true, 'valide juste avant')
    assert.equal(jetonValide(jeton, SECRET, t0 + DUREE_PREVIEW_MS + 1), false, 'expiré juste après')
  })

  test('une date limite rallongée à la main est refusée', () => {
    // Le scénario réel : quelqu'un modifie le cookie pour se donner
    // un an de prévisualisation.
    const jeton = creerJeton(SECRET)
    const signature = jeton.split('.')[1]
    const falsifie = `${Date.now() + 365 * 24 * 3600 * 1000}.${signature}`
    assert.equal(jetonValide(falsifie, SECRET), false)
  })

  test('un jeton signé avec un autre secret est refusé', () => {
    const jeton = creerJeton('un-autre-secret-entierement-different')
    assert.equal(jetonValide(jeton, SECRET), false)
  })

  test('un jeton malformé est refusé sans planter', () => {
    for (const mauvais of ['', '.', 'abc', 'abc.def', '12345', null, undefined, 42, {}]) {
      assert.equal(jetonValide(mauvais, SECRET), false, `refusé : ${JSON.stringify(mauvais)}`)
    }
  })

  test('sans secret, rien n\'est valide', () => {
    assert.equal(jetonValide(creerJeton(SECRET), ''), false)
    assert.equal(jetonValide(creerJeton(SECRET), undefined), false)
  })
})

describe('Redirection après prévisualisation', () => {
  test('un chemin interne est conservé', () => {
    assert.equal(cheminInterne('/'), '/')
    assert.equal(cheminInterne('/blog/mon-article'), '/blog/mon-article')
    assert.equal(cheminInterne('/#tarifs'), '/#tarifs')
  })

  test('une adresse externe est ramenée sur l\'accueil', () => {
    assert.equal(cheminInterne('https://site-piege.fr'), '/')
    assert.equal(cheminInterne('//site-piege.fr'), '/')
    assert.equal(cheminInterne('/\\site-piege.fr'), '/')
    assert.equal(cheminInterne('javascript:alert(1)'), '/')
  })

  test('une valeur absente ramène sur l\'accueil', () => {
    assert.equal(cheminInterne(null), '/')
    assert.equal(cheminInterne(undefined), '/')
    assert.equal(cheminInterne(123), '/')
  })
})
