# 📊 analytics.imuchat.app — Dashboard Analytics Interne

> Dashboard analytics interne : métriques produit, cohortes, funnels, rétention, revenus.

---

## 🎯 Objectif Stratégique

**Piloter la croissance d'ImuChat avec des données** : comprendre le comportement utilisateur, mesurer la rétention, optimiser les funnels de conversion, suivre les revenus.

---

## 📋 Fiche d'identité

| Champ | Valeur |
|---|---|
| **Sous-domaine** | `analytics.imuchat.app` |
| **Type** | Dashboard analytics interne |
| **Cibles principales** | Product Managers, Growth, Direction, Data Analysts |
| **Priorité** | 🔴 Critique |
| **Accès** | SSO interne + RBAC |
| **i18n** | FR |

---

## 🧭 Arborescence

```
analytics.imuchat.app
├── /                     → Overview (KPIs principaux)
├── /users                → Métriques utilisateurs
├── /users/cohorts        → Analyse de cohortes
├── /users/retention      → Courbes de rétention
├── /users/segments       → Segments utilisateurs
├── /engagement           → Engagement produit
├── /engagement/features  → Usage par feature
├── /engagement/sessions  → Durée & fréquence sessions
├── /funnels              → Funnels de conversion
├── /funnels/signup       → Funnel inscription
├── /funnels/activation   → Funnel activation (first value)
├── /funnels/monetization → Funnel conversion payant
├── /revenue              → Métriques revenus
├── /revenue/mrr          → MRR / ARR
├── /revenue/ltv          → LTV par cohorte
├── /revenue/churn        → Churn & rétention revenue
├── /store                → Analytics ImuStore
├── /arena                → Analytics ImuArena
├── /alice                → Analytics Alice IA
├── /platforms            → Répartition Web/Mobile/Desktop
├── /geo                  → Géographie utilisateurs
├── /experiments          → A/B tests
└── /reports              → Rapports programmés (export)
```

---

## 📄 Pages clés

### 🏠 `/` — Overview

**KPIs principaux** (cards en haut) :
| Métrique | Description |
|---|---|
| **DAU** | Daily Active Users |
| **MAU** | Monthly Active Users |
| **DAU/MAU** | Ratio stickiness |
| **MRR** | Monthly Recurring Revenue |
| **Churn Rate** | Taux d'attrition mensuel |
| **NPS** | Net Promoter Score |

**Graphiques** :
- **Courbe DAU/MAU** — 90 jours, overlay YoY
- **Répartition plateformes** — Pie chart (Web/iOS/Android/Desktop)
- **Top features** — Bar chart usage hebdo
- **Funnel express** — Signup → Activation → Retention D7

### 👥 `/users/cohorts` — Cohortes

- **Matrice de rétention** — Cohortes hebdomadaires/mensuelles
- **Couleurs** — Heatmap (vert = bonne rétention, rouge = churn)
- **Filtres** — Par plateforme, plan, pays, segment
- **Export** — CSV

### 📈 `/users/retention` — Rétention

- **Courbes D1, D7, D14, D30** — Par cohorte
- **Benchmark** — Comparaison avec industrie messaging
- **Objectifs** :
  - D1 > 40%
  - D7 > 25%
  - D30 > 15%

### 🔄 `/funnels` — Funnels

**Funnel Inscription** :
```
Landing Page → Clic "S'inscrire" → Formulaire → Vérif email → Profil complété → Premier message
```

**Funnel Activation** :
```
Inscription → Profil photo → Rejoindre serveur → Envoyer message → Revenir D1
```

**Funnel Monétisation** :
```
Utilisateur actif → Vue page pricing → Clic CTA → Checkout → Paiement réussi
```

Chaque étape affiche : volume, taux de conversion, drop-off.

### 💰 `/revenue` — Revenus

- **MRR/ARR** — Courbe + décomposition (New, Expansion, Contraction, Churn)
- **ARPU** — Average Revenue Per User
- **LTV** — Par cohorte, par plan, par canal d'acquisition
- **Churn revenue** — Taux + raisons (survey)
- **Prévisions** — Projection 12 mois (ML-based)

### 🧪 `/experiments` — A/B Tests

- Liste des expériences actives
- Par expérience : variants, métriques cibles, résultats statistiques
- Confiance statistique (95% minimum)
- Actions : Arrêter, Déployer le gagnant

---

## 🛠 Stack Technique

| Composant | Technologie |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI Components | Shadcn/ui + Tailwind CSS |
| Graphiques | Tremor / Recharts / D3.js (custom) |
| Data pipeline | Supabase → dbt → Data Warehouse |
| Tracking | Custom events (platform-core API) |
| A/B Testing | GrowthBook ou custom |
| Export | CSV, PDF (jsPDF) |
| Auth | SSO interne + RBAC |
| Cache | Redis (métriques pré-calculées) |
| Déploiement | Firebase Hosting (accès restreint) |

### Architecture Data

```
[Apps] → [Event Tracking API] → [Supabase/PostgreSQL]
                                        ↓
                                   [dbt transforms]
                                        ↓
                                 [Materialized Views]
                                        ↓
                              [analytics.imuchat.app]
```

---

## 📊 Métriques par Produit

| Produit | Métriques clés |
|---|---|
| **Messagerie** | Messages/jour, appels/jour, temps d'appel moyen |
| **ImuOffice** | Documents créés, collaborateurs/doc, usage stockage |
| **ImuStore** | Apps installées, reviews, revenus développeurs |
| **ImuArena** | Participations/contest, créations soumises, votes |
| **Alice IA** | Requêtes/jour, satisfaction, tokens consommés |
| **ImuPay** | Transactions/jour, volume, wallets actifs |
| **Créateurs** | Revenus créateurs, abonnés, contenus publiés |

---

## 📅 Roadmap

### Phase 1 (Semaines 1-3)
- [ ] Overview dashboard (DAU/MAU/MRR)
- [ ] Métriques utilisateurs + cohortes
- [ ] Rétention D1/D7/D30
- [ ] Auth SSO + RBAC

### Phase 2 (Semaines 4-6)
- [ ] Funnels (signup, activation, monétisation)
- [ ] Revenue dashboard (MRR, LTV, churn)
- [ ] Analytics par produit (Store, Arena, Alice)
- [ ] A/B testing framework
- [ ] Rapports programmés + export

---

## 🔗 Liens

- **`admin.imuchat.app`** → Gestion opérationnelle
- **`logs.imuchat.app`** → Logs techniques
- **`feedback.imuchat.app`** → Feedback utilisateur
