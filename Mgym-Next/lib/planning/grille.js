// grille.js — organise les créneaux en tableau Matin / Midi / Soir.
//
// POURQUOI CE REGROUPEMENT ET PAS UN TABLEAU À L'HEURE
// Les horaires diffèrent d'un jour à l'autre : 19h00 le mardi, 19h15 le
// lundi. Un tableau aligné à l'heure près obligerait à inventer des lignes
// vides et deviendrait illisible. Le site regroupe donc par moment de la
// journée, comme le faisait déjà la version écrite en dur.
//
// Fonction pure : elle prend des créneaux, elle rend une grille.

/** Les bornes qui définissent chaque moment de la journée. */
const MOMENTS = [
  { nom: 'Matin', avant: '12:00' },
  { nom: 'Midi',  avant: '15:00' },
  { nom: 'Soir',  avant: '24:00' },
]

/** Les jours affichés, dans l'ordre. */
export const JOURS_AFFICHES = [
  { valeur: 'lundi',    libelle: 'Lundi' },
  { valeur: 'mardi',    libelle: 'Mardi' },
  { valeur: 'mercredi', libelle: 'Mercredi' },
  { valeur: 'jeudi',    libelle: 'Jeudi' },
]

/** À quel moment de la journée appartient une heure « HH:MM ». */
function momentDe(heure) {
  return MOMENTS.find((m) => String(heure) < m.avant)?.nom ?? 'Soir'
}

/**
 * @param {any[]} creneaux
 * @returns {{moment: string, cours: Record<string, any[]>}[]}
 *   Une ligne par moment réellement occupé — un moment sans aucun cours
 *   ne produit pas de ligne vide dans le tableau.
 */
export function construireGrille(creneaux) {
  const lignes = MOMENTS.map((m) => ({ moment: m.nom, cours: {} }))

  for (const c of creneaux ?? []) {
    if (!c || c.actif === false || !c.jour || !c.heureDebut) continue
    if (!JOURS_AFFICHES.some((j) => j.valeur === c.jour)) continue

    const ligne = lignes.find((l) => l.moment === momentDe(c.heureDebut))
    ;(ligne.cours[c.jour] ??= []).push(c)
  }

  // Tri par heure à l'intérieur d'une case : deux cours le même soir
  // s'affichent dans l'ordre où ils ont lieu.
  for (const ligne of lignes) {
    for (const jour of Object.keys(ligne.cours)) {
      ligne.cours[jour].sort((a, b) => a.heureDebut.localeCompare(b.heureDebut))
    }
  }

  return lignes.filter((l) => Object.keys(l.cours).length > 0)
}

/** « 19:15 » devient « 19h15 » — la façon dont on lit une heure en français. */
export const heureLisible = (h) => String(h ?? '').replace(':', 'h')

/** « 2026-02-21 » devient « samedi 21 février ». */
export function dateLisible(iso) {
  const [a, m, j] = String(iso ?? '').split('-').map(Number)
  if (!a || !m || !j) return ''
  // Date construite en UTC et lue en UTC : aucun décalage de fuseau
  // ne peut faire changer le jour affiché.
  return new Date(Date.UTC(a, m - 1, j)).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC',
  })
}
