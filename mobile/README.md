# ImuChat Mobile

Application mobile ImuChat construite avec **Expo Router** et **React Native**.

## 🚀 Démarrage rapide

```bash
# Installer les dépendances
pnpm install

# Démarrer le serveur de développement
pnpm start

# Lancer sur une plateforme spécifique
pnpm ios      # iOS Simulator
pnpm android  # Android Emulator
pnpm web      # Navigateur web
```

## 📱 Structure de l'application

### Tabs (Navigation principale)

L'application utilise 6 onglets principaux :

1. **🏠 Home** (`index.tsx`) - Dashboard avec statistiques et activité récente
2. **💬 Chats** (`chats.tsx`) - Liste des conversations et messages
3. **🌐 Social** (`social.tsx`) - Stories, feed social et mur
4. **📺 Watch** (`watch.tsx`) - VOD et Watch Party
5. **🛍️ Store** (`store.tsx`) - Apps, thèmes et contenus
6. **👤 Profile** (`profile.tsx`) - Profil utilisateur, wallet et paramètres

### Architecture

```
mobile/
├── app/
│   ├── (tabs)/              # Navigation par onglets
│   │   ├── _layout.tsx      # Configuration des tabs
│   │   ├── index.tsx        # Home
│   │   ├── chats.tsx        # Messages
│   │   ├── social.tsx       # Social
│   │   ├── watch.tsx        # Watch
│   │   ├── store.tsx        # Store
│   │   └── profile.tsx      # Profil
│   ├── _layout.tsx          # Layout racine
│   └── +not-found.tsx       # Page 404
├── components/              # Composants réutilisables
├── constants/               # Constantes (couleurs, config)
└── assets/                  # Images, fonts, etc.
```

## 🎨 Design System

L'application utilise le design system ImuChat :

- **Couleur primaire** : `#ec4899` (Rose)
- **Background** : `#0f0a1a` (Noir profond)
- **Composants** : `@imuchat/ui-kit`
- **Types** : `@imuchat/shared-types`

## 📦 Dépendances principales

- **Expo** ~54.0 - Framework React Native
- **Expo Router** ~6.0 - Routing file-based
- **React Query** - Gestion d'état serveur
- **Zustand** - Gestion d'état client
- **FlashList** - Listes performantes
- **Lottie** - Animations
- **React Native SVG** - Support SVG

## 🛠️ Prochaines étapes

### Phase MVP (selon RESUME_DETAILLEE.md)

- [ ] Conversations list (Chats)
- [ ] Chat thread avec MessageList
- [ ] Composer (texte + attachments)
- [ ] ThemeProvider
- [ ] Offline cache
- [ ] Push notifications

### Phase Core

- [ ] Media viewer
- [ ] Reactions
- [ ] Search in-thread
- [ ] Store hub UI
- [ ] Watch Party lite

## 📚 Documentation

- [RESUME_DETAILLEE.md](../mobile-app/docs/RESUME_DETAILLEE.md) - Vision produit complète
- [50_FONCTIONNALITIES.md](../docs/50_FONCTIONNALITIES.md) - Roadmap des 50 fonctionnalités

## 🧪 Tests

```bash
# Tests unitaires
pnpm test

# Tests E2E (à venir)
pnpm test:e2e
```

## 📱 Build & Deploy

```bash
# Build de développement
eas build --profile development

# Build de production
eas build --profile production

# Submit aux stores
eas submit
```

---

**Version** : 1.0.0  
**License** : Private
# mobile
