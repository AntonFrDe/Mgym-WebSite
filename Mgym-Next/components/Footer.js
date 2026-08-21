// Footer.js — le pied de page.
//
// Les liens de navigation reprennent les ancres de Nav.js. Ils restent
// dans le code : ce sont des repères de STRUCTURE, pas du contenu. Les
// rendre modifiables permettrait de pointer vers une section qui n'existe
// pas.


const navLinks = [
  { href: '#about',     label: 'À propos'  },
  { href: '#activites', label: 'Activités' },
  { href: '#coach',     label: 'Coach'     },
  { href: '#tarifs',    label: 'Tarifs'    },
  { href: '#planning',  label: 'Planning'  },
  { href: '#reseaux',   label: 'Réseaux'   },
  { href: '#contact',   label: 'Contact'   },
]

export default function Footer({ site, infos }) {
  const telBrut = (infos.telephone ?? '').replace(/[ .]/g, '')
  const adresseSurUneLigne = (infos.adresse ?? '').split('\n').join(', ')

  return (
    <footer>
      <div className="footer-inner">

        <div>
          <div className="footer-brand">
            <img src="/Images/Logo.avif" alt="M'GYM" />
            <div>
              <div className="footer-brand-name">M&apos;GYM</div>
              <div className="footer-brand-sub">{site.footerBaseline}</div>
            </div>
          </div>
        </div>

        <div>
          <div className="footer-tagline">
            &ldquo;{site.footerSlogan}&rdquo;
            <small>{site.footerMention}</small>
          </div>
        </div>

        <div className="footer-right">
          <nav className="footer-nav">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}>{link.label}</a>
            ))}
          </nav>
          <div className="footer-socials">
            {(infos.reseauxSociaux ?? []).map((reseau) => (
              <a
                key={reseau._key ?? reseau.url}
                href={reseau.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${reseau.nom} M'GYM`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
            ))}
            {infos.email && (
              <a href={`mailto:${infos.email}`} aria-label="Email M'GYM">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </a>
            )}
            {infos.telephone && (
              <a href={`tel:${telBrut}`} aria-label="Téléphone M'GYM">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.17 1.19 2 2 0 012.17 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.34a16 16 0 006.29 6.29l1.41-1.41a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
              </a>
            )}
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        © 2025 M&apos;GYM Association · {adresseSurUneLigne}
        {infos.telephone && ` · ${infos.telephone}`}
        {infos.email && ` · ${infos.email}`}
      </div>
    </footer>
  )
}
