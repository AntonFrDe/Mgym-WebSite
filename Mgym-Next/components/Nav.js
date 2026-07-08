'use client'
// 'use client' obligatoire car on écoute des événements du navigateur :
// - window.scroll → pour changer l'apparence de la nav en défilant
// - onClick → pour ouvrir/fermer le menu hamburger sur mobile

import { useState, useEffect } from 'react'
// useState  = stocke une valeur qui peut changer (ex: menu ouvert/fermé)
// useEffect = exécute du code après l'affichage (ex: écouter le défilement)

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)   // false = pas encore défilé
  const [menuOpen, setMenuOpen] = useState(false)   // false = menu mobile fermé

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    // En JSX : className au lieu de class, style={{ }} au lieu de style=""
    <nav id="nav" className={scrolled ? 'scrolled' : ''}>
      <div className="nav-inner">

        <a href="#hero" className="nav-logo">
          <img src="/Images/Logo.avif" alt="M'GYM" />
          <span className="nav-logo-text">M&apos;GYM</span>
        </a>

        <ul className="nav-links">
          <li><a href="#about">À propos</a></li>
          <li><a href="#activites">Activités</a></li>
          <li><a href="#tarifs">Tarifs</a></li>
          <li><a href="#coach">Coach</a></li>
          <li>
            <div className="nav-social" style={{ marginRight: '.25rem' }}>
              <a href="https://www.facebook.com/" target="_blank" rel="noopener" aria-label="Facebook M'GYM">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
            </div>
          </li>
          <li><a href="#contact" className="btn-contact">Contact</a></li>
        </ul>

        {/* Bouton hamburger pour mobile */}
        <button
          className="ham"
          aria-label="Menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Menu mobile — affiché uniquement si menuOpen est true */}
      <div id="mob-menu" className={menuOpen ? 'open' : ''}>
        <ul>
          <li><a href="#about"     onClick={closeMenu}>À propos</a></li>
          <li><a href="#activites" onClick={closeMenu}>Activités</a></li>
          <li><a href="#tarifs"    onClick={closeMenu}>Tarifs</a></li>
          <li><a href="#coach"     onClick={closeMenu}>Coach</a></li>
          <li><a href="#contact"   onClick={closeMenu} style={{ color: '#D18B8E' }}>Contact</a></li>
        </ul>
      </div>
    </nav>
  )
}
