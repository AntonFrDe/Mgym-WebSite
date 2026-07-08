// Hero épuré : H1 + CTAs uniquement.
// Les activités sont communiquées via la bande frosted-glass en bas de l'image.

const activities = ['Pilates', 'Yoga', 'Yogilate', 'Marche Nordique', 'Gym Bien-être', 'Massages']

export default function Hero() {
  return (
    <section id="hero">
      <div className="hero-bg" />
      <div className="hero-overlay" />

      <div className="hero-text">
        <h1 className="hero-h1">
          <span className="hero-anim" style={{ display: 'block', animationDelay: '.1s' }}>
            Bougeons
          </span>
          <em className="hero-anim" style={{ animationDelay: '.4s' }}>
            ensemble
          </em>
        </h1>

        <div className="hero-divider hero-anim" style={{ animationDelay: '.7s' }} />

        <div className="hero-ctas hero-anim" style={{ animationDelay: '1s' }}>
          <a href="#activites" className="btn-primary">Découvrir les activités</a>
          <a href="#contact"   className="btn-secondary">Nous rejoindre</a>
        </div>
      </div>

      {/* Bande activités en bas : propre, lisible, sans surcharger l'image */}
      <div className="hero-activities hero-anim" style={{ animationDelay: '1.3s' }}>
        {activities.map((act) => (
          <span key={act} className="hero-act-pill">{act}</span>
        ))}
      </div>
    </section>
  )
}
