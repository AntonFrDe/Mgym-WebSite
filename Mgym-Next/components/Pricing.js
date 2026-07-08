// Les données tarifaires dans un tableau — facile à modifier sans toucher au HTML
const prices = [
  {
    name: 'Forfait 10 séances',
    sub: 'Valable 3 mois',
    amount: '80€',
    style: '',
  },
  {
    name: 'Forfait Parrainage',
    sub: '10 séances · 3 mois · vous + votre filleul·e',
    amount: '75€',
    style: 'featured',
    badge: 'Offre spéciale',
  },
  {
    name: 'Forfait 20 séances',
    sub: 'Valable 6 mois',
    amount: '145€',
    style: '',
  },
  {
    name: 'Tarif à la séance',
    sub: 'Sans engagement',
    amount: '10€',
    style: '',
  },
  {
    name: 'Prêt de bâtons nordiques',
    sub: '1ère séance uniquement · paire avec gantelets',
    amount: '2€',
    style: 'dark',
  },
]

const schedule = [
  { day: 'Mercredi', time: '19h00', delay: 0 },
  { day: 'Vendredi', time: '9h30',  delay: 0.4 },
  { day: 'Samedi',   time: '9h30',  delay: 0.8 },
]

export default function Pricing() {
  return (
    <section id="tarifs" className="section-pad">
      <div className="section-max">

        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }} className="sr">
          <p className="section-label">Tarifs &amp; Planning</p>
          <h2 className="section-title">Des formules <em>accessibles</em></h2>
          <div className="divider" style={{ margin: '1.5rem auto' }} />
        </div>

        <div className="tarifs-grid">

          {/* Colonne gauche : les tarifs */}
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

          {/* Colonne droite : le planning */}
          <div className="sr-r">
            <div className="schedule-box">
              <div className="schedule-title">Planning &amp; Horaires</div>

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
