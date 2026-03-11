# 🔐 admin.imuchat.app — Back-Office Interne

> Dashboard d'administration interne ImuChat : gestion utilisateurs, modération, configuration, supervision.

---

## 🎯 Objectif Stratégique

**Centraliser l'administration de la plateforme** pour l'équipe interne : modération de contenu, gestion des utilisateurs, configuration des services, supervision des abus et conformité.

---

## 📋 Fiche d'identité

| Champ | Valeur |
|---|---|
| **Sous-domaine** | `admin.imuchat.app` |
| **Type** | Back-office interne (accès restreint) |
| **Cibles principales** | Équipe interne : admins, modérateurs, support, ops |
| **Priorité** | 🔴 Critique |
| **Accès** | SSO interne + RBAC (rôles : Super Admin, Admin, Modérateur, Support, Viewer) |
| **i18n** | FR |

---

## 🧭 Arborescence

```
admin.imuchat.app
├── /                     → Dashboard principal (métriques temps réel)
├── /users                → Gestion utilisateurs
├── /users/[id]           → Profil utilisateur détaillé
├── /moderation           → File de modération
├── /moderation/reports   → Signalements
├── /moderation/queue     → Queue de modération (contenu flaggé)
├── /moderation/actions   → Historique des actions (bans, warns, mutes)
├── /content              → Gestion de contenu
├── /content/servers      → Serveurs / communautés
├── /content/miniapps     → Mini-apps Store (review, publication)
├── /config               → Configuration plateforme
├── /config/features      → Feature flags
├── /config/permissions   → Rôles et permissions
├── /billing              → Facturation & abonnements
├── /support              → Tickets support
├── /support/[id]         → Détail ticket
├── /audit                → Journal d'audit
└── /settings             → Paramètres admin
```

---

## 📄 Pages clés

### 🏠 `/` — Dashboard Principal

**Widgets temps réel** :

- **Utilisateurs** — DAU, MAU, courbe 30 jours, en ligne maintenant
- **Messages** — Volume/heure, tendance
- **Signalements** — En attente, traités aujourd'hui, temps moyen de traitement
- **Serveurs** — Total, créés cette semaine, top serveurs
- **Store** — Apps en review, publiées, revenus
- **Santé système** — Latence API, uptime, erreurs/min

### 👥 `/users` — Gestion Utilisateurs

**Recherche** : par nom, email, ID, téléphone

**Actions par utilisateur** `/users/[id]` :

- Profil complet (avatar, bio, date inscription, dernière connexion)
- Historique d'activité
- Serveurs rejoints
- Abonnement actif
- Signalements reçus/émis
- Actions admin : Warn, Mute, Ban temporaire, Ban permanent, Supprimer compte
- Notes internes (visibles uniquement par l'équipe)

### 🛡️ `/moderation` — Modération

**Queue de modération** :

- Contenu flaggé par IA (images, texte, liens)
- Signalements utilisateurs
- Priorité : Critique (CSAM, menaces) > Haute > Moyenne > Basse

**Actions** :

- Approuver (faux positif)
- Supprimer le contenu
- Warn l'auteur
- Ban temporaire/permanent
- Escalader (juridique)

**Filtres IA automatiques** :

- Détection NSFW (images)
- Détection spam/phishing (liens)
- Détection discours de haine (NLP)
- Détection CSAM → alerte immédiate + blocage

### ⚙️ `/config/features` — Feature Flags

- Toggle ON/OFF par feature
- Rollout progressif (% d'utilisateurs)
- Segmentation (par pays, plan, âge)
- Historique des changements

### 📋 `/audit` — Journal d'Audit

- Toutes les actions admin tracées
- Qui, quoi, quand, sur quel objet
- Export CSV/JSON
- Rétention : 2 ans

---

## 🔒 Sécurité & Accès

### RBAC (Role-Based Access Control)

| Rôle | Users | Modération | Config | Billing | Audit |
|---|---|---|---|---|---|
| Super Admin | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Admin | ✅ Full | ✅ Full | ✅ Read | ✅ Read | ✅ Read |
| Modérateur | ✅ Read | ✅ Full | ❌ | ❌ | ❌ |
| Support | ✅ Read | ✅ Read | ❌ | ✅ Read | ❌ |
| Viewer | ✅ Read | ✅ Read | ✅ Read | ❌ | ✅ Read |

### Contraintes

- Authentification SSO interne obligatoire
- 2FA obligatoire pour tous les rôles
- IP whitelisting (optionnel)
- Session timeout : 30 min d'inactivité
- Toutes les actions loguées dans le journal d'audit

---

## 🛠 Stack Technique

| Composant | Technologie |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI Components | Shadcn/ui + Tailwind CSS |
| Tableaux | TanStack Table (tri, filtres, pagination) |
| Graphiques | Recharts / Tremor |
| Auth | Supabase Auth + RBAC custom (RLS) |
| Base de données | Supabase (PostgreSQL) |
| Temps réel | Supabase Realtime (dashboard) |
| Feature flags | Custom (table Supabase) ou Unleash |
| Déploiement | Firebase Hosting (accès restreint) |

---

## 📅 Roadmap

### Phase 1 (Semaines 1-3)

- [ ] Auth SSO + RBAC
- [ ] Dashboard principal + métriques
- [ ] Gestion utilisateurs (CRUD + recherche)
- [ ] Queue de modération basique

### Phase 2 (Semaines 4-6)

- [ ] Modération IA (automod)
- [ ] Feature flags
- [ ] Gestion Store (review mini-apps)
- [ ] Journal d'audit
- [ ] Tickets support

---

## 🔗 Liens

- **`analytics.imuchat.app`** → Analytics détaillés
- **`logs.imuchat.app`** → Logs techniques
- **`help.imuchat.app`** → Support utilisateur (côté public)
