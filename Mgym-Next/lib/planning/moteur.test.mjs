// moteur.test.mjs — les tests du moteur de planning.
//
// Lancés par le lanceur intégré à Node (node --test) : aucune dépendance
// de test ajoutée au projet.
//
// AUCUN de ces tests ne contacte Sanity. Le moteur étant une fonction pure,
// il suffit de lui donner des tableaux écrits à la main.

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  getPlanningForRange,
  seancesAffichables,
  jourDeLaSemaine,
} from './moteur.js'

// ── Jeu de données minimal ──────────────────────────────────────
const pilates = {
  _id: 'creneau-pilates',
  jour: 'lundi',
  heureDebut: '19:15',
  duree: 60,
  actif: true,
  activite: { _id: 'act-pilates', titre: 'Pilates' },
}

const yoga = {
  _id: 'creneau-yoga',
  jour: 'jeudi',
  heureDebut: '19:45',
  duree: 60,
  actif: true,
  activite: { _id: 'act-yoga', titre: 'Yin Yoga' },
}

// Janvier 2026 : les lundis tombent les 5, 12, 19 et 26.
const LUNDIS_JANVIER = ['2026-01-05', '2026-01-12', '2026-01-19', '2026-01-26']

describe('jourDeLaSemaine', () => {
  test('ne dépend pas du fuseau horaire de la machine', () => {
    // Le piège classique : new Date('2026-01-05').getDay() renvoie le
    // dimanche à l'ouest de Greenwich, parce que la chaîne est lue comme
    // minuit UTC. Le moteur calcule le jour arithmétiquement.
    assert.equal(jourDeLaSemaine('2026-01-05'), 'lundi')
    assert.equal(jourDeLaSemaine('2026-12-31'), 'jeudi')
  })

  test('gère les années bissextiles', () => {
    assert.equal(jourDeLaSemaine('2024-02-29'), 'jeudi')
    assert.equal(jourDeLaSemaine('2000-02-29'), 'mardi')
  })
})

describe('1. Créneau normal', () => {
  test('une seule semaine produit une seule séance', () => {
    const s = getPlanningForRange([pilates], [], [], '2026-01-05', '2026-01-11')
    assert.equal(s.length, 1)
    assert.equal(s[0].date, '2026-01-05')
    assert.equal(s[0].heure, '19:15')
    assert.equal(s[0].statut, 'normal')
    assert.equal(s[0].activite.titre, 'Pilates')
  })
})

describe('2. Répétition sur plusieurs semaines', () => {
  test('quatre lundis en janvier', () => {
    const s = getPlanningForRange([pilates], [], [], '2026-01-01', '2026-01-31')
    assert.deepEqual(s.map((x) => x.date), LUNDIS_JANVIER)
  })

  test('deux créneaux différents cohabitent et sont triés', () => {
    const s = getPlanningForRange([pilates, yoga], [], [], '2026-01-05', '2026-01-11')
    assert.deepEqual(
      s.map((x) => `${x.date} ${x.heure} ${x.activite.titre}`),
      ['2026-01-05 19:15 Pilates', '2026-01-08 19:45 Yin Yoga']
    )
  })
})

describe('3. Annulation', () => {
  const annulation = {
    _id: 'exc-1',
    creneauId: 'creneau-pilates',
    date: '2026-01-12',
    type: 'annule',
    motif: 'Jour férié',
  }

  test('la séance est marquée annulée, avec son motif', () => {
    const s = getPlanningForRange([pilates], [annulation], [], '2026-01-01', '2026-01-31')
    const cible = s.find((x) => x.date === '2026-01-12')
    assert.equal(cible.statut, 'annule')
    assert.equal(cible.motif, 'Jour férié')
  })

  test('elle disparaît du planning affiché', () => {
    const s = seancesAffichables(
      getPlanningForRange([pilates], [annulation], [], '2026-01-01', '2026-01-31')
    )
    assert.deepEqual(s.map((x) => x.date), ['2026-01-05', '2026-01-19', '2026-01-26'])
  })

  test('les autres semaines ne sont pas touchées', () => {
    const s = getPlanningForRange([pilates], [annulation], [], '2026-01-01', '2026-01-31')
    assert.equal(s.filter((x) => x.statut === 'normal').length, 3)
  })
})

describe('4. Déplacement', () => {
  test('la nouvelle heure remplace l\'ancienne, qui reste consultable', () => {
    const exc = {
      _id: 'exc-2', creneauId: 'creneau-pilates', date: '2026-01-19',
      type: 'deplace', nouvelleHeure: '18:00', motif: 'Salle occupée',
    }
    const s = getPlanningForRange([pilates], [exc], [], '2026-01-01', '2026-01-31')
    const cible = s.find((x) => x.date === '2026-01-19')
    assert.equal(cible.statut, 'deplace')
    assert.equal(cible.heure, '18:00')
    assert.equal(cible.heureInitiale, '19:15')
  })

  test('un déplacement sans nouvelle heure garde l\'horaire d\'origine', () => {
    // Saisie incomplète : mieux vaut l'horaire habituel qu'un trou.
    const exc = { _id: 'exc-3', creneauId: 'creneau-pilates', date: '2026-01-19', type: 'deplace' }
    const s = getPlanningForRange([pilates], [exc], [], '2026-01-19', '2026-01-19')
    assert.equal(s[0].heure, '19:15')
    assert.equal(s[0].statut, 'normal')
  })
})

describe('5. Séance complète', () => {
  test('elle reste visible, marquée complète', () => {
    const exc = { _id: 'exc-4', creneauId: 'creneau-pilates', date: '2026-01-05', type: 'complet' }
    const s = getPlanningForRange([pilates], [exc], [], '2026-01-01', '2026-01-31')
    const cible = s.find((x) => x.date === '2026-01-05')
    assert.equal(cible.statut, 'complet')
    assert.equal(cible.heure, '19:15')
    // Une séance complète a bien lieu : elle ne disparaît pas du tableau.
    assert.ok(seancesAffichables(s).some((x) => x.date === '2026-01-05'))
  })
})

describe('6. Fermeture', () => {
  const vacances = {
    _id: 'ferm-1', libelle: 'Vacances de Noël',
    dateDebut: '2025-12-20', dateFin: '2026-01-06',
  }

  test('les séances de la période sont masquées', () => {
    const s = seancesAffichables(
      getPlanningForRange([pilates], [], [vacances], '2025-12-15', '2026-01-31')
    )
    assert.ok(!s.some((x) => x.date === '2025-12-22'))
    assert.ok(!s.some((x) => x.date === '2026-01-05'))
    // Le 12 janvier est hors vacances : le cours reprend.
    assert.ok(s.some((x) => x.date === '2026-01-12'))
  })

  test('les bornes de la fermeture sont incluses', () => {
    const s = getPlanningForRange([pilates], [], [vacances], '2026-01-05', '2026-01-06')
    assert.equal(s[0].statut, 'ferme')
    assert.equal(s[0].motif, 'Vacances de Noël')
  })

  test('une fermeture l\'emporte sur une annulation', () => {
    const exc = { _id: 'e', creneauId: 'creneau-pilates', date: '2026-01-05', type: 'complet' }
    const s = getPlanningForRange([pilates], [exc], [vacances], '2026-01-05', '2026-01-05')
    assert.equal(s[0].statut, 'ferme')
  })
})

describe('7. Créneau désactivé', () => {
  test('il n\'apparaît jamais', () => {
    const arrete = { ...pilates, actif: false }
    const s = getPlanningForRange([arrete], [], [], '2026-01-01', '2026-01-31')
    assert.deepEqual(s, [])
  })
})

describe('8. Exception orpheline', () => {
  test('une exception sur un créneau supprimé ne fait pas planter', () => {
    const orpheline = { _id: 'x', creneauId: 'creneau-disparu', date: '2026-01-05', type: 'annule' }
    const s = getPlanningForRange([pilates], [orpheline], [], '2026-01-01', '2026-01-31')
    assert.equal(s.length, 4)
    assert.ok(s.every((x) => x.statut === 'normal'))
  })

  test('une exception sans créneau ni date est ignorée', () => {
    const cassees = [{ _id: 'a' }, { _id: 'b', date: '2026-01-05' }, null]
    const s = getPlanningForRange([pilates], cassees, [], '2026-01-01', '2026-01-31')
    assert.equal(s.length, 4)
  })
})

describe('9 et 10. Heure d\'été et heure d\'hiver — Europe/Paris', () => {
  // Le passage à l'heure d'été 2026 a lieu le dimanche 29 mars,
  // le retour à l'heure d'hiver le dimanche 25 octobre.
  const dimanche = {
    _id: 'creneau-dimanche', jour: 'dimanche', heureDebut: '18:30',
    duree: 60, actif: true, activite: { _id: 'a', titre: 'Marche nordique' },
  }

  test('18:30 reste 18:30 de part et d\'autre du passage à l\'heure d\'été', () => {
    const s = getPlanningForRange([dimanche], [], [], '2026-03-22', '2026-04-05')
    assert.deepEqual(
      s.map((x) => `${x.date} ${x.heure}`),
      ['2026-03-22 18:30', '2026-03-29 18:30', '2026-04-05 18:30']
    )
  })

  test('18:30 reste 18:30 de part et d\'autre du retour à l\'heure d\'hiver', () => {
    const s = getPlanningForRange([dimanche], [], [], '2026-10-18', '2026-11-01')
    assert.deepEqual(
      s.map((x) => `${x.date} ${x.heure}`),
      ['2026-10-18 18:30', '2026-10-25 18:30', '2026-11-01 18:30']
    )
  })

  test('le résultat est identique quel que soit le fuseau de la machine', () => {
    // On force le processus à croire qu'il tourne à Honolulu, puis à Tokyo.
    // Un moteur qui utiliserait new Date().getDay() donnerait des jours
    // différents ; celui-ci ne bouge pas.
    const reference = getPlanningForRange([dimanche], [], [], '2026-03-22', '2026-04-05')
    const initial = process.env.TZ

    for (const tz of ['Pacific/Honolulu', 'Asia/Tokyo', 'UTC']) {
      process.env.TZ = tz
      const obtenu = getPlanningForRange([dimanche], [], [], '2026-03-22', '2026-04-05')
      assert.deepEqual(obtenu, reference, `divergence sous TZ=${tz}`)
    }

    if (initial === undefined) delete process.env.TZ
    else process.env.TZ = initial
  })
})

describe('11. Changement de semaine, de mois, d\'année', () => {
  test('une période à cheval sur deux années', () => {
    const s = getPlanningForRange([pilates], [], [], '2025-12-29', '2026-01-05')
    assert.deepEqual(s.map((x) => x.date), ['2025-12-29', '2026-01-05'])
  })

  test('une période d\'un seul jour', () => {
    const s = getPlanningForRange([pilates], [], [], '2026-01-05', '2026-01-05')
    assert.equal(s.length, 1)
  })

  test('une période inversée ne rend rien', () => {
    assert.deepEqual(getPlanningForRange([pilates], [], [], '2026-01-31', '2026-01-01'), [])
  })
})

describe('12. Planning vide', () => {
  test('aucun créneau', () => {
    assert.deepEqual(getPlanningForRange([], [], [], '2026-01-01', '2026-01-31'), [])
  })

  test('aucun créneau ce jour-là', () => {
    // Le 6 janvier 2026 est un mardi : ni Pilates ni Yoga.
    assert.deepEqual(getPlanningForRange([pilates, yoga], [], [], '2026-01-06', '2026-01-06'), [])
  })
})

describe('13. Plusieurs exceptions', () => {
  test('l\'annulation l\'emporte sur le déplacement', () => {
    const exceptions = [
      { _id: 'a', creneauId: 'creneau-pilates', date: '2026-01-05', type: 'deplace', nouvelleHeure: '18:00' },
      { _id: 'b', creneauId: 'creneau-pilates', date: '2026-01-05', type: 'annule', motif: 'Neige' },
    ]
    const s = getPlanningForRange([pilates], exceptions, [], '2026-01-05', '2026-01-05')
    assert.equal(s[0].statut, 'annule')
    assert.equal(s[0].motif, 'Neige')
  })

  test('l\'ordre de saisie ne change pas le résultat', () => {
    const a = { _id: 'a', creneauId: 'creneau-pilates', date: '2026-01-05', type: 'complet' }
    const b = { _id: 'b', creneauId: 'creneau-pilates', date: '2026-01-05', type: 'annule' }
    const dansUnSens = getPlanningForRange([pilates], [a, b], [], '2026-01-05', '2026-01-05')
    const dansLAutre = getPlanningForRange([pilates], [b, a], [], '2026-01-05', '2026-01-05')
    assert.deepEqual(dansUnSens, dansLAutre)
  })

  test('des exceptions sur des dates différentes coexistent', () => {
    const exceptions = [
      { _id: 'a', creneauId: 'creneau-pilates', date: '2026-01-05', type: 'annule' },
      { _id: 'b', creneauId: 'creneau-pilates', date: '2026-01-19', type: 'complet' },
    ]
    const s = getPlanningForRange([pilates], exceptions, [], '2026-01-01', '2026-01-31')
    assert.deepEqual(s.map((x) => x.statut), ['annule', 'normal', 'complet', 'normal'])
  })
})

describe('14. Données incohérentes', () => {
  test('des entrées nulles ou absentes ne font pas planter', () => {
    assert.deepEqual(getPlanningForRange(null, null, null, '2026-01-01', '2026-01-31'), [])
    assert.deepEqual(getPlanningForRange(undefined, undefined, undefined, '2026-01-01', '2026-01-05'), [])
  })

  test('des dates invalides rendent un tableau vide', () => {
    assert.deepEqual(getPlanningForRange([pilates], [], [], 'pas-une-date', '2026-01-31'), [])
    assert.deepEqual(getPlanningForRange([pilates], [], [], '2026-13-01', '2026-01-31'), [])
    assert.deepEqual(getPlanningForRange([pilates], [], [], null, undefined), [])
  })

  test('un créneau sans durée reçoit une valeur par défaut', () => {
    const sansDuree = { ...pilates, duree: undefined }
    const s = getPlanningForRange([sansDuree], [], [], '2026-01-05', '2026-01-05')
    assert.equal(s[0].duree, 60)
  })

  test('un créneau nul dans la liste est ignoré', () => {
    const s = getPlanningForRange([null, pilates, undefined], [], [], '2026-01-05', '2026-01-05')
    assert.equal(s.length, 1)
  })

  test('une fermeture aux dates cassées est ignorée sans planter', () => {
    const cassee = { _id: 'f', libelle: 'X', dateDebut: null, dateFin: 'abc' }
    const s = getPlanningForRange([pilates], [], [cassee], '2026-01-05', '2026-01-05')
    assert.equal(s[0].statut, 'normal')
  })
})

describe('Pureté de la fonction', () => {
  test('les tableaux d\'entrée ne sont pas modifiés', () => {
    const creneaux = [{ ...pilates }]
    const exceptions = [{ _id: 'a', creneauId: 'creneau-pilates', date: '2026-01-05', type: 'annule' }]
    const avant = JSON.stringify({ creneaux, exceptions })
    getPlanningForRange(creneaux, exceptions, [], '2026-01-01', '2026-01-31')
    assert.equal(JSON.stringify({ creneaux, exceptions }), avant)
  })

  test('deux appels identiques donnent le même résultat', () => {
    const a = getPlanningForRange([pilates, yoga], [], [], '2026-01-01', '2026-03-31')
    const b = getPlanningForRange([pilates, yoga], [], [], '2026-01-01', '2026-03-31')
    assert.deepEqual(a, b)
  })
})
