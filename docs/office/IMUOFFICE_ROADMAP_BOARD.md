# 🎨 ROADMAP DÉTAILLÉE — ImuBoard (Whiteboard Interactif)
**Module :** ImuBoard  
**Date de création :** 10 mars 2026 · **Version :** 1.0  
**Durée :** ~7 mois · **Sprints :** 14 × 2 semaines  
**Stack :** Tldraw · Yjs · Awareness Protocol · ImuDrive · Canvas API  
**Plateformes :** Web PWA · Mini-app ImuChat · Intégré ImuMeet · Desktop Electron/Tauri · Mobile React Native

---

## 🎯 Positionnement

ImuBoard est **le module le plus différenciateur** de la suite ImuOffice.

> Miro coûte 10€/utilisateur/mois.  
> ImuBoard est **natif dans ImuChat** — aucune app tierce, aucun changement de contexte.  
> Un board s'ouvre directement dans un canal, une conversation, ou une visio ImuMeet.

**Cas d'usage principaux :**
- Rétrospectives Agile en équipe
- Brainstorming distribué
- Conception de parcours utilisateurs (UX flows)
- Enseignement interactif
- Présentation visuelle en réunion

---

## 📐 Architecture technique

```
┌──────────────────────────────────────────────────────────────────┐
│                     ImuBoard Architecture                        │
├──────────────────────┬───────────────────────────────────────────┤
│   Canvas Engine      │   Collaboration Layer                     │
│                      │                                           │
│   Tldraw             │   Yjs CRDT                                │
│   (open-source)      │   + y-websocket (sync serveur UE)         │
│                      │   + awareness (curseurs live)             │
│   Extensions custom  │                                           │
│   - Mindmap          │   Persistance :                           │
│   - Sticky template  │   JSON binaire → ImuDrive S3 UE           │
│   - Timer widget     │   + snapshots versionnés                  │
│   - Vote widget      │                                           │
└──────────────────────┴───────────────────────────────────────────┘
```

**Pourquoi Tldraw ?**
- Open-source (licence MIT pour usage interne)
- Canvas infini très performant (virtualisé)
- API extensible pour widgets custom
- Maintenu activement (2023-2026)
- Alternative : Excalidraw (moins extensible)

---

## 🏗️ Phase 0 — Fondations (Semaines 1-4)
*Partagée avec ImuDocs et ImuMeet*

Voir `IMUOFFICE_ROADMAP_GLOBAL.md` Phase 0 pour le détail.

**Spécifique ImuBoard :**
- [ ] Types `@imuchat/office-core` : `Board`, `BoardElement`, `BoardTemplate`, `BoardSession`
- [ ] Tables Supabase : `boards`, `board_versions`, `board_templates`, `board_collaborators`
- [ ] Bucket ImuDrive : `boards-content`, `boards-assets`, `boards-exports`

---

## 🎨 Phase 1 — Canvas de base : dessin & formes (Semaines 5-8)

### Sprint 1-A (S5-S6) — Intégration Tldraw & Canvas infini

- [ ] Intégration Tldraw dans l'app web ImuChat
- [ ] Canvas infini avec zoom (10% → 1000%) et pan fluides
- [ ] Outils de base :
  - Crayon libre (freehand)
  - Formes : rectangles, ellipses, flèches, losanges, triangles
  - Texte (inline et zones de texte)
  - Lignes et connecteurs avec points d'ancrage
- [ ] Couleurs, épaisseurs, opacité, remplissage
- [ ] Couches (layers) : avant / arrière / grouper / dégrouper
- [ ] Grille magnétique, alignement auto, guides

### Sprint 1-B (S7-S8) — Collaboration temps réel

- [ ] Intégration Yjs + awareness sur Tldraw
  - Curseurs nommés temps réel (couleur unique par utilisateur)
  - Sélections visibles des autres participants
  - Opérations simultanées sans conflit (CRDT)
- [ ] Auto-sauvegarde continue → ImuDrive
- [ ] Historique d'annulation collaboratif (undo/redo partagé)
- [ ] Présence : liste des collaborateurs actifs sur le board
- [ ] Page `/board/[id]` — éditeur complet
- [ ] Page `/boards` — liste des boards de l'utilisateur
- [ ] Mini-app ImuChat : board depuis un canal / conversation

**Livrables Phase 1 :** Canvas collaboratif fonctionnel, accessible via web et mini-app ✅

---

## 📌 Phase 2 — Éléments riches & Templates (Semaines 9-12)

### Sprint 2-A (S9-S10) — Sticky notes & médias

- [ ] Sticky notes (post-its) :
  - 8 couleurs, redimensionnables, rotatables
  - Édition inline avec formatage basique
  - Groupement en clusters automatique
- [ ] Import d'images (drag & drop, upload, URL)
  - Redimensionnement, recadrage
- [ ] Import de PDF (rendu page par page, annoter dessus)
- [ ] Intégration ImuDocs : insérer un doc comme widget dans le board
- [ ] Icônes et emojis (librairie 5000+ éléments)
- [ ] Frameboards : délimiter des zones nommées

### Sprint 2-B (S11-S12) — Templates professionnels

- [ ] Bibliothèque de 20 templates officiels :

  | Template | Usage |
  |----------|-------|
  | Rétrospective Agile | Start/Stop/Continue |
  | Kanban Board | Backlog/Todo/Doing/Done |
  | Mindmap | Carte mentale centrale |
  | User Story Map | Parcours utilisateur |
  | SWOT Analysis | Forces/Faiblesses/Opportunités/Menaces |
  | Design Sprint | 5 jours de sprint de design |
  | Lean Canvas | Modèle business en 1 page |
  | OKR Board | Objectifs et résultats clés |
  | Wireframe Kit | Composants UI basiques |
  | Timeline | Frise chronologique |
  | Process Flow | Diagramme de flux |
  | Empathy Map | Carte d'empathie UX |
  | Brainstorming | Zone de génération d'idées |
  | Decision Matrix | Matrice de décision |
  | Team Charter | Charte d'équipe |
  | Impact/Effort Matrix | Priorisation 2x2 |
  | Fishbone Diagram | Analyse des causes |
  | ERD | Diagramme entité-relation |
  | Org Chart | Organigramme |
  | Venn Diagram | Diagramme de Venn |

- [ ] Templates personnalisables et sauvegardables
- [ ] Marketplace de templates (créateurs externes, Store ImuChat)

**Livrables Phase 2 :** ImuBoard riche avec templates — cas d'usage Agile et Design couverts ✅

---

## 🧠 Phase 3 — Mindmap, Widgets interactifs & Alice IA (Semaines 13-16)

### Sprint 3-A (S13-S14) — Mindmap natif

- [ ] Mode Mindmap :
  - Nœud central + branches récursives
  - Raccourci Tab → créer nœud enfant
  - Raccourci Enter → créer nœud frère
  - Collapsible/expandable branches
  - Auto-layout (horizontal, vertical, radial)
  - Couleurs par niveau de profondeur
- [ ] Conversion Mindmap → liste dans ImuDocs (et inversement)
- [ ] Export Mindmap : `.svg`, `.png`, `.json`

### Sprint 3-B (S15-S16) — Widgets interactifs & Alice IA

- [ ] Widgets interactifs :
  - **Timer / Pomodoro** (visible par tous les participants)
  - **Vote / Dot voting** (chaque participant pose ses points)
  - **Sondage rapide** (question + options + résultats live)
  - **Révélation différée** (masquer des éléments, révéler ensemble)
  - **Tableau de scores** (pour sessions de formation gamifiées)
- [ ] Alice IA dans ImuBoard :
  - Génération automatique de mindmap depuis un texte
  - Clustering intelligent de sticky notes similaires
  - Suggestion de prochaine étape sur un board rétrospective
  - Résumé du board en texte structuré → export vers ImuDocs
  - Détection de patterns (chemin critique, dépendances)

**Livrables Phase 3 :** Mindmap natif + widgets interactifs + Alice IA ✅

---

## 🔗 Phase 4 — Intégrations & Présentation (Semaines 17-22)

### Sprint 4-A (S17-S18) — Intégration ImuMeet

- [ ] **ImuBoard dans ImuMeet** (killer feature) :
  - Bouton "Ouvrir Board" depuis une visioconférence
  - Board affiché côte à côte avec les flux vidéo
  - Tous les participants peuvent dessiner simultanément
  - Laser pointer visible par tous (curseur animé)
  - Mode "Suivre l'animateur" (les participants suivent le scroll)
- [ ] Partage d'écran depuis ImuBoard (export live frame)

### Sprint 4-B (S19-S20) — Mode présentation & Export

- [ ] Mode Présentation :
  - Navigation frame par frame (zones nommées)
  - Vue plein écran pour l'animateur
  - Télécommande depuis mobile (QR code)
  - Zoom automatique sur zones désignées
- [ ] Export haute qualité :
  - `.png` et `.svg` (résolution configurable)
  - `.pdf` multi-pages (une page par frame)
  - Lien de partage public (lecture seule)
  - Embed code (iframe) pour sites externes

### Sprint 4-C (S21-S22) — Applications Desktop & Mobile

- [ ] Desktop Electron : plein support ImuBoard (même UX que web)
  - Shortcut clavier natif (Cmd/Ctrl + palette outils)
  - Drag & drop depuis le bureau (images, fichiers)
  - Stylet/tablette graphique (Wacom, Apple Pencil via écran tactile)
- [ ] Mobile React Native :
  - ImuBoard Touch : optimisé pour doigt et stylet
  - Pinch-to-zoom, pan tactile
  - Palette flottante (bubble UI)
  - Accès en consultation + annotation basique

**Livrables Phase 4 :** ImuBoard intégré à ImuMeet, mode présentation, desktop+mobile ✅

---

## 🚀 Phase 5 — Marketplace & Polish (Semaines 23-28)

### Sprint 5-A (S23-S24) — Marketplace templates & Store

- [ ] Portail créateurs de templates :
  - Soumettre un template au Store ImuChat
  - Tarification libre (0€ → 29€)
  - Commission ImuChat : 20%
  - Dashboard revenus créateur
- [ ] Catégories : Agile, UX, Business, Éducation, Créatif, Tech
- [ ] Système de notation et de commentaires
- [ ] Templates certifiés ImuChat (qualité garantie)

### Sprint 5-B (S25-S26) — Historique & Versioning avancé

- [ ] Snapshots manuels et automatiques (toutes les heures)
- [ ] Timeline visuelle des versions (miniatures)
- [ ] Restauration d'une version antérieure
- [ ] Diff visuel entre deux versions (éléments ajoutés/supprimés en couleur)
- [ ] Archivage boards (lecture seule, conservation illimitée)

### Sprint 5-C (S27-S28) — Polish & Performance

- [ ] Performance canvas : 10 000+ éléments sans ralentissement
- [ ] Optimisation collaboration : 50+ utilisateurs simultanés par board
- [ ] Accessibilité : navigation clavier complète, descriptions alt
- [ ] i18n : FR, EN, DE, ES, IT
- [ ] Tests E2E Playwright : couverture 75%+
- [ ] 🚀 **ImuBoard 1.0 — Production**

**Livrables Phase 5 :** ImuBoard complet, marketplace de templates, production-ready ✅

---

## 📈 Métriques de succès

| Phase | KPI | Objectif |
|-------|-----|----------|
| Phase 1 | Boards créés en beta | 200 en 2 semaines |
| Phase 2 | Templates utilisés | 80% des nouveaux boards |
| Phase 3 | Sessions mindmap | 500/mois |
| Phase 4 | Boards ouverts en visio | 30% des réunions ImuMeet |
| Phase 5 | Templates vendus en store | 100 ventes en 3 mois |
| Global | Utilisateurs actifs ImuBoard | 5000 en 6 mois |

---

## 🔗 Dépendances

| Module | Utilisation |
|--------|-------------|
| ImuMeet | Board intégré dans la visioconférence |
| ImuDocs | Insertion de docs dans boards, export résumé |
| ImuSlides | Conversion frames board → slides |
| ImuChat Core | Mini-app, identité, Store, partage dans chats |
| Alice IA | Génération, clustering, résumé, suggestions |
| ImuDrive | Assets (images, PDF) et persistance boards |

---

*Ce document est la roadmap détaillée du module ImuBoard (Whiteboard Interactif).*  
*Référence globale : `IMUOFFICE_ROADMAP_GLOBAL.md`*  
*Créé le 10 mars 2026 — ImuChat Sovereign Suite*
