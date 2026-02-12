# 🚀 MVP ImuChat - Vision Multi-Plateformes

> MVP Structuré Mobile, Web & Desktop - Février 2026

---

## 📋 Table des Matières

1. [Vision & Objectifs](#vision--objectifs)
2. [Stratégie Multi-Plateformes](#stratégie-multi-plateformes)
3. [Périmètre Fonctionnel MVP](#périmètre-fonctionnel-mvp)
4. [Architecture & Stack Technique](#architecture--stack-technique)
5. [Roadmap de Développement](#roadmap-de-développement)
6. [Critères de Succès](#critères-de-succès)
7. [Post-MVP & V2](#post-mvp--v2)

---

## 🎯 Vision & Objectifs

### Vision Produit MVP

**ImuChat MVP** = Messagerie sécurisée et performante avec **identité utilisateur forte** et **communication fluide** (texte, voix, vidéo), disponible sur **mobile, web et desktop**.

L'objectif est de poser les **fondations solides** d'une super-application européenne, en commençant par le cœur de l'expérience : **la communication**.

### Principes Directeurs

1. **Privacy-First** : Chiffrement de bout en bout, RGPD natif
2. **Performance** : Latence < 1s pour 90% des messages
3. **Stabilité** : Zero crash en production sur flows critiques
4. **Multi-plateforme** : Une expérience cohérente mobile/web/desktop
5. **Scalabilité** : Architecture préparée pour 10K+ utilisateurs

### Positionnement MVP

```
Simple Messagerie ←→ MVP ImuChat ←→ Super-App Complète
(WhatsApp Basic)     (Phase 1)        (Vision 2027)
```

**MVP ImuChat** = Messagerie robuste **+** Profils riches **+** Appels audio/vidéo **+** Base modulaire

---

## 🌐 Stratégie Multi-Plateformes

### Priorités de Développement

| Plateforme | Priorité | Justification | Lancement |
|------------|----------|---------------|-----------|
| **Mobile** | 🔥 P0 | 60% usage, expérience native critique | Semaine 1 |
| **Web** | 🔥 P0 | Accessibilité universelle, onboarding facile | Semaine 1 |
| **Desktop** | 🟡 P1 | Confort utilisateurs power (pros, créateurs) | Semaine 4 |

### Approche Développement

**Phase 1 (Semaines 1-8)** : Mobile + Web en parallèle  
**Phase 2 (Semaines 9-12)** : Desktop + Polish multi-plateforme

### Parité Fonctionnelle

| Fonctionnalité | Mobile | Web | Desktop | Note |
|----------------|--------|-----|---------|------|
| Messagerie texte | ✅ | ✅ | ✅ | Parité complète |
| Appels audio/vidéo | ✅ | ✅ | ✅ | Qualité optimale desktop |
| Notifications push | ✅ | ✅ | ✅ | Native mobile, Service Worker web |
| Caméra/Galerie | ✅ | ✅* | ❌ | *Webcam web, upload fichiers desktop |
| Mode hors-ligne | ✅ | 🟡 | 🟡 | Priorité mobile |
| Raccourcis clavier | ❌ | ✅ | ✅ | Desktop/Web uniquement |

---

## 📦 Périmètre Fonctionnel MVP

### Structure par Groupes (sur 50 Fonctionnalités)

Sur les **50 fonctionnalités** identifiées (voir FUNCTIONNALITIES_LIST.md), le MVP se concentre sur **15 essentielles** réparties en **3 groupes prioritaires**.

---

### 🔥 Groupe 1 : Messagerie & Communication (5/5)

**Objectif** : Communication instantanée fiable et rapide

#### ✅ Inclus dans MVP

1. **Messagerie instantanée**
   - Envoi/réception texte temps réel
   - Support emojis natifs
   - GIFs via intégration GIPHY
   - Indicateur "en train d'écrire..."
   - Accusés de lecture (double check)

2. **Messages vocaux**
   - Enregistrement audio (max 2min)
   - Lecture in-app avec waveform
   - Transcription automatique (IA, optionnelle)

3. **Pièces jointes**
   - Photos (caméra/galerie)
   - Vidéos (max 100MB)
   - Fichiers documents (PDF, DOCX, max 50MB)
   - Preview dans chat

4. **Édition et suppression messages**
   - Edit dans les 15min après envoi
   - Soft delete (marqué comme supprimé)
   - Historique éditions visible

5. **Réactions rapides**
   - 6 emojis rapides (❤️ 👍 😂 😮 😢 🙏)
   - Tap-hold sur message
   - Compteur réactions

**Critères d'Acceptation** :

- ✅ Latence envoi message < 500ms (90% cas)
- ✅ Messages persistent après redémarrage app
- ✅ Ordre chronologique garanti
- ✅ Retry automatique en cas d'échec réseau

---

### 🔥 Groupe 2 : Appels Audio & Vidéo (4/5)

**Objectif** : Communication vocale/vidéo de qualité professionnelle

#### ✅ Inclus dans MVP

1. **Appels audio 1-to-1**
   - Connexion P2P (WebRTC)
   - Qualité adaptative selon réseau
   - Mute/Unmute
   - Speaker/Bluetooth audio routing
   - Durée max : illimitée

2. **Appels vidéo HD**
   - Résolution adaptative (360p-1080p)
   - Bascule caméra avant/arrière (mobile)
   - Désactivation vidéo (audio only)
   - Réduction bruit IA

3. **Mini-fenêtre flottante (PiP)**
   - Picture-in-Picture native
   - Repositionnable
   - Réduction automatique lors du multitâche

4. **Partage d'écran**
   - Mobile : capture d'écran + partage (Android)
   - Web/Desktop : Partage fenêtre/écran complet
   - Qualité 720p@15fps

**❌ Exclu du MVP** (Post-V1)

- Filtres beauté IA
- Flou d'arrière-plan
- Appels groupe (>2 personnes)

**Critères d'Acceptation** :

- ✅ Appel établi en < 3s
- ✅ Qualité audio : MOS > 4.0
- ✅ Notifications appel entrant même app fermée (CallKit/ConnectionService)
- ✅ Reconnexion automatique si déconnexion < 5s

---

### 🔥 Groupe 3 : Profils & Identité (5/5)

**Objectif** : Identité numérique riche et sécurisée

#### ✅ Inclus dans MVP

1. **Profils privés/publics**
   - Profil par défaut : privé (visible contacts seulement)
   - Toggle public (mode découverte)
   - Profil anonyme (pseudonyme, pas de photo)

2. **Multi-profils**
   - 2 profils maximum MVP (perso + pro)
   - Switch rapide depuis settings
   - Conversations séparées par profil

3. **Avatars personnalisables**
   - Upload photo (jpg/png, max 5MB)
   - Crop & resize automatique
   - Avatars par défaut colorés (initiales)
   - Génération avatar 2D style (optionnel)

4. **Statuts animés**
   - Statut texte (max 100 caractères)
   - Emoji mood (😊 😴 🔥 💼 🎮)
   - Statut musique (Spotify/Apple Music integration, V1.1)
   - Durée : permanent ou 24h

5. **Vérification identité**
   - Badge "Compte Vérifié" (bleu)
   - Process manuel (admin approval)
   - Critères : Identité vérifiée (ID) + Email confirmé
   - Optionnel, sur demande

**Critères d'Acceptation** :

- ✅ Changement profil instantané (< 200ms)
- ✅ Avatar affiché partout (chat, liste contacts, appels)
- ✅ Statut visible en temps réel (WebSocket)

---

### 🟡 Groupe Bonus : Fonctionnalités Critiques Transverses

#### Sécurité & Privacy

1. **Chiffrement E2E** (End-to-End Encryption)
   - Messages texte : Signal Protocol
   - Médias : Encrypted upload/download
   - Appels : DTLS-SRTP (WebRTC natif)

2. **Authentification robuste**
   - Email + Password (hash bcrypt)
   - OAuth : Google, Apple
   - 2FA (TOTP via Google Authenticator)
   - Gestion sessions multiples

3. **Gestion contacts & blocage**
   - Import contacts (opt-in)
   - Recherche utilisateurs
   - Bloquer/Signaler utilisateur
   - Demandes d'ajout contact (si profil privé)

#### UX & Expérience

1. **Notifications intelligentes**
   - Push natives (FCM/APNs)
   - Actions rapides (répondre, marquer lu)
   - Grouping conversations
   - Silent mode / Do Not Disturb

2. **Thèmes & Personnalisation**
    - Thème Clair / Sombre
    - 3 thèmes prédéfinis (Classic, Kawaii, Pro)
    - Taille police ajustable
    - Sauvegarde prefs cloud

#### Technique & Performance

1. **Mode hors-ligne**
    - Queue messages envoi (retry)
    - Cache conversations récentes
    - Sync automatique reconnexion

2. **Recherche conversations**
    - Recherche full-text messages
    - Filtres : contact, date, type média
    - Index local (SQLite mobile)

3. **Paramètres & Préférences**
    - Langue (FR, EN, DE, ES)
    - Notifications granulaires
    - Storage management
    - Export données (RGPD)

4. **Onboarding fluide**
    - Welcome screens (3 slides)
    - Tutoriel interactif
    - Setup profil guidé
    - Skip option

5. **Analytics & Monitoring**
    - Tracking événements clés (opt-in)
    - Crash reporting (Sentry)
    - Performance monitoring
    - Privacy-first (anonymisé)

---

## 🏗️ Architecture & Stack Technique

### Vue d'Ensemble Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Clients Multi-Plateformes                │
├──────────────────┬──────────────────┬──────────────────────┤
│   📱 Mobile      │   🌐 Web App     │   🖥️ Desktop        │
│   React Native   │   Next.js 14     │   Electron + React   │
│   (Expo)         │   (App Router)   │   (Vite)             │
└────────┬─────────┴────────┬─────────┴──────────┬───────────┘
         │                  │                     │
         └──────────────────┼─────────────────────┘
                            │
                    ┌───────▼────────┐
                    │   API Gateway  │
                    │   (Next.js API)│
                    └───────┬────────┘
                            │
         ┏━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━┓
         ▼                                      ▼
┌────────────────────┐              ┌──────────────────────┐
│  Supabase Stack    │              │  Stream SDK          │
├────────────────────┤              ├──────────────────────┤
│ • Auth             │              │ • Video Calling      │
│ • PostgreSQL       │              │ • WebRTC Signaling   │
│ • Realtime         │              │ • Recording (opt)    │
│ • Storage          │              └──────────────────────┘
│ • Edge Functions   │
└────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────┐
│                    Services Externes                       │
├────────────────────┬────────────────────┬──────────────────┤
│  Firebase Cloud    │   Redis (Cache)    │   S3 (Médias)   │
│  Messaging (Push)  │   Upstash/Vercel   │   Cloudflare R2  │
└────────────────────┴────────────────────┴──────────────────┘
```

---

### Stack Détaillé par Plateforme

#### 📱 Mobile (React Native / Expo)

**Framework** : Expo SDK 52 + React Native 0.76
**Navigation** : Expo Router (file-based)
**State Management** : Zustand + React Query
**UI Library** : React Native Paper + Custom components
**Database Locale** : SQLite (expo-sqlite)
**Realtime** : Supabase Realtime Client
**Video Calls** : @stream-io/video-react-native-sdk
**Push Notifications** : expo-notifications + FCM/APNs
**Styling** : StyleSheet + Tailwind RN (NativeWind)

**Dépendances Clés** :

```json
{
  "@supabase/supabase-js": "^2.45.0",
  "@react-native-async-storage/async-storage": "^1.23.0",
  "@stream-io/video-react-native-sdk": "^1.6.0",
  "expo-image-picker": "~15.0.0",
  "expo-av": "~14.0.0",
  "react-native-gifted-chat": "^2.6.0",
  "zustand": "^4.5.0",
  "@tanstack/react-query": "^5.51.0"
}
```

---

#### 🌐 Web App (Next.js)

**Framework** : Next.js 14 (App Router)
**Language** : TypeScript 5
**State Management** : Zustand + React Query
**UI Framework** : Tailwind CSS + shadcn/ui
**Database** : Supabase PostgreSQL
**Realtime** : Supabase Realtime + WebSocket
**Video Calls** : @stream-io/video-react-sdk
**Push Notifications** : Service Worker + Web Push API
**Deployment** : Vercel (Edge Functions)

**Dépendances Clés** :

```json
{
  "next": "14.2.5",
  "@supabase/ssr": "^0.5.0",
  "@stream-io/video-react-sdk": "^1.6.0",
  "framer-motion": "^12.34.0",
  "react-hook-form": "^7.53.0",
  "zod": "^3.23.0",
  "@tanstack/react-query": "^5.51.0",
  "lucide-react": "^0.555.0"
}
```

---

#### 🖥️ Desktop (Electron)

**Framework** : Electron 32 + Vite + React
**Rendering** : Chromium (latest)
**UI** : Shared components avec Web App
**IPC** : Electron IPC (main ↔ renderer)
**Native Integrations** :

- Tray icon & notifications natives
- Deep links (imuchat://)
- Auto-updater
- Keychain/Credential Manager

**Dépendances Clés** :

```json
{
  "electron": "^32.0.0",
  "electron-builder": "^25.0.0",
  "vite": "^5.4.0",
  "react": "^18.3.0"
}
```

---

### Backend & Infrastructure

#### Supabase Stack

**Auth** :

- Email/Password (bcrypt)
- OAuth (Google, Apple)
- JWT tokens + refresh
- RLS (Row Level Security) policies

**Database** (PostgreSQL 15) :

```sql
-- Tables principales MVP
users (id, email, username, avatar_url, created_at)
profiles (user_id, display_name, bio, status, theme_prefs)
conversations (id, type, created_at)
conversation_members (conversation_id, user_id, role)
messages (id, conversation_id, sender_id, content, type, created_at)
message_reactions (message_id, user_id, emoji)
contacts (user_id, contact_id, status, created_at)
call_logs (id, caller_id, callee_id, start_time, duration, type)
```

**Realtime** :

- WebSocket subscriptions par conversation
- Broadcast typing indicators
- Presence tracking (online/offline)

**Storage** :

- Bucket `avatars` (public)
- Bucket `messages-media` (private, signed URLs)
- Bucket `voice-notes` (private)

**Edge Functions** :

- Transcription audio (Whisper API)
- Image resize/optimize
- Notification sender
- Webhook handlers

---

#### Stream Video SDK

**Configuration** :

- API Key + Secret (env vars)
- Region : EU (RGPD compliance)
- Features activées :
  - Audio/Video 1:1 calls
  - Screen sharing
  - Recording (opt-in)
  - Picture-in-Picture

**Pricing** : Free tier (10K mins/month) puis $0.004/min

---

#### Services Complémentaires

**Firebase Cloud Messaging** :

- Push notifications cross-platform
- Topics & targeting
- Analytics intégré

**Cloudflare R2** (optionnel, alternative S3) :

- Stockage médias lourd
- CDN intégré
- Coût : $0.015/GB

**Sentry** :

- Error tracking & monitoring
- Performance tracking
- Release health

**Posthog** (Analytics) :

- Product analytics privacy-first
- Feature flags
- Session replays (opt-in)

---

## 📅 Roadmap de Développement

### Vue d'Ensemble Timeline

```
┌────────┬────────┬────────┬────────┬────────┬────────┬────────┬────────┬────────┬────────┬────────┬────────┐
│ Sem 1  │ Sem 2  │ Sem 3  │ Sem 4  │ Sem 5  │ Sem 6  │ Sem 7  │ Sem 8  │ Sem 9  │ Sem 10 │ Sem 11 │ Sem 12 │
├────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┤
│                           PHASE 1 : MOBILE + WEB                      │     PHASE 2 : DESKTOP + POLISH    │
├────────┬────────┬────────┬────────┬────────┬────────┬────────┬────────┼────────┬────────┬────────┬────────┤
│ Setup  │  Auth  │  Chat  │  Chat  │ Calls  │ Calls  │ Polish │  Beta  │Desktop │Desktop │ Polish │ Launch │
│  +     │   +    │  Base  │  Rich  │ Audio  │ Video  │   +    │ Mobile │  Base  │ Video  │  Full  │   🚀   │
│ Design │Profile │        │        │        │        │  Test  │   Web  │        │        │        │        │
└────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┘
```

**Durée totale MVP** : 12 semaines (3 mois)

---

### 📅 Phase 1 : Mobile + Web (8 semaines)

#### Semaine 1 : Fondations & Design System

**Mobile** :

- [x] Setup projet Expo (SDK 52)
- [x] Configuration Supabase client
- [x] Design tokens & theme system
- [ ] Navigation routes setup
- [ ] Composants UI de base (Button, Input, Avatar)

**Web** :

- [x] Setup Next.js 14 projet
- [x] Configuration Tailwind + shadcn/ui
- [x] Supabase SSR setup
- [ ] Layout principal + Navigation
- [ ] Composants UI base

**Livrables** :

- ✅ Design system cohérent mobile/web
- ✅ Architecture projet finalisée
- ✅ Connexion Supabase opérationnelle

---

#### Semaine 2 : Authentification & Profils

**Features** :

- [ ] Signup flow (email/password)
- [ ] Login + Remember me
- [ ] OAuth Google/Apple
- [ ] Forgot password
- [ ] Email verification
- [ ] Setup profil initial
- [ ] Upload avatar
- [ ] Paramètres profil

**Tests** :

- [ ] Auth flow E2E
- [ ] Token refresh handling
- [ ] Logout & session cleanup

**Livrables** :

- ✅ Auth complète mobile + web
- ✅ Profil utilisateur fonctionnel

---

#### Semaines 3-4 : Messagerie Instantanée

**Semaine 3 - Base** :

- [ ] Liste conversations
- [ ] Création conversation 1:1
- [ ] Chat room UI
- [ ] Envoi message texte
- [ ] Réception temps réel (Supabase Realtime)
- [ ] Indicateur "typing..."
- [ ] Accusés lecture

**Semaine 4 - Enrichissement** :

- [ ] Picker Emoji + GIF (GIPHY)
- [ ] Upload photo/vidéo
- [ ] Preview médias
- [ ] Messages vocaux (record/play)
- [ ] Édition message (< 15min)
- [ ] Suppression message
- [ ] Réactions rapides (6 emojis)

**Tests** :

- [ ] Latence envoi < 500ms
- [ ] Sync multi-device
- [ ] Mode hors-ligne + retry

**Livrables** :

- ✅ Messagerie fonctionnelle mobile + web
- ✅ Rich media support

---

#### Semaines 5-6 : Appels Audio & Vidéo

**Semaine 5 - Audio** :

- [ ] Integration Stream SDK
- [ ] UI appel entrant/sortant
- [ ] Appel audio 1:1
- [ ] Mute/Unmute
- [ ] Audio routing (speaker/bluetooth)
- [ ] Notifications appel (CallKit/ConnectionService)

**Semaine 6 - Vidéo** :

- [ ] Appel vidéo 1:1
- [ ] Bascule caméra
- [ ] Toggle vidéo on/off
- [ ] PiP (Picture-in-Picture)
- [ ] Partage écran (web/desktop)
- [ ] Qualité adaptative

**Tests** :

- [ ] Appel établi < 3s
- [ ] Qualité audio MOS > 4.0
- [ ] Reconnexion automatique

**Livrables** :

- ✅ Appels audio/vidéo opérationnels
- ✅ Notifications natives

---

#### Semaines 7-8 : Polish & Beta Testing

**Semaine 7 - Polish** :

- [ ] Animations & transitions
- [ ] Loading states
- [ ] Error handling global
- [ ] Accessibility (a11y)
- [ ] Performance optimization
- [ ] Bug fixes critiques

**Semaine 8 - Beta** :

- [ ] Tests utilisateurs (20-50 beta testers)
- [ ] Feedback collection
- [ ] Analytics setup
- [ ] Crash monitoring
- [ ] Deploy staging → production

**Livrables** :

- ✅ Mobile app (TestFlight + Google Play Beta)
- ✅ Web app (app.imuchat.com)
- ✅ Beta lancée

---

### 📅 Phase 2 : Desktop + Polish Multi-Plateforme (4 semaines)

#### Semaine 9 : Desktop - Fondations

- [ ] Setup Electron + Vite
- [ ] Packaging Windows/macOS/Linux
- [ ] IPC setup (main ↔ renderer)
- [ ] Shared components web → desktop
- [ ] Native menu & tray icon

---

#### Semaine 10 : Desktop - Features

- [ ] Auth integration
- [ ] Messagerie sync
- [ ] Appels vidéo (priorité)
- [ ] Notifications natives desktop
- [ ] Deep links (imuchat://)

---

#### Semaine 11 : Polish Multi-Plateforme

- [ ] Parité features mobile/web/desktop
- [ ] UX consistency audit
- [ ] Performance optimization globale
- [ ] Accessibilité (WCAG AA)
- [ ] Security audit

---

#### Semaine 12 : Launch 🚀

- [ ] Tests finaux (smoke tests)
- [ ] Deploy production
- [ ] Press kit & landing page
- [ ] Launch communications
- [ ] Monitoring & support

**Livrables** :

- ✅ Desktop app (Windows, macOS, Linux)
- ✅ MVP complet 3 plateformes
- ✅ Launch public

---

## 📊 Répartition Effort par Plateforme

| Plateforme | Semaines | % Effort | Équipe Suggérée |
|------------|----------|----------|-----------------|
| **Mobile** | 8 | 40% | 2 dev mobile |
| **Web** | 8 | 35% | 2 dev web |
| **Desktop** | 2 | 15% | 1 dev (partage web) |
| **Backend/API** | 12 | 10% | 1 dev backend (transverse) |

**Total équipe recommandée** : 4-5 développeurs

---

## 🎯 Critères de Succès MVP

### KPIs Techniques

| Métrique | Objectif | Mesure |
|----------|----------|--------|
| **Latence message** | < 500ms | 90th percentile |
| **Établissement appel** | < 3s | Moyenne |
| **Crash rate** | < 0.1% | Sessions mobiles |
| **API uptime** | > 99.5% | Monthly |
| **Lighthouse Score** | > 90 | Web (Performance) |

---

### KPIs Produit (Post-Launch Mois 1)

| Métrique | Objectif | Mesure |
|----------|----------|--------|
| **Signups** | 1.000+ | Utilisateurs enregistrés |
| **DAU** (Daily Active) | 200+ | Utilisateurs actifs/jour |
| **Rétention D7** | > 30% | Utilisateurs reviennent J7 |
| **Messages envoyés** | 10.000+ | Total mois 1 |
| **Appels réalisés** | 500+ | Total mois 1 |
| **NPS** (Net Promoter) | > 40 | Survey beta testers |

---

### Critères Qualitatifs (Go/No-Go Launch)

#### MUST HAVE ✅

- [x] Auth fonctionne (signup, login, logout)
- [ ] Messagerie 1:1 temps réel opérationnelle
- [ ] Upload/download médias sans bug
- [ ] Appels audio/vidéo établis sans crash
- [ ] Notifications push reçues (mobile)
- [ ] App testée sur 10+ devices réels
- [ ] Zero crash critique en beta (2 semaines)
- [ ] RGPD : Export données fonctionnel

#### NICE TO HAVE 🟡

- [ ] Appels groupe (3+ personnes)
- [ ] Transcription messages vocaux
- [ ] Mode sombre
- [ ] Recherche messages avancée

---

## 🚫 Hors Périmètre MVP (Post-Launch)

### V1.1 (Mois 4-6 : Features Sociales)

**Du Groupe 5 (Mini-apps sociales)** :

- Stories 24h
- Mur social / Timeline
- Mini-blogs
- Événements
- Groupes publics avancés

**Justification** : Nécessite MVP stable avec base utilisateurs pour tester engagement social.

---

### V1.2 (Mois 7-9 : Modules Avancés)

**Du Groupe 6 (Modules desktop-first)** :

- Productivity Hub (to-do, tasks)
- Suite Office (docs, sheets)
- Board collaboratif
- Module Cooking & Home

**Justification** : Dépend de Store infrastructure et API modules.

---

### V1.3 (Mois 10-12 : Services Publics)

**Du Groupe 7 (Services utilitaires)** :

- Horaires transports en commun
- Info trafic routier
- Numeros urgence géolocalisés
- Annuaire services publics
- Suivi colis

**Justification** : Partenariats API externes requis + focus marché français prioritaire.

---

### V2.0 (An 1+ : Super-App)

**Du Groupe 8-10** :

- Divertissement (musique, podcasts, mini-jeux)
- IA avancée (chatbot multi-personas, modération auto)
- App Store complet + Marketplace
- Système paiement intégré

**Justification** : Vision long-terme, nécessite traction MVP + ressources scale.

---

## 🏗️ Organisation & Ressources

### Équipe Recommandée MVP

| Rôle | Nombre | Responsabilités |
|------|--------|-----------------|
| **Product Owner** | 1 | Vision, specs, priorisation |
| **Tech Lead** | 1 | Architecture, code review, tech decisions |
| **Dev Mobile** | 2 | React Native, iOS/Android |
| **Dev Web** | 2 | Next.js, UI/UX web |
| **Dev Backend** | 1 | API, Supabase, intégrations |
| **Designer UI/UX** | 1 | Design system, mockups, user flows |
| **QA Tester** | 0.5 | Tests manuels, bug reporting |

**Total** : 7.5 FTE (Full-Time Equivalent)

### Budget Estimé MVP (3 mois)

#### Ressources Humaines

| Poste | Taux/jour | Jours | Coût |
|-------|-----------|-------|------|
| Product Owner | 600€ | 60 | 36.000€ |
| Tech Lead | 700€ | 60 | 42.000€ |
| Dev Mobile (x2) | 550€ | 120 | 66.000€ |
| Dev Web (x2) | 550€ | 120 | 66.000€ |
| Dev Backend | 600€ | 60 | 36.000€ |
| Designer | 500€ | 40 | 20.000€ |
| QA | 400€ | 30 | 12.000€ |
| **TOTAL RH** | | | **278.000€** |

#### Services & Infrastructure (3 mois)

| Service | Coût/mois | Total 3 mois |
|---------|-----------|--------------|
| Supabase Pro | 25$ | 75$ |
| Stream Video | ~200$ | 600$ |
| Firebase (Push) | 50$ | 150$ |
| Vercel Pro | 20$ | 60$ |
| Cloudflare R2 | 50$ | 150$ |
| Sentry Business | 80$ | 240$ |
| Domain + SSL | 15$ | 45$ |
| **TOTAL Services** | | **~1.320$** (~1.200€) |

#### Licences & Outils

| Outil | Coût/mois | Total 3 mois |
|-------|-----------|--------------|
| Figma Team | 45$ | 135$ |
| GitHub Team | 40$ | 120$ |
| Notion Team | 30$ | 90$ |
| Slack Business | 50$ | 150$ |
| Apple Developer | 99$/an | 99$ |
| Google Play Dev | 25$ (one-time) | 25$ |
| **TOTAL Outils** | | **~620$** (~550€) |

#### **BUDGET TOTAL MVP** : **~280.000€**

**Optimisations possibles** :

- Équipe interne/étudiants : -50% RH → **~140.000€**
- Free tiers services (début) : -50% infra → **-1.000€**
- **Budget étudiant optimisé** : **~10.000-15.000€** (services + externes uniquement)

---

## 📈 Métriques de Suivi en Développement

### Sprint Health (Hebdomadaire)

- Velocity (story points)
- Bug count (critical/major/minor)
- Code review turnaround
- Test coverage (target 70%+)
- Build success rate

### Performance Benchmarks

**Mobile** :

- App launch time < 2s
- Frame rate > 55 FPS
- Memory usage < 150MB (idle)
- Battery drain < 5%/h (active chat)

**Web** :

- Time to Interactive < 1.5s
- First Contentful Paint < 800ms
- Bundle size < 500KB (gzipped)

---

## 🔐 Sécurité & Conformité

### Mesures Obligatoires MVP

1. **Chiffrement** :
   - E2E messages (Signal Protocol)
   - HTTPS/TLS 1.3 obligatoire
   - Encryption at rest (database)

2. **RGPD** :
   - Consentement explicite données
   - Export données utilisateur
   - Suppression compte (hard delete)
   - DPO identifié

3. **Authentification** :
   - Password requirements (8+ chars, mix)
   - Rate limiting (anti-brute force)
   - 2FA disponible

4. **Audit** :
   - Logs accès sensibles
   - Security headers (CSP, HSTS)
   - Dependency scanning (Dependabot)
   - Penetration testing (pre-launch)

---

## 🎓 Stratégie Beta Testing

### Phase Beta Fermée (Semaines 8-10)

**Objectif** : Validation stabilité + feedback UX

**Critères sélection beta testers** :

- 50 testeurs (mix profils)
- 20% étudiants (target audience)
- 30% familles
- 30% pros
- 20% tech-savvy (feedback qualité)

**Channels feedback** :

- In-app feedback form
- Slack community privé
- Weekly surveys
- Session tests modérés (5-10 users)

**Incentives** :

- Early access features V1.1
- Badge "Beta Tester" permanent
- Swag (stickers, T-shirt)

### Phase Beta Ouverte (Semaines 11-12)

**Objectif** : Scale testing + génération buzz

**Invitation** :

- Waitlist site vitrine (priorité)
- Invitations parrainées (1 beta → 3 invites)
- Social media teasing

**Monitoring** :

- Analytics temps réel
- Crash alerts
- Support réactif (< 24h)

---

## 🚀 Stratégie Lancement

### Pre-Launch (Semaine 11)

- [ ] Landing page refresh (site vitrine)
- [ ] Press kit complet
- [ ] Social media teasers
- [ ] Product Hunt preparation
- [ ] App stores metadata (screenshots, descriptions)

### Launch Day (Semaine 12)

- [ ] Public release apps (stores + web)
- [ ] Blog post annonce
- [ ] Product Hunt launch
- [ ] Social media campaign
- [ ] Email blast waitlist

### Post-Launch (Semaine 13-16)

- [ ] Monitoring 24/7 (première semaine)
- [ ] Support réactif
- [ ] Bug fixes rapides
- [ ] Feature flags (rollout progressif)
- [ ] Collect feedback & plan V1.1

---

## 📚 Documentation Requise

### Technique

- [ ] Architecture Decision Records (ADR)
- [ ] API documentation (Swagger)
- [ ] Database schema docs
- [ ] Deployment runbook
- [ ] Disaster recovery plan

### Produit

- [ ] User manual (FR/EN)
- [ ] FAQ
- [ ] Privacy policy
- [ ] Terms of Service
- [ ] Community guidelines

### Développeurs

- [ ] Contributing guide
- [ ] Code style guide
- [ ] Testing guide
- [ ] Release process

---

## 🎯 Alignement avec Site Vitrine

### Messaging Cohérent

**Site Vitrine** → **MVP** :

- "Super-app européenne" → MVP pose les fondations
- "Privacy-first" → E2E encryption implémenté
- "Multi-plateforme" → Mobile + Web + Desktop
- "Modulaire" → Architecture prête pour Store (V2)

### Timeline Synchronisée

**Site Vitrine Phase 1** (Semaines 1-6) → **MVP Dev Phase 1** (parallèle)

**Site Vitrine Launch** (Semaine 6) → **MVP Beta** (Semaine 8)

**Alignement marketing** : Site vitrine "Investor-ready" lors de la beta publique.

---

## 🏁 Conclusion

### Vision MVP Résumée

**ImuChat MVP** = Messagerie **sécurisée, performante et multi-plateforme** avec :

- ✅ Chat temps réel (texte, voix, médias)
- ✅ Appels audio/vidéo HD
- ✅ Profils riches & multi-identités
- ✅ Privacy-first (E2E encryption)
- ✅ Architecture modulaire (ready for scale)

### Prochaines Étapes Immédiates

**Cette semaine** :

1. ✅ Valider scope MVP avec équipe
2. ✅ Setup infrastructure (Supabase, Stream)
3. ✅ Créer backlog détaillé (GitHub Projects)
4. ✅ Design sprint (maquettes clés)
5. ✅ Kick-off développement

**Semaines 1-2** :

- Sprint 1 : Fondations + Auth
- Objectif : Login fonctionnel mobile + web

### Ressources Annexes

Voir aussi :

- [TODO.md](TODO.md) - Checklist développement
- [mobile/docs/MVP_TECHNICAL_ROADMAP.md](mobile/docs/MVP_TECHNICAL_ROADMAP.md)
- [web-app/docs/MVP_SPEC.md](web-app/docs/MVP_SPEC.md)
- [FUNCTIONNALITIES_LIST.md](docs/FUNCTIONNALITIES_LIST.md)

---

**Document créé** : 12 février 2026  
**Version** : 1.0 (MVP Structuré)  
**Révision prévue** : Post-Sprint 1 (Semaine 2)  
**Propriétaire** : Product Team ImuChat

---

*🚀 From vision to reality. Let's build the European super-app!*
