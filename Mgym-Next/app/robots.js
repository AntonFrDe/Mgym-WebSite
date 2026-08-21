// robots.js — ce que le fichier /robots.txt dira aux moteurs de recherche.
//
// Le site entier est public : rien à cacher, sauf les routes techniques
// de la prévisualisation. Elles ne mènent à rien sans le secret, mais
// autant ne pas les faire figurer dans un index.

import { getContenu } from '../lib/contenu'

// Ces deux fichiers sont calculés au BUILD, jamais à la requête : ils ne
// dépendent ni des cookies ni de l'URL. Le déclarer explicitement est
// obligatoire pour que la copie hors-ligne (mode export) puisse les
// produire — sans cette ligne, le build d'export échoue.
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
