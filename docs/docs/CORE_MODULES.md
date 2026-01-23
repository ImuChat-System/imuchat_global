# 🧩 Modules de Base ImuChat Mobile

## Vue d'ensemble

Les **modules de base non-désinstallables** constituent le socle fonctionnel minimal de ImuChat. Ces modules garantissent la cohérence produit, la sécurité, l'expérience utilisateur et l'interopérabilité avec les futures mini-apps du Store.

---

## 📱 1. Core Chat Engine (`/chat`)

**Rôle :** Cœur de la messagerie (DMs, groupes légers).

**Fonctions minimales :**

- Envoi/réception messages texte, images, fichiers, audio (memos)
- Réactions, réponses/thread léger, mentions, épingles
- Notifications push (intégration)
- Gestion conversations (mute, pin, archive)

**Pourquoi non-désinstallable :** Base fonctionnelle de la plateforme ; indispensable à toute interaction utilisateur.

**Permissions / dépendances :** Stockage local, réseau, notifications, microphone (pour memos), file picker.

---

## 🔐 2. Auth & User Management (`/auth`)

**Rôle :** Identités, sessions, sécurité.

**Fonctions minimales :**

- Signup/login (email, OAuth Apple/Google), token refresh, gestion devices/sessions
- 2FA, reset password, gestion comptes multiples

**Pourquoi non-désinstallable :** Sans auth on ne peut pas sécuriser ni personnaliser l'expérience.

**Permissions / dépendances :** Secure Storage, réseau.

---

## 👥 3. Contacts & Presence (`/contacts`)

**Rôle :** Carnet d'adresses, présence, statut en ligne.

**Fonctions minimales :**

- Liste contacts, recherche, import (optionnel), statut en ligne/dernière activité, blocage/signaler

**Pourquoi non-désinstallable :** Facilite connexion entre utilisateurs et alimente recommandations.

**Permissions / dépendances :** Accès contact (optionnel), réseau.

---

## 🔔 4. Notifications System (`/notifications`)

**Rôle :** Gestion centralisée des notifications push & in-app.

**Fonctions minimales :**

- Catégories notifications, actions rapides (répondre, marquer lu), badges, digest

**Pourquoi non-désinstallable :** Impacte l'engagement, critique pour appels et alertes.

**Permissions / dépendances :** FCM/APNs, local notifications.

---

## 🎨 5. Theme Engine & Design Tokens (`/theme`)

**Rôle :** Gestion des thèmes, tokens, mode Day/Night.

**Fonctions minimales :**

- Appliquer thèmes officiels, basculer clair/sombre, FX level, fonds personnalisés basiques

**Pourquoi non-désinstallable :** Assure cohérence UI/UX entre modules et permet personalisation minimale.

**Permissions / dépendances :** Stockage local (prefs), assets.

---

## 🛍️ 6. Store Core (UI minimal) (`/store-core`)

**Rôle :** Infrastructure locale du Store (catalogue minimal, gestion installations).

**Fonctions minimales :**

- Vue hub, liste apps intégrées, installer/désactiver modules optionnels

**Pourquoi non-désinstallable :** Permet modularité et gouvernance des modules (installer/désinstaller).

**Permissions / dépendances :** Réseau, stockage.

---

## 📷 7. Media Handler & Viewer (`/media`)

**Rôle :** Uploads, prévisualisation, lightbox, thumbnails.

**Fonctions minimales :**

- Upload pré-signed, thumb generation (client placeholders), viewer image/video/audio, cache local

**Pourquoi non-désinstallable :** Tout le chat et le contenu multimédia reposent sur ce module.

**Permissions / dépendances :** Storage, camera, microphone, file access.

---

## 📞 8. Calls & RTC Signaling (basic) (`/calls-core`)

**Rôle :** Infrastructure d'appel (signaling + UI minimal pour joindre).

**Fonctions minimales :**

- Signaling WebSocket/WebRTC bootstrap, bouton "Start call"/join, affichage PiP minimal

**Pourquoi non-désinstallable :** Fonctionnalité sociale essentielle (entrée vers appels plus riches).

**Permissions / dépendances :** Camera, microphone, réseau, possible intégration SFU.

---

## 💰 9. Wallet & Transactions Core (secure) (`/wallet-core`)

**Rôle :** Porte-monnaie minimal (aperçu solde, historique simple).

**Fonctions minimales :**

- Afficher solde ImuCoin/XP, historique basique, liens vers rechargement (flow externe)

**Pourquoi non-désinstallable :** Nécessaire pour achats Store, récompenses, economy integration.

**Permissions / dépendances :** Stockage sécurisé, réseau, éventuellement KYC backend.

---

## ⚙️ 10. Preferences & Device Settings (`/prefs`)

**Rôle :** Centraliser préférences (thème, notifications, layout).

**Fonctions minimales :**

- Stocker/synchroniser prefs par device/user, layout chooser (Snapview/Nimbus)

**Pourquoi non-désinstallable :** Assure cohérence UX et persistance des choix utilisateur.

**Permissions / dépendances :** Local storage, network sync.

---

## 🔍 11. Search Core (`/search`)

**Rôle :** Recherche locale/global basique.

**Fonctions minimales :**

- Recherche in-thread (texte), recherche conversations/contacts, filtres simples

**Pourquoi non-désinstallable :** Indispensable à l'usabilité (retrouver messages/fichiers).

**Permissions / dépendances :** Indexing local, optional server search.

---

## 📱 12. Offline Sync & Storage Layer (`/sync`)

**Rôle :** Cache local, queue d'envoi (outbox), stratégie de sync.

**Fonctions minimales :**

- Stocker récents, file d'envoi, retry logic, indicateurs offline

**Pourquoi non-désinstallable :** Garantit résilience UX en cas de perte réseau.

**Permissions / dépendances :** SQLite/MMKV, storage.

---

## 🤖 13. IA Assistant Core (client) (`/ai-core`)

**Rôle :** Point d'entrée vers les capacités IA de base (résumé, traduire, actions).

**Fonctions minimales :**

- Bouton/access to Dock IA (lite), actions offline-safe (request/consent flows)

**Pourquoi non-désinstallable :** Utile pour accessibilité, résumés, actions rapides; permet uniformité des prompts.

**Permissions / dépendances :** Réseau, opt-in privacy.

---

## 🛡️ 14. Moderation & Safety (`/safety`)

**Rôle :** Signalement, filtres anti-abuse, tools modérateurs basiques.

**Fonctions minimales :**

- Report flow, block user, mute, basic content filter (client side), history logs for mods

**Pourquoi non-désinstallable :** Sécurité, conformité légale et confiance utilisateur.

**Permissions / dépendances :** Réseau, logging.

---

## 📊 15. Telemetry & Crash Reporting (`/telemetry`)

**Rôle :** Analytics basique & crash.

**Fonctions minimales :**

- Events standards, crash capture, basic metrics (TTI, crashes), opt-out

**Pourquoi non-désinstallable :** Qualité produit, monitoring, troubleshooting.

**Permissions / dépendances :** Network, storage.

---

## 🌍 16. Localization / i18n Core (`/i18n`)

**Rôle :** Gestion des langues et formats.

**Fonctions minimales :**

- Loader de traductions, date/number formats, fallback locale

**Pourquoi non-désinstallable :** Indispensable pour multi-langues et cohérence UI.

**Permissions / dépendances :** Storage (prefs).

---

## ⚖️ Règles & Principes pour ces Modules

1. **Léger & non intrusif** : Chacun doit consommer peu de ressources initiales et charger fonctionnalités avancées uniquement à la demande.

2. **Extensible** : Exposer hooks/events pour que les mini-apps du Store puissent s'intégrer (ex : media handler pour un éditeur).

3. **Sécurisé** : Modules sensibles (wallet, auth, calls) doivent être isolés et audités.

4. **Configurables** : Admin/enterprise & feature flags pour activer/désactiver comportements (mais pas la présence du module).

5. **Respect de la vie privée** : Options clear opt-in/out (IA, telemetry, contact sync).

---

## 🏗️ Architecture Technique

### Module Registry System

- Enregistrement automatique des modules au démarrage
- Découverte et résolution des dépendances
- Versionning et compatibilité

### Event Bus Inter-modules

- Communication décentralisée entre modules
- Events typés et sécurisés
- Pattern publish/subscribe

### Permissions Management

- Gestion fine des permissions par module
- Système de consentement granulaire
- Audit trail des accès

### Security Isolation

- Modules sensibles en sandbox
- Chiffrement des données sensibles
- Audit de sécurité régulier

---

## 📋 Plan d'Implémentation

### Phase 1 : Infrastructure (Semaine 1)

1. Module Registry & Event Bus
2. Core Chat Engine
3. Auth & User Management
4. Offline Sync & Storage

### Phase 2 : Communication & Sécurité (Semaine 2)

1. Contacts & Presence
2. Notifications System
3. Moderation & Safety
4. Calls & RTC Signaling (basic)

### Phase 3 : Interface & Expérience (Semaine 3)

1. Theme Engine & Design Tokens
2. Media Handler & Viewer
3. Search Core
4. Localization i18n

### Phase 4 : Économie & Analytics (Semaine 4)

1. Wallet Core (secure)
2. Store Core Infrastructure
3. IA Assistant Core
4. Telemetry & Analytics

---

## ✅ Critères de Validation

- **Performance** : Temps de démarrage < 3s avec tous les modules
- **Sécurité** : Audit de sécurité passé pour modules sensibles
- **Stabilité** : Crash-free rate > 99% par module
- **Compatibilité** : Tests d'intégration entre tous les modules
- **UX** : Navigation fluide 60fps entre les modules

---

**Ces modules constituent le socle minimal indispensable pour que ImuChat fonctionne de manière sûre, cohérente et extensible.**
