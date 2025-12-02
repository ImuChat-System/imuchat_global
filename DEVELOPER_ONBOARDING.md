# 👋 Guide d'Onboarding Développeur ImuChat

Bienvenue dans l'équipe ImuChat ! Ce guide te permettra d'être opérationnel rapidement.

## 📋 Table des matières

1. [Prérequis](#-prérequis)
2. [Installation](#-installation)
3. [Structure du Projet](#-structure-du-projet)
4. [Développement](#-développement)
5. [Accès et Secrets](#-accès-et-secrets)
6. [Conventions](#-conventions)
7. [Ressources](#-ressources)

---

## ⚙️ Prérequis

### Logiciels requis

| Logiciel | Version | Installation |
|----------|---------|--------------|
| Node.js | v20+ | `brew install node` ou [nvm](https://github.com/nvm-sh/nvm) |
| pnpm | v8+ | `corepack enable && corepack prepare pnpm@latest --activate` |
| Git | Latest | `brew install git` |
| Docker | Latest | [Docker Desktop](https://www.docker.com/products/docker-desktop/) |
| VS Code | Latest | [code.visualstudio.com](https://code.visualstudio.com/) |

### Extensions VS Code requises

Les extensions seront suggérées automatiquement à l'ouverture du workspace :

- ESLint
- Prettier
- GitLens
- Docker
- Remote - Containers
- Tailwind CSS IntelliSense
- Jest

---

## 🚀 Installation

### Option 1 : Installation classique

```bash
# 1. Se placer dans le dossier de développement
cd ~/Documents/GitHub  # ou ton dossier préféré

# 2. Cloner le repo global
git clone git@github.com:ImuChat-System/imuchat_global.git
cd imuchat_global

# 3. Cloner tous les repos du projet
chmod +x scripts/clone-all-repos.sh
bash scripts/clone-all-repos.sh

# 4. Installer les dépendances dans chaque repo
cd ../platform-core && pnpm install
cd ../web-app && pnpm install
cd ../mobile-app && pnpm install
cd ../desktop-app && pnpm install
cd ../ui-kit && pnpm install
cd ../shared-types && pnpm install

# 5. Ouvrir le workspace
code imuchat_global/ImuChat.code-workspace
```

### Option 2 : Dev Container (Recommandé)

```bash
# 1. Cloner le repo global
git clone git@github.com:ImuChat-System/imuchat_global.git

# 2. Ouvrir dans VS Code
code imuchat_global

# 3. Cmd/Ctrl + Shift + P → "Remote-Containers: Reopen in Container"
# Le container va automatiquement :
#   - Cloner tous les repos
#   - Installer toutes les dépendances
#   - Configurer l'environnement
```

---

## 📁 Structure du Projet

```
~/Documents/GitHub/
├── imuchat_global/           # Configuration workspace
│   ├── ImuChat.code-workspace
│   ├── .devcontainer/
│   ├── .vscode/
│   ├── .github/
│   └── scripts/
│
├── platform-core/            # Backend API
│   ├── src/
│   │   ├── modules/          # Modules métier
│   │   ├── shared/           # Code partagé
│   │   └── infrastructure/   # DB, cache, queue
│   └── package.json
│
├── web-app/                  # Frontend Web
│   ├── app/                  # Next.js App Router
│   ├── components/
│   ├── lib/
│   └── package.json
│
├── mobile-app/               # App Mobile
│   ├── app/                  # Expo Router
│   ├── components/
│   └── package.json
│
├── desktop-app/              # App Desktop
│   ├── src/
│   │   ├── main/            # Electron main process
│   │   └── renderer/        # UI
│   └── package.json
│
├── ui-kit/                   # Composants partagés
│   ├── src/components/
│   ├── .storybook/
│   └── package.json
│
├── shared-types/             # Types TypeScript
│   ├── src/
│   └── package.json
│
└── infra/                    # Infrastructure
    ├── terraform/
    └── kubernetes/
```

---

## 💻 Développement

### Commandes de base

```bash
# Web App (Next.js)
cd web-app
pnpm dev          # http://localhost:3000
pnpm build        # Build production
pnpm test         # Tests Jest

# Mobile App (Expo)
cd mobile-app
pnpm start        # Expo DevTools
pnpm ios          # Simulateur iOS
pnpm android      # Émulateur Android

# Desktop App (Electron)
cd desktop-app
pnpm dev          # Mode développement
pnpm build        # Build pour macOS/Windows/Linux

# Platform Core (API)
cd platform-core
pnpm dev          # http://localhost:8080
pnpm test         # Tests
pnpm db:migrate   # Migrations DB

# UI Kit
cd ui-kit
pnpm storybook    # http://localhost:6006
pnpm build        # Build du package
```

### Tâches VS Code

Utiliser `Cmd/Ctrl + Shift + P` → "Tasks: Run Task" pour lancer :

| Tâche | Description |
|-------|-------------|
| 🚀 Start Full Stack | Lance Web + API en parallèle |
| 🌐 Start Web App | Next.js dev server |
| 📱 Start Mobile App | Expo |
| 🖥️ Start Desktop App | Electron |
| ⚙️ Start Platform Core | API Backend |
| 🧪 Run All Tests | Tests de tous les repos |

### Debug

Les configurations de debug sont dans le workspace. Utiliser `F5` ou le panneau Debug.

---

## 🔐 Accès et Secrets

### Demander les accès

1. **GitHub** : Demande à être ajouté à l'organisation [ImuChat-System](https://github.com/ImuChat-System)
2. **Slack** : Rejoins le canal `#dev-imuchat`
3. **Notion** : Accès à la documentation produit
4. **Figma** : Designs et maquettes

### Variables d'environnement

Chaque repo a un fichier `.env.example`. Copier vers `.env.local` :

```bash
# Pour chaque repo
cp .env.example .env.local
```

Demander les vraies valeurs à l'équipe ou dans le gestionnaire de secrets.

### Base de données locale

```bash
# Lancer PostgreSQL via Docker
cd platform-core
docker-compose up -d postgres

# Créer les tables
pnpm db:migrate
```

---

## 📏 Conventions

### Git

- **Branches** : `feature/xxx`, `fix/xxx`, `chore/xxx`
- **Commits** : [Conventional Commits](https://www.conventionalcommits.org/)

  ```
  feat: add user authentication
  fix: resolve login bug
  docs: update README
  chore: update dependencies
  ```

- **PR** : Toujours avec review, liée à une issue

### Code

- **TypeScript** strict partout
- **ESLint** + **Prettier** (format on save)
- **Tests** : Jest pour unit, Playwright pour E2E
- **CSS** : TailwindCSS

### Nommage

| Type | Convention | Exemple |
|------|------------|---------|
| Composants | PascalCase | `UserProfile.tsx` |
| Hooks | camelCase avec use | `useAuth.ts` |
| Utilitaires | camelCase | `formatDate.ts` |
| Types | PascalCase | `UserDto.ts` |
| Constantes | SCREAMING_SNAKE | `API_URL` |

---

## 📚 Ressources

### Documentation interne

- [Architecture technique](./docs/ARCHITECTURE.md)
- [Guide API](../platform-core/docs/API.md)
- [Design System](../ui-kit/docs/DESIGN_SYSTEM.md)

### Liens utiles

- [Notion - Product docs](https://notion.so/imuchat)
- [Figma - Designs](https://figma.com/imuchat)
- [Linear - Issues](https://linear.app/imuchat)

### Stack technique

| Catégorie | Technologies |
|-----------|-------------|
| Frontend Web | Next.js 14, React 18, TailwindCSS |
| Mobile | React Native, Expo |
| Desktop | Electron / Tauri |
| Backend | Node.js, Fastify, PostgreSQL |
| Infra | Docker, Kubernetes, Terraform |
| CI/CD | GitHub Actions |

---

## ❓ Besoin d'aide ?

1. Consulte d'abord la documentation
2. Cherche dans les issues GitHub
3. Demande sur Slack `#dev-imuchat`
4. Crée une issue si c'est un bug

**Bienvenue dans l'équipe ! 🎉**
