# Tests E2E - ImuChat

Ce document décrit comment configurer et exécuter les tests End-to-End (E2E) pour les applications mobile et web d'ImuChat.

## Vue d'ensemble

Les tests E2E couvrent les scénarios suivants :

### Auth Flow
- ✅ Signup avec email valide → vérification → login
- ✅ Signup avec email existant → erreur appropriée
- ✅ Login avec credentials valides → redirection dashboard
- ✅ Login avec credentials invalides → message erreur
- ✅ Forgot password → email envoyé confirmation
- ✅ Logout → redirection login

### Chat Flow
- ✅ Ouvrir liste conversations
- ✅ Tap sur conversation → ouvrir chat room
- ✅ Envoyer message texte → apparaît dans liste
- ✅ Recevoir message (simulé) → apparition
- ✅ Scroll historique → load more messages
- ✅ Reactions sur messages
- ✅ Actions sur messages (copier, réagir)

---

## Tests Mobile (Detox)

### Prérequis

1. **Installer Detox CLI globalement :**
   ```bash
   npm install -g detox-cli
   ```

2. **Installer les dépendances de développement :**
   ```bash
   cd mobile
   pnpm add -D detox @types/detox jest ts-jest
   ```

3. **iOS uniquement - Installer applesimutils :**
   ```bash
   brew tap wix/brew
   brew install applesimutils
   ```

4. **Android uniquement - Configurer l'émulateur :**
   - Avoir Android Studio installé
   - Créer un AVD nommé `Pixel_7_API_34`

### Structure des fichiers

```
mobile/
├── detox.config.js          # Configuration Detox
├── e2e/
│   ├── jest.config.js       # Config Jest pour E2E
│   ├── init.ts              # Initialisation des tests
│   ├── fixtures.ts          # Données de test
│   ├── auth.e2e.test.ts     # Tests auth
│   └── chat.e2e.test.ts     # Tests chat
```

### Exécution des tests

1. **Build l'application de test :**
   ```bash
   # iOS
   pnpm test:e2e:build
   
   # Android
   pnpm test:e2e:build:android
   ```

2. **Lancer les tests :**
   ```bash
   # iOS (défaut)
   pnpm test:e2e
   
   # Android
   pnpm test:e2e:android
   ```

### Configuration spécifique

Pour modifier le simulateur/émulateur cible, éditez `detox.config.js` :

```javascript
devices: {
  simulator: {
    type: 'ios.simulator',
    device: {
      type: 'iPhone 15 Pro', // Changez ici
    },
  },
  emulator: {
    type: 'android.emulator',
    device: {
      avdName: 'Pixel_7_API_34', // Changez ici
    },
  },
},
```

---

## Tests Web (Playwright)

### Prérequis

1. **Installer Playwright :**
   ```bash
   cd web-app
   pnpm add -D @playwright/test
   ```

2. **Installer les navigateurs :**
   ```bash
   npx playwright install
   ```

### Structure des fichiers

```
web-app/
├── playwright.config.ts           # Configuration Playwright
├── src/__tests__/e2e/
│   ├── global-setup.ts            # Setup global
│   ├── fixtures.ts                # Fixtures et helpers
│   ├── auth.spec.ts               # Tests auth
│   └── chat.spec.ts               # Tests chat
```

### Exécution des tests

```bash
# Lancer tous les tests E2E
pnpm test:e2e

# Mode UI interactif
pnpm test:e2e:ui

# Mode headed (avec navigateur visible)
pnpm test:e2e:headed

# Mode debug
pnpm test:e2e:debug

# Voir le rapport HTML
pnpm test:e2e:report
```

### Tests sur navigateurs spécifiques

```bash
# Chrome uniquement
pnpm test:e2e --project=chromium

# Firefox uniquement
pnpm test:e2e --project=firefox

# Safari uniquement
pnpm test:e2e --project=webkit

# Mobile Chrome
pnpm test:e2e --project="Mobile Chrome"
```

### Tests en CI

Le fichier `playwright.config.ts` est configuré pour :
- Démarrer automatiquement le serveur de dev
- Réessayer les tests échoués sur CI
- Capturer des screenshots et vidéos sur échec

---

## Configuration de l'environnement de test

### Variables d'environnement

Créez un fichier `.env.test` dans chaque projet :

```env
# Supabase Test
NEXT_PUBLIC_SUPABASE_URL=https://your-test-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-test-anon-key

# Test Users (doivent exister dans la DB de test)
TEST_USER_EMAIL=existing@imuchat.test
TEST_USER_PASSWORD=ExistingPassword123!
```

### Seed de données de test

Avant d'exécuter les tests, assurez-vous que :

1. **Un utilisateur de test existe :**
   - Email: `existing@imuchat.test`
   - Password: `ExistingPassword123!`

2. **Des conversations de test existent :**
   - IDs: `test-conversation-1`, `test-conversation-2`

Utilisez le script de seed :
```bash
pnpm seed:test-data
```

---

## Bonnes pratiques

### 1. Isolation des tests
Chaque test doit être indépendant et ne pas dépendre de l'état laissé par d'autres tests.

### 2. Test IDs
Utilisez des `testID` (mobile) ou `data-testid` (web) cohérents :
- `login-email-input`
- `login-password-input`
- `message-list`
- etc.

### 3. Attentes asynchrones
Utilisez toujours `waitFor` ou les timeouts appropriés pour les opérations asynchrones.

### 4. Cleanup
Nettoyez les données créées pendant les tests dans un `afterEach` ou `afterAll`.

---

## Dépannage

### Mobile (Detox)

**Erreur: "Command failed: applesimutils"**
```bash
brew install applesimutils
```

**Erreur: "No simulators found"**
```bash
xcrun simctl list
# Vérifiez que le simulateur cible existe
```

### Web (Playwright)

**Erreur: "browserType.launch: Executable doesn't exist"**
```bash
npx playwright install
```

**Tests timeout sur CI**
- Augmentez le timeout dans `playwright.config.ts`
- Vérifiez que le serveur démarre correctement

---

## Fichiers créés

| Fichier | Description |
|---------|-------------|
| `mobile/detox.config.js` | Configuration Detox |
| `mobile/e2e/jest.config.js` | Config Jest pour Detox |
| `mobile/e2e/init.ts` | Initialisation tests |
| `mobile/e2e/fixtures.ts` | Données de test |
| `mobile/e2e/auth.e2e.test.ts` | Tests auth mobile |
| `mobile/e2e/chat.e2e.test.ts` | Tests chat mobile |
| `web-app/playwright.config.ts` | Configuration Playwright |
| `web-app/src/__tests__/e2e/global-setup.ts` | Setup global |
| `web-app/src/__tests__/e2e/fixtures.ts` | Fixtures Playwright |
| `web-app/src/__tests__/e2e/auth.spec.ts` | Tests auth web |
| `web-app/src/__tests__/e2e/chat.spec.ts` | Tests chat web |
