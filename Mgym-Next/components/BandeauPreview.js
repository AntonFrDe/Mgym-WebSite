// BandeauPreview.js — le bandeau « mode prévisualisation ».
//
// Il n'apparaît QUE lorsque la session de prévisualisation est active et
// valide. Sur le site public, ce composant n'est jamais rendu : le layout
// ne l'appelle que si previewActif() renvoie vrai.
//
// Sans lui, la cliente pourrait croire que ses modifications sont en ligne
// alors qu'elles ne le sont pas — la confusion la plus coûteuse du système.

export default function BandeauPreview() {
  return (
    <div className="bandeau-preview" role="status">
      <span className="bandeau-preview-texte">
        <strong>Mode prévisualisation</strong> — cette page contient des
        modifications qui ne sont pas encore publiées.
      </span>
      <a href="/api/preview-exit" className="bandeau-preview-sortie">
        Revenir au site publié
      </a>
    </div>
  )
}
