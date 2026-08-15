// Manifesto.js — le bandeau sombre qui sépare le hero de « Notre histoire ».
//
// C'est une respiration : une seule phrase, en grand, sur fond prune. Le
// <br /> force la coupure au même endroit que dans la maquette ; sur petit
// écran la phrase se replie naturellement autour.
export default function Manifesto() {
  return (
    <div className="manifesto">
      <blockquote className="apparition">
        &ldquo;M&apos;GYM est un espace de <strong>convivialité</strong> et de bien-être<br />
        où prendre soin de soi est un <strong>plaisir</strong>.&rdquo;
      </blockquote>
    </div>
  )
}
