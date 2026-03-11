# 🌐 Plan d'Implémentation des Sites ImuChat

> Stratégie de développement des sous-domaines de l'écosystème ImuChat

---

## 📊 Vue d'Ensemble

| Statut | Signification |
|--------|---------------|
| ✅ | Implémenté |
| 🚧 | En cours |
| 📋 | Planifié |
| ⏳ | Futur |

---

## 🏗️ Architecture Technique

### Stack Commune

- **Framework** : Next.js 14 (App Router)
- **Styling** : Tailwind CSS
- **i18n** : next-intl
- **Hosting** : Firebase Hosting / Vercel
- **Composants** : Partagés via `@imuchat/ui-kit`

### Structure Monorepo

```
sites/
├── help/           → help.imuchat.app
├── admin/          → admin.imuchat.app
├── docs/           → docs.imuchat.app
├── blog/           → blog.imuchat.app
├── store/          → store.imuchat.app
├── developers/     → developers.imuchat.app
└── shared/         → Composants partagés entre sites
```

---

## 🔴 TIER 1 — Critiques (Sprint Actuel)

### 1. admin.imuchat.app — Back-Office

| Aspect | Détail |
|--------|--------|
| **Statut** | 📋 Planifié |
| **Priorité** | 🔴 Critique |
| **Dépendances** | Auth Supabase, platform-core |
| **Effort estimé** | 3-4 semaines |

**Pages MVP :**

- [ ] `/` — Dashboard principal (métriques temps réel)
- [ ] `/users` — Gestion utilisateurs (recherche, actions)
- [ ] `/users/[id]` — Profil utilisateur détaillé
- [ ] `/moderation` — File de modération
- [ ] `/moderation/reports` — Signalements
- [ ] `/support` — Tickets support

### 2. help.imuchat.app — Centre d'Aide

| Aspect | Détail |
|--------|--------|
| **Statut** | 🚧 En cours (80%) |
| **Priorité** | 🔴 Critique |
| **Dépendances** | CMS (MDX ou Sanity) |
| **Effort estimé** | 2 semaines |

**Pages MVP :**

- [x] `/` — Accueil (recherche + catégories)
- [x] `/getting-started` — Premiers pas
- [x] `/[category]/[slug]` — Article d'aide
- [x] `/contact` — Contacter le support
- [x] `/search` — Recherche full-text
- [x] `/status` — État des services

**Catégories implémentées :**

- [x] getting-started, account, messaging, alice
- [x] office, store, arena, pay, creators
- [x] privacy, billing

**i18n :** FR, EN, DE, ES, JA ✅

### 3. docs.imuchat.app — Documentation Technique

| Aspect | Détail |
|--------|--------|
| **Statut** | 📋 Planifié |
| **Priorité** | 🔴 Critique |
| **Dépendances** | Docusaurus ou Next.js + MDX |
| **Effort estimé** | 2-3 semaines |

**Pages MVP :**

- [ ] `/` — Accueil docs
- [ ] `/getting-started/quickstart` — Démarrage rapide
- [ ] `/api/[endpoint]` — Référence API
- [ ] `/sdk/javascript` — SDK JS
- [ ] `/changelog` — Changelog API

---

## 🟠 TIER 2 — Haute Priorité (Sprint +1)

### 4. blog.imuchat.app

| Statut | 📋 Planifié |
|--------|-------------|
| **Effort** | 1-2 semaines |

### 5. feedback.imuchat.app  

| Statut | 📋 Planifié |
|--------|-------------|
| **Effort** | 1-2 semaines |

### 6. store.imuchat.app

| Statut | 📋 Planifié |
|--------|-------------|
| **Effort** | 2-3 semaines |

### 7. developers.imuchat.app

| Statut | 📋 Planifié |
|--------|-------------|
| **Effort** | 2 semaines |

---

## 🟡 TIER 3 — Moyenne Priorité (Phase Expansion)

| Site | Statut |
|------|--------|
| enterprise.imuchat.app | ⏳ |
| office.imuchat.app | ⏳ |
| sandbox.imuchat.app | ⏳ |
| analytics.imuchat.app | ⏳ |
| community.imuchat.app | ⏳ |

---

## 🟢 TIER 4 — Phase Maturité

| Site | Statut |
|------|--------|
| go.imuchat.app | ⏳ |
| creators.imuchat.app | ⏳ |
| arena.imuchat.app | ⏳ |
| gaming.imuchat.app | ⏳ |
| alice.imuchat.app | ⏳ |
| pay.imuchat.app | ⏳ |

---

## ⏳ TIER 5 — Plus Tard

| Site | Statut |
|------|--------|
| education.imuchat.app | ⏳ |
| partners.imuchat.app | ⏳ |
| press.imuchat.app | ⏳ |
| careers.imuchat.app | ⏳ |
| logs.imuchat.app | ⏳ |

---

## 🛠️ Composants Partagés (sites/shared)

```typescript
// Composants réutilisables entre tous les sites
├── Header/           → Navigation commune
├── Footer/           → Footer ImuChat
├── SearchBar/        → Recherche full-text
├── Breadcrumb/       → Navigation hiérarchique
├── ArticleCard/      → Card pour articles/docs
├── CategoryGrid/     → Grille de catégories
├── ContactForm/      → Formulaire de contact
├── LanguageSwitcher/ → Sélecteur de langue
└── ThemeToggle/      → Mode clair/sombre
```

---

## 📅 Timeline Estimée

```
Mars 2026     : help.imuchat.app MVP
Avril 2026    : admin.imuchat.app + docs.imuchat.app
Mai 2026      : blog + feedback + store
Juin 2026     : developers + sandbox
Q3 2026       : enterprise + office
Q4 2026       : Sites restants selon traction
```

---

## ✅ Checklist Lancement Site

Pour chaque site :

- [ ] Structure Next.js 14
- [ ] Tailwind configuré
- [ ] i18n (FR/EN minimum)
- [ ] SEO (meta, sitemap, robots)
- [ ] Analytics (GA4 ou Plausible)
- [ ] Déploiement Firebase/Vercel
- [ ] DNS configuré (sous-domaine)
- [ ] SSL actif
- [ ] Tests E2E basiques

---

*Dernière mise à jour : 11 mars 2026*
