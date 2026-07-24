export default function Reseaux() {
  return (
    <section id="reseaux" className="section-pad">
      <div className="section-max">

        <div className="contact-header sr">
          <p className="section-label">Suivez-nous</p>
          <h2 className="section-title">Nos <em>Réseaux</em></h2>
          <div className="divider" />
        </div>

        <div className="contact-cards" style={{ maxWidth: '320px', gridTemplateColumns: '1fr' }}>
          <div className="contact-card sr">
            <div className="contact-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
              </svg>
            </div>
            <div className="contact-label">Facebook</div>
            <a href="https://www.facebook.com/" target="_blank" rel="noopener" className="contact-value">
              Suivre M&apos;GYM
            </a>
          </div>
        </div>

      </div>
    </section>
  )
}
