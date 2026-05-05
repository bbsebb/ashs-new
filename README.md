# ASHS-New - Plateforme de Gestion de Club Sportif

**ASHS-New** est une application fullstack moderne conçue pour la gestion complète des activités de l'AS Hoenheim Sports. L'architecture repose sur un monorepo centralisant un backend modulaire et un frontend Angular multi-projets.

## 🏗 Architecture

Le projet est structuré en **Monorepo** :

*   **`/backend`** : Monolithe modulaire (Spring Modulith) en Java 25.
*   **`/frontend`** : Monorepo Angular 21 gérant plusieurs applications (`app`, `admin`) et bibliothèques partagées.
*   **`/keycloak`** : Configuration et thèmes pour la gestion de l'identité et des accès (IAM).
*   **`/deployment`** : Fichiers de configuration pour le déploiement (Docker Compose).

## 🚀 Stack Technique

### Backend
*   **Runtime** : Java 25 (LTS)
*   **Framework** : Spring Boot 4.0 / Spring Framework 7.0
*   **Architecture** : Spring Modulith (Encapsulation par domaine)
*   **Base de données** : PostgreSQL avec Flyway pour les migrations (1 schéma par module)
*   **Sécurité** : Keycloak (OAuth2 / OIDC / JWT)
*   **Build Tool** : Gradle (Kotlin DSL)

### Frontend
*   **Framework** : Angular 21
*   **Gestion d'état** : Angular Signals (Signals-first approach)
*   **UI** : Angular Material 3
*   **Style** : SCSS (Flexbox uniquement, pas de Grid)
*   **Tests** : Vitest / Jasmine

## 🛠 Installation et Développement

### Pré-requis
*   Docker & Docker Compose
*   JDK 25
*   Node.js 22+ & Angular CLI

### 1. Environnement de services (Base de données & Keycloak)
Lancez les services nécessaires au développement local :
```bash
docker compose up -d
```
*Note : Le backend utilise le support Docker Compose de Spring Boot pour instancier automatiquement la base de données PostgreSQL.*

### 2. Lancer le Backend
```bash
cd backend
./gradlew bootRun
```
*   **Profils disponibles** : `dev`, `test`, `staging`, `prod`.

### 3. Lancer le Frontend
```bash
cd frontend
npm install
ng serve # Lance l'application principale
# ou
ng serve admin # Lance l'interface d'administration
```

## 🧪 Tests et Qualité

Le projet impose le **Test-Driven Development (TDD)** comme règle absolue.

### Backend
Exécuter les tests avec rapport détaillé :
```bash
cd backend
./gradlew test
```
*   **Assertions** : AssertJ
*   **Mocking** : Mockito / `@MockitoBean`
*   **Intégration** : Testcontainers (PostgreSQL)

### Frontend
Exécuter les tests unitaires :
```bash
cd frontend
ng test
```

## 📜 Conventions de Développement

Toutes les règles de codage sont détaillées dans le fichier **`GEMINI.md`**. En résumé :

*   **Langue** : Code et commentaires en Anglais, communication en Français.
*   **Nommage** : Variables longues et explicites (ex: `userAuthenticationStatusSignal`).
*   **Angular** : 
    *   Pattern **Smart/Dumb Components**.
    *   Utilisation systématique des **Signals** et du pattern **Gateway -> Store**.
    *   Un seul objet `ViewModel` par composant Dumb via `InputSignal`.
*   **Backend** :
    *   Architecture modulaire stricte.
    *   Utilisation de `RestTestClient` pour les tests de contrôleurs.
    *   Validation systématique des `ProblemDetail` pour les erreurs.

## 🚢 Déploiement

L'application est déployée via GitHub Actions :
*   **Staging** : Déploiement automatique sur chaque push.
*   **Production** : Déploiement sur tag ou via trigger manuel.

---
*Maintenu par l'équipe de développement de l'ASHS.*
