// Coach.js — la présentation d'Emmanuelle Franc.
//
// Les diplômes sont listés ci-dessous plutôt qu'écrits dans le JSX : en
// ajouter un se fait en recopiant une ligne, sans toucher à la mise en page.
// `full: true` fait occuper toute la largeur à la pastille — utile pour la
// dernière quand leur nombre est impair, sinon elle reste seule dans sa
// colonne et la grille paraît bancale.
const certifications = [
  { text: 'Diplômée des métiers de la forme', full: false },
  { text: 'Professeure certifiée Pilates',    full: false },
  { text: 'Professeure certifiée Yoga',       full: false },
  { text: 'Instructrice Marche Nordique',     full: false },
  { text: 'Masseuse bien-être',               full: true  },
]

export default function Coach() {
  return (
    <section id="coach" className="section-pad">
      <div className="section-max">
        <div className="coach-grid">

          <div className="coach-img-wrap apparition-gauche">
            <img
              src="/Images/CoachPhoto.webp"
              alt="Emmanuelle Franc — coach M'GYM"
            />
            <div className="coach-deco" />
          </div>

          <div className="apparition-droite">
            <p className="section-label">Votre coach</p>
            <h2 className="section-title coach-titre">
              Emmanuelle<br /><em>Franc</em>
            </h2>
            <div className="divider" />

            <div className="coach-stats">
              <div className="coach-stat">
                <div className="coach-stat-num">+20</div>
                <div className="coach-stat-label">Ans d&apos;expérience</div>
              </div>
              <div className="coach-stat-sep" />
              <div className="coach-stat">
                <div className="coach-stat-num">5</div>
                <div className="coach-stat-label">Disciplines</div>
              </div>
              <div className="coach-stat-sep" />
              <div className="coach-stat">
                <div className="coach-stat-num">40+</div>
                <div className="coach-stat-label">Ans d&apos;asso</div>
              </div>
            </div>

            <p className="lead coach-texte">
              Avec son énergie, Emmanuelle vous accompagne dans votre pratique avec
              des conseils personnalisés. M&apos;GYM est un espace de convivialité et de
              bien-être où prendre soin de soi est un plaisir.
            </p>

            <div className="cert-grid">
              {certifications.map((cert) => (
                <div key={cert.text} className={`cert-item${cert.full ? ' full' : ''}`}>
                  <span className="cert-icon">✦</span>
                  <span className="cert-text">{cert.text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
