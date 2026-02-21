# 📱 Mobile App - Tracker Complet des Tâches

> **Date de création** : 21 février 2026  
> **Dernière mise à jour** : 21 février 2026  
> **Statut global** : En développement actif (MVP Phase 2 - Chat avancé)

---

## 📋 Table des Matières

1. [🚨 Anomalies Critiques](#-anomalies-critiques)
2. [⚠️ Bugs et Problèmes Techniques](#️-bugs-et-problèmes-techniques)
3. [🔧 Ajustements et Optimisations](#-ajustements-et-optimisations)
4. [🚧 Développements à Continuer](#-développements-à-continuer)
5. [📊 Comparatif Mobile vs Web-App](#-comparatif-mobile-vs-web-app)
6. [🎯 Priorités Immédiates](#-priorités-immédiates)

---

## 🚨 Anomalies Critiques

### CRIT-001 : Stream Video Token Placeholder ⚠️

**Priorité** : P0 - Bloquant  
**Impact** : Appels audio/vidéo non fonctionnels  
**Statut** : ⚠️ En cours

**Problème** :

- Token Stream Video en mode placeholder
- Incompatibilité Expo Go (nécessite build de développement)
- Module `stream-video-safe.ts` créé mais token exchange non finalisé

**Fichiers affectés** :

- `services/stream-video.ts`
- `services/stream-video-safe.ts`
- `services/stream-token.ts`

**Solution requise** :

1. Configurer l'API endpoint `/api/stream-token` sur platform-core
2. Implémenter l'échange de token Supabase → Stream Video
3. Tester avec un build de développement (EAS Build)

**Estimation** : 2-3 jours

---

### CRIT-002 : OAuth Non Implémenté ⚠️

**Priorité** : P1 - Important  
**Impact** : UX d'inscription limitée  
**Statut** : ⚠️ Non démarré

**Problème** :

- Seule l'authentification email/password est disponible
- Google et Apple Sign-In non configurés
- Placeholders ajoutés dans `.env` mais SDK non intégré

**Fichiers concernés** :

- `mobile/.env` (EXPO_PUBLIC_GOOGLE_CLIENT_ID placeholder)
- `app/(auth)/sign-in.tsx`
- `app/(auth)/sign-up.tsx`

**Solution** :

1. Configurer Google Sign-In via `expo-auth-session`
2. Configurer Apple Sign-In via `expo-apple-authentication`
3. Lier les providers à Supabase Auth

**Estimation** : 2-3 jours

---

## ⚠️ Bugs et Problèmes Techniques

### BUG-001 : Console Logs en Production

**Priorité** : P2 - Moyen  
**Impact** : Performance, Sécurité  
**Statut** : 🔴 Non démarré

**Problème** :
Nombreux `console.log()` dans le code de production.

**Solution** :

1. Créer `services/logger.ts` (comme web-app)
2. Migrer tous les `console.*` vers le logger
3. Désactiver les logs en production

**Estimation** : 1 jour

---

### BUG-002 : Offline Queue Partielle

**Priorité** : P1 - Important  
**Impact** : UX hors connexion  
**Statut** : ✅ Résolu

**Problème** :

- Queue de messages offline créée mais non persistée
- Messages perdus si l'app est fermée

**Solution appliquée** :

- ✅ `services/offline-queue.ts` créé avec AsyncStorage
- ✅ Fonctions `addPendingMessage`, `getPendingMessagesForConversation`, `flushPendingMessages`
- ✅ Hook `useChat` expose `pendingMessagesCount` et `flushPendingMessages`
- ✅ Nettoyage des messages expirés (24h)

**Fichiers modifiés** :

- `services/offline-queue.ts`
- `hooks/useChat.ts`

---

### BUG-003 : Notifications Fallback Mock

**Priorité** : P2 - Moyen  
**Impact** : Notifications non réelles  
**Statut** : ⚠️ Partiellement résolu

**Problème** :

- Push notifications configurées (Expo Notifications)
- Backend API non connecté (`notification-api.ts` utilise fallback)

**État actuel** :

- ✅ Expo Notifications configuré
- ✅ Token push récupéré
- ⚠️ Endpoint API `/api/notifications/*` à connecter

**Estimation** : 1-2 jours

---

## 🔧 Ajustements et Optimisations

### OPT-001 : Tests Unitaires

**Priorité** : P1 - Important  
**Impact** : Qualité, Maintenabilité  
**Statut** : ⚠️ En cours

**État actuel** :

- Configuration Jest présente ✅
- 24 fichiers de tests existants
- Couverture estimée ~20%

**Tests à créer** :

- [ ] Hooks d'authentification (`useAuth`, `useAuthV2`)
- [ ] Hooks de messagerie (`useChat`, `useMessages`)
- [ ] Services API (`messaging.ts`, `reactions.ts`)
- [ ] Composants UI core

**Objectif** : 50% de couverture

**Estimation** : 1 semaine

---

### OPT-002 : i18n Extension

**Priorité** : P3 - Mineur  
**Impact** : Internationalisation  
**Statut** : ✅ Fonctionnel

**État actuel** :

- 3 locales : fr, en, ja
- ~320 clés de traduction

**Comparatif web-app** : ~2300 clés

**À faire** :

- [ ] Aligner les clés avec web-app
- [ ] Ajouter les traductions manquantes
- [ ] Synchroniser les modules secondaires

---

### OPT-003 : Zustand Store

**Priorité** : P2 - Moyen  
**Impact** : Gestion d'état  
**Statut** : 🔴 Non démarré

**Problème** :
Le dossier `stores/` est vide. Pas de store Zustand contrairement à web-app.

**Stores à créer** :

- [ ] `notifications-store.ts` - État des notifications
- [ ] `ui-store.ts` - État UI (modals, drawers, etc.)
- [ ] `user-store.ts` - Préférences utilisateur

**Estimation** : 2-3 jours

---

## 🚧 Développements à Continuer

### DEV-001 : Chat Avancé ✅ Session du 21 février

**Priorité** : P0 - En cours  
**Impact** : Parité avec web-app  
**Statut** : ✅ Implémenté

**Fonctionnalités ajoutées** :

1. ✅ **FAB "New Chat"** :
   - `components/chat/NewChatModal.tsx` (~310 lignes)
   - Modal de sélection de contacts
   - Support création conversation 1:1 ou groupe
   - FAB flottant ajouté dans `app/(tabs)/chats.tsx`

2. ✅ **Edit/Delete Messages UI** :
   - `MessageContextMenu.tsx` déjà implémenté (Reply, Copy, Forward, Edit, Delete)
   - Limite de 15 minutes pour l'édition
   - Confirmation Alert pour suppression
   - Callbacks connectés dans `app/chat/[id].tsx` :
     - `handleEdit` → `editMessage()` service
     - `handleDelete` → `deleteMessage()` service
     - `handleCopy` → `expo-clipboard`
     - `handleReply` → état `replyingTo`

3. ✅ **Read Receipts UI** :
   - Prop `isRead` ajoutée à `MessageBubble`
   - Indicateur visuel : `✓` (envoyé) ou `✓✓` (lu)
   - Service `getOthersLastReadAt()` dans `messaging.ts`
   - Hook `isMessageRead()` dans `useChat`

**Fichiers modifiés** :

- `mobile/components/chat/NewChatModal.tsx` (nouveau)
- `mobile/components/chat/index.ts`
- `mobile/app/(tabs)/chats.tsx`
- `mobile/app/chat/[id].tsx`
- `mobile/components/MessageBubble.tsx`
- `mobile/hooks/useChat.ts`
- `mobile/services/messaging.ts`
- `mobile/i18n/*.json` (traductions)

---

### DEV-002 : Pull-to-Refresh

**Priorité** : P2 - Moyen  
**Impact** : UX mobile  
**Statut** : 🔴 Non démarré

**À implémenter** :

- [ ] `RefreshControl` sur la liste des conversations
- [ ] `RefreshControl` sur la liste des messages
- [ ] `RefreshControl` sur les contacts

**Estimation** : 2-4 heures

---

### DEV-003 : Search Globale

**Priorité** : P2 - Moyen  
**Impact** : UX, Navigation  
**Statut** : 🔴 Non démarré

**À implémenter** :

- [ ] Écran de recherche (`app/search.tsx` existe mais vide)
- [ ] Recherche dans les conversations
- [ ] Recherche dans les messages
- [ ] Recherche de contacts

**Estimation** : 2-3 jours

---

### DEV-004 : Onboarding

**Priorité** : P3 - Mineur  
**Impact** : UX premiers utilisateurs  
**Statut** : 🔴 Non démarré

**État** :

- Dossier `app/(onboarding)/` existe
- Écrans de slides créés
- Non connecté au flow d'inscription

**Estimation** : 1 jour

---

### DEV-005 : CallKit / ConnectionService

**Priorité** : P2 - Moyen  
**Impact** : Appels natifs iOS/Android  
**Statut** : 🔴 Non démarré

**À implémenter** :

- [ ] CallKit pour iOS (sonnerie, écran verrouillé)
- [ ] ConnectionService pour Android
- [ ] Intégration avec `IncomingCallModal`

**Prérequis** : Stream Video token fonctionnel (CRIT-001)

**Estimation** : 1 semaine

---

## 📊 Comparatif Mobile vs Web-App

### Fonctionnalités Core

| Feature              | Mobile               | Web-App            | Écart            |
| -------------------- | -------------------- | ------------------ | ---------------- |
| Auth email/password  | ✅                   | ✅                 | Parité           |
| OAuth (Google/Apple) | ❌                   | ✅                 | **Web > Mobile** |
| Profil view/edit     | ✅                   | ✅                 | Parité           |
| Avatar upload        | ✅                   | ✅                 | Parité           |
| Liste conversations  | ✅ Supabase          | ✅ API + Socket.IO | Parité           |
| Chat temps réel      | ✅ Supabase Realtime | ✅ Socket.IO       | Parité           |
| Typing indicator     | ✅                   | ✅                 | Parité           |
| Image/Video upload   | ✅                   | ✅                 | Parité           |
| Voice messages       | ✅                   | ✅                 | Parité           |

### Messagerie Avancée

| Feature              | Mobile                       | Web-App        | Écart            |
| -------------------- | ---------------------------- | -------------- | ---------------- |
| Edit messages        | ✅ Session 21/02             | ✅             | Parité           |
| Delete messages      | ✅ Session 21/02             | ✅             | Parité           |
| Reactions emoji      | ✅                           | ✅             | Parité           |
| Emoji picker         | ✅ rn-emoji-keyboard         | ✅             | Parité           |
| GIF picker (GIPHY)   | ✅                           | ✅             | Parité           |
| Reply to message     | ✅                           | ✅             | Parité           |
| Forward message      | ✅                           | ✅             | Parité           |
| Message context menu | ✅ Long-press                | ✅ Right-click | Parité           |
| Read receipts        | ✅ Session 21/02             | ⚠️             | **Mobile > Web** |
| FAB New Chat         | ✅ Session 21/02             | ✅             | Parité           |
| Swipe actions        | ✅ SwipeableConversationItem | N/A            | **Mobile > Web** |

### Appels Audio/Vidéo

| Feature                   | Mobile               | Web-App | Écart            |
| ------------------------- | -------------------- | ------- | ---------------- |
| Boutons appel             | ✅                   | ✅      | Parité           |
| Stream Video SDK          | ⚠️ Token placeholder | ✅      | **Web > Mobile** |
| Call controls             | ✅                   | ✅      | Parité           |
| Call history              | ✅                   | ✅      | Parité           |
| Incoming call modal       | ✅                   | ✅      | Parité           |
| Screen sharing            | ❌                   | ✅      | **Web > Mobile** |
| CallKit/ConnectionService | ❌                   | N/A     | À implémenter    |

### Infrastructure

| Feature            | Mobile          | Web-App       | Écart            |
| ------------------ | --------------- | ------------- | ---------------- |
| Offline queue      | ✅ AsyncStorage | ✅ IndexedDB  | Parité           |
| Logger unifié      | ❌              | ✅            | **Web > Mobile** |
| Push notifications | ✅ Expo         | ✅ FCM        | Parité           |
| Thèmes             | ✅ Dark/Light   | ✅ 8 thèmes   | **Web > Mobile** |
| i18n               | ✅ ~320 clés    | ✅ ~2300 clés | **Web > Mobile** |
| Zustand stores     | ❌              | ✅            | **Web > Mobile** |
| Tests              | ⚠️ ~20%         | ⚠️ ~7%        | Mobile > Web     |

### Features Secondaires

| Feature       | Mobile  | Web-App      | Écart            |
| ------------- | ------- | ------------ | ---------------- |
| Social feed   | 🔲 Mock | ⚠️ Fallback  | Parité           |
| Store         | 🔲 Mock | ⚠️ Fallback  | Parité           |
| Watch parties | 🔲 Mock | ⚠️ Fallback  | Parité           |
| Search        | ❌      | ⚠️ Chat only | **Web > Mobile** |

---

## 🎯 Priorités Immédiates

### Sprint actuel (semaine du 21 février)

| #   | Tâche                       | Priorité | Statut | Estimation |
| --- | --------------------------- | -------- | ------ | ---------- |
| 1   | ~~FAB New Chat~~            | P0       | ✅     | -          |
| 2   | ~~Edit/Delete messages UI~~ | P0       | ✅     | -          |
| 3   | ~~Read receipts UI~~        | P0       | ✅     | -          |
| 4   | Stream Video token fix      | P0       | ⚠️     | 2-3 jours  |
| 5   | OAuth Google/Apple          | P1       | 🔴     | 2-3 jours  |
| 6   | Pull-to-refresh             | P2       | 🔴     | 2-4 heures |

### Backlog prioritaire

| #   | Tâche                     | Priorité | Estimation |
| --- | ------------------------- | -------- | ---------- |
| 7   | Logger unifié             | P2       | 1 jour     |
| 8   | Search globale            | P2       | 2-3 jours  |
| 9   | Zustand stores            | P2       | 2-3 jours  |
| 10  | CallKit/ConnectionService | P2       | 1 semaine  |
| 11  | Tests unitaires (+30%)    | P1       | 1 semaine  |
| 12  | Onboarding flow           | P3       | 1 jour     |

---

## 📁 Structure du Projet

```
mobile/
├── app/                    # Routes expo-router
│   ├── (auth)/            # Écrans login/signup
│   ├── (onboarding)/      # Onboarding (non connecté)
│   ├── (tabs)/            # 10 tabs principales
│   ├── call/              # Écrans appels
│   └── chat/              # Chat room [id].tsx
├── components/            # Composants React Native
│   ├── chat/              # Chat-specific components
│   │   ├── MessageContextMenu.tsx
│   │   ├── NewChatModal.tsx
│   │   ├── SwipeableConversationItem.tsx
│   │   ├── EmojiPickerButton.tsx
│   │   └── GifPicker.tsx
│   ├── MessageBubble.tsx
│   ├── MessageInput.tsx
│   └── ...
├── hooks/                 # Custom hooks
│   ├── useAuth.ts
│   ├── useChat.ts
│   ├── useReactions.ts
│   └── ...
├── services/              # API et services
│   ├── messaging.ts       # CRUD messages + conversations
│   ├── reactions.ts
│   ├── offline-queue.ts
│   ├── supabase.ts
│   └── ...
├── i18n/                  # Traductions
│   ├── fr.json
│   ├── en.json
│   └── ja.json
├── providers/             # Context providers
├── stores/                # Zustand (vide)
└── docs/                  # Documentation
```

---

## 📝 Notes de Session

### Session du 21 février 2026

**Objectif** : Rattraper le mobile sur les fonctionnalités chat avancé

**Réalisations** :

1. ✅ Configuration `.env` vérifiée (Supabase, Stream, GIPHY, Firebase)
2. ✅ FAB "New Chat" + `NewChatModal` implémenté
3. ✅ Callbacks Edit/Delete/Copy/Reply connectés dans `[id].tsx`
4. ✅ Read receipts avec indicateur `✓✓` implémenté
5. ✅ Traductions ajoutées (fr/en/ja)

**Fichiers créés** :

- `components/chat/NewChatModal.tsx`

**Fichiers modifiés** :

- `app/(tabs)/chats.tsx` - FAB + modal
- `app/chat/[id].tsx` - Handlers + isMessageRead
- `components/MessageBubble.tsx` - Read receipt UI
- `hooks/useChat.ts` - othersLastReadAt + isMessageRead
- `services/messaging.ts` - getOthersLastReadAt()
- `i18n/*.json` - Nouvelles clés

---

_Document généré automatiquement - Dernière mise à jour : 21 février 2026_
