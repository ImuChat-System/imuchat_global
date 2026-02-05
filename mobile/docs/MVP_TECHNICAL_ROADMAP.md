# 🛠 Mobile MVP Technical Roadmap

## 🏗 Architecture & Stack Technique

- **Framework** : React Native (Expo SDK 50+).
- **Navigation** : Expo Router v3 (File-based routing).
- **Langage** : TypeScript.
- **Backend / Database** : Supabase (Auth, Postgres, Realtime, Storage, Edge Functions).
- **UI Kit** : @imuchat/ui-kit (Design Tokens & Components).
- **State Management** : Zustand (léger et performant) ou React Context pour les cas simples.
- **Appels Audio/Vidéo** : _À définir (ex: Stream Video SDK, Agora, ou WebRTC custom via Janus/Mediasoup)._

---

## 🗓 Plan d'Implémentation (Phasage)

### 🏁 Phase 0 : Initialisation & Config (Semaine 1)

_Objectif : Socle technique propre et environnement de dev prêt._

- [x] Initialiser projet Expo + TypeScript.
- [x] **Config Code Quality** : ESLint, Prettier, Husky (pre-commit hooks).
- [x] **Architecture Dossiers** : Mettre en place la structure (features/, components/, hooks/, services/).
- [x] **Intégration UI Kit** :
  - Configurer le `ThemeProvider` global.
  - Importer les tokens (couleurs, typos, spacing) du package `@imuchat/ui-kit`.
  - Créer les composants atomiques de base (Button, textInput, Typography) si non présents dans le UI Kit.
- [x] **Navigation Shell** : Squelette de la navigation (Tabs + Stacks vides).

### 🔐 Phase 1 : Authentification & Profils (Semaine 2)

_Objectif : L'utilisateur peut se créer un compte et gérer son identité._

- [x] **Supabase Setup** :
  - Configurer le client Supabase dans l'app mobile.
  - Créer les tables `users` / `profiles` (RLS policies).
- [x] **Auth Flow** :
  - Écrans : Login, Register, Forgot Password.
  - Logique : AuthContext pour gérer la session persistante.
- [x] **Gestion Profil** :
  - Écran "Edit Profile" (Upload Avatar > Storage Supabase).
  - Mise à jour des champs (Display Name, Bio).

### 💬 Phase 2 : Messagerie Instantanée (Semaines 3-4)

_Objectif : Chat texte temps-réel fonctionnel._

- [x] **Data Layer (Chat)** :
  - Tables : `conversations`, `conversation_participants`, `messages`.
  - RLS : Sécuriser l'accès aux conversations privées.
- [x] **Liste des Conversations** :
  - Query Supabase optimisée (pagination).
  - Abonnements Realtime (nouveau message = update liste).
- [x] **Chat Room UI** :
  - Liste des messages (FlatList inversée).
  - Input bar (auto-growing text input).
  - Bulles de messages (soi vs autres).
- [x] **Logique d'envoi** :
  - Optimistic UI (affichage immédiat avant confirmation serveur).
  - Gestion des erreurs d'envoi.
- [ ] **Médias Simples** :
  - Picker photo (Expo Image Picker).
  - Upload vers Supabase Storage.
  - Affichage preview image dans le chat.

### 📞 Phase 3 : Appels Audio/Vidéo (Semaines 5-6)

_Objectif : Intégration de la brique la plus complexe._

- [ ] **POC Technique** :
  - Choisir et tester le SDK (Stream.io recommandé pour la rapidité, ou Agora).
- [ ] **Intégration SDK** :
  - Setup des permissions (Micro, Caméra) dans `app.json` config plugins.
  - Gestion des Token providers (Fonction Edge Supabase pour générer tokens d'appel).
- [ ] **UI d'Appel** :
  - Écran "Incoming Call" (Accepter/Refuser).
  - Écran "Active Call" (Vues grille vidéo, contrôles Mute/Caméra/Speaker).
- [ ] **Notification d'Appel (Deep Integration)** :
  - Intégrer `react-native-callkeep` ou plugin expo équivalent pour l'UI native d'appel (iOS CallKit).

### 🧹 Phase 4 : Polish & Release (Semaine 7)

_Objectif : Stabilisation._

- [ ] **Gestion des erreurs** : Error Boundaries globales.
- [ ] **Mode Offline** : Support basique (cache local via React Query ou WatermelonDB si besoin, sinon simple cache mémoire).
- [ ] **Performance** : Audit Re-renders, taille des images.
- [ ] **Bêta Test** : Build via EAS Build (Internal Distribution).

---

## 🧱 Décisions Techniques Clés à Valider

1. **Lib d'Appel** : Stream Video React Native SDK vs Agora vs LiveKit. _(Reco : Stream ou LiveKit pour la DX)._
2. **State Server** : `TanStack Query` (React Query) est fortement recommandé pour gérer le cache serveur Supabase.
3. **Local Database** : Est-ce nécessaire pour le MVP ? _(Reco : Non, cache mémoire + persist React Query suffisent pour v1)._
