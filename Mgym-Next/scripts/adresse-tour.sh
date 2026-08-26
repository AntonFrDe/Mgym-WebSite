#!/usr/bin/env bash
#
# adresse-tour.sh — retrouve l'adresse publique de l'hébergement en cours.
#
# heberger-tour.sh n'affiche l'adresse qu'une fois, au démarrage. Si la
# fenêtre a été fermée, ou si la machine a redémarré et que le script a
# été relancé, cette adresse est perdue — alors que le tunnel, lui,
# tourne toujours. Et comme chaque démarrage tire un nom au hasard,
# l'ancienne adresse ne fonctionne plus.
#
# Ce script va la relire dans le journal du processus vivant.
#
# Usage :  ./scripts/adresse-tour.sh

set -uo pipefail

PID="$(pgrep -f "[c]loudflared tunnel" | head -1 || true)"

if [ -z "$PID" ]; then
  echo "  Aucun tunnel en cours."
  echo "  Pour démarrer :  ./scripts/heberger-tour.sh"
  exit 1
fi

# cloudflared écrit son journal sur sa sortie standard ; /proc dit vers
# quel fichier elle pointe.
JOURNAL="$(readlink "/proc/$PID/fd/1" 2>/dev/null || true)"

if [ ! -f "${JOURNAL:-}" ]; then
  echo "  Tunnel actif (pid $PID) mais son journal est introuvable."
  echo "  Relancez pour obtenir une adresse :  ./scripts/arreter-tour.sh && ./scripts/heberger-tour.sh"
  exit 1
fi

ADRESSE="$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$JOURNAL" | tail -1 || true)"

if [ -z "$ADRESSE" ]; then
  echo "  Tunnel actif (pid $PID) mais aucune adresse dans son journal."
  exit 1
fi

echo
echo "      $ADRESSE"
echo
echo "  Tunnel actif depuis $(ps -o etime= -p "$PID" | tr -d ' ')."
echo "  Back-office : https://mgym.sanity.studio"
echo

# Le site répond-il derrière ? Un tunnel vivant ne garantit pas un site vivant.
if curl -sf -o /dev/null --max-time 10 "http://127.0.0.1:${PORT:-3000}"; then
  echo "  Le site répond bien en local."
else
  echo "  ATTENTION : le tunnel tourne mais le site ne répond pas sur le port ${PORT:-3000}."
  echo "  Relancez :  ./scripts/arreter-tour.sh && ./scripts/heberger-tour.sh"
fi
