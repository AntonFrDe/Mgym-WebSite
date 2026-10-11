// index.js — LE point d'entrée du contenu, pour toute la page.
//
// Les composants n'appellent jamais Sanity. Ils reçoivent un objet
// `contenu` déjà constitué, dont la forme ne dépend pas de sa provenance.
//
// SANITY EST LA SEULE SOURCE DU TEXTE. Il n'y a plus de « contenu par
// défaut » écrit dans le code (supprimé en octobre 2026). Il cachait trois
// défauts mesurés sur le site en ligne :
//
//   · vider un champ pour retirer un texte ne retirait rien : l'ancien
//     texte du code revenait ;
//   · vingt champs paraissaient vides dans le back-office alors que le
//     site affichait un texte — la cliente ne pouvait pas savoir lequel
//     modifier ;
//   · les témoignages du site n'existaient pas dans le back-office.
//
// Désormais, ce que la cliente voit dans le back-office est exactement ce
// qu'affiche le site. Un champ vide n'affiche rien (chaque composant le
// vérifie avant d'afficher).
//
// Et si Sanity tombe en panne ? En production, la lecture LÈVE une erreur
// (lib/sanity/fetch.js) : le site continue de servir la dernière page
// fabriquée, il ne se vide pas.

import 'server-only'
import {
  getSiteContent, getInfosPratiques, getSeoGlobal, getActivites, getDonneesPlanning,
  getEvenementsAVenir,
} from '../sanity/queries/index.js'
import { urlImage } from '../sanity/image.js'

/**
 * Transforme une image Sanity en { src, alt }. Les composants n'ont donc
 * qu'une forme à traiter, et `null` quand il n'y a pas de photo.
 *
 * @param {object} image        le champ image tel que Sanity le renvoie
 * @param {string} altSecours   si la cliente n'a pas décrit la photo
 * @param {number} largeur      en pixels
 */
function normaliserImage(image, altSecours, largeur) {
  const src = urlImage(image, { largeur })
  if (!src) return null
  return { src, alt: image?.alt?.trim() || altSecours }
}

// Les champs image de « Textes du site » : largeur utile, et description
// de secours si la cliente n'en a pas écrit (lue aux personnes
// malvoyantes — mieux vaut une description générale que rien).
const IMAGES_SITE = {
  heroImage:    { largeur: 2000, alt: "Une séance de M'GYM" },
  aProposPhoto: { largeur: 1200, alt: "L'association M'GYM" },
  outdoorImage: { largeur: 1200, alt: 'Une activité en plein air' },
  bespokeImage: { largeur: 1200, alt: 'Une prestation sur mesure' },
  coachPhoto:   { largeur: 1200, alt: "La coach de M'GYM" },
}

/**
 * Rassemble tout le contenu de la page d'accueil en une fois.
 *
 * Un document absent (jamais créé) donne un objet vide plutôt que `null` :
 * les composants lisent `site.heroTitre`, pas `site?.heroTitre`.
 *
 * @param {boolean} [preview]  true = lire les brouillons
 * @returns {Promise<{site: object, infos: object, seo: object, activites: any[], evenements: any[]}>}
 */
export async function getContenu(preview = false) {
  // Cinq requêtes indépendantes, lancées ensemble.
  const [site, infos, seo, activites, evenements] = await Promise.all([
    getSiteContent(preview),
    getInfosPratiques(preview),
    getSeoGlobal(preview),
    getActivites(preview),
    getEvenementsAVenir(preview),
  ])

  const siteNormalise = { ...(site ?? {}) }
  for (const [champ, { largeur, alt }] of Object.entries(IMAGES_SITE)) {
    siteNormalise[champ] = normaliserImage(siteNormalise[champ], alt, largeur)
  }

  return {
    site: siteNormalise,
    infos: infos ?? {},
    seo: { ...(seo ?? {}), imagePartage: normaliserImage(seo?.imagePartage, seo?.titre ?? '', 1200) },
    activites: (activites ?? []).map((a) => ({
      ...a,
      image: normaliserImage(a.image, a.titre ?? '', 800),
    })),
    evenements: (evenements ?? []).map(normaliserEvenement),
  }
}

/**
 * L'image d'un événement, dans la même forme que les autres images.
 * `vignette` : la même, en petit (16:9, 480 px), pour la frise de
 * l'accueil — inutile d'y télécharger la photo de 1200 px de la fiche.
 */
export function normaliserEvenement(ev) {
  return {
    ...ev,
    image: normaliserImage(ev.image, ev.titre ?? '', 1200),
    vignette: ev.image?.asset?._ref
      ? { src: urlImage(ev.image, { largeur: 480, hauteur: 270 }) }
      : null,
  }
}

/**
 * Les données du planning : créneaux, annulations et fermetures de la
 * période. Aucun créneau saisi = un planning vide (le composant l'affiche
 * proprement), jamais l'ancien planning du code.
 *
 * @param {string} du
 * @param {string} au
 * @param {boolean} [preview]
 */
export async function getPlanning(du, au, preview = false) {
  const donnees = await getDonneesPlanning(du, au, preview)
  return { ...donnees, creneaux: donnees.creneaux ?? [] }
}
