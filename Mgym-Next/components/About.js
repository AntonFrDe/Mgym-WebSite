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
              Depuis les années 80, M&apos;GYM fait bouger Mirepoix-sur-Tarn en
              plaçant la santé, le bien-être et la convivialité au cœur de ses
              activités. À ses débuts, l&apos;association proposait des cours de
              gymnastique d&apos;entretien aux femmes du village. Aujourd&apos;hui,
              elle accueille toutes celles et tous ceux qui souhaitent pratiquer
              une activité physique dans une ambiance chaleureuse et motivante.
            </p>

            <h3 className="serif" style={{ fontSize: '1.35rem', fontWeight: 500, color: '#4A3B42', margin: '2rem 0 .5rem' }}>
              Rejoindre M&apos;GYM, c&apos;est profiter :
            </h3>
            <ul className="value-list">
              <li>d&apos;une activité physique bénéfique pour le corps et le mental</li>
              <li>d&apos;un accompagnement professionnel et personnalisé</li>
              <li>de cours accessibles à tous les niveaux</li>
              <li>d&apos;une ambiance conviviale et bienveillante</li>
              <li>d&apos;un véritable lieu de partage et de lien social</li>
            </ul>

            {/* Les mots mis en avant en rose (.accent) sont ceux que la
                cliente veut voir ressortir : ce que l'on ressent, pas le nom
                de la coach — elle a déjà sa propre section plus bas. */}
            <p className="lead" style={{ marginTop: '1.5rem' }}>
              Coach sportive diplômée d&apos;État, Emmanuelle Franc vous
              accompagne avec <strong className="accent">passion</strong> pour
              vous aider à bouger, progresser et{' '}
              <strong className="accent">prendre soin de vous</strong>, à votre
              rythme. Chez M&apos;GYM, le bien-être se vit autant dans le
              mouvement que dans le plaisir de{' '}
              <strong className="accent">bouger ensemble</strong>.
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}
