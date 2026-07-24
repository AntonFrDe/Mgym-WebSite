export default function Planning() {
  return (
    <section id="planning" className="section-pad">
      <div className="section-max">

        <div style={{ textAlign: 'center', marginBottom: '3rem' }} className="sr">
          <p className="section-label">Horaires des cours</p>
          <h2 className="section-title">Notre <em>Planning</em></h2>
          <div className="divider" style={{ margin: '1.5rem auto' }} />
          <p className="lead" style={{ maxWidth: '560px', margin: '0 auto' }}>
            Retrouvez ci-dessous l&apos;ensemble des créneaux de la saison. Pour
            toute question sur un cours en particulier, l&apos;équipe M&apos;GYM se
            tient à votre disposition.
          </p>
        </div>

        <div className="sr" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <img src="/Images/Planning.avif" alt="Planning des cours M'GYM" className="planning-img" />
        </div>

        <div className="sr" style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <a href="#contact" className="btn-primary">Une question sur les horaires ?</a>
        </div>

      </div>
    </section>
  )
}
