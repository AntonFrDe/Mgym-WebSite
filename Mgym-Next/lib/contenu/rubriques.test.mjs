// rubriques.test.mjs — le carrousel ne montre que des cours ; les deux
// offres partent dans leurs onglets, même sur les fiches d'avant le champ.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { rubriqueDe, repartirActivites } from './rubriques.js'

test('le champ « rubrique » l\'emporte sur l\'adresse web', () => {
  assert.equal(rubriqueDe({ rubrique: 'cours', slug: 'ateliers-thematiques' }), 'cours')
  assert.equal(rubriqueDe({ rubrique: 'surMesure', slug: 'yoga' }), 'surMesure')
})

test('sans champ, les deux offres sont reconnues à leur adresse web', () => {
  assert.equal(rubriqueDe({ slug: 'ateliers-thematiques' }), 'ateliers')
  assert.equal(rubriqueDe({ slug: 'prestations-sur-mesure' }), 'surMesure')
})

test('une valeur inconnue, ou rien du tout, donne un cours', () => {
  assert.equal(rubriqueDe({ rubrique: 'nimporte', slug: 'yoga' }), 'cours')
  assert.equal(rubriqueDe({}), 'cours')
  assert.equal(rubriqueDe(null), 'cours')
})

test('la répartition garde l\'ordre des cours et isole les offres', () => {
  const r = repartirActivites([
    { titre: 'Yoga', slug: 'yoga' },
    { titre: 'Ateliers', slug: 'ateliers-thematiques' },
    { titre: 'Pilates', slug: 'pilates' },
    { titre: 'Sur mesure', rubrique: 'surMesure' },
  ])
  assert.deepEqual(r.cours.map((a) => a.titre), ['Yoga', 'Pilates'])
  assert.equal(r.ateliers.titre, 'Ateliers')
  assert.equal(r.surMesure.titre, 'Sur mesure')
})

test('une offre absente donne null, pas une erreur', () => {
  const r = repartirActivites([{ slug: 'yoga' }])
  assert.equal(r.ateliers, null)
  assert.equal(r.surMesure, null)
})
