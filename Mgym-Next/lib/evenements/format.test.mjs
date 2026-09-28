// format.test.mjs — les dates de la frise s'affichent à l'heure de Paris,
// été comme hiver, et se regroupent par mois dans l'ordre.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { heure, pastilleDate, periodeLisible, grouperParMois, statutAffiche } from './format.js'

test('l\'heure est celle de Paris, en été (UTC+2) comme en hiver (UTC+1)', () => {
  assert.equal(heure('2026-10-02T17:00:00.000Z'), '19h00')
  assert.equal(heure('2026-11-14T09:30:00.000Z'), '10h30')
})

test('une date invalide ne casse rien', () => {
  assert.equal(heure('pas une date'), '')
  assert.equal(periodeLisible(null), '')
  assert.deepEqual(pastilleDate(undefined), { jour: '', numero: '', mois: '' })
})

test('la pastille découpe jour, numéro et mois', () => {
  const p = pastilleDate('2026-10-02T17:00:00.000Z')
  assert.equal(p.numero, '2')
  assert.match(p.jour, /^ven/)
  assert.match(p.mois, /^oct/)
})

test('un événement d\'un jour : jour, date et heure', () => {
  assert.equal(periodeLisible('2026-10-02T17:00:00.000Z'), 'Vendredi 2 octobre · 19h00')
  assert.equal(
    periodeLisible('2026-10-02T17:00:00.000Z', '2026-10-02T19:00:00.000Z'),
    'Vendredi 2 octobre · 19h00 – 21h00'
  )
})

test('un stage sur plusieurs jours : du … au …', () => {
  assert.equal(
    periodeLisible('2026-11-14T09:00:00.000Z', '2026-11-15T16:00:00.000Z'),
    'Du samedi 14 novembre au dimanche 15 novembre'
  )
})

test('un soir tardif en UTC reste le bon jour à Paris', () => {
  // 23h30 UTC le 31 octobre = 0h30 le 1er novembre à Paris (heure d'hiver).
  const groupes = grouperParMois([{ titre: 'Nuit', dateDebut: '2026-10-31T23:30:00.000Z' }])
  assert.equal(groupes[0].libelle, 'Novembre 2026')
})

test('regroupement par mois, dans l\'ordre, sans perdre d\'événement', () => {
  const groupes = grouperParMois([
    { titre: 'A', dateDebut: '2026-10-02T17:00:00.000Z' },
    { titre: 'B', dateDebut: '2026-10-20T17:00:00.000Z' },
    { titre: 'C', dateDebut: '2026-11-14T09:00:00.000Z' },
    { titre: 'Sans date' },
  ])
  assert.deepEqual(groupes.map((g) => g.libelle), ['Octobre 2026', 'Novembre 2026'])
  assert.deepEqual(groupes[0].evenements.map((e) => e.titre), ['A', 'B'])
})

test('statuts : complet et annulé distincts, tout le reste est ouvert', () => {
  assert.equal(statutAffiche('complet').classe, 'complet')
  assert.equal(statutAffiche('annule').classe, 'annule')
  assert.equal(statutAffiche(undefined).classe, 'ouvert')
})
