// Temoignages.js — « Ils en parlent » : les avis, juste après la coach.
//
// Placée sous la présentation d'Emmanuelle, la section répond à la question
// qui suit naturellement : « et ceux qui ont essayé, qu'en pensent-ils ? ».
// Le bandeau de chiffres de la coach y renvoie (voir Coach.js).
//
// TROIS SITUATIONS, AUCUNE SECTION VIDE :
//   · des témoignages   → des cartes, autant que l'écran en aligne
//     (voir MAX_AVIS) ;
//   · aucun, mais un lien vers la fiche Google → une invitation à lire ou
//     laisser un avis, à la place des cartes ;
//   · ni l'un ni l'autre → la section disparaît.
//
// Uniquement de VRAIS avis, avec l'accord des personnes : le back-office
// l'impose (voir sanity/schemaTypes/objets/temoignage.js), et la mention
// sous la section dit d'où ils viennent — c'est une obligation légale.

// Le nombre d'avis dépend de l'écran : deux rangées de trois sur
// ordinateur, deux de deux sur tablette, trois l'un sous l'autre sur
// téléphone — au-delà, on fait défiler un mur de citations. Les six sont
// dans le HTML ; globals.css (« TÉMOIGNAGES ») masque ceux qui ne tiennent
// pas. Ce sont les PREMIERS de la liste du back-office qui restent.
const MAX_AVIS = 6

// Les libellés des provenances. Recopiés ici plutôt qu'importés du schéma :
// ce dernier charge tout le paquet « sanity », qui n'a rien à faire dans
// le site. Ils doivent suivre SOURCES_AVIS (objets/temoignage.js).
const SOURCES = { google: 'Avis Google', facebook: 'Facebook', direct: 'Recueilli directement' }

/** « 4,8 » ou « 5 » → nombre d'étoiles pleines, entre 0 et 5. */
function etoilesPleines(note) {
  const n = parseFloat(String(note ?? '').replace(',', '.'))
  return Number.isFinite(n) ? Math.max(0, Math.min(5, Math.round(n))) : 0
}

/** Cinq étoiles, dont `pleines` colorées. Décoratives : la note est écrite à côté. */
function Etoiles({ pleines }) {
  return (
    <span className="etoiles" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= pleines ? 'est-pleine' : ''}>★</span>
      ))}
    </span>
  )
}

export default function Temoignages({ site }) {
  const avis = (site.temoignages ?? [])
    .filter((t) => t?.texte?.trim() && t.accord !== false)
    .slice(0, MAX_AVIS)
  const lien = site.avisLienGoogle
  if (avis.length === 0 && !lien) return null

  const note = site.avisNote?.trim()
  const sources = avis.some((t) => t.source === 'google') ? 'auprès des adhérentes et adhérents, et sur Google' : 'auprès des adhérentes et adhérents'

  return (
    <section id="temoignages" className="section-pad">
      <div className="section-max">

        <div className="temoignages-entete apparition">
          <h2 className="section-title">
            {site.avisTitre} <em>{site.avisTitreItalique}</em>
          </h2>
          <div className="divider" />
          {note && (
            <p className="avis-resume">
              <Etoiles pleines={etoilesPleines(note)} />
              <strong>{note}/5</strong>
              {site.avisNombre && <span>· {site.avisNombre} avis Google</span>}
            </p>
          )}
        </div>

        {avis.length > 0 ? (
          <ul className="temoignages">
            {avis.map((t, i) => (
              <li key={`${t.auteur}-${i}`} className={`temoignage apparition retard-${i + 1}`}>
                <span className="temoignage-guillemet" aria-hidden="true">“</span>
                <blockquote className="temoignage-texte"><p>{t.texte}</p></blockquote>
                <p className="temoignage-auteur">
                  {/* Sans signature, on n'en invente pas : la provenance suffit. */}
                  {t.auteur && <strong>{t.auteur}</strong>}
                  <span>
                    {SOURCES[t.source]}
                    {t.note ? <> · <Etoiles pleines={etoilesPleines(t.note)} /></> : null}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="temoignages-vide apparition">
            Vous avez pratiqué avec Emmanuelle ? Votre avis aide d&apos;autres personnes
            à franchir le pas.
          </p>
        )}

        {lien && (
          <p className="temoignages-actions apparition">
            <a href={lien} className="btn-outline" target="_blank" rel="noopener noreferrer">
              Tous les avis sur Google
              <span className="visuellement-masque"> (s&apos;ouvre dans un nouvel onglet)</span>
            </a>
          </p>
        )}

        {avis.length > 0 && (
          <p className="temoignages-mention">Avis recueillis {sources}.</p>
        )}

      </div>
    </section>
  )
}
