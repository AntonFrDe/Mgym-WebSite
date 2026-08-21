// index.js — LE point d'entrée du contenu, pour toute la page.
//
// Les composants n'appellent jamais Sanity. Ils reçoivent un objet
// `contenu` déjà constitué, dont la forme ne dépend pas de sa provenance.
//
// RÈGLE DE FUSION : la valeur de Sanity l'emporte dès qu'elle existe et
// n'est pas vide. Sinon, le contenu par défaut prend le relais, champ par
// champ. Trois conséquences, toutes voulues :
//
//   · tant qu'aucun projet Sanity n'est configuré, le site est identique
//     à ce qu'il était avant l'ajout du CMS ;
//   · une panne de Sanity dégrade le site vers son ancien contenu, jamais
//     vers une page vide ;
//   · un champ que la cliente n'a pas encore rempli n'efface pas la
//     section : il garde le texte d'origine.

import 'server-only'
import {
  getSiteContent, getInfosPratiques, getSeoGlobal, getActivites, getDonneesPlanning,
} from '../sanity/queries/index.js'
import { urlImage } from '../sanity/image.js'
import { contenuDefaut } from './defaut.js'

/** Vrai si la valeur mérite de remplacer celle par défaut. */
function renseignee(v) {
  if (v === null || v === undefined) return false
  if (typeof v === 'string') return v.trim() !== ''
  if (Array.isArray(v)) return v.length > 0
  if (typeof v === 'object') return Object.keys(v).length > 0
  return true
}

/**
 * Fusionne un objet Sanity sur son équivalent par défaut, champ par champ.
 * On ne descend pas dans les sous-objets : un tarif à moitié rempli n'a
 * pas de sens, c'est tout ou rien.
 */
function fusionner(defaut, sanity) {
  if (!sanity) return defaut
  const resultat = { ...defaut }
  for (const [champ, valeur] of Object.entries(sanity)) {
    if (renseignee(valeur)) resultat[champ] = valeur
  }
  return resultat
}

/**
 * Transforme une image Sanity en { src, alt } — la même forme que les
 * images locales. Les composants n'ont donc qu'un cas à traiter.
 */
function normaliserImage(image, repliAlt, largeur) {
  const src = urlImage(image, { largeur })
  if (!src) return null
  return { src, alt: image?.alt?.trim() || repliAlt }
}

/** Les champs image de siteContent, avec la largeur utile à chacun. */
const IMAGES_SITE = {
  heroImage: 2000,
  aProposPhoto: 1200,
  outdoorImage: 1200,
  bespokeImage: 1200,
  coachPhoto: 1200,
}

/**
 * Rassemble tout le contenu de la page d'accueil en une fois.
 *
 * @param {boolean} [preview]  true = lire les brouillons
 * @returns {Promise<{site: object, infos: object, seo: object, activites: any[]}>}
 */
export async function getContenu(preview = false) {
  // Quatre requêtes indépendantes, lancées ensemble.
  const [site, infos, seo, activites] = await Promise.all([
    getSiteContent(preview),
    getInfosPratiques(preview),
    getSeoGlobal(preview),
    getActivites(preview),
  ])

  // Images de siteContent : converties avant fusion, pour que le repli
  // s'applique aussi à une image absente.
  const siteNormalise = site ? { ...site } : null
  if (siteNormalise) {
    for (const [champ, largeur] of Object.entries(IMAGES_SITE)) {
      siteNormalise[champ] = normaliserImage(
        site[champ], contenuDefaut.site[champ]?.alt ?? '', largeur
      )
    }
  }

  const seoNormalise = seo ? { ...seo } : null
  if (seoNormalise) {
    seoNormalise.imagePartage = normaliserImage(seo.imagePartage, seo.titre ?? '', 1200)
  }

  return {
    site: fusionner(contenuDefaut.site, siteNormalise),
    infos: fusionner(contenuDefaut.infos, infos),
    seo: fusionner(contenuDefaut.seo, seoNormalise),
    activites: renseignee(activites)
      ? activites.map((a) => ({
          ...a,
          image: normaliserImage(a.image, a.titre ?? '', 800),
        }))
      : contenuDefaut.activites,
  }
}

/**
 * Les données du planning, avec le même repli que le reste : sans projet
 * Sanity, ou si aucun créneau n'a encore été saisi, le site affiche le
 * planning actuel plutôt qu'un tableau vide.
 *
 * @param {string} du
 * @param {string} au
 * @param {boolean} [preview]
 */
export async function getPlanning(du, au, preview = false) {
  const donnees = await getDonneesPlanning(du, au, preview)

  return {
    ...donnees,
    creneaux: renseignee(donnees.creneaux) ? donnees.creneaux : contenuDefaut.creneaux,
  }
}
