// layout.js — c'est l'ENVELOPPE de toutes les pages du site.
// Tout ce qui est ici apparaît sur CHAQUE page (nav, pied de page, polices…).
// C'est l'équivalent du <head> et du <body> de ton ancien fichier HTML.

import { Cormorant_Garamond, Montserrat } from 'next/font/google'
import Nav from '../components/Nav'
import ClientLayout from '../components/ClientLayout'
import BandeauPreview from '../components/BandeauPreview'
import EditionVisuelle from '../components/EditionVisuelle'
import { previewActif } from '../lib/preview'
import { getContenu } from '../lib/contenu'
import './globals.css'

// next/font/google charge les polices directement depuis Google Fonts
// SANS que le navigateur fasse un aller-retour vers Google : plus rapide.
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif', // crée une variable CSS réutilisable partout
})

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
})

// QUAND LE SITE RELIT LE CMS
//
// 1. À chaque « Publier » dans le back-office : Sanity prévient le site
//    (webhook → app/api/revalidation/route.js), qui jette ses pages en
//    cache. La visite suivante voit la modification, en quelques secondes.
// 2. Au plus tard toutes les heures, par sécurité : si un appel de Sanity
//    se perd (Sanity n'essaie que 3 fois), le site se rattrape seul. C'est
//    aussi ce qui fait disparaître un stage passé ou un cours annulé de la
//    veille sans que personne ne publie rien.
//
// Déclaré ICI, une seule fois : Next applique le plus petit délai trouvé
// entre la mise en page et la page, donc ce nombre vaut pour tout le site.
// Il doit rester écrit en chiffres (Next refuse une constante importée).
// lib/sanity/fetch.js reprend le même nombre pour les réponses de Sanity.
export const revalidate = 3600

// Les informations de l'onglet du navigateur et des résultats de
// recherche viennent du back-office, onglet « Référencement ».
//
// generateMetadata (et non une constante) parce que ces valeurs sont
// désormais lues à la construction du site : elles peuvent changer sans
// qu'on touche au code. En aperçu, ce sont les brouillons qui sont lus,
// comme pour le reste de la page.
export async function generateMetadata() {
  const { seo } = await getContenu(await previewActif())

  const partage = seo.imagePartage?.src
    ? [{ url: seo.imagePartage.src, alt: seo.imagePartage.alt }]
    : undefined

  return {
    title: seo.titre,
    description: seo.description,
    ...(seo.urlCanonique ? { metadataBase: new URL(seo.urlCanonique) } : {}),
    alternates: seo.urlCanonique ? { canonical: '/' } : undefined,
    openGraph: {
      type: 'website',
      locale: 'fr_FR',
      title: seo.titre,
      description: seo.description,
      images: partage,
    },
    twitter: {
      card: partage ? 'summary_large_image' : 'summary',
      title: seo.titre,
      description: seo.description,
      images: partage,
    },
  }
}

// RootLayout est la fonction principale : elle reçoit {children} = le contenu de chaque page.
//
// `async` depuis l'ajout de la prévisualisation : savoir si la session est
// active demande de lire les cookies, donc d'attendre.
export default async function RootLayout({ children }) {
  // previewActif() vérifie le mode brouillon de Next ET la validité du
  // cookie signé : une session expirée retombe sur le site publié.
  const enPreview = await previewActif()

  // L'image d'accueil est posée en fond CSS : le navigateur ne la découvre
  // qu'après avoir analysé la feuille de style, soit très tard. Elle est
  // pourtant le plus gros élément visible de la page — celui que Google
  // chronomètre. Ce préchargement la demande dès la première ligne du HTML.
  const { site } = await getContenu(enPreview)
  const imageAccueil = site.heroImage?.src

  return (
    <html lang="fr" className={`${cormorant.variable} ${montserrat.variable}`}>
      <head>
        {imageAccueil && (
          <link rel="preload" as="image" href={imageAccueil} fetchPriority="high" />
        )}
      </head>
      {/* La classe descend toute la page pour laisser la place au bandeau.
          Sur le site public, elle n'est jamais posée. */}
      <body className={enPreview ? 'en-preview' : undefined}>
        {enPreview && <BandeauPreview />}
        {/* L'aperçu du Studio : cadres cliquables et rafraîchissement en
            direct. Jamais rendu sur le site public. */}
        {enPreview && <EditionVisuelle />}
        <Nav />
        {/* ClientLayout gère les animations au défilement (IntersectionObserver) */}
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
