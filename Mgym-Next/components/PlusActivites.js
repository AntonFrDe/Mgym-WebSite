'use client'
// PlusActivites.js — la section « Plus d'activités », à trois onglets.
//
// 'use client' : l'onglet affiché est un état qui change au clic, et la
// section écoute l'adresse de la page (#bespoke, #outdoor, #ateliers).
//
// POURQUOI DES ONGLETS
// Les ateliers thématiques, les prestations sur mesure et le plein air
// occupaient trois sections l'une sous l'autre, plus deux cartes dans le
// carrousel des cours. Trois onglets côte à côte les rassemblent : on voit
// d'un coup d'œil qu'il existe trois offres, et on n'en lit qu'une à la
// fois. La page raccourcit d'autant.
//
// LES TROIS PANNEAUX SONT TOUJOURS DANS LE HTML — seul l'attribut `hidden`
// les cache. C'est ce qui permet à Google de les lire, et à la copie
// hors-ligne de fonctionner : build-standalone.js bascule le même attribut.
//
// LES ANCIENNES ADRESSES CONTINUENT DE MARCHER. Les boutons d'onglets
// portent les identifiants des anciennes sections (#bespoke, #outdoor) :
// un lien « Découvrez nos tarifs sur mesure » saisi dans le back-office
// fait défiler jusqu'aux onglets ET ouvre le bon.

import { useEffect, useState } from 'react'
import TexteRiche from './TexteRiche'
import LienFormulaire from './LienFormulaire'
import { Picto, pictoPublic } from './pictogrammes'

/**
 * Les onglets, dans l'ordre d'affichage. `ancre` = l'identifiant du bouton.
 * `champ` = le nom de l'onglet dans le back-office (« Textes du site » →
 * « Plus d'activités ») : la cliente le renomme sans toucher au code.
 */
const ONGLETS = [
  { cle: 'ateliers',  ancre: 'ateliers', champ: 'plusOngletAteliers',  picto: 'ateliers' },
  { cle: 'surMesure', ancre: 'bespoke',  champ: 'plusOngletSurMesure', picto: 'surMesure' },
  { cle: 'pleinAir',  ancre: 'outdoor',  champ: 'plusOngletPleinAir',  picto: 'pleinAir' },
]

export default function PlusActivites({ site, infos, ateliers, prochainsAteliers = [] }) {
  // Sans fiche « Ateliers thématiques » active, son onglet disparaît plutôt
  // que d'afficher un panneau vide.
  const onglets = ONGLETS.filter((o) => o.cle !== 'ateliers' || ateliers)
  const [actif, setActif] = useState(onglets[0].cle)

  // Arriver par /#bespoke, ou cliquer un lien #outdoor dans la page, ouvre
  // l'onglet correspondant.
  useEffect(() => {
    const suivreAdresse = () => {
      const cible = onglets.find((o) => `#${o.ancre}` === window.location.hash)
      if (cible) setActif(cible.cle)
    }
    suivreAdresse()
    window.addEventListener('hashchange', suivreAdresse)
    return () => window.removeEventListener('hashchange', suivreAdresse)
    // `onglets` ne change qu'avec les données de la page : un seul abonnement suffit.
  }, [])

  // Clavier : les flèches passent d'un onglet à l'autre (motif ARIA « tabs »).
  const surTouche = (e, i) => {
    const suivant = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: onglets.length - 1 }[e.key]
    if (suivant === undefined) return
    e.preventDefault()
    const o = onglets[(suivant + onglets.length) % onglets.length]
    setActif(o.cle)
    document.getElementById(o.ancre)?.focus()
  }

  const telBrut = (infos.telephone ?? '').replace(/[ .]/g, '')
  const plaquettes = [
    { lien: infos.plaquetteGroupes, libelle: site.bespokePlaquetteGroupes },
    { lien: infos.plaquetteMassages, libelle: site.bespokePlaquetteMassages },
  ].filter((pl) => pl.lien)

  return (
    <section id="plus-activites" className="section-pad">
      <div className="section-max">

        <div className="plus-entete apparition">
          <h2 className="section-title">
            {site.plusTitre} <em>{site.plusTitreItalique}</em>
          </h2>
          <div className="divider" />
          {site.plusChapo && <p className="lead">{site.plusChapo}</p>}
        </div>

        <div className="onglets" role="tablist" aria-label={site.plusEtiquette}>
          {onglets.map((o, i) => (
            <button
              key={o.cle}
              id={o.ancre}
              type="button"
              role="tab"
              aria-selected={actif === o.cle}
              aria-controls={`panneau-${o.ancre}`}
              tabIndex={actif === o.cle ? 0 : -1}
              className={`onglet${actif === o.cle ? ' est-actif' : ''}`}
              onClick={() => setActif(o.cle)}
              onKeyDown={(e) => surTouche(e, i)}
            >
              <Picto nom={o.picto} taille={22} />
              <span>{site[o.champ]}</span>
            </button>
          ))}
        </div>

        {/* ── ATELIERS THÉMATIQUES ── */}
        {ateliers && (
          <div
            id="panneau-ateliers" role="tabpanel" aria-labelledby="ateliers"
            className="panneau" hidden={actif !== 'ateliers'}
          >
            <div className="panneau-titre-bloc">
              <h3 className="panneau-titre">{ateliers.titre}</h3>
              {ateliers.descriptionCourte && <p className="panneau-accroche">{ateliers.descriptionCourte}</p>}
            </div>
            {ateliers.image && (
              <div className="panneau-media">
                <img src={ateliers.image.src} alt={ateliers.image.alt} loading="lazy" />
              </div>
            )}
            <div className="panneau-texte">
              <TexteRiche valeur={ateliers.descriptionRiche} className="lead" />
              {(ateliers.motsCles ?? []).length > 0 && (
                <>
                  <p className="panneau-sous-titre">Quelques thèmes</p>
                  <ul className="themes">
                    {ateliers.motsCles.map((theme) => (
                      <li key={theme} className="theme"><Picto nom="etoile" taille={18} />{theme}</li>
                    ))}
                  </ul>
                </>
              )}
              {/* Les prochaines dates d'ateliers, cliquables : on arrive
                  directement sur la fiche, sans passer par la frise. */}
              {prochainsAteliers.length > 0 && (
                <>
                  <p className="panneau-sous-titre">Prochaines dates</p>
                  <ul className="prochains">
                    {prochainsAteliers.map((p) => (
                      <li key={p._id}>
                        <a href={p.href} className="prochain">
                          <Picto nom="evenement" taille={22} />
                          <span><strong>{p.titre}</strong><span>{p.quand}</span></span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <div className="panneau-actions">
                <a href="#evenements" className="btn-primary">
                  {prochainsAteliers.length > 0 ? 'Tous les stages & événements' : 'Voir les prochaines dates'}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ── PRESTATIONS SUR MESURE ── */}
        <div
          id="panneau-bespoke" role="tabpanel" aria-labelledby="bespoke"
          className="panneau" hidden={actif !== 'surMesure'}
        >
          <div className="panneau-titre-bloc">
            <p className="panneau-etiquette">{site.bespokeEtiquette}</p>
            <h3 className="panneau-titre">
              {site.bespokeTitre} <em>{site.bespokeTitreItalique}</em>
            </h3>
          </div>
          {site.bespokeImage && (
            <div className="panneau-media">
              <img src={site.bespokeImage.src} alt={site.bespokeImage.alt} loading="lazy" />
            </div>
          )}
          <div className="panneau-texte">
            <TexteRiche valeur={site.bespokeTexte} className="lead" />
            {/* Les publics visés : de petites cartes à pictogramme, et non
                plus quatre pavés roses pleine largeur qui ressemblaient à
                des boutons sans en être. */}
            {(site.bespokePublics ?? []).length > 0 && (
              <ul className="publics">
                {site.bespokePublics.map((pub) => (
                  <li key={pub} className="public-carte">
                    <span className="public-picto"><Picto nom={pictoPublic(pub)} taille={24} /></span>
                    {pub}
                  </li>
                ))}
              </ul>
            )}
            {/* LES DEUX PLAQUETTES, À ÉGALITÉ. Il y avait un bouton
                « Découvrir en détail » (groupes) et, en petit dessous, un
                lien vers les massages : on ne voyait que la seconde, et le
                bouton ne disait pas ce qu'il ouvrait. Chacune annonce
                maintenant son sujet. */}
            {plaquettes.length > 0 && (
              <>
                <p className="panneau-sous-titre">En détail</p>
                <ul className="plaquettes">
                  {plaquettes.map((pl) => (
                    <li key={pl.lien}>
                      <LienFormulaire lien={pl.lien} className="plaquette" precision="plaquette PDF">
                        <Picto nom="document" taille={22} />
                        <span><strong>{pl.libelle}</strong><span>Plaquette PDF</span></span>
                      </LienFormulaire>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {telBrut && (
              <div className="panneau-actions">
                <a href={`tel:${telBrut}`} className="btn-primary">{site.bespokeBouton}</a>
              </div>
            )}
          </div>
        </div>

        {/* ── PLEIN AIR ── */}
        <div
          id="panneau-outdoor" role="tabpanel" aria-labelledby="outdoor"
          className="panneau" hidden={actif !== 'pleinAir'}
        >
          <div className="panneau-titre-bloc">
            <p className="panneau-etiquette">{site.outdoorEtiquette}</p>
            <h3 className="panneau-titre">
              {site.outdoorTitre} {site.outdoorTitreSuite} <em>{site.outdoorTitreItalique}</em>
            </h3>
          </div>
          {site.outdoorImage && (
            <div className="panneau-media">
              <img src={site.outdoorImage.src} alt={site.outdoorImage.alt} loading="lazy" />
            </div>
          )}
          <div className="panneau-texte">
            <TexteRiche valeur={site.outdoorTexte} className="lead" />
            {(site.outdoorMotsCles ?? []).length > 0 && (
              <div className="outdoor-tags">
                {site.outdoorMotsCles.map((mot) => (
                  <span key={mot} className="etape-tag">{mot}</span>
                ))}
              </div>
            )}
            <div className="panneau-actions">
              <a href="#evenements" className="btn-primary">{site.outdoorBouton}</a>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
