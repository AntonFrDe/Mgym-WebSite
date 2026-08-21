// layout.js — c'est l'ENVELOPPE de toutes les pages du site.
// Tout ce qui est ici apparaît sur CHAQUE page (nav, pied de page, polices…).
// C'est l'équivalent du <head> et du <body> de ton ancien fichier HTML.

import { Cormorant_Garamond, Montserrat } from 'next/font/google'
import Nav from '../components/Nav'
import ClientLayout from '../components/ClientLayout'
import BandeauPreview from '../components/BandeauPreview'
import { previewActif } from '../lib/preview'
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
  description: "Association sport et bien-être à Mirepoix-sur-Tarn. Pilates, Yoga, Yogilates, Gym Bien-être, Forme & Force avec Emmanuelle Franc.",
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
