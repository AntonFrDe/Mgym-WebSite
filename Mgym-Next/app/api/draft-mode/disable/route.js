// route.js — la sortie de l'aperçu du Studio.
//
// Même rôle que /api/preview-exit, mais sait effacer les cookies
// PARTITIONNÉS posés dans le cadre du Studio (voir ../enable/route.js).

import { NextResponse } from 'next/server'
import { fermerPreview } from '@/lib/preview'
import { depuisCadreTiers } from '@/lib/preview-jeton.js'

export const dynamic = 'force-dynamic'

export async function GET(requete) {
  await fermerPreview({ cadreTiers: depuisCadreTiers(requete.headers) })
  return NextResponse.redirect(new URL('/', requete.url))
}
