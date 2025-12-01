# 🚀 ImuChat Global

Dépôt racine du projet **ImuChat** - Une plateforme de messagerie multiplateforme moderne avec système modulaire.

## ✨ Fonctionnalités

- 💬 **Messagerie temps réel** - Chat 1:1 et groupes avec WebSocket
- 🏰 **Guildes** - Communautés de type Discord avec channels et rôles
- 🎨 **Thèmes** - 7 thèmes prédéfinis (Light, Dark, Sakura, Cyber, Zen, Midnight, Ocean)
- 🧩 **Modules** - Système extensible (Watch Party, Musique, Mini-jeux, etc.)
- 🌐 **Multiplateforme** - Web, Mobile (iOS/Android), Desktop (Windows/macOS/Linux)
- 🔒 **Sécurité** - Chiffrement E2E, authentification robuste

## 📁 Architecture Monorepo

```
imuchat_global/           ← Ce dépôt (workspace pnpm)
│
├── platform-core/        ← 🔧 Backend API & Services
│   ├── src/
│   │   ├── db/           # Schémas Drizzle ORM
│   │   ├── services/     # Auth, Modules, WebSocket
│   │   ├── config/       # Configuration centralisée
│   │   └── utils/        # Helpers partagés
│   └── package.json
│
├── web-app/              ← 🌐 Application Web (Next.js 16)
│   ├── src/app/          # App Router
│   └── package.json
│
├── mobile-app/           ← 📱 Application Mobile (Expo/React Native)
│   ├── App.tsx
│   └── package.json
│
├── desktop-app/          ← 🖥️ Application Desktop (Electron)
│   ├── electron/         # Process principal
│   ├── src/              # Renderer React
│   └── package.json
│
├── ui-kit/               ← 🎨 Design System partagé
│   ├── src/
│   │   ├── tokens/       # Colors, Typography, Spacing, etc.
│   │   ├── themes/       # Light, Dark, Sakura, Cyber, Zen...
│   │   ├── components/   # Button, Card, Avatar, Modal...
│   │   └── providers/    # ThemeProvider
│   └── package.json
│
├── shared-types/         ← 📦 Types TypeScript partagés
│   ├── src/
│   │   ├── user.ts       # User, Profile, Settings
│   │   ├── chat.ts       # Message, Conversation, Reaction
│   │   ├── guild.ts      # Guild, Channel, Role, Member
│   │   ├── module.ts     # Module, ModuleConfig, Event
│   │   ├── store.ts      # AppState, slices
│   │   └── api.ts        # ApiResponse, Error, Pagination
│   └── package.json
│
└── infra/                ← ☁️ Infrastructure as Code
    ├── docker/           # Docker Compose pour dev local
    ├── kubernetes/       # K8s manifests
    └── terraform/        # Modules Terraform (Azure)
```

## 🏁 Démarrage Rapide

### Prérequis

- [Node.js](https://nodejs.org/) v20+
- [pnpm](https://pnpm.io/) v8+
- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/) (pour PostgreSQL/Redis local)

### Installation

```bash
# 1. Cloner ce repo avec tous les sous-dossiers
git clone git@github.com:ImuChat-System/imuchat_global.git
cd imuchat_global

# 2. Cloner tous les repos du projet
bash scripts/clone-all-repos.sh

# 3. Installer les dépendances (pnpm workspace)
pnpm install

# 4. Démarrer l'infrastructure locale
cd infra/docker && docker-compose up -d && cd ../..

# 5. Ouvrir le workspace VS Code
code ImuChat.code-workspace
```

### Commandes utiles

```bash
# Construire tous les packages partagés
pnpm -F @imuchat/shared-types build
pnpm -F @imuchat/ui-kit build

# Démarrer le backend
pnpm -F @imuchat/platform-core dev

# Démarrer le web
pnpm -F @imuchat/web-app dev

# Démarrer le mobile
pnpm -F @imuchat/mobile-app start

# Démarrer le desktop
pnpm -F @imuchat/desktop-app dev

# Lancer tous les tests
pnpm test

# Linter tout le projet
pnpm lint
```

## 📦 Packages

| Package | Description | Technologies |
|---------|-------------|--------------|
| `@imuchat/platform-core` | Backend API & Services | Fastify, Drizzle ORM, PostgreSQL |
| `@imuchat/web-app` | Application Web | Next.js 16, React 19, TailwindCSS 4 |
| `@imuchat/mobile-app` | Application Mobile | React Native, Expo 54 |
| `@imuchat/desktop-app` | Application Desktop | Electron 30, Vite, React |
| `@imuchat/ui-kit` | Design System | React, Storybook, TailwindCSS |
| `@imuchat/shared-types` | Types TypeScript | TypeScript 5.9 |

## 🎨 Design System

Le Design System (`@imuchat/ui-kit`) fournit :

### Tokens
- `colors` - Palette de couleurs sémantiques
- `typography` - Familles, tailles, poids
- `spacing` - Échelle d'espacement
- `radius` - Rayons de bordure
- `shadows` - Ombres prédéfinies
- `animations` - Durées et easings

### Thèmes
- 🌞 **Light** - Thème clair par défaut
- 🌙 **Dark** - Thème sombre
- 🌸 **Sakura** - Rose cerisier japonais
- ⚡ **Cyber** - Néon cyberpunk
- 🧘 **Zen** - Tons neutres apaisants
- 🌃 **Midnight** - Bleu nuit profond
- 🌊 **Ocean** - Teintes marines

### Composants
- `Button`, `IconButton` - Boutons variés
- `Input` - Champs de formulaire
- `Card` - Conteneurs stylisés
- `Avatar`, `AvatarGroup` - Affichage utilisateur
- `Badge`, `NotificationBadge` - Indicateurs
- `Modal` - Dialogues
- `Spinner`, `Skeleton` - États de chargement
- `Text`, `H1-H4`, `Paragraph` - Typographie
- `Divider` - Séparateurs

## 🛠 Tâches VS Code

Dans le workspace VS Code :

| Tâche | Raccourci | Description |
|-------|-----------|-------------|
| 🚀 Start Full Stack | Default Build | Web + API en parallèle |
| 🌐 Start Web App | - | http://localhost:3000 |
| ⚙️ Start Platform Core | - | http://localhost:8080 |
| 📱 Start Mobile App | - | Expo DevTools |
| 🖥️ Start Desktop App | - | Fenêtre Electron |
| 🧪 Run All Tests | - | Tests de tous les repos |
| 🔍 Lint All Repos | - | ESLint + TypeScript |

## 📖 Documentation

- [DEVELOPER_ONBOARDING.md](./DEVELOPER_ONBOARDING.md) - Guide d'onboarding
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Guide de contribution

## 🤝 Contribution

1. Fork le repo
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit avec Conventional Commits (`feat:`, `fix:`, `docs:`, etc.)
4. Push (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 License

MIT © ImuChat-System
