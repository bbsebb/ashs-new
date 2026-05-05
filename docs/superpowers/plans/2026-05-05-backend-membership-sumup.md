# Plan d'implémentation Backend : Module Membership & Paiement SumUp

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**But :** Implémenter la logique métier, l'exposition API et l'intégration de paiement SumUp pour la gestion des cotisations au sein du module `membershipservice`.

**Architecture :** Utilisation de Spring Modulith avec une approche pilotée par les événements pour le traitement des paiements. Intégration directe de l'API SumUp via un client REST (Spring Interface Client).

**Tech Stack :** Java 25, Spring Boot 4.0, Spring Modulith, PostgreSQL, Flyway, SumUp API.

---

### Task 1: Exposition de l'API Campaign (Admin & Public)

**Fichiers :**
- Créer : `backend/src/main/java/fr/hoenheimsports/backend/membershipservice/controllers/CampaignController.java`
- Tester : `backend/src/test/java/fr/hoenheimsports/backend/membershipservice/controllers/CampaignControllerTest.java`

- [x] **Étape 1 : Écrire le test de tranche pour la création de campagne (POST /api/admin/campaigns)**
- [x] **Étape 2 : Implémenter `CampaignController` avec les endpoints nécessaires**
- [x] **Étape 3 : Vérifier le test et valider l'intégralité des champs de réponse via `jsonPath`**

---

### Task 2: Service de gestion des adhésions (Membership)

**Fichiers :**
- Créer : `backend/src/main/java/fr/hoenheimsports/backend/membershipservice/services/MembershipService.java`
- Créer : `backend/src/main/java/fr/hoenheimsports/backend/membershipservice/dtos/MembershipCreateRequest.java`
- Créer : `backend/src/main/java/fr/hoenheimsports/backend/membershipservice/dtos/MembershipResponse.java`
- Tester : `backend/src/test/java/fr/hoenheimsports/backend/membershipservice/services/MembershipServiceTest.java`

- [x] **Étape 1 : Écrire un test unitaire pour la création d'une adhésion en attente (`PENDING`)**
- [x] **Étape 2 : Implémenter `MembershipService`**
  - Validation que la campagne est bien `LAUNCHED`.
  - Enregistrement de l'adhésion avec le statut `PENDING`.

---

### Task 3: Intégration API SumUp (Client REST)

**Fichiers :**
- Créer : `backend/src/main/java/fr/hoenheimsports/backend/membershipservice/services/SumUpClient.java`
- Créer : `backend/src/main/java/fr/hoenheimsports/backend/membershipservice/services/SumUpProperties.java`
- Créer : `backend/src/main/java/fr/hoenheimsports/backend/membershipservice/dtos/SumUpCheckoutRequest.java`
- Créer : `backend/src/main/java/fr/hoenheimsports/backend/membershipservice/dtos/SumUpCheckoutResponse.java`

- [x] **Étape 1 : Configurer `SumUpProperties` pour charger l'API Key et le Merchant ID depuis `application.yml`**
- [x] **Étape 2 : Implémenter l'interface `SumUpClient` utilisant le `RestClient` de Spring 6+**
- [x] **Étape 3 : Ajouter une méthode dans `MembershipService` pour initier le checkout SumUp**

---

### Task 4: Contrôleur Public pour les adhésions

**Fichiers :**
- Créer : `backend/src/main/java/fr/hoenheimsports/backend/membershipservice/controllers/MembershipController.java`
- Tester : `backend/src/test/java/fr/hoenheimsports/backend/membershipservice/controllers/MembershipControllerTest.java`

- [x] **Étape 1 : Écrire le test d'intégration pour `POST /api/public/memberships`**
- [x] **Étape 2 : Implémenter le contrôleur**

---

### Task 5: Gestion des Webhooks et Événements Modulith

**Fichiers :**
- Créer : `backend/src/main/java/fr/hoenheimsports/backend/membershipservice/controllers/SumUpWebhookController.java`
- Créer : `backend/src/main/java/fr/hoenheimsports/backend/membershipservice/events/SumUpPaymentEvent.java`
- Tester : `backend/src/test/java/fr/hoenheimsports/backend/membershipservice/controllers/SumUpWebhookControllerTest.java`

- [x] **Étape 1 : Définir l'événement `SumUpPaymentEvent` (record avec checkoutId et status)**
- [x] **Étape 2 : Implémenter le contrôleur Webhook**

---

### Task 6: Écouteur d'événements et Mise à jour du statut

**Fichiers :**
- Créer : `backend/src/main/java/fr/hoenheimsports/backend/membershipservice/services/MembershipEventListener.java`
- Tester : `backend/src/test/java/fr/hoenheimsports/backend/membershipservice/MembershipModuleIntegrationTest.java`

- [x] **Étape 1 : Écrire un test d'intégration Modulith (`@ApplicationModuleTest`)**
- [x] **Étape 2 : Implémenter `MembershipEventListener` avec `@ApplicationModuleListener`**

---

### Task 7: Gestion Admin des adhésions payées

**Fichiers :**
- Modifier : `backend/src/main/java/fr/hoenheimsports/backend/membershipservice/controllers/CampaignController.java`
- Tester : Ajouter des cas de test dans `CampaignControllerTest`.

- [x] **Étape 1 : Ajouter un endpoint `GET /api/admin/campaigns/{id}/memberships`** pour lister les inscrits.
- [x] **Étape 2 : Ajouter un endpoint `PATCH /api/admin/memberships/{id}/process`** pour passer une adhésion `PAID` à `PROCESSED`.
