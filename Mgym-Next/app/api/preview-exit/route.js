// route.js — la sortie du mode prévisualisation.
//
// Aucun secret n'est demandé : quitter la prévisualisation ne présente
// aucun risque, et exiger un secret empêcherait simplement quelqu'un de
// revenir au site normal.

import { NextResponse } from 'next/server'
import { fermerPreview } from '@/lib/preview'
import { cheminInterne } from '@/lib/preview-jeton.js'

export const dynamic = 'force-dynamic'

export async function GET(requete) {
  await fermerPreview()

  const chemin = cheminInterne(new URL(requete.url).searchParams.get('chemin'))

  return NextResponse.redirect(new URL(chemin, requete.url))
}
