// Evenements.js — la frise des stages et événements à venir.
//
// POURQUOI CETTE SECTION
// Les événements existaient dans le back-office depuis le début, avec leurs
// requêtes… mais aucun composant ne les affichait : la cliente publiait un
// stage, et rien n'apparaissait sur le site. C'est ce composant qui manquait.
//
// LA FORME : une FRISE verticale, groupée par mois. La date vient en premier,
// en pastille : c'est la première question qu'on se pose (« c'est quand ? »),
// puis le titre, le lieu, le prix, et l'état des inscriptions. Verticale sur
// toutes les largeurs : une frise horizontale obligerait à la faire défiler
// de côté, ce qu'un public senior fait mal.
//
// TOUTE LA CARTE EST UN LIEN vers la fiche de l'événement, qui a sa propre
// adresse (/evenements/…) : elle se partage sur Facebook, le bouton
// « retour » du téléphone y ramène, et Google peut la trouver.
//
// JAMAIS DE FRISE VIDE : sans événement à venir, un message d'attente et un
// renvoi vers les réseaux prennent sa place.

import { grouperParMois, pastilleDate, periodeLisible, statutAffiche } from '../lib/evenements/format.js'
import { Picto } from './pictogrammes'

// La copie hors-ligne ne contient pas les fiches d'événements (voir
// scripts/export-statique.mjs) : ses cartes pointent vers le site en ligne.
const enExport = process.env.MGYM_EXPORT === '1'

/**
 * L'adresse de la fiche, ou le contact si l'événement n'a pas d'adresse web.
 * Exportée : l'onglet « Ateliers » renvoie vers les mêmes fiches.
 */
export function lienEvenement(ev, urlSite) {
  if (!ev.slug) return '#contact'
  if (!enExport) return `/evenements/${ev.slug}`
  return urlSite ? `${urlSite}/evenements/${ev.slug}` : '#contact'
}

export default function Evenements({ site, evenements = [], urlSite }) {
  const groupes = grouperParMois(evenements)

  return (
    <section id="evenements" className="section-pad">
      <div className="section-max">

        <div className="evenements-entete apparition">
          <p className="section-label">{site.evenementsEtiquette}</p>
          <h2 className="section-title">
            {site.evenementsTitre} <em>{site.evenementsTitreItalique}</em>
          </h2>
          <div className="divider" />
          {site.evenementsChapo && groupes.length > 0 && <p className="lead">{site.evenementsChapo}</p>}
        </div>

        {groupes.length === 0 ? (
          <div className="frise-vide apparition">
            <span className="frise-vide-picto"><Picto nom="evenement" taille={28} /></span>
            <p>{site.evenementsVide}</p>
            <a href="#reseaux" className="btn-outline">Suivre nos actualités</a>
          </div>
        ) : (
          <ol className="frise">
            {groupes.map((groupe) => (
              <li key={groupe.cle} className="frise-mois apparition">
                <h3 className="frise-mois-titre">{groupe.libelle}</h3>
                <ol className="frise-liste">
                  {groupe.evenements.map((ev) => {
                    const date = pastilleDate(ev.dateDebut)
                    const statut = statutAffiche(ev.statut)
                    return (
                      <li key={ev._id} className={`frise-item est-${statut.classe}`}>
                        <a href={lienEvenement(ev, urlSite)} className="frise-carte">
                          {/* La pastille répète la date écrite en toutes
                              lettres juste à côté : masquée au lecteur
                              d'écran, qui l'entendrait deux fois. */}
                          <span className="frise-date" aria-hidden="true">
                            <span>{date.jour}</span>
                            <strong>{date.numero}</strong>
                            <span>{date.mois}</span>
                          </span>
                          <span className="frise-corps">
                            <span className="frise-titre">{ev.titre}</span>
                            <span className="frise-quand">{periodeLisible(ev.dateDebut, ev.dateFin)}</span>
                            {(ev.lieu || ev.prix) && (
                              <span className="frise-infos">
                                {ev.lieu && <span><Picto nom="lieu" taille={16} />{ev.lieu}</span>}
                                {ev.prix && <span><Picto nom="prix" taille={16} />{ev.prix}</span>}
                              </span>
                            )}
                            <span className={`frise-statut est-${statut.classe}`}>{statut.texte}</span>
                          </span>
                          <span className="frise-fleche"><Picto nom="fleche" taille={20} /></span>
                        </a>
                      </li>
                    )
                  })}
                </ol>
              </li>
            ))}
          </ol>
        )}

      </div>
    </section>
  )
}
