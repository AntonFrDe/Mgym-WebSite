// Hero épuré : H1 + CTAs uniquement.
// Les activités sont nommées dans la bande en bas de l'image : une simple
// liste, pas des boutons (rien n'y est cliquable, rien ne doit le laisser
// croire).
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
        /* Marque le repli local : le CSS peut alors servir une version
           allégée sur téléphone. Une image venue du CMS est déjà
           redimensionnée par le CDN, elle n'en a pas besoin. */
        data-repli={site.heroImage?.src?.startsWith('/fond1') ? '1' : undefined}
        role="img"
        aria-label={site.heroImage?.alt || ''}
      />
      <div className="hero-overlay" />

      <div className="hero-text">
        {/* .hero-anim déclenche l'apparition en fondu ; le décalage de chaque
            élément est réglé en CSS (voir la section HERO de globals.css). */}
        <h1 className="hero-h1">
          <span className="hero-h1-ligne hero-anim">{site.heroTitre}</span>
          {/* L'espace compte : sans elle, le titre lu par un lecteur
              d'écran (et par Google) était « Bougeonsensemble ». Le
              retour à la ligne, lui, vient du CSS. */}
          {' '}
          <em className="hero-anim">{site.heroTitreItalique}</em>
        </h1>

        <div className="hero-divider hero-anim" />

        <div className="hero-ctas hero-anim">
          <a href="#activites" className="btn-primary">{site.heroBoutonActivites}</a>
          <a href="#contact"   className="btn-secondary">{site.heroBoutonContact}</a>
        </div>
      </div>

      {/* Bande activités en bas : une liste de mots, pas des boutons. */}
      <ul className="hero-activities hero-anim" aria-label="Nos activités">
        {(site.heroActivites ?? []).map((act) => (
          <li key={act} className="hero-act-pill">{act}</li>
        ))}
      </ul>
    </section>
  )
}
