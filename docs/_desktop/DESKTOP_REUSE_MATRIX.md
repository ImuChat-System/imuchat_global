# 🔄 MATRICE DE RÉUTILISATION — Desktop App ← Web App / Packages Partagés

**Date :** 8 mars 2026  
**Objectif :** Identifier précisément ce qui peut être réutilisé directement, adapté, ou recréé from scratch  
**Hiérarchie :** Ce document fait partie de la documentation desktop (voir `DESKTOP_INDEX.md`)

---

## 📊 Légende

| Symbole | Signification |
|---------|---------------|
| ✅ DIRECT | Import direct sans modification |
| 🔄 ADAPTER | Réutilisable avec adaptation légère |
| 🆕 NOUVEAU | À créer spécifiquement pour desktop |
| 🖥️ NATIF | Fonctionnalité native Electron |

---

## 1. Composants UI (depuis @imuchat/ui-kit)

| Composant | Mode | Notes |
|-----------|:----:|-------|
| `Button` | ✅ | Import direct |
| `KawaiiButton` | ✅ | Import direct (style kawaii) |
| `Input` | ✅ | Import direct |
| `KawaiiInput` | ✅ | Import direct |
| `Avatar` | ✅ | Import direct |
| `KawaiiAvatar` | ✅ | Import direct |
| `Badge` | ✅ | Import direct |
| `KawaiiBadge` | ✅ | Import direct |
| `Card` | ✅ | Import direct |
| `KawaiiCard` | ✅ | Import direct |
| `Modal` / `Dialog` | ✅ | Import direct |
| `KawaiiModal` | ✅ | Import direct |
| `ChatBubble` | ✅ | Import direct |
| `ChatInput` | ✅ | Import direct |
| `MessageList` | ✅ | Import direct |
| `TypingIndicator` | ✅ | Import direct |
| `EmojiReaction` | ✅ | Import direct |
| `UserAvatar` | ✅ | Import direct |
| `OnlineIndicator` | ✅ | Import direct |
| `ServerIcon` | ✅ | Import direct |
| `ChannelItem` | ✅ | Import direct |
| `ImuMascot` | ✅ | Import direct |
| `LottiePlayer` | ✅ | Import direct (animations) |
| `Spinner` | ✅ | Import direct |
| `Tabs` | ✅ | Import direct |
| `Select` | ✅ | Import direct |
| `Switch` | ✅ | Import direct |
| `Checkbox` | ✅ | Import direct |
| `Tooltip` / `KawaiiTooltip` | ✅ | Import direct |
| `Popover` | ✅ | Import direct |
| `DropdownMenu` | ✅ | Import direct |
| `Label` | ✅ | Import direct |
| `Text` | ✅ | Import direct |
| `Divider` | ✅ | Import direct |
| `IconButton` | ✅ | Import direct |
| `KawaiiProgress` | ✅ | Import direct |
| `KawaiiToast` | ✅ | Import direct |
| `LanguageSwitcher` | ✅ | Import direct (i18n) |
| **Total** | **37 composants ✅** | **0 adaptation nécessaire** |

---

## 2. Types (depuis @imuchat/shared-types)

| Type/Interface | Mode | Notes |
|----------------|:----:|-------|
| `User`, `UserProfile` | ✅ | Types utilisateur |
| `ChatMessage`, `Conversation` | ✅ | Types messagerie |
| `MessageType` (12 types) | ✅ | text, image, file, audio, video, gif, etc. |
| `Server`, `Channel`, `ServerMember` | ✅ | Types communautés |
| `Contact`, `FriendRequest` | ✅ | Types contacts |
| `NotificationType` (17 types) | ✅ | Tous les types de notification |
| `Theme`, `ThemeMode` | ✅ | Types thème |
| `ModuleManifest` | ✅ | Module system |
| `AgeTier` (KIDS/JUNIOR/TEEN/ADULT) | ✅ | Segmentation |
| `WalletTransaction` | ✅ | Types wallet |
| `StoreItem`, `StoreCategory` | ✅ | Types store |
| `AuthState`, Session types | ✅ | Types auth |
| `ApiResponse`, `PaginatedResponse` | ✅ | Types API |
| Zod schemas | ✅ | Validation |
| `useAuth` hook | ✅ | Hook auth partagé |
| **Total** | **100% réutilisable** | **Aucune adaptation** |

---

## 3. Platform-Core Modules (import client-safe)

| Module | Mode | Usage Desktop |
|--------|:----:|---------------|
| `EventBus` | ✅ | Pub/Sub inter-composants |
| `ModuleRegistry` | ✅ | Enregistrement/lifecycle modules |
| `ThemeModule` | ✅ | Gestion thèmes |
| `PreferencesModule` | ✅ | Préférences utilisateur |
| `MascotteModule` | ✅ | Mascotte ImuChat |
| `AnimationModule` | ✅ | Animations Lottie |
| `SoundModule` | ✅ | Sons UI |
| `SeasonModule` | ✅ | Événements saisonniers |
| `TelemetryModule` | ✅ | Analytics |
| `ChatEngineModule` | 🔄 | Adapter pour Socket.IO desktop |
| `PresenceModule` | 🔄 | Adapter pour context desktop |
| `ContactsModule` | 🔄 | Adapter pour Supabase direct |
| `CallsModule` | 🔄 | Adapter pour Electron WebRTC |
| `NotificationsModule` | 🔄 | Mixer avec notifications Electron natives |
| `SearchModule` | 🔄 | Adapter pour recherche locale |
| `OfflineSyncModule` | 🔄 | Adapter pour stockage Electron |
| `MediaModule` | 🔄 | Adapter pour file system Electron |
| `WebSocketModule` | ❌ | Server-only, pas d'import côté client |
| `IAAssistantModule` | 🔄 | Adapter pour fenêtre dédiée desktop |
| **Total** | **9 ✅ + 8 🔄** | **1 exclu (server-only)** |

---

## 4. Thèmes (depuis @imuchat/ui-kit/themes)

| Thème | Mode | Notes |
|-------|:----:|-------|
| Light | ✅ | Thème clair par défaut |
| Dark | ✅ | Thème sombre (actuel de la desktop) |
| Sakura Pink | ✅ | Rose kawaii |
| Cyber Neon | ✅ | Premium 🔒 |
| Zen Green | ✅ | Vert apaisant |
| Midnight | ✅ | Ultra sombre |
| Ocean | ✅ | Bleu océan |
| **Total** | **7/7 ✅** | **Tous utilisables directement** |

---

## 5. Animations / Assets (depuis platform-core)

| Asset | Mode | Notes |
|-------|:----:|-------|
| Mascotte animations (idle, happy, excited, loading, sleeping) | ✅ | Lottie JSON |
| Decorations (confetti, hearts, sakura, sparkles) | ✅ | Lottie JSON |
| UI sounds | ✅ | Sons d'interface |
| Mascotte voices | ✅ | Voix mascotte |
| Ambience sounds | ✅ | Sons d'ambiance |
| **Total** | **15+ assets ✅** | **Tous réutilisables** |

---

## 6. Services / Logic métier (depuis web-app → à adapter)

| Service Web | Mode Desktop | Adaptation nécessaire |
|-------------|:------------:|----------------------|
| `supabase.ts` (client) | 🔄 | `createBrowserClient` → même pattern pour Electron renderer |
| Auth service | 🔄 | Logique identique, adapter stockage session |
| Chat service | 🔄 | Logique identique, adapter pour Zustand |
| Contacts service | 🔄 | Logique identique |
| Notifications service | 🔄 | Ajouter notifications Electron natives |
| Communities service | 🔄 | Logique identique |
| Media service | 🔄 | Ajouter support file system Electron |
| Modules registry | 🔄 | Logique identique |
| API client | 🔄 | Même pattern, adapter base URL |
| Socket manager | 🔄 | Même logique Socket.IO |

---

## 7. Pages web-app → Mapping desktop

| Page Web | Page Desktop | Mode |
|----------|-------------|:----:|
| `/auth/login` | `/auth/login` | 🔄 Layout différent |
| `/auth/signup` | `/auth/signup` | 🔄 Layout différent |
| `/` (Home) | `/` (Home) | 🔄 Adapter pour sidebar layout |
| `/chats` | `/chat` | 🔄 Split panel comme Discord |
| `/chats/[id]` | `/chat/:id` | 🔄 Panneau droit du split |
| `/calls` | `/calls` | 🔄 + PiP Electron |
| `/contacts` | `/contacts` | 🔄 Layout desktop |
| `/communities` | `/communities` | 🔄 Layout 3 colonnes |
| `/feed` | `/social` | 🔄 Layout desktop |
| `/stories` | `/social/stories` | 🔄 Viewer desktop |
| `/notifications` | `/notifications` | 🔄 + Electron natives |
| `/store` | `/store` | 🔄 Layout desktop |
| `/profile` | `/profile` | 🔄 Layout desktop |
| `/settings` | `/settings` | 🔄 Layout tabs desktop |
| **Total** | **14 pages core** | **Toutes adaptables** |

---

## 8. Hooks web-app → Mapping desktop

| Hook Web | Hook Desktop | Mode |
|----------|-------------|:----:|
| `useAuth()` | `useAuth()` | 🔄 Zustand au lieu de Context |
| `useMessages()` | `useChat()` | 🔄 Même logique, store différent |
| `useConversations()` | `useConversations()` | 🔄 |
| `useContacts()` | `useContacts()` | 🔄 |
| `useSocket()` | `useSocket()` | 🔄 Même Socket.IO |
| `useTypingIndicator()` | `useTypingIndicator()` | 🔄 |
| `usePresence()` | `usePresence()` | 🔄 |
| `useLocale()` | `useTranslation()` | 🔄 i18next au lieu de next-intl |
| `useIsMobile()` | — | ❌ Pas pertinent sur desktop |
| `useNotifications()` | `useNotifications()` | 🔄 + Electron natives |
| — | `useElectron()` | 🆕 Hook IPC bridge |
| — | `useKeyboardShortcuts()` | 🆕 Raccourcis globaux |
| — | `useTheme()` | 🆕 Theme switching |
| **Total** | **10 🔄 + 3 🆕** | |

---

## 9. i18n — Clés réutilisables

| Namespace | Web | Desktop | Mode |
|-----------|:---:|:-------:|:----:|
| `common` | ✅ | ✅ | 🔄 Reprendre les mêmes clés |
| `auth` | ✅ | ✅ | 🔄 |
| `nav` | ✅ | ✅ | 🔄 Ajouter items desktop-specifiques |
| `chat` | ✅ | ✅ | 🔄 |
| `calls` | ✅ | ✅ | 🔄 |
| `contacts` | ✅ | ✅ | 🔄 |
| `settings` | ✅ | ✅ | 🔄 |
| `notifications` | ✅ | ✅ | 🔄 |
| `communities` | ✅ | ✅ | 🔄 |
| `store` | ✅ | ✅ | 🔄 |
| `profile` | ✅ | ✅ | 🔄 |
| `social` | ✅ | ✅ | 🔄 |
| `electron` | ❌ | ✅ | 🆕 Desktop-specific (tray, updater, etc.) |

---

## 📈 Score de réutilisation global

| Catégorie | Réutilisable | À adapter | Nouveau | Score |
|-----------|:------------:|:---------:|:-------:|:-----:|
| Composants UI-Kit | 37 | 0 | 0 | **100%** |
| Types partagés | 15+ domaines | 0 | 0 | **100%** |
| Modules platform-core | 9 | 8 | 0 | **100%** (53% direct) |
| Thèmes | 7 | 0 | 0 | **100%** |
| Assets/Animations | 15+ | 0 | 0 | **100%** |
| Services métier | 0 | 10 | 0 | **100%** (adaptation) |
| Pages | 0 | 14 | 2 | **87%** |
| Hooks | 0 | 10 | 3 | **77%** |
| i18n clés | 0 | 12 | 1 | **92%** |

### **Score moyen de réutilisation : ~95%**

> La grande majorité du code peut être réutilisée ou adaptée.  
> Les seules créations spécifiques desktop concernent les fonctionnalités Electron natives  
> (tray, updater, deep links, PiP, raccourcis globaux, notifications OS).

---

## 🎯 Recommandation

**Stratégie optimale :**

1. **Commencer par S0** — intégrer tous les packages partagés et vérifier les imports
2. **Construire sur les composants ui-kit** — ne PAS recréer de composants déjà disponibles
3. **Adapter les services web-app** — même logique métier, adapter le transport (Context → Zustand, next-intl → i18next)
4. **Ajouter la couche Electron en dernier** — tray, updater, notifications natives = frosting

---

*Document de référence — Voir DESKTOP_ROADMAP_UNIFIED.md pour le planning d'implémentation*  
*Mis à jour le 8 mars 2026*
