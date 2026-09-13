#!/usr/bin/env bash
#
# sauvegarder.sh — exporte tout le contenu de Sanity dans une archive.
#
# POURQUOI C'EST LA PIÈCE ESSENTIELLE
#
# Le forfait gratuit de Sanity n'offre que deux rôles : Administrator et
# Viewer. Pour que la cliente modifie son site, elle doit être
# Administrator — donc capable de supprimer le dataset, les jetons, les
# membres. Il n'existe aucun rôle intermédiaire en dessous du forfait
# Growth.
#
# Le garde-fou n'est donc pas le rôle, c'est CETTE archive. Sans elle, une
# suppression accidentelle est définitive.
#
# À lancer avant chaque intervention importante, et une fois par mois.
#
# L'archive est écrite HORS du dépôt : elle pèse plusieurs mégaoctets, et
# le dépôt est public.
#
# Usage :
#   npm run sauvegarde
#   DOSSIER=/media/disque-externe npm run sauvegarde

set -euo pipefail

RACINE="$(cd "$(dirname "$0")/.." && pwd)"
DOSSIER="${DOSSIER:-$(cd "$RACINE/../.." && pwd)/Sauvegardes-MGYM}"
ARCHIVE="$DOSSIER/mgym-production-$(date +%Y-%m-%d).tar.gz"

# Node 20.19 minimum, comme tout le reste de l'outillage Sanity.
if ! node -e "process.exit(process.versions.node.split('.').map(Number)[0] >= 20 ? 0 : 1)" 2>/dev/null; then
  for c in "$HOME/.local/node22/bin" "$HOME/.nvm/versions/node"/*/bin; do
    [ -x "$c/node" ] && { PATH="$c:$PATH"; break; }
  done
fi

mkdir -p "$DOSSIER"
cd "$RACINE"
npx sanity dataset export production "$ARCHIVE" --overwrite

# Une sauvegarde que personne n'a ouverte n'est pas une sauvegarde.
TEMPO="$(mktemp -d)"
trap 'rm -rf "$TEMPO"' EXIT
tar xzf "$ARCHIVE" -C "$TEMPO"

node -e '
const fs = require("fs"), path = require("path")
const racine = process.argv[1]
const trouver = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? trouver(path.join(d, e.name)) : path.join(d, e.name))
const fichiers = trouver(racine)
const nd = fichiers.find(f => f.endsWith("data.ndjson"))
if (!nd) { console.error("  ARCHIVE INVALIDE : data.ndjson absent"); process.exit(1) }
const docs = fs.readFileSync(nd, "utf8").trim().split("\n").filter(Boolean).map(JSON.parse)
const contenu = docs.filter(d => !d._type.startsWith("sanity."))
const images = fichiers.filter(f => f.includes("/images/")).length
if (contenu.length === 0) { console.error("  ARCHIVE VIDE : aucun document"); process.exit(1) }
console.log(`  vérifiée : ${contenu.length} documents, ${images} images`)
' "$TEMPO"

echo "  $ARCHIVE"
