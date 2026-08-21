// Outdoor.js — le bloc « Explorez aussi » qui prolonge la section Activités.
//
// Pourquoi une section à part et non un ajout dans SentierActivites.js /
// CarrouselActivites.js : ces deux composants sont deux AFFICHAGES du même
// tableau d'activités. La marche nordique n'est pas une 9e activité de ce
// tableau, c'est une invitation à côté. En faire une section indépendante
// évite de la dupliquer dans les deux affichages.
//
// Le fond est volontairement le même rose (var(--rose-clair)) que #activites :
// les deux blocs se lisent comme un seul, et surtout l'alternance crème/rose
// des sections suivantes (Prestations, Coach, Tarifs…) reste intacte.

import TexteRiche from './TexteRiche'

export default function Outdoor({ site }) {
  return (
    <section id="outdoor" className="section-pad">
      <div className="section-max">
        <div className="outdoor-grid">

          <div className="apparition-gauche">
            {site.outdoorImage && (
              <img
                src={site.outdoorImage.src}
                alt={site.outdoorImage.alt}
                className="outdoor-img"
                loading="lazy"
              />
            )}
          </div>

          <div className="apparition-droite">
            <p className="section-label">{site.outdoorEtiquette}</p>
            <h2 className="section-title">
              {site.outdoorTitre}<br />
              {site.outdoorTitreSuite} <em>{site.outdoorTitreItalique}</em>
            </h2>
            <div className="divider" />
            <TexteRiche valeur={site.outdoorTexte} className="lead outdoor-texte" />

            <div className="outdoor-tags">
              {(site.outdoorMotsCles ?? []).map((mot) => (
                <span key={mot} className="etape-tag">{mot}</span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
