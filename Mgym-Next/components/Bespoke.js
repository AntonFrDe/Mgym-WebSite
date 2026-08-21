// Bespoke.js — les prestations sur mesure.
//
// Le bouton « Télécharger la plaquette » n'apparaît que si le PDF existe
// réellement dans /public/documents. Vérification faite au BUILD : ce
// composant s'exécute côté serveur, et le site étant pré-généré, elle n'a
// lieu qu'une fois. Sans elle, le bouton menait vers une erreur 404.
//
// POUR ACTIVER LE BOUTON : déposer le PDF à l'emplacement ci-dessous, puis
// relancer `npm run build`. Rien d'autre à modifier.

import fs from 'node:fs'
import path from 'node:path'
import TexteRiche from './TexteRiche'

const CHEMIN_PLAQUETTE = '/documents/Plaquette-MGYM.pdf'
const plaquetteDisponible = fs.existsSync(
  path.join(process.cwd(), 'public', CHEMIN_PLAQUETTE)
)

export default function Bespoke({ site, infos }) {
  return (
    <section id="bespoke" className="section-pad">
      <div className="section-max">
        <div className="bespoke-grid">

          <div className="apparition-gauche">
            <p className="section-label">{site.bespokeEtiquette}</p>
            <h2 className="section-title">
              {site.bespokeTitre} <em>{site.bespokeTitreItalique}</em>
            </h2>
            <div className="divider" />
            <TexteRiche valeur={site.bespokeTexte} className="lead bespoke-texte" />

            <div className="bespoke-types">
              {(site.bespokePublics ?? []).map((type) => (
                <div key={type} className="bespoke-type">{type}</div>
              ))}
            </div>

            <div className="bespoke-actions">
              <a href={`tel:${(infos.telephone ?? '').replace(/[ .]/g, '')}`} className="btn-primary">
                {site.bespokeBouton}
              </a>
              {plaquetteDisponible && (
                <a href={CHEMIN_PLAQUETTE} download className="btn-outline">
                  Télécharger la plaquette
                </a>
              )}
            </div>
          </div>

          <div className="apparition-droite">
            {site.bespokeImage && (
              <img
                src={site.bespokeImage.src}
                alt={site.bespokeImage.alt}
                className="bespoke-img"
              />
            )}
          </div>

        </div>
      </div>
    </section>
  )
}
