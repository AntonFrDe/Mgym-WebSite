// Outdoor.js — le bloc « Explorez aussi » qui prolonge la section Activités.
//
// Pourquoi une section à part et non un ajout dans SentierActivites.js /
// CarrouselActivites.js : ces deux composants sont deux AFFICHAGES du même
// tableau d'activités (activitesData.js). La marche nordique n'est pas une
// 9e activité de ce tableau, c'est une invitation à côté. En faire une
// section indépendante évite de la dupliquer dans les deux affichages.
//
// Le fond est volontairement le même rose (#F4E1E6) que #activites : les deux
// blocs se lisent comme un seul, et surtout l'alternance crème/rose des
// sections suivantes (Prestations, Coach, Tarifs…) reste intacte.

// Les activités citées dans le paragraphe, reprises en étiquettes.
const activitesOutdoor = [
  'Marche nordique',
  'Cardio',
  'Renforcement musculaire',
  'Yoga en extérieur',
  'Étirements',
  'Marche afghane',
  'Découverte du patrimoine',
]

export default function Outdoor() {
  return (
    <section id="outdoor" className="section-pad">
      <div className="section-max">
        <div className="outdoor-grid">

          <div className="sr-l">
            <img
              src="/Images/MarcheNordique.avif"
              alt="Sortie marche nordique M'GYM"
              className="outdoor-img"
              loading="lazy"
            />
          </div>

          <div className="sr-r">
            <p className="section-label">Explorez aussi</p>
            <h2 className="section-title">
              Marche nordique &amp;<br />
              activités <em>outdoor</em>
            </h2>
            <div className="divider" />
            <p className="lead" style={{ marginBottom: '1.5rem' }}>
              Respirez, bougez et ressourcez-vous en pleine nature. Nos séances
              associent marche nordique, cardio, renforcement musculaire, yoga
              en extérieur, étirements, marche afghane et découverte du
              patrimoine. Une façon conviviale d&apos;entretenir sa forme tout
              en profitant des bienfaits du grand air.
            </p>

            <div className="outdoor-tags">
              {activitesOutdoor.map((activite) => (
                <span key={activite} className="etape-tag">{activite}</span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
