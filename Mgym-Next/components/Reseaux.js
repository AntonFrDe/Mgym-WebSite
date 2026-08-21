// Reseaux.js — la section « Suivez-nous ».
//
// Une carte par réseau saisi dans « Infos pratiques ». Tant qu'il n'y en a
// qu'un, la grille reste sur une colonne (#reseaux .contact-cards) ; à
// partir de deux, elle s'élargit d'elle-même.
//
// Les cartes réutilisent les styles de la section Contact : c'est la même
// forme et le même rôle, il n'y a aucune raison d'en créer d'autres.

// Chaque réseau a son pictogramme. Une icône inconnue retombe sur celle,
// neutre, du lien : mieux qu'un trou dans la carte.
const PICTOGRAMMES = {
  facebook: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z',
  instagram: 'M12 2c2.7 0 3.1 0 4.1.06 1 .05 1.7.2 2.3.44a4.6 4.6 0 011.7 1.1 4.6 4.6 0 011.1 1.7c.24.6.4 1.3.44 2.3.06 1 .06 1.4.06 4.1s0 3.1-.06 4.1c-.05 1-.2 1.7-.44 2.3a4.9 4.9 0 01-2.8 2.8c-.6.24-1.3.4-2.3.44-1 .06-1.4.06-4.1.06s-3.1 0-4.1-.06c-1-.05-1.7-.2-2.3-.44a4.9 4.9 0 01-2.8-2.8c-.24-.6-.4-1.3-.44-2.3C2 15.1 2 14.7 2 12s0-3.1.06-4.1c.05-1 .2-1.7.44-2.3a4.9 4.9 0 012.8-2.8c.6-.24 1.3-.4 2.3-.44C8.9 2 9.3 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm6.4-.8a1.2 1.2 0 10-2.4 0 1.2 1.2 0 002.4 0zM12 9a3 3 0 110 6 3 3 0 010-6z',
  youtube: 'M23 12s0-3.2-.4-4.7a2.5 2.5 0 00-1.7-1.7C19.4 5.2 12 5.2 12 5.2s-7.4 0-8.9.4a2.5 2.5 0 00-1.7 1.7C1 8.8 1 12 1 12s0 3.2.4 4.7c.2.9.9 1.5 1.7 1.7 1.5.4 8.9.4 8.9.4s7.4 0 8.9-.4a2.5 2.5 0 001.7-1.7c.4-1.5.4-4.7.4-4.7zM9.7 15.3V8.7l6.2 3.3-6.2 3.3z',
  whatsapp: 'M12 2a10 10 0 00-8.6 15L2 22l5.1-1.3A10 10 0 1012 2zm5.8 14.2c-.2.7-1.2 1.3-1.7 1.3-.4 0-1 .1-3.2-.8-2.7-1.1-4.4-3.9-4.5-4-.1-.2-1-1.4-1-2.6s.6-1.8.9-2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.4.5-.3.3c-.1.1-.2.3 0 .5l1.1 1.6c.7.7 1.3 1 1.5 1.1.2.1.4.1.5-.1l.7-.8c.2-.2.3-.2.5-.1l2 1c.2.1.3.2.4.3.1.2.1.8-.1 1.5z',
  lien: 'M10 13a5 5 0 007.5.5l3-3a5 5 0 00-7-7l-1.7 1.7M14 11a5 5 0 00-7.5-.5l-3 3a5 5 0 007 7l1.7-1.7',
}

const NOMS = {
  facebook: 'Facebook', instagram: 'Instagram',
  youtube: 'YouTube', whatsapp: 'WhatsApp',
}

export default function Reseaux({ site, infos }) {
  const reseaux = infos.reseauxSociaux ?? []

  // Aucun réseau saisi : la section entière disparaît plutôt que de
  // laisser un titre au-dessus du vide.
  if (reseaux.length === 0) return null

  return (
    <section id="reseaux" className="section-pad">
      <div className="section-max">

        <div className="contact-header apparition">
          <p className="section-label">{site.reseauxEtiquette}</p>
          <h2 className="section-title">
            {site.reseauxTitre} <em>{site.reseauxTitreItalique}</em>
          </h2>
          <div className="divider" />
        </div>

        <div className="contact-cards">
          {reseaux.map((reseau) => (
            <div key={reseau._key ?? reseau.url} className="contact-card apparition">
              <div className="contact-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d={PICTOGRAMMES[reseau.nom] ?? PICTOGRAMMES.lien} />
                </svg>
              </div>
              <div className="contact-label">{NOMS[reseau.nom] ?? reseau.nom}</div>
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
