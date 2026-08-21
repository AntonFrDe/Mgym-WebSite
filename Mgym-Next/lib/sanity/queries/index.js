// index.js — le point d'entrée unique de la couche de données.
//
// Les composants importent depuis '@/lib/sanity/queries' et rien d'autre.
// Ils ne connaissent ni GROQ, ni le dataset, ni les tokens.

export { getSiteContent, getInfosPratiques, getSeoGlobal } from './contenu.js'
export { getActivites, getActiviteParSlug } from './activites.js'
export { getDonneesPlanning } from './planning.js'
export { getEvenementsAVenir, getEvenementParSlug } from './evenements.js'
export { getArticles, getArticleParSlug, getSlugsArticles } from './articles.js'
