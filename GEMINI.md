# Règles de développement du Projet (Monorepo)

## Contexte Global

- **Architecture :** Monorepo Fullstack centralisé.
    - **Frontend :** Monorepo Angular structuré par projets (`projects/`) séparant les applications (`app`, `admin`) des bibliothèques métier (`shared-domain`, `shared-api`) et UI (`shared-ui`).
    - **Backend :** Monolithe Modulaire (Spring Modulith) favorisant l'encapsulation et la communication par événements.
- **Stack :** Angular 21, Java 25, Spring Boot 4.0 (ou Spring Framework 7.0), Gradle.
- **Langue :** Réponds toujours en français.
- **Ton :** Direct et technique. Pas de préambules inutiles.
- **Conventions de Code Générales :**
    - **Style :** Privilégie des noms de variables longs et explicites.
      - **Exception acceptée :** Les abréviations universelles et standards du métier (`id`, `init`, `url`, `config`, `dto`) sont autorisées.
      - **Interdiction :** Aucune autre abréviation contextuelle n'est autorisée (ex: utilise `userAuthenticationStatus` et non `authStatus`).
    - **Commentaire** : tous les commentaires doivent être en anglais.
    - **Atomicité :** Favorise les commits atomiques regroupant à la fois les changements backend (API) et frontend (Consommation) pour une fonctionnalité donnée.

## Frontend (Angular 21 & Material)

- **Réactivité (Signals & RxJS) :**
    - **Logique :** Privilégie les **Signals Angular** pour la gestion d'état et la réactivité.
  - **Nommage Signals :** Les signals d'état interne doivent include le suffixe `Signal` (ex: `isLoadingSignal`).
  - **Signal Inputs (Parent-Enfant & Route) :** Tout input utilisant les Signals doit impérativement porter le suffixe
    `InputSignal` en interne et utiliser un alias sans ce suffixe pour l'API publique (ex:
    `userNameInputSignal = input.required<string>({ alias: 'userName' })`).
      - Cette distinction permet de différencier immédiatement un état local (`Signal`) d'une donnée d'entrée (
        `InputSignal`).
      - Le composant parent (ou le routeur) utilise toujours le nom simple : `[userName]="value"`.
  - **Nommage Observables :** Les observables doivent avoir le suffixe `$` (ex: `routeParams$`).
    - **Variables Privées :** Doivent impérativement porter le prefix `_` (ex: `_userService`, `_itemsList`).
- **Composants : Smart vs Dumb :**
    - **Smart Components (Containers) :**
        - Orchestrent la logique métier en injectant les **Stores** et **Gateways**.
        - S'abonnent aux données et gèrent les interactions avec les services.
        - Ne contiennent quasiment aucun style CSS complexe (uniquement du layout).
        - Passent les données aux composants Dumb via des **ViewModels**.
    - **Dumb Components (Presentation) :**
        - Focalisés exclusivement sur le rendu visuel et l'interaction utilisateur immédiate.
        - **Interdiction :** Ne doivent jamais injecter de services métier (Stores/Gateways). Seuls les services
          utilitaires (ex: `MatDialog`, `BreakpointObserver`) sont tolérés.
        - Reçoivent leurs données via un seul input `viewModel` (pattern `InputSignal`).
        - Communiquent avec le parent exclusivement via des `output()`.
- **ViewModel (MVVM) & Communication :**
    - **Définition :** Un `ViewModel` est un objet (Interface ou Type) regroupant l'intégralité des données nécessaires
      à l'affichage d'un composant Dumb.
    - **Génération :** Le `ViewModel` est impérativement généré dans le **Store** via un `computed()` signal pour
      garantir une réactivité fine et une logique centralisée.
    - **Nommage :** Doit porter le suffixe `ViewModel` (ex: `HallDetailsViewModel`).
- **Composants :**
    - Utilise au maximum les composants d'Angular Material 21.
    - **Structure :** Tout composant Angular doit être impérativement structuré en 3 fichiers distincts (`.ts`, `.html`, `.scss`). L'utilisation de templates ou de styles inline est interdite.
- **Stylisation :** Utilise exclusivement SCSS. Interdiction formelle d'utiliser CSS Grid ; utilise exclusivement
  Flexbox pour tous les layouts.
- **Nommage CSS :**
    - Utilise des noms de classes simples, courts et sémantiques (ex: `.card`, `.title`, `.actions`).
    - **Interdiction :** Ne pas utiliser le style `composant__nom` ou `bloc__element` (BEM).
    - Profite de l'encapsulation native d'Angular : les styles étant scopés au composant, utilise des sélecteurs
      simples.
- **Design Tokens & Material 3 :**
    - **Référence :** Utilise les variables CSS natives pour lire les valeurs : `var(--mat-sys-primary)`, etc.
    - **Overrides :** Pour modifier le style d'un composant, utilise exclusivement les mixins d'overrides (ex: `mat.snack-bar-overrides`).
    - **Règle de priorité :** Si une propriété spécifique (comme la couleur de fond) ne possède pas de token correspondant dans la mixin d'override de Material 3, utilise les propriétés CSS standards (ex: `background-color`) directement sur le sélecteur.
    - **Scoping des Overrides :**
        - Ne pas utiliser systématiquement `:root`.
        - Appliquer les overrides de préférence sur la classe du thème (ex:
          `.my-light-theme { @include mat.button-overrides(...) }`) ou sur le sélecteur du composant parent pour limiter
          la portée.
    - **Évite :** Ne jamais modifier les styles via des classes CSS globales (`.mat-mdc-snack-bar-container`), utilise
      toujours l'API d'overrides officielle de Material.
- **HTML Sémantique :**
    - Évite l'abus de `<div>`.
    - Utilise les balises `<main>`, `<section>`, `<article>`, `<header>`, `<footer>`, `<nav>`.
    - Utilise les attributs ARIA si nécessaire pour l'accessibilité.
- **Architecture de Service (Pattern Gateway -> Store) :**
    - **Structure de fichiers :** Un sous-dossier par domaine métier dans `services/` (ex: `hall/`) contenant :
        - `[domaine].gateway.ts` : Appels HTTP purs, mapping technique et validation des réponses.
        - `[domaine]s.store.ts` : Gestion d'état centralisée via Signals.
        - `[domaine].dtos.ts` : Centralisation de tous les types DTO (Data Transfer Objects) du domaine.
      - `[domaine].view-models.ts` : Centralisation des interfaces de ViewModel du domaine.
    - **Implémentation Gateway :**
        - Utilise `httpResource` pour les requêtes de lecture (GET).
        - Utilise `Observable<T>` pour les mutations (POST, PUT, DELETE).
    - **Implémentation Store :**
        - Injecte la Gateway et expose les données via des Signals publics (suffixe `Signal`).
      - **ViewModel Exposer :** Doit exposer un signal `computed` nommé `[nom]ViewModelSignal` qui agrège les états
        nécessaires pour les composants Dumb.
        - **Zéro Reload Policy :** Les mutations ne doivent jamais appeler `reload()`. Elles doivent intercepter l'objet de retour via `tap()` et mettre à jour le cache local du signal via `this.resource.update()`.
        - **Nommage Explicite :** Les variables dans les opérateurs RxJS et les callbacks de signaux doivent être longues et descriptives (ex: `hallsList.map(hall => ...)` et non `items.map(i => ...)`).

## Backend (Java 25 & Spring)

- **Java 25 :** Utilise les dernières fonctionnalités (Pattern Matching avancé, String Templates stabilisés, Records,
  Scoped Values).
- **Gestion du Null :** Politique "Zero Null".
    - Utilise `@NullMarked` (JSpecify) au niveau du package.
    - Utilise `Optional<T>` pour les retours de méthodes pouvant être vides.
    - Utilise les annotations `@Nullable` uniquement par exception.
- **Architecture :** Utilise **Spring Modulith**.
    - Respecte strictement l'encapsulation des modules (seuls les packages exposés peuvent être utilisés par d'autres
      modules).
    - Favorise les événements d'application (`ApplicationEventPublisher`) pour la communication entre modules.
- **Tests (Standard Spring Boot 4.0) :**
    - **Exigences :** Les tests doivent être **exhaustifs** (couvrant tous les endpoints, services et cas limites via
      Boundary Value Analysis).
    - **Assertions :** Utilise exclusivement **AssertJ** pour sa fluidité et sa puissance.
    - **Logiciel (Services & Entités) :** Privilégie les tests unitaires purs avec JUnit 6 et Mockito (sans chargement
      de contexte).
    - **Contrôleurs (Slice Tests) :**
        - Utilise
          `@WebMvcTest(value = MyController.class, excludeAutoConfiguration = {SecurityAutoConfiguration.class, OAuth2ResourceServerAutoConfiguration.class})`.
        - Utilise **`RestTestClient`** (`org.springframework.test.web.servlet.client.RestTestClient`) initialisé
          manuellement dans un `@BeforeEach` via `RestTestClient.bindTo(mockMvc).build()` pour les tests d'API fluides.
    - **Mocking :** Utilise systématiquement **`@MockitoBean`** pour l'injection de mocks dans le contexte Spring.
- **Persistance & Migration :**
    - **Flyway :** Un schéma de base de données par module Spring Modulith pour garantir l'isolation des données.
    - **Développement :** Utilisation du support **Docker Compose** de Spring Boot pour l'instanciation automatique de la base de données en local.
- **Outils :** Configuration via Gradle (Kotlin DSL de préférence).
