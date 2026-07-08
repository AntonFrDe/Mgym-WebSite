// Les données des activités dans un tableau JavaScript.
// C'est une pratique courante en React/Next.js : séparer les DONNÉES du RENDU.
// Si tu veux ajouter une activité, il suffit d'ajouter un objet au tableau.
const activities = [
  {
    name: 'Pilates',
    image: '/Images/StudentSquatting.avif',
    desc: 'Renforcement des muscles profonds de la posture et de l\'abdomen. Soulagement des tensions musculaires, dos fort et souple. Pratiqué avec ballon, lestes et ring cercle.',
    tags: ['Gainage', 'Posture', 'Concentration'],
    delay: 'd1',
  },
  {
    name: 'Yoga',
    image: '/Images/CoachYoga.avif',
    desc: 'Technique ancestrale d\'Inde : par la respiration et les enchaînements de postures adaptés à votre niveau, libérez les tensions et retrouvez mobilité et apaisement.',
    tags: ['Souplesse', 'Apaisement', 'Mobilité'],
    delay: 'd2',
  },
  {
    name: 'Yogilate',
    image: '/Images/coachHelpingChienTTenHauyt.avif',
    imageStyle: { objectPosition: 'center 30%' },
    desc: 'Fusion de pilates et yoga : postures yogiques et répétitions pilates pour un renforcement profond des muscles profonds et un allongement optimal de la posture.',
    tags: ['Renforcement', 'Allongement'],
    delay: 'd3',
  },
  {
    name: 'Gym Bien-être',
    image: '/Images/CoachRenfoPhysique.avif',
    desc: 'Cardio ludique, renforcement musculaire et étirements en une seule séance. Pilates, gym douce et charges. Clôturée par postures d\'équilibre et d\'assouplissement.',
    tags: ['Cardio', 'Tonicité', 'Équilibre'],
    delay: 'd2',
  },
  {
    name: 'Forme & Force',
    image: '/Images/CoachSelfiAllRoom.avif',
    imageStyle: { objectPosition: '20% center' },
    desc: 'Renforcement musculaire ciblé pour tonifier et rétablir les équilibres. Gainage et travail des zones articulaires pour prévenir douleurs et paralysie ostéo-articulaire.',
    tags: ['Tonification', 'Prévention'],
    delay: 'd3',
  },
  {
    name: 'Marche Nordique',
    image: '/Images/MarcheNordique.avif',
    desc: '1h30 à 2h en plein air pour tous les niveaux. Cardiovasculaire, posture, coordination et respiration profonde. L\'activité qui associe nature et bien-être durable.',
    tags: ['Plein air', 'Endurance', 'Tous niveaux'],
    delay: 'd4',
  },
]

export default function Activities() {
  return (
    <section id="activites" className="section-pad">
      <div className="section-max">

        <div className="acts-header sr">
          <p className="section-label">Nos pratiques</p>
          <h2 className="section-title">Méthodes douces &amp; <em>bien-être</em></h2>
          <div className="divider" />
          <p className="lead" style={{ maxWidth: '520px', margin: '0 auto' }}>
            La respiration est au cœur de chaque cours. Chaque pratique est adaptée
            à votre niveau, pour ressentir les bienfaits dès la première séance.
          </p>
        </div>

        <div className="acts-grid">
          {/* .map() = on parcourt le tableau et on crée une carte pour chaque activité */}
          {activities.map((act) => (
            <div key={act.name} className={`act-card sr ${act.delay}`}>
              <div className="act-img-wrap">
                <img
                  src={act.image}
                  alt={act.name}
                  style={act.imageStyle || {}}
                />
                <div className="act-fog">
                  <span>Découvrir →</span>
                </div>
              </div>
              <div className="act-body">
                <h3 className="act-name">{act.name}</h3>
                <p className="act-desc">{act.desc}</p>
                <div className="act-tags">
                  {act.tags.map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="acts-note sr" style={{ marginTop: '1.5rem' }}>
          <p className="section-label" style={{ textAlign: 'center' }}>Explorez aussi</p>
          <h3 className="acts-note-title">
            Méthodes de Gasquet · Gym Hypopressive · <em>Mézière</em>
          </h3>
          <p className="acts-note-sub">
            Activités sur l&apos;équilibre, la mémoire et l&apos;agilité.<br />
            La <strong style={{ color: '#D18B8E' }}>respiration</strong> est absolument au cœur de chaque cours.
          </p>
        </div>

      </div>
    </section>
  )
}
