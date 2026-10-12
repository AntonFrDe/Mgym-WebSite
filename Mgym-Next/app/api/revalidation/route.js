// route.js — Sanity appelle cette adresse à chaque « Publier ».
//
// C'est ce qui met le site à jour en quelques secondes, SANS le
// reconstruire : reconstruire coûte 15 crédits Netlify sur 300 par mois,
// et c'est ce qui avait épuisé le compte en septembre.
//
// Ce qui se passe :
//   1. la cliente publie un texte, un stage, un tarif… ;
//   2. Sanity envoie ici un message SIGNÉ avec un secret partagé
//      (réglage « Webhooks » du projet Sanity, et variable
//      SANITY_REVALIDATE_SECRET chez Netlify — la même valeur des deux côtés) ;
//   3. on vérifie la signature, puis on jette les pages et les réponses de
//      Sanity gardées en cache ;
//   4. le visiteur suivant reçoit une page refaite avec le nouveau contenu.
//
// SÉCURITÉ : sans la bonne signature, rien n'est jeté (réponse 401).
// N'importe qui peut appeler cette adresse ; seul Sanity sait signer.
// Le pire qu'un appel signé puisse faire est de faire recalculer les pages.
//
// Si ce message se perd, le site se rattrape seul au bout d'une heure
// (voir `revalidate` dans app/layout.js).

import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'
import { ETIQUETTE_SANITY } from '../../../lib/sanity/fetch.js'

// Chaque appel doit être traité : rien à pré-calculer ni à garder en cache.
export const dynamic = 'force-dynamic'

export async function POST(requete) {
  // trim : un secret collé chez Netlify avec un retour à la ligne final ne
  // correspondrait plus à celui de Sanity — toutes les signatures seraient
  // refusées, sans autre symptôme qu'un site qui ne se met plus à jour.
  const secret = process.env.SANITY_REVALIDATE_SECRET?.trim()
  if (!secret || secret.length < 16) {
    // 503 et non 401 : Sanity réessaie une erreur 5xx, jamais une 4xx.
    console.error('[publication] SANITY_REVALIDATE_SECRET absent ou trop court (16 caractères min.)')
    return new NextResponse('Configuration incomplète', { status: 503 })
  }

  let message
  try {
    // parseBody attend aussi 3 secondes que Sanity ait diffusé la
    // publication partout : sans cette pause, on relirait l'ancien texte.
    message = await parseBody(requete, secret)
  } catch (erreur) {
    console.error('[publication] message illisible :', erreur instanceof Error ? erreur.message : erreur)
    return new NextResponse('Message illisible', { status: 400 })
  }

  // null (pas de signature) ou false (mauvaise signature) : refus.
  if (!message.isValidSignature) {
    return new NextResponse('Signature invalide', { status: 401 })
  }

  // Les réponses de Sanity d'abord, puis toutes les pages : accueil,
  // fiches, blog, et les deux fichiers pour les moteurs de recherche (ils ne
  // sont pas sous la mise en page, il faut les nommer).
  revalidateTag(ETIQUETTE_SANITY)
  revalidatePath('/', 'layout')
  revalidatePath('/sitemap.xml')
  revalidatePath('/robots.txt')

  return NextResponse.json({ ok: true, document: message.body?._type ?? null })
}
