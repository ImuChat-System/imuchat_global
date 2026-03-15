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
- **i18n** : next-intl 4.8.2 (`localePrefix: 'as-needed'`)
- **Export** : `output: 'export'` (static, compatible Firebase Hosting / Vercel)
- **Composants** : ThemeProvider + CSS variables (`--color-bg`, `--color-text`, …)

### Règles critiques (à respecter sur tous les sites)

- Ne jamais passer un `LucideIcon` comme prop Server→Client — utiliser `iconKey: string` + `ICON_MAP` interne
- Ne jamais utiliser `toLocaleString()` sans argument locale → toujours `toLocaleString('en-US')` (hydration mismatch)
- Pas de `robots.ts` / `sitemap.ts` Route Handlers avec `output: 'export'` → utiliser `public/robots.txt` et `public/sitemap.xml`
- Framer Motion v12 : utiliser `animate` + `transition` objects (pas les types `Variants`)

### Structure Monorepo

```text
sites/
├── vitrine/        → imuchat.app (site principal)
├── help/           → help.imuchat.app
├── admin/          → admin.imuchat.app
├── docs/           → docs.imuchat.app
├── blog/           → blog.imuchat.app
├── store/          → store.imuchat.app
├── alice/          → alice.imuchat.app
├── developers/     → developers.imuchat.app
├── enterprise/     → enterprise.imuchat.app
├── feedback/       → feedback.imuchat.app
├── office/         → office.imuchat.app
├── sandbox/        → sandbox.imuchat.app
├── analytics/      → analytics.imuchat.app
├── community/      → community.imuchat.app
└── shared/         → Composants partagés entre sites
```

---

## ✅ TIER 1 — Critiques (Complétés)

### 1. imuchat.app — Site Vitrine Principal

| Aspect | Détail |
|--------|--------|
| **Statut** | ✅ Implémenté |
| **Port dev** | 3000 |
| **i18n** | FR, EN |
| **Pages** | ~10 pages |

### 2. help.imuchat.app — Centre d'Aide

| Aspect | Détail |
|--------|--------|
| **Statut** | ✅ Implémenté |
| **Port dev** | 3020 |
| **i18n** | FR, EN, DE, ES, JA |
| **Pages** | Articles d'aide par catégorie (getting-started, account, messaging, alice, office, store, arena, pay, creators, privacy, billing) + contact + search + status |

### 3. docs.imuchat.app — Documentation Technique

| Aspect | Détail |
|--------|--------|
| **Statut** | ✅ Implémenté |
| **Port dev** | 3040 |
| **i18n** | FR, EN |
| **Pages** | Quickstart, référence API, SDKs, webhooks, changelog |

---

## ✅ TIER 2 — Haute Priorité (Complétés)

### 4. blog.imuchat.app

| Statut | ✅ Implémenté |
|--------|---------------|
| **Port dev** | 3070 |
| **i18n** | FR, EN |
| **Pages** | Listing articles, article détail, catégories, newsletter |

### 5. feedback.imuchat.app

| Statut | ✅ Implémenté |
|--------|---------------|
| **Port dev** | 3090 |
| **i18n** | FR, EN |
| **Pages** | Home, idées (vote), idée détail, nouvelle idée, roadmap, changelog, bêta |
| **Build** | 41 pages générées |

### 6. alice.imuchat.app — IA Assistant

| Statut | ✅ Implémenté |
|--------|---------------|
| **Port dev** | 3050 |
| **i18n** | FR, EN |
| **Pages** | Landing, fonctionnalités, modèles, sécurité, pricing, API |

### 7. store.imuchat.app — Store d'Applications

| Statut | ✅ Implémenté |
|--------|---------------|
| **Port dev** | 3080 |
| **i18n** | FR, EN |
| **Pages** | Home, catalogue, app détail, top apps, catégories, publish |
| **Fix** | `toLocaleString('en-US')` pour éviter hydration mismatch |

### 8. developers.imuchat.app — Portail Développeurs

| Statut | ✅ Implémenté |
|--------|---------------|
| **Port dev** | 3060 |
| **i18n** | FR, EN |
| **Pages** | Home, API ref, SDKs, webhooks, publish, console |

---

## ✅ TIER 3 — Piliers Produit (Complétés)

### 9. enterprise.imuchat.app

| Statut | ✅ Implémenté (100%) |
|--------|----------------------|
| **Port dev** | 3030 |
| **i18n** | FR, EN, DE |
| **Pages** | Home, solutions, security, deployment, SSO, admin, SLA, customers, pricing, contact, privacy, legal, whitepaper |
| **Build** | 42 pages générées |

### 10. office.imuchat.app — Suite Bureautique

| Statut | ✅ Implémenté |
|--------|---------------|
| **Port dev** | 3100 |
| **i18n** | FR, EN, DE |
| **Pages** | Home, suite, docs, sheets, slides, drive, pdf, ged, ai, security, pricing (+ calculator), compare, customers, contact, privacy, legal |
| **Build** | 51 pages générées |
| **Note** | Site pilier — alternative Microsoft 365 / Google Workspace |

### 11. sandbox.imuchat.app — Environnement Développeurs

| Statut | ✅ Implémenté |
|--------|---------------|
| **Port dev** | 3110 |
| **i18n** | FR, EN |
| **Pages** | Console, API explorer (12 endpoints), webhook inspector, app preview (mobile/desktop), mock data |
| **Build** | 36 pages générées |

### 12. analytics.imuchat.app — Dashboard Analytics Interne

| Statut | ✅ Implémenté |
|--------|---------------|
| **Port dev** | 3120 |
| **i18n** | FR uniquement (accès interne SSO) |
| **Pages** | Overview, users, cohorts, rétention, segments, engagement, funnels, revenue/MRR, A/B tests, geo, rapports, produits (store/arena/alice/platforms) |
| **Build** | 19 pages générées |

### 13. community.imuchat.app — Forum Communautaire

| Statut | ✅ Implémenté |
|--------|---------------|
| **Port dev** | 3130 |
| **i18n** | FR, EN |
| **Pages** | Home, discussions, idées (vote), idée détail, bugs, changelog, roadmap (Kanban), ambassadeurs, guidelines, about |
| **Build** | 31 pages générées |

---

## 📋 TIER 4 — Phase Expansion (À implémenter)

| Site | Description | Priorité |
|------|-------------|----------|
| `creators.imuchat.app` | Studio créateurs — monétisation, analytics, outils live | 🔴 Haute |
| `pay.imuchat.app` | ImuPay — paiements, portefeuille, transactions | 🔴 Haute |
| `arena.imuchat.app` | Gaming/compétition — tournois, leaderboards, clans | 🟠 Moyenne |
| `go.imuchat.app` | Redirecteur de liens marketing courts | 🟡 Basse |
| `gaming.imuchat.app` | Landing page gaming verticale | 🟡 Basse |

---

## ⏳ TIER 5 — Phase Maturité (Plus tard)

| Site | Description |
|------|-------------|
| `education.imuchat.app` | Offre éducation — classes, établissements |
| `partners.imuchat.app` | Programme partenaires — revendeurs, intégrateurs |
| `press.imuchat.app` | Espace presse — kit média, communiqués |
| `careers.imuchat.app` | Offres d'emploi, culture d'entreprise |
| `logs.imuchat.app` | Status page publique + historique incidents |
| `admin.imuchat.app` | Back-office interne (modération, support, users) |

---

## 🔗 Interconnexions Écosystème

Tous les sites existants ont des liens croisés vers :
- `app.imuchat.app` — Application principale (bouton "Se connecter" en navbar)
- `store.imuchat.app` — Gestion abonnements (lien dans footer + pages pricing)
- `imuchat.app` — Site vitrine (lien "Retour au site" dans footer)

Les sites à créer (TIER 4+) devront suivre la même convention.

---

## 🛠️ Checklist Lancement Site

Pour chaque nouveau site :

- [ ] Structure Next.js 14 + `output: 'export'`
- [ ] Tailwind configuré + CSS variables thème
- [ ] i18n (FR/EN minimum via next-intl 4.8.2)
- [ ] ThemeProvider (dark/light + `data-theme`)
- [ ] `public/robots.txt` et `public/sitemap.xml` (pas de Route Handlers)
- [ ] SEO (generateMetadata sur chaque page)
- [ ] Liens écosystème (app, store, vitrine) en navbar + footer
- [ ] Build `npm run build` clean (0 erreurs)
- [ ] Port dev enregistré dans package.json
- [ ] DNS configuré (sous-domaine)
- [ ] SSL actif

---

## 📅 Timeline Réelle

```text
Mars 2026     : TIER 1 (vitrine, help, docs) + TIER 2 (blog, feedback, alice, store, developers) ✅
Mars 2026     : TIER 3 (enterprise, office, sandbox, analytics, community) ✅
Avril 2026    : TIER 4 (creators, pay, arena, go, gaming)
Q3 2026       : TIER 5 (education, partners, press, careers, logs, admin)
```

---

Dernière mise à jour : 15 mars 2026
