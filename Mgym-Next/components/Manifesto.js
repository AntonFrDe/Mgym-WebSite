// Manifesto.js — le bandeau sombre qui sépare le hero de « Notre histoire ».
//
// C'est une respiration : une seule phrase, en grand, sur fond prune.
// Le texte vient du CMS. TexteRicheEnLigne rend les fragments SANS
// paragraphe autour : un <p> à l'intérieur d'un <blockquote> stylé
// casserait la taille de police.

import { TexteRicheEnLigne } from './TexteRiche'

export default function Manifesto({ site }) {
  return (
    <div className="manifesto">
      <blockquote className="apparition">
        &ldquo;<TexteRicheEnLigne valeur={site.citationBandeau} />&rdquo;
      </blockquote>
    </div>
  )
}
