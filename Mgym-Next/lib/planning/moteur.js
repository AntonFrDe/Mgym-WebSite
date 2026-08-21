// moteur.js — le calcul du planning. Fonction PURE.
//
// Elle ne connaît ni Sanity, ni React, ni le DOM. On lui donne trois
// tableaux et deux dates, elle rend la liste des séances. C'est ce qui la
// rend testable en une milliseconde, sans réseau ni navigateur.
//
// ──────────────────────────────────────────────────────────────────
// POURQUOI AUCUN OBJET Date N'EST UTILISÉ POUR L'HEURE
//
// Un cours à 18:30 doit rester à 18:30 toute l'année. Si on stockait
// l'instant « 2026-01-15T18:30 heure de Paris » sous forme d'objet Date,
// il vaudrait 17:30 UTC en hiver et 16:30 UTC en été — et la moindre
// reconversion ferait bouger l'heure affichée au changement d'heure.
//
// Ici, l'heure est une CHAÎNE, « 18:30 », transportée telle quelle du CMS
// jusqu'à l'écran. Aucune conversion, donc aucun décalage possible.
//
// Le jour de la semaine, lui, est calculé arithmétiquement à partir de
// l'année, du mois et du jour — jamais avec `new Date(...).getDay()`, dont
// le résultat dépend du fuseau horaire de la machine qui exécute le code.
// Un build lancé depuis un serveur américain donnerait sinon un planning
// décalé d'un jour.
// ──────────────────────────────────────────────────────────────────

/** Les jours tels que le CMS les nomme, dans l'ordre de la semaine. */
export const JOURS_SEMAINE = [
  'dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi',
]

/**
 * Nombre de jours écoulés depuis le 1er janvier 1970, calculé sans objet
 * Date. Algorithme des « jours juliens » simplifié, exact pour toute date
 * du calendrier grégorien.
 *
 * @param {number} a année
 * @param {number} m mois (1 à 12)
 * @param {number} j jour du mois
 * @returns {number}
 */
function numeroDeJour(a, m, j) {
  // On décale l'année pour que février soit le dernier mois : les années
  // bissextiles se règlent alors toutes seules.
  const anneeDecalee = a - (m <= 2 ? 1 : 0)
  const ere = Math.floor(anneeDecalee / 400)
  const anneeDansEre = anneeDecalee - ere * 400
  const jourDansAnnee = Math.floor((153 * (m + (m > 2 ? -3 : 9)) + 2) / 5) + j - 1
  const jourDansEre =
    anneeDansEre * 365 +
    Math.floor(anneeDansEre / 4) -
    Math.floor(anneeDansEre / 100) +
    jourDansAnnee
  return ere * 146097 + jourDansEre - 719468
}

/** Opération inverse : d'un numéro de jour vers { a, m, j }. */
function depuisNumeroDeJour(n) {
  let z = n + 719468
  const ere = Math.floor(z / 146097)
  const jourDansEre = z - ere * 146097
  const anneeDansEre = Math.floor(
    (jourDansEre - Math.floor(jourDansEre / 1460) +
      Math.floor(jourDansEre / 36524) - Math.floor(jourDansEre / 146096)) / 365
  )
  const annee = anneeDansEre + ere * 400
  const jourDansAnnee =
    jourDansEre -
    (365 * anneeDansEre + Math.floor(anneeDansEre / 4) - Math.floor(anneeDansEre / 100))
  const mp = Math.floor((5 * jourDansAnnee + 2) / 153)
  const j = jourDansAnnee - Math.floor((153 * mp + 2) / 5) + 1
  const m = mp + (mp < 10 ? 3 : -9)
  return { a: annee + (m <= 2 ? 1 : 0), m, j }
}

/**
 * Découpe une date ISO « AAAA-MM-JJ » sans passer par Date.
 * @param {string} iso
 * @returns {{a: number, m: number, j: number}|null}
 */
function litDateIso(iso) {
  if (typeof iso !== 'string') return null
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim())
  if (!m) return null
  const a = Number(m[1]), mo = Number(m[2]), j = Number(m[3])
  if (mo < 1 || mo > 12 || j < 1 || j > 31) return null
  return { a, m: mo, j }
}

/** Formate { a, m, j } en « AAAA-MM-JJ ». */
function versIso({ a, m, j }) {
  return `${String(a).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(j).padStart(2, '0')}`
}

/**
 * Le nom du jour de la semaine d'une date ISO, indépendamment du fuseau.
 * Le 1er janvier 1970 était un jeudi, d'où le décalage de 4.
 *
 * @param {string} iso
 * @returns {string|null}
 */
export function jourDeLaSemaine(iso) {
  const d = litDateIso(iso)
  if (!d) return null
  const n = numeroDeJour(d.a, d.m, d.j)
  return JOURS_SEMAINE[(((n + 4) % 7) + 7) % 7]
}

/** Vrai si `iso` tombe entre `debut` et `fin`, bornes comprises. */
function estDansPeriode(iso, debut, fin) {
  const d = litDateIso(iso), a = litDateIso(debut), b = litDateIso(fin)
  if (!d || !a || !b) return false
  const n = numeroDeJour(d.a, d.m, d.j)
  return n >= numeroDeJour(a.a, a.m, a.j) && n <= numeroDeJour(b.a, b.m, b.j)
}

/**
 * Quand plusieurs exceptions visent le même cours le même jour, laquelle
 * l'emporte. Une annulation prime sur tout le reste : si quelqu'un a pris
 * la peine d'annuler, mieux vaut ne pas afficher un horaire déplacé.
 */
const PRIORITE = { annule: 3, deplace: 2, complet: 1 }

/**
 * @typedef {object} SeanceCalculee
 * @property {string} id            identifiant stable (créneau + date)
 * @property {string} creneauId
 * @property {string} date          « AAAA-MM-JJ »
 * @property {string} jour          « lundi », « mardi »…
 * @property {string} heure         heure locale française, éventuellement déplacée
 * @property {string} heureInitiale heure du créneau régulier
 * @property {number} duree         en minutes
 * @property {object|null} activite
 * @property {string|null} niveau
 * @property {string|null} lieu
 * @property {number|null} placesMax
 * @property {'normal'|'deplace'|'complet'|'annule'|'ferme'} statut
 * @property {string|null} motif
 */

/**
 * Développe les créneaux récurrents en séances réelles sur une période,
 * en appliquant les exceptions et les fermetures.
 *
 * Toutes les séances sont renvoyées, y compris celles annulées ou tombant
 * pendant une fermeture : c'est l'appelant qui décide ce qu'il affiche.
 * Une fonction de calcul qui masque de l'information oblige à la
 * recalculer ailleurs. `seancesAffichables()` fait le tri habituel.
 *
 * @param {any[]} creneaux
 * @param {any[]} exceptions
 * @param {any[]} fermetures
 * @param {string} du  « AAAA-MM-JJ » incluse
 * @param {string} au  « AAAA-MM-JJ » incluse
 * @returns {SeanceCalculee[]}
 */
export function getPlanningForRange(creneaux, exceptions, fermetures, du, au) {
  // Entrées absentes ou mal formées : on rend un tableau vide plutôt que
  // de lever une erreur. Un planning vide est affichable, pas un plantage.
  const debut = litDateIso(du)
  const fin = litDateIso(au)
  if (!debut || !fin) return []

  const nDebut = numeroDeJour(debut.a, debut.m, debut.j)
  const nFin = numeroDeJour(fin.a, fin.m, fin.j)
  if (nFin < nDebut) return []

  const listeCreneaux = Array.isArray(creneaux) ? creneaux : []
  const listeExceptions = Array.isArray(exceptions) ? exceptions : []
  const listeFermetures = Array.isArray(fermetures) ? fermetures : []

  // Index des exceptions par « créneau|date », pour éviter de reparcourir
  // tout le tableau à chaque jour de la période.
  // Une exception dont le créneau a été supprimé (creneauId absent ou
  // pointant dans le vide) n'est simplement jamais retrouvée : elle est
  // ignorée sans faire échouer le calcul.
  const parCle = new Map()
  for (const e of listeExceptions) {
    if (!e || !e.creneauId || !e.date) continue
    const cle = `${e.creneauId}|${String(e.date).slice(0, 10)}`
    const actuelle = parCle.get(cle)
    if (!actuelle || (PRIORITE[e.type] ?? 0) > (PRIORITE[actuelle.type] ?? 0)) {
      parCle.set(cle, e)
    }
  }

  const seances = []

  for (let n = nDebut; n <= nFin; n++) {
    const date = versIso(depuisNumeroDeJour(n))
    const jour = JOURS_SEMAINE[(((n + 4) % 7) + 7) % 7]

    // Une fermeture couvre toute la journée, tous cours confondus.
    const fermeture = listeFermetures.find(
      (f) => f && estDansPeriode(date, f.dateDebut, f.dateFin)
    )

    for (const c of listeCreneaux) {
      if (!c || c.jour !== jour) continue
      // Un créneau désactivé n'apparaît jamais, même sans exception.
      if (c.actif === false) continue

      const exception = parCle.get(`${c._id}|${date}`)

      let statut = 'normal'
      let heure = c.heureDebut
      let motif = null

      if (fermeture) {
        statut = 'ferme'
        motif = fermeture.libelle ?? null
      } else if (exception) {
        motif = exception.motif ?? null
        if (exception.type === 'annule') {
          statut = 'annule'
        } else if (exception.type === 'complet') {
          statut = 'complet'
        } else if (exception.type === 'deplace' && exception.nouvelleHeure) {
          statut = 'deplace'
          heure = exception.nouvelleHeure
        }
        // Un « deplace » sans nouvelle heure est une saisie incomplète :
        // on garde l'horaire d'origine plutôt que d'afficher un trou.
      }

      seances.push({
        id: `${c._id}|${date}`,
        creneauId: c._id,
        date,
        jour,
        heure,
        heureInitiale: c.heureDebut,
        duree: typeof c.duree === 'number' ? c.duree : 60,
        activite: c.activite ?? null,
        niveau: c.niveau ?? null,
        lieu: c.lieu ?? null,
        placesMax: typeof c.placesMax === 'number' ? c.placesMax : null,
        statut,
        motif,
      })
    }
  }

  // Tri stable : par date, puis par heure. Deux cours à la même heure
  // gardent l'ordre des créneaux, qui vient déjà trié du CMS.
  seances.sort((a, b) =>
    a.date === b.date ? a.heure.localeCompare(b.heure) : a.date.localeCompare(b.date)
  )

  return seances
}

/**
 * Le filtre habituel pour l'affichage : on retire ce qui n'a pas lieu.
 * Les séances annulées et les jours de fermeture disparaissent du tableau,
 * comme aujourd'hui sur le site.
 *
 * @param {SeanceCalculee[]} seances
 * @returns {SeanceCalculee[]}
 */
export function seancesAffichables(seances) {
  return (seances ?? []).filter(
    (s) => s.statut !== 'annule' && s.statut !== 'ferme'
  )
}
