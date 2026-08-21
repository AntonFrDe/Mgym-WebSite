import { TELEPHONE, TELEPHONE_AFFICHE } from './liens'
import LienFormulaire from './LienFormulaire'

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
const carteNote = 'Prêt de bâton compris pour le forfait une seance'

// Tarifs saison, en deux colonnes : une personne / famille.
// C'est la comparaison que le visiteur cherche, autant la lui montrer.
// Les deux en-têtes se modifient ici, pas dans le JSX.
//
// « Famille » est volontairement court : c'est un en-tête de colonne, il doit
// tenir sur une ligne y compris sur téléphone. L'astérisque renvoie à la note
// sous le tableau, qui dit précisément qui a droit à ce tarif — l'écrire en
// entier dans l'en-tête casserait la lecture du tableau.
const colonnesSaison = ['Une personne', 'Famille *']

const noteFamille =
  '* Tarif famille : réservé aux parents et à leurs enfants, ainsi qu\'aux couples.'

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

// Ce que le formulaire d'inscription demande RÉELLEMENT. Annoncé avant le
// clic : on ne fait pas quitter le site à quelqu'un sans lui dire ce qui
// l'attend, ni sans qu'il puisse réunir ses informations d'abord.
//
// Cette liste doit rester le reflet du formulaire Google (LIEN_INSCRIPTION
// dans liens.js). Si une question y est ajoutée ou retirée, corriger ici :
// une annonce fausse est pire que pas d'annonce du tout.
const etapesInscription = [
  'Vos coordonnées et votre date de naissance',
  'Le ou les cours choisis',
  'La formule tarifaire',
  'Votre mode de règlement',
  'Votre parcours sportif',
  'Les points de santé à signaler',
  'Votre accord pour le droit à l\'image',
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

        <div className="tarifs-entete apparition">
          <p className="section-label">Tarifs</p>
          <h2 className="section-title">Des formules <em>accessibles</em></h2>
          <div className="divider" />
        </div>

        <div className="tarifs">

          <div className="tarif-adhesion apparition">
            <div>
              <p className="tarif-adhesion-nom">{adhesion.nom}</p>
              <p className="tarif-adhesion-detail">{adhesion.detail}</p>
            </div>
            <p className="tarif-adhesion-prix">{adhesion.prix}</p>
          </div>

          <div className="apparition">
            <h3 className="tarif-groupe">À la carte</h3>
            <div className="tarif-vignettes">
              {carte.map((tarif) => (
                <Vignette key={tarif.nom} tarif={tarif} />
              ))}
            </div>
            <p className="tarif-note">{carteNote}</p>
          </div>

          <div className="apparition">
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
            <p className="tarif-note">
              Valable une saison, de septembre à juin<br />
              {noteFamille}
            </p>

            <div className="tarif-vignettes tarif-vignettes--duo">
              {saisonPartielle.map((tarif) => (
                <Vignette key={tarif.nom} tarif={tarif} />
              ))}
            </div>
          </div>

          <p className="tarif-sur-mesure apparition">
            Besoin d&apos;une formule pour une association, un comité
            d&apos;entreprise, une collectivité ou un événement ?{' '}
            <a href="#bespoke" className="price-lien">
              Découvrez nos tarifs sur mesure
            </a>
            .
          </p>
        </div>

        <div className="inscription apparition">
          <p className="inscription-titre">Envie de nous <em>rejoindre</em> ?</p>
          <p className="inscription-sous-titre">
            L&apos;inscription se fait par un formulaire en ligne. Comptez
            quelques minutes.
          </p>

          {/* Annoncer le contenu du formulaire AVANT le clic : on ne découvre
              pas qu'il faut son historique médical une fois arrivé dessus. */}
          <p className="inscription-annonce">Il vous sera demandé :</p>
          <ul className="inscription-etapes">
            {etapesInscription.map((etape) => (
              <li key={etape}>{etape}</li>
            ))}
          </ul>

          {/* Le formulaire s'ouvre sur cette question ; y arriver sans avoir
              lu les documents oblige à tout reprendre plus tard. */}
          <p className="inscription-alerte">
            Le formulaire commence par vous demander si vous avez pris
            connaissance du <strong>règlement intérieur</strong> et des{' '}
            <strong>conditions générales</strong>. Procurez-vous-les avant de
            commencer.
          </p>

          <LienFormulaire>Remplir le formulaire d&apos;inscription</LienFormulaire>

          {/* Deux informations que le bouton seul ne donne pas : la page ne
              disparaît pas, et le téléphone reste une option pour qui ne
              souhaite pas passer par un formulaire. */}
          <p className="inscription-precision">
            Le formulaire s&apos;ouvre dans un nouvel onglet — cette page
            reste ouverte derrière.<br />
            Vous préférez le téléphone ?{' '}
            <a href={`tel:${TELEPHONE}`} className="price-lien">
              {TELEPHONE_AFFICHE}
            </a>
          </p>
        </div>

      </div>
    </section>
  )
}
