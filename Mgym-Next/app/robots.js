// robots.js — ce que le fichier /robots.txt dira aux moteurs de recherche.
//
// Le site entier est public : rien à cacher, sauf les routes techniques
// de la prévisualisation. Elles ne mènent à rien sans le secret, mais
// autant ne pas les faire figurer dans un index.

import { getContenu } from '../lib/contenu'

// Ces deux fichiers ne dépendent ni des cookies ni de l'URL : ils sont
// calculés à l'avance, puis refaits à chaque « Publier » (voir
// app/api/revalidation) et au plus tard toutes les heures.
export const dynamic = 'force-static'


export default async function robots() {
  const { seo } = await getContenu()

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    ...(seo.urlCanonique ? { sitemap: `${seo.urlCanonique}/sitemap.xml` } : {}),
  }
}
