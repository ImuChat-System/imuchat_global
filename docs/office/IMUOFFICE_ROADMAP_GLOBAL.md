# 🏛️ ROADMAP GLOBALE — ImuOffice Suite
**Module :** ImuDocs · ImuBoard · ImuMeet  
**Date de création :** 10 mars 2026  
**Version :** 1.0  
**Objectif :** Diversification des revenus d'ImuChat via une suite collaborative souveraine européenne  
**Distribution :** Store ImuChat · Web · Mobile (iOS/Android) · Desktop (Electron + Tauri/Rust)

---

## 🗺️ Architecture des Roadmaps

```
┌──────────────────────────────────────────────────────────────────────┐
│                    IMUOFFICE ROADMAP GLOBALE                         │
│                     (ce document — ~18 mois)                         │
├─────────────────┬────────────────────┬───────────────────────────────┤
│  ROADMAP 1      │  ROADMAP 2         │  ROADMAP 3                    │
│  ImuDocs        │  ImuBoard          │  ImuMeet                      │
│  Suite Office   │  Whiteboard        │  Visioconférence              │
│  ~10 mois       │  ~7 mois           │  ~8 mois                      │
│  7 phases       │  5 phases          │  6 phases                     │
├─────────────────┴────────────────────┴───────────────────────────────┤
│            Exécution parallèle possible à partir du mois 3           │
│    Squad Office  ∥  Squad Board/Meet  ∥  Infrastructure partagée     │
├──────────────────────────────────────────────────────────────────────┤
│          Phase 0 — Fondations partagées (Mois 1-2, commune)          │
│     @imuchat/office-core · LiveKit infra · ImuDrive S3 · BDD         │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Résumé exécutif

| Paramètre | Valeur |
|-----------|--------|
| **Durée totale** | ~18 mois (en parallèle) |
| **Phases totales** | 18 (3 modules × 6 phases moyennes) |
| **Sprints estimés** | ~54 sprints de 2 semaines |
| **Stack desktop** | Electron+React (V1) → Tauri+Rust (V2 haute perf.) |
| **Stack mobile** | React Native (Expo) |
| **Stack temps réel** | Yjs (CRDT) + LiveKit (WebRTC) |
| **Hébergement** | UE — OVHcloud / Scaleway |
| **Premier produit livrable** | ImuDocs MVP (Mois 5) |
| **Suite complète** | ImuOffice 1.0 (Mois 12) |
| **Version Tauri/Rust** | ImuOffice 2.0 (Mois 18) |

---

## 🗓️ Planning global consolidé — Vue par trimestre

### 🟥 T1 — Fondations & Infrastructure (Mois 1-3)

| Mois | Module | Phase | Focus |
|------|--------|-------|-------|
| M1 | **Tous** | Phase 0 | Monorepo `imuoffice/`, types partagés, BDD schéma, ImuDrive S3 UE |
| M2 | **Tous** | Phase 0 | LiveKit infra auto-hébergée, `@imuchat/office-core`, CI/CD |
| M3 | ImuDocs | Phase 1 | Éditeur texte TipTap + Yjs collaboratif MVP |
| M3 | ImuMeet | Phase 1 | Salles LiveKit basiques, audio/vidéo HD |

### 🟧 T2 — MVP des 3 modules (Mois 4-6)

| Mois | Module | Phase | Focus |
|------|--------|-------|-------|
| M4 | ImuDocs | Phase 2 | Import/export .docx, Alice IA (suggestions), mini-app ImuChat |
| M4 | ImuMeet | Phase 2 | Grille vidéo 25 participants, partage écran avancé |
| M5 | ImuBoard | Phase 1 | Canvas infini Tldraw, sticky notes, formes, curseurs multi-users |
| M5 | ImuDocs | Phase 3 | ImuSheets MVP (tableur Hyperformula) |
| M6 | ImuMeet | Phase 3 | Intégration ImuBoard en visio, transcription Whisper |
| M6 | ImuBoard | Phase 2 | Templates (rétrospective, brainstorming, kanban), mindmap |

### 🟨 T3 — Intégration & Distribution (Mois 7-9)

| Mois | Module | Focus |
|------|--------|-------|
| M7 | ImuDocs | ImuSlides MVP (présentations), mode présentateur |
| M7 | ImuMeet | Enregistrement cloud, sous-salles (breakout rooms) |
| M8 | **Tous** | App Electron+React desktop — distribution via Store ImuChat |
| M8 | ImuBoard | Intégration dans chats ImuChat, annotation PDF |
| M9 | **Tous** | App React Native mobile (iOS + Android) |
| M9 | ImuDocs | Signature électronique eIDAS, ImuPDF complet |

### 🟩 T4 — ImuOffice 1.0 (Mois 10-12)

| Mois | Module | Focus |
|------|--------|-------|
| M10 | **Tous** | Polish UX, offline mode, sync différée |
| M10 | ImuMeet | Réduction bruit IA (RNNoise), arrière-plans virtuels |
| M11 | **Tous** | Version On-Premise Enterprise (SSO, LDAP, RBAC) |
| M11 | ImuDocs | Historique versions diff visuel, GED workflow |
| M12 | **Tous** | 🚀 **ImuOffice 1.0 — Production complète** |

### 🔵 T5-T6 — ImuOffice 2.0 Tauri/Rust (Mois 13-18)

| Mois | Focus |
|------|-------|
| M13-M14 | Architecture Tauri v2 — migration backend Rust |
| M15-M16 | Performance natives : WebRTC Rust, chiffrement Rust, accès FS |
| M17 | Certification SecNumCloud, audit sécurité |
| M18 | 🚀 **ImuOffice 2.0 — Version Tauri/Rust haute performance** |

---

## 💰 Modèle économique

| Plan | Prix | Inclus |
|------|------|--------|
| **Free** | 0€ | 3 docs, visio 5 participants 30min, ImuBoard basic |
| **Pro** | 8€/mois | Illimité, 50 participants, 10h enregistrement, Alice IA, eIDAS |
| **Business** | 20€/mois | 500 participants, On-Premise, SSO, SLA 99.9% |
| **Institution** | Sur devis | SecNumCloud, déploiement air-gap, support dédié |

**Revenus Store ImuChat :**
- Commission 20% sur templates ImuBoard vendus par créateurs
- Plugins sectoriels (Santé RGPD, Juridique, Éducation) par partenaires

---

## 🔗 Documents de référence

| Document | Contenu |
|----------|---------|
| `IMUOFFICE_ROADMAP_DOCS.md` | Roadmap détaillée ImuDocs (Suite Office) |
| `IMUOFFICE_ROADMAP_BOARD.md` | Roadmap détaillée ImuBoard (Whiteboard) |
| `IMUOFFICE_ROADMAP_MEET.md` | Roadmap détaillée ImuMeet (Visioconférence) |

---

*Ce document est la source de vérité globale pour le développement ImuOffice.*  
*Créé le 10 mars 2026 — ImuChat Sovereign Suite*
