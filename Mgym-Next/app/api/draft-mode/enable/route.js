// route.js — l'entrée de l'APERÇU EN DIRECT du Studio (outil « Aperçu »).
//
// Le Studio n'envoie PAS le secret du site : il fabrique à chaque ouverture
// un secret neuf, enregistré dans Sanity au nom de la personne connectée
// (paquet @sanity/preview-url-secret). Cette route le vérifie en le relisant
// avec le jeton de lecture du serveur. Aucun secret n'est donc écrit dans le
// code du Studio, qui est public : c'est ce qui rendait dangereux un simple
// bouton « Voir le site ».
//
// Différences avec /api/preview (le lien secret, toujours disponible) :
//   · la session dure une journée de travail (DUREE_STUDIO_MS) ;
//   · les cookies sont PARTITIONNÉS quand la demande vient du cadre du
//     Studio — sans quoi Safari, donc tout iPhone, les jette.

import { NextResponse } from 'next/server'
import { validatePreviewUrl } from '@sanity/preview-url-secret'
import { clientBrouillon } from '@/lib/sanity/client'
import { ouvrirPreview } from '@/lib/preview'
import { cheminInterne, depuisCadreTiers, DUREE_STUDIO_MS } from '@/lib/preview-jeton.js'

// Cette route lit et écrit des cookies : elle ne peut pas être pré-calculée.
export const dynamic = 'force-dynamic'

export async function GET(requete) {
  // Les DEUX variables sont exigées : le jeton lit les brouillons, le
  // secret signe le cookie d'expiration (lib/preview.js). Sans le secret,
  // ouvrirPreview() levait une exception : erreur 500 dans le Studio.
  if (!clientBrouillon || !process.env.SANITY_API_READ_TOKEN || (process.env.SANITY_PREVIEW_SECRET ?? '').length < 16) {
    console.error('[aperçu] SANITY_API_READ_TOKEN ou SANITY_PREVIEW_SECRET (16 caractères min.) absent de l\'environnement')
    return new NextResponse('Aperçu indisponible', { status: 503 })
  }

  // stega désactivé : le secret relu ne doit pas recevoir de caractères
  // invisibles, sinon la comparaison échouerait.
  const { isValid, redirectTo } = await validatePreviewUrl(
    clientBrouillon.withConfig({ stega: false }),
    requete.url
  )
  if (!isValid) return new NextResponse('Accès refusé', { status: 401 })

  await ouvrirPreview({ dureeMs: DUREE_STUDIO_MS, cadreTiers: depuisCadreTiers(requete.headers) })

  // Même garde-fou que /api/preview : on ne redirige que vers une page du site.
  return NextResponse.redirect(new URL(cheminInterne(redirectTo), requete.url))
}
