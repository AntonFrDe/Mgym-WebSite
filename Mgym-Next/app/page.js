// page.js — c'est la PAGE D'ACCUEIL (la route "/").
// Elle n'écrit pas le HTML elle-même : elle ASSEMBLE des composants.
// Chaque composant = une section du site, dans son propre fichier.
// C'est la grande différence avec un seul fichier HTML : ici tout est organisé.

import Hero              from '../components/Hero'
import Manifesto         from '../components/Manifesto'
import About             from '../components/About'
// Branche teste-template : le bloc « Activités » est affiché en
// CARROUSEL HORIZONTAL au lieu du sentier vertical. Pour revenir au
// sentier, remettre <SentierActivites /> ci-dessous — les deux
// composants lisent les mêmes données (components/activitesData.js).
import CarrouselActivites from '../components/CarrouselActivites'
import Bespoke          from '../components/Bespoke'
import Coach            from '../components/Coach'
import Pricing          from '../components/Pricing'
import Planning         from '../components/Planning'
import Reseaux          from '../components/Reseaux'
import Contact          from '../components/Contact'
import Footer           from '../components/Footer'

export default function Home() {
  return (
    <main>
      <Hero />
      <Manifesto />
      <About />
      <CarrouselActivites />
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
