// build-standalone.js — assemble un fichier HTML AUTONOME depuis l'export Next (out/)
// Résultat : un seul fichier "Site-MGYM.html" avec CSS + images intégrés (base64),
// polices Google, et les animations/menu reproduits en JS inline.
// => la cliente n'a qu'à double-cliquer le fichier.

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

// 3) Table des images -> data URI base64
const mime = { '.avif': 'image/avif', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml' }
const dataUri = (file) => {
  const ext = path.extname(file).toLowerCase()
  const b64 = fs.readFileSync(file).toString('base64')
  return `data:${mime[ext] || 'application/octet-stream'};base64,${b64}`
}

// Remplace toute référence "/Images/xxx" ou "/fond1.jpg" (avec ' " ou )) par le data URI
const replaceAssets = (str) => str.replace(/\/(Images\/[^\s"')]+|fond1\.jpg)/g, (m, rel) => {
  const abs = path.join(OUT, rel)
  if (!fs.existsSync(abs)) { console.warn('!! image introuvable :', rel); return m }
  return dataUri(abs)
})

body = replaceAssets(body)
css = replaceAssets(css)

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
      if (e.isIntersecting){ e.target.classList.add('on'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.sr, .sr-l, .sr-r').forEach(function(el){ io.observe(el); });
  // Filet de sécurité : si JS lent/désactivé sur certains éléments, tout devient visible après 3s
  setTimeout(function(){
    document.querySelectorAll('.sr, .sr-l, .sr-r').forEach(function(el){ el.classList.add('on'); });
  }, 3000);

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
${css}
</style>
</head>
<body>
${body}
<script>
document.addEventListener('DOMContentLoaded', function(){
${inlineJs}
});
</script>
</body>
</html>`

const dest = path.join(ROOT, 'Site-MGYM.html')
fs.writeFileSync(dest, html)
const kb = (fs.statSync(dest).size / 1024).toFixed(0)
console.log('OK ->', dest, '(' + kb + ' Ko)')
