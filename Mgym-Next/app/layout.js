// layout.js — c'est l'ENVELOPPE de toutes les pages du site.
// Tout ce qui est ici apparaît sur CHAQUE page (nav, pied de page, polices…).
// C'est l'équivalent du <head> et du <body> de ton ancien fichier HTML.

import { Cormorant_Garamond, Montserrat } from 'next/font/google'
import Nav from '../components/Nav'
import ClientLayout from '../components/ClientLayout'
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

// metadata = les infos de l'onglet du navigateur et du référencement Google
export const metadata = {
  title: "M'GYM — Bien-être & Santé · Mirepoix-sur-Tarn",
  description: "Association sport et bien-être à Mirepoix-sur-Tarn. Pilates, Yoga, Marche Nordique, Gym Bien-être avec Emmanuelle Franc.",
}

// RootLayout est la fonction principale : elle reçoit {children} = le contenu de chaque page
export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${montserrat.variable}`}>
      <body>
        <Nav />
        {/* ClientLayout gère les animations au défilement (IntersectionObserver) */}
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
