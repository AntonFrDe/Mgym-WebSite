'use client'

// 'use client' : ce bandeau doit retirer le secret de la barre d'adresse
// au montage — voir nettoyerAdresse() plus bas.

// BandeauPreview.js — le bandeau « mode prévisualisation ».
//
// Il n'apparaît QUE lorsque la session de prévisualisation est active et
// valide. Sur le site public, ce composant n'est jamais rendu : le layout
// ne l'appelle que si previewActif() renvoie vrai.
//
// Sans lui, la cliente pourrait croire que ses modifications sont en ligne
// alors qu'elles ne le sont pas — la confusion la plus coûteuse du système.

/**
 * Efface le secret de l'adresse affichée.
 *
 * `/api/preview` redirige vers un chemin PROPRE : vérifié en local, le
 * `Location` vaut « /tarifs », sans rien d'autre. Mais le runtime Next de
 * Netlify recolle la requête d'origine, et le secret réapparaît dans la
 * barre d'adresse :
 *
 *   https://…/tarifs?secret=b2037c…&chemin=%2Ftarifs
 *
 * Or ce secret est PARTAGÉ et DURABLE — ce n'est pas un jeton de session.
 * Il finit dans l'historique du navigateur, et une adresse recopiée à un
 * tiers lui ouvre les brouillons jusqu'à ce qu'on le change.
 *
 * replaceState n'ajoute pas d'entrée d'historique et ne recharge rien :
 * la session de prévisualisation vit dans un cookie, pas dans l'URL.
 */
function nettoyerAdresse() {
  const url = new URL(window.location.href)
  if (!url.searchParams.has('secret')) return
  url.searchParams.delete('secret')
  url.searchParams.delete('chemin')
  window.history.replaceState(null, '', url.pathname + url.search + url.hash)
}

import { useEffect } from 'react'

export default function BandeauPreview() {
  useEffect(nettoyerAdresse, [])

  return (
    <div className="bandeau-preview" role="status">
      <span className="bandeau-preview-texte">
        <strong>Mode prévisualisation</strong> — cette page contient des
        modifications qui ne sont pas encore publiées.
      </span>
      <a href="/api/preview-exit" className="bandeau-preview-sortie">
        Revenir au site publié
      </a>
    </div>
  )
}
