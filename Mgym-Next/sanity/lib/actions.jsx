// actions.js — les raccourcis ajoutés dans le back-office.
//
// Chacun répond à un geste que la cliente fera souvent. Aucun n'est là
// « parce que c'est possible » : un menu d'actions encombré fait hésiter.

import { useState } from 'react'

/**
 * « Dupliquer » sur un événement ou un article.
 *
 * Le stage de printemps devient celui d'automne en quelques secondes :
 * on repart de la fiche existante au lieu de tout ressaisir. La copie
 * arrive en BROUILLON, avec « (copie) » dans le titre — impossible de
 * publier par mégarde un doublon de l'original.
 */
export function actionDupliquer(props) {
  const { type, draft, published, onComplete } = props
  const document = draft || published

  if (!['evenement', 'article'].includes(type)) return null

  return {
    label: 'Dupliquer',
    icon: () => '⧉',
    onHandle: async () => {
      const client = props.getClient?.({ apiVersion: '2024-10-01' })
      if (!client || !document) return onComplete?.()

      const { _id, _rev, _createdAt, _updatedAt, ...contenu } = document

      await client.create({
        ...contenu,
        _type: type,
        _id: `drafts.${crypto.randomUUID()}`,
        titre: `${contenu.titre ?? 'Sans titre'} (copie)`,
        // Le slug doit être unique : on le vide pour forcer une
        // régénération. Deux documents au même slug rendraient l'un des
        // deux inatteignable.
        slug: undefined,
      })

      onComplete?.()
    },
  }
}

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
  const [ouvert, setOuvert] = useState(false)
  const [date, setDate] = useState('')
  const [motif, setMotif] = useState('')

  if (type !== 'creneau') return null

  return {
    label: 'Annuler une date',
    icon: () => '🚫',
    onHandle: () => setOuvert(true),
    dialog: ouvert && {
      type: 'dialog',
      header: 'Annuler ce cours pour une date',
      onClose: () => { setOuvert(false); onComplete?.() },
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
          <button
            type="button"
            disabled={!date}
            onClick={async () => {
              const client = props.getClient?.({ apiVersion: '2024-10-01' })
              if (!client) return
              await client.create({
                _type: 'exception',
                creneau: { _type: 'reference', _ref: id },
                date,
                type: 'annule',
                motif: motif || undefined,
              })
              setOuvert(false)
              onComplete?.()
            }}
            style={{ padding: '0.6rem', cursor: date ? 'pointer' : 'not-allowed' }}
          >
            Créer l&apos;annulation
          </button>
        </div>
      ),
    },
  }
}
