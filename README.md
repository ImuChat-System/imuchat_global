# 🚀 ImuChat Global

Dépôt racine du projet **ImuChat** - Configuration du workspace multi-repo pour le développement.

## 📁 Architecture Multi-Repo

```
imuchat_global/          ← Ce dépôt (configuration workspace)
├── ImuChat.code-workspace
├── .devcontainer/
├── .vscode/
├── .github/workflows/
└── scripts/

../platform-core/        ← Backend API & Services
../web-app/              ← Application Web (Next.js)
../mobile-app/           ← Application Mobile (React Native/Expo)
../desktop-app/          ← Application Desktop (Electron/Tauri)
../ui-kit/               ← Composants UI partagés
../shared-types/         ← Types TypeScript partagés
../infra/                ← Infrastructure as Code
```

## 🏁 Démarrage Rapide

### Prérequis

- [Node.js](https://nodejs.org/) v20+
- [pnpm](https://pnpm.io/) v8+
- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/) (optionnel, pour Dev Container)
- [VS Code](https://code.visualstudio.com/) avec l'extension Remote Containers

### Installation

```bash
# 1. Cloner ce repo
git clone git@github.com:ImuChat-System/imuchat_global.git
cd imuchat_global

# 2. Cloner tous les repos du projet
bash scripts/clone-all-repos.sh

# 3. Ouvrir le workspace VS Code
code ImuChat.code-workspace
```

### Avec Dev Container (Recommandé)

1. Ouvrir le workspace dans VS Code
2. `Cmd/Ctrl + Shift + P` → "Remote-Containers: Reopen in Container"
3. Attendre l'installation automatique

## 📦 Repositories

| Repo | Description | Stack |
|------|-------------|-------|
| [platform-core](https://github.com/ImuChat-System/platform-core) | Backend API & Services | Node.js, Fastify, PostgreSQL |
| [web-app](https://github.com/ImuChat-System/web-app) | Application Web | Next.js 14, React, TailwindCSS |
| [mobile-app](https://github.com/ImuChat-System/mobile-app) | Application Mobile | React Native, Expo |
| [desktop-app](https://github.com/ImuChat-System/desktop-app) | Application Desktop | Electron / Tauri |
| [ui-kit](https://github.com/ImuChat-System/ui-kit) | Composants UI partagés | React, Storybook |
| [shared-types](https://github.com/ImuChat-System/shared-types) | Types TypeScript | TypeScript |
| [infra](https://github.com/ImuChat-System/infra) | Infrastructure | Terraform, Kubernetes |

## 🛠 Tâches VS Code

Ouvrir la palette de commandes (`Cmd/Ctrl + Shift + P`) → "Tasks: Run Task" :

- 🌐 **Start Web App** - Lance l'app web sur http://localhost:3000
- 📱 **Start Mobile App** - Lance Expo pour le mobile
- 🖥️ **Start Desktop App** - Lance l'app desktop
- ⚙️ **Start Platform Core** - Lance l'API backend
- 🚀 **Start Full Stack** - Lance Web + API en parallèle
- 🧪 **Run All Tests** - Lance les tests de tous les repos
- 🔍 **Lint All Repos** - Vérifie le code de tous les repos

## 📖 Documentation

- [DEVELOPER_ONBOARDING.md](./DEVELOPER_ONBOARDING.md) - Guide d'onboarding développeur
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Guide de contribution
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Architecture technique

## 🤝 Contribution

1. Fork le repo concerné
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit avec Conventional Commits (`git commit -m 'feat: add amazing feature'`)
4. Push la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 License

MIT © ImuChat-System
