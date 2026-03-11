# 🧪 sandbox.imuchat.app — Environnement de Test

> Environnement sandbox pour développeurs : tester les APIs, mini-apps et intégrations sans impacter la production.

---

## 🎯 Objectif Stratégique

**Accélérer l'adoption développeur** en offrant un environnement complet, sûr et gratuit pour prototyper, tester et débugger avant publication sur le Store ou mise en production.

---

## 📋 Fiche d'identité

| Champ | Valeur |
|---|---|
| **Sous-domaine** | `sandbox.imuchat.app` |
| **Type** | Environnement de développement / test |
| **Cibles principales** | Développeurs mini-apps, intégrateurs API |
| **Priorité** | 🟡 Moyenne |
| **Accès** | Compte développeur ImuChat (gratuit) |
| **i18n** | FR, EN |

---

## 🧭 Arborescence

```
sandbox.imuchat.app
├── /                     → Accueil (présentation + connexion)
├── /console              → Console développeur (dashboard)
├── /console/apps         → Mes mini-apps en test
├── /console/apps/[id]    → Détail mini-app (logs, preview, config)
├── /console/api          → API Explorer interactif
├── /console/webhooks     → Test webhooks (request inspector)
├── /console/logs         → Logs sandbox (requêtes, erreurs)
├── /preview              → Preview mini-app (iframe simulé)
├── /preview/[appId]      → Preview d'une mini-app spécifique
├── /mock                 → Données de test (mock users, servers)
└── /docs                 → Lien vers docs.imuchat.app
```

---

## 📄 Pages clés

### 🏠 `/` — Accueil

**Sections** :
1. **Hero** — "Votre labo pour construire sur ImuChat"
2. **Caractéristiques** — API Explorer, Mini-app Preview, Webhooks, Mock Data
3. **Différences Sandbox vs Production** — Tableau comparatif
4. **CTA** — "Accéder à la console"

### 🖥️ `/console` — Console Développeur

**Dashboard** :
- Apps en développement (nombre, dernière activité)
- Requêtes API sandbox (volume, erreurs)
- Webhooks actifs
- Quota utilisé / disponible

### 🔍 `/console/api` — API Explorer

**Interface interactive** :
- Liste de tous les endpoints API
- Pour chaque endpoint :
  - Méthode + URL
  - Paramètres (formulaire remplissable)
  - Headers (auto-remplis avec API key sandbox)
  - Bouton "Envoyer"
  - Réponse : status code, headers, body (JSON pretty-print)
  - Temps de réponse
- Historique des requêtes (session)
- Génération de code (cURL, JS, Python)

### 📱 `/preview/[appId]` — Preview Mini-App

**Simulateur** :
- Frame simulant l'interface ImuChat (mobile/desktop toggle)
- Mini-app chargée dans un iframe isolé
- Console de debug (logs ImuAPI Bridge)
- Inspecteur d'événements (events envoyés/reçus)
- Mock d'utilisateur (changer le user connecté)
- Mock de permissions (toggle chaque permission)

### 🔗 `/console/webhooks` — Test Webhooks

- URL de webhook sandbox fournie automatiquement
- Request inspector (liste de toutes les requêtes reçues)
- Par requête : headers, body, timestamp
- Replay (renvoyer un événement)
- Filtres par type d'événement

### 📊 `/console/logs` — Logs

- Toutes les requêtes API sandbox
- Filtres : endpoint, status code, timestamp
- Détail : request + response complètes
- Export JSON

### 🎭 `/mock` — Données de Test

**Données pré-remplies** :
| Type | Quantité | Description |
|---|---|---|
| Utilisateurs | 50 | Profils fictifs variés |
| Serveurs | 10 | Serveurs avec channels |
| Messages | 1000 | Conversations simulées |
| Fichiers | 100 | Images, docs, vidéos test |
| Transactions | 200 | Paiements simulés (ImuPay) |

**Actions** :
- Reset des données (retour à l'état initial)
- Générer des données custom (seed)
- Simuler des événements temps réel

---

## ⚙️ Sandbox vs Production

| Aspect | Sandbox | Production |
|---|---|---|
| URL base | `api.sandbox.imuchat.app` | `api.imuchat.app` |
| Données | Fictives (mock) | Réelles |
| Rate limits | Réduits (100 req/min) | Selon plan |
| Paiements | Simulés (pas de vrais €) | Réels |
| Webhooks | URL de test | URL custom |
| Alice IA | Réponses simulées ou limitées | Complète |
| SLA | Best effort | Garanti |

---

## 🛠 Stack Technique

| Composant | Technologie |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | Shadcn/ui + Tailwind CSS |
| API Explorer | Custom (React) ou Swagger UI adapté |
| Code editor | Monaco Editor (VS Code web) |
| Preview iframe | Sandbox CSP isolé |
| Mock data | Faker.js + seed Supabase |
| Auth | Supabase Auth (comptes développeurs) |
| Backend | API gateway sandbox (rate limited) |
| Déploiement | Firebase Hosting |

---

## 📊 KPIs

| Métrique | Objectif |
|---|---|
| Développeurs actifs/mois | 500+ |
| Requêtes sandbox/jour | 50K+ |
| Mini-apps testées → publiées | > 40% |
| Temps moyen avant première requête | < 5 min |

---

## 📅 Roadmap

### Phase 1 (Semaines 1-3)
- [ ] Console développeur
- [ ] API Explorer basique (top 10 endpoints)
- [ ] Mock data (users, messages, servers)
- [ ] Auth développeurs

### Phase 2 (Semaines 4-6)
- [ ] Preview mini-app (simulateur)
- [ ] Webhook inspector
- [ ] Logs complets
- [ ] Code generation (cURL, JS, Python)
- [ ] API Explorer complet

---

## 🔗 Liens

- **`docs.imuchat.app`** → Documentation technique
- **`developers.imuchat.app`** → Portail développeur
- **`store.imuchat.app`** → Publication des mini-apps
