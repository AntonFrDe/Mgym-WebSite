// layout.js — c'est l'ENVELOPPE de toutes les pages du site.
// Tout ce qui est ici apparaît sur CHAQUE page (nav, pied de page, polices…).
// C'est l'équivalent du <head> et du <body> de ton ancien fichier HTML.

import { Cormorant_Garamond, Montserrat } from 'next/font/google'
import Nav from '../components/Nav'
import ClientLayout from '../components/ClientLayout'
import BandeauPreview from '../components/BandeauPreview'
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

// Les informations de l'onglet du navigateur et des résultats de
// recherche viennent du back-office, onglet « Référencement ».
//
// generateMetadata (et non une constante) parce que ces valeurs sont
// désormais lues à la construction du site : elles peuvent changer sans
// qu'on touche au code.
export async function generateMetadata() {
  const { seo } = await getContenu()

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

  return (
    <html lang="fr" className={`${cormorant.variable} ${montserrat.variable}`}>
      {/* La classe descend toute la page pour laisser la place au bandeau.
          Sur le site public, elle n'est jamais posée. */}
      <body className={enPreview ? 'en-preview' : undefined}>
        {enPreview && <BandeauPreview />}
        <Nav />
        {/* ClientLayout gère les animations au défilement (IntersectionObserver) */}
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
