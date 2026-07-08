// page.js — c'est la PAGE D'ACCUEIL (la route "/").
// Elle n'écrit pas le HTML elle-même : elle ASSEMBLE des composants.
// Chaque composant = une section du site, dans son propre fichier.
// C'est la grande différence avec un seul fichier HTML : ici tout est organisé.

import Hero          from '../components/Hero'
import Manifesto     from '../components/Manifesto'
import About         from '../components/About'
import Activities    from '../components/Activities'
import NordicWalking from '../components/NordicWalking'
import Bespoke       from '../components/Bespoke'
import Coach         from '../components/Coach'
import Contact       from '../components/Contact'
import Footer        from '../components/Footer'

// Pricing est désormais intégré dans NordicWalking.js

export default function Home() {
  return (
    <main>
      <Hero />
      <Manifesto />
      <About />
      <Activities />
      <NordicWalking />
      <Bespoke />
      <Coach />
      <Contact />
      <Footer />
    </main>
  )
}
