// About.js — « Notre histoire », la première section après le manifeste.
//
// Tout le texte vient du back-office. Les mots mis en avant en rose sont
// ceux que la cliente passe en GRAS dans l'éditeur : le composant de rendu
// (TexteRiche) traduit « gras » en classe .accent. Elle n'a donc pas à
// connaître de code couleur, et ne peut pas en choisir un autre.

import TexteRiche from './TexteRiche'

export default function About({ site }) {
  return (
    <section id="about" className="section-pad">
      <div className="section-max">
        <div className="about-grid">

          <div className="about-img-wrap apparition-gauche">
            {site.aProposPhoto && (
              <img src={site.aProposPhoto.src} alt={site.aProposPhoto.alt} />
            )}
            <div className="about-deco" />
            {site.aProposBadgeNombre && (
              <div className="about-badge">
                <div className="about-badge-num">{site.aProposBadgeNombre}</div>
                <div className="about-badge-label">{site.aProposBadgeLibelle}</div>
              </div>
            )}
          </div>

          <div className="apparition-droite">
            <p className="section-label">{site.aProposEtiquette}</p>
            <h2 className="section-title">
              {site.aProposTitre}<br />
              <em>{site.aProposTitreItalique}</em> {site.aProposTitreFin}
            </h2>
            <div className="divider" />
            <TexteRiche valeur={site.aProposTexte} className="lead about-intro" />

            <h3 className="about-sous-titre">{site.aProposAvantagesTitre}</h3>
            <ul className="value-list">
              {(site.aProposAvantages ?? []).map((avantage) => (
                <li key={avantage}>{avantage}</li>
              ))}
            </ul>

            <TexteRiche valeur={site.aProposConclusion} className="lead about-conclusion" />
          </div>

        </div>
      </div>
    </section>
  )
}
