# Site M'GYM — Bien-être & Santé

Site vitrine d'une seule page pour l'association **M'GYM**, à
Mirepoix-sur-Tarn. Public visé : adhérentes et adhérents adultes, souvent
seniors — la lisibilité prime sur l'effet technique.

> Ce fichier explique **comment faire tourner et livrer le site**.
> Les règles de contribution (conventions de code, pièges connus, design
> system) sont dans [CLAUDE.md](CLAUDE.md).

## Démarrer

```bash
npm install
npm run dev        # http://localhost:3000, rechargement à chaque modification
```

C'est la seule commande nécessaire pour travailler sur le site.

## Les autres commandes

| Commande | Ce qu'elle fait |
|---|---|
| `npm run build` | Construit le site dans `out/`. **C'est la vérification de référence** : elle échoue sur toute erreur de code. |
| `npm start` | Sert `out/` en local (voir `serve.js`). Nécessite un `npm run build` préalable. |
| `./launch.sh` | Enchaîne build + démarrage + vérification que le site répond. |
| `./launch.sh --dev` | Mode développement, sans build. |
| `PORT=4000 ./launch.sh` | Change le port. |

Il n'y a **ni tests, ni linter** dans ce projet : `npm run build` fait office
de garde-fou.

> **À savoir :** le site est exporté en pages statiques (`output: 'export'`).
> `next start` ne fonctionne donc pas — c'est `serve.js`, un serveur de
> fichiers de 80 lignes écrit avec le module `http` de Node, qui prend le
> relais. Aucune dépendance supplémentaire.

## Livrer le site à la cliente

Le site doit pouvoir s'ouvrir **par double-clic, sans serveur ni Internet**.
`build-standalone.js` produit deux formats depuis `out/` :

```bash
npm run livraison      # → dossier Livraison-MGYM/ (le plus courant)
npm run build:html:all # → deux fichiers .html autonomes de ~1,6 Mo
```

`Livraison-MGYM/` est prêt à déposer sur Google Drive : il contient les deux
variantes du site, le dossier `Images/`, le fond et un `LISEZ-MOI.txt` écrit
pour la cliente.

## Deux affichages pour les activités

Les 8 activités vivent dans un seul fichier, `components/activitesData.js`.
Deux composants les présentent différemment :

- **`CarrouselActivites.js`** — des cartes qui défilent à l'horizontale
  (affichage par défaut) ;
- **`SentierActivites.js`** — un chemin qui descend dans la page.

On choisit avec la variable d'environnement `MGYM_VARIANT` :

```bash
npm run build            # carrousel
MGYM_VARIANT=sentier npm run build
```

## Pile technique

Next.js 15 (App Router) + React 18, en **JavaScript pur**. Un seul fichier de
style, `app/globals.css`. Aucune dépendance en dehors de `next`, `react` et
`react-dom` — et c'est volontaire.
