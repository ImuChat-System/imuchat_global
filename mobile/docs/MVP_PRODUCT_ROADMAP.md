# 📱 Mobile MVP Product Roadmap

## 🎯 Vision du MVP

L'objectif du MVP (Minimum Viable Product) est de lancer une **application de messagerie robuste et fluide**, centrée sur le cœur de l'expérience : **la communication instantanée** (texte, voix, vidéo) et **l'identité utilisateur**.

Les fonctionnalités "gadgets", "sociales" ou "modules avancés" sont volontairement reportées à la V2 pour garantir une stabilité parfaite du Core.

---

## 📦 Périmètre du MVP (Scope)

Le MVP se concentre exclusivement sur les **Groupes 1, 2 et 3** du document de référence `../../docs/50_FONCTIONNALITIES_SCREENS.md`.

### 1. Messagerie & Communication (Core)

_L'essence de l'application. Doit être rapide, fiable et temps-réel._

- [ ] **Liste des conversations** : Vue d'ensemble, statut de présence, indicateurs de messages non-lus.
- [ ] **Chat Room** :
  - Envoi/réception de messages texte en temps réel via Supabase.
  - Support des Emojis et GIFs de base.
  - Indicateurs "En train d'écrire..." et "Lu".
- [ ] **Messagerie Vocale** : Enregistrement, envoi et lecture de messages audio.
- [ ] **Partage de médias de base** : Envoi de photos (caméra/galerie).
- [ ] **Gestion des messages** : Suppression (soft delete) et édition simple.

### 2. Appels Audio & Vidéo (Vital)

_Fonctionnalités critiques pour concurrencer les standards actuels._

- [ ] **Appels Audio 1-to-1** : Connexion P2P via WebRTC ou solution tierce (ex: Agora/Stream).
- [ ] **Appels Vidéo 1-to-1** : Vidéo HD avec bascule caméra avant/arrière.
- [ ] **Interface d'appel** : Mute, Speaker, Raccrocher.
- [ ] **Notifications d'appel** : CallKit (iOS) / ConnectionService (Android) pour recevoir les appels même app fermée.

### 3. Profils & Identité (Identity)

_La base de l'interaction sociale._

- [x] **Onboarding & Auth** : Inscription/Connexion (Email/Password ou OAuth), setup initial du profil.
- [ ] **Profil Utilisateur** : Photo de profil (avatar), Nom d'affichage, Bio/Statut texte simple.
- [ ] **Paramètres de base** : Gestion du compte (déconnexion, suppression).

---

## 🚫 Hors Périmètre (Post-MVP / V2)

Ces éléments ne bloquent pas le lancement du MVP.

- **Groupes 4 à 10** :
  - Personnalisation avancée (Thèmes dynamiques, polices custom).
  - Mini-apps sociales (Stories, Timeline, Events).
  - Modules avancés (Productivity, Office, PDF).
  - IA (Chatbots, traduction, suggestions).
  - App Store & Paiements.
- **Fonctionnalités avancées des groupes MVP** :
  - Appels de groupe.
  - Filtres vidéo temps-réel.
  - Multi-profils complexes.
  - Transcription vocale IA.

---

## ✅ Critères de Succès du MVP

1. **Fiabilité** : 99.9% des messages sont délivrés instantanément.
2. **Performance** : Ouverture de l'app < 2s, switch entre écrans fluide (60fps).
3. **Qualité d'appel** : Latence acceptable et clarté audio en 4G/Wifi.
4. **UX** : Pas de crashs bloquants sur les parcours critiques (Login -> Chat -> Appel).

---

## 📅 Roadmap Simplifiée

| Phase       | Focus                    | Livrables Clés                                                          |
| :---------- | :----------------------- | :---------------------------------------------------------------------- |
| **Phase 1** | **Fondations & Auth**    | Projet initialisé, Design System, Auth fonctionnelle, Profils basiques. |
| **Phase 2** | **Chat Core**            | Liste conversations, Envoi/Réception temps-réel, Messages texte/photo.  |
| **Phase 3** | **Appels (Audio/Vidéo)** | Intégration WebRTC/SDK, UI d'appel, Notifications d'appel natives.      |
| **Phase 4** | **Polish & Launch**      | Fix bugs, Optimisation perfs, Polish UI/UX, Build de production.        |
