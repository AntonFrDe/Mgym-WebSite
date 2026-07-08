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

          <div className="coach-img-wrap sr-l">
            <img
              src="/Images/CoachPhoto.webp"
              alt="Emmanuelle Franc — coach M'GYM"
              style={{ objectPosition: 'center 15%' }}
            />
            <div className="coach-deco" />
          </div>

          <div className="sr-r">
            <p className="section-label">Votre coach</p>
            <h2 className="section-title" style={{ lineHeight: 1 }}>
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

            <p className="lead" style={{ marginBottom: '1.5rem' }}>
              Avec son énergie, Emmanuelle vous accompagne dans votre pratique avec
              des conseils personnalisés. M&apos;GYM est un espace de rencontre et de
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
