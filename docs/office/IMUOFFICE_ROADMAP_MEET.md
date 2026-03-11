# 📹 ROADMAP DÉTAILLÉE — ImuMeet (Visioconférence)
**Module :** ImuMeet  
**Date de création :** 10 mars 2026 · **Version :** 1.0  
**Durée :** ~8 mois · **Sprints :** 16 × 2 semaines  
**Stack :** LiveKit (WebRTC SFU) · RNNoise · Whisper · FFmpeg · MediaSoup  
**Plateformes :** Web PWA · Mini-app ImuChat · Desktop Electron/Tauri · Mobile React Native

---

## 🎯 Positionnement

ImuMeet est l'**alternative souveraine européenne à Zoom et Microsoft Teams**.

| Concurrent | Prix | Hébergement | Données |
|------------|------|-------------|---------|
| Zoom | 14-20€/host/mois | USA | Hors UE |
| Teams | Inclus 365 | USA (Azure) | Hors UE possible |
| Google Meet | Inclus Workspace | USA | Hors UE |
| **ImuMeet** | **Inclus ImuChat Pro** | **🇪🇺 UE uniquement** | **RGPD natif** |

**Différenciateur clé :** ImuMeet n'est pas une app séparée. C'est **le bouton "Démarrer une réunion"** dans chaque canal ImuChat.

---

## 📐 Architecture technique

```
┌──────────────────────────────────────────────────────────────────────┐
│                       ImuMeet Architecture                           │
├───────────────────────┬──────────────────────────────────────────────┤
│   Client Layer        │   Infrastructure Serveur (UE)                │
│                       │                                              │
│   LiveKit SDK Web     │   LiveKit Server (auto-hébergé)              │
│   LiveKit SDK RN      │   → OVHcloud / Scaleway                      │
│   (React Native)      │   → Multi-région UE (FR, DE, NL)            │
│                       │                                              │
│   UI Components :     │   Media Processing :                         │
│   - VideoGrid         │   → FFmpeg (enregistrement)                  │
│   - Controls Bar      │   → RNNoise (débruitage)                     │
│   - Participants List │   → Whisper (transcription)                  │
│   - Chat Panel        │                                              │
│   - Board Panel       │   Signaling :                                │
│   - Recording Panel   │   → WebSocket (plateforme ImuChat)           │
└───────────────────────┴──────────────────────────────────────────────┘
```

**Pourquoi LiveKit ?**
- Open-source (Apache 2.0), auto-hébergeable UE
- SDK multiplateforme : Web, iOS, Android, React Native, **Rust natif**
- Support 1000+ participants (SFU scalable)
- E2E encryption optionnel (natif)
- Utilisé par des entreprises type Daily.co, Liveblocks
- SDK Rust → migration Tauri V2 native sans friction

---

## 🏗️ Phase 0 — Fondations communes (Semaines 1-4)
*Partagée avec ImuDocs et ImuBoard*

**Spécifique ImuMeet :**
- [ ] Déploiement LiveKit Server en UE (OVHcloud, 3 régions)
  - Configuration TURN/STUN servers UE
  - Load balancing multi-région
  - Monitoring (Grafana + LiveKit metrics)
- [ ] Types `@imuchat/office-core` : `Room`, `Participant`, `Track`, `Recording`, `Transcript`
- [ ] Tables Supabase : `rooms`, `room_sessions`, `room_recordings`, `room_participants`
- [ ] Tests de charge LiveKit : 100 participants simultanés cible phase 1

---

## 📹 Phase 1 — Visio de base : audio/vidéo HD (Semaines 5-8)

### Sprint 1-A (S5-S6) — Salles LiveKit & flux A/V

- [ ] Création de salles permanentes avec lien partageable (`imuchat.eu/meet/[room-slug]`)
- [ ] Salle instantanée depuis ImuChat (bouton "Démarrer une réunion" dans tout canal)
- [ ] Flux vidéo HD (720p → 1080p selon bande passante)
- [ ] Flux audio avec AGC (Automatic Gain Control)
- [ ] Simulcast (3 qualités vidéo) → adaptation réseau automatique
- [ ] Contrôles basiques : micro on/off, caméra on/off, quitter

### Sprint 1-B (S7-S8) — Grille vidéo & participants

- [ ] Grille vidéo adaptative :
  - 1-4 participants : grille 2×2
  - 5-9 participants : grille 3×3
  - 10-25 participants : grille scrollable avec speaker detection
- [ ] Speaker detection : mise en avant automatique du locuteur actif
- [ ] Pin / Spotlight : fixer un participant en grand
- [ ] Vue "Speaker only" (un seul flux grand, autres en miniature)
- [ ] Liste des participants (présence, statuts micro/caméra)
- [ ] Réactions rapides emoji (👍❤️😂🎉 sans micro)
- [ ] Lever la main (queue de prise de parole)

**Livrables Phase 1 :** Visioconférence HD basique jusqu'à 25 participants ✅

---

## 🖥️ Phase 2 — Partage d'écran & Chat intégré (Semaines 9-12)

### Sprint 2-A (S9-S10) — Partage d'écran avancé

- [ ] Partage d'écran (desktop entier, fenêtre spécifique, onglet Chrome)
- [ ] Annotation sur l'écran partagé (pointeur laser, marqueur)
- [ ] Vue côte à côte : vidéo + écran partagé simultanés
- [ ] Partage audio système (pour vidéos, musique)
- [ ] Remote control optionnel (permettre à un participant de contrôler l'écran)
- [ ] Qualité écran partagé adaptative (résolution 1080p → 4K si réseau optimal)

### Sprint 2-B (S11-S12) — Chat & Intégrations in-meeting

- [ ] Chat textuel intégré dans la réunion (sans quitter l'interface vidéo)
  - Messages texte, emojis, réactions
  - Partage de fichiers (upload → ImuDrive)
  - Liens cliquables
- [ ] Panel ImuBoard intégré (Phase 3 ImuBoard requis)
  - Bouton "Ouvrir Board" → board partagé dans la réunion
- [ ] Panel ImuDocs intégré
  - Accéder à un document pendant la réunion
  - Prises de notes collaboratives liées à la session
- [ ] Intégration agenda ImuChat (invitation → événement calendar)

**Livrables Phase 2 :** Partage d'écran pro, chat et boards intégrés ✅

---

## 🧠 Phase 3 — IA & Qualité audio-vidéo (Semaines 13-18)

### Sprint 3-A (S13-S14) — Réduction de bruit & qualité

- [ ] Réduction de bruit IA **RNNoise** (Xiph, BSD) :
  - Traitement côté client (WebAssembly pour web, natif pour desktop)
  - Suppression clavier, ventilateur, bruit ambiant
  - Bouton on/off dans les contrôles
- [ ] Amélioration microphone IA (égaliseur adaptatif)
- [ ] Flou d'arrière-plan (MediaPipe Selfie Segmentation) :
  - Flou gaussien
  - Remplacement par image custom
  - Remplacement par vidéo (arrière-plan animé)
- [ ] Filtre beauté basique (lissage IA)
- [ ] Correction de lumière automatique (zones sombres)

### Sprint 3-B (S15-S16) — Transcription & Résumé IA

- [ ] Transcription en temps réel (Whisper turbo, auto-hébergé UE) :
  - Sous-titres live dans l'interface (FR, EN, DE, ES, IT)
  - Attribution par locuteur (diarization)
  - Affichage configurable (taille police, position)
- [ ] Traduction live des sous-titres (chaque participant choisit sa langue)
- [ ] Résumé post-meeting (Alice IA) :
  - Synthèse des points discutés
  - Liste des décisions prises
  - Liste des actions à faire (avec assignations si mentionnées)
  - Export vers ImuDocs automatiquement

### Sprint 3-C (S17-S18) — Enregistrement cloud

- [ ] Enregistrement de session :
  - Enregistrement mixte (vidéo + audio tous participants)
  - Enregistrement individuel par piste (pro)
  - Traitement FFmpeg côté serveur UE
  - Stockage ImuDrive (hébergement UE)
- [ ] Accès enregistrements : permalien sécurisé, durée configurable
- [ ] Transcription automatique de l'enregistrement (Whisper)
- [ ] Lecteur video intégré avec recherche dans la transcription
- [ ] Contrôle accès : qui peut voir l'enregistrement

**Livrables Phase 3 :** Qualité pro, transcription live, enregistrement cloud ✅

---

## 🏢 Phase 4 — Fonctionnalités enterprise (Semaines 19-22)

### Sprint 4-A (S19-S20) — Sous-salles & Webinars

- [ ] **Breakout rooms** (sous-salles) :
  - Créer 2-20 sous-salles depuis la salle principale
  - Assignation manuelle ou aléatoire des participants
  - Timer configurable (retour automatique salle principale)
  - Communication animateur → toutes les sous-salles
  - Visite des sous-salles par l'animateur
- [ ] **Mode Webinar** (jusqu'à 500 participants) :
  - Panelistes (caméra active) vs Audience (écoute uniquement)
  - Q&A structuré (questions votées, répondues en ordre)
  - Sondages et quiz en direct
  - Chat modéré
  - Enregistrement automatique

### Sprint 4-B (S21-S22) — Gestion enterprise & sécurité

- [ ] Salles de réunion persistantes avec planning intégré
- [ ] Salle d'attente (lobby) : l'hôte admet les participants
- [ ] Mot de passe de salle + lien sécurisé
- [ ] Verrouillage de salle (empêcher nouveaux entrants)
- [ ] Rapport post-réunion (participants, durée, enregistrements)
- [ ] E2E encryption (LiveKit natif, mode opt-in pour salles sensibles)
- [ ] Conformité RGPD : suppression enregistrements automatique, logs audit
- [ ] Intégration SSO entreprise (SAML/OIDC)

**Livrables Phase 4 :** Breakout rooms, webinars 500p, sécurité enterprise ✅

---

## 💻 Phase 5 — Applications Desktop & Mobile (Semaines 23-28)

### Sprint 5-A (S23-S24) — Desktop Electron

- [ ] App Electron : ImuMeet intégré dans l'application desktop ImuChat
  - Fenêtre flottante (PiP) : continuer à travailler pendant la visio
  - Multi-fenêtres : board, chat, doc, vidéo en simultané
  - Notifications système (quelqu'un vous appelle)
  - Raccourcis clavier globaux (couper micro, couper caméra)
  - Sélection de périphériques (micro, caméra, haut-parleurs)

### Sprint 5-B (S25-S26) — Mobile React Native

- [ ] App mobile : ImuMeet sur iOS et Android
  - Appels entrants avec notification push
  - Mode audio seul (économie batterie)
  - Caméra avant/arrière switch
  - Mode portrait et paysage
  - PiP natif iOS / Android (continuer à utiliser le téléphone)
  - Support réseau dégradé (qualité adaptative 3G/4G/WiFi)

### Sprint 5-C (S27-S28) — Streaming & Intégrations

- [ ] **Streaming RTMP** : diffuser une réunion en direct vers YouTube/Twitch/ImuLive
- [ ] Intégration calendrier (ImuChat Calendar, Google Calendar, Outlook)
- [ ] Rappels automatiques 15min avant réunion
- [ ] API publique ImuMeet (créer/gérer des salles depuis des apps tierces)
- [ ] Webhooks (réunion démarrée, terminée, participant rejoint/quitté)

**Livrables Phase 5 :** ImuMeet complet sur toutes plateformes, streaming live ✅

---

## 🦀 Phase 6 — Tauri V2 / Rust natif (Mois 13-18)

*Migration du client desktop Electron → Tauri, avec WebRTC natif Rust*

### Objectifs

- **LiveKit SDK Rust** : remplacer le SDK JS par le SDK Rust natif
  - Latence réduite de ~40ms à <5ms (pas de bridge JS)
  - Chiffrement E2E en Rust (ring + dalek-cryptography)
  - Réduction RAM : de 400MB à <80MB avec visio active
- **RNNoise Rust** : débruitage sans WebAssembly (natif, plus rapide)
- **Whisper.cpp** : transcription locale sans serveur (modèle tiny sur desktop)

### Sprints Tauri ImuMeet (S33-S44 — partagés avec ImuDocs Tauri)

- [ ] **S33-S34 :** LiveKit SDK Rust intégration, premiers appels Tauri
- [ ] **S35-S36 :** E2E encryption Rust, gestion clés cryptographiques
- [ ] **S37-S38 :** RNNoise natif, Whisper.cpp local (transcription offline)
- [ ] **S39-S40 :** Performance benchmarks, comparaison Electron vs Tauri
- [ ] **S41-S42 :** Tests charge, stabilité, crash recovery
- [ ] **S43-S44 :** 🚀 **ImuMeet 2.0 Tauri — Distribution via Store ImuChat**

---

## 📋 Tableau de conformité concurrentielle

| Fonctionnalité | Zoom | Teams | ImuMeet V1 | ImuMeet V2 |
|----------------|------|-------|------------|------------|
| Vidéo HD 1080p | ✅ | ✅ | ✅ S1 | ✅ |
| 500 participants | ✅ | ✅ | ✅ S4 | ✅ |
| Enregistrement cloud | ✅ | ✅ | ✅ S3 | ✅ |
| Transcription live | ✅ | ✅ | ✅ S3 | ✅ |
| Breakout rooms | ✅ | ✅ | ✅ S4 | ✅ |
| Whiteboard intégré | ⚠️ | ⚠️ | ✅ S2 | ✅ |
| Board collaboratif (Miro-like) | ❌ | ❌ | ✅ S2 | ✅ |
| Hébergement UE | ❌ | ❌ | ✅ | ✅ |
| E2E encryption | ⚠️ | ⚠️ | ✅ S4 | ✅ |
| Open-source / Tauri Rust | ❌ | ❌ | ❌ | ✅ |
| Prix (Free) | 40min max | Via M365 | Illimité | Illimité |

---

## 📈 Métriques de succès

| Phase | KPI | Objectif |
|-------|-----|----------|
| Phase 1 | Réunions/semaine | 1000 en beta |
| Phase 2 | Partages d'écran | 60% des réunions |
| Phase 3 | Transcriptions activées | 40% des réunions |
| Phase 4 | Webinars organisés | 50/mois |
| Phase 5 | MAU mobile ImuMeet | 10 000 |
| Global | NPS post-réunion | > 45 |

---

## 🔗 Dépendances

| Module | Utilisation |
|--------|-------------|
| ImuBoard | Board interactif pendant les réunions |
| ImuDocs | Prise de notes live + résumé post-meeting |
| ImuSlides | Présentation de slides en réunion |
| ImuChat Core | Appels depuis chat, identité, Store |
| Alice IA | Transcription, résumé, actions post-meeting |
| ImuDrive | Enregistrements, fichiers partagés en réunion |

---

*Ce document est la roadmap détaillée du module ImuMeet (Visioconférence).*  
*Référence globale : `IMUOFFICE_ROADMAP_GLOBAL.md`*  
*Créé le 10 mars 2026 — ImuChat Sovereign Suite*
