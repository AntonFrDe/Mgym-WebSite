#!/usr/bin/env bash
#
# heberger-tour.sh — publie le site depuis CETTE machine, le temps que la
# cliente le teste.
#
#   1. construit le site en lisant le contenu publié dans Sanity
#   2. le sert avec `next start`
#   3. ouvre un tunnel et affiche l'adresse publique
#
# La cliente peut ensuite modifier son contenu dans le Studio : le site se
# met à jour tout seul en une minute, sans rien relancer ici. C'est la
# régénération incrémentale — voir lib/revalidation.js.
#
# DEUX FOURNISSEURS DE TUNNEL
#
#   localhost.run   (par défaut) — passe par SSH, rien à installer.
#   cloudflare      — exige cloudflared, et surtout : beaucoup de box et de
#                     fournisseurs d'accès REFUSENT de résoudre les
#                     sous-domaines de trycloudflare.com, très utilisés pour
#                     le hameçonnage. Mesuré sur ce réseau : la box répond
#                     NXDOMAIN là où 1.1.1.1 répond correctement. Le site
#                     devient alors injoignable depuis tout appareil du
#                     réseau, sans le moindre message d'erreur parlant.
#
# Aucun port n'est ouvert sur la box : le tunnel sort, il n'entre pas.
# HSTS reste désactivé — sur un domaine partagé, `includeSubDomains`
# casserait tous les autres sites de ce domaine dans le navigateur du
# visiteur, pour deux ans. Voir le bloc « HSTS » de next.config.js.
#
# Usage :
#   ./scripts/heberger-tour.sh
#   ./scripts/heberger-tour.sh --via=cloudflare
#   ./scripts/heberger-tour.sh --sans-build
#   PORT=4000 ./scripts/heberger-tour.sh
#
# Pour retrouver l'adresse plus tard :  ./scripts/adresse-tour.sh
# Pour tout arrêter :                   ./scripts/arreter-tour.sh

set -euo pipefail

PORT="${PORT:-3000}"
RACINE="$(cd "$(dirname "$0")/.." && pwd)"
JOURNAL="${TMPDIR:-/tmp}/mgym-tunnel-${PORT}.log"
AVEC_BUILD=1
VIA="localhost.run"

for arg in "$@"; do
  case "$arg" in
    --sans-build)      AVEC_BUILD=0 ;;
    --via=cloudflare)  VIA="cloudflare" ;;
    --via=localhost.run) VIA="localhost.run" ;;
    -h|--help) grep '^#' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Argument inconnu : $arg" >&2; exit 1 ;;
  esac
done

cd "$RACINE"

# ── Node : les paquets Sanity exigent 20.19 minimum ───────────────
# Sous Node 18, l'échec est un ERR_REQUIRE_ESM qui ne mentionne jamais la
# version. On vérifie donc nous-mêmes.
version_ok() {
  local v; v="$("$1" -v 2>/dev/null | tr -d 'v')" || return 1
  local maj="${v%%.*}"; local reste="${v#*.}"; local min="${reste%%.*}"
  [ "$maj" -gt 20 ] || { [ "$maj" -eq 20 ] && [ "$min" -ge 19 ]; }
}

if ! version_ok node; then
  for c in "$HOME/.local/node22/bin" "$HOME/.nvm/versions/node"/*/bin; do
    if [ -x "$c/node" ] && version_ok "$c/node"; then PATH="$c:$PATH"; break; fi
  done
fi
version_ok node || {
  echo "Node 20.19 ou plus récent est nécessaire (trouvé : $(node -v 2>/dev/null || echo aucun))." >&2
  echo "Voir .nvmrc — la version attendue est 22.23.2." >&2
  exit 1; }

if [ "$VIA" = "cloudflare" ]; then
  command -v cloudflared >/dev/null || {
    echo "cloudflared est introuvable. Utilisez --via=localhost.run, ou installez-le." >&2
    exit 1; }
else
  command -v ssh >/dev/null || { echo "ssh est introuvable." >&2; exit 1; }
fi

# ── Le port est-il libre ? ────────────────────────────────────────
# Sans ce contrôle, une exécution précédente restée en vie rend la panne
# invisible : notre serveur meurt sur un port pris, mais le test « le site
# répond-il ? » réussit — c'est l'ANCIEN qui répond. Le tunnel s'ouvre sur
# un serveur qui n'est pas le nôtre, puis se referme.
if command -v ss >/dev/null 2>&1; then
  OCCUPANT="$(ss -lptn "sport = :${PORT}" 2>/dev/null | grep -oP 'pid=\K[0-9]+' | head -1 || true)"
  if [ -n "${OCCUPANT:-}" ]; then
    echo "Le port ${PORT} est déjà utilisé par le processus ${OCCUPANT}." >&2
    echo "  Arrêter l'hébergement en cours :  ./scripts/arreter-tour.sh" >&2
    echo "  Ou choisir un autre port :        PORT=3001 $0" >&2
    exit 1
  fi
fi

nettoyer() {
  [ -n "${PID_SITE:-}" ]   && kill "$PID_SITE"   2>/dev/null || true
  [ -n "${PID_TUNNEL:-}" ] && kill "$PID_TUNNEL" 2>/dev/null || true
}
trap nettoyer EXIT INT TERM

# ── 1. Construction ───────────────────────────────────────────────
if [ "$AVEC_BUILD" = 1 ]; then
  echo "Construction du site (contenu lu dans Sanity)…"
  # `set -o pipefail` est actif : un build en échec fait échouer le tuyau.
  # On ne masque qu'un avertissement connu et sans effet, répété sept fois.
  npm run build 2>&1 | grep -v 'The default export of @sanity/image-url' >/dev/null \
    || { echo "Le build a échoué — rien n'est publié." >&2; exit 1; }
  echo "  build terminé."
fi

# ── 2. Le site ────────────────────────────────────────────────────
# `next` est lancé DIRECTEMENT : npm le lancerait en petit-fils, et tuer
# npm laisserait le serveur vivant avec le port occupé.
echo "Démarrage du serveur sur le port ${PORT}…"
node node_modules/next/dist/bin/next start --port "$PORT" >/dev/null 2>&1 &
PID_SITE=$!

for _ in $(seq 1 60); do
  curl -sf -o /dev/null "http://127.0.0.1:${PORT}" && break
  kill -0 "$PID_SITE" 2>/dev/null || { echo "Le serveur s'est arrêté au démarrage." >&2; exit 1; }
  sleep 1
done

# Deux conditions : le port répond ET c'est bien NOTRE processus qui vit.
curl -sf -o /dev/null "http://127.0.0.1:${PORT}" \
  || { echo "Le site n'a pas répondu sur le port ${PORT}." >&2; exit 1; }
kill -0 "$PID_SITE" 2>/dev/null \
  || { echo "Notre serveur est mort alors que le port répond : un autre l'occupe." >&2; exit 1; }
echo "  le site répond en local."

# ── 3. Le tunnel ──────────────────────────────────────────────────
echo "Ouverture du tunnel (${VIA})…"
: > "$JOURNAL"

if [ "$VIA" = "cloudflare" ]; then
  cloudflared tunnel --url "http://localhost:${PORT}" >"$JOURNAL" 2>&1 &
  MOTIF='https://[a-z0-9-]+\.trycloudflare\.com'
else
  ssh -o StrictHostKeyChecking=accept-new -o ServerAliveInterval=30 \
      -o ExitOnForwardFailure=yes \
      -R "80:localhost:${PORT}" nokey@localhost.run >"$JOURNAL" 2>&1 &
  MOTIF='https://[a-z0-9]+\.lhr\.life'
fi
PID_TUNNEL=$!

ADRESSE=""
for _ in $(seq 1 40); do
  ADRESSE="$(grep -oE "$MOTIF" "$JOURNAL" | head -1 || true)"
  [ -n "$ADRESSE" ] && break
  kill -0 "$PID_TUNNEL" 2>/dev/null || { echo "Le tunnel s'est arrêté. Journal : $JOURNAL" >&2; exit 1; }
  sleep 3
done
[ -n "$ADRESSE" ] || { echo "Aucune adresse obtenue. Journal : $JOURNAL" >&2; exit 1; }

# Le fournisseur annonce l'adresse avant que tous ses serveurs de bordure
# ne la connaissent : on laisse une minute.
JOIGNABLE=0
for _ in $(seq 1 12); do
  if curl -sf -o /dev/null --max-time 15 "$ADRESSE"; then JOIGNABLE=1; break; fi
  kill -0 "$PID_TUNNEL" 2>/dev/null || { echo "Le tunnel s'est arrêté. Journal : $JOURNAL" >&2; exit 1; }
  sleep 5
done

echo
echo "  ┌──────────────────────────────────────────────────────────┐"
echo "  │  Le site est en ligne, à cette adresse :                 │"
echo "  └──────────────────────────────────────────────────────────┘"
echo
echo "      $ADRESSE"
echo
echo "  Le back-office :  https://mgym.sanity.studio"
echo

# Un échec ICI n'est pas une raison d'arrêter : cette machine peut très
# bien ne pas résoudre un nom que le reste du monde résout. Interrompre
# fermerait un tunnel qui fonctionne.
if [ "$JOIGNABLE" != 1 ]; then
  echo "  ATTENTION — cette machine n'arrive pas à joindre cette adresse."
  echo "  Essayez-la depuis un téléphone en 4G avant d'en conclure quoi que"
  echo "  ce soit. Journal du tunnel : $JOURNAL"
  echo
fi

echo "  Une modification publiée dans le Studio apparaît sur le site en une"
echo "  minute environ. Rien à relancer ici."
echo
echo "  Cette fenêtre doit rester ouverte. Ctrl+C arrête tout, et l'adresse"
echo "  cesse alors de fonctionner — la prochaine exécution en donnera une"
echo "  autre."
echo

wait "$PID_SITE"
