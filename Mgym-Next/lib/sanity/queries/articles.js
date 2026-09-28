// articles.js — le blog.
//
// Les images sont converties ICI en { src, alt }, la forme qu'attendent
// les pages. Sanity renvoie une référence d'image, pas une adresse : sans
// cette conversion, la première photo d'article se serait affichée cassée
// (les pages lisaient `article.image.src`, qui n'existait pas).

import { interroger } from '../fetch.js'
import { urlImage } from '../image.js'
import { ARTICLES, ARTICLE_PAR_SLUG, SLUGS_ARTICLES } from './groq.js'

/** @param {any} article */
function avecImage(article) {
  if (!article) return article
  const src = urlImage(article.image, { largeur: 1200 })
  return {
    ...article,
    image: src ? { src, alt: article.image?.alt?.trim() || article.titre || '' } : null,
  }
}

/** @param {boolean} [preview] */
export const getArticles = async (preview = false) =>
  ((await interroger({ requete: ARTICLES, preview, siEchec: [] })) ?? []).map(avecImage)

/**
 * @param {string} slug
 * @param {boolean} [preview]
 */
export const getArticleParSlug = async (slug, preview = false) =>
  avecImage(await interroger({
    requete: ARTICLE_PAR_SLUG,
    parametres: { slug: String(slug ?? '') },
    preview,
    siEchec: null,
  }))

/** Sert à generateStaticParams : uniquement les adresses. */
export const getSlugsArticles = () =>
  interroger({ requete: SLUGS_ARTICLES, siEchec: [] })
