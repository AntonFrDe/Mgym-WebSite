// Section fusionnée : description Marche Nordique + grille tarifaire en dessous.

const prices = [
  { name: 'Forfait 10 séances',   sub: 'Valable 3 mois',                                    amount: '80€',  style: '' },
  { name: 'Forfait Parrainage',   sub: '10 séances · 3 mois · vous + votre filleul·e',     amount: '75€',  style: 'featured', badge: 'Offre spéciale' },
  { name: 'Forfait 20 séances',   sub: 'Valable 6 mois',                                    amount: '145€', style: '' },
  { name: 'Tarif à la séance',    sub: 'Sans engagement',                                   amount: '10€',  style: '' },
  { name: 'Prêt de bâtons nordiques', sub: '1ère séance · paire avec gantelets',           amount: '2€',   style: 'dark' },
]

const schedule = [
  { day: 'Mercredi', time: '19h00', delay: 0 },
  { day: 'Vendredi', time: '9h30',  delay: 0.4 },
  { day: 'Samedi',   time: '9h30',  delay: 0.8 },
]

export default function NordicWalking() {
  return (
    <section id="marche" className="section-pad">
      <div className="section-max">

        {/* ── Bloc intro Marche Nordique ── */}
        <div className="marche-grid">

          <img
            src="/Images/CoachMarcheNordique.avif"
            alt="Marche nordique avec Emmanuelle"
            className="marche-img sr-l"
          />

          <div className="sr-r">
            <p className="section-label">Activité phare</p>
            <h2 className="section-title">
              Marche<br /><em>Nordique</em>
            </h2>
            <div className="divider" />

            <div className="level-card">
              <div className="level-title">🌱 Débutant</div>
              <div className="level-desc">
                Séance orientée vers l&apos;apprentissage technique, jeux de mobilité
                et de motricité, promenades et étirements.
              </div>
            </div>
            <div className="level-card">
              <div className="level-title">⚡ Intermédiaire &amp; Confirmé</div>
              <div className="level-desc">
                Séance cardio axée sur vitesse et dénivelé, renforcement musculaire,
                jeux et étirements.
              </div>
            </div>

            <div className="perks-grid">
              {[
                'Être en extérieur, regarder au loin',
                'Améliore la posture',
                'Système cardiovasculaire',
                'Coordination des mouvements',
                'Respiration profonde',
                'Accessible à tous',
              ].map((perk) => (
                <div key={perk} className="perk">{perk}</div>
              ))}
            </div>

            <div className="duration-pill">
              <span className="duration-num">1h30</span>
              <span className="duration-label">à 2h<br />par séance complète</span>
            </div>
          </div>

        </div>

        {/* ── Séparateur ── */}
        <div style={{ height: '1px', background: 'rgba(209,139,142,.2)', margin: '5rem 0' }} />

        {/* ── Tarifs & Planning (intégrés dans cette section) ── */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }} className="sr">
          <p className="section-label">Tarifs &amp; Planning</p>
          <h2 className="section-title">Des formules <em>accessibles</em></h2>
          <div className="divider" style={{ margin: '1.5rem auto' }} />
        </div>

        <div className="tarifs-grid">

          <div className="price-list sr-l">
            {prices.map((p) => (
              <div key={p.name} className={`price-row ${p.style}`}>
                <div>
                  <div className="price-name">
                    {p.name}
                    {p.badge && <span className="price-badge">{p.badge}</span>}
                  </div>
                  <div className="price-sub">{p.sub}</div>
                </div>
                <div className="price-amount">{p.amount}</div>
              </div>
            ))}

            <p className="price-note">
              * Parrainage : amenez un participant prenant aussi le forfait 10 séances
              — vous profitez tous les deux du tarif préférentiel à 75€.
            </p>

            <img src="/Images/Tarif25-26.avif" alt="Tarifs saison 2025-2026" className="tarif-img" />
          </div>

          <div className="sr-r">
            <div className="schedule-box">
              <div className="schedule-title">Planning Marche Nordique</div>

              {schedule.map((s) => (
                <div key={s.day} className="schedule-row">
                  <div className="schedule-day">
                    <div className="dot" style={{ animationDelay: `${s.delay}s` }} />
                    {s.day}
                  </div>
                  <div className="schedule-time">{s.time}</div>
                </div>
              ))}

              <div className="equipment-block">
                <div className="equip-label">Équipement Marche Nordique</div>
                <ul className="equip-list">
                  <li>Bâtons avec <strong>gantelets obligatoires</strong></li>
                  <li>Chaussures de marche type trail</li>
                  <li>Coupe-vent + polaire + tee-shirt + short ou pantalon</li>
                  <li>En hiver : foulard, cache-oreilles ou bonnet et gants</li>
                </ul>
              </div>
            </div>

            <img src="/Images/Planning.avif" alt="Planning des cours M'GYM" className="planning-img" />
          </div>

        </div>

      </div>
    </section>
  )
}
