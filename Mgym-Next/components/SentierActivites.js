'use client'
// 'use client' obligatoire : IntersectionObserver, scroll, état de clic.

import { useEffect, useMemo, useRef, useState } from 'react'
import EnteteActivites from './EnteteActivites'
import TexteRiche from './TexteRiche'

// Les activités arrivent en PROPS, déjà chargées par app/page.js. Elles
// sont donc présentes au tout premier rendu : c'est ce qui protège les
// animations. Un composant qui les récupérerait lui-même se remonterait
// après coup, et les étapes repasseraient invisibles.

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


// ── Trace le chemin au scroll (stroke-dashoffset), sans dépendance
// externe. Respecte prefers-reduced-motion en affichant le trait
// complet d'emblée et en coupant l'écouteur de scroll.
function useTraceAuScroll(pathRef, wrapRef, signature) {
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
    // `signature` change quand le nombre d'activités change : sans elle,
    // l'effet ne se rejouerait pas et strokeDasharray resterait calculé
    // sur l'ancienne longueur de chemin.
  }, [pathRef, wrapRef, signature])
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
        {activite.image && (
          <img src={activite.image.src} alt={activite.image.alt} loading="lazy" />
        )}
      </div>

      <div className="etape-contenu">
        <span className="etape-num">{String(index + 1).padStart(2, '0')}</span>
        <h3>{activite.titre}</h3>
        <p className="etape-accroche">{activite.descriptionCourte}</p>

        <button
          type="button"
          className="etape-toggle"
          aria-expanded={estOuvert}
          aria-controls={panneauId}
          onClick={() => setEstOuvert((v) => !v)}
        >
          {/* Le libellé est dans un <span> identifiable : le JS du fichier
              autonome (build-standalone.js) doit pouvoir le réécrire sans
              toucher au <svg> voisin. */}
          <span className="etape-toggle-libelle">
            {estOuvert ? 'Réduire' : 'En savoir plus'}
          </span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M1 3.5L5 7.5L9 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Le panneau est TOUJOURS dans le HTML, simplement masqué par
            l'attribut `hidden`. On ne le monte pas conditionnellement, sinon
            il serait absent du HTML exporté (où estOuvert vaut false), et la
            version autonome livrée à la cliente n'aurait aucune description
            d'activité — bouton « En savoir plus » sans contenu derrière.
            React et le JS inline basculent donc exactement le même attribut. */}
        <div id={panneauId} className="etape-panneau" hidden={!estOuvert}>
          <TexteRiche valeur={activite.descriptionRiche} />
          <div className="etape-tags">
            {(activite.motsCles ?? []).map((tag) => (
              <span key={tag} className="etape-tag">{tag}</span>
            ))}
          </div>
          {activite.lienInterne && (
            <a href={activite.lienInterne} className="etape-lien">
              {activite.libelleLien || 'Découvrir en détail →'}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SentierActivites({ site, activites = [] }) {
  const pathRef = useRef(null)
  const wrapRef = useRef(null)

  // Le chemin est recalculé si le nombre d'activités change — 8 -> 7 quand
  // la cliente en désactive une, 8 -> 9 quand elle en ajoute une.
  const sentier = useMemo(() => buildPath(activites.length), [activites.length])

  useTraceAuScroll(pathRef, wrapRef, activites.length)

  // Aucune activité : la section entière disparaît plutôt que d'afficher
  // un titre au-dessus d'un chemin vide.
  if (activites.length === 0) return null

  return (
    <section id="activites" className="section-pad">
      <div className="section-max">

        <EnteteActivites site={site} instruction="Cliquez sur une étape pour en découvrir tous les bienfaits." />

        <div className="activites-sentier" ref={wrapRef}>
          <svg
            className="sentier-trait"
            viewBox={`0 0 ${sentier.width} ${sentier.height}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {/* La couleur du trait est en CSS (.sentier-trait path) et non
                ici : un attribut SVG ne sait pas lire var(--rose). */}
            <path
              ref={pathRef}
              d={sentier.d}
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          {/* La clé est l'identifiant Sanity, JAMAIS le titre. Avec
              key={act.titre}, corriger une faute dans un nom changerait la
              clé : React démonterait l'étape et la remonterait avec
              estVisible à false — elle disparaîtrait pour un visiteur ayant
              déjà défilé. C'est le bug d'animation documenté du projet. */}
          {activites.map((act, i) => (
            <Etape key={act._id} activite={act} index={i} />
          ))}
        </div>

      </div>
    </section>
  )
}
