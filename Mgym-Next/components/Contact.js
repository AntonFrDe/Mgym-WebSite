// Contact.js — coordonnées et appel à l'action.
//
// Les trois cartes viennent de « Infos pratiques » : les modifier là-bas
// les met à jour ici ET dans le pied de page. Une carte dont le champ est
// vide n'est pas affichée — mieux qu'une carte « Téléphone » sans numéro.

import LienFormulaire from './LienFormulaire'
import LienItineraire from './LienItineraire'
import TexteRiche from './TexteRiche'
import { Picto } from './pictogrammes'

/**
 * L'adresse du plan OpenStreetMap intégré, centré un peu AU SUD du repère :
 * le bandeau d'adresse couvre le bas de la carte, et le repère doit rester
 * visible au-dessus de lui.
 */
function urlCarte({ lat, lng }) {
  const centre = lat - 0.0012
  const bbox = [lng - 0.008, centre - 0.0045, lng + 0.008, centre + 0.0045].map((n) => n.toFixed(5)).join(',')
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`
}

// Les pictogrammes sont dans le code : ils font partie du dessin, pas du
// contenu. La cliente n'a pas à choisir une icône.
const ICONES = {
  adresse: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  telephone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.17 1.19 2 2 0 012.17 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.34a16 16 0 006.29 6.29l1.41-1.41a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
}

export default function Contact({ site, infos }) {
  const telBrut = (infos.telephone ?? '').replace(/[ .]/g, '')
  const adresseLigne = (infos.adresse ?? '').split('\n').join(', ')
  // Avec la carte, l'adresse est écrite sur son bandeau : la carte
  // « Adresse » ferait doublon.
  const avecCarte = Boolean(infos.positionCarte?.lat && infos.positionCarte?.lng)

  // Une carte par information réellement renseignée.
  const cartes = [
    infos.adresse && !avecCarte && {
      cle: 'adresse', libelle: 'Adresse', icone: ICONES.adresse,
      contenu: (
        <span className="contact-addr">
          {infos.adresse.split('\n').map((ligne, i, tout) => (
            <span key={ligne}>{ligne}{i < tout.length - 1 && <br />}</span>
          ))}
        </span>
      ),
    },
    infos.telephone && {
      cle: 'telephone', libelle: 'Téléphone', icone: ICONES.telephone,
      contenu: <a href={`tel:${telBrut}`} className="contact-value">{infos.telephone}</a>,
    },
    infos.email && {
      cle: 'email', libelle: 'Email', icone: ICONES.email,
      contenu: <a href={`mailto:${infos.email}`} className="contact-value">{infos.email}</a>,
    },
  ].filter(Boolean)

  return (
    <section id="contact" className="section-pad">
      <div className="section-max">

        <div className="contact-header apparition">
          <p className="section-label">{site.contactEtiquette}</p>
          <h2 className="section-title">
            {site.contactTitre} <em>{site.contactTitreItalique}</em>
          </h2>
          <div className="divider" />
        </div>

        {/* LA MINI-CARTE. Un plan, pas une carte interactive : sur un
            téléphone, une carte « vivante » capture le doigt et empêche de
            faire défiler la page. Ici, toucher n'importe où ouvre
            l'itinéraire dans l'application du téléphone (Plans sur iPhone,
            Google Maps ou Waze sur Android) — voir LienItineraire.js.
            Le plan est une iframe OpenStreetMap : ni clé, ni compte, ni
            cookie publicitaire. Autorisée par la CSP (next.config.js). */}
        {avecCarte && (
          <div className="contact-carte apparition">
            <iframe
              className="contact-carte-fond"
              src={urlCarte(infos.positionCarte)}
              title="Plan d'accès"
              loading="lazy"
              tabIndex={-1}
              aria-hidden="true"
            />
            <span className="contact-carte-credit">© OpenStreetMap</span>
            <div className="contact-carte-bandeau">
              <span className="contact-carte-adresse">
                <strong>M&apos;GYM</strong>
                {adresseLigne}
              </span>
              <LienItineraire position={infos.positionCarte} className="contact-carte-bouton">
                <Picto nom="itineraire" taille={18} />
                Itinéraire
              </LienItineraire>
            </div>
          </div>
        )}

        <div className="contact-cards">
          {cartes.map((carte, i) => (
            <div key={carte.cle} className={`contact-card apparition retard-${i + 1}`}>
              <div className="contact-icon">{carte.icone}</div>
              <div className="contact-label">{carte.libelle}</div>
              {carte.contenu}
            </div>
          ))}
        </div>

        <div className="contact-cta apparition">
          <div className="contact-cta-title">
            {/* &nbsp; : espace insécable avant « ? », voir Pricing.js. */}
            {site.contactCtaTitre} <em>{site.contactCtaTitreItalique}</em>&nbsp;?
          </div>
          <TexteRiche valeur={site.contactCtaSousTitre} className="contact-cta-sub" />

          {/* Trois chemins, et chacun annonce où il mène. « S'inscrire »
              seul ne disait pas qu'il ouvrait un formulaire ailleurs :
              c'est la ligne .cta-btns-aide juste en dessous qui le précise,
              plutôt que d'allonger le texte des boutons. */}
          <div className="cta-btns">
            <LienFormulaire lien={infos.lienInscription} className="cta-btn-rose">
              Formulaire d&apos;inscription
            </LienFormulaire>
            {infos.telephone && <a href={`tel:${telBrut}`} className="cta-btn-rose">Appeler</a>}
            {infos.email && <a href={`mailto:${infos.email}`} className="cta-btn-outline">Nous écrire</a>}
          </div>
          {site.contactCtaAide && (
            <p className="cta-btns-aide">{site.contactCtaAide}</p>
          )}
        </div>

      </div>
    </section>
  )
}
