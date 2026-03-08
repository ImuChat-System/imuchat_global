# 🔍 ANALYSE D'ÉCART — Desktop App vs Web App ImuChat

**Date :** 8 mars 2026  
**Objectif :** Identifier précisément ce qui manque à la desktop-app par rapport à la web-app  
**Référence :** `50_FONCTIONNALITIES_SCREENS.md`, web-app état actuel

---

## 📊 Vue d'ensemble

| Dimension | Web App | Desktop App | Écart |
|-----------|:-------:|:-----------:|:-----:|
| **Progression globale** | ~75% | ~5% | 🔴 70% |
| **Pages/Routes** | 143 | 2 (Home, Messages) | 🔴 141 |
| **Composants** | 447 | 3 (App, HomePage, MessagesPage) | 🔴 444 |
| **Services API** | 60+ | 0 | 🔴 60+ |
| **Hooks** | 53 | 0 | 🔴 53 |
| **Contextes/Stores** | 17 | 0 | 🔴 17 |
| **Modules** | 12 | 0 | 🔴 12 |
| **i18n** | 3 langues (en/fr/ja) | ❌ aucune | 🔴 |
| **Tests** | Jest + Playwright | ❌ aucun | 🔴 |
| **Storybook** | ❌ | ❌ | — |
| **UI Kit intégré** | ✅ partiel | ❌ aucun | 🔴 |
| **Shared Types** | ✅ | ❌ déclaré uniquement | 🔴 |
| **Platform Core** | ✅ partiel | ❌ déclaré uniquement | 🔴 |
| **Supabase** | ✅ Auth + DB + Realtime | ❌ dépendance seule | 🔴 |
| **Socket.IO** | ✅ messaging + presence | ❌ dépendance seule | 🔴 |
| **Routage** | Next.js App Router | ❌ react-router installé, non utilisé | 🔴 |
| **State** | React Context | ❌ zustand installé, non utilisé | 🔴 |

---

## 🏗️ État actuel de la Desktop App (détail)

### Ce qui EXISTE (✅)
- Configuration Electron 30 + Vite + React 18 + TypeScript
- `electron-builder.json5` (build multi-OS, mais AppID non configuré)
- Shell UI complet avec sidebar de navigation (emoji icons)
- Page Home avec statistiques mock + conversations récentes mock
- Page Messages avec split-panel (liste conversations + zone chat)
- Placeholder pages pour : Calls, Contacts, Social, Notifications, Watch, Store, Settings
- CSS custom complet (dark theme, palette ImuChat)
- Dépendances installées : `@imuchat/shared-types`, `@imuchat/ui-kit`, `@supabase/supabase-js`, `@tanstack/react-query`, `react-router-dom`, `zustand`, `socket.io-client`, `framer-motion`, `lucide-react`
- IPC bridge basic (preload.ts avec `ipcRenderer`)

### Ce qui MANQUE (🔴)

#### Infrastructure critique
- [ ] **Routing** — `react-router-dom` installé mais aucune route définie
- [ ] **State management** — `zustand` installé mais aucun store créé
- [ ] **Supabase client** — dépendance installée, pas de configuration
- [ ] **Socket.IO client** — dépendance installée, pas de connexion
- [ ] **React Query** — installé, pas de QueryClient provider
- [ ] **Tailwind CSS** — installé (v4) mais non configuré dans les composants
- [ ] **Variables d'environnement** — aucun `.env` ni `.env.example`
- [ ] **Alias de chemins** — pas de `@/` alias dans tsconfig

#### Intégrations packages partagés
- [ ] **UI Kit** — Aucun composant du ui-kit utilisé (80+ composants disponibles : Button, Input, Avatar, ChatBubble, etc.)
- [ ] **Shared Types** — Aucun type importé (User, ChatMessage, Server, etc.)
- [ ] **Platform Core** — Aucun module utilisé (AuthModule, ChatEngine, etc.)
- [ ] **Thèmes** — 7 thèmes disponibles dans ui-kit mais non intégrés
- [ ] **Tokens design** — Palette de couleurs du ui-kit non utilisée

#### Fonctionnalités métier
- [ ] **Authentification** — Aucun flux (login, signup, OTP, OAuth)
- [ ] **Chat réel** — Messages mockés, pas de Supabase/Socket.IO
- [ ] **Contacts** — Page placeholder vide
- [ ] **Appels** — Page placeholder vide (Stream.io non intégré)
- [ ] **Notifications** — Aucune (ni in-app, ni Electron natives)
- [ ] **Profil utilisateur** — Aucun
- [ ] **Paramètres** — Page placeholder vide
- [ ] **Stories** — Absent
- [ ] **Store/Modules** — Absent
- [ ] **Personnalisation** — Absent
- [ ] **Gamification** — Absent

#### Desktop natif (Electron)
- [ ] **Auto-updater** — Non configuré
- [ ] **Deep links** — Non configuré
- [ ] **Notifications natives** — Non implémenté
- [ ] **Tray icon** — Non implémenté
- [ ] **Menu natif** — Menu Electron par défaut
- [ ] **Raccourcis clavier globaux** — Absents
- [ ] **Fenêtre multiple** — Non supporté
- [ ] **Mode picture-in-picture** — Non implémenté
- [ ] **Screen sharing** — Non implémenté

#### Qualité
- [ ] **Internationalisation** — Aucune (textes en dur en français)
- [ ] **Tests** — Aucun (ni unitaires, ni E2E)
- [ ] **Linting** — `.eslintrc.cjs` présent mais basique
- [ ] **Accessibilité** — Non prise en compte
- [ ] **Performance** — Pas de lazy loading, pas de code splitting

---

## 🗺️ Mapping 50 Fonctionnalités → État Desktop

### Groupe 1 — Messagerie & Communication
| Fonctionnalité | Web | Desktop | Gap |
|----------------|:---:|:-------:|:---:|
| Chat principal (liste conversations) | ✅ | 🟡 mock | Intégrer Supabase + Socket.IO |
| Conversation 1:1 / Groupe | ✅ | 🟡 mock | Chat réel + types |
| Messages vocaux | ✅ | ❌ | Audio API + upload |
| Options message (modifier, supprimer, réagir) | ✅ | ❌ | Actions sur messages |
| Recherche conversations | ✅ | 🟡 UI seule | Service de recherche |

### Groupe 2 — Appels audio/vidéo
| Fonctionnalité | Web | Desktop | Gap |
|----------------|:---:|:-------:|:---:|
| Appel audio 1:1 | ✅ | ❌ | Stream.io/WebRTC |
| Appel vidéo HD | ✅ | ❌ | Stream.io + Electron |
| Picture-in-Picture | ✅ | ❌ | Fenêtre Electron flottante |
| Screen sharing | ✅ | ❌ | desktopCapturer Electron |
| Filtres caméra | ✅ | ❌ | Canvas API + ML |

### Groupe 3 — Profils & Identité
| Fonctionnalité | Web | Desktop | Gap |
|----------------|:---:|:-------:|:---:|
| Page profil | ✅ | ❌ | Composant profil |
| Multi-profils | ✅ | ❌ | Switch context |
| Avatar 2D/3D | ✅ | ❌ | Avatar provider |
| Statuts personnalisés | ✅ | ❌ | Presence module |
| Vérification de compte | ✅ | ❌ | Flux vérification |

### Groupe 4 — Personnalisation avancée
| Fonctionnalité | Web | Desktop | Gap |
|----------------|:---:|:-------:|:---:|
| Thèmes (7 intégrés) | ✅ | ❌ | Intégrer ThemeProvider ui-kit |
| Arrière-plans chat | ✅ | ❌ | Chat backgrounds |
| Polices personnalisées | ✅ | ❌ | Font settings |
| Packs de personnalisation | ✅ | ❌ | Store integration |
| Widget sidebar | ✅ | ❌ | Desktop-only widgets |

### Groupe 5 — Mini-apps sociales
| Fonctionnalité | Web | Desktop | Gap |
|----------------|:---:|:-------:|:---:|
| Stories | ✅ | ❌ | Stories module entier |
| Mur social / Feed | ✅ | ❌ | Feed composants |
| Mini-blog | ✅ | ❌ | Blog module |
| Événements | ✅ | ❌ | Events module |
| Groupes / Communautés | ✅ | ❌ | Server/Channel system |

### Groupes 6-10 — Modules avancés, Utilitaires, Divertissement, IA, Store
| Catégorie | Web | Desktop | Note |
|-----------|:---:|:-------:|:-----|
| Office suite | ✅ | ❌ | Post-MVP |
| Services utilitaires | 🟡 | ❌ | Post-MVP |
| Divertissement | 🟡 | ❌ | Post-MVP |
| IA / Alice | ✅ | ❌ | Post-MVP |
| Store & Marketplace | ✅ | ❌ | Post-MVP |

---

## 📐 Patterns Web-app à reproduire côté Desktop

### 1. Architecture modulaire
```
desktop-app/src/
├── app/                    # Routes (react-router-dom)
├── components/             # Composants réutilisables
│   ├── ui/                 # Wrappers ui-kit
│   ├── chat/               # Chat spécifiques
│   ├── layout/             # Layout (Sidebar, Header, etc.)
│   └── shared/             # Partagés
├── contexts/               # React Context providers
├── hooks/                  # Custom hooks
├── services/               # API services (Supabase, Socket.IO)
├── stores/                 # Zustand stores
├── modules/                # Modules dynamiques
│   ├── chat/
│   ├── calls/
│   ├── contacts/
│   └── ...
├── lib/                    # Utilitaires (supabase client, api client)
├── i18n/                   # Internationalisation
│   ├── locales/
│   │   ├── en.json
│   │   ├── fr.json
│   │   └── ja.json
│   └── index.ts
├── electron/               # Electron-specific (déjà existant)
└── assets/                 # Assets (déjà existant)
```

### 2. Pattern Service → Hook → Component
```
Service (supabase/api) → Hook (useXxx) → Component (réactif)
```

### 3. State Management (Zustand + Context)
- **Zustand** pour l'état global (auth, user, preferences) — déjà installé
- **React Context** pour les providers (Theme, Auth, Socket)
- **React Query** pour le cache API — déjà installé

### 4. Internationalisation
- Web-app utilise `next-intl` (spécifique Next.js)
- Desktop-app devrait utiliser `react-intl` ou `i18next` + `react-i18next` (compatible React SPA)
- Même structure de fichiers locales (en.json, fr.json, ja.json)
- Pattern `useTranslations('Namespace')`

---

## 🎯 Priorités de rattrapage (MVP Desktop)

### P0 — Critique (Semaines 1-4)
1. Architecture de base (routing, stores, providers)
2. Configuration Supabase + variables d'environnement
3. Authentification complète (login, signup, session)
4. Intégration ui-kit + shared-types + thèmes
5. Internationalisation (i18next + 3 langues)

### P1 — Core (Semaines 5-10)
6. Chat réel (Supabase + Socket.IO + ChatEngine platform-core)
7. Contacts (liste, recherche, ajout, gestion)
8. Profil utilisateur + paramètres
9. Notifications (in-app + Electron natives)
10. Thèmes dynamiques (7 thèmes ui-kit)

### P2 — Communication (Semaines 11-16)
11. Appels audio/vidéo (WebRTC/Stream.io)
12. Screen sharing (desktopCapturer)
13. Picture-in-Picture (fenêtre Electron)
14. Présence en temps réel 

### P3 — Social & Features (Semaines 17-24)
15. Stories
16. Feed social
17. Communautés / Serveurs
18. Store & modules dynamiques
19. Gamification

### P4 — Post-MVP (au-delà)
20. Office suite
21. IA / Alice / Companion
22. Services utilitaires
23. Divertissement

---

## 📋 Métriques de rattrapage

| Métrique | Cible MVP | Cible Full |
|----------|:---------:|:----------:|
| Pages/Routes | 15-20 | 50+ |
| Composants | 40-60 | 150+ |
| Services | 10-15 | 30+ |
| Hooks | 15-20 | 35+ |
| Tests | 50+ | 200+ |
| Couverture code | >60% | >80% |
| Langues i18n | 3 (en/fr/ja) | 5+ |
| Thèmes | 7 | 10+ |

---

*Document généré automatiquement — 8 mars 2026*
*Sources : analyse web-app, desktop-app, 50_FONCTIONNALITIES_SCREENS.md, roadmaps desktop*
