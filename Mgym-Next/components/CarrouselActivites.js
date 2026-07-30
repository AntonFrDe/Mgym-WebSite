'use client'
// CarrouselActivites.js — VERSION TEST (branche teste-template).
//
// Les 8 activités sont présentées sous forme de cartes qui défilent à
// l'HORIZONTALE. On ne voit jamais les 8 cartes en même temps : c'est
// volontaire, la carte suivante est toujours coupée par le bord droit
// pour signaler « il y en a d'autres » (principe du "peek").
//
// ERGONOMIE — comment l'utilisateur comprend qu'il faut faire défiler :
//   1. une carte est toujours tronquée sur le bord droit (peek) ;
//   2. un indice « Molette ou glissez » clignote sous le carrousel et
//      disparaît dès la première interaction (il ne gêne plus après) ;
//   3. une barre de progression + un compteur « 01 / 08 » montrent où
//      l'on se trouve dans la série ;
//   4. deux flèches précédent/suivant pour ceux qui préfèrent cliquer ;
//   5. les flèches du clavier fonctionnent aussi (accessibilité).
//
// RÈGLE IMPORTANTE sur la molette : on ne « capture » la molette que
// tant qu'il reste des cartes à voir dans la direction demandée. Arrivé
// au bout, on rend la main au défilement vertical de la page — sinon
// l'utilisateur se retrouve piégé dans la section, ce qui est le défaut
// classique de ce genre de carrousel.

import { useCallback, useEffect, useRef, useState } from 'react'
import { activites } from './activitesData'

// deltaMode === 1 : la molette envoie des LIGNES et non des pixels
// (Firefox surtout). 32px ≈ une ligne, valeur usuelle.
const PIXELS_PAR_LIGNE = 32
// Marge de tolérance pour décider qu'on est arrivé en bout de piste.
const TOLERANCE_BOUT = 2

function prefereMoinsAnimation() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Largeur d'un « pas » = largeur d'une carte + espace entre deux cartes.
// Mesurée dans le DOM plutôt que codée en dur : le CSS reste la seule
// source de vérité pour les dimensions, y compris en responsive.
function pasDeDefilement(piste) {
  const carte = piste.querySelector('.carte-act')
  if (!carte) return piste.clientWidth
  const espace = parseFloat(getComputedStyle(piste).columnGap) || 0
  return carte.offsetWidth + espace
}

export default function CarrouselActivites() {
  const pisteRef = useRef(null)
  const [indexActif, setIndexActif] = useState(0)
  const [progression, setProgression] = useState(0)   // 0 → 1
  const [auDebut, setAuDebut] = useState(true)
  const [aLaFin, setALaFin] = useState(false)
  const [aInteragi, setAInteragi] = useState(false)

  // Recalcule tout ce qui dépend de la position de défilement.
  const majEtat = useCallback(() => {
    const piste = pisteRef.current
    if (!piste) return
    const max = piste.scrollWidth - piste.clientWidth
    const pas = pasDeDefilement(piste)
    setProgression(max > 0 ? piste.scrollLeft / max : 0)
    setIndexActif(Math.min(activites.length - 1, Math.round(piste.scrollLeft / pas)))
    setAuDebut(piste.scrollLeft <= TOLERANCE_BOUT)
    setALaFin(piste.scrollLeft >= max - TOLERANCE_BOUT)
  }, [])

  // Molette → défilement horizontal, avec relâchement en bout de piste.
  // Écouteur natif (et non prop onWheel) car React pose ses écouteurs
  // `wheel` en mode passif : preventDefault() y serait sans effet.
  useEffect(() => {
    const piste = pisteRef.current
    if (!piste) return

    const surMolette = (e) => {
      // Geste horizontal (trackpad, souris à molette latérale) :
      // le navigateur le gère déjà correctement, on ne s'en mêle pas.
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return

      const max = piste.scrollWidth - piste.clientWidth
      if (max <= 0) return

      const versLaFin = e.deltaY > 0
      const enBout = versLaFin
        ? piste.scrollLeft >= max - TOLERANCE_BOUT
        : piste.scrollLeft <= TOLERANCE_BOUT
      if (enBout) return // on rend la main au défilement vertical de la page

      e.preventDefault()
      piste.scrollLeft += e.deltaMode === 1 ? e.deltaY * PIXELS_PAR_LIGNE : e.deltaY
      setAInteragi(true)
    }

    piste.addEventListener('wheel', surMolette, { passive: false })
    return () => piste.removeEventListener('wheel', surMolette)
  }, [])

  // Une largeur de fenêtre différente change la largeur des cartes :
  // il faut recalculer l'index actif et la progression.
  useEffect(() => {
    majEtat()
    window.addEventListener('resize', majEtat)
    return () => window.removeEventListener('resize', majEtat)
  }, [majEtat])

  const allerA = useCallback((cible) => {
    const piste = pisteRef.current
    if (!piste) return
    const borne = Math.max(0, Math.min(activites.length - 1, cible))
    piste.scrollTo({
      left: borne * pasDeDefilement(piste),
      behavior: prefereMoinsAnimation() ? 'auto' : 'smooth',
    })
    setAInteragi(true)
  }, [])

  const surTouche = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); allerA(indexActif + 1) }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); allerA(indexActif - 1) }
    else if (e.key === 'Home') { e.preventDefault(); allerA(0) }
    else if (e.key === 'End') { e.preventDefault(); allerA(activites.length - 1) }
  }

  const total = activites.length
  const deuxChiffres = (n) => String(n).padStart(2, '0')

  return (
    <section id="activites" className="section-pad">
      <div className="section-max">

        <div className="acts-header sr">
          <p className="section-label">Nos pratiques</p>
          <h2 className="section-title">Méthodes douces &amp; <em>bien-être</em></h2>
          <div className="divider" />
          <p className="lead" style={{ maxWidth: '540px', margin: '0 auto' }}>
            Huit façons de prendre soin de vous. Faites défiler les cartes
            à la molette, au doigt ou avec les flèches pour toutes les
            découvrir.
          </p>
        </div>

        <div className={`carrousel${auDebut ? ' est-au-debut' : ''}${aLaFin ? ' est-a-la-fin' : ''}`}>

          {/* .carrousel-scene porte les dégradés de bord : ils doivent
              couvrir la piste, pas la barre de commandes en dessous. */}
          <div className="carrousel-scene">
            <div
              ref={pisteRef}
              className="carrousel-piste"
              role="group"
              aria-roledescription="carrousel"
              aria-label="Les activités M'GYM"
              tabIndex={0}
              onScroll={majEtat}
              onKeyDown={surTouche}
              onPointerDown={() => setAInteragi(true)}
            >
              {activites.map((act, i) => (
                <article
                  key={act.name}
                  className="carte-act"
                  aria-label={`Activité ${i + 1} sur ${total} : ${act.name}`}
                >
                  <div className="carte-act-media">
                    <img src={act.image} alt={act.name} loading="lazy" />
                    <span className="carte-act-num">{deuxChiffres(i + 1)}</span>
                  </div>

                  <div className="carte-act-corps">
                    <h3>{act.name}</h3>
                    <p className="carte-act-accroche">{act.accroche}</p>
                    <p className="carte-act-desc">{act.desc}</p>

                    <div className="carte-act-bas">
                      <div className="carte-act-tags">
                        {act.tags.map((tag) => (
                          <span key={tag} className="etape-tag">{tag}</span>
                        ))}
                      </div>
                      {act.href && (
                        <a href={act.href} className="etape-lien">Découvrir en détail →</a>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Indice de départ : disparaît dès la première interaction */}
          <p className={`carrousel-indice${aInteragi ? ' est-masque' : ''}`} aria-hidden="true">
            <span className="carrousel-indice-molette" />
            Molette, doigt ou flèches — les 8 activités défilent ici
          </p>

          {/* Barre de position + commandes */}
          <div className="carrousel-commandes">
            <div className="carrousel-rail" aria-hidden="true">
              <span
                className="carrousel-jauge"
                style={{ transform: `scaleX(${Math.max(progression, 0.06)})` }}
              />
            </div>

            <p className="carrousel-compteur" aria-live="polite">
              <strong>{deuxChiffres(indexActif + 1)}</strong> / {deuxChiffres(total)}
            </p>

            <div className="carrousel-fleches">
              <button
                type="button"
                className="carrousel-fleche"
                onClick={() => allerA(indexActif - 1)}
                disabled={auDebut}
                aria-label="Activité précédente"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                className="carrousel-fleche"
                onClick={() => allerA(indexActif + 1)}
                disabled={aLaFin}
                aria-label="Activité suivante"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
