# 📊 Analyse des Écarts - ImuChat Cross-Platform

**Date :** 2 décembre 2025  
**Objectif :** Identifier les gaps entre Web, Mobile et Desktop pour planifier la convergence

---

## 🔍 Synthèse des Écarts

### Vue d'ensemble

| Critère | Web (ImuChat) | Mobile (Expo) | Desktop (Electron) | Écart |
|---------|---------------|---------------|-------------------|-------|
| **Maturité** | 🟢 Avancé | 🟢 Avancé | 🔴 Initial | ⚠️ Fort |
| **Composants UI** | 50+ | 20+ | 0 | ⚠️ Fort |
| **Tests** | 399 tests | Infrastructure | 0 | ⚠️ Modéré |
| **Modules Core** | 4/16 | 6/16 | 0/16 | ⚠️ Modéré |
| **Architecture** | Zustand + Context | Zustand + MMKV | À définir | 🟢 Aligné |

---

## 📦 Écarts par Package

### 1. Composants UI (@imuchat/ui-kit)

#### Web (ImuChat) - Source existante

```
✅ 50+ composants shadcn/ui testés :
├── Base: Button, Card, Input, Avatar, Badge, Separator
├── Forms: Checkbox, RadioGroup, Select, Slider, Switch, Textarea
├── Layout: Accordion, Collapsible, Tabs, Sidebar (29KB!)
├── Overlays: Dialog, Sheet, Popover, HoverCard, Tooltip, Toast
├── Navigation: Menubar, ContextMenu, DropdownMenu
├── Data: Table, Calendar, Progress, Carousel, Chart
└── Special: Command, AlertDialog, Form validation

Tests : 215+ tests, 37.68% coverage
```

#### Mobile - À migrer/adapter

```
⏳ Composants natifs requis :
├── Base: Même API, adaptation React Native
├── Forms: Native inputs avec gestures
├── Layout: BottomSheet, SafeAreaView, FlatList
├── Overlays: Modal natif, ActionSheet
├── Navigation: Stack, Tab, Drawer navigators
└── Special: Haptics, Animations reanimated

Gap : ~30 composants à adapter pour React Native
```

#### Desktop - À créer

```
⏳ Composants desktop requis :
├── Même base que web (Electron = Chromium)
├── Window controls: Titlebar, traffic lights
├── System: Tray, notifications natives
├── Drag & Drop: File system integration
└── Menus: Application menu, context menus

Gap : Wrapper Electron + 5-10 composants spéciaux
```

---

### 2. Types Partagés (@imuchat/shared-types)

#### Types existants (Web + Mobile)

| Type | Web | Mobile | Statut |
|------|-----|--------|--------|
| `User` | ✅ | ✅ | À unifier |
| `Message` | ✅ | ✅ | À unifier |
| `Conversation` | ✅ | ✅ | À unifier |
| `Contact` | ✅ | ⏳ | Web plus complet |
| `Notification` | ✅ | ⏳ | Web plus complet |
| `Guild/Community` | ✅ | ✅ | À unifier |
| `Theme` | ✅ | ✅ | Aligné |
| `Wallet` | ✅ | ✅ | Mobile plus complet |
| `Store/Module` | ✅ | ✅ | À unifier |

#### Actions requises

1. **Merger les définitions** : Prendre le meilleur des deux
2. **Ajouter exports Zod** : Validation runtime partagée
3. **Générer SDK client** : Types API automatiques

---

### 3. Services Backend (@imuchat/platform-core)

#### Web - Services existants

```typescript
// Implémenté dans ImuChat/src/services/
✅ moduleRegistry.ts     → Enregistrement modules
✅ eventBus.ts           → Communication inter-modules
✅ fcm-service.ts        → Push notifications
✅ push-notifications.ts → Web Push API
✅ analytics.ts          → Event tracking
✅ user-settings.ts      → Préférences utilisateur
✅ api-error-handler.ts  → Gestion erreurs API
```

#### Mobile - Services existants

```typescript
// Implémenté dans mobile-app/src/services/
✅ moduleRegistry.ts     → Même pattern que web
✅ eventBus.ts           → Même pattern que web
⏳ notifications         → Expo Notifications
⏳ biometrics            → Expo LocalAuthentication
✅ storage (MMKV)        → Persistance rapide
```

#### Gaps identifiés

| Service | Web | Mobile | Action |
|---------|-----|--------|--------|
| **Auth Firebase** | ✅ | ⏳ | Unifier config |
| **WebSocket** | ✅ Socket.IO | ⏳ | Partager client |
| **Push Notifications** | ✅ FCM | ⏳ Expo | Unifier API |
| **Offline Sync** | ⏳ IndexedDB | ⏳ MMKV | Créer abstraction |
| **Media Upload** | ⏳ | ✅ | Partager service |
| **Crypto Wallet** | ⏳ Basic | ✅ Complet | Merger |

---

## 🧩 Écarts par Module Core

### Modules Infrastructure (Semaine 1)

| Module | Web | Mobile | Gap | Priorité |
|--------|-----|--------|-----|----------|
| **Chat Engine** | ✅ WebSocket | ✅ Mock | Socket mobile | P0 |
| **Auth** | ✅ Firebase | ✅ Firebase | Config unifiée | P0 |
| **Offline Sync** | ⏳ | ⏳ | Créer de zéro | P1 |
| **Preferences** | ⏳ | ⏳ | Créer de zéro | P1 |

### Modules Communication (Semaine 2)

| Module | Web | Mobile | Gap | Priorité |
|--------|-----|--------|-----|----------|
| **Contacts** | ✅ Complet | ⏳ | Migrer depuis web | P0 |
| **Notifications** | ✅ 84 tests | ⏳ | Adapter pour Expo | P0 |
| **Moderation** | ⏳ | ⏳ | Créer partagé | P1 |
| **Calls (basic)** | ⏳ | ⏳ | WebRTC cross-platform | P2 |

### Modules UX (Semaine 3)

| Module | Web | Mobile | Gap | Priorité |
|--------|-----|--------|-----|----------|
| **Theme Engine** | ✅ Partiel | ✅ | Unifier tokens | P1 |
| **Media Handler** | ⏳ | ✅ | Partager upload | P1 |
| **Search** | ⏳ | ⏳ | Créer partagé | P2 |
| **i18n** | ✅ next-intl | ✅ | Déjà aligné | ✅ |

### Modules Économie (Semaine 4)

| Module | Web | Mobile | Gap | Priorité |
|--------|-----|--------|-----|----------|
| **Wallet Core** | ⏳ Basic | ✅ Complet | Merger mobile→shared | P1 |
| **Store Core** | ✅ Partiel | ✅ | Unifier catalogue | P1 |
| **IA Assistant** | ⏳ | ⏳ | Créer Genkit partagé | P2 |
| **Telemetry** | ⏳ | ⏳ | Créer partagé | P3 |

---

## 🎨 Écarts Design System

### Tokens & Variables

| Token | Web | Mobile | Action |
|-------|-----|--------|--------|
| **Couleurs** | CSS vars | RN StyleSheet | Créer abstraction |
| **Espacements** | Tailwind | NativeWind | Compatible |
| **Typographie** | CSS | RN fonts | Unifier via tokens |
| **Ombres** | box-shadow | RN shadow | Platform-specific |
| **Animations** | Framer Motion | Reanimated | APIs différentes |

### Thèmes Kawaii

```
Définis dans web-app/docs/KAWAII_UI_UX_DESIGN_CHARTER.md
7 palettes prévues, aucune implémentée dans ui-kit
→ Action : Implémenter dans ui-kit comme source de vérité
```

---

## 📱 Écarts Spécifiques Mobile

### Fonctionnalités natives manquantes sur Web

| Feature | Mobile | Web équivalent |
|---------|--------|----------------|
| **Biométrie** | ✅ Expo LocalAuth | ⏳ WebAuthn |
| **Camera** | ✅ Expo Camera | ⏳ MediaDevices |
| **Push tokens** | ✅ Expo Notifications | ✅ FCM |
| **Haptics** | ✅ Expo Haptics | ❌ Non supporté |
| **Gestures** | ✅ Gesture Handler | ⏳ Touch events |
| **Storage** | ✅ MMKV | ⏳ IndexedDB |

### Mobile en avance sur Web

1. **Module Finance/Wallet** : Complet avec graphiques, multi-portefeuilles
2. **Animations** : Système complet avec reanimated + gestures
3. **Storybook** : Configuré et prêt
4. **Architecture modulaire** : Plus mature

---

## 🖥️ Écarts Spécifiques Desktop

### Fonctionnalités à implémenter

| Feature | Statut | Priorité |
|---------|--------|----------|
| **Window management** | ⏳ | P0 |
| **System tray** | ⏳ | P1 |
| **Native menus** | ⏳ | P1 |
| **Auto-update** | ⏳ | P1 |
| **Deep linking** | ⏳ | P2 |
| **File drag & drop** | ⏳ | P2 |
| **Keyboard shortcuts** | ⏳ | P2 |

### Avantage Desktop

- Peut réutiliser 90% du code web (Electron = Chromium)
- Composants ui-kit web directement compatibles
- Build rapide via electron-builder

---

## 🔄 Plan de Convergence

### Phase 1 : Migration Composants (Semaine 1)

```
ImuChat/src/components/ui/ → ui-kit/src/components/
├── Copier les 26 composants testés
├── Adapter exports pour dual-platform
├── Tests : Jest + React Native Testing Library
└── Storybook : Histoires cross-platform
```

### Phase 2 : Unification Types (Semaine 1-2)

```
Merge des types :
├── ImuChat types → shared-types (base)
├── Mobile types → shared-types (compléments)
├── Validation Zod → shared-types/schemas
└── SDK generation → shared-types/api
```

### Phase 3 : Services Partagés (Semaine 2-3)

```
platform-core services :
├── Auth service (Firebase unifié)
├── WebSocket client (Socket.IO)
├── Push notifications (abstraction FCM/Expo)
├── Storage abstraction (IndexedDB/MMKV)
└── API client avec types
```

### Phase 4 : Modules Core (Semaine 3-6)

```
Migration progressive :
├── Contacts module → shared (depuis web)
├── Notifications module → shared (depuis web)
├── Wallet module → shared (depuis mobile)
├── Nouveaux modules → créés directement dans shared
└── Tests : >50% coverage requis
```

---

## 🎯 Écarts sur les 50 Fonctionnalités

> Référence : [FUNCTIONNALYTIES_LIST.md](./FUNCTIONNALYTIES_LIST.md)

### Groupe 1 : Messagerie & Communication

| # | Fonctionnalité | Web | Mobile | Desktop | Gap | Action |
|---|----------------|-----|--------|---------|-----|--------|
| 1.1 | Messagerie instantanée | ✅ | ✅ | ⏳ | 🟢 Faible | Desktop: wrapper web |
| 1.2 | Messages vocaux transcrits | ⏳ | ⏳ | ⏳ | 🔴 Fort | Créer service Whisper API |
| 1.3 | Pièces jointes | ✅ | ⏳ | ⏳ | 🟠 Modéré | Mobile: adapter upload |
| 1.4 | Édition/suppression messages | ✅ | ⏳ | ⏳ | 🟢 Faible | Migrer depuis web |
| 1.5 | Réactions aux messages | ⏳ | ⏳ | ⏳ | 🔴 Fort | Créer de zéro |

**Score Groupe 1 :** 2/5 implémentés (40%)

### Groupe 2 : Appels audio & vidéo

| # | Fonctionnalité | Web | Mobile | Desktop | Gap | Action |
|---|----------------|-----|--------|---------|-----|--------|
| 2.1 | Appels audio | ⏳ | ⏳ | ⏳ | 🔴 Fort | WebRTC + signaling |
| 2.2 | Appels vidéo HD | ⏳ | ⏳ | ⏳ | 🔴 Fort | WebRTC + codec |
| 2.3 | PiP | ⏳ | ⏳ | ⏳ | 🔴 Fort | Platform-specific |
| 2.4 | Partage écran | ⏳ | ⏳ | ⏳ | 🔴 Fort | getDisplayMedia |
| 2.5 | Filtres IA | ⏳ | ⏳ | ⏳ | 🔴 Fort | TensorFlow.js / ML Kit |

**Score Groupe 2 :** 0/5 implémentés (0%) — **PRIORITÉ HAUTE**

### Groupe 3 : Profils & Identité

| # | Fonctionnalité | Web | Mobile | Desktop | Gap | Action |
|---|----------------|-----|--------|---------|-----|--------|
| 3.1 | Profils privés/publics/anonymes | ⏳ | ⏳ | ⏳ | 🔴 Fort | Backend + UI |
| 3.2 | Multi-profils | ⏳ | ⏳ | ⏳ | 🔴 Fort | Auth multi-session |
| 3.3 | Avatars 2D/3D | ⏳ | ⏳ | ⏳ | 🔴 Fort | Intégration Ready Player Me |
| 3.4 | Statuts animés | ⏳ | ⏳ | ⏳ | 🟠 Modéré | Lottie animations |
| 3.5 | Vérification identité | ⏳ | ⏳ | ⏳ | 🔴 Fort | Service KYC externe |

**Score Groupe 3 :** 0/5 implémentés (0%)

### Groupe 4 : Personnalisation avancée

| # | Fonctionnalité | Web | Mobile | Desktop | Gap | Action |
|---|----------------|-----|--------|---------|-----|--------|
| 4.1 | Thèmes visuels | ✅ Partiel | ✅ | ⏳ | 🟢 Faible | Unifier dans ui-kit |
| 4.2 | Arrière-plans animés | ⏳ | ⏳ | ⏳ | 🟠 Modéré | CSS + Lottie |
| 4.3 | Police par conversation | ⏳ | ⏳ | ⏳ | 🟠 Modéré | Storage per-chat |
| 4.4 | Packs icônes/sons | ⏳ | ⏳ | ⏳ | 🟠 Modéré | Asset bundles |
| 4.5 | Widget homescreen | N/A | ⏳ | ⏳ | 🟠 Modéré | Expo Widget |

**Score Groupe 4 :** 1/5 implémentés (20%)

### Groupe 5 : Mini-apps sociales

| # | Fonctionnalité | Web | Mobile | Desktop | Gap | Action |
|---|----------------|-----|--------|---------|-----|--------|
| 5.1 | Stories 24h | ⏳ | ⏳ | ⏳ | 🔴 Fort | Module complet |
| 5.2 | Mur social / Timeline | ⏳ | ⏳ | ⏳ | 🔴 Fort | Module complet |
| 5.3 | Mini-blogs | ⏳ | ⏳ | ⏳ | 🔴 Fort | Editor rich text |
| 5.4 | Événements | ⏳ | ⏳ | ⏳ | 🔴 Fort | Calendrier + invites |
| 5.5 | Groupes avec feed | ⏳ | ⏳ | ⏳ | 🟠 Modéré | Extension chat |

**Score Groupe 5 :** 0/5 implémentés (0%)

### Groupe 6 : Modules avancés

| # | Fonctionnalité | Web | Mobile | Desktop | Gap | Action |
|---|----------------|-----|--------|---------|-----|--------|
| 6.1 | Productivity Hub | ⏳ | ⏳ | ⏳ | 🔴 Fort | Module complet |
| 6.2 | Suite Office | ⏳ | ⏳ | ⏳ | 🔴 Fort | Intégration OnlyOffice |
| 6.3 | Module PDF | ⏳ | ⏳ | ⏳ | 🟠 Modéré | react-pdf |
| 6.4 | Board collaboratif | ⏳ | ⏳ | ⏳ | 🔴 Fort | tldraw / Excalidraw |
| 6.5 | Cooking & Home | ⏳ | ⏳ | ⏳ | 🔴 Fort | Module complet |

**Score Groupe 6 :** 0/5 implémentés (0%)

### Groupe 7 : Services utilitaires publics

| # | Fonctionnalité | Web | Mobile | Desktop | Gap | Action |
|---|----------------|-----|--------|---------|-----|--------|
| 7.1 | Horaires transport | ⏳ | ⏳ | ⏳ | 🟠 Modéré | API SNCF/RATP |
| 7.2 | Info trafic routier | ⏳ | ⏳ | ⏳ | 🟠 Modéré | API TomTom/HERE |
| 7.3 | Numéros urgence | ⏳ | ⏳ | ⏳ | 🟢 Faible | Données statiques |
| 7.4 | Annuaire services publics | ⏳ | ⏳ | ⏳ | 🟠 Modéré | API service-public.fr |
| 7.5 | Suivi colis | ⏳ | ⏳ | ⏳ | 🟠 Modéré | API 17track |

**Score Groupe 7 :** 0/5 implémentés (0%)

### Groupe 8 : Divertissement & Création

| # | Fonctionnalité | Web | Mobile | Desktop | Gap | Action |
|---|----------------|-----|--------|---------|-----|--------|
| 8.1 | Mini-lecteur musique | ⏳ | ⏳ | ⏳ | 🟠 Modéré | Audio player |
| 8.2 | Podcasts | ⏳ | ⏳ | ⏳ | 🟠 Modéré | RSS + player |
| 8.3 | Lecteur vidéo | ⏳ | ⏳ | ⏳ | 🟠 Modéré | react-player |
| 8.4 | Mini-jeux sociaux | ⏳ | ⏳ | ⏳ | 🔴 Fort | Game engine |
| 8.5 | Création stickers/emojis | ⏳ | ⏳ | ⏳ | 🟠 Modéré | Canvas editor |

**Score Groupe 8 :** 0/5 implémentés (0%)

### Groupe 9 : IA intégrée

| # | Fonctionnalité | Web | Mobile | Desktop | Gap | Action |
|---|----------------|-----|--------|---------|-----|--------|
| 9.1 | Chatbot multi-personas | ⏳ | ⏳ | ⏳ | 🟠 Modéré | Genkit + prompts |
| 9.2 | Suggestions réponses | ⏳ | ⏳ | ⏳ | 🟠 Modéré | LLM inference |
| 9.3 | Résumé conversation | ⏳ | ⏳ | ⏳ | 🟠 Modéré | LLM summarization |
| 9.4 | Modération automatique | ⏳ | ⏳ | ⏳ | 🟠 Modéré | Content filtering |
| 9.5 | Traduction instantanée | ⏳ | ⏳ | ⏳ | 🟢 Faible | DeepL / Google Translate |

**Score Groupe 9 :** 0/5 implémentés (0%)

### Groupe 10 : App Store & Écosystème

| # | Fonctionnalité | Web | Mobile | Desktop | Gap | Action |
|---|----------------|-----|--------|---------|-----|--------|
| 10.1 | Store d'apps | ✅ Partiel | ✅ | ⏳ | 🟢 Faible | Unifier catalogue |
| 10.2 | Installation modules | ⏳ | ⏳ | ⏳ | 🟠 Modéré | Module loader |
| 10.3 | Permissions app | ⏳ | ⏳ | ⏳ | 🟠 Modéré | Permission system |
| 10.4 | Marketplace services | ⏳ | ⏳ | ⏳ | 🔴 Fort | E-commerce complet |
| 10.5 | Paiement + wallet | ✅ UI | ✅ | ⏳ | 🟢 Faible | Merger mobile→shared |

**Score Groupe 10 :** 2/5 implémentés (40%)

---

## 📊 Résumé des Écarts par Groupe

| Groupe | Score | Priorité | Phase | Effort estimé |
|--------|-------|----------|-------|---------------|
| 1. Messagerie | 2/5 (40%) | 🔴 P0 | A-B | 2 semaines |
| 2. Appels | 0/5 (0%) | 🔴 P0 | B-C | 4 semaines |
| 3. Profils | 0/5 (0%) | 🟠 P1 | B | 2 semaines |
| 4. Personnalisation | 1/5 (20%) | 🟠 P1 | C-D | 3 semaines |
| 5. Social | 0/5 (0%) | 🟠 P1 | C | 4 semaines |
| 6. Modules avancés | 0/5 (0%) | 🟡 P2 | C-D | 6 semaines |
| 7. Services publics | 0/5 (0%) | 🟡 P2 | D | 2 semaines |
| 8. Divertissement | 0/5 (0%) | 🟡 P2 | D | 3 semaines |
| 9. IA | 0/5 (0%) | 🟠 P1 | C-D | 4 semaines |
| 10. Store | 2/5 (40%) | 🟠 P1 | D-E | 3 semaines |

**Total :** 5/50 fonctionnalités implémentées (10%)

---

## 📊 Matrice de Priorités

### Haute Priorité (P0) - Cette semaine

1. ⬜ Migrer composants UI shadcn → ui-kit
2. ⬜ Unifier types User, Message, Conversation
3. ⬜ Configurer Firebase Auth partagé
4. ⬜ Setup Socket.IO dans platform-core
5. ⬜ **Compléter Groupe 1 (Messagerie)** : réactions, vocaux

### Priorité Moyenne (P1) - Janvier 2026

1. ⬜ Migrer Module Contacts
2. ⬜ Migrer Module Notifications
3. ⬜ Merger Wallet (mobile → shared)
4. ⬜ Implémenter Theme Engine partagé
5. ⬜ **Groupe 2 (Appels)** : audio/vidéo basique
6. ⬜ **Groupe 3 (Profils)** : multi-profils, statuts
7. ⬜ **Groupe 9 (IA)** : chatbot, suggestions

### Priorité Basse (P2) - Février+ 2026

1. ⬜ Module Search
2. ⬜ Module Calls (WebRTC avancé : PiP, filtres)
3. ⬜ Module IA Assistant avancé
4. ⬜ Offline Sync
5. ⬜ **Groupe 5 (Social)** : Stories, Timeline
6. ⬜ **Groupe 6 (Modules)** : Productivity, Office
7. ⬜ **Groupe 7-8** : Services publics, Divertissement

---

## 🎯 Métriques de Convergence

| Métrique | Actuel | Objectif Jan 2026 | Objectif Launch |
|----------|--------|-------------------|-----------------|
| **Code partagé** | ~10% | 50% | 70% |
| **Types unifiés** | 0% | 100% | 100% |
| **Composants partagés** | 0 | 25 | 40+ |
| **Modules partagés** | 0/16 | 8/16 | 16/16 |
| **Tests partagés** | 0 | 200+ | 500+ |

---

## ✅ Recommandations

### 1. Prioriser la migration web → shared

Le projet web (ImuChat) est le plus mature pour les modules core (Contacts, Notifications). Migrer en priorité.

### 2. Conserver les avantages mobile

Le projet mobile excelle sur Finance/Wallet et les animations. Merger ces fonctionnalités vers shared.

### 3. Desktop comme wrapper web

Utiliser Electron principalement comme conteneur pour le code web, avec des hooks pour les APIs natives.

### 4. Tests cross-platform

Investir dans une infrastructure de tests partagée (Jest + RTL) pour garantir la compatibilité.

---

*Document généré le 2 décembre 2025*
