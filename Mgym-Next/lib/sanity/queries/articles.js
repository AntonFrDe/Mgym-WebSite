// articles.js — le blog.

import { interroger } from '../fetch.js'
import { ARTICLES, ARTICLE_PAR_SLUG, SLUGS_ARTICLES } from './groq.js'

/** @param {boolean} [preview] */
export const getArticles = (preview = false) =>
  interroger({ requete: ARTICLES, preview, siEchec: [] })

/**
 * @param {string} slug
 * @param {boolean} [preview]
 */
export const getArticleParSlug = (slug, preview = false) =>
  interroger({
    requete: ARTICLE_PAR_SLUG,
    parametres: { slug: String(slug ?? '') },
    preview,
    siEchec: null,
  })

/** Sert à generateStaticParams : uniquement les adresses. */
export const getSlugsArticles = () =>
  interroger({ requete: SLUGS_ARTICLES, siEchec: [] })
