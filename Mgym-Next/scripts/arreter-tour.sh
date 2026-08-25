#!/usr/bin/env bash
#
# arreter-tour.sh — arrête l'hébergement lancé par heberger-tour.sh.
#
# À lancer quand la cliente a fini de regarder : rien ne sert à laisser
# la tour servir un site que personne ne consulte.
#
# CE QUE ÇA ARRÊTE
#   · le serveur Next (le site)
#   · le tunnel Cloudflare (l'adresse publique)
#
# CE QUE ÇA N'ARRÊTE PAS
#   · Sanity, qui n'a jamais tourné ici. Le back-office reste accessible
#     sur https://mgym.sanity.studio, et le contenu y reste intact.
#
# L'adresse publique cesse de fonctionner immédiatement. La prochaine
# exécution de heberger-tour.sh en donnera une AUTRE : les tunnels
# gratuits tirent un nom au hasard à chaque démarrage.
#
# Usage :  ./scripts/arreter-tour.sh

set -uo pipefail

PORT="${PORT:-3000}"
arretes=0

# On cherche par PORT, pas par nom de processus.
#
# `pkill -f "next start"` semble plus simple, mais le motif se trouve
# alors dans la ligne de commande de pkill lui-même : il se tue en même
# temps que sa cible, et parfois le terminal avec. Rencontré deux fois.
if command -v ss >/dev/null 2>&1; then
  for pid in $(ss -lptn "sport = :${PORT}" 2>/dev/null | grep -oP 'pid=\K[0-9]+' | sort -u); do
    kill "$pid" 2>/dev/null && { echo "  serveur du site arrêté (port ${PORT}, pid ${pid})"; arretes=$((arretes+1)); }
  done
fi

# Le tunnel n'écoute sur aucun port : on le désigne par son exécutable.
# Les crochets empêchent le motif de se reconnaître lui-même.
for pid in $(pgrep -f "[c]loudflared tunnel" 2>/dev/null); do
  kill "$pid" 2>/dev/null && { echo "  tunnel Cloudflare fermé (pid ${pid})"; arretes=$((arretes+1)); }
done

sleep 2

# Les récalcitrants, s'il en reste.
for pid in $(pgrep -f "[n]ext-server" 2>/dev/null) $(pgrep -f "[c]loudflared tunnel" 2>/dev/null); do
  kill -9 "$pid" 2>/dev/null && echo "  processus ${pid} forcé"
done

if [ "$arretes" -eq 0 ]; then
  echo "  Rien ne tournait."
else
  echo
  echo "  Hébergement arrêté. L'adresse publique ne répond plus."
  echo "  Le back-office reste en ligne : https://mgym.sanity.studio"
fi
