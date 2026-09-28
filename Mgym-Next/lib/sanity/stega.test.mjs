// stega.test.mjs — dans l'aperçu, les champs que le code compare ne
// reçoivent jamais de caractères invisibles ; les textes affichés, si.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { filtreStega } from './stega.js'

const parDefaut = () => true
const filtre = (sourcePath, value = 'texte') => filtreStega({ sourcePath, value, filterDefault: parDefaut })

test('un texte affiché peut être marqué (clic-pour-modifier)', () => {
  assert.equal(filtre(['heroTitre']), true)
  assert.equal(filtre(['tarifsCarte', 0, 'nom']), true)
})

test('les champs lus par le code ne sont jamais marqués', () => {
  for (const champ of ['telephone', 'statut', 'rubrique', 'jour', 'heureDebut', 'avisNote', 'type']) {
    assert.equal(filtre([champ]), false, champ)
  }
})

test('le nom d\'un réseau (qui choisit le logo) n\'est pas marqué', () => {
  assert.equal(filtre(['reseauxSociaux', 1, 'nom']), false)
})

test('une chaîne vide reste vide', () => {
  assert.equal(filtre(['inscriptionEtapes', 0], ''), false)
  assert.equal(filtre(['inscriptionEtapes', 0], '   '), false)
})

test('les règles de Sanity (dates, adresses web…) restent appliquées', () => {
  const refuseTout = () => false
  assert.equal(filtreStega({ sourcePath: ['heroTitre'], value: 'x', filterDefault: refuseTout }), false)
})
