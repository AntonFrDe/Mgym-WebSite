// Pricing.js — les tarifs de la saison.
//
// L'affichage n'est PAS une longue liste de lignes identiques : dix lignes
// qui se ressemblent, on les lit toutes pour trouver la sienne. Trois
// formes différentes selon ce que le tarif est :
//   · l'adhésion, obligatoire  -> un bandeau seul, impossible à manquer ;
//   · les formules à la carte  -> des vignettes, le prix d'abord, pour
//                                 comparer d'un coup d'œil ;
//   · les tarifs saison        -> un tableau une personne / famille,
//                                 parce que c'est exactement la question
//                                 que se pose le visiteur.
//
// Tout se modifie dans le back-office, onglet « Tarifs ».

import LienFormulaire from './LienFormulaire'
import TexteRiche from './TexteRiche'

// Les en-têtes du tableau sont dans le code : ce sont des repères de
// lecture, pas du contenu. « Famille * » renvoie à la note explicative
// saisie, elle, dans le back-office.
const COLONNES_SAISON = ['Une personne', 'Famille *']

/** Une vignette : le prix en grand, le nom dessous. */
function Vignette({ tarif }) {
  return (
    <div className="tarif-vignette">
      <p className="tarif-vignette-prix">{tarif.prix}</p>
      <p className="tarif-vignette-nom">{tarif.nom}</p>
      {tarif.detail && <p className="tarif-vignette-detail">{tarif.detail}</p>}
    </div>
  )
}

export default function Pricing({ site, infos }) {
  const carte = site.tarifsCarte ?? []
  const saison = site.tarifsSaison ?? []
  const partiels = site.tarifsPartiels ?? []
  const etapes = site.inscriptionEtapes ?? []

  return (
    <section id="tarifs" className="section-pad">
      <div className="section-max">

        <div className="tarifs-entete apparition">
          <p className="section-label">{site.tarifsEtiquette}</p>
          <h2 className="section-title">
            {site.tarifsTitre} <em>{site.tarifsTitreItalique}</em>
          </h2>
          <div className="divider" />
        </div>

        <div className="tarifs">

          {site.adhesion && (
            <div className="tarif-adhesion apparition">
              <div>
                <p className="tarif-adhesion-nom">{site.adhesion.nom}</p>
                <p className="tarif-adhesion-detail">{site.adhesion.detail}</p>
              </div>
              <p className="tarif-adhesion-prix">{site.adhesion.prix}</p>
            </div>
          )}

          {carte.length > 0 && (
            <div className="apparition">
              <h3 className="tarif-groupe">À la carte</h3>
              <div className="tarif-vignettes">
                {carte.map((tarif) => (
                  <Vignette key={tarif._key ?? tarif.nom} tarif={tarif} />
                ))}
              </div>
              {site.tarifsCarteNote && <p className="tarif-note">{site.tarifsCarteNote}</p>}
            </div>
          )}

          {saison.length > 0 && (
            <div className="apparition">
              <h3 className="tarif-groupe">À la saison</h3>

              {/* Un vrai tableau : les en-têtes de colonnes sont annoncés
                  aux lecteurs d'écran, et la comparaison se fait à l'œil
                  sans relire chaque ligne. */}
              <div className="tarif-tableau-cadre">
                <table className="tarif-tableau">
                  <thead>
                    <tr>
                      <th scope="col">
                        <span className="visuellement-masque">Formule</span>
                      </th>
                      {COLONNES_SAISON.map((colonne) => (
                        <th key={colonne} scope="col">{colonne}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {saison.map((tarif) => (
                      <tr key={tarif._key ?? tarif.nom}>
                        <th scope="row">
                          <span className="tarif-tableau-nom">{tarif.nom}</span>
                          {tarif.detail && (
                            <span className="tarif-tableau-detail">{tarif.detail}</span>
                          )}
                        </th>
                        <td>{tarif.prixUnePersonne}</td>
                        <td>{tarif.prixFamille}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="tarif-note">
                {site.tarifsSaisonNote}
                {site.tarifsFamilleNote && <><br />{site.tarifsFamilleNote}</>}
              </p>

              {partiels.length > 0 && (
                <div className="tarif-vignettes tarif-vignettes--duo">
                  {partiels.map((tarif) => (
                    <Vignette key={tarif._key ?? tarif.nom} tarif={tarif} />
                  ))}
                </div>
              )}
            </div>
          )}

          <TexteRiche valeur={site.tarifsSurMesure} className="tarif-sur-mesure apparition" />
        </div>

        <div className="inscription apparition">
          <p className="inscription-titre">
            {site.inscriptionTitre} <em>{site.inscriptionTitreItalique}</em> ?
          </p>
          <p className="inscription-sous-titre">{site.inscriptionSousTitre}</p>

          {/* Annoncer le contenu du formulaire AVANT le clic : on ne
              découvre pas qu'il faut son historique médical une fois
              arrivé dessus. */}
          {etapes.length > 0 && (
            <>
              <p className="inscription-annonce">{site.inscriptionAnnonce}</p>
              <ul className="inscription-etapes">
                {etapes.map((etape) => (
                  <li key={etape}>{etape}</li>
                ))}
              </ul>
            </>
          )}

          <TexteRiche valeur={site.inscriptionAlerte} className="inscription-alerte" />

          <LienFormulaire lien={infos.lienInscription}>
            {site.inscriptionBouton}
          </LienFormulaire>

          <p className="inscription-precision">
            Le formulaire s&apos;ouvre dans un nouvel onglet — cette page
            reste ouverte derrière.
            {infos.telephone && (
              <>
                <br />
                Vous préférez le téléphone ?{' '}
                <a href={`tel:${infos.telephone.replace(/[ .]/g, '')}`} className="price-lien">
                  {infos.telephone}
                </a>
              </>
            )}
          </p>
        </div>

      </div>
    </section>
  )
}
