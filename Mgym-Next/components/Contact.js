// Les icônes SVG sont intégrées directement en JSX (pas besoin de bibliothèque)
const contactCards = [
  {
    label: 'Adresse',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    content: <span className="contact-addr">Route de Layrac-sur-Tarn<br />31340 Mirepoix-sur-Tarn</span>,
  },
  {
    label: 'Téléphone',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.17 1.19 2 2 0 012.17 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.34a16 16 0 006.29 6.29l1.41-1.41a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
      </svg>
    ),
    content: <a href="tel:0609316145" className="contact-value">06 09 31 61 45</a>,
  },
  {
    label: 'Email',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    content: <a href="mailto:gym.mirepoix@gmail.com" className="contact-value">gym.mirepoix@gmail.com</a>,
  },
]

export default function Contact() {
  return (
    <section id="contact" className="section-pad">
      <div className="section-max">

        <div className="contact-header sr">
          <p className="section-label">Nous trouver</p>
          <h2 className="section-title">Contacts &amp; <em>Accès</em></h2>
          <div className="divider" />
        </div>

        <div className="contact-cards">
          {contactCards.map((card, i) => (
            <div key={card.label} className={`contact-card sr d${i + 1}`}>
              <div className="contact-icon">{card.icon}</div>
              <div className="contact-label">{card.label}</div>
              {card.content}
            </div>
          ))}
        </div>

        <div className="contact-cta sr">
          <div className="contact-cta-title">
            Prête à <em>commencer</em> ?
          </div>
          <p className="contact-cta-sub">
            Première séance d&apos;essai ou inscription directe —<br />
            Emmanuelle vous accueille avec plaisir.
          </p>
          <div className="cta-btns">
            <a href="tel:0609316145"               className="cta-btn-rose">Appeler</a>
            <a href="mailto:gym.mirepoix@gmail.com" className="cta-btn-outline">Nous écrire</a>
          </div>
        </div>

      </div>
    </section>
  )
}
