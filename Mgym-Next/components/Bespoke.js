// À qui s'adressent ces interventions, plutôt que ce qu'elles contiennent :
// les activités proposées sont déjà énumérées dans le paragraphe juste
// au-dessus, les répéter en pastilles n'apportait rien.
const types = ['Particulier', 'Association', 'Entreprise', 'Massage']

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
              organisateur d&apos;évènements, un groupe d&apos;amis ou un particulier,
              nous vous proposons des interventions sur-mesure adaptées à vos
              envies : yoga, Pilates, marche nordique, massages bien-être.
            </p>

            <div className="bespoke-types">
              {types.map((type) => (
                <div key={type} className="bespoke-type">{type}</div>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <a href="tel:0609316145" className="btn-primary" style={{ display: 'inline-block' }}>
                Prendre rendez-vous
              </a>
              {/* TODO M'GYM : déposer la plaquette PDF dans /public/documents/Plaquette-MGYM.pdf pour activer ce lien */}
              <a href="/documents/Plaquette-MGYM.pdf" download className="btn-outline" style={{ display: 'inline-block' }}>
                Télécharger la plaquette
              </a>
            </div>
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
