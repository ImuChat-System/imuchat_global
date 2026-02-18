# 🌐 ImuChat Web App

> Application web moderne de messagerie et réseau social, construite avec Next.js 15, React 19 et TypeScript.

## 📊 État du Projet

**Progression Globale :** 6.25% (1/16 semaines)  
**Phase Actuelle :** Phase 1 - Fondations (Semaine 2/4)  
**Dernière Mise à Jour :** Semaine 1 COMPLÉTÉE ✅

### Accomplissements Récents (Semaine 1)

- ✅ **Architecture Layout** : AppShell 3 colonnes (Sidebar, Main, RightPanel)
- ✅ **Composants UI** : Button, Badge, Avatar, Separator
- ✅ **Navigation** : Sidebar responsive (240px/64px), TopBar avec search
- ✅ **Pages** : Dashboard + 7 pages (Messages, Appels, Social, Watch, Store, Profil, Paramètres)
- ✅ **Routing** : App Router Next.js avec groupe (app)
- ✅ **Documentation** : ROADMAP (16 semaines), ACTION_PLAN (4 semaines), INSPIRATION_IMUCHAT, PROGRESS

📈 **Métriques :** 18 fichiers créés | ~1200 lignes de code | 0 erreurs TypeScript

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+ 
- pnpm 8+

### Installation et Lancement

```bash
# Depuis le dossier racine du monorepo
pnpm install

# Démarrer le serveur de développement
pnpm --filter @imuchat/web-app dev
```

Le serveur démarre sur [http://localhost:3000](http://localhost:3000)

### Tâches Disponibles

Depuis le workspace VSCode, vous pouvez lancer :
- **🚀 Start Full Stack (Web + API)** : Web-app + Platform Core en parallèle
- **🌐 Start Web App** : Seulement l'application web
- **🧪 Run All Tests** : Suite de tests complète

## 📁 Architecture

```
web-app/
├── src/
│   ├── app/
│   │   ├── (app)/              # Groupe routes authentifiées
│   │   │   ├── layout.tsx      # Layout avec AppShell
│   │   │   ├── dashboard/      # Page d'accueil
│   │   │   ├── chats/          # Conversations
│   │   │   ├── calls/          # Appels vidéo/audio
│   │   │   ├── social/         # Social feed
│   │   │   ├── watch/          # Watch/streaming
│   │   │   ├── store/          # Marketplace
│   │   │   ├── profile/        # Profil utilisateur
│   │   │   └── settings/       # Paramètres
│   │   └── page.tsx            # Redirect vers dashboard
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx    # Layout 3 colonnes
│   │   │   ├── Sidebar.tsx     # Navigation principale (responsive)
│   │   │   ├── TopBar.tsx      # Barre supérieure (search, notifs, profil)
│   │   │   └── RightPanel.tsx  # Panneau contextuel
│   │   └── ui/
│   │       ├── button.tsx      # 6 variantes, 4 tailles
│   │       ├── badge.tsx       # 4 variantes
│   │       ├── avatar.tsx      # Avatar avec fallback
│   │       └── separator.tsx   # Séparateur horizontal/vertical
│   └── lib/
│       └── cn.ts               # Utilitaire Tailwind (clsx + tailwind-merge)
├── ROADMAP.md                  # Roadmap 16 semaines (4 phases)
├── ACTION_PLAN_IMMEDIATE.md    # Plan d'action détaillé 4 semaines
├── INSPIRATION_IMUCHAT.md      # Analyse projet de référence ImuChat
└── PROGRESS.md                 # Suivi de progression détaillé
```

## 🛠️ Stack Technique

### Core
- **Framework :** Next.js 15 (App Router)
- **UI :** React 19, TypeScript 5
- **Styling :** Tailwind CSS 4
- **Composants :** shadcn-inspired avec class-variance-authority

### Bibliothèques
- **Icons :** lucide-react
- **Shortcuts :** react-hotkeys-hook
- **Command :** cmdk (non implémenté, semaine 2+)
- **Dates :** date-fns
- **Utils :** clsx, tailwind-merge

### À Venir (Phase 1-2)
- **State :** React Context API (LayoutContext, NotificationContext...)
- **Animation :** framer-motion
- **Drag & Drop :** @dnd-kit
- **Auth :** Supabase Auth
- **Data :** TanStack Query, Supabase client

## 🎯 Roadmap

### Phase 1 : Fondations (Semaines 1-4)
- [x] **Semaine 1 :** Layout, Navigation, UI Components ✅
- [ ] **Semaine 2 :** Contexts, NotificationCenter, Keyboard Shortcuts
- [ ] **Semaine 3 :** Auth UI, Routes protection, Tests
- [ ] **Semaine 4 :** Settings, Themes, i18n

### Phase 2 : Features Core (Semaines 5-8)
- Messages, Appels, Groupes, Profils

### Phase 3 : Features Avancées (Semaines 9-12)
- Social, Watch, Store, Search globale

### Phase 4 : Optimisation & Déploiement (Semaines 13-16)
- Performance, PWA, Analytics, Production

📖 Voir [ROADMAP.md](./ROADMAP.md) pour le plan complet.

## 📚 Documentation

| Document | Description | Lignes |
|----------|-------------|--------|
| [ROADMAP.md](./ROADMAP.md) | Roadmap complète 16 semaines (4 phases) | 1296 |
| [ACTION_PLAN_IMMEDIATE.md](./ACTION_PLAN_IMMEDIATE.md) | Plan d'action détaillé 4 premières semaines | 450 |
| [INSPIRATION_IMUCHAT.md](./INSPIRATION_IMUCHAT.md) | Analyse projet ImuChat (patterns, composants) | 873 |
| [PROGRESS.md](./PROGRESS.md) | Suivi de progression (métriques, timeline) | 400+ |

## 🧪 Tests

**État Actuel :** 0 tests (Semaine 2+ : objectif 30+ tests)

### À Venir
- Tests unitaires : Composants UI
- Tests d'intégration : Layout, Navigation
- Tests E2E : Flows critiques
- Coverage : Objectif 80%

## 📦 Scripts

```bash
# Développement
pnpm dev              # Serveur de développement

# Build
pnpm build            # Build de production
pnpm start            # Serveur de production

# Qualité
pnpm lint             # ESLint
pnpm type-check       # TypeScript
pnpm test             # Tests (à venir)
```

## 🎨 Principes de Design

### Layout
- **3 colonnes :** Sidebar (240/64px) + Main (flex-1) + RightPanel (320px)
- **Responsive :** Collapse <1024px, mobile-first
- **Thèmes :** Light/Dark mode (à venir semaine 4)

### Composants
- **Accessibilité :** ARIA labels, keyboard navigation
- **Performance :** Code splitting, lazy loading
- **Réutilisabilité :** Props API cohérente, variants CVA

### Navigation
- **8 sections principales :** Dashboard, Messages, Appels, Social, Watch, Store, Profil, Paramètres
- **Sidebar :** Active highlighting, icons Lucide, collapse toggle
- **TopBar :** Search, notifications (badge count), profil dropdown

## 🔗 Références

- **Projet de référence :** [ImuChat](../ImuChat) - Patterns avancés (resize, drag-drop, 12 contexts)
- **Monorepo :** Fait partie du workspace ImuChat Global
- **Shared packages :** `@imuchat/ui-kit`, `@imuchat/shared-types`, `@imuchat/platform-core`

## 🤝 Contribution

Voir [CONTRIBUTING.md](../CONTRIBUTING.md) à la racine du monorepo.

### Workflow
1. Consulter [ACTION_PLAN_IMMEDIATE.md](./ACTION_PLAN_IMMEDIATE.md) pour les tâches
2. Créer une branche feature/fix depuis `main`
3. Développer en suivant les conventions TypeScript/React
4. Tester localement (linting, type-check, tests)
5. Créer une PR avec description détaillée

## 📄 Licence

Propriétaire - ImuChat © 2025

---

**Dernière mise à jour :** Semaine 1 (100% complète)  
**Prochaine étape :** Semaine 2 - LayoutContext, NotificationCenter, Keyboard Shortcuts  
**Docs :** [PROGRESS.md](./PROGRESS.md) pour le suivi détaillé
