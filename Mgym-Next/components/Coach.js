// Coach.js — la présentation d'Emmanuelle Franc.
//
// Les diplômes et les chiffres-clés viennent du back-office. La règle des
// trois chiffres est portée par le schéma Sanity (avertissement au-delà) :
// le bandeau est dessiné pour trois, deux ou quatre le déséquilibrent.

import { Fragment } from 'react'
import TexteRiche from './TexteRiche'

export default function Coach({ site }) {
  const stats = site.coachStatistiques ?? []

  return (
    <section id="coach" className="section-pad">
      <div className="section-max">
        <div className="coach-grid">

          <div className="coach-img-wrap apparition-gauche">
            {site.coachPhoto && (
              <img src={site.coachPhoto.src} alt={site.coachPhoto.alt} />
            )}
            <div className="coach-deco" />
          </div>

          <div className="apparition-droite">
            <p className="section-label">{site.coachEtiquette}</p>
            <h2 className="section-title coach-titre">
              {site.coachPrenom}<br /><em>{site.coachNom}</em>
            </h2>
            <div className="divider" />

            {stats.length > 0 && (
              <div className="coach-stats">
                {stats.map((stat, i) => (
                  <Fragment key={stat._key ?? stat.libelle}>
                    {i > 0 && <div className="coach-stat-sep" />}
                    <div className="coach-stat">
                      <div className="coach-stat-num">{stat.nombre}</div>
                      <div className="coach-stat-label">{stat.libelle}</div>
                    </div>
                  </Fragment>
                ))}
              </div>
            )}

            <TexteRiche valeur={site.coachTexte} className="lead coach-texte" />

            <div className="cert-grid">
              {(site.coachCertifications ?? []).map((cert, i, tout) => (
                <div
                  key={cert}
                  /* La dernière pastille prend toute la largeur quand leur
                     nombre est impair : seule dans sa colonne, la grille
                     paraîtrait bancale. */
                  className={`cert-item${i === tout.length - 1 && tout.length % 2 === 1 ? ' full' : ''}`}
                >
                  <span className="cert-icon">✦</span>
                  <span className="cert-text">{cert}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
