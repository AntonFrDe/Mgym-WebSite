'use client'
// 'use client' obligatoire : IntersectionObserver, scroll, état de clic.

import { useEffect, useRef, useState } from 'react'
import { activites as activities } from './activitesData'

// Les données vivent dans activitesData.js : le sentier et le carrousel
// affichent exactement les mêmes 8 activités.

// ── Tracé du chemin ────────────────────────────────────────────
// Génère un chemin en S qui relie N points en alternant gauche/droite,
// avec des tangentes verticales à chaque étape pour une courbe fluide.
// Le viewBox fait 860 de large, comme .activites-sentier en CSS : les
// étapes gauche/droite font chacune jusqu'à 560 de large (voir CSS),
// avec un médaillon de 130 sur leur bord extérieur — donc xLeft=65
// (centre du médaillon gauche) et xRight=795 (centre du médaillon
// droit, à 860-65) gardent le tracé aligné sur les photos.
function buildPath(n, { width = 860, segH = 230, topPad = 60, xLeft = 65, xRight = 795 } = {}) {
  const pts = Array.from({ length: n }, (_, i) => ({
    x: i % 2 === 0 ? xLeft : xRight,
    y: topPad + i * segH,
  }))
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]
    const b = pts[i + 1]
    d += ` C ${a.x} ${a.y + segH * 0.55}, ${b.x} ${b.y - segH * 0.55}, ${b.x} ${b.y}`
  }
  return { d, width, height: topPad * 2 + segH * (n - 1) }
}

const SENTIER = buildPath(activities.length)

// ── Trace le chemin au scroll (stroke-dashoffset), sans dépendance
// externe. Respecte prefers-reduced-motion en affichant le trait
// complet d'emblée et en coupant l'écouteur de scroll.
function useTraceAuScroll(pathRef, wrapRef) {
  useEffect(() => {
    const path = pathRef.current
    const wrap = wrapRef.current
    if (!path || !wrap) return

    const longueur = path.getTotalLength()
    path.style.strokeDasharray = String(longueur)

    const reduitMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduitMotion) {
      path.style.strokeDashoffset = '0'
      return
    }

    path.style.strokeDashoffset = String(longueur)

    let ticking = false
    const update = () => {
      ticking = false
      const rect = wrap.getBoundingClientRect()
      const progression = Math.min(
        Math.max((window.innerHeight - rect.top) / (rect.height + window.innerHeight), 0),
        1
      )
      path.style.strokeDashoffset = String(longueur * (1 - progression))
    }
    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(update)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathRef, wrapRef])
}

// ── Une étape du sentier ───────────────────────────────────────
// estOuvert (clic) et estVisible (scroll) sont deux states SÉPARÉS,
// chacun géré par sa propre source (l'utilisateur / l'observer) et
// jamais réinitialisé par l'autre : c'est ce qui évite le bug déjà
// rencontré sur l'accordéon, où le clic effaçait la classe posée par
// l'observer de scroll.
function Etape({ activite, index }) {
  const [estOuvert, setEstOuvert] = useState(false)
  const [estVisible, setEstVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setEstVisible(true)
      return
    }
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEstVisible(true) // jamais remis à false : le clic ne touche jamais ce state
          observer.unobserve(el)
        }
      },
      { threshold: 0.25, rootMargin: '0px 0px -60px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const cote = index % 2 === 0 ? 'gauche' : 'droite'
  const panneauId = `etape-panneau-${index}`

  return (
    <div ref={ref} className={`etape etape--${cote}${estVisible ? ' est-visible' : ''}`}>
      <div className="etape-media">
        <img src={activite.image} alt={activite.name} loading="lazy" />
      </div>

      <div className="etape-contenu">
        <span className="etape-num">{String(index + 1).padStart(2, '0')}</span>
        <h3>{activite.name}</h3>
        <p className="etape-accroche">{activite.accroche}</p>

        <button
          type="button"
          className="etape-toggle"
          aria-expanded={estOuvert}
          aria-controls={panneauId}
          onClick={() => setEstOuvert((v) => !v)}
        >
          {estOuvert ? 'Réduire' : 'En savoir plus'}
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M1 3.5L5 7.5L9 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {estOuvert && (
          <div id={panneauId} className="etape-panneau">
            <p>{activite.desc}</p>
            <div className="etape-tags">
              {activite.tags.map((tag) => (
                <span key={tag} className="etape-tag">{tag}</span>
              ))}
            </div>
            {activite.href && (
              <a href={activite.href} className="etape-lien">Découvrir en détail →</a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SentierActivites() {
  const pathRef = useRef(null)
  const wrapRef = useRef(null)
  useTraceAuScroll(pathRef, wrapRef)

  return (
    <section id="activites" className="section-pad">
      <div className="section-max">

        <div className="acts-header sr">
          <p className="section-label">Nos pratiques</p>
          <h2 className="section-title">Méthodes douces &amp; <em>bien-être</em></h2>
          <div className="divider" />
          <p className="lead" style={{ maxWidth: '520px', margin: '0 auto' }}>
            Suivez le chemin, une activité à la fois. Cliquez sur une étape pour
            en découvrir tous les bienfaits.
          </p>
        </div>

        <div className="activites-sentier" ref={wrapRef}>
          <svg
            className="sentier-trait"
            viewBox={`0 0 ${SENTIER.width} ${SENTIER.height}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              ref={pathRef}
              d={SENTIER.d}
              fill="none"
              stroke="#D18B8E"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          {activities.map((act, i) => (
            <Etape key={act.name} activite={act} index={i} />
          ))}
        </div>

      </div>
    </section>
  )
}
