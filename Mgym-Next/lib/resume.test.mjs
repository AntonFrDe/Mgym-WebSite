// resume.test.mjs — un résumé automatique ne coupe jamais un mot en deux.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resume } from './resume.js'

test('un texte court est rendu tel quel, espaces nettoyés', () => {
  assert.equal(resume('  Bien   dormir.\n'), 'Bien dormir.')
})

test('un texte long est coupé à la fin d\'un mot, avec « … »', () => {
  const r = resume('Le sommeil répare le corps et apaise l\'esprit après une séance de yoga.', 30)
  assert.ok(r.length <= 30, r)
  assert.ok(r.endsWith('…'))
  assert.equal(r, 'Le sommeil répare le corps et…')
})

test('rien ne donne une chaîne vide', () => {
  assert.equal(resume(undefined), '')
})
