# Geo-react

Application web React permettant d'importer, valider, afficher et composer des géométries GeoJSON sur une carte interactive.

## Démonstration

Une fois GitHub Pages activé, l'application est disponible à l'adresse suivante :

<https://voyagerdiscovery.github.io/geo-react/>

## Fonctionnalités

- Import de fichiers `.txt`, `.json` et `.geojson` jusqu'à 5 Mo.
- Import par copier-coller.
- Validation de la structure et des coordonnées avant affichage.
- Prise en charge des `Feature`, `FeatureCollection` et géométries GeoJSON.
- Affichage de plusieurs objets avec des couleurs distinctes.
- Sélection et suppression des géométries.
- Union, intersection et soustraction de polygones avec Turf.js.
- Affichage distinct du résultat.
- Recentrage automatique de la carte.
- Dessin de polygones directement sur la carte.
- Messages compréhensibles en cas d’erreur.
- Interface adaptée aux écrans mobiles et à la navigation au clavier.

## Installation

Prérequis : Node.js 24 et npm 11.

```bash
git clone git@github.com:VoyagerDiscovery/geo-react.git
cd geo-react
npm install
npm run dev
```

Vite affiche ensuite l'adresse locale, généralement <http://localhost:5173>.

## Commandes

```bash
# Démarrer le serveur de développement
npm run dev

# Vérifier le formatage, le lint, les types et le build
npm run check

# Construire la version de production
npm run build

# Prévisualiser le build de production
npm run preview

# Formater les fichiers
npm run format
```

## Tester rapidement l'application

Le fichier [`exemples-geometries.txt`](./exemples-geometries.txt) contient trois polygones qui se chevauchent autour de Berne.

1. Démarrer l'application avec `npm run dev`.
2. Importer `exemples-geometries.txt`.
3. Cocher au moins deux géométries.
4. Choisir une union, une intersection ou une soustraction.
5. Cliquer sur **Calculer**.

Pour la soustraction, la première géométrie sélectionnée sert de base. Les suivantes sont retirées de celle-ci.

## Choix techniques

- **React** structure l'interface en composants et gère son état.
- **TypeScript** sécurise les échanges de données et détecte les incohérences avant l'exécution.
- **Vite** fournit le serveur de développement et le build de production.
- **Leaflet** affiche la carte et les couches géographiques.
- **React-Leaflet** relie Leaflet au cycle de rendu React.
- **OpenStreetMap** fournit le fond cartographique.
- **Turf.js** effectue les opérations géométriques.
- **ESLint et Prettier** garantissent une base de code cohérente.
- **GitHub Actions** vérifie et déploie automatiquement le projet.

JSON Forms n'est volontairement pas utilisé. La librairie était optionnelle dans le cahier des charges et convient surtout à la génération de formulaires depuis un schéma JSON. Pour l'import d'un document GeoJSON complet, un champ fichier, un textarea et une validation spécialisée constituent une solution plus simple et plus adaptée.

## Architecture

```text
index.html
└── src/main.tsx
    └── src/App.tsx
        ├── features/geojson-import/
        │   ├── GeoJsonImport.tsx
        │   └── parseGeoJson.ts
        ├── features/geometry-list/
        │   └── GeometryList.tsx
        ├── features/geometry-operations/
        │   ├── GeometryOperations.tsx
        │   └── calculateGeometry.ts
        ├── features/map/
        │   ├── DrawingControls.tsx
        │   └── GeometryMap.tsx
        └── types/geometry.ts
```

Le projet est organisé par fonctionnalité. Les composants d'interface restent séparés de la validation et des calculs géométriques.

## Parcours des données

```text
Fichier ou texte
      ↓
GeoJsonImport
      ↓
parseGeoJson — lecture et validation
      ↓
App — ajout de l'identifiant, du nom et de la couleur
      ├──────────────→ GeometryList
      └──────────────→ GeometryMap
                              ↑
Sélection → GeometryOperations → calculateGeometry
                              ↓
                        Résultat Turf
```

1. `GeoJsonImport` lit le texte ou le fichier choisi.
2. `parseGeoJson` transforme le JSON en objets JavaScript et valide chaque structure.
3. `App` ajoute les objets valides à l'état React.
4. `GeometryList` permet de sélectionner ou supprimer les objets.
5. `GeometryMap` affiche une couche Leaflet par objet.
6. `GeometryOperations` retrouve les objets sélectionnés dans leur ordre de sélection.
7. `calculateGeometry` appelle Turf.
8. Le résultat remonte dans `App`, puis redescend vers la carte.

## Concepts GeoJSON utilisés

Une `Geometry` décrit une forme et ses coordonnées :

```json
{
  "type": "Polygon",
  "coordinates": []
}
```

Une `Feature` enveloppe cette forme et lui associe des propriétés :

```json
{
  "type": "Feature",
  "properties": { "name": "Zone A" },
  "geometry": {
    "type": "Polygon",
    "coordinates": []
  }
}
```

Une `FeatureCollection` regroupe plusieurs Features. L'application normalise toutes les entrées en tableau de Features afin d'utiliser ensuite un seul format interne.

Les positions respectent l'ordre GeoJSON standard `[longitude, latitude]`. Un anneau de polygone doit contenir au moins quatre positions et répéter sa première position à la fin.

## Explication détaillée des fichiers

### `index.html`

Ce fichier est le squelette chargé par le navigateur.

- `<!doctype html>` active le mode HTML5.
- `lang="fr"` indique la langue aux navigateurs et lecteurs d'écran.
- `charset="UTF-8"` permet l'affichage des accents.
- La balise `viewport` adapte la page aux téléphones.
- La description présente l'application aux moteurs de recherche.
- `<div id="root">` est le conteneur dans lequel React injecte l'interface.
- Le script module charge `src/main.tsx` avec Vite.

Aucun style ou comportement métier n'est placé dans ce fichier.

### `src/main.tsx`

Ce fichier démarre React :

- `createRoot` crée la racine React moderne.
- `StrictMode` aide à détecter les effets de bord en développement.
- `index.css` charge les règles globales.
- Le CSS officiel de Leaflet positionne correctement la carte et ses contrôles.
- `App.css` contient la présentation de l'application.
- `<App />` devient le composant racine.

Le `!` après `getElementById("root")` indique à TypeScript que l'élément existe nécessairement dans `index.html`.

### `src/types/geometry.ts`

Ce fichier centralise les types partagés :

- `StoredGeometry` décrit un objet conservé dans l'application.
- `id` est un UUID unique.
- `name` est le nom présenté à l'utilisateur.
- `colorIndex` référence une couleur de la palette.
- `feature` contient la Feature GeoJSON originale.
- `GeometryOperation` limite une opération aux trois valeurs autorisées.
- `PolygonFeature` limite une Feature à `Polygon` ou `MultiPolygon`.

Les `import type` disparaissent du JavaScript final et n'augmentent pas la taille du build.

### `src/App.tsx`

`App` est l'orchestrateur du projet. Il conserve quatre états partagés :

- `items` : toutes les géométries importées.
- `selectedIds` : les UUID cochés, dans leur ordre de sélection.
- `result` : la Feature calculée par Turf ou `null`.
- `message` : le dernier retour destiné à l'utilisateur.

`nextColorIndex` est créé avec `useRef`. Sa valeur survit aux rendus sans provoquer elle-même un nouveau rendu.

#### Ajout des Features

`addFeatures` transforme chaque Feature validée en `StoredGeometry` :

- Le nom vient de `properties.name` lorsqu'il s'agit d'une chaîne non vide.
- Sinon, un nom est généré depuis le fichier ou le nom `Géométrie`.
- `crypto.randomUUID()` crée l'identifiant.
- Le modulo `% COLOR_COUNT` fait tourner la palette de couleurs.
- L'opérateur spread ajoute les nouveaux éléments sans modifier l'ancien tableau.
- Un ancien résultat est supprimé car il ne correspond plus aux données actuelles.

#### Sélection

`toggleSelection` enlève l'identifiant avec `filter` s'il est déjà présent, ou l'ajoute à la fin avec `[...current, id]`. L'ordre est conservé pour définir la base d'une soustraction.

#### Suppression

`removeItem` retire l'objet de la liste, retire également son identifiant de la sélection et invalide le résultat précédent.

#### Composition de l'interface

Le JSX de `App` assemble la barre latérale, l'import, la liste, les opérations et la carte. Les données descendent vers les composants par les `props`. Les événements remontent au moyen de callbacks comme `onImport`, `onRemove` et `onResult`.

Le message utilise `role="status"` afin que les technologies d'assistance annoncent ses mises à jour.

### `features/geojson-import/GeoJsonImport.tsx`

Ce composant gère uniquement l'interface d'import.

- `textValue` contrôle la valeur du textarea.
- Un texte vide est refusé après application de `trim()`.
- Les exceptions du parseur sont transformées en messages utilisateur.
- Le textarea est vidé uniquement après un import réussi.
- Les fichiers supérieurs à 5 Mo sont refusés avant lecture.
- La regex retire les extensions `.txt`, `.json` ou `.geojson` du nom.
- `file.text()` lit le contenu de manière asynchrone.
- `accept` guide le sélecteur vers les formats attendus.
- Remettre la valeur de l'input à vide permet de réimporter immédiatement le même fichier.

Le contrôle `accept` ne remplace pas la validation : un fichier peut avoir une extension correcte et contenir des données invalides.

### `features/geojson-import/parseGeoJson.ts`

Ce fichier constitue la frontière de validation. Les données utilisateur commencent avec le type `unknown` et ne deviennent des types GeoJSON qu'après vérification.

#### `isObject`

Vérifie que la valeur est un objet non nul et non un tableau. Son type de retour est un _type guard_ qui permet à TypeScript d'affiner la valeur.

#### `assertPosition`

Vérifie qu'une position :

- Est un tableau.
- Contient au moins deux coordonnées.
- Contient uniquement des nombres finis.
- Ne contient donc ni chaîne, ni `NaN`, ni `Infinity`.

#### `assertLine`

Vérifie le nombre minimal de positions, puis appelle `assertPosition` sur chacune d'elles.

#### `assertRing`

Un anneau doit contenir au moins quatre positions. La première et la dernière doivent avoir la même dimension et les mêmes coordonnées afin de fermer le contour.

#### `validateGeometry`

Un `switch` traite chaque type officiel :

- `Point`.
- `MultiPoint`.
- `LineString`.
- `MultiLineString`.
- `Polygon`.
- `MultiPolygon`.
- `GeometryCollection`.

Les collections sont validées récursivement. Les types inconnus, tableaux vides et structures incorrectes produisent une erreur localisée.

#### `validateFeature`

Cette fonction vérifie le type `Feature`, ses propriétés et sa géométrie. Elle reconstruit ensuite une Feature propre et conserve son identifiant GeoJSON seulement s'il s'agit d'une chaîne ou d'un nombre.

#### `parseGeoJson`

`JSON.parse` transforme le texte en valeur JavaScript. Une erreur de syntaxe JSON est remplacée par un message français stable. Une Feature seule devient un tableau à un élément. Une `FeatureCollection` valide chacune de ses Features. Une géométrie brute est enveloppée avec `feature` de Turf. Une `GeometryCollection` brute est séparée en plusieurs Features afin de pouvoir afficher et sélectionner chaque objet.

### `features/geometry-list/GeometryList.tsx`

Ce composant de présentation ne possède aucun état propre.

- Il reçoit la liste, la sélection et les callbacks.
- Un compteur indique le nombre d'objets.
- Un état vide remplace la liste lorsqu'aucune donnée n'est chargée.
- `items.map` transforme chaque géométrie en élément de liste.
- `key={item.id}` donne à React une identité stable.
- La case à cocher est contrôlée par `selectedIds`.
- La pastille utilise la même palette que la couche cartographique.
- Les éléments décoratifs portent `aria-hidden="true"`.
- Le bouton de suppression possède un nom accessible contenant le nom de l'objet.

### `features/geometry-operations/calculateGeometry.ts`

Ce fichier contient la logique de calcul sans dépendre de React.

`asPolygon` refuse les points, lignes et collections. Après ce contrôle, TypeScript peut traiter l'objet comme `PolygonFeature`.

`calculateGeometry` :

1. Exige au moins deux objets.
2. Vérifie que tous sont polygonaux.
3. Les transforme en `FeatureCollection`.
4. Appelle `union`, `intersect` ou `difference` de Turf.

L'intersection peut retourner `null` si les zones n'ont aucune partie commune. La soustraction retire les polygones suivants du premier.

### `features/geometry-operations/GeometryOperations.tsx`

Ce composant relie l'interface au calcul.

- `operation` est un état local commençant à `union`.
- `flatMap` retrouve les Features dans l'ordre des UUID sélectionnés.
- `calculateGeometry` produit le résultat ou déclenche une erreur métier.
- Le résultat reçoit une propriété `name`.
- Toute erreur efface l'ancien résultat.
- Le sélecteur possède un label accessible, caché visuellement avec `sr-only`.
- Le bouton est désactivé avec moins de deux sélections.
- L'aide rappelle le comportement particulier de la soustraction.

### `features/map/GeometryMap.tsx`

Ce fichier intègre Leaflet.

#### Styles des couches

`LAYER_STYLES` contient les six styles des données sources. `RESULT_STYLE` utilise un remplissage jaune et un contour sombre pointillé. Ces objets sont des options de l'API Leaflet, pas du CSS placé dans le JSX.

#### Recentrage

`FitMapToData` récupère l'instance Leaflet avec `useMap`. Son `useEffect` :

1. Ignore une collection vide.
2. Calcule le rectangle contenant les données avec `getBounds()`.
3. Vérifie sa validité.
4. Appelle `fitBounds` avec une marge et un zoom maximal.

Le composant retourne `null` car il exécute un effet sans créer d'élément visible.

#### Affichage

`useMemo` construit une collection contenant les objets sources et le résultat. `MapContainer` initialise la carte au centre de la Suisse. `TileLayer` fournit les tuiles OpenStreetMap avec l'attribution obligatoire. Chaque objet devient une couche `GeoJSON`. Le résultat reçoit une clé dépendant de sa géométrie pour forcer React-Leaflet à recréer la couche lorsqu'il change.

La légende du résultat est rendue uniquement lorsque celui-ci existe.

### `features/map/DrawingControls.tsx`

Ce composant configure Leaflet-Geoman et ajoute uniquement l'outil de dessin polygonal. Les auto-intersections sont interdites. Lorsqu'un dessin est terminé, la couche temporaire est convertie en Feature GeoJSON, retirée de Leaflet, puis transmise à `App`. Elle rejoint ainsi la liste, la palette et les opérations Turf comme une géométrie importée.

### `src/index.css`

Cette feuille contient les styles véritablement globaux :

- Pile de polices système.
- Couleurs de base.
- Amélioration du rendu typographique.
- `box-sizing: border-box` sur tous les éléments.
- Suppression de la marge native du `body`.
- Héritage de la police par les contrôles.
- Contour visible pour la navigation au clavier avec `:focus-visible`.

### `src/App.css`

Cette feuille contient la présentation de l'application :

- Grille principale composée de la barre latérale et de la carte.
- Panneaux des trois étapes.
- Boutons principaux et secondaires.
- Faux bouton de sélection de fichier.
- Textarea monospace.
- Liste, compteur, pastilles et suppression.
- Ligne des opérations.
- Messages d'état.
- Classe accessible `sr-only`.
- Hauteur nécessaire au conteneur Leaflet.
- Légende cartographique.
- Adaptation en colonne sous 760 px.

Les classes `.color-0` à `.color-5` doivent rester synchronisées avec `LAYER_STYLES` dans `GeometryMap.tsx`.

### `exemples-geometries.txt`

Le fichier est du JSON valide malgré son extension `.txt`. Sa racine est une `FeatureCollection` contenant trois polygones nommés. Chaque position suit l'ordre `[longitude, latitude]` et chaque anneau répète sa première position à la fin. Les zones se chevauchent volontairement afin de produire des résultats visibles pour les trois opérations.

### `package.json`

Le manifeste npm déclare les scripts, les dépendances et les versions de Node attendues.

- `private: true` empêche une publication accidentelle sur npm.
- `type: module` active les modules ES modernes.
- `dependencies` contient le code utilisé dans l'application.
- `devDependencies` contient les outils de compilation et de qualité.
- `engines` documente Node 24 et npm 11.

Le préfixe `^` autorise les mises à jour compatibles dans une même version majeure. Le préfixe `~` limite les mises à jour à une même version mineure.

### `package-lock.json`

Ce fichier généré par npm verrouille les versions exactes de toutes les dépendances directes et transitives. Il ne doit pas être modifié manuellement. Il est versionné pour reproduire les mêmes installations avec `npm ci` sur une autre machine ou dans GitHub Actions.

### `tsconfig.json`

La configuration TypeScript :

- Cible JavaScript ES2023.
- Inclut les API DOM.
- Conserve les modules modernes pour Vite.
- Active la transformation JSX moderne.
- Vérifie les types sans générer de fichiers.
- Active le mode strict.
- Considère qu'un accès par index peut retourner `undefined`.
- Refuse les variables et paramètres inutilisés.
- Analyse `src` et `vite.config.ts`.

### `vite.config.ts`

Le plugin React transforme les fichiers JSX/TSX et active le rafraîchissement rapide. `base: "/geo-react/"` indique que l'application est publiée sous le sous-chemin GitHub Pages du dépôt.

### `eslint.config.js`

La configuration combine :

- Les règles JavaScript recommandées.
- Les règles TypeScript recommandées.
- Les règles des Hooks React.
- Les contraintes de React Refresh.
- La compatibilité avec Prettier.
- Les variables globales du navigateur.

Le dossier `dist` est ignoré parce qu'il contient du code généré.

### `.github/workflows/deploy.yml`

Ce workflow s'exécute lors d'un push sur `main` ou manuellement depuis GitHub Actions. Il :

1. Récupère le dépôt.
2. Installe Node.js 24.
3. Installe les dépendances avec `npm ci`.
4. Exécute `npm run check`.
5. Envoie le dossier `dist` à GitHub Pages.
6. Déploie le site.

Les permissions `pages: write` et `id-token: write` autorisent uniquement ce déploiement. La concurrence annule un ancien déploiement encore en cours lorsqu'une version plus récente arrive.

### `.gitignore`

Ce fichier empêche Git de suivre les journaux, `node_modules`, `dist`, les variables d'environnement et les réglages propres aux éditeurs. Ces fichiers peuvent être recréés ou contiennent des informations locales qui ne doivent pas entrer dans le dépôt.

## Validation du projet

La commande suivante doit réussir avant chaque livraison :

```bash
npm run check
```

Elle exécute successivement :

1. la vérification Prettier.
2. ESLint sans avertissement autorisé.
3. TypeScript en mode strict.
4. le build Vite de production.

## Déploiement

Le workflow GitHub Pages est automatique après activation de **Settings → Pages → Build and deployment → GitHub Actions**.

Chaque push sur `main` déclenche ensuite un nouveau contrôle et un nouveau déploiement :

```bash
git add .
git commit -m "description du changement"
git push origin main
```

## Difficultés et limites

- Les opérations de composition acceptent uniquement `Polygon` et `MultiPolygon`.
- La carte peut néanmoins afficher des points et des lignes.
- Les données sont conservées uniquement en mémoire et disparaissent lors du rechargement.
- Le fond OpenStreetMap nécessite une connexion internet.
- La palette recycle une couleur après six objets.
- La validation structurelle ne détecte pas toutes les anomalies topologiques possibles, comme certains polygones auto-intersectés.
- Aucun test automatisé ne vérifie encore le comportement métier.

## Améliorations possibles

- Ajouter des tests unitaires pour le parseur et les opérations.
- Exporter le résultat en `.geojson`.
- Renommer et réordonner les géométries.
- Choisir explicitement la géométrie de base pour la soustraction.
- Afficher le type de chaque géométrie dans la liste.
- Dessiner directement sur la carte.
- Conserver l'état dans le navigateur.
- Personnaliser les couleurs.
