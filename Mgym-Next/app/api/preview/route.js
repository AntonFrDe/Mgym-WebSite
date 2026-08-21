// route.js — l'entrée du mode prévisualisation.
//
// Appelée depuis le Studio par le bouton « Voir le site ». Elle vérifie le
// secret, ouvre une session d'une heure, puis renvoie le visiteur sur la
// page demandée.
//
// SÉCURITÉ — ce que cette route refuse :
//   · une requête sans secret                    -> 401
//   · un secret faux                             -> 401 (message identique)
//   · une redirection vers un autre site         -> ramenée sur l'accueil
//
// Le message d'erreur est volontairement le même dans les deux premiers
// cas : dire « secret incorrect » plutôt que « secret manquant » confirme
// à un attaquant qu'il a trouvé le bon nom de paramètre.

import { NextResponse } from 'next/server'
import { ouvrirPreview } from '@/lib/preview'
import { egaliteConstante, cheminInterne } from '@/lib/preview-jeton.js'

// Cette route lit des cookies : elle ne peut pas être pré-calculée.
export const dynamic = 'force-dynamic'

export async function GET(requete) {
  const parametres = new URL(requete.url).searchParams
  const secretFourni = parametres.get('secret')
  const secretAttendu = process.env.SANITY_PREVIEW_SECRET

  if (!secretAttendu) {
    // Mauvaise configuration du serveur, pas faute du visiteur. On ne dit
    // pas laquelle.
    console.error('[preview] SANITY_PREVIEW_SECRET absent de l\'environnement')
    return new NextResponse('Prévisualisation indisponible', { status: 503 })
  }

  if (!secretFourni || !egaliteConstante(secretFourni, secretAttendu)) {
    return new NextResponse('Accès refusé', { status: 401 })
  }

  // La destination vient de l'URL : elle doit rester à l'intérieur du site.
  // Sans ce contrôle, un lien de prévisualisation deviendrait une
  // redirection ouverte vers n'importe quel site.
  const chemin = cheminInterne(parametres.get('chemin'))

  await ouvrirPreview()

  return NextResponse.redirect(new URL(chemin, requete.url))
}
