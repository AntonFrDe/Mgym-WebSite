// Hero épuré : H1 + CTAs uniquement.
// Les activités sont communiquées via la bande frosted-glass en bas de l'image.
//
// Le contenu vient du CMS (ou du contenu par défaut si le CMS n'est pas
// branché) : voir lib/contenu/index.js. Le composant ne fait qu'afficher.

export default function Hero({ site }) {
  return (
    <section id="hero">
      {/* La photo de fond est posée en style de fond CSS plutôt qu'en
          <img> : elle doit couvrir l'écran et suivre le cadrage choisi
          dans le back-office. C'est la SEULE valeur calculée à
          l'exécution dans ce composant. */}
      <div
        className="hero-bg"
        style={site.heroImage ? { backgroundImage: `url(${site.heroImage.src})` } : undefined}
        role="img"
        aria-label={site.heroImage?.alt || ''}
      />
      <div className="hero-overlay" />

      <div className="hero-text">
        {/* .hero-anim déclenche l'apparition en fondu ; le décalage de chaque
            élément est réglé en CSS (voir la section HERO de globals.css). */}
        <h1 className="hero-h1">
          <span className="hero-h1-ligne hero-anim">{site.heroTitre}</span>
          <em className="hero-anim">{site.heroTitreItalique}</em>
        </h1>

        <div className="hero-divider hero-anim" />

        <div className="hero-ctas hero-anim">
          <a href="#activites" className="btn-primary">{site.heroBoutonActivites}</a>
          <a href="#contact"   className="btn-secondary">{site.heroBoutonContact}</a>
        </div>
      </div>

      {/* Bande activités en bas : propre, lisible, sans surcharger l'image */}
      <div className="hero-activities hero-anim">
        {(site.heroActivites ?? []).map((act) => (
          <span key={act} className="hero-act-pill">{act}</span>
        ))}
      </div>
    </section>
  )
}
