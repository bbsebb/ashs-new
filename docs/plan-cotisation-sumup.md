# Plan d'implémentation : Module Membership Fee & Paiement SumUp

## Objectif
Ajouter un module complet permettant la gestion des campagnes de cotisations par saison et le paiement en ligne via SumUp pour les joueurs de l'ASHS.

## Périmètre et Impact
- **Backend** : Création d'un nouveau module métier `membershipservice` selon les principes de Spring Modulith. Intégration de l'API SumUp pour la création de sessions *Hosted Checkout* et gestion des Webhooks de manière événementielle.
- **Frontend** :
  - **Shared** : Création du domaine `membership` (modèles, store, gateway).
  - **Admin** : Interface de gestion des campagnes (choix de saison, création de catégories/prix dynamiques, lancement) et gestion des cotisations payées (statut SumUp + action "Process").
  - **App (Public)** : Formulaire de paiement de cotisation pour la campagne active, redirigeant vers SumUp, et pages de retour (succès/erreur).
- **Documentation** : Mise à jour du fichier `docs/design_document.md`.

## Solution Proposée et Architecture

### 1. Backend (`membershipservice`)
- **Entités JPA** :
  - `Campaign` : `id` (UUID), `seasonId` (UUID), `status` (Enum: `DRAFT`, `LAUNCHED`), `categories` (ElementCollection de Map<String, BigDecimal>).
  - `Membership` : `id` (UUID), `campaignId` (UUID), `firstName`, `lastName`, `email`, `licenseNumber`, `categoryName`, `amount`, `status` (Enum: `PENDING`, `PAID`, `FAILED`, `PROCESSED`), `sumupCheckoutId` (String).
- **Intégration SumUp** :
  - Client REST pour appeler `POST https://api.sumup.com/v0.1/checkouts`.
  - Contrôleur Webhook `/api/webhooks/sumup` recevant les événements SumUp.
- **Événements (Modulith)** : Le contrôleur Webhook publie un `SumUpPaymentEvent`. Un écouteur (`@ApplicationModuleListener`) met à jour le statut de la cotisation.

### 2. Frontend
- **Domaine Shared (`shared-domain` & `shared-api`)** :
  - Modèles `Campaign`, `Membership`, et Enumérations `MembershipStatus` (`PENDING`, `PAID`, `FAILED`, `PROCESSED`).
  - `MembershipGateway` & `MembershipStore` (gestion des états via Signals).
- **Projet Admin** :
  - Interface *Smart* & *Dumb* : Liste des campagnes, Formulaire dynamique (Saison + liste dynamique de prix par catégorie).
  - Bouton "Launch campaign" (affiche publiquement).
  - Liste des inscrits par campagne avec possibilité de changer un statut `PAID` en `PROCESSED`.
- **Projet App (Public)** :
  - Formulaire accessible à tous : saisie des informations et choix de la catégorie (liste déroulante basée sur la campagne active).
  - Au clic : création du `Membership` en BDD (état `PENDING`), réception de l'URL SumUp, et redirection.
  - Routes `/membership/success` et `/membership/error`.

## Étapes d'implémentation (Phases)

1. **Backend - Domaine et Entités** : Création du module `membershipservice` avec entités, repositories, et tests. (Détails dans [le plan backend](superpowers/plans/2026-05-05-backend-membership-sumup.md))
2. **Backend - API SumUp et Webhook** : Création du client SumUp, implémentation des endpoints et de la publication/écoute d'événements. (Détails dans [le plan backend](superpowers/plans/2026-05-05-backend-membership-sumup.md))
3. **Frontend - Shared** : Création des DTOs, ViewModels, Gateways et Stores.
4. **Frontend - Admin** : Création des composants Smart/Dumb pour gérer les campagnes et consulter les paiements.
5. **Frontend - App (Public)** : Implémentation du formulaire de paiement et des pages de retour.

## Validation et Tests
- Tests unitaires et d'intégration backend exhaustifs (TDD).
- Validation de l'Event-driven via les tests Modulith (`@ApplicationModuleTest`).
- Tests côté Angular via Vitest.
