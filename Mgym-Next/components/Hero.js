// Hero épuré : H1 + CTAs uniquement.
// Les activités sont communiquées via la bande frosted-glass en bas de l'image.

const activities = ['Pilates', 'Yoga', 'Prestation sur mesure', 'Gym Bien-Être', 'Renforcement Musculaire']

export default function Hero() {
  return (
    <section id="hero">
      <div className="hero-bg" />
      <div className="hero-overlay" />

      <div className="hero-text">
        {/* .hero-anim déclenche l'apparition en fondu ; le décalage de chaque
            élément est réglé en CSS (voir la section HERO de globals.css). */}
        <h1 className="hero-h1">
          <span className="hero-h1-ligne hero-anim">Bougeons</span>
          <em className="hero-anim">ensemble</em>
        </h1>

        <div className="hero-divider hero-anim" />

        <div className="hero-ctas hero-anim">
          <a href="#activites" className="btn-primary">Découvrir les activités</a>
          <a href="#contact"   className="btn-secondary">Nous rejoindre</a>
        </div>
      </div>

      {/* Bande activités en bas : propre, lisible, sans surcharger l'image */}
      <div className="hero-activities hero-anim">
        {activities.map((act) => (
          <span key={act} className="hero-act-pill">{act}</span>
        ))}
      </div>
    </section>
  )
}
