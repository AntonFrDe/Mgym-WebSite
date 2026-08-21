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

  // Les séances des prochaines semaines qui ne se déroulent PAS comme
  // d'habitude. Le moteur rend tout ; on ne garde que l'inhabituel.
  const changements = getPlanningForRange(creneaux, exceptions, fermetures, du, au)
    .filter((s) => s.statut !== 'normal')

  return (
    <section id="planning" className="section-pad">
      <div className="section-max">

        <div className="planning-entete apparition">
          <p className="section-label">{site.planningEtiquette}</p>
          <h2 className="section-title">
            {site.planningTitre} <em>{site.planningTitreItalique}</em>
          </h2>
          <div className="divider" />
          <TexteRiche valeur={site.planningChapo} className="lead" />
        </div>

        {/* Le tableau ne se replie pas en colonne unique : un planning se lit
            en comparant les jours entre eux. Sur petit écran il défile donc
            horizontalement dans son propre conteneur, sans jamais pousser la
            page entière vers la droite.
            Le titre de saison et l'indice de défilement sont volontairement
            HORS du conteneur qui défile : sinon ils disparaissent dès que
            l'on fait glisser le tableau. */}
        <div className="apparition">
          <p className="planning-saison">{site.planningSaison}</p>
          <p className="planning-indice" aria-hidden="true">
            Faites glisser le tableau pour voir tous les jours →
          </p>

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
