const types = ['Yoga', 'Pilates', 'Marche Nordique', 'Massages bien-être']

export default function Bespoke() {
  return (
    <section id="bespoke" className="section-pad">
      <div className="section-max">
        <div className="bespoke-grid">

          <div className="sr-l">
            <p className="section-label">Sur mesure</p>
            <h2 className="section-title">
              Interventions <em>personnalisées</em>
            </h2>
            <div className="divider" />
            <p className="lead" style={{ marginBottom: '1.5rem' }}>
              Que vous soyez une association, un comité d&apos;entreprise, un
              organisateur d&apos;événements, un groupe d&apos;amis ou un particulier —
              des interventions adaptées à vos envies.
            </p>

            <div className="bespoke-types">
              {types.map((type) => (
                <div key={type} className="bespoke-type">{type}</div>
              ))}
            </div>

            <a href="tel:0609316145" className="btn-primary" style={{ display: 'inline-block' }}>
              Prendre rendez-vous
            </a>
          </div>

          <div className="sr-r">
            <img
              src="/Images/CoachMassage.avif"
              alt="Massages bien-être M'GYM"
              className="bespoke-img"
            />
          </div>

        </div>
      </div>
    </section>
  )
}
