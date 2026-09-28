// format.js — dates et regroupements de la frise des événements.
//
// Sanity enregistre un événement en heure UNIVERSELLE (« 2026-10-02T17:00Z ») :
// la cliente a saisi 19h00, heure de Paris en été. Tout affichage passe donc
// par le fuseau Europe/Paris — sinon le stage s'afficherait à 17h00 en été
// et 18h00 en hiver. `dateLisible` du planning lit en UTC : il convient aux
// dates SANS heure, pas à celles-ci.
//
// Fonctions pures : testées dans format.test.mjs.

const FUSEAU = 'Europe/Paris'

const format = (options) => new Intl.DateTimeFormat('fr-FR', { timeZone: FUSEAU, ...options })
const fJourSemaine = format({ weekday: 'long' })
const fJourMois = format({ day: 'numeric', month: 'long' })
const fMoisAnnee = format({ month: 'long', year: 'numeric' })
const fCle = format({ year: 'numeric', month: '2-digit' })
const fJourCourt = format({ weekday: 'short' })
const fMoisCourt = format({ month: 'short' })
const fNumero = format({ day: 'numeric' })
const fJour = format({ year: 'numeric', month: '2-digit', day: '2-digit' })
const fHeure = format({ hour: '2-digit', minute: '2-digit' })

const majuscule = (t) => t.charAt(0).toUpperCase() + t.slice(1)
const valide = (iso) => Boolean(iso) && !Number.isNaN(new Date(iso).getTime())

/** « 19h00 », à la française. */
export function heure(iso) {
  return valide(iso) ? fHeure.format(new Date(iso)).replace(':', 'h') : ''
}

/**
 * Les trois morceaux de la pastille de date de la frise.
 * @returns {{jour: string, numero: string, mois: string}}  « VEN. », « 2 », « OCT. »
 */
export function pastilleDate(iso) {
  if (!valide(iso)) return { jour: '', numero: '', mois: '' }
  const d = new Date(iso)
  return { jour: fJourCourt.format(d), numero: fNumero.format(d), mois: fMoisCourt.format(d) }
}

/**
 * La période en toutes lettres.
 *   même jour      → « Vendredi 2 octobre · 19h00 » (« · 19h00 – 21h00 » si la fin est connue)
 *   plusieurs jours → « Du samedi 14 au dimanche 15 novembre »
 */
export function periodeLisible(debut, fin) {
  if (!valide(debut)) return ''
  const d = new Date(debut)
  const jourDebut = `${fJourSemaine.format(d)} ${fJourMois.format(d)}`
  if (!valide(fin) || fJour.format(new Date(fin)) === fJour.format(d)) {
    const plage = valide(fin) ? `${heure(debut)} – ${heure(fin)}` : heure(debut)
    return `${majuscule(jourDebut)} · ${plage}`
  }
  const f = new Date(fin)
  return `Du ${jourDebut} au ${fJourSemaine.format(f)} ${fJourMois.format(f)}`
}

/**
 * Regroupe des événements (déjà triés par date) par mois, pour les
 * intertitres de la frise : « Octobre 2026 », « Novembre 2026 »…
 * Un événement sans date valide est écarté plutôt que mal classé.
 */
export function grouperParMois(evenements = []) {
  const groupes = []
  for (const ev of evenements) {
    if (!valide(ev?.dateDebut)) continue
    const d = new Date(ev.dateDebut)
    const cle = fCle.format(d)
    let groupe = groupes.find((g) => g.cle === cle)
    if (!groupe) {
      groupe = { cle, libelle: majuscule(fMoisAnnee.format(d)), evenements: [] }
      groupes.push(groupe)
    }
    groupe.evenements.push(ev)
  }
  return groupes
}

/** Le libellé et la variante visuelle d'un statut ; un statut inconnu vaut « ouvert ». */
export function statutAffiche(statut) {
  if (statut === 'complet') return { texte: 'Complet', classe: 'complet' }
  if (statut === 'annule') return { texte: 'Annulé', classe: 'annule' }
  return { texte: 'Inscriptions ouvertes', classe: 'ouvert' }
}
