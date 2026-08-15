'use client'
// 'use client' = ce composant s'exécute dans le NAVIGATEUR (côté client).
// Il en a besoin car il utilise IntersectionObserver, une API du navigateur
// qui n'existe pas côté serveur.
//
// Son rôle : surveiller tous les éléments .apparition, .apparition-gauche
// et .apparition-droite, puis leur ajouter la classe .est-apparu quand ils
// entrent dans l'écran. Résultat : les sections apparaissent en fondu au
// défilement. Les styles correspondants sont dans globals.css, section
// « ANIMATIONS AU DÉFILEMENT ».

import { useEffect } from 'react'
// useEffect = "exécute ce code APRÈS que la page soit affichée dans le navigateur"

export default function ClientLayout({ children }) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('est-apparu')
            observer.unobserve(entry.target) // on arrête d'observer une fois visible
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    // On observe tous les éléments qui doivent apparaître en fondu
    document.querySelectorAll('.apparition, .apparition-gauche, .apparition-droite').forEach((el) =>
      observer.observe(el)
    )

    // Nettoyage : on déconnecte l'observer quand le composant est supprimé
    return () => observer.disconnect()
  }, []) // [] = on n'exécute cet effet qu'une seule fois au chargement

  // children = tout le contenu de la page passé entre les balises <ClientLayout>
  return <>{children}</>
}
