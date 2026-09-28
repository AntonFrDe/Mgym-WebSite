// rubriques.js — où chaque activité s'affiche sur la page.
//
// Les activités du back-office ne sont pas toutes des COURS. Deux d'entre
// elles sont des OFFRES : les ateliers thématiques et les prestations sur
// mesure. Elles alourdissaient le carrousel des cours ; elles ont désormais
// leur onglet dans la section « Plus d'activités ».
//
// Le champ « rubrique » du back-office le dit explicitement. Les fiches
// créées avant ce champ ne l'ont pas : on les reconnaît alors à leur
// adresse web (le slug), qui ne change pas quand on renomme l'activité —
// contrairement au titre. Fonction pure : testée dans rubriques.test.mjs.

export const RUBRIQUES = ['cours', 'ateliers', 'surMesure']

/** Les fiches d'avant le champ « rubrique », reconnues à leur adresse web. */
const PAR_ADRESSE = {
  'ateliers-thematiques': 'ateliers',
  'prestations-sur-mesure': 'surMesure',
}

/**
 * @param {{rubrique?: string, slug?: string|null}} activite
 * @returns {'cours'|'ateliers'|'surMesure'}
 */
export function rubriqueDe(activite) {
  if (RUBRIQUES.includes(activite?.rubrique)) return activite.rubrique
  return PAR_ADRESSE[activite?.slug] ?? 'cours'
}

/**
 * Sépare les cours (le carrousel) des deux offres (les onglets).
 * S'il existe plusieurs fiches d'une même offre, la première l'emporte :
 * l'onglet n'en affiche qu'une.
 *
 * @param {any[]} activites  dans l'ordre d'affichage
 */
export function repartirActivites(activites = []) {
  return {
    cours: activites.filter((a) => rubriqueDe(a) === 'cours'),
    ateliers: activites.find((a) => rubriqueDe(a) === 'ateliers') ?? null,
    surMesure: activites.find((a) => rubriqueDe(a) === 'surMesure') ?? null,
  }
}
