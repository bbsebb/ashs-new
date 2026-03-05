# Règles de développement du Projet (Monorepo)

## Contexte Global

- **Stack :** Angular 21, Java 25, Spring Boot 4.0 (ou Spring Framework 7.0), Gradle.
- **Langue :** Réponds toujours en français.
- **Ton :** Direct et technique. Pas de préambules inutiles.
- **Conventions de Code Générales :**
    - **Style :** Privilégie des noms de variables longs et explicites. **Aucune abréviation autorisée** (ex: utilise
      `userAuthenticationStatus` et non `authStatus`).
    - **Commentaire** : tous les commentaires doivent être en anglais.

## Frontend (Angular 21 & Material)

- **Réactivité (Signals & RxJS) :**
    - **Logique :** Privilégie les **Signals Angular** pour la gestion d'état et la réactivité.
    - **Nommage Signals :** Les signals doivent inclure le suffixe `Signal` (ex: `isLoadingSignal`,
      `productsListSignal`).
    - **Nommage Observables :** Les observables doivent avoir le suffixe `$` (ex: `routeParams$`, `userActions$`).
    - **Variables Privées :** Doivent impérativement porter le prefix `_` (ex: `_userService`, `_itemsList`).
- **Composants :** Utilise au maximum les composants d'Angular Material 21.
- **Stylisation :** Utilise exclusivement SCSS.
- **Nommage CSS :**
    - Utilise des noms de classes simples, courts et sémantiques (ex: `.card`, `.title`, `.actions`).
    - **Interdiction :** Ne pas utiliser le style `composant__nom` ou `bloc__element` (BEM).
    - Profite de l'encapsulation native d'Angular : les styles étant scopés au composant, utilise des sélecteurs
      simples.
- **Design Tokens & Material 3 :**
    - **Référence :** Utilise les variables CSS natives pour lire les valeurs : `var(--mat-sys-primary)`, etc.
    - **Overrides :** Pour modifier le style d'un composant, utilise exclusivement les mixins d'overrides (ex:
      `mat.snack-bar-overrides`).
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

## Backend (Java 25 & Spring)

- **Java 25 :** Utilise les dernières fonctionnalités (Pattern Matching avancé, String Templates stabilisés, Records,
  Scoped Values).
- **Gestion du Null :** Politique "Zero Null".
    - Utilise `Optional<T>` pour les retours de méthodes pouvant être vides.
    - Utilise les annotations `@NonNullApi` au niveau du package et `@Nullable` uniquement par exception.
    - Préfère les `Objects.requireNonNull()` pour la validation d'entrée.
- **Architecture :** Utilise **Spring Modulith**.
    - Respecte strictement l'encapsulation des modules (seuls les packages exposés peuvent être utilisés par d'autres
      modules).
    - Favorise les événements d'application (`ApplicationEventPublisher`) pour la communication entre modules.
- **Outils :** Configuration via Gradle (Kotlin DSL de préférence).