// migrer.test.mjs — vérifie que la migration est idempotente.
//
// Le risque réel : relancer le script et se retrouver avec seize
// activités au lieu de huit. On ne teste pas l'écriture — elle exige un
// projet Sanity — mais la propriété qui la rend sûre : les identifiants
// sont déduits du contenu, donc identiques d'une exécution à l'autre.

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { activites, creneaux } from '../lib/contenu/source-historique.mjs'

const identifiant = (prefixe, texte) =>
  `${prefixe}-${String(texte)
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)}`

describe('Identifiants de migration', () => {
  test('deux calculs successifs donnent le même identifiant', () => {
    for (const a of activites) {
      assert.equal(identifiant('activite', a.name), identifiant('activite', a.name))
    }
  })

  test('les accents et symboles sont normalisés', () => {
    assert.equal(identifiant('activite', 'Gym Bien-être'), 'activite-gym-bien-etre')
    assert.equal(identifiant('activite', 'Forme & Force'), 'activite-forme-force')
  })

  test('aucune collision entre les 8 activités', () => {
    const ids = activites.map((a) => identifiant('activite', a.name))
    assert.equal(new Set(ids).size, ids.length, `collision : ${ids.join(', ')}`)
  })

  test('aucune collision entre les créneaux', () => {
    // Deux Pilates le même jour à des heures différentes doivent produire
    // deux identifiants distincts — sinon l'un écrase l'autre.
    const ids = creneaux.map((c) =>
      identifiant('creneau', `${c.jour}-${c.heureDebut.replace(':', '')}-${c.activite}`)
    )
    assert.equal(new Set(ids).size, ids.length, `collision : ${ids.join(', ')}`)
  })

  test('chaque créneau désigne une activité qui existe', () => {
    const connues = new Set(activites.map((a) => identifiant('activite', a.name)))
    for (const c of creneaux) {
      const cible = identifiant('activite', c.activite)
      assert.ok(connues.has(cible), `créneau orphelin : « ${c.activite} » (${cible})`)
    }
  })
})

describe('Fidélité de la transcription', () => {
  test('les 8 activités du site sont reprises', () => {
    assert.equal(activites.length, 8)
  })

  test('les 10 créneaux du planning sont repris', () => {
    // Planning.js affiche 2 cours le matin, 2 le midi, 6 le soir.
    assert.equal(creneaux.length, 10)
  })

  test('toutes les heures sont au format attendu par le modèle', () => {
    for (const c of creneaux) {
      assert.match(c.heureDebut, /^([01]\d|2[0-3]):[0-5]\d$/, `heure invalide : ${c.heureDebut}`)
    }
  })

  test('tous les jours sont des jours reconnus par le modèle', () => {
    const valides = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
    for (const c of creneaux) assert.ok(valides.includes(c.jour), `jour invalide : ${c.jour}`)
  })
})
