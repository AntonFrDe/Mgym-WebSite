import { TELEPHONE } from './liens'
import fs from 'node:fs'
import path from 'node:path'

// À qui s'adressent ces interventions, plutôt que ce qu'elles contiennent :
// les activités proposées sont déjà énumérées dans le paragraphe juste
// au-dessus, les répéter en pastilles n'apportait rien.
const types = ['Particulier', 'Association', 'Entreprise', 'Massage']

// ── Le bouton « Télécharger la plaquette » ──────────────────────
// La plaquette PDF n'a jamais été fournie : le bouton menait donc vers un
// fichier inexistant, et le visiteur tombait sur une erreur. Plutôt que de
// le laisser cassé ou de le supprimer, on vérifie au moment du BUILD si le
// fichier est là. Ce composant s'exécute côté serveur, il peut donc lire le
// disque — et le site étant exporté en pages statiques, cette vérification
// n'a lieu qu'une fois, pas à chaque visite.
//
// POUR ACTIVER LE BOUTON : déposer le PDF à l'emplacement ci-dessous, puis
// relancer `npm run build`. Rien d'autre à modifier.
const CHEMIN_PLAQUETTE = '/documents/Plaquette-MGYM.pdf'
const plaquetteDisponible = fs.existsSync(
  path.join(process.cwd(), 'public', CHEMIN_PLAQUETTE)
)

export default function Bespoke() {
  return (
    <section id="bespoke" className="section-pad">
      <div className="section-max">
        <div className="bespoke-grid">

          <div className="apparition-gauche">
            <p className="section-label">Sur mesure</p>
            <h2 className="section-title">
              Interventions <em>personnalisées</em>
            </h2>
            <div className="divider" />
            <p className="lead bespoke-texte">
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

            <div className="bespoke-actions">
              <a href={`tel:${TELEPHONE}`} className="btn-primary">
                Prendre rendez-vous
              </a>
              {plaquetteDisponible && (
                <a href={CHEMIN_PLAQUETTE} download className="btn-outline">
                  Télécharger la plaquette
                </a>
              )}
            </div>
          </div>

          <div className="apparition-droite">
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
