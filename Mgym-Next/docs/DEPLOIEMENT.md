# Mise en production — M'GYM

> Plan d'action jusqu'à la publication, mis à jour le 25 août 2026.
> Chaque étape indique **qui la fait**. L'ordre compte : une étape en avance
> se refait.

---

## Où en est-on

| | |
|---|---|
| Projet Sanity | `zqxwi6qy`, dataset `production` |
| Contenu | 21 documents, 13 photos, 0 brouillon |
| Contrôles | 67 tests · 21/21 scénarios de workflow · 3/3 historique |
| Vulnérabilités | 0 |
| Code | `main` = `REFONTE-3` — branche par défaut du dépôt, prête à déployer |
| Hébergement | **aucun** — le site ne tourne nulle part |
| `mgym.fr` | sert toujours le site Hostinger Website Builder |

---

## Vue d'ensemble

```
0. Décisions et questions de contenu          VOUS
1. Régénérer les deux jetons                  VOUS
2. Déployer le Studio                         ✅ mgym.sanity.studio
3. Fusionner REFONTE-3 dans main              ✅ 39 commits
4. Test sur la tour, tunnel Cloudflare        ✅ opérationnel
5. La cliente teste et valide                 VOUS + la cliente
6. Installer sur un VPS OVH                   vous ouvrez le compte, j'installe
7. Vérifier en production                     MOI
8. Repointer le DNS                           VOUS
9. Remettre le site à la cliente              partagé
```

---

## Étape 0 — Décisions et questions de contenu — **vous**

Trois questions bloquent des étapes plus loin. Aucune n'est technique.

### 0.1 Le site Next remplace-t-il `mgym.fr` ?

`mgym.fr` sert aujourd'hui un site **Hostinger Website Builder**, qui a son
propre éditeur visuel. Le remplacer signifie que la cliente perd cet éditeur
au profit de Sanity.

C'est le but — un éditeur visuel permet de casser la mise en page, Sanity non
— mais **elle doit l'avoir accepté avant** que le DNS ne bouge.

### 0.2 Quel hébergeur ? — décidé : OVH, où la cliente a déjà un compte

À savoir avant de s'y engager : **OVH ne déploie pas Next.js clé en main.**
Il n'y a pas d'équivalent du bouton « connecter le dépôt » de Vercel. Il faut
un **VPS**, y installer Node, y faire tourner le site comme un service, et
gérer soi-même le certificat et les mises à jour de sécurité du serveur.

C'est faisable et documenté plus bas, mais c'est du travail récurrent que les
plateformes prennent en charge. Le mutualisé OVH ne convient pas : il sert du
PHP, pas un processus Node.

> `mgym.fr` est aujourd'hui servi par **Hostinger**, pas OVH — vérifié :
> l'en-tête de réponse annonce `server: hcdn`, le CDN d'Hostinger. Le compte
> OVH de la cliente sert donc autre chose. À éclaircir avant de toucher au
> DNS : où est le domaine, et où sont les adresses e-mail.

### 0.3 Deux incohérences de contenu, signalées et toujours ouvertes

Elles ne bloquent pas la technique, mais elles seront visibles par les
adhérentes dès la mise en ligne.

- **La saison.** Le site annonce « Saison 2025 — 2026 ». Le formulaire
  d'inscription Google s'intitule « ADHESION 26/27 ». L'un des deux est
  périmé.
- **Le tarif famille.** 410 € pour deux personnes, alors que deux adhésions
  individuelles font 2 × 215 € = 430 €. L'écart de 20 € est-il voulu ?

Répondez-moi et je corrige dans Sanity — ou laissez la cliente le faire
elle-même depuis le Studio, ce qui est un bon premier exercice.

---

## Étape 1 — Régénérer les deux jetons — **vous**

Les jetons `mgym-lecture` et `mgym-migration` ont circulé en clair dans notre
conversation. Avant toute mise en ligne :

<https://www.sanity.io/manage/project/zqxwi6qy/api> → Tokens → supprimer les
deux, en recréer deux.

Le jeton **Editor** ne sert plus qu'à `scripts/tester-workflow.mjs`. Si vous
ne comptez pas relancer ce test, ne le recréez pas du tout : le site n'écrit
jamais dans Sanity.

---

## Étape 2 — Déployer le Studio — ✅ fait le 25 août 2026

Le back-office est en ligne : **<https://mgym.sanity.studio>**

```
projet      zqxwi6qy
workspace   mgym
dataset     production
appId       boxdaz4dq35cp6n8w9v3z44x
```

L'adresse et l'`appId` sont figés dans `sanity.cli.js`. Les deux sont
demandés de façon interactive sinon, et une réponse distraite changerait
l'adresse mise en favori par la cliente, ou créerait un second Studio.

> L'adresse **redirige vers `sanity.io` et demande une connexion**. Ce n'est
> pas une panne : Sanity héberge désormais les Studios dans son tableau de
> bord, et un back-office se connecte. La cliente peut garder
> `mgym.sanity.studio` en favori.

**CORS : rien à faire.** Seul `http://localhost:3333` est déclaré sur le
projet ; les origines en `*.sanity.studio` sont autorisées implicitement —
vérifié par en-tête de réponse.

### Ce qui reste sur cette étape — **vous**

- inviter la cliente : sanity.io/manage → Members → rôle **`editor`**
  (jamais administrator) ;
- activer la **double authentification** sur votre compte ;
- **ouvrir le Studio et vérifier** que les 21 documents sont là et que les
  photos s'affichent — la seule chose que je ne peux pas voir d'ici ;
- pour une adresse en `admin.mgym.fr` plutôt qu'en `*.sanity.studio` :
  ajouter un CNAME chez le registrar vers l'adresse Sanity, puis déclarer
  le domaine dans les réglages du projet. Facultatif, et repoussable.

---

## Étape 3 — Fusionner `REFONTE-3` dans `main` — ✅ fait le 25 août 2026

39 commits, en avance rapide, sans conflit. `main` et `REFONTE-3` pointent
sur le même commit, et `main` est la branche par défaut du dépôt :
l'hébergeur la prendra sans réglage particulier.

`npm run verifier` repasse depuis `main` — schémas, requêtes, 67 tests, build.

**Le dépôt est public.** L'historique a été relu : aucun jeton, aucun secret.
`.env.local` n'a jamais été suivi, et le secret de prévisualisation est absent
de tous les commits.

Deux observations, sans effet sur le déploiement :

- `new pic/` — 21 Mo de PNG d'origine, suivis par git. Ce sont les sources
  dont les `.avif` du site sont tirés ; elles ne partent jamais chez la
  cliente. Elles alourdissent seulement le clone.
- Ce sont **des photos d'adhérentes, en pleine résolution, dans un dépôt
  public**. Le site n'en publie que des versions réduites. À voir avec la
  cliente si cette différence lui importe.

**Pour la suite :** travailler sur `REFONTE-3`, et fusionner dans `main`
quand un déploiement est voulu. C'est ce qui rend la mise en production
délibérée plutôt qu'automatique à chaque commit.

---

## Étape 4 — Test sur la tour — ✅ opérationnel

Le site tourne sur cette machine et est joignable publiquement, le temps que
la cliente le juge.

```bash
./scripts/heberger-tour.sh
```

Le script construit le site, le sert, ouvre un tunnel Cloudflare et affiche
l'adresse. **Aucun port n'est ouvert sur la box** : le tunnel sort, il
n'entre pas. Le HTTPS vient de Cloudflare.

Vérifié de bout en bout : titre modifié dans le Studio à 23:22:03, visible
sur l'adresse publique **42 secondes plus tard**, sans qu'aucune commande
n'ait été lancée sur la tour. C'est la régénération incrémentale
(`lib/revalidation.js`).

### Deux limites à connaître

- **L'adresse change à chaque redémarrage.** Les tunnels gratuits donnent un
  nom aléatoire en `*.trycloudflare.com`. Pour une adresse stable il faut un
  domaine à vous, déclaré chez Cloudflare.
- **La fenêtre doit rester ouverte**, et la tour allumée. Ctrl+C coupe tout.

### HSTS est désactivé, et ce n'est pas un oubli

`Strict-Transport-Security` n'est plus émis que si `MGYM_HSTS=1`. Sur un
domaine partagé comme `trycloudflare.com`, `includeSubDomains` aurait cassé,
dans le navigateur de la cliente, **tous** les autres sites en
`.trycloudflare.com` — pendant deux ans, sans marche arrière possible côté
serveur.

Le commentaire de `next.config.js` disait déjà « à n'activer qu'une fois le
certificat en place », juste au-dessus d'une ligne qui l'activait toujours.
La condition est maintenant réelle. À poser sur le domaine définitif, une
fois HTTPS vérifié.

---

## Étape 5 — La cliente teste et valide — **vous + la cliente**

C'est le but de l'étape 4. Ce qu'il faut lui faire faire, dans le Studio, et
regarder apparaître sur le site :

```
□ modifier un tarif
□ ajouter un créneau au planning
□ changer une photo
□ publier un article
□ prévisualiser un brouillon avant de le publier
```

Chronométrez-la sur son téléphone : c'est la phase 19, et c'est la seule
mesure qui dise si le back-office lui convient vraiment.

---

## Étape 6 — Installer sur un VPS OVH — **vous ouvrez le compte, j'installe**

**Pas de Deploy Hook ici.** Il n'a de sens que chez une plateforme qui
reconstruit sur appel. Sur un VPS, c'est la régénération incrémentale qui
tient ce rôle — déjà en place, déjà mesurée. Publier suffit.

**Vous** : ouvrir un VPS chez OVH (le plus petit suffit largement), me donner
un accès SSH.

**Moi** : Node 22, le dépôt, les variables d'environnement, un service
systemd qui redémarre tout seul, Caddy ou nginx pour le certificat
Let's Encrypt, et `MGYM_HSTS=1` une fois HTTPS vérifié.

> Ce que le VPS apporte face à la tour : une adresse fixe, une machine qui ne
> s'éteint pas, et un certificat sur le vrai domaine. Ce qu'il coûte : les
> mises à jour de sécurité du serveur, à faire régulièrement. C'est le prix
> de ne pas dépendre d'une plateforme.

---

## Étape 7 — Vérifier en production — **moi**

Dès que l'URL existe :

```bash
node scripts/tester-workflow.mjs https://<url-de-production>
```

Les 21 contrôles : brouillon invisible en production, visible en
prévisualisation, secret refusé sans indice, redirection ouverte bloquée,
publication, historique, étanchéité du client public, sortie de
prévisualisation, en-têtes, blog, référencement.

Puis :

- **restreindre les CORS** — voir `SECURITY.md` point 6. Le site n'a besoin
  d'aucune origine ; seul le Studio en demande une.
- **une publication réelle de bout en bout** : modifier un texte dans le
  Studio, cliquer Publier, chronométrer jusqu'à ce que le site change.
- **une restauration réelle** : les 5 cases de `ROLLBACK.md`.
- **Lighthouse sur la vraie URL.** À refaire obligatoirement : les photos
  viennent maintenant de `cdn.sanity.io`, un autre domaine. J'ai déjà vérifié
  qu'**aucune préconnexion n'est déclarée** — le navigateur doit résoudre le
  DNS et négocier le TLS avant de commencer à télécharger l'image la plus
  grande de la page. Je corrigerai si la mesure le confirme.
- **une sauvegarde du dataset** :
  `npx sanity dataset export production sauvegarde-initiale.tar.gz`

---

## Étape 8 — Repointer le DNS — **vous**

**En dernier**, une fois que tout fonctionne sur l'URL de l'hébergeur.

Chez Hostinger : remplacer les enregistrements A / CNAME de `mgym.fr` et
`www.mgym.fr` par ceux fournis par l'hébergeur. Jusqu'à 24 h de propagation.

> ⚠️ **`Strict-Transport-Security` est déjà déclaré dans `next.config.js`.**
> Servi sur un domaine dont le certificat HTTPS n'est pas encore en place,
> les navigateurs refuseront le site **pendant deux ans**. Vérifiez que
> l'hébergeur a émis le certificat avant que le DNS ne bascule.

---

## Étape 9 — Remettre le site à la cliente — **partagé**

**Moi** : `docs/GUIDE-CLIENTE.md` relu et à jour, copie hors-ligne
régénérée (`npm run livraison`), sauvegarde initiale du dataset.

**Vous** : la vidéo de prise en main (script prêt dans
`docs/SCRIPT-VIDEO.md`), et la séance de formation.

**À chronométrer avec elle sur son téléphone** — c'est la phase 19, la seule
que je ne peux pas terminer seul : modifier un tarif, ajouter un créneau,
publier un article, changer une photo.

---

---

# Annexe — ce qui est déjà fait

## Le projet Sanity — ✅ 25 août 2026

```
projet    zqxwi6qy
dataset   production   existant, public en lecture, vide
```

`.env.local` est rempli, le secret de prévisualisation est généré (64
caractères hexadécimaux). Vérifié dans cet état :

| Contrôle | Résultat |
|---|---|
| `npm run verifier` | schémas, requêtes, 67 tests, build — tout passe |
| les 13 requêtes GROQ jouées contre le serveur Sanity | acceptées |
| contenu affiché avec un dataset vide | le contenu par défaut, intact |
| secrets présents dans un bundle navigateur | aucun |
| `npm run studio:build` | compile, n'embarque que `SANITY_STUDIO_*` |

Reste à créer **deux tokens** sur
<https://www.sanity.io/manage/project/zqxwi6qy/api> → Tokens :

| Nom | Rôle | Où il va |
|---|---|---|
| `mgym-lecture` | **Viewer** | `.env.local` et l'hébergeur |
| `mgym-migration` | **Editor** | `.env.local` seulement, effaçable après |

Le second ne sert qu'une fois, à l'étape 2. Le supprimer ensuite est le
choix le plus sûr : le site n'écrit jamais dans Sanity.

> Les commandes `sanity deploy` et `sanity dataset export` réclament une
> session (`npx sanity login`, qui ouvre un navigateur). Pour les jouer sans
> interaction — CI, ou poste sans navigateur — un token d'administration
> passé en `SANITY_AUTH_TOKEN` les remplace.

## Le contenu — ✅ 25 août 2026

```bash
npm run migrer          # simulation, n'écrit rien : à lire avant
npm run migrer:ecrire   # applique
```

21 documents dans `production` : 8 activités, 10 créneaux, `siteContent`,
`infosPratiques`, `seoGlobal`, plus 13 photos dans la médiathèque. Relancer
la commande réécrit les mêmes documents — vérifié, le compte ne bouge pas.

> **Cinq photos ont dû être converties.** `fond1`, `Logo`, `CoachMassage`,
> `MarcheNordique` et `coachHelpingChienTTenHauyt` sont des AVIF **10 bits**,
> que le décodeur de Sanity refuse (`422 Invalid image`). Le script les
> convertit en WebP sans perte avant l'envoi ; `public/` n'est pas touché.
> Les huit images d'activités, en 8 bits, passent telles quelles.

Les neuf scénarios de la Phase 15 ont été joués contre ce projet :

```bash
npm run build && npm start          # dans un terminal
node scripts/tester-workflow.mjs    # dans un autre
```

**21 contrôles sur 21.** Brouillon invisible en production, visible en
prévisualisation, secret refusé sans indice, redirection ouverte bloquée,
publication, historique récupérable, étanchéité du client public, sortie de
prévisualisation, en-têtes, blog et référencement.

## Une fois en ligne — ce qui revient

Ces points ne font pas partie de la mise en service : ils commencent après.

- **Sauvegarder le dataset** avant chaque intervention importante :
  `npx sanity dataset export production sauvegarde-AAAA-MM-JJ.tar.gz`.
  C'est la seule copie qui ne dépende pas de Sanity.
- **La rétention d'historique dépend du forfait.** Sur le plan gratuit elle
  est courte : une restauration se joue en jours, pas en mois. Une
  sauvegarde régulière est ce qui comble l'écart.
- **Si la cliente casse quelque chose** : `docs/ROLLBACK.md`. Le site retombe
  déjà tout seul sur `lib/contenu/defaut.js` si un champ est vidé — une
  section ne peut pas disparaître par accident.
- **Regénérer la copie hors-ligne** après une modification importante :
  `npm run livraison`. Elle lit maintenant le contenu du CMS, elle n'est donc
  plus figée dans le temps.
