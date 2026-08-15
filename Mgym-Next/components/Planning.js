import { LIEN_STAGES, attributsLienExterne } from './liens'

// Planning.js — les créneaux de la saison.
//
// Le planning était une capture d'écran (Planning.avif) : impossible à
// mettre à jour sans refaire l'image, illisible sur téléphone, invisible
// pour un lecteur d'écran et rien n'y était cliquable. Il est désormais
// écrit en HTML, à partir des deux tableaux ci-dessous.
//
// POUR MODIFIER UN CRÉNEAU : tout se passe dans `planning`, plus bas.
// Un jour sans cours à ce moment de la journée = on n'écrit rien, la
// case reste vide.

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi']

const SAISON = 'Saison 2025 — 2026'

// Les créneaux, regroupés par moment de la journée plutôt que par heure
// exacte : les horaires diffèrent d'un jour à l'autre (19h00 le mardi,
// 19h15 le lundi), un tableau aligné à l'heure près obligerait à inventer
// des lignes vides.
const planning = [
  {
    moment: 'Matin',
    cours: {
      Lundi: [{ heure: '09h30', nom: 'Gym Bien-être' }],
      Mercredi: [{ heure: '09h30', nom: 'Gym Bien-être' }],
    },
  },
  {
    moment: 'Midi',
    cours: {
      Lundi: [{ heure: '12h30', nom: 'Yogilate' }],
      Mercredi: [{ heure: '12h30', nom: 'Pilates' }],
    },
  },
  {
    moment: 'Soir',
    cours: {
      Lundi: [
        { heure: '18h00', nom: 'Yoga postural' },
        { heure: '19h15', nom: 'Pilates' },
      ],
      Mardi: [
        { heure: '18h00', nom: 'Pilates Ball' },
        { heure: '19h00', nom: 'Cardio Training' },
      ],
      Jeudi: [
        { heure: '19h00', nom: 'Cardio Pilates' },
        { heure: '19h45', nom: 'Yin Yoga' },
      ],
    },
  },
]

// ── Stages pendant les vacances ────────────────────────────────
// L'adresse du formulaire vit dans liens.js, avec celle de l'inscription
// (voir l'import en haut de ce fichier). Ici, il ne reste qu'à ajouter une
// ligne par stage. Tant que `stages` est vide, aucun encart n'apparaît.
// Exemple de ligne à recopier :
//   { date: '21 février 2026', titre: 'Stage Yoga & respiration', horaire: '10h – 12h' },
const stages = []

export default function Planning() {
  return (
    <section id="planning" className="section-pad">
      <div className="section-max">

        <div className="planning-entete apparition">
          <p className="section-label">Horaires des cours</p>
          <h2 className="section-title">Notre <em>Planning</em></h2>
          <div className="divider" />
          <p className="lead">
            Retrouvez ci-dessous l&apos;ensemble des créneaux de la saison. Pour
            toute question sur un cours en particulier, l&apos;équipe M&apos;GYM se
            tient à votre disposition.
          </p>
        </div>

        {/* Le tableau ne se replie pas en colonne unique : un planning se lit
            en comparant les jours entre eux. Sur petit écran il défile donc
            horizontalement dans son propre conteneur, sans jamais pousser la
            page entière vers la droite.
            Le titre de saison et l'indice de défilement sont volontairement
            HORS du conteneur qui défile : sinon ils disparaissent dès que
            l'on fait glisser le tableau. */}
        <div className="apparition">
          <p className="planning-saison">{SAISON}</p>
          <p className="planning-indice" aria-hidden="true">
            Faites glisser le tableau pour voir tous les jours →
          </p>

          <div className="planning-wrap">
            <table className="planning-table" aria-label={`Planning des cours, ${SAISON}`}>
              <thead>
                <tr>
                  {/* Coin haut-gauche : le libellé n'a pas d'intérêt visuel
                      mais il est lu par les lecteurs d'écran. Attention : la
                      classe .apparition du projet sert aux animations, pas au
                      masquage — d'où .visuellement-masque, sans ambiguïté. */}
                  <th scope="col">
                    <span className="visuellement-masque">Moment de la journée</span>
                  </th>
                  {JOURS.map((jour) => (
                    <th key={jour} scope="col" className="planning-jour">{jour}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {planning.map((ligne) => (
                  <tr key={ligne.moment}>
                    <th scope="row" className="planning-moment">{ligne.moment}</th>
                    {JOURS.map((jour) => {
                      const cours = ligne.cours[jour] || []
                      return (
                        <td key={jour} className={cours.length ? '' : 'planning-vide'}>
                          {cours.map((c) => (
                            <div key={c.heure + c.nom} className="planning-cours">
                              <span className="planning-nom">{c.nom}</span>
                              <span className="planning-heure">{c.heure}</span>
                            </div>
                          ))}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {stages.length > 0 && (
          <div className="apparition planning-stages">
            <h3 className="planning-stages-titre">Stages &amp; ateliers</h3>
            <ul className="planning-stages-liste">
              {stages.map((stage) => (
                <li key={stage.date} className="planning-stage">
                  <span className="planning-stage-date">{stage.date}</span>
                  <span className="planning-stage-titre">{stage.titre}</span>
                  <span className="planning-stage-horaire">{stage.horaire}</span>
                  {LIEN_STAGES && (
                    <a
                      href={LIEN_STAGES}
                      className="planning-stage-lien"
                      {...attributsLienExterne(LIEN_STAGES)}
                    >
                      S&apos;inscrire
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="planning-cta apparition">
          <a href="#contact" className="btn-primary">Une question sur les horaires ?</a>
        </div>

      </div>
    </section>
  )
}
