// serve.js — sert le dossier `out/` en local, sans aucune dépendance.
//
// POURQUOI CE FICHIER EXISTE
// Le site est exporté en pages statiques (`output: 'export'` dans
// next.config.js). Dans ce mode, `next start` REFUSE de démarrer : il n'y a
// plus de serveur Next à lancer, seulement des fichiers HTML. C'est ce qui
// cassait `npm start` et `./launch.sh` sans que personne s'en aperçoive.
//
// Plutôt que d'ajouter une dépendance npm pour servir quatre fichiers, on
// utilise le module `http` fourni avec Node : c'est le même principe que le
// reste du projet (rien d'installé qui ne soit indispensable).
//
// Usage :
//   node serve.js
//   node serve.js --port 4000 --hostname 0.0.0.0
//   PORT=4000 node serve.js

const http = require('http')
const fs = require('fs')
const path = require('path')

const RACINE = path.join(__dirname, 'out')

// Les arguments de la ligne de commande l'emportent sur les variables
// d'environnement, elles-mêmes prioritaires sur les valeurs par défaut.
const lisArgument = (nom, valeurParDefaut) => {
  const i = process.argv.indexOf(`--${nom}`)
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : valeurParDefaut
}

const PORT = Number(lisArgument('port', process.env.PORT || 3000))
const HOTE = lisArgument('hostname', process.env.HOST || '127.0.0.1')

// Type de contenu par extension. Sans en-tête correcte, le navigateur
// affiche le CSS comme du texte brut et n'exécute pas le JavaScript.
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

// Traduit une URL en chemin de fichier, en refusant tout ce qui sortirait
// de `out/` (une URL peut contenir « ../ » : on ne sert que l'intérieur).
function resoudFichier(url) {
  const sansParametres = decodeURIComponent(url.split('?')[0])
  const candidat = path.join(RACINE, path.normalize(sansParametres))
  if (candidat !== RACINE && !candidat.startsWith(RACINE + path.sep)) return null

  // "/" et "/quelquechose" (sans extension) mènent au index.html correspondant.
  if (fs.existsSync(candidat) && fs.statSync(candidat).isDirectory()) {
    return path.join(candidat, 'index.html')
  }
  if (fs.existsSync(candidat)) return candidat
  if (fs.existsSync(candidat + '.html')) return candidat + '.html'
  return null
}

const serveur = http.createServer((requete, reponse) => {
  const fichier = resoudFichier(requete.url)

  if (!fichier || !fs.existsSync(fichier)) {
    reponse.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    reponse.end('404 — page introuvable')
    return
  }

  reponse.writeHead(200, {
    'Content-Type': TYPES[path.extname(fichier).toLowerCase()] || 'application/octet-stream',
  })
  fs.createReadStream(fichier).pipe(reponse)
})

// Message d'erreur explicite si le build n'a pas été lancé : sans ce garde-fou
// le serveur démarre et répond 404 sur tout, ce qui n'aide personne.
if (!fs.existsSync(RACINE)) {
  console.error("Le dossier 'out/' est absent : lancez d'abord `npm run build`.")
  process.exit(1)
}

serveur.listen(PORT, HOTE, () => {
  console.log(`Site M'GYM servi sur http://${HOTE}:${PORT}`)
})
