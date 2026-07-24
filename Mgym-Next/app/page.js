// page.js — c'est la PAGE D'ACCUEIL (la route "/").
// Elle n'écrit pas le HTML elle-même : elle ASSEMBLE des composants.
// Chaque composant = une section du site, dans son propre fichier.
// C'est la grande différence avec un seul fichier HTML : ici tout est organisé.

import Hero             from '../components/Hero'
import Manifesto        from '../components/Manifesto'
import About            from '../components/About'
import SentierActivites from '../components/SentierActivites'
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
      <SentierActivites />
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
