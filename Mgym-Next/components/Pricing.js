import { LIEN_INSCRIPTION, destination, attributsLienExterne } from './liens'

// Pricing.js — les tarifs de la saison.
//
// L'affichage n'est PAS une longue liste de lignes identiques : dix lignes
// qui se ressemblent, on les lit toutes pour trouver la sienne. Ici, trois
// formes différentes selon ce que le tarif est :
//   · l'adhésion, obligatoire  → un bandeau seul, impossible à manquer ;
//   · les formules à la carte  → trois vignettes côte à côte, le prix
//                                d'abord, pour comparer d'un coup d'œil ;
//   · les tarifs saison        → un vrai tableau une personne / famille,
//                                parce que c'est exactement la question que
//                                se pose le visiteur.
// Tout se modifie dans les tableaux ci-dessous, sans toucher au HTML.

// Adhésion obligatoire — le préalable à tout le reste.
const adhesion = {
  nom: 'Adhésion association',
  detail: 'Obligatoire pour participer aux cours',
  prix: '15€',
}

// Formules à la carte : on paie ce que l'on consomme.
const carte = [
  { nom: 'Forfait 10 séances', detail: 'Valable 3 mois', prix: '80€' },
  { nom: 'Forfait 20 séances', detail: 'Valable 6 mois', prix: '145€' },
  { nom: 'À la séance', detail: 'Sans engagement', prix: '10€' },
]

// Mention commune aux trois formules ci-dessus : elle était répétée sur
// chaque ligne, elle se dit une fois pour toutes.
const carteNote =
  'Cours collectifs & sorties marche nordique · prêt de bâton compris'

// Tarifs saison, en deux colonnes : une personne / parents & enfants.
// C'est la comparaison que le visiteur cherche, autant la lui montrer.
// Les deux en-têtes se modifient ici, pas dans le JSX.
const colonnesSaison = ['Une personne', 'Parents & enfants']

const saison = [
  {
    nom: 'Tarif fidélité',
    detail: 'Renouvellement d\'adhésion',
    seul: '210€',
    groupe: '410€',
  },
  {
    nom: 'Tarif plein',
    detail: 'Première adhésion',
    seul: '235€',
    groupe: '460€',
  },
]

// Saisons plus courtes : pas de déclinaison famille, donc hors du tableau.
const saisonPartielle = [
  { nom: 'Mi-saison', detail: 'De janvier à juin', prix: '150€' },
  { nom: 'Trimestre', detail: 'D\'avril à juin', prix: '75€' },
]

// Ce que le formulaire d'inscription demande. Annoncé avant le clic : on ne
// fait pas quitter le site à quelqu'un sans lui dire ce qui l'attend.
const etapesInscription = [
  'Vos coordonnées',
  'L\'activité qui vous intéresse',
  'La formule tarifaire choisie',
  'Votre historique personnel',
]

// Une vignette : le prix en grand, le nom dessous. Sert aux formules à la
// carte et aux saisons partielles.
function Vignette({ tarif }) {
  return (
    <div className="tarif-vignette">
      <p className="tarif-vignette-prix">{tarif.prix}</p>
      <p className="tarif-vignette-nom">{tarif.nom}</p>
      <p className="tarif-vignette-detail">{tarif.detail}</p>
    </div>
  )
}

export default function Pricing() {
  return (
    <section id="tarifs" className="section-pad">
      <div className="section-max">

        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }} className="sr">
          <p className="section-label">Tarifs</p>
          <h2 className="section-title">Des formules <em>accessibles</em></h2>
          <div className="divider" style={{ margin: '1.5rem auto' }} />
        </div>

        <div className="tarifs">

          <div className="tarif-adhesion sr">
            <div>
              <p className="tarif-adhesion-nom">{adhesion.nom}</p>
              <p className="tarif-adhesion-detail">{adhesion.detail}</p>
            </div>
            <p className="tarif-adhesion-prix">{adhesion.prix}</p>
          </div>

          <div className="sr">
            <h3 className="tarif-groupe">À la carte</h3>
            <div className="tarif-vignettes">
              {carte.map((tarif) => (
                <Vignette key={tarif.nom} tarif={tarif} />
              ))}
            </div>
            <p className="tarif-note">{carteNote}</p>
          </div>

          <div className="sr">
            <h3 className="tarif-groupe">À la saison</h3>

            {/* Un vrai tableau : les en-têtes « Une personne » / « Famille »
                sont annoncés aux lecteurs d'écran, et la comparaison se fait
                à l'œil sans relire chaque ligne. */}
            <div className="tarif-tableau-cadre">
              <table className="tarif-tableau">
                <thead>
                  <tr>
                    <th scope="col">
                      <span className="visuellement-masque">Formule</span>
                    </th>
                    {colonnesSaison.map((colonne) => (
                      <th key={colonne} scope="col">{colonne}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {saison.map((tarif) => (
                    <tr key={tarif.nom}>
                      <th scope="row">
                        <span className="tarif-tableau-nom">{tarif.nom}</span>
                        <span className="tarif-tableau-detail">{tarif.detail}</span>
                      </th>
                      <td>{tarif.seul}</td>
                      <td>{tarif.groupe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="tarif-note">Valable une saison, de septembre à juin</p>

            <div className="tarif-vignettes tarif-vignettes--duo">
              {saisonPartielle.map((tarif) => (
                <Vignette key={tarif.nom} tarif={tarif} />
              ))}
            </div>
          </div>

          <p className="tarif-sur-mesure sr">
            Besoin d&apos;une formule pour une association, un comité
            d&apos;entreprise, une collectivité ou un événement ?{' '}
            <a href="#bespoke" className="price-lien">
              Découvrez nos tarifs sur mesure
            </a>
            .
          </p>
        </div>

        <div className="inscription sr">
          <p className="inscription-titre">Envie de nous <em>rejoindre</em> ?</p>
          <p className="inscription-sous-titre">
            Remplissez le formulaire d&apos;inscription en ligne, il ne prend
            que quelques minutes.
          </p>

          <ul className="inscription-etapes">
            {etapesInscription.map((etape) => (
              <li key={etape}>{etape}</li>
            ))}
          </ul>

          <a
            href={destination(LIEN_INSCRIPTION)}
            className="btn-primary"
            {...attributsLienExterne(LIEN_INSCRIPTION)}
          >
            S&apos;inscrire en ligne
          </a>
        </div>

      </div>
    </section>
  )
}
