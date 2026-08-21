// sitemap.js — la carte du site, pour les moteurs de recherche.
//
// Générée depuis le contenu, pas écrite à la main : un article publié dans
// le back-office y apparaît sans intervention.
//
// Sans URL canonique renseignée dans « Référencement », le plan du site
// n'a pas de sens (les adresses seraient relatives) : on renvoie alors
// une liste vide plutôt qu'un fichier trompeur.

import { getContenu } from '../lib/contenu'
import { getArticles } from '../lib/sanity/queries/index.js'

export default async function sitemap() {
  const { seo } = await getContenu()
  const base = seo.urlCanonique
  if (!base) return []

  const articles = (await getArticles()) ?? []

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    ...articles
      .filter((a) => a.slug)
      .map((a) => ({
        url: `${base}/blog/${a.slug}`,
        lastModified: a.datePublication ? new Date(a.datePublication) : new Date(),
        changeFrequency: 'yearly',
        priority: 0.6,
      })),
  ]
}
