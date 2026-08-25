#!/usr/bin/env bash
#
# heberger-tour.sh — publie le site depuis CETTE machine, le temps que la
# cliente le teste.
#
# CE QUE ÇA FAIT
#   1. construit le site en lisant le contenu publié dans Sanity
#   2. le sert avec `next start`
#   3. ouvre un tunnel Cloudflare et affiche l'adresse publique
#
# La cliente peut ensuite modifier son contenu dans le Studio : le site
# se met à jour tout seul en une minute, sans que personne ne relance
# quoi que ce soit ici. C'est la régénération incrémentale — voir
# lib/revalidation.js.
#
# CE QUE ÇA NE FAIT PAS
#   · aucun port n'est ouvert sur la box : le tunnel sort, il n'entre pas ;
#   · aucun certificat à gérer : Cloudflare fournit le HTTPS ;
#   · aucune adresse stable : l'URL change à chaque redémarrage. Pour une
#     adresse fixe il faut un domaine à vous, déclaré chez Cloudflare.
#
# HSTS reste DÉSACTIVÉ ici, volontairement. Sur un domaine partagé comme
# trycloudflare.com, `includeSubDomains` casserait, dans le navigateur du
# visiteur, tous les autres sites en .trycloudflare.com — pour deux ans,
# sans marche arrière. Voir le bloc « HSTS » de next.config.js.
#
# Usage :
#   ./scripts/heberger-tour.sh              # port 3000
#   PORT=4000 ./scripts/heberger-tour.sh
#   ./scripts/heberger-tour.sh --sans-build # réutilise le build existant

set -euo pipefail

PORT="${PORT:-3000}"
RACINE="$(cd "$(dirname "$0")/.." && pwd)"
JOURNAL="$(mktemp -d)/tunnel.log"
AVEC_BUILD=1

for arg in "$@"; do
  case "$arg" in
    --sans-build) AVEC_BUILD=0 ;;
    -h|--help) grep '^#' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Argument inconnu : $arg" >&2; exit 1 ;;
  esac
done

cd "$RACINE"

# ── Node : les paquets Sanity exigent 20.19 minimum ───────────────
# Sur une machine restée en Node 18, le message d'erreur parle de
# `ERR_REQUIRE_ESM` et ne mentionne jamais la version. On vérifie donc
# nous-mêmes, et on cherche un Node récent aux endroits habituels.
version_ok() {
  local v; v="$("$1" -v 2>/dev/null | tr -d 'v')" || return 1
  local majeur="${v%%.*}"; local reste="${v#*.}"; local mineur="${reste%%.*}"
  [ "$majeur" -gt 20 ] || { [ "$majeur" -eq 20 ] && [ "$mineur" -ge 19 ]; }
}

if ! version_ok node; then
  for candidat in "$HOME/.local/node22/bin" "$HOME/.nvm/versions/node"/*/bin; do
    if [ -x "$candidat/node" ] && version_ok "$candidat/node"; then
      PATH="$candidat:$PATH"; break
    fi
  done
fi

if ! version_ok node; then
  echo "Node 20.19 ou plus récent est nécessaire (trouvé : $(node -v 2>/dev/null || echo aucun))." >&2
  echo "Voir .nvmrc — la version attendue est 22.23.2." >&2
  exit 1
fi

command -v cloudflared >/dev/null || {
  echo "cloudflared est introuvable." >&2
  echo "  curl -sL -o ~/.local/bin/cloudflared \\" >&2
  echo "    https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64" >&2
  echo "  chmod +x ~/.local/bin/cloudflared" >&2
  exit 1
}

# ── Ménage : une exécution précédente peut encore tourner ─────────
nettoyer() {
  [ -n "${PID_SITE:-}" ]   && kill "$PID_SITE"   2>/dev/null || true
  [ -n "${PID_TUNNEL:-}" ] && kill "$PID_TUNNEL" 2>/dev/null || true
}
trap nettoyer EXIT INT TERM

# ── 0. Le port est-il libre ? ─────────────────────────────────────
#
# Sans ce contrôle, une exécution précédente restée en vie rend la panne
# INVISIBLE : le serveur de ce script échoue à se lier au port, meurt
# aussitôt, mais le test « le site répond-il ? » réussit quand même —
# c'est l'ANCIEN serveur qui répond. Le tunnel s'ouvre, annonce une
# adresse, puis se referme dès que le script constate la mort de son
# serveur. Le visiteur récolte une « Error 1033 » sans rien comprendre.
if command -v ss >/dev/null 2>&1; then
  OCCUPANT="$(ss -lptn "sport = :${PORT}" 2>/dev/null | grep -oP 'pid=\K[0-9]+' | head -1 || true)"
  if [ -n "${OCCUPANT:-}" ]; then
    echo "Le port ${PORT} est déjà utilisé par le processus ${OCCUPANT}." >&2
    echo "  Arrêtez l'hébergement en cours :  ./scripts/arreter-tour.sh" >&2
    echo "  Ou choisissez un autre port :     PORT=3001 $0" >&2
    exit 1
  fi
fi

# ── 1. Construction ───────────────────────────────────────────────
if [ "$AVEC_BUILD" = 1 ]; then
  echo "Construction du site (contenu lu dans Sanity)…"
  # `set -o pipefail` est actif : si le build échoue, le tuyau échoue aussi.
  # On ne masque qu'un avertissement connu et sans effet de @sanity/image-url,
  # répété sept fois par build ; tout le reste de stderr passe.
  npm run build 2>&1 \
    | grep -v 'The default export of @sanity/image-url' \
    | grep -vE '^\s*$' >/dev/null \
    || { echo "Le build a échoué — rien n'est publié." >&2; exit 1; }
  echo "  build terminé."
fi

# ── 2. Le site ────────────────────────────────────────────────────
# `next` est lancé DIRECTEMENT, pas via `npm start`.
#
# npm lance next-server en petit-fils : tuer npm laisse le serveur vivant,
# le port occupé, et l'exécution suivante échoue sur « port déjà utilisé ».
# En le lançant sans intermédiaire, $PID_SITE désigne vraiment le serveur
# et le nettoyage fonctionne.
echo "Démarrage du serveur sur le port ${PORT}…"
node node_modules/next/dist/bin/next start --port "$PORT" >/dev/null 2>&1 &
PID_SITE=$!

for _ in $(seq 1 60); do
  curl -sf -o /dev/null "http://127.0.0.1:${PORT}" && break
  kill -0 "$PID_SITE" 2>/dev/null || { echo "Le serveur s'est arrêté au démarrage." >&2; exit 1; }
  sleep 1
done

# Deux conditions, pas une : le port répond ET c'est bien notre processus
# qui est en vie. La première seule se satisfait du serveur d'un voisin.
curl -sf -o /dev/null "http://127.0.0.1:${PORT}" || {
  echo "Le site n'a pas répondu sur le port ${PORT}." >&2; exit 1; }
kill -0 "$PID_SITE" 2>/dev/null || {
  echo "Le serveur de ce script est mort alors que le port répond encore." >&2
  echo "Un autre serveur occupe le port ${PORT} : ./scripts/arreter-tour.sh" >&2
  exit 1; }
echo "  le site répond en local."

# ── 3. Le tunnel ──────────────────────────────────────────────────
echo "Ouverture du tunnel…"
cloudflared tunnel --url "http://localhost:${PORT}" >"$JOURNAL" 2>&1 &
PID_TUNNEL=$!

ADRESSE=""
for _ in $(seq 1 40); do
  ADRESSE="$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$JOURNAL" | head -1 || true)"
  [ -n "$ADRESSE" ] && break
  kill -0 "$PID_TUNNEL" 2>/dev/null || { echo "Le tunnel s'est arrêté. Journal : $JOURNAL" >&2; exit 1; }
  sleep 3
done

[ -n "$ADRESSE" ] || { echo "Aucune adresse obtenue. Journal : $JOURNAL" >&2; exit 1; }

# Cloudflare annonce l'adresse dans son journal AVANT que ses serveurs de
# bordure ne la connaissent tous. Tester dans la seconde donne un échec
# alors que tout va bien : on réessaie pendant une minute.
JOIGNABLE=0
for _ in $(seq 1 12); do
  if curl -sf -o /dev/null --max-time 15 "$ADRESSE"; then JOIGNABLE=1; break; fi
  kill -0 "$PID_TUNNEL" 2>/dev/null || { echo "Le tunnel s'est arrêté. Journal : $JOURNAL" >&2; exit 1; }
  sleep 5
done

[ "$JOIGNABLE" = 1 ] || {
  echo "Le tunnel est ouvert mais le site ne répond pas au travers après 60 s." >&2
  echo "Journal : $JOURNAL" >&2
  exit 1
}

echo
echo "  ┌──────────────────────────────────────────────────────────┐"
echo "  │  Le site est en ligne, à cette adresse :                 │"
echo "  └──────────────────────────────────────────────────────────┘"
echo
echo "      $ADRESSE"
echo
echo "  Le back-office :  https://mgym.sanity.studio"
echo
echo "  Une modification publiée dans le Studio apparaît sur le site"
echo "  en une minute environ. Rien à relancer ici."
echo
echo "  Cette fenêtre doit rester ouverte. Ctrl+C arrête tout, et"
echo "  l'adresse ci-dessus cesse alors de fonctionner — la prochaine"
echo "  exécution en donnera une autre."
echo

wait "$PID_SITE"
