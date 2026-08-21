# Audit final du backend — M'GYM

> Phase 20. Relecture critique de l'ensemble, avec un regard neuf.
> 21 août 2026.

---

## État vérifiable

```
npm run verifier
  ✓ schéma valide            17 types · 9 documents · 3 singletons
  ✓ requêtes valides         13 requêtes, 4 paramètres, 0 concaténation
  ✓ 67 tests, 0 échec
  ✓ build vert
npm audit                    found 0 vulnerabilities
Non-régression visuelle      24 captures, hauteur identique au pixel
Lighthouse (build de prod)   Perf 91 · A11y 96 · BP 100 · SEO 100
```

Lighthouse a été mesuré en local, sur le build de production, en émulation
mobile. Un hébergement réel — CDN, compression, HTTP/2 — donnera un meilleur
résultat, pas un moins bon.

---

## Les 20 questions

### 1. Est-il impossible pour un brouillon d'apparaître en production ?

**Oui, par construction.** Le client public est créé avec
`perspective: 'published'` : le refus est côté serveur Sanity, pas dans nos
requêtes. Un seul point du code choisit entre les deux clients, et il ne lit
que `draftMode()` — jamais un paramètre d'URL. Le validateur GROQ échoue si
une requête mentionne `drafts.`.

**Non encore éprouvé sur données réelles** : il n'existe pas de projet Sanity.
Le scénario de la Phase 15 reste à jouer.

### 2. La prévisualisation est-elle réellement sécurisée ?

Secret comparé à temps constant, session expirant en une heure, date limite
signée, redirection bornée au site. 14 tests unitaires, plus une vérification
sur serveur réel : 401 sans secret, 401 avec un secret faux, **message
identique dans les deux cas**, 307 avec le bon, deux cookies `httpOnly`, et
`?chemin=https://site-piege.fr` ramené sur l'accueil.

### 3. Les tokens sont-ils tous protégés ?

**Oui, prouvé.** Un build lancé avec des valeurs témoins ne les laisse
apparaître dans **aucun** fichier de `.next/`. Le nom `SANITY_PREVIEW_SECRET`
n'existe que sous `.next/server/`. `.next/static/` : zéro.

`lib/sanity/client.js` importe `server-only` : un composant client qui
l'importerait ferait échouer le build plutôt que d'embarquer un token.

### 4. Le rollback fonctionne-t-il réellement ?

**Non vérifié.** La procédure est écrite (`ROLLBACK.md`) et le script
`npm run verifier:historique` l'automatise, mais aucun test réel n'a pu être
mené sans projet. La durée de rétention dépend du forfait et se compte en
jours sur le gratuit. **Cinq cases restent à cocher avant d'ouvrir le
back-office à la cliente.**

### 5. Le planning respecte-t-il Europe/Paris ?

**Oui, et c'est testé.** L'heure est une chaîne `"18:30"`, jamais un instant :
aucune conversion, donc aucun décalage possible. Deux tests l'encadrent de
part et d'autre du 29 mars et du 25 octobre 2026. Un troisième rejoue le
calcul sous `Pacific/Honolulu`, `Asia/Tokyo` et `UTC` et vérifie l'égalité
stricte — le jour de la semaine est calculé arithmétiquement, jamais avec
`new Date().getDay()`.

### 6. Les exceptions sont-elles correctement gérées ?

Annulation, déplacement, complet, fermeture, créneau désactivé, exception
orpheline, exceptions concurrentes, déplacement sans nouvelle heure : chaque
cas a son test. Priorité `annule > deplace > complet`, indépendante de
l'ordre de saisie.

### 7. Une indisponibilité de Sanity fait-elle tomber le site ?

**Non.** Trois protections successives :

1. le site est **généré au build** : une panne pendant les heures de visite
   n'a aucun effet ;
2. `interroger()` intercepte l'erreur, journalise côté serveur seulement, et
   rend une valeur de repli ;
3. la couche `lib/contenu/` retombe champ par champ sur le contenu d'origine.

Une panne dégrade donc le site vers son ancien contenu, jamais vers une page
vide. Délai maximal de 10 secondes par requête : un build ne peut pas rester
bloqué.

### 8. Les requêtes GROQ sont-elles sécurisées ?

Oui, et c'est vérifié automatiquement. `npm run groq:check` compile les
13 requêtes, contrôle que les 29 interpolations sont toutes des fragments
constants, et que les seuls paramètres sont `$slug`, `$du`, `$au`,
`$maintenant`.

### 9. Les images sont-elles correctement gérées ?

Hotspot respecté, redimensionnement à la largeur utile, conversion
automatique de format, texte alternatif obligatoire. Une image absente rend
`null` — jamais une URL cassée — et les composants n'affichent alors rien
plutôt qu'un cadre vide. Le SVG est refusé au téléversement.

### 10. Le Portable Text est-il sécurisé ?

Rendu par `@portabletext/react`, jamais en HTML. Liens filtrés deux fois
(schéma **et** rendu) sur `http`, `https`, `mailto`, `tel`. Un lien refusé
conserve son texte et perd son lien.

Une seule dérogation à `dangerouslySetInnerHTML`, dans les données
structurées, sans alternative technique, doublement neutralisée.

### 11. Les webhooks sont-ils nécessaires ?

**Non, et aucun n'a été écrit.** Le Deploy Hook de l'hébergeur suffit. Écrire
une API de revalidation aurait créé une route publique à signer, à limiter en
débit et à surveiller, pour un gain nul.

### 12. Les CORS sont-ils minimaux ?

**À faire à la création du projet.** La liste des origines est dans
`SECURITY.md`, point 6.

### 13. Les en-têtes sont-ils compatibles avec le site ?

Sept en-têtes vérifiés sur un serveur réel. Une exception assumée et
documentée : `script-src 'unsafe-inline'`, parce que les nonces imposeraient
un rendu dynamique de chaque page et feraient perdre la mise en cache CDN de
tout le site.

### 14. Le build de production récupère-t-il uniquement le contenu publié ?

Oui : `getContenu()` est appelé sans argument depuis `layout.js` et
`page.js` passe `previewActif()`, qui rend faux hors session valide.

### 15. La prévisualisation récupère-t-elle correctement les brouillons ?

Le mécanisme est en place et le client `drafts` configuré. **Non éprouvé sur
données réelles** — même blocage que la question 1.

### 16. Le contenu est-il séparé du design ?

Oui, et l'inverse est impossible : aucun champ n'expose une couleur, une
police, une taille ou un alignement. Le texte riche est limité à gras,
italique, listes, liens, H2 et H3. Les mots en rose sont ceux que la cliente
passe en **gras** — elle ne choisit pas la couleur, le rendu la traduit.

### 17. Le système est-il assez simple pour être maintenu ?

Sept dépendances directes ajoutées, toutes nécessaires. Aucune API maison,
aucun système d'historique maison, aucun webhook. Trois commandes de
vérification qui tiennent en une ligne.

Le point le plus délicat à reprendre est le lien entre schéma, requête GROQ et
contenu par défaut : trois fichiers décrivant les mêmes champs. C'est pourquoi
neuf tests vérifient leur cohérence — l'oubli s'est produit deux fois pendant
le développement.

### 17 bis. Le blog

Créé. `/blog` liste les articles avec un état vide digne tant qu'aucun n'est
publié ; `/blog/[slug]` est pré-calculé au build. Vérifié avec un article
factice dans une copie jetable du projet — le blog étant vide, il était
sinon impossible à juger.

Les ancres de la navigation sont devenues absolues (`/#about`) pour rester
valables depuis `/blog`, ce qui a cassé la copie hors-ligne : ouverte en
`file://`, `/#about` mène à la racine du disque. `build-standalone.js` les
ramène en ancres pures.

### 18. Qu'est-ce qui nécessite encore un développeur ?

| Action | Pourquoi |
|---|---|
| Ajouter une **section** au site | c'est du design, pas du contenu |
| Changer une couleur, une police | volontairement hors du CMS |
| Ajouter un **champ** | schéma + requête + contenu par défaut |
| Modifier les jours affichés au planning | `JOURS_AFFICHES` dans `lib/planning/grille.js` |
| Ajouter une **route** au site | le blog en a demandé une |
| Brancher le Deploy Hook | une fois, à la mise en production |

Tout le reste — textes, photos, tarifs, horaires, annulations, stages,
articles, coordonnées, référencement — est autonome.

### 19. Quel est le principal risque restant ?

**Que rien de tout cela ne soit éprouvé sur un vrai projet Sanity.** Toute la
chaîne publication → prévisualisation → restauration est écrite et
unitairement testée, mais jamais exécutée de bout en bout. C'est le seul
risque de niveau élevé.

Viennent ensuite : la rétention d'historique du forfait gratuit, sans doute
trop courte ; et le fait que `mgym.fr` sert aujourd'hui un autre site, dont le
remplacement est une décision commerciale non tranchée.

### 20. Comment restaurer le site après une mauvaise publication ?

```
Document → ⋯ → History → version d'avant → Restore
        → Prévisualiser → vérifier → Publier
```

Restaurer ne publie rien : l'ancienne version revient **en brouillon**.
Procédure détaillée dans `ROLLBACK.md`.

---

## Ce qui n'est pas fait

Tout ce qui pouvait être écrit l'a été. Ce qui reste demande soit un compte,
soit une décision.

| Phase | Écrit | Exécuté | Bloqué par |
|---|---|---|---|
| 6 — restauration | ✅ `verifier:historique` | ❌ | aucun projet Sanity |
| 8 — publication | ✅ `docs/DEPLOIEMENT.md` | ❌ | hébergeur à choisir, DNS à repointer |
| 15 — workflow complet | ✅ `verifier:workflow`, 9 scénarios | ❌ | aucun projet Sanity |
| 19 — ergonomie | ✅ `analyser-formulaires` | ⚠️ partiellement | chronométrage impossible hors ligne |

**Trois actions ne peuvent pas être faites à votre place** : créer le projet
Sanity (`sanity login` ouvre un navigateur et demande un compte), choisir
l'hébergeur, et repointer le DNS de `mgym.fr`.

**Écart assumé, signalé plutôt que fait en silence :**

- **Le champ `icone` sur les activités** n'a pas été créé : le site n'a aucun
  emplacement pour l'afficher.
### L'accessibilité plafonne à 96 — ce qui bloque exactement

Seize éléments échouaient au contraste ; il en reste **quatre**. Les douze
autres tenaient à des opacités décoratives, remontées sans changer une seule
teinte — les liens du pied de page passent de 3,1 à 6,3, la mention légale de
2,4 à 5,6, le compteur du carrousel de 2,47 à 4,8.

Les quatre restants dépendent tous de la couleur de marque :

| Élément | Contraste | Seuil |
|---|---|---|
| Bouton principal — blanc sur `--rose` | 2,69 | 4,5 |
| Mots en accent — `--rose` sur `--rose-clair` | 2,15 | 4,5 |
| Liens en `--rose-fonce` sur `--creme` | 3,45 | 4,5 |
| Slogan du pied — `--rose` sur `--prune` | 3,91 | 4,5 |

**Pour atteindre 100, il faudrait assombrir le rose de marque :**

```
teinte et saturation inchangées, seule la luminosité descend
  #D18B8E  actuel        contraste 2,69 avec le blanc
  #CD8083  seuil 3,0     acceptable pour du grand texte
  #BC565A  seuil 4,5     conforme pour tout texte
```

C'est une décision de la cliente, pas une décision technique : c'est son
identité visuelle. La mission interdit par ailleurs de modifier le design.
96 dépasse l'objectif de 90 fixé par le plan.

---

## Les cinq points qui casseront le plus probablement dans six mois

1. **La désynchronisation schéma / requête / contenu par défaut.** Trois
   fichiers pour les mêmes champs. *Mitigé par 9 tests, mais la vigilance
   reste nécessaire à chaque ajout.*
2. **Le nombre d'activités.** Le sentier est dessiné pour 6 à 10 étapes ;
   au-delà, le chemin SVG s'étire. *Aucune limite n'est imposée dans le
   schéma — à ajouter si le cas se présente.*
3. **La liste « Il vous sera demandé ».** Elle doit rester le reflet du
   formulaire Google. Rien ne le garantit techniquement : si la cliente
   ajoute une question sans mettre la liste à jour, l'annonce devient fausse.
4. **`next-sanity@11`.** C'est la dernière version compatible React 18. La
   suite exige React 19 et Next 16 : une montée de version deviendra un
   chantier, pas une mise à jour.
5. **La rétention d'historique.** Si elle expire avant qu'on s'aperçoive
   d'une erreur, la restauration devient impossible. *Un export régulier du
   dataset est la seule vraie protection.*
