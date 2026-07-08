#!/usr/bin/env bash
#
# launch.sh — Vérifie et lance le site Mgym (Next.js)
#
# Étapes :
#   1. Vérifie que Node.js et npm sont installés
#   2. Installe les dépendances si nécessaire
#   3. Build le site (échoue ici si le code ne compile pas)
#   4. Lance le serveur de production
#   5. Attend que le site réponde (health check HTTP) avant de rendre la main
#
# Usage :
#   ./launch.sh           # build + lance en production (port 3000)
#   ./launch.sh --dev     # lance en mode développement (sans build)
#   PORT=4000 ./launch.sh # change le port

set -euo pipefail

# --- Configuration ---------------------------------------------------------
PORT="${PORT:-3000}"
HOST="127.0.0.1"
URL="http://${HOST}:${PORT}"
HEALTH_TIMEOUT=60        # secondes max pour attendre le démarrage
MODE="prod"

# Couleurs
RED=$'\033[0;31m'; GREEN=$'\033[0;32m'; YELLOW=$'\033[1;33m'; NC=$'\033[0m'
info()  { echo "${GREEN}[OK]${NC}    $*"; }
warn()  { echo "${YELLOW}[..]${NC}    $*"; }
error() { echo "${RED}[ERREUR]${NC} $*" >&2; }

# Se placer dans le dossier du script
cd "$(dirname "$0")"

# --- Arguments -------------------------------------------------------------
for arg in "$@"; do
  case "$arg" in
    --dev) MODE="dev" ;;
    -h|--help)
      grep '^#' "$0" | sed 's/^# \{0,1\}//'
      exit 0 ;;
    *) error "Argument inconnu : $arg"; exit 1 ;;
  esac
done

# --- 1. Vérification de l'environnement ------------------------------------
warn "Vérification de l'environnement..."
command -v node >/dev/null 2>&1 || { error "Node.js n'est pas installé."; exit 1; }
command -v npm  >/dev/null 2>&1 || { error "npm n'est pas installé."; exit 1; }
info "Node $(node -v) / npm $(npm -v)"

# --- 2. Dépendances --------------------------------------------------------
if [ ! -d node_modules ]; then
  warn "node_modules absent, installation des dépendances..."
  npm install
  info "Dépendances installées."
else
  info "Dépendances présentes."
fi

# --- 3. Build (mode production uniquement) ---------------------------------
if [ "$MODE" = "prod" ]; then
  warn "Build du site (vérification que le code compile)..."
  if ! npm run build; then
    error "Le build a échoué — le site n'est PAS lancé."
    exit 1
  fi
  info "Build réussi."
  START_CMD=(npm run start -- --port "$PORT" --hostname "$HOST")
else
  START_CMD=(npm run dev -- --port "$PORT" --hostname "$HOST")
fi

# --- 4. Lancement du serveur ----------------------------------------------
warn "Lancement du serveur (${MODE}) sur ${URL}..."
"${START_CMD[@]}" &
SERVER_PID=$!

# Arrêt propre du serveur si on quitte le script (Ctrl+C, erreur...)
cleanup() {
  if kill -0 "$SERVER_PID" 2>/dev/null; then
    warn "Arrêt du serveur (pid $SERVER_PID)..."
    kill "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

# --- 5. Health check -------------------------------------------------------
warn "Attente de la réponse du site (max ${HEALTH_TIMEOUT}s)..."
elapsed=0
until curl -sf -o /dev/null "$URL"; do
  # Le serveur a-t-il crashé ?
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    error "Le serveur s'est arrêté avant de répondre."
    exit 1
  fi
  if [ "$elapsed" -ge "$HEALTH_TIMEOUT" ]; then
    error "Le site n'a pas répondu après ${HEALTH_TIMEOUT}s."
    exit 1
  fi
  sleep 1
  elapsed=$((elapsed + 1))
done

info "Le site répond correctement → ${URL}"
echo
echo "${GREEN}==> Site lancé et fonctionnel sur ${URL}${NC}"
echo "    (Ctrl+C pour arrêter)"

# Garde le script vivant tant que le serveur tourne
wait "$SERVER_PID"
