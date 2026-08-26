#!/usr/bin/env bash
#
# adresse-tour.sh — retrouve l'adresse publique de l'hébergement en cours.
#
# heberger-tour.sh ne l'affiche qu'une fois, au démarrage. Fenêtre fermée
# ou machine redémarrée, l'adresse est perdue alors que le tunnel tourne
# toujours — et comme chaque démarrage tire un nom au hasard, l'ancienne
# adresse ne fonctionne plus. D'où ce script.
#
# Usage :  ./scripts/adresse-tour.sh

set -uo pipefail

PORT="${PORT:-3000}"
JOURNAL="${TMPDIR:-/tmp}/mgym-tunnel-${PORT}.log"
MOTIF='https://[a-z0-9-]+\.(trycloudflare\.com|lhr\.life)'

PID="$(pgrep -f "[c]loudflared tunnel" | head -1 || true)"
[ -n "$PID" ] || PID="$(pgrep -f "[s]sh .*localhost\.run" | head -1 || true)"

if [ -z "$PID" ]; then
  echo "  Aucun tunnel en cours."
  echo "  Pour démarrer :  ./scripts/heberger-tour.sh"
  exit 1
fi

# Le journal est à un emplacement connu. En dernier recours seulement, on
# demande au noyau vers quel fichier pointe la sortie du processus : c'est
# utile si le tunnel a été lancé à la main, hors du script.
if [ ! -f "$JOURNAL" ]; then
  JOURNAL="$(readlink "/proc/$PID/fd/1" 2>/dev/null || true)"
fi

ADRESSE=""
[ -f "${JOURNAL:-}" ] && ADRESSE="$(grep -oE "$MOTIF" "$JOURNAL" | tail -1 || true)"

if [ -z "$ADRESSE" ]; then
  echo "  Tunnel actif (pid $PID) mais son adresse est introuvable."
  echo "  Relancez :  ./scripts/arreter-tour.sh && ./scripts/heberger-tour.sh"
  exit 1
fi

# Deux adresses, et la distinction compte.
#
# L'adresse locale ne change JAMAIS et ne dépend ni d'un tunnel ni d'un
# DNS : c'est la meilleure pour tester depuis un téléphone connecté au
# même Wi-Fi. L'adresse publique change à chaque démarrage, mais elle
# fonctionne de partout.
# Une machine a souvent PLUSIEURS interfaces, sur des sous-réseaux
# différents — ici l'Ethernet en 192.168.2.x et le Wi-Fi en 192.168.10.x.
# N'en afficher qu'une envoie l'utilisateur sur le mauvais réseau : son
# téléphone, connecté au Wi-Fi, ne peut pas joindre l'adresse Ethernet.
# On les liste donc toutes, avec l'interface, et on ne garde que celles
# qui répondent vraiment.
echo
PREMIERE=1
while read -r IFACE IP; do
  curl -sf -o /dev/null --max-time 3 "http://${IP}:${PORT}" || continue
  if [ "$PREMIERE" = 1 ]; then
    echo "  Depuis un appareil du même réseau — ces adresses ne changent pas :"
    echo
    PREMIERE=0
  fi
  printf "      http://%s:%s   (%s)\n" "$IP" "$PORT" "$IFACE"
done < <(ip -4 -o addr show 2>/dev/null \
  | awk '$2 != "lo" {split($4, a, "/"); print $2, a[1]}')
[ "$PREMIERE" = 0 ] && echo
echo "  Depuis n'importe où — change à chaque démarrage :"
echo
echo "      $ADRESSE"
echo
echo "  Tunnel actif depuis $(ps -o etime= -p "$PID" | tr -d ' ')."
echo "  Back-office : https://mgym.sanity.studio"
echo

# Un tunnel vivant ne garantit pas un site vivant.
if curl -sf -o /dev/null --max-time 10 "http://127.0.0.1:${PORT}"; then
  echo "  Le site répond bien en local."
else
  echo "  ATTENTION : le tunnel tourne mais le site ne répond pas sur le port ${PORT}."
  echo "  Relancez :  ./scripts/arreter-tour.sh && ./scripts/heberger-tour.sh"
fi
