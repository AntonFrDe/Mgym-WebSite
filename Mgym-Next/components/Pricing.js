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
]

export default function Pricing() {
  return (
    <section id="tarifs" className="section-pad">
      <div className="section-max">

        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }} className="sr">
          <p className="section-label">Tarifs</p>
          <h2 className="section-title">Des formules <em>accessibles</em></h2>
          <div className="divider" style={{ margin: '1.5rem auto' }} />
        </div>

        <div className="price-list sr" style={{ maxWidth: '700px', margin: '0 auto' }}>
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

      </div>
    </section>
  )
}
