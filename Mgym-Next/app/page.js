// page.js — LA page d'accueil (la route « / »).
//
// Elle n'écrit pas de HTML : elle récupère le contenu une seule fois et le
// distribue aux composants, qui restent de simples afficheurs.
//
// POURQUOI LE CONTENU EST RÉCUPÉRÉ ICI, ET PAS DANS CHAQUE COMPOSANT
// Une seule requête pour toute la page plutôt que douze. Et surtout : le
// contenu est disponible dès le PREMIER rendu. C'est ce qui protège les
// animations — un composant qui recevrait ses données après coup se
// remonterait, et les étapes du sentier repasseraient invisibles.

import { previewActif } from '../lib/preview'
import { getContenu } from '../lib/contenu'

import Hero               from '../components/Hero'
import Manifesto          from '../components/Manifesto'
import About              from '../components/About'
// Les deux versions du site utilisent les mêmes données d'activités.
// `MGYM_VARIANT=sentier` permet de générer la version verticale.
import CarrouselActivites from '../components/CarrouselActivites'
import SentierActivites   from '../components/SentierActivites'
import Outdoor            from '../components/Outdoor'
import Bespoke            from '../components/Bespoke'
import Coach              from '../components/Coach'
import Pricing            from '../components/Pricing'
import Planning           from '../components/Planning'
import Reseaux            from '../components/Reseaux'
import Contact            from '../components/Contact'
import Footer             from '../components/Footer'
import DonneesStructurees from '../components/DonneesStructurees'

// Combien de temps cette page peut rester figée avant de redemander son
// contenu au CMS. Voir lib/revalidation.js : c'est ce qui permet de
// modifier le site depuis Sanity sans le reconstruire.
//
// Le nombre est écrit en clair parce que Next exige une valeur analysable
// statiquement — une constante importée est refusée au build. Il est donc
// répété dans les trois pages, et `lib/revalidation.test.mjs` échoue si
// l'une d'elles s'écarte de la constante partagée.
export const revalidate = 60

const isSentier = process.env.MGYM_VARIANT === 'sentier'
const ActivitesSection = isSentier ? SentierActivites : CarrouselActivites

export default async function Home() {
  const enPreview = await previewActif()
  const { site, infos, seo, activites } = await getContenu(enPreview)

  return (
    <main>
      {/* Invisible : la fiche que Google lit pour afficher l'adresse et
          le téléphone directement dans ses résultats. */}
      <DonneesStructurees infos={infos} seo={seo} activites={activites} />

      <Hero site={site} />
      <Manifesto site={site} />
      <About site={site} />
      <ActivitesSection site={site} activites={activites} />
      {/* Outdoor prolonge la section Activités (même fond rose) : l'alternance
          crème/rose reprend normalement à partir de Bespoke. */}
      <Outdoor site={site} />
      <Bespoke site={site} infos={infos} />
      <Coach site={site} />
      <Pricing site={site} infos={infos} />
      <Planning site={site} enPreview={enPreview} />
      <Reseaux site={site} infos={infos} />
      <Contact site={site} infos={infos} />
      <Footer site={site} infos={infos} />
    </main>
  )
}
