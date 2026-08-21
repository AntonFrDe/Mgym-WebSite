// image.js — fabrique les URLs des images hébergées par Sanity.
//
// Une image Sanity n'est pas un chemin de fichier mais une référence. Cette
// fonction la transforme en URL, en demandant au passage à Sanity de
// redimensionner et de convertir le fichier. On ne télécharge donc jamais
// une photo de 4 Mo pour l'afficher dans une vignette de 130 px.
//
// Le « hotspot » est le point de l'image que la cliente a désigné comme
// devant rester visible au recadrage. `.fit('crop')` le respecte : un
// visage ne sera pas coupé parce que le cadre est carré.

import imageUrlBuilder from '@sanity/image-url'
import { dataset, projectId } from './env.js'

const fabrique = imageUrlBuilder({ projectId, dataset })

/**
 * @param {object|null|undefined} source  le champ image d'un document
 * @param {{largeur?: number, hauteur?: number, qualite?: number}} [options]
 * @returns {string|null} l'URL, ou null si l'image est absente
 */
export function urlImage(source, options = {}) {
  // Champ non renseigné : on renvoie null plutôt qu'une URL cassée. Les
  // composants savent afficher un remplacement, ils ne savent pas gérer
  // une image 404.
  if (!source?.asset?._ref) return null

  let url = fabrique.image(source).auto('format').fit('crop')

  if (options.largeur) url = url.width(options.largeur)
  if (options.hauteur) url = url.height(options.hauteur)
  url = url.quality(options.qualite ?? 80)

  return url.url()
}

/**
 * Le texte alternatif saisi par la cliente, avec un repli explicite.
 * Ne jamais renvoyer une chaîne vide : un alt vide dit au lecteur d'écran
 * « image décorative, ignore-la », ce qui est faux pour une photo de cours.
 *
 * @param {object|null|undefined} source
 * @param {string} repli  description à utiliser si le champ est vide
 * @returns {string}
 */
export function alternatifImage(source, repli) {
  const saisi = source?.alt?.trim()
  return saisi || repli
}
