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
//   2. un indice (« Faites glisser du doigt » / « Utilisez les flèches »)
//      s'affiche sous le carrousel et disparaît dès la première
//      interaction (il ne gêne plus après) ;
//   3. une barre de progression + un compteur « 01 / 08 » montrent où
//      l'on se trouve dans la série ;
//   4. deux flèches précédent/suivant pour ceux qui préfèrent cliquer ;
//   5. les flèches du clavier fonctionnent aussi (accessibilité).
//
// RÈGLE : LA MOLETTE VERTICALE N'EST JAMAIS DÉTOURNÉE. Elle fait
// défiler la page, même quand la souris survole les cartes.
// Le carrousel la détournait autrefois vers les cartes : chaque cran
// (≈ 120 px) était aussitôt ramené à la carte de départ par l'aimantation
// (scroll-snap), et la page ne défilait plus non plus — le visiteur
// restait BLOQUÉ tant que sa souris était au-dessus du carrousel.
// Mesuré : six crans de molette, zéro pixel de déplacement.
// Pour parcourir les cartes : le doigt, le geste horizontal du pavé
// tactile (géré nativement par le navigateur), les flèches, le clavier.

import { useCallback, useEffect, useRef, useState } from 'react'
import EnteteActivites from './EnteteActivites'
import TexteRiche from './TexteRiche'

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

export default function CarrouselActivites({ site, activites = [] }) {
  const pisteRef = useRef(null)
  const [indexActif, setIndexActif] = useState(0)
  const [progression, setProgression] = useState(0)   // 0 → 1
  const [auDebut, setAuDebut] = useState(true)
  const [aLaFin, setALaFin] = useState(false)
  const [aInteragi, setAInteragi] = useState(false)
  // Cartes dont la description est dépliée (téléphone uniquement : sur
  // grand écran, le bouton « Lire la suite » est masqué et le texte entier).
  const [ouvertes, setOuvertes] = useState(() => new Set())

  const basculer = (id) => setOuvertes((avant) => {
    const apres = new Set(avant)
    if (apres.has(id)) apres.delete(id)
    else apres.add(id)
    return apres
  })

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
    // Un défilement (doigt, pavé tactile) vaut interaction : l'indice a
    // rempli son rôle, il s'efface.
    if (piste.scrollLeft > TOLERANCE_BOUT) setAInteragi(true)
  }, [activites.length])

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
  }, [activites.length])

  const surTouche = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); allerA(indexActif + 1) }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); allerA(indexActif - 1) }
    else if (e.key === 'Home') { e.preventDefault(); allerA(0) }
    else if (e.key === 'End') { e.preventDefault(); allerA(activites.length - 1) }
  }

  const total = activites.length
  const deuxChiffres = (n) => String(n).padStart(2, '0')

  // Aucune activité : la section disparaît plutôt que d'afficher un
  // carrousel vide avec ses flèches inertes.
  if (total === 0) return null

  return (
    <section id="activites" className="section-pad">
      <div className="section-max">

        {/* Formulation valable pour la souris comme pour le doigt : ce
            chapô ne sait pas sur quel appareil il est lu. */}
        <EnteteActivites site={site} instruction="Faites défiler les cartes, ou utilisez les flèches, pour toutes les découvrir." />

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
              {/* La clé est l'identifiant Sanity, JAMAIS le titre :
                  renommer une activité ne doit pas démonter sa carte. */}
              {activites.map((act, i) => {
                const estOuverte = ouvertes.has(act._id)
                return (
                  <article
                    key={act._id}
                    className={`carte-act${estOuverte ? ' est-ouverte' : ''}`}
                    aria-label={`Activité ${i + 1} sur ${total} : ${act.titre}`}
                  >
                    <div className="carte-act-media">
                      {act.image && (
                        <img src={act.image.src} alt={act.image.alt} loading="lazy" />
                      )}
                      <span className="carte-act-num">{deuxChiffres(i + 1)}</span>
                    </div>

                    <div className="carte-act-corps">
                      <h3>{act.titre}</h3>
                      <p className="carte-act-accroche">{act.descriptionCourte}</p>
                      {/* Sur téléphone, la description est limitée à quatre
                          lignes : entière, elle rendait la carte plus haute
                          que l'écran (733 px pour 600 visibles). Le texte reste
                          TOUJOURS dans le HTML — seul le CSS le coupe —, donc
                          rien n'est perdu pour la copie hors-ligne ni pour
                          Google. build-standalone.js reproduit ce bouton. */}
                      <TexteRiche valeur={act.descriptionRiche} className="carte-act-desc" />
                      <button
                        type="button"
                        className="carte-act-suite"
                        aria-expanded={estOuverte}
                        onClick={() => basculer(act._id)}
                      >
                        {estOuverte ? 'Réduire' : 'Lire la suite'}
                      </button>

                      <div className="carte-act-bas">
                        <div className="carte-act-tags">
                          {(act.motsCles ?? []).map((tag) => (
                            <span key={tag} className="etape-tag">{tag}</span>
                          ))}
                        </div>
                        {act.lienInterne && (
                          <a href={act.lienInterne} className="etape-lien">
                            {act.libelleLien || 'Découvrir en détail →'}
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>

          {/* Indice de départ : disparaît dès la première interaction.
              Les deux formulations sont toujours dans le HTML ; le CSS
              montre la bonne selon l'appareil (souris ou écran tactile). */}
          <p className={`carrousel-indice${aInteragi ? ' est-masque' : ''}`} aria-hidden="true">
            <span>
              <span className="indice-souris">Utilisez les flèches</span>
              <span className="indice-doigt">Faites glisser du doigt</span>
              {` — les ${total} activités défilent ici`}
            </span>
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
