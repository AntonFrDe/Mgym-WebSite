export default function About() {
  return (
    <section id="about" className="section-pad">
      <div className="section-max">
        <div className="about-grid">

          <div className="about-img-wrap sr-l">
            <img src="/Images/coachHelpingChienTTenHauyt.avif" alt="Cours collectif M'GYM" />
            <div className="about-deco" />
            <div className="about-badge">
              <div className="about-badge-num">+40</div>
              <div className="about-badge-label">Ans d&apos;histoire</div>
            </div>
          </div>

          <div className="sr-r">
            <p className="section-label">Notre histoire</p>
            <h2 className="section-title">
              Une association<br />
              <em>ancrée</em> dans le village
            </h2>
            <div className="divider" />
            <p className="lead" style={{ marginBottom: '1rem' }}>
              Présente à Mirepoix-sur-Tarn depuis les années 80, M&apos;GYM accompagne
              ses adhérents dans une activité physique adaptée à la santé et au
              bien-être. Dès sa création, l&apos;association offrait aux femmes du
              village la gymnastique d&apos;entretien.
            </p>
            <p className="lead">
              Avec le temps, M&apos;GYM a conservé ses valeurs essentielles :{' '}
              <strong style={{ color: '#D18B8E', fontWeight: 600 }}>
                convivialité et lien social
              </strong>
              . Aujourd&apos;hui, des cours accessibles favorisant le mouvement et
              le bien-être, dans une ambiance motivante.
            </p>

            <h3 className="serif" style={{ fontSize: '1.35rem', fontWeight: 500, color: '#4A3B42', margin: '2rem 0 .5rem' }}>
              Adhérer à M&apos;GYM, c&apos;est choisir :
            </h3>
            <ul className="value-list">
              <li>une activité physique bénéfique pour la santé</li>
              <li>un accompagnement professionnel</li>
              <li>une ambiance conviviale</li>
              <li>un lieu de lien social</li>
              <li>la motivation d&apos;un groupe</li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  )
}
