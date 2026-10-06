// actions.js — les raccourcis ajoutés dans le back-office.
//
// Chacun répond à un geste que la cliente fera souvent. Aucun n'est là
// « parce que c'est possible » : un menu d'actions encombré fait hésiter.

import { useState } from 'react'
import { useClient, useDocumentOperation } from 'sanity'
import { adressePour } from '../../lib/adresse-web.js'

/**
 * « Publier » qui remplit l'adresse web tout seul (articles, événements).
 *
 * Le champ « Adresse web » exigeait un clic sur « Generate » : oublié, la
 * publication était refusée — et un événement sans adresse n'aurait de
 * toute façon eu aucune page sur le site. Ce bouton garde TOUT le
 * comportement du « Publier » d'origine (il l'enveloppe) et ajoute un seul
 * geste : si l'adresse est vide, il la fabrique à partir du titre (et de la
 * date pour un événement) juste avant de publier.
 *
 * Une adresse déjà remplie n'est JAMAIS modifiée : un lien partagé sur
 * Facebook doit continuer de marcher, même si le titre change ensuite.
 */
export function avecAdresseAutomatique(PublierOriginal) {
  function PublierAvecAdresse(props) {
    const { patch } = useDocumentOperation(props.id, props.type)
    const original = PublierOriginal(props)
    if (!original) return original

    return {
      ...original,
      onHandle: () => {
        const doc = props.draft || props.published
        const adresse = doc && !doc.slug?.current ? adressePour(doc) : ''
        if (adresse) patch.execute([{ set: { slug: { _type: 'slug', current: adresse } } }])
        original.onHandle?.()
      },
    }
  }
  PublierAvecAdresse.action = PublierOriginal.action
  return PublierAvecAdresse
}

/**
 * « Dupliquer » sur un événement ou un article.
 *
 * Le stage de printemps devient celui d'automne en quelques secondes :
 * on repart de la fiche existante au lieu de tout ressaisir. La copie
 * arrive en BROUILLON, avec « (copie) » dans le titre — impossible de
 * publier par mégarde un doublon de l'original.
 *
 * Il REMPLACE le « Dupliquer » natif de Sanity (retiré dans
 * sanity.config.js) : le natif recopie l'adresse web, et deux fiches à la
 * même adresse rendent l'une des deux inatteignable.
 */
export function actionDupliquer(props) {
  const { type, draft, published, onComplete } = props
  const client = useClient({ apiVersion: '2024-10-01' })
  const document = draft || published

  if (!TYPES_DUPLICABLES.includes(type)) return null

  return {
    label: 'Dupliquer',
    disabled: !document,
    onHandle: async () => {
      const { _id, _rev, _createdAt, _updatedAt, slug, ...contenu } = document
      try {
        await client.create({
          ...contenu,
          _type: type,
          _id: `drafts.${crypto.randomUUID()}`,
          titre: `${contenu.titre ?? 'Sans titre'} (copie)`,
          // Pas de `slug` : « Publier » en fabriquera une nouvelle.
        })
      } catch (e) {
        // Une action n'a pas d'endroit où afficher un message : la console
        // du navigateur garde la trace, et la liste ne montre pas de copie.
        console.error('[Dupliquer] échec :', e)
      }
      onComplete?.()
    },
  }
}

/** Les types où « Dupliquer » (la version maison) remplace le natif. */
export const TYPES_DUPLICABLES = ['evenement', 'article']

/**
 * « Annuler une date » depuis un créneau régulier.
 *
 * Le geste le plus fréquent de la saison : le cours de mardi prochain
 * n'a pas lieu. Sans ce raccourci il faut aller dans « Annulations »,
 * créer un document, retrouver le bon créneau dans une liste déroulante.
 * Ici, le créneau est déjà rempli.
 */
export function actionAnnulerUneDate(props) {
  const { type, id, onComplete } = props
  // useClient : la SEULE façon d'écrire dans Sanity depuis une action. Les
  // actions ne reçoivent pas de client dans leurs props — l'ancienne
  // version lisait `props.getClient`, qui n'existe pas : le bouton ne
  // faisait rien, sans le moindre message.
  const client = useClient({ apiVersion: '2024-10-01' })
  const [ouvert, setOuvert] = useState(false)
  const [date, setDate] = useState('')
  const [motif, setMotif] = useState('')
  const [etat, setEtat] = useState({ enCours: false, erreur: '' })

  if (type !== 'creneau') return null

  const fermer = () => {
    setOuvert(false)
    setEtat({ enCours: false, erreur: '' })
    onComplete?.()
  }

  const creer = async () => {
    setEtat({ enCours: true, erreur: '' })
    try {
      await client.create({
        _type: 'exception',
        // L'annulation vise le créneau PUBLIÉ : une référence vers le
        // brouillon (« drafts.… ») ne serait jamais vue par le site.
        creneau: { _type: 'reference', _ref: id.replace(/^drafts\./, '') },
        date,
        type: 'annule',
        motif: motif || undefined,
      })
      setDate('')
      setMotif('')
      fermer()
    } catch (e) {
      setEtat({
        enCours: false,
        erreur: `L'annulation n'a pas été enregistrée (${e instanceof Error ? e.message : 'erreur inconnue'}). Réessayez, ou créez-la dans « Annulations & changements ».`,
      })
    }
  }

  return {
    label: 'Annuler une date',
    onHandle: () => setOuvert(true),
    dialog: ouvert && {
      type: 'dialog',
      header: 'Annuler ce cours pour une date',
      onClose: fermer,
      content: (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <label>
            Date du cours annulé
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </label>
          <label>
            Motif (facultatif, affiché aux visiteurs)
            <input
              type="text"
              value={motif}
              placeholder="Jour férié"
              onChange={(e) => setMotif(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            />
          </label>
          {etat.erreur && <p role="alert" style={{ color: '#b3261e', margin: 0 }}>{etat.erreur}</p>}
          <button
            type="button"
            disabled={!date || etat.enCours}
            onClick={creer}
            style={{ padding: '0.6rem', cursor: date && !etat.enCours ? 'pointer' : 'not-allowed' }}
          >
            {etat.enCours ? 'Enregistrement…' : "Créer l'annulation"}
          </button>
        </div>
      ),
    },
  }
}
