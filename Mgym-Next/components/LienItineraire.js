'use client'
// LienItineraire.js — le bouton « Itinéraire » qui ouvre l'application de
// cartes DU TÉLÉPHONE, pas une page web.
//
// 'use client' : le bon lien dépend de l'appareil, que seul le navigateur
// connaît.
//
//   iPhone, iPad  → maps.apple.com : Safari ouvre directement Plans.
//   Android       → geo: : le téléphone propose Google Maps, Waze…
//   ordinateur    → Google Maps dans un nouvel onglet.
//
// Le HTML part avec le lien Google Maps, qui marche PARTOUT : même sans
// JavaScript, ou le temps qu'il se charge, le bouton mène au bon endroit.
// Les attributs data-* servent à la copie hors-ligne (build-standalone.js),
// qui refait la même substitution sans React.

import { useEffect, useState } from 'react'

/** Les trois adresses possibles pour une même destination. */
export function liensItineraire({ lat, lng, nom }) {
  const coord = `${lat},${lng}`
  return {
    google: `https://www.google.com/maps/dir/?api=1&destination=${coord}`,
    apple: `https://maps.apple.com/?daddr=${coord}&q=${encodeURIComponent(nom)}`,
    android: `geo:${coord}?q=${coord}(${encodeURIComponent(nom)})`,
  }
}

/**
 * @param {{position?: {lat: number, lng: number}, nom?: string, className?: string, children: any}} props
 */
export default function LienItineraire({ position, nom = "M'GYM", className, children }) {
  const lat = position?.lat
  const lng = position?.lng
  const liens = position ? liensItineraire({ lat, lng, nom }) : null
  const [href, setHref] = useState(liens?.google)

  useEffect(() => {
    if (lat === undefined || lng === undefined) return
    const { apple: versPlans, android: versAndroid } = liensItineraire({ lat, lng, nom })
    const ua = navigator.userAgent
    // Un iPad récent se présente comme un Mac : on le reconnaît à l'écran tactile.
    const apple = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
    if (apple) setHref(versPlans)
    else if (/Android/.test(ua)) setHref(versAndroid)
  }, [lat, lng, nom])

  if (!liens) return null
  const web = href.startsWith('http')

  return (
    <a
      href={href}
      className={className}
      data-itineraire=""
      data-lat={position.lat}
      data-lng={position.lng}
      data-nom={nom}
      {...(web ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  )
}
