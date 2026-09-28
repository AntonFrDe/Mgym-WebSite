'use client'
// EditionVisuelle.js — le lien entre le site et l'outil « Aperçu » du Studio.
//
// 'use client' : il écoute les messages du Studio, qui encadre le site.
//
// Rendu UNIQUEMENT en prévisualisation (voir layout.js). Dans l'aperçu du
// Studio, il dessine au survol un cadre autour de chaque texte modifiable
// — un clic ouvre le champ — et rafraîchit la page à chaque modification.
// Hors du Studio (lien secret ouvert dans un onglet), il ne dessine rien.
//
// RAFRAÎCHISSEMENT : par défaut, next-sanity purge le cache de TOUT le
// site à chaque modification, ce qui relancerait la génération de toutes
// les pages sur Netlify pendant que la cliente tape. Inutile ici : en
// prévisualisation, les lectures ne passent jamais par le cache
// (lib/sanity/fetch.js). Un simple router.refresh() redemande la page.

import { useRouter } from 'next/navigation'
import { VisualEditing } from 'next-sanity/visual-editing'

export default function EditionVisuelle() {
  const router = useRouter()
  return (
    <VisualEditing
      refresh={() => {
        router.refresh()
        return Promise.resolve()
      }}
    />
  )
}
