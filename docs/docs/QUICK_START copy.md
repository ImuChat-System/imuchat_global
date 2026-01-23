# 🚀 Guide de Démarrage Rapide - ImuChat Mobile

## 🎉 Félicitations ! Votre projet est prêt

Votre application ImuChat Mobile est maintenant configurée avec toutes les fondations nécessaires. Voici comment continuer le développement :

## 📱 Tester l'Application

### 1. Démarrer le serveur de développement

```bash
# Dans le terminal
cd /Users/nathanimogo/Documents/GitHub/imu_chat_mobile
npm start
```

### 2. Options de test

- **📱 Mobile** : Scannez le QR code avec Expo Go
- **🌐 Web** : Appuyez sur `w` pour ouvrir dans le navigateur  
- **📱 iOS** : Appuyez sur `i` pour l'iOS Simulator
- **🤖 Android** : Appuyez sur `a` pour l'émulateur Android

### 3. Navigation disponible

L'app inclut **6 onglets** fonctionnels avec des données mock :

- 🏠 **Accueil** - Dashboard personnalisable
- 💬 **Chats** - Liste des conversations
- 👥 **Comms** - Communautés & serveurs
- 🎬 **Watch** - Watch Parties & vidéos
- 🛍️ **Store** - Marketplace apps & thèmes
- 👤 **Profil** - Paramètres & wallet

## 🎨 Tester les Thèmes

### Changer de thème

1. Allez dans l'onglet **Profile**
2. Section **Apparence**
3. Testez les 5 thèmes disponibles :
   - 🌞 **Light** (défaut)
   - 🌙 **Dark** 
   - 🌸 **Sakura Pink**
   - ⚡ **Cyber Neon**
   - 🌿 **Zen Green**

### Mode thème système

Activez le switch "Thème système" pour suivre automatiquement le thème du système (clair/sombre).

## 🛠️ Prochaines Étapes de Développement

### Priorité 1 : Composants UI (Cette semaine)

```bash
# Créer de nouveaux composants dans src/components/ui/
# Exemples à implémenter :

src/components/ui/
├── Input.tsx          # Champs de saisie
├── Modal.tsx          # Modales
├── Avatar.tsx         # Avatars utilisateur
├── Badge.tsx          # Badges & notifications
├── Skeleton.tsx       # Loading states
└── Typography.tsx     # Composants texte
```

### Priorité 2 : Setup Storybook

```bash
# Installation et configuration Storybook
npx storybook@latest init --type react_native

# Structure recommandée :
src/components/ui/Button/
├── Button.tsx
├── Button.stories.tsx
└── index.ts
```

### Priorité 3 : Tests

```bash
# Installer les dépendances de test
npm install -D jest @testing-library/react-native

# Créer les tests
src/components/ui/__tests__/
├── Button.test.tsx
├── Card.test.tsx
└── ThemeProvider.test.tsx
```

## 📝 Patterns de Développement

### 1. Créer un nouveau composant

```typescript
// src/components/ui/MonComposant.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useThemeColors } from '@/src/design-system/ThemeProvider';
import { spacing, typography } from '@/src/design-system/tokens';

interface MonComposantProps {
  title: string;
  // ... autres props
}

export const MonComposant: React.FC<MonComposantProps> = ({ title }) => {
  const colors = useThemeColors();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.foreground }}>
        {title}
      </Text>
    </View>
  );
};
```

### 2. Utiliser les tokens de design

```typescript
// Toujours utiliser les tokens plutôt que des valeurs hardcodées
import { spacing, typography, borderRadius } from '@/src/design-system/tokens';

const styles = {
  container: {
    padding: spacing[4],        // 16px
    borderRadius: borderRadius.base,  // 8px
    fontSize: typography.sizes.lg,    // 18px
  }
};
```

### 3. Ajouter un nouvel écran

```typescript
// app/(tabs)/nouvel-ecran.tsx
import React from 'react';
import { ScrollView } from 'react-native';
import { useThemeColors } from '@/src/design-system/ThemeProvider';

export default function NouvelEcranScreen() {
  const colors = useThemeColors();
  
  return (
    <ScrollView style={{ backgroundColor: colors.background }}>
      {/* Contenu */}
    </ScrollView>
  );
}
```

## 🔧 Scripts Utiles

```bash
# Vérification qualité code
npm run type-check    # Types TypeScript
npm run lint         # ESLint avec auto-fix
npm run format       # Prettier formatting

# Développement
npm start            # Expo dev server
npm run ios         # iOS simulator
npm run android     # Android emulator
npm run web         # Navigation web
```

## 📚 Documentation

- **README.md** - Documentation complète du projet
- **ROADMAP.md** - Feuille de route détaillée par phases
- **src/design-system/** - Documentation du Design System
- **src/types/** - Types TypeScript complets

## 🆘 Aide & Support

### Problèmes courants

1. **Erreur de compilation TypeScript** → `npm run type-check`
2. **Erreurs ESLint** → `npm run lint`
3. **Expo cache issues** → `npx expo start --clear`
4. **Node modules** → `rm -rf node_modules && npm install`

### Ressources

- **Expo Docs** : [docs.expo.dev](https://docs.expo.dev)
- **React Native** : [reactnative.dev](https://reactnative.dev)
- **TypeScript** : [typescriptlang.org](https://typescriptlang.org)

---

## 🎯 Objectifs Semaine 1

- [ ] **Tester l'app sur mobile/simulator**
- [ ] **Explorer tous les onglets et thèmes**
- [ ] **Créer 2-3 composants UI supplémentaires**
- [ ] **Setup Storybook pour la documentation**
- [ ] **Commencer les écrans de chat détaillé**

**Vous êtes prêt à développer ! 🚀**

L'infrastructure est solide, les patterns sont établis, et les fondations permettent un développement rapide et maintenable.

---

*Dernier commit : Fondations MVP complètes avec Design System, Navigation, et Mock Data*