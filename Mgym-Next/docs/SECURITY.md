# Sécurité — Site M'GYM

> Phase 12 du plan. Chaque point porte : le risque, l'état, la mesure prise,
> et **comment elle a été vérifiée**.
>
> Dernière revue : 21 août 2026.

---

## Tableau de bord

| # | Point | État |
|---|---|---|
| 1 | Secrets et tokens | ✅ |
| 2 | Injection GROQ | ✅ |
| 3 | Brouillons en production | ✅ |
| 4 | XSS et Portable Text | ✅ |
| 5 | Téléversement de fichiers | ✅ |
| 6 | CORS | ⚠️ à faire à la création du projet |
| 7 | En-têtes HTTP | ✅ (une exception assumée) |
| 8 | Webhooks | ✅ aucun n'existe |
| 9 | Contrôle d'accès | ⚠️ à tester avec un vrai compte |
| 10 | Déni de service et coûts | ✅ |
| 11 | Dépendances | ✅ |
| 12 | RGPD | ⚠️ décisions à prendre avec la cliente |

---

## 1. Secrets et tokens — le risque n°1

**Le risque.** Un token d'écriture parti dans le bundle du navigateur donne à
n'importe quel visiteur le droit de modifier, ou d'effacer, tout le contenu.

**Les mesures.**

| Mesure | Où |
|---|---|
| Le site n'écrit **jamais** dans Sanity | aucun token d'écriture n'est configuré sur l'hébergeur |
| Le token d'écriture ne sert qu'au script de migration, lancé à la main | `scripts/migrer.mjs` |
| Le token de lecture n'a que le rôle « Viewer » | à créer sur sanity.io/manage |
| Aucun secret ne porte `NEXT_PUBLIC_` | `.env.example` sépare explicitement les deux familles |
| `lib/sanity/client.js` importe `server-only` | un composant client qui l'importerait ferait **échouer le build** |
| `.env`, `.env.*` ignorés par git | `.gitignore`, avec `!.env.example` en exception |

Seules trois valeurs portent un préfixe public : `PROJECT_ID`, `DATASET`,
`API_VERSION`. Ce ne sont pas des secrets — elles figurent dans l'URL de
l'API, visible de tous.

**Vérification.** Un build a été lancé avec des valeurs témoins :

```
SANITY_API_READ_TOKEN=SECRET_LECTURE_TEMOIN_123
SANITY_API_WRITE_TOKEN=SECRET_ECRITURE_TEMOIN_456
SANITY_PREVIEW_SECRET=SECRET_PREVIEW_TEMOIN_789012345678
```

Résultat : **zéro occurrence** de ces trois valeurs dans l'intégralité de
`.next/`. Le *nom* `SANITY_PREVIEW_SECRET` apparaît dans trois fichiers, tous
sous `.next/server/` — du code serveur, jamais envoyé au navigateur.
`.next/static/` : **0**.

L'historique git a également été passé au crible sur toutes les branches :
aucun secret, aucun `.env` n'y a jamais été commité.

### Rotation d'un token

1. sanity.io/manage → projet → **API** → **Tokens**
2. « Add API token », rôle **Viewer** pour la lecture
3. Remplacer la valeur chez l'hébergeur **et** dans `.env.local`
4. Redéployer
5. **Puis seulement** révoquer l'ancien token

L'ordre compte : révoquer d'abord couperait la prévisualisation entre les
deux étapes.

### En cas de compromission

```
1. Révoquer TOUS les tokens du projet — immédiatement, avant tout diagnostic
2. sanity.io/manage → Members : retirer tout compte inconnu
3. Exporter le dataset : npx sanity dataset export production
4. Comparer avec la dernière sauvegarde connue
5. Restaurer les documents altérés (voir ROLLBACK.md)
6. Créer de nouveaux tokens, redéployer
7. Activer la double authentification sur tous les comptes admin
```

---

## 2. Injection GROQ

**Le risque.** Une requête assemblée par concaténation avec une valeur venant
de l'URL est exploitable exactement comme une injection SQL.

**La mesure.** Toutes les requêtes vivent dans `lib/sanity/queries/groq.js`.
Les valeurs variables sont passées en **paramètres** — `$slug`, `$du`, `$au`,
`$maintenant` — jamais interpolées.

**Vérification automatisée.** `npm run groq:check` :

- compile les 13 requêtes avec `groq-js` ;
- vérifie que les 29 interpolations du fichier sont **toutes** des fragments
  constants en MAJUSCULES — un `${slug}` ferait échouer le test ;
- vérifie qu'aucune requête ne mentionne `drafts.`.

---

## 3. Brouillons en production

**Le risque.** Un texte non validé, un tarif erroné, visible par tous.

**La mesure — portée par l'API, pas par nos requêtes.** Le client public est
créé avec `perspective: 'published'`. Même une requête qui demanderait
explicitement un brouillon n'en obtiendrait aucun : le refus est côté serveur
Sanity.

Un seul point du code choisit entre les deux clients : `clientPour()` dans
`lib/sanity/client.js`, qui ne lit que le résultat de `draftMode()` — jamais
un paramètre d'URL.

**Vérification.** À faire une fois le projet créé, avec le scénario de la
Phase 15 : créer un brouillon, vérifier qu'il est invisible en production et
visible en prévisualisation.

---

## 4. XSS et Portable Text

**Le risque.** Un texte saisi dans le back-office qui deviendrait du code
exécutable dans la page.

**Les mesures.**

| Mesure | Détail |
|---|---|
| Portable Text, jamais de HTML | `components/TexteRiche.js` parcourt une structure de données ; rien ne peut devenir une balise |
| Liens filtrés **deux fois** | validation à la saisie (schéma) **et** au rendu |
| Schémas autorisés | `http`, `https`, `mailto`, `tel` — ce qui rejette `javascript:` et `data:` |
| Lien refusé | le texte reste, le lien disparaît : la page ne casse pas |
| `rel="noopener noreferrer"` | sur tout lien ouvert dans un nouvel onglet |

Le double filtrage n'est pas de la redondance : une validation de formulaire
ne protège pas des données arrivées par l'API, par un import ou par la
migration.

**Une seule exception à la règle `dangerouslySetInnerHTML`** :
`components/DonneesStructurees.js`. Une balise
`<script type="application/ld+json">` n'accepte pas d'enfant React — il n'y a
pas d'alternative. Le risque est neutralisé deux fois : le contenu vient de
`JSON.stringify` (jamais d'une chaîne assemblée), et `<`, `>`, `&` sont
échappés en séquences Unicode. Un texte contenant `</script>` saisi dans le
back-office ne peut pas s'échapper de la balise. **Vérifié** dans la sortie
HTML : aucun `<` brut.

---

## 5. Téléversement de fichiers

**Le risque.** Un SVG est un document XML qui peut contenir du script. Servi
depuis le domaine du site, il s'exécute avec ses privilèges.

**La mesure.** Le champ image n'accepte que
`image/jpeg, image/png, image/webp, image/avif`. **Le SVG est exclu.**

Le texte alternatif est obligatoire (5 caractères minimum) : ce n'est pas de
la sécurité, mais c'est de l'accessibilité, et le public du site est âgé.

---

## 6. CORS — ⚠️ à faire

À la création du projet Sanity, n'autoriser que les origines réelles :

```
https://mgym.fr              production
https://*.vercel.app         prévisualisations de déploiement
http://localhost:3000        développement
http://localhost:3333        Studio en local
```

**Jamais `*` avec « Allow credentials ».** Retirer les origines de test avant
la mise en production.

---

## 7. En-têtes HTTP

Sept en-têtes sont émis par le site hébergé (`next.config.js`). Vérifiés sur
un serveur réel :

```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
Strict-Transport-Security: max-age=63072000; includeSubDomains
Content-Security-Policy: default-src 'self'; img-src 'self' data: https://cdn.sanity.io;
  font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline';
  connect-src 'self' https://*.api.sanity.io https://*.apicdn.sanity.io;
  frame-ancestors 'self'; frame-src 'none'; object-src 'none';
  base-uri 'self'; form-action 'self'
```

### Risque accepté : `script-src 'unsafe-inline'`

Le plan demande une CSP sans `unsafe-inline`, avec des nonces. **Ce n'est pas
fait, et c'est délibéré.**

Un nonce change à chaque requête. L'utiliser impose donc un **rendu dynamique
de chaque page**, et fait perdre la mise en cache CDN de tout le site — on
échangerait un site statique servi depuis un CDN contre un site recalculé à
chaque visite.

Ce que `unsafe-inline` coûte réellement ici : il permettrait à un script déjà
injecté de s'exécuter. Or ce site n'a **ni saisie utilisateur, ni
authentification, ni script tiers, ni base de données exposée**. Le seul
contenu qui vienne de l'extérieur passe par Portable Text, qui ne peut pas
produire de balise (point 4).

Le compromis serait à revoir le jour où le site accepterait un formulaire ou
un espace privé.

> `Strict-Transport-Security` n'a de sens qu'une fois le certificat HTTPS en
> place. Activé trop tôt sur un domaine servi en HTTP, il rend le site
> inaccessible pour deux ans dans les navigateurs qui l'ont vu.

---

## 8. Webhooks

**Aucun webhook n'a été créé, et c'est le but.**

La publication passera par le **Deploy Hook de l'hébergeur** : une URL
secrète, fournie et protégée par lui. Il n'y a donc aucune route publique à
écrire, donc aucune signature à vérifier, aucune limitation de débit à
implémenter, aucun endpoint à surveiller.

Une API de revalidation maison aurait ajouté une surface d'attaque pour un
gain nul.

---

## 9. Contrôle d'accès — ⚠️ à tester

La cliente sera invitée avec le rôle **`editor`** : elle peut modifier et
publier, mais ne peut ni gérer le dataset, ni voir les tokens, ni inviter
d'autres membres.

À vérifier une fois le projet créé, **en se connectant avec son compte** et
non avec un compte admin :

```
□ le bouton « History » est visible
□ l'onglet API / Tokens est inaccessible
□ l'onglet Members ne permet pas d'inviter
□ les documents uniques n'offrent ni « Supprimer » ni « Dupliquer »
```

Double authentification obligatoire sur les comptes administrateurs.

---

## 10. Déni de service et coûts

Le site est **généré au build**, pas à la visite : mille visiteurs
simultanés ne déclenchent aucune requête vers Sanity. Le quota d'API ne peut
pas exploser à cause du trafic.

Les seuls appels ont lieu au moment du build, et en prévisualisation — une
session authentifiée, limitée à une heure.

`lib/sanity/fetch.js` impose un délai maximal de 10 secondes : un build ne
peut pas rester bloqué indéfiniment sur une requête.

---

## 11. Dépendances

```
npm audit : found 0 vulnerabilities
package-lock.json commité
```

Quatre vulnérabilités hautes existaient avant l'ajout de Sanity — toutes
transitives à Next. Corrigées par `next@15.5.23` plus quatre `overrides`
(`postcss`, `sharp`, `adm-zip`, `@sanity/uuid`), documentés dans
`package.json`. Les trois derniers ne concernent que des outils de build,
jamais le code servi.

À refaire à chaque montée de version : `npm audit` doit rester à zéro.

---

## 12. RGPD — ⚠️ décisions à prendre avec la cliente

| Point | État |
|---|---|
| **Photos de personnes** | Le site montre des adhérentes en cours. Le formulaire d'inscription demande l'accord pour la diffusion d'image : **récupérer et archiver ces accords** |
| **Formulaire de contact** | Il n'y en a pas sur le site. Les inscriptions passent par Google Forms — **c'est Google qui traite les données**, à mentionner |
| **Analytics** | Aucun n'est installé. Si besoin : préférer Plausible ou Umami, sans cookie et sans bandeau. **Ne pas ajouter Google Analytics par réflexe** — il impose un bandeau de consentement et le blocage des scripts avant acceptation |
| **Cookies** | Le site n'en pose **aucun**, hors prévisualisation (deux cookies techniques, réservés à l'administration). Aucun bandeau nécessaire en l'état |
| **Mentions légales** | À rédiger : éditeur, hébergeur, délégué à la protection des données |

---

## Ce qu'il reste à faire avant la mise en production

```
□ Créer le projet Sanity, restreindre les CORS (point 6)
□ Créer le token de lecture, rôle Viewer uniquement
□ Générer SANITY_PREVIEW_SECRET :
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
□ Inviter la cliente en « editor », tester ses limites (point 9)
□ Activer la double authentification sur les comptes admin
□ Vérifier l'historique et tester une restauration (voir ROLLBACK.md)
□ Activer HSTS seulement après le certificat HTTPS
□ Rédiger les mentions légales (point 12)
```
