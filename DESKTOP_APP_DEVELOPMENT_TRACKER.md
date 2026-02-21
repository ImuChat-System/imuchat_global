# 🖥️ Desktop App — Suivi de Développement MVP

> Dernière mise à jour : 21 février 2026  
> Référence : MVP_ROADMAP_FEATURES.md (Semaines 9-12, Phase 2)

---

## 📊 Résumé Exécutif

| Métrique | Valeur |
|----------|--------|
| **Phase MVP** | Phase 2 — Semaines 9-12 (Desktop + Polish) |
| **Progression globale** | 🔴 **~5%** — Shell UI uniquement, données mock |
| **Progression Web-App** (comparaison) | 🟢 **~70-80%** — Fonctionnel avec backend réel |
| **Écart Desktop vs Web** | 🔴 **Critique** — 65-75 points de retard |
| **Statut actuel** | Squelette Electron + Layout UI statique |
| **Bloquant** | Aucune intégration backend (Supabase, Socket.IO, Stream) |

---

## 🏗️ État Actuel de la Desktop App

### Ce qui existe

| Composant | État | Détail |
|-----------|------|--------|
| Projet Electron | ✅ Configuré | Electron 30 + Vite + React 18 |
| Build system | ✅ Configuré | vite-plugin-electron + electron-builder (Mac/Win/Linux) |
| Shell UI (Layout) | ✅ Implémenté | Sidebar + Main content area |
| Navigation | ⚠️ Basique | 9 pages (emojis comme icônes, pas d'icônes SVG) |
| Page Home | ⚠️ Mock | Stats hardcodées, conversations mock |
| Page Messages | ⚠️ Mock | Split panel (liste + chat), 6 conversations mock, 2 bulles hardcodées |
| Pages Calls/Contacts/Social/etc. | 🔴 Placeholder | Texte "Bientôt disponible" uniquement |
| Design System | ⚠️ Partiel | Variables CSS ImuChat (dark theme), pas de composants réutilisables |
| Shared packages | ⚠️ Déclarés | `@imuchat/shared-types` et `@imuchat/ui-kit` dans dependencies mais non utilisés |
| TypeScript | ✅ Configuré | tsconfig strict mode |
| Preload script | ✅ Basique | IPC bridge exposé (send, invoke, on, off) |

### Ce qui manque complètement

- ❌ **Aucune intégration Supabase** (Auth, DB, Storage, Realtime)
- ❌ **Aucune intégration Socket.IO** (messagerie temps réel)
- ❌ **Aucune intégration Stream Video SDK** (appels audio/vidéo)
- ❌ **Aucun système de routing** (pas de React Router ni équivalent)
- ❌ **Aucun state management** (pas de Zustand, pas de React Query)
- ❌ **Aucun hook métier** (useAuth, useConversations, useMessages, etc.)
- ❌ **Aucun test** (pas de jest, vitest ou autre)
- ❌ **Aucune i18n** (pas de next-intl ni équivalent)
- ❌ **Aucune notification native** (Electron notifications API)
- ❌ **Aucun deep link** (protocole imuchat://)
- ❌ **Aucun auto-updater**
- ❌ **Aucun tray icon**

---

## 📅 Roadmap MVP Desktop (Semaines 9-12)

Selon le `MVP_ROADMAP_FEATURES.md`, le desktop devait couvrir :

### Semaine 9 : Desktop Base

| Feature | MVP attendu | Desktop | Web (référence) |
|---------|------------|---------|-----------------|
| **Auth System** | Login/Signup/Session | 🔴 Non implémenté | 🟢 Complet (Supabase + OAuth Google/Discord) |
| **Navigation** | Routing pages principales | 🟡 Basique (switch state) | 🟢 Complet (Next.js App Router, 40+ routes) |
| **Chat - Liste conversations** | Liste temps réel, unread, search | 🔴 Mock statique (6 items hardcodés) | 🟢 API REST + fallback mock |
| **Chat - Messages 1:1** | Envoi/réception temps réel | 🔴 Mock (2 bulles hardcodées) | 🟢 Socket.IO + API REST + pagination |
| **Chat - Médias** | Upload photos/vidéos | 🔴 Non implémenté | 🟢 Upload API + drag & drop + lightbox |
| **Profil utilisateur** | Voir/éditer profil | 🔴 Mock ("Nathan" hardcodé) | 🟢 CRUD Supabase + upload avatar |
| **Design System** | Composants desktop | 🟡 CSS custom basique | 🟢 shadcn/ui + Tailwind + 50+ composants |

### Semaine 10 : Desktop Video & Native

| Feature | MVP attendu | Desktop | Web (référence) |
|---------|------------|---------|-----------------|
| **Appels audio** | Appel 1-to-1 WebRTC | 🔴 Non implémenté | 🟡 Stream SDK intégré, incoming stub |
| **Appels vidéo** | Vidéo HD, mute, caméra | 🔴 Non implémenté | 🟡 Stream SDK intégré |
| **Partage d'écran** | Screen sharing natif | 🔴 Non implémenté | 🟡 Composant hub UI présent |
| **Messages vocaux** | Enregistrement + playback | 🔴 Non implémenté | 🟢 MediaRecorder + waveform + playback |
| **Réactions** | Emoji reactions sur messages | 🔴 Non implémenté | 🟢 Supabase Realtime |
| **Notifications natives** | Electron Notification API | 🔴 Non implémenté | 🟢 FCM + Service Worker + centre notifications |
| **Tray icon** | Icône barre système | 🔴 Non implémenté | N/A |

### Semaine 11 : Polish Multi-Platform

| Feature | MVP attendu | Desktop | Web (référence) |
|---------|------------|---------|-----------------|
| **Raccourcis clavier** | Cmd/Ctrl+K, Enter, Shift+Enter | 🔴 Non implémenté | 🟡 Enter send, cmdk installé non utilisé |
| **Thème clair/sombre** | Toggle + persistence | 🔴 Dark uniquement (pas de toggle) | 🟢 Thèmes multiples (5+ thèmes) |
| **Recherche globale** | Full-text messages + contacts | 🔴 Non implémenté | 🟡 Search dialog + command palette |
| **Mode hors-ligne** | Queue messages, retry | 🔴 Non implémenté | 🟡 Partiel |
| **Settings** | Compte, confidentialité, apparence | 🔴 Placeholder seulement | 🟢 6 onglets complets |
| **i18n** | FR, EN minimum | 🔴 Non implémenté (FR hardcodé) | 🟢 FR + EN + JA (next-intl) |

### Semaine 12 : Launch Preparation

| Feature | MVP attendu | Desktop | Web (référence) |
|---------|------------|---------|-----------------|
| **Auto-updater** | Mise à jour automatique | 🔴 Non implémenté | N/A |
| **Deep links** | Protocole imuchat:// | 🔴 Non implémenté | N/A |
| **Build cross-platform** | Mac DMG, Win NSIS, Linux AppImage | 🟡 Configuré (non testé) | N/A (Vercel) |
| **Tests** | Unit + integration | 🔴 Aucun test | 🟢 1186+ tests (281 mobile + 905 web) |
| **Onboarding** | Welcome flow | 🔴 Non implémenté | 🟢 3 slides animées + persistence |

---

## 📈 Comparaison Desktop vs Web — Feature par Feature

### Légende

- 🟢 Implémenté et fonctionnel
- 🟡 Partiellement implémenté / stubs / UI seulement
- 🔴 Non implémenté
- ⬜ Non applicable

```
Feature                    │ Desktop │ Web App │ Écart
───────────────────────────┼─────────┼─────────┼──────
Auth - Login email         │   🔴    │   🟢    │ CRIT
Auth - Signup              │   🔴    │   🟢    │ CRIT
Auth - OAuth (Google)      │   🔴    │   🟢    │ CRIT
Auth - Forgot Password     │   🔴    │   🟢    │ CRIT
Auth - Session persist     │   🔴    │   🟢    │ CRIT
Auth - Protected routes    │   🔴    │   🟢    │ CRIT
───────────────────────────┼─────────┼─────────┼──────
Profil - Voir              │   🔴    │   🟢    │ HIGH
Profil - Éditer            │   🔴    │   🟢    │ HIGH
Profil - Avatar upload     │   🔴    │   🟢    │ HIGH
───────────────────────────┼─────────┼─────────┼──────
Chat - Liste conversations │   🟡    │   🟢    │ HIGH
Chat - Messages texte      │   🟡    │   🟢    │ HIGH
Chat - Temps réel          │   🔴    │   🟢    │ CRIT
Chat - Envoi médias        │   🔴    │   🟢    │ HIGH
Chat - Messages vocaux     │   🔴    │   🟢    │ HIGH
Chat - Réactions           │   🔴    │   🟢    │ MED
Chat - Édition/Suppression │   🔴    │   🟡    │ MED
Chat - Emoji picker        │   🔴    │   🟢    │ LOW
Chat - GIF picker          │   🔴    │   🟢    │ LOW
Chat - Typing indicator    │   🔴    │   🟢    │ MED
Chat - Pagination          │   🔴    │   🟢    │ HIGH
───────────────────────────┼─────────┼─────────┼──────
Appels - Audio 1:1         │   🔴    │   🟡    │ HIGH
Appels - Vidéo HD          │   🔴    │   🟡    │ HIGH
Appels - Partage écran     │   🔴    │   🟡    │ MED
Appels - Historique        │   🔴    │   🟢    │ MED
───────────────────────────┼─────────┼─────────┼──────
Notifications - Centre     │   🔴    │   🟢    │ HIGH
Notifications - Push natif │   🔴    │   🟢    │ HIGH
Notifications - Badge      │   🟡    │   🟢    │ MED
───────────────────────────┼─────────┼─────────┼──────
Settings - Compte          │   🔴    │   🟢    │ HIGH
Settings - Apparence       │   🔴    │   🟢    │ MED
Settings - Confidentialité │   🔴    │   🟢    │ MED
Settings - Notifications   │   🔴    │   🟢    │ MED
Settings - Sécurité        │   🔴    │   🟡    │ MED
Settings - Données         │   🔴    │   🟢    │ LOW
───────────────────────────┼─────────┼─────────┼──────
Thèmes - Dark/Light        │   🟡    │   🟢    │ MED
i18n - Multi-langue        │   🔴    │   🟢    │ MED
Recherche - Messages       │   🔴    │   🟡    │ MED
Onboarding                 │   🔴    │   🟢    │ MED
───────────────────────────┼─────────┼─────────┼──────
Raccourcis clavier         │   🔴    │   🟡    │ MED
Tray icon                  │   🔴    │    ⬜   │ DESK
Auto-updater               │   🔴    │    ⬜   │ DESK
Deep links (imuchat://)    │   🔴    │    ⬜   │ DESK
───────────────────────────┼─────────┼─────────┼──────
Tests                      │   🔴    │   🟢    │ HIGH
```

---

## 🎯 Plan d'Action Recommandé

### Sprint 1 — Fondations (priorité 🔥 CRITIQUE)

> **Objectif** : Connecter la desktop-app au backend existant

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|----------|
| 1.1 | Installer et configurer Supabase client (`@supabase/supabase-js`) | 1h | 🔥 |
| 1.2 | Installer React Router pour la navigation (remplacer switch state) | 2h | 🔥 |
| 1.3 | Installer Zustand + React Query (state management) | 1h | 🔥 |
| 1.4 | Implémenter Auth (login/signup/session) — réutiliser la logique web | 4h | 🔥 |
| 1.5 | Protéger les routes (redirect si non-authentifié) | 1h | 🔥 |
| 1.6 | Configurer `.env` avec les clés Supabase | 0.5h | 🔥 |

**Estimation Sprint 1** : ~10h

### Sprint 2 — Messagerie Core

> **Objectif** : Chat fonctionnel avec temps réel

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|----------|
| 2.1 | Implémenter `useConversations` (port depuis web-app) | 3h | 🔥 |
| 2.2 | Implémenter `useMessages` avec Socket.IO | 4h | 🔥 |
| 2.3 | Connecter la conversation list au backend | 2h | 🔥 |
| 2.4 | Connecter le chat room au backend (envoi/réception temps réel) | 4h | 🔥 |
| 2.5 | Implémenter l'upload médias | 3h | 🟡 |
| 2.6 | Implémenter le voice recorder | 3h | 🟡 |
| 2.7 | Implémenter les réactions | 2h | 🟡 |
| 2.8 | Typing indicator | 1h | 🟡 |

**Estimation Sprint 2** : ~22h

### Sprint 3 — Profil & Settings

> **Objectif** : Gestion utilisateur complète

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|----------|
| 3.1 | Page profil avec données Supabase | 3h | 🟡 |
| 3.2 | Édition profil + upload avatar | 2h | 🟡 |
| 3.3 | Settings — Compte (email, password) | 3h | 🟡 |
| 3.4 | Settings — Apparence (thème light/dark) | 2h | 🟡 |
| 3.5 | Settings — Notifications | 1h | 🟡 |

**Estimation Sprint 3** : ~11h

### Sprint 4 — Appels & Natif

> **Objectif** : Appels vidéo + fonctionnalités desktop natives

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|----------|
| 4.1 | Intégrer Stream Video SDK | 6h | 🟡 |
| 4.2 | Appels audio 1:1 | 4h | 🟡 |
| 4.3 | Appels vidéo HD | 4h | 🟡 |
| 4.4 | Partage d'écran (Electron `desktopCapturer`) | 3h | 🟡 |
| 4.5 | Notifications natives Electron | 2h | 🟡 |
| 4.6 | Tray icon + badge | 2h | 🟢 |
| 4.7 | Deep links (imuchat://) | 2h | 🟢 |
| 4.8 | Auto-updater (electron-updater) | 3h | 🟢 |

**Estimation Sprint 4** : ~26h

### Sprint 5 — Polish & Launch

> **Objectif** : Parité fonctionnelle et qualité

| # | Tâche | Estimation | Priorité |
|---|-------|-----------|----------|
| 5.1 | i18n (FR + EN minimum) | 3h | 🟡 |
| 5.2 | Raccourcis clavier globaux | 2h | 🟡 |
| 5.3 | Onboarding desktop | 2h | 🟢 |
| 5.4 | Recherche globale | 3h | 🟢 |
| 5.5 | Tests unitaires (features critiques) | 6h | 🟡 |
| 5.6 | Build & test cross-platform (Mac/Win/Linux) | 4h | 🔥 |
| 5.7 | Personnaliser electron-builder (appId, productName, icônes) | 1h | 🟡 |

**Estimation Sprint 5** : ~21h

---

## ⏱️ Estimation Totale

| Sprint | Heures | Priorité |
|--------|--------|----------|
| Sprint 1 — Fondations | ~10h | 🔥 Critique |
| Sprint 2 — Messagerie | ~22h | 🔥 Critique |
| Sprint 3 — Profil & Settings | ~11h | 🟡 Important |
| Sprint 4 — Appels & Natif | ~26h | 🟡 Important |
| Sprint 5 — Polish & Launch | ~21h | 🟡 Important |
| **Total** | **~90h** | |

---

## 🔄 Stratégie de Code Sharing avec Web App

### Hooks réutilisables depuis la web-app

Les hooks suivants de la web-app peuvent être portés/adaptés pour le desktop avec peu de modifications :

| Hook Web | Réutilisable Desktop | Adaptation nécessaire |
|----------|---------------------|----------------------|
| `useAuth` | ✅ Oui | Remplacer cookies SSR par localStorage |
| `useConversations` | ✅ Oui | Aucune (même API) |
| `useMessages` | ✅ Oui | Aucune (même Socket.IO) |
| `useProfile` | ✅ Oui | Aucune (même Supabase) |
| `useCalls` | ✅ Oui | Ajouter `desktopCapturer` pour screen share |
| `useReactions` | ✅ Oui | Aucune (même Supabase Realtime) |
| `useVoiceRecorder` | ✅ Oui | Aucune (même MediaRecorder API) |
| `useMediaUpload` | ✅ Oui | Ajouter support drag & drop fichiers système |
| `useSocket` | ✅ Oui | Aucune |
| `useTypingIndicator` | ✅ Oui | Aucune |
| `useOnboarding` | ✅ Oui | Adapter localStorage → electron-store |
| `useKeyboardShortcuts` | 🟡 Partiel | Adapter pour raccourcis globaux Electron |
| `usePushNotifications` | 🔴 Non | Remplacer par Electron Notification API |

### Composants UI réutilisables

> **Recommandation** : Extraire les composants communs dans `@imuchat/ui-kit` pour maximiser le partage.

| Composant Web | Réutilisable | Notes |
|---------------|-------------|-------|
| `MessageBubble` | 🟡 Adapter | Même logique, adapter le styling |
| `ConversationItem` | 🟡 Adapter | Même structure |
| `VoicePlayer` | ✅ Oui | Composant web standard |
| `EmojiPicker` | ✅ Oui | Même librairie |
| `MediaPreview` | ✅ Oui | Lightbox standard |
| `ReactionPicker` | ✅ Oui | Même composant |

---

## 📋 Fichiers Clés de la Desktop App

```
desktop-app/
├── electron/
│   ├── main.ts              ← Process principal (fenêtre, lifecycle)
│   ├── preload.ts           ← Bridge IPC (send, invoke, on, off)
│   └── electron-env.d.ts    ← Types Electron
├── src/
│   ├── main.tsx             ← Point d'entrée React
│   ├── App.tsx              ← Shell complet (320 lignes, tout dans 1 fichier)
│   ├── App.css              ← Styles (603 lignes)
│   └── index.css            ← Variables CSS globales (73 lignes)
├── electron-builder.json5    ← Config build (Mac/Win/Linux)
├── vite.config.ts            ← Config Vite + plugin Electron
├── package.json              ← Dependencies (Electron 30, React 18, Vite 5)
└── tsconfig.json             ← TypeScript strict
```

**Problème structurel** : Tout le code UI est dans un seul fichier `App.tsx` (320 lignes). Il faudra refactorer en composants séparés dès le Sprint 1.

---

## 🚨 Risques Identifiés

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Pas de tests → régressions | 🔴 Élevé | Haute | Ajouter tests dès Sprint 2 |
| electron-builder config non testée | 🟡 Moyen | Moyenne | Tester build dès Sprint 1 |
| Stream Video SDK non testé sur Electron | 🟡 Moyen | Moyenne | PoC dès Sprint 3 |
| Performance Electron (mémoire) | 🟡 Moyen | Faible | Profiling régulier |
| `@imuchat/ui-kit` non utilisé | 🟡 Moyen | Haute | Intégrer ou supprimer la dépendance |
| Code monolithique (App.tsx 320L) | 🟡 Moyen | Certaine | Refactorer en composants |

---

## ✅ Checklist Pré-Lancement Desktop

- [ ] Auth fonctionnel (login/signup/logout)
- [ ] Session persistante (auto-login)
- [ ] Chat 1:1 temps réel (envoi/réception)
- [ ] Upload médias (photos minimum)
- [ ] Messages vocaux (enregistrement + playback)
- [ ] Réactions emoji
- [ ] Profil utilisateur (voir + éditer)
- [ ] Appels audio fonctionnels
- [ ] Appels vidéo fonctionnels
- [ ] Partage d'écran
- [ ] Notifications natives
- [ ] Tray icon avec badge
- [ ] Thème dark/light
- [ ] i18n (FR + EN)
- [ ] Settings basiques
- [ ] Raccourcis clavier
- [ ] Build Mac (.dmg) testé
- [ ] Build Windows (.exe) testé
- [ ] Build Linux (.AppImage) testé
- [ ] Auto-updater configuré
- [ ] Tests unitaires critiques
- [ ] Deep links (imuchat://)

---

*Document créé le 21 février 2026 — Réf. MVP_ROADMAP_FEATURES.md, Phase 2 (Semaines 9-12)*
