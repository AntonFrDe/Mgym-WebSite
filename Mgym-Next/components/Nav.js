'use client'
// 'use client' obligatoire car on écoute des événements du navigateur :
// - window.scroll → pour changer l'apparence de la nav en défilant
// - onClick → pour ouvrir/fermer le menu hamburger sur mobile

import { useState, useEffect } from 'react'
// useState  = stocke une valeur qui peut changer (ex: menu ouvert/fermé)
// useEffect = exécute du code après l'affichage (ex: écouter le défilement)

// Les liens du menu, UNE fois : la barre de bureau et le menu du téléphone
// les lisaient chacun dans leur propre liste, et un ajout n'en touchait
// qu'une. « Réseaux » n'y est plus : la place manquait, et le pied de page
// y mène toujours. Contact est à part : c'est le bouton rose, à droite.
const LIENS = [
  { href: '/#about',          label: 'À propos' },
  { href: '/#activites',      label: 'Activités' },
  { href: '/#plus-activites', label: "Plus d'activités" },
  { href: '/#coach',          label: 'Coach' },
  { href: '/#tarifs',         label: 'Tarifs' },
  { href: '/#planning',       label: 'Planning' },
  { href: '/#evenements',     label: 'Stages' },
  { href: '/blog',            label: 'Blog', horsExport: true },
]

/**
 * @param {{enExport?: boolean}} props  vrai pour la copie hors-ligne, où le
 *   blog n'existe pas : son lien serait mort.
 */
export default function Nav({ enExport = false }) {
  const liens = LIENS.filter((l) => !(enExport && l.horsExport))
  const [scrolled, setScrolled] = useState(false)   // false = pas encore défilé
  const [menuOpen, setMenuOpen] = useState(false)   // false = menu mobile fermé

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    // Page ouverte déjà défilée (lien /#tarifs, rechargement) : sans ce
    // premier appel, la nav resterait transparente, texte clair compris,
    // au-dessus d'une section claire — jusqu'au premier coup de molette.
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    // En JSX : className au lieu de class, style={{ }} au lieu de style=""
    <nav id="nav" className={scrolled ? 'scrolled' : ''}>
      <div className="nav-inner">

        <a href="/" className="nav-logo">
          {/* alt vide VOLONTAIREMENT : le nom « M'GYM » est écrit juste à
              côté. Un alt qui le répète le fait lire deux fois par un
              lecteur d'écran. */}
          <img src="/Images/Logo.avif" alt="" />
          <span className="nav-logo-text">M&apos;GYM</span>
        </a>

        <ul className="nav-links">
          {liens.map((l) => <li key={l.href}><a href={l.href}>{l.label}</a></li>)}
          <li><a href="/#contact" className="btn-contact">Contact</a></li>
        </ul>

        {/* Bouton hamburger pour mobile */}
        <button
          className="ham"
          aria-label="Menu"
          aria-expanded={menuOpen}
          aria-controls="mob-menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Menu mobile — affiché uniquement si menuOpen est true */}
      <div id="mob-menu" className={menuOpen ? 'open' : ''}>
        <ul>
          {liens.map((l) => <li key={l.href}><a href={l.href} onClick={closeMenu}>{l.label}</a></li>)}
          <li><a href="/#contact" onClick={closeMenu} className="mob-contact">Contact</a></li>
        </ul>
      </div>
    </nav>
  )
}
