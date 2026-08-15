// build-standalone.js — assemble le site depuis l'export Next (out/)
//
// Deux formats de sortie, au choix :
//
//   node build-standalone.js --variant=sentier
//     → UN SEUL FICHIER "Site-MGYM-sentier.html" (~6 Mo), images intégrées en
//       base64. Pratique à envoyer par mail, mais lourd.
//
//   node build-standalone.js --variant=sentier --dossier
//     → dépose la page dans LE dossier unique "Livraison-MGYM/", aux côtés
//       du dossier Images/, du fond et d'un LISEZ-MOI. Lancé une fois par
//       variante (npm run livraison), on obtient un seul dossier contenant
//       les DEUX versions du site qui partagent les mêmes photos. Plus léger
//       que le fichier unique, et les photos restent visibles et
//       remplaçables. C'est le format à déposer sur Google Drive.
//
// Dans les deux cas : CSS intégré, polices Google, et les animations/menu
// reproduits en JS inline (l'assemblage retire tous les <script> de Next).

const fs = require('fs')
const path = require('path')

const ROOT = __dirname
const OUT = path.join(ROOT, 'out')

// 1) Récupère le HTML rendu et isole l'intérieur du <body>
const indexHtml = fs.readFileSync(path.join(OUT, 'index.html'), 'utf8')
let body = indexHtml.replace(/^[\s\S]*?<body[^>]*>/, '').replace(/<\/body>[\s\S]*$/, '')
// Retire tous les <script> de Next (hydratation, chunks /_next) — inutiles ici
body = body.replace(/<script[\s\S]*?<\/script>/g, '')
// Retire les commentaires d'hydratation React (<!--...-->)
body = body.replace(/<!--[\s\S]*?-->/g, '')

// 2) CSS global du site
let css = fs.readFileSync(path.join(ROOT, 'app', 'globals.css'), 'utf8')

// 3) Traitement des images
// Toutes les références du site sont absolues ("/Images/xxx", "/fond1.avif").
// Selon le format demandé on les transforme en data URI (fichier unique) ou
// en chemin relatif ("Images/xxx", à côté du index.html).
const mime = { '.avif': 'image/avif', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' }
const dataUri = (file) => {
  const ext = path.extname(file).toLowerCase()
  const b64 = fs.readFileSync(file).toString('base64')
  return `data:${mime[ext] || 'application/octet-stream'};base64,${b64}`
}

// `transforme` reçoit le chemin relatif de l'image et renvoie ce qu'il faut
// écrire à sa place dans le HTML / le CSS.
const remplaceImages = (str, transforme) => str.replace(/\/(Images\/[^\s"')]+|fond1\.avif)/g, (m, rel) => {
  const abs = path.join(OUT, rel)
  if (!fs.existsSync(abs)) { console.warn('!! image introuvable :', rel); return m }
  return transforme(rel, abs)
})

const variantArg = process.argv.reduce((value, arg) => arg.startsWith('--variant=') ? arg.split('=')[1] : value, 'carousel')
const variant = process.env.MGYM_VARIANT === 'sentier' ? 'sentier' : variantArg === 'sentier' ? 'sentier' : 'carousel'
const fileSuffix = variant === 'sentier' ? 'sentier' : 'carousel'
const enDossier = process.argv.includes('--dossier')

// 4) Script inline : défilement nav + menu mobile + apparition au défilement
const inlineJs = `
  // Nav : ajoute la classe .scrolled après 50px de défilement
  var nav = document.getElementById('nav');
  if (nav) {
    var onScroll = function(){ nav.classList.toggle('scrolled', window.scrollY > 50); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  // Menu mobile (hamburger)
  var ham = document.querySelector('.ham');
  var mob = document.getElementById('mob-menu');
  if (ham && mob) {
    ham.addEventListener('click', function(){ mob.classList.toggle('open'); });
    mob.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ mob.classList.remove('open'); });
    });
  }
  // Apparition en fondu (comme ClientLayout)
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting){ e.target.classList.add('est-apparu'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.apparition, .apparition-gauche, .apparition-droite').forEach(function(el){ io.observe(el); });

  // Étapes du sentier : même principe, mais la classe attendue par le CSS
  // est .est-visible (elle vient d'un state React, pas de .apparition). Sans ce
  // second observateur, les 8 activités resteraient en opacity:0 dans le
  // fichier autonome — la section entière apparaîtrait vide.
  var ioEtapes = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting){ e.target.classList.add('est-visible'); ioEtapes.unobserve(e.target); }
    });
  }, { threshold: 0.25, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.etape').forEach(function(el){ ioEtapes.observe(el); });

  // Filet de sécurité : si JS lent/désactivé sur certains éléments, tout devient visible après 3s
  setTimeout(function(){
    document.querySelectorAll('.apparition, .apparition-gauche, .apparition-droite').forEach(function(el){ el.classList.add('est-apparu'); });
    document.querySelectorAll('.etape').forEach(function(el){ el.classList.add('est-visible'); });
  }, 3000);

  // Sentier des activités : le trait qui se dessine au défilement —
  // équivalent inline du hook useTraceAuScroll de SentierActivites.js.
  // Sans lui le chemin s'affiche d'emblée en entier : le fichier autonome
  // serait moins vivant que le site servi par Next.
  var traitSentier = document.querySelector('.sentier-trait path');
  var cadreSentier = document.querySelector('.activites-sentier');
  if (traitSentier && cadreSentier) {
    var longueurTrait = traitSentier.getTotalLength();
    traitSentier.style.strokeDasharray = String(longueurTrait);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      traitSentier.style.strokeDashoffset = '0';
    } else {
      traitSentier.style.strokeDashoffset = String(longueurTrait);
      var enAttente = false;
      var majTrait = function(){
        enAttente = false;
        var zone = cadreSentier.getBoundingClientRect();
        var avancement = Math.min(Math.max(
          (window.innerHeight - zone.top) / (zone.height + window.innerHeight), 0), 1);
        traitSentier.style.strokeDashoffset = String(longueurTrait * (1 - avancement));
      };
      window.addEventListener('scroll', function(){
        if (!enAttente) { enAttente = true; requestAnimationFrame(majTrait); }
      }, { passive: true });
      majTrait();
    }
  }

  // Sentier des activités : bouton « En savoir plus » — équivalent inline de
  // SentierActivites.js. Même raison que le carrousel plus bas : l'assemblage
  // retire TOUS les <script> de Next, donc sans ce bloc le bouton serait mort
  // et les descriptions des activités invisibles dans le fichier livré.
  // Le panneau est déjà dans le HTML, masqué par l'attribut hidden : React
  // et ce script basculent exactement le même attribut, aucun contenu n'est
  // reconstruit ici.
  document.querySelectorAll('.etape-toggle').forEach(function(bouton){
    var panneau = document.getElementById(bouton.getAttribute('aria-controls'));
    if (!panneau) return;
    var libelle = bouton.querySelector('.etape-toggle-libelle');
    bouton.addEventListener('click', function(){
      var etaitOuvert = bouton.getAttribute('aria-expanded') === 'true';
      bouton.setAttribute('aria-expanded', etaitOuvert ? 'false' : 'true');
      panneau.hidden = etaitOuvert;
      if (libelle) libelle.textContent = etaitOuvert ? 'En savoir plus' : 'Réduire';
    });
  });

  // Carrousel des activités — équivalent inline de CarrouselActivites.js.
  // Obligatoire ici : l'assemblage retire TOUS les <script> de Next, donc
  // sans ce bloc la piste (dont la barre de défilement est masquée en CSS)
  // serait impossible à parcourir dans le fichier autonome.
  var carrousel = document.querySelector('.carrousel');
  var piste = carrousel && carrousel.querySelector('.carrousel-piste');
  if (piste) {
    var TOL = 2;
    var jauge = carrousel.querySelector('.carrousel-jauge');
    var compteur = carrousel.querySelector('.carrousel-compteur');
    var indice = carrousel.querySelector('.carrousel-indice');
    var fleches = carrousel.querySelectorAll('.carrousel-fleche'); // [précédent, suivant]
    var cartes = piste.querySelectorAll('.carte-act');
    var deuxChiffres = function(n){ return String(n).padStart(2, '0'); };
    var pas = function(){
      if (!cartes.length) return piste.clientWidth;
      var espace = parseFloat(getComputedStyle(piste).columnGap) || 0;
      return cartes[0].offsetWidth + espace;
    };
    var index = 0;
    var maj = function(){
      var max = piste.scrollWidth - piste.clientWidth;
      index = Math.min(cartes.length - 1, Math.round(piste.scrollLeft / pas()));
      if (jauge) jauge.style.transform = 'scaleX(' + Math.max(max > 0 ? piste.scrollLeft / max : 0, 0.06) + ')';
      if (compteur) compteur.innerHTML = '<strong>' + deuxChiffres(index + 1) + '</strong> / ' + deuxChiffres(cartes.length);
      var debut = piste.scrollLeft <= TOL, fin = piste.scrollLeft >= max - TOL;
      carrousel.classList.toggle('est-au-debut', debut);
      carrousel.classList.toggle('est-a-la-fin', fin);
      if (fleches[0]) fleches[0].disabled = debut;
      if (fleches[1]) fleches[1].disabled = fin;
    };
    var interagi = function(){ if (indice) indice.classList.add('est-masque'); };
    var allerA = function(cible){
      var borne = Math.max(0, Math.min(cartes.length - 1, cible));
      var doux = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      piste.scrollTo({ left: borne * pas(), behavior: doux ? 'smooth' : 'auto' });
      interagi();
    };
    piste.addEventListener('wheel', function(e){
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      var max = piste.scrollWidth - piste.clientWidth;
      if (max <= 0) return;
      // On rend la main au défilement vertical de la page une fois en bout
      if (e.deltaY > 0 ? piste.scrollLeft >= max - TOL : piste.scrollLeft <= TOL) return;
      e.preventDefault();
      piste.scrollLeft += e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY;
      interagi();
    }, { passive: false });
    piste.addEventListener('scroll', maj, { passive: true });
    piste.addEventListener('pointerdown', interagi);
    piste.addEventListener('keydown', function(e){
      if (e.key === 'ArrowRight') { e.preventDefault(); allerA(index + 1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); allerA(index - 1); }
      else if (e.key === 'Home') { e.preventDefault(); allerA(0); }
      else if (e.key === 'End') { e.preventDefault(); allerA(cartes.length - 1); }
    });
    if (fleches[0]) fleches[0].addEventListener('click', function(){ allerA(index - 1); });
    if (fleches[1]) fleches[1].addEventListener('click', function(){ allerA(index + 1); });
    window.addEventListener('resize', maj);
    maj();
  }
`

// 5) Assemblage final
// Les images sont résolues ici, différemment selon le format demandé.
const transformeImage = enDossier
  ? (rel) => rel                    // "Images/xxx" : fichier voisin du index.html
  : (rel, abs) => dataUri(abs)      // data:image/... : tout dans un seul fichier
const corps = remplaceImages(body, transformeImage)
const styles = remplaceImages(css, transformeImage)

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>M'GYM — Bien-être &amp; Santé · Mirepoix-sur-Tarn</title>
<meta name="description" content="Association sport et bien-être à Mirepoix-sur-Tarn. Pilates, Yoga, Yogilates, Gym Bien-être, Forme & Force avec Emmanuelle Franc.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
:root { --font-serif: 'Cormorant Garamond'; --font-sans: 'Montserrat'; }
${styles}
</style>
</head>
<body>
${corps}
<script>
document.addEventListener('DOMContentLoaded', function(){
${inlineJs}
});
</script>
</body>
</html>`

// 6) Écriture
// Un SEUL dossier de livraison contient les deux versions du site : elles
// partagent le même dossier Images/, le même fond et le même LISEZ-MOI.
// Chaque variante n'y dépose que sa page HTML — d'où le nom de fichier
// explicite plutôt qu'un « index.html » qui serait écrasé par l'autre.
const DOSSIER_LIVRAISON = 'Livraison-MGYM'
const nomPage = {
  carousel: 'Site-MGYM-activites-en-cartes.html',
  sentier: 'Site-MGYM-activites-en-chemin.html',
}

// Note glissée dans le dossier, à destination de la cliente (pas d'un
// développeur) : elle doit pouvoir ouvrir le site sans rien installer.
const lisezMoi = `SITE M'GYM — Bien-être & Santé
Mirepoix-sur-Tarn

DEUX VERSIONS À COMPARER
------------------------
Ce dossier contient le même site, présenté de deux façons. Seule
la partie "Nos activités" change ; tout le reste est identique.

  ${nomPage.carousel}
      Les activités sont des cartes qui défilent de gauche à droite.

  ${nomPage.sentier}
      Les activités jalonnent un chemin qui descend dans la page.

Ouvrez les deux, puis dites-nous celle que vous préférez.

COMMENT OUVRIR LE SITE
----------------------
Double-cliquez sur l'un des deux fichiers .html ci-dessus.
Le site s'ouvre dans votre navigateur habituel (Chrome, Firefox, Edge,
Safari). Aucune installation n'est nécessaire.

Si vous avez téléchargé ce dossier depuis Google Drive sous forme de
fichier .zip : décompressez-le d'abord (clic droit > Extraire tout),
puis ouvrez le fichier .html dans le dossier obtenu.

IMPORTANT
---------
Gardez toujours les fichiers .html, le dossier "Images" et "fond1.avif"
ENSEMBLE dans le même dossier. Si vous déplacez une page .html toute
seule ailleurs, les photos ne s'afficheront plus.

Les textes du site s'affichent avec leurs vraies polices si vous êtes
connecté à Internet. Hors connexion le site reste parfaitement lisible,
simplement avec des polices de remplacement.

REMPLACER UNE PHOTO
-------------------
Ouvrez le dossier "Images", et remplacez le fichier voulu par le vôtre
en lui donnant EXACTEMENT le même nom. La photo sera reprise
automatiquement à la prochaine ouverture du site, dans les deux versions.

Ce dossier est une copie du site à consulter et à faire relire.
Pour toute modification du contenu, contactez la personne qui gère
le site.
`

const poids = (chemin) => (fs.statSync(chemin).size / 1024).toFixed(0) + ' Ko'

// Poids total d'un dossier, pour l'annoncer en fin de build.
const poidsDossier = (dossier) => {
  let total = 0
  for (const entree of fs.readdirSync(dossier, { withFileTypes: true })) {
    const chemin = path.join(dossier, entree.name)
    total += entree.isDirectory() ? Number(poidsDossier(chemin)) * 1024 : fs.statSync(chemin).size
  }
  return (total / 1024).toFixed(0)
}

if (!enDossier) {
  const dest = path.join(ROOT, `Site-MGYM-${fileSuffix}.html`)
  fs.writeFileSync(dest, html)
  console.log('OK ->', dest, '(' + poids(dest) + ')')
} else {
  // Dossier unique prêt à déposer sur Google Drive.
  // On ne vide JAMAIS le dossier : les deux variantes s'y écrivent l'une
  // après l'autre (npm run livraison), et un nettoyage effacerait la page
  // déposée par le passage précédent. Chaque exécution se contente donc de
  // réécrire sa propre page et de rafraîchir les fichiers communs.
  const dossier = path.join(ROOT, DOSSIER_LIVRAISON)
  fs.mkdirSync(dossier, { recursive: true })

  const page = nomPage[fileSuffix]
  fs.writeFileSync(path.join(dossier, page), html)

  fs.rmSync(path.join(dossier, 'Images'), { recursive: true, force: true })
  fs.cpSync(path.join(OUT, 'Images'), path.join(dossier, 'Images'), { recursive: true })
  fs.copyFileSync(path.join(OUT, 'fond1.avif'), path.join(dossier, 'fond1.avif'))
  fs.writeFileSync(path.join(dossier, 'LISEZ-MOI.txt'), lisezMoi)

  const pagesPresentes = Object.values(nomPage).filter((p) => fs.existsSync(path.join(dossier, p)))
  console.log('OK ->', dossier + '/ (' + poidsDossier(dossier) + ' Ko)')
  console.log('     ' + pagesPresentes.join(' + '))
  console.log('     Images/ + fond1.avif + LISEZ-MOI.txt')
}
