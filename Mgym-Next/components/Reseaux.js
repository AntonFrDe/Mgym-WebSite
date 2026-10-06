// Reseaux.js — la section « Suivez-nous ».
//
// Une carte par réseau saisi dans « Infos pratiques ». Tant qu'il n'y en a
// qu'un, la grille reste sur une colonne (#reseaux .contact-cards) ; à
// partir de deux, elle s'élargit d'elle-même.
//
// Les cartes réutilisent les styles de la section Contact : c'est la même
// forme et le même rôle, il n'y a aucune raison d'en créer d'autres.

// Les logos des réseaux vivent dans pictogrammes.js, partagés avec le pied
// de page. Un réseau inconnu retombe sur le maillon : mieux qu'un trou.
import { LogoReseau, NOMS_RESEAUX } from './pictogrammes'

export default function Reseaux({ site, infos }) {
  const reseaux = infos.reseauxSociaux ?? []

  // Aucun réseau saisi : la section entière disparaît plutôt que de
  // laisser un titre au-dessus du vide.
  if (reseaux.length === 0) return null

  return (
    <section id="reseaux" className="section-pad">
      <div className="section-max">

        <div className="contact-header apparition">
          <h2 className="section-title">
            {site.reseauxTitre} <em>{site.reseauxTitreItalique}</em>
          </h2>
          <div className="divider" />
        </div>

        <div className="contact-cards">
          {reseaux.map((reseau) => (
            <div key={reseau._key ?? reseau.url} className="contact-card apparition">
              <div className="contact-icon">
                <LogoReseau nom={reseau.nom} taille={16} />
              </div>
              <div className="contact-label">{NOMS_RESEAUX[reseau.nom] ?? reseau.nom}</div>
              <a
                href={reseau.url}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-value"
              >
                {reseau.libelle || 'Voir la page'}
              </a>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
