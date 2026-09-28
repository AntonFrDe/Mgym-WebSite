// adresse-web.test.mjs — l'adresse générée à la publication est propre,
// stable, et unique pour deux événements du même nom.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { versAdresse, adressePour } from './adresse-web.js'

test('accents, esperluette et ponctuation', () => {
  assert.equal(versAdresse('Taï Chi Chuan & Qi Gong'), 'tai-chi-chuan-and-qi-gong')
  assert.equal(versAdresse("L'été : marche nordique !"), 'l-ete-marche-nordique')
  assert.equal(versAdresse('  Yoga   doux  '), 'yoga-doux')
})

test('un titre vide ne produit pas d\'adresse', () => {
  assert.equal(versAdresse(''), '')
  assert.equal(adressePour({ titre: '   ' }), '')
  assert.equal(adressePour(null), '')
})

test('80 caractères au plus, sans tiret final', () => {
  const a = versAdresse('mot '.repeat(40))
  assert.ok(a.length <= 80)
  assert.ok(!a.endsWith('-'))
})

test('un article garde son titre seul', () => {
  assert.equal(adressePour({ _type: 'article', titre: 'Bien dormir' }), 'bien-dormir')
})

test('un événement prend sa date, à l\'heure de Paris', () => {
  assert.equal(
    adressePour({ _type: 'evenement', titre: 'Stage Yoga', dateDebut: '2026-10-02T17:00:00.000Z' }),
    'stage-yoga-2026-10-02'
  )
  // 23h30 UTC le 31 octobre = le 1er novembre à Paris
  assert.equal(
    adressePour({ _type: 'evenement', titre: 'Nuit', dateDebut: '2026-10-31T23:30:00.000Z' }),
    'nuit-2026-11-01'
  )
})
