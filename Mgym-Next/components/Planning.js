// Planning.js — les créneaux de la saison.
//
// Le planning était une capture d'écran : impossible à mettre à jour sans
// refaire l'image, illisible sur téléphone, invisible pour un lecteur
// d'écran. C'est aujourd'hui un vrai tableau HTML, construit à partir des
// créneaux saisis dans le back-office.
//
// DEUX NIVEAUX D'INFORMATION, VOLONTAIREMENT SÉPARÉS :
//
//   Le TABLEAU montre la règle — « le Pilates a lieu tous les lundis à
//   19h15 ». C'est ce que cherche quelqu'un qui découvre l'association.
//
//   L'ENCART sous le tableau ne montre que les EXCEPTIONS des prochaines
//   semaines. Il n'apparaît que s'il y en a : sans annulation ni stage,
//   la page est exactement celle d'avant.

import { getPlanning } from '../lib/contenu/index.js'
import { getPlanningForRange } from '../lib/planning/moteur.js'
import { construireGrille, JOURS_AFFICHES, heureLisible, dateLisible } from '../lib/planning/grille.js'
import TexteRiche from './TexteRiche'

/** Combien de semaines d'exceptions on annonce à l'avance. */
const SEMAINES_ANNONCEES = 6

/** Date du jour et date dans N semaines, au format « AAAA-MM-JJ ». */
function periodeAnnoncee() {
  const aujourdhui = new Date()
  const fin = new Date(aujourdhui.getTime() + SEMAINES_ANNONCEES * 7 * 86400000)
  const iso = (d) => d.toISOString().slice(0, 10)
  return { du: iso(aujourdhui), au: iso(fin) }
}

export default async function Planning({ site, enPreview = false }) {
  const { du, au } = periodeAnnoncee()
  const { creneaux, exceptions, fermetures } = await getPlanning(du, au, enPreview)

  const grille = construireGrille(creneaux)

  // La même grille, relue jour par jour pour la version téléphone. Les
  // lignes de la grille sont déjà dans l'ordre Matin → Midi → Soir, et
  // chaque case triée par heure : mises bout à bout, elles donnent la
  // journée dans l'ordre chronologique.
  const parJour = JOURS_AFFICHES
    .map((jour) => ({ jour, cours: grille.flatMap((ligne) => ligne.cours[jour.valeur] ?? []) }))
    .filter(({ cours }) => cours.length > 0)

  // Les séances des prochaines semaines qui ne se déroulent PAS comme
  // d'habitude. Le moteur rend tout ; on ne garde que l'inhabituel.
  const changements = getPlanningForRange(creneaux, exceptions, fermetures, du, au)
    .filter((s) => s.statut !== 'normal')

  return (
    <section id="planning" className="section-pad">
      <div className="section-max">

        <div className="planning-entete apparition">
          <h2 className="section-title">
            {site.planningTitre} <em>{site.planningTitreItalique}</em>
          </h2>
          <div className="divider" />
          <TexteRiche valeur={site.planningChapo} className="lead" />
        </div>

        {/* DEUX AFFICHAGES DES MÊMES CRÉNEAUX, le CSS choisit selon la largeur.

            Sur ordinateur, un TABLEAU : un planning se lit en comparant les
            jours entre eux, côte à côte.

            Sur téléphone, une LISTE jour par jour. Le tableau y défilait à
            l'horizontale : 620 px dans 342, un jour et un tiers visibles
            sur quatre — la comparaison qui justifie le tableau n'y était de
            toute façon plus possible, et il fallait faire glisser pour
            découvrir chaque jour.

            La version masquée l'est par `display: none`, que les lecteurs
            d'écran respectent aussi : le planning n'est jamais lu deux fois.
            Le titre de saison est HORS des deux : il vaut pour les deux. */}
        <div className="apparition">
          <p className="planning-saison">{site.planningSaison}</p>

          <div className="planning-wrap">
            <table className="planning-table" aria-label={`Planning des cours, ${site.planningSaison ?? ''}`}>
              <thead>
                <tr>
                  {/* Coin haut-gauche : le libellé n'a pas d'intérêt visuel
                      mais il est lu par les lecteurs d'écran. Attention : la
                      classe .apparition du projet sert aux animations, pas au
                      masquage — d'où .visuellement-masque, sans ambiguïté. */}
                  <th scope="col">
                    <span className="visuellement-masque">Moment de la journée</span>
                  </th>
                  {JOURS_AFFICHES.map((jour) => (
                    <th key={jour.valeur} scope="col" className="planning-jour">{jour.libelle}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grille.map((ligne) => (
                  <tr key={ligne.moment}>
                    <th scope="row" className="planning-moment">{ligne.moment}</th>
                    {JOURS_AFFICHES.map((jour) => {
                      const cours = ligne.cours[jour.valeur] ?? []
                      return (
                        <td key={jour.valeur} className={cours.length ? '' : 'planning-vide'}>
                          {cours.map((c) => (
                            <div key={c._id} className="planning-cours">
                              <span className="planning-nom">{c.activite?.titre ?? '—'}</span>
                              <span className="planning-heure">{heureLisible(c.heureDebut)}</span>
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

          <ul className="planning-jours" aria-label={`Planning des cours, ${site.planningSaison ?? ''}`}>
            {parJour.map(({ jour, cours }) => (
              <li key={jour.valeur} className="planning-jour-carte">
                <h3 className="planning-jour-titre">{jour.libelle}</h3>
                <ul className="planning-jour-liste">
                  {cours.map((c) => (
                    <li key={c._id}>
                      <span className="planning-heure">{heureLisible(c.heureDebut)}</span>
                      <span className="planning-nom">{c.activite?.titre ?? '—'}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>

        {changements.length > 0 && (
          <div className="apparition planning-stages">
            <h3 className="planning-stages-titre">Changements à venir</h3>
            <ul className="planning-stages-liste">
              {changements.map((s) => (
                <li key={s.id} className="planning-stage">
                  <span className="planning-stage-date">{dateLisible(s.date)}</span>
                  <span className="planning-stage-titre">{s.activite?.titre ?? 'Cours'}</span>
                  <span className="planning-stage-horaire">
                    {s.statut === 'annule' && 'Annulé'}
                    {s.statut === 'ferme' && (s.motif || 'Fermeture')}
                    {s.statut === 'complet' && `Complet · ${heureLisible(s.heure)}`}
                    {s.statut === 'deplace' && `Décalé à ${heureLisible(s.heure)}`}
                    {s.motif && s.statut !== 'ferme' ? ` · ${s.motif}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="planning-cta apparition">
          <a href="#contact" className="btn-primary">{site.planningBouton}</a>
        </div>

      </div>
    </section>
  )
}
