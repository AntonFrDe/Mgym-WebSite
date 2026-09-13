#!/usr/bin/env bash
#
# apercu-mobile.sh — ouvre le site dans une fenêtre aux dimensions d'un
# iPhone 13 : 390 × 844 points CSS.
#
# `--app=` retire la barre d'adresse et les onglets : la fenêtre fait donc
# vraiment 390 px de large, alors qu'un navigateur normal en mangerait une
# partie et fausserait le test.
#
# La densité de pixels (×3 sur un vrai iPhone) n'est PAS simulée : elle ne
# change que la netteté, jamais la mise en page. Ce qui compte pour le
# responsive, c'est la largeur en points.
#
# Usage :
#   npm run mobile                       # http://localhost:3000
#   npm run mobile -- https://…          # une autre adresse
#   LARGEUR=430 HAUTEUR=932 npm run mobile   # iPhone 16 Pro Max

set -uo pipefail

URL="${1:-http://localhost:3000}"
LARGEUR="${LARGEUR:-390}"
HAUTEUR="${HAUTEUR:-844}"

NAVIGATEUR=""
for n in brave-browser google-chrome google-chrome-stable chromium chromium-browser; do
  command -v "$n" >/dev/null && { NAVIGATEUR="$n"; break; }
done

[ -n "$NAVIGATEUR" ] || {
  echo "Aucun navigateur Chromium trouvé (brave, chrome, chromium)." >&2
  echo "Firefox ne sait pas ouvrir une fenêtre d'application dimensionnée." >&2
  exit 1; }

curl -sf -o /dev/null --max-time 5 "$URL" || {
  echo "Rien ne répond sur $URL." >&2
  echo "  Lancez d'abord :  npm run dev" >&2
  exit 1; }

echo "  $NAVIGATEUR — ${LARGEUR}×${HAUTEUR} — $URL"
"$NAVIGATEUR" --app="$URL" --window-size="${LARGEUR},${HAUTEUR}" \
  --user-data-dir="$(mktemp -d)" >/dev/null 2>&1 &
