// page.js — c'est la PAGE D'ACCUEIL (la route "/").
// Elle n'écrit pas le HTML elle-même : elle ASSEMBLE des composants.
// Chaque composant = une section du site, dans son propre fichier.
// C'est la grande différence avec un seul fichier HTML : ici tout est organisé.

import Hero              from '../components/Hero'
import Manifesto         from '../components/Manifesto'
import About             from '../components/About'
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

const isSentier = process.env.MGYM_VARIANT === 'sentier'
const ActivitesSection = isSentier ? SentierActivites : CarrouselActivites

export default function Home() {
  return (
    <main>
      <Hero />
      <Manifesto />
      <About />
      <ActivitesSection />
      {/* Outdoor prolonge la section Activités (même fond rose) : l'alternance
          crème/rose reprend normalement à partir de Bespoke. */}
      <Outdoor />
      <Bespoke />
      <Coach />
      <Pricing />
      <Planning />
      <Reseaux />
      <Contact />
      <Footer />
    </main>
  )
}
