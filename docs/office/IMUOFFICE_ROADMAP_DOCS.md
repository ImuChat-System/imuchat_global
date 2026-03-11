# 📄 ROADMAP DÉTAILLÉE — ImuDocs (Suite Office)
**Module :** ImuDocs · ImuSheets · ImuSlides · ImuPDF  
**Date de création :** 10 mars 2026 · **Version :** 1.0  
**Durée :** ~10 mois · **Sprints :** 20 × 2 semaines  
**Stack :** TipTap · Hyperformula · Yjs · Supabase · ImuDrive · Alice IA  
**Plateformes :** Web PWA · Mini-app ImuChat · Desktop Electron → Tauri · Mobile React Native

---

## 📐 Architecture technique

```
┌──────────────────────────────────────────────────────────────────┐
│                     ImuDocs Architecture                         │
├────────────────┬─────────────────────────┬───────────────────────┤
│   Éditeur UI   │   Collaboration Core    │   Backend Services    │
│                │                         │                       │
│  TipTap        │  Yjs (CRDT)             │  imu-docs-service     │
│  (ProseMirror) │  + y-websocket          │  imu-storage-service  │
│                │  + awareness            │  imu-convert-service  │
│  Hyperformula  │  (curseurs multi-users) │  imu-sign-service     │
│  (tableur)     │                         │  (eIDAS)              │
│                │  Persistance :          │                       │
│  Reveal.js     │  ImuDrive S3 UE         │  Alice IA :           │
│  (slides)      │  + Supabase metadata    │  suggestions,         │
│                │                         │  résumés, correction  │
└────────────────┴─────────────────────────┴───────────────────────┘
```

---

## 📁 Structure monorepo

```
imuoffice/
├── packages/
│   ├── @imuchat/office-core/         # Types, CRDT, sync (partagé)
│   ├── @imuchat/office-ui/           # Composants éditeurs React
│   └── @imuchat/office-converters/   # Import/export .docx, .xlsx, .pptx
├── apps/
│   ├── office-web/                   # Next.js (PWA)
│   ├── office-mobile/                # Expo React Native
│   └── office-desktop/               # Electron V1 → Tauri V2
└── services/
    ├── docs-service/                 # API documents
    ├── storage-service/              # ImuDrive S3 UE
    ├── convert-service/              # Conversion formats
    └── sign-service/                 # Signature eIDAS
```

---

## 🏗️ Phase 0 — Fondations communes (Semaines 1-4)
*Partagée avec ImuBoard et ImuMeet*

### Sprint 0-A (S1-S2) — Monorepo & Types

- [ ] Initialiser monorepo `imuoffice/` dans l'écosystème ImuChat
- [ ] Package `@imuchat/office-core` :
  - Types : `Document`, `Sheet`, `Slide`, `DocumentVersion`, `Collaborator`
  - Types : `EditorState`, `CursorPosition`, `ChangeEvent`
- [ ] Schéma Supabase :
  - Tables : `documents`, `document_versions`, `document_collaborators`
  - Tables : `document_comments`, `document_permissions`
  - RLS policies RGPD
- [ ] CI/CD pipeline (tests + build + deploy UE)

### Sprint 0-B (S3-S4) — Infrastructure Storage & Temps réel

- [ ] ImuDrive S3 (OVHcloud Object Storage UE)
  - Buckets : `docs-content`, `docs-media`, `docs-exports`
  - Chiffrement AES-256 au repos
- [ ] Serveur Yjs (`y-websocket`) auto-hébergé UE
- [ ] Configuration LiveKit (pour ImuMeet, partagé)
- [ ] Package `@imuchat/office-ui` — composants de base :
  - `EditorToolbar`, `CollaboratorAvatars`, `DocumentHeader`
  - `SaveStatus`, `VersionBadge`, `ShareModal`

**Livrables Phase 0 :** Infra opérationnelle, types définis, BDD déployée ✅

---

## 📝 Phase 1 — ImuDocs MVP : Éditeur texte collaboratif (Semaines 5-8)

### Sprint 1-A (S5-S6) — Éditeur TipTap + Collaboration Yjs

- [ ] Intégration TipTap avec extensions :
  - StarterKit (bold, italic, headings, listes)
  - `@tiptap/extension-collaboration` (Yjs)
  - `@tiptap/extension-collaboration-cursor` (curseurs)
  - Table, Image, Code Block, Mention
- [ ] Collaboration temps réel :
  - Curseurs nommés et colorés par utilisateur
  - Présence (qui est en train d'éditer)
  - Conflit resolution automatique (CRDT)
- [ ] Auto-sauvegarde toutes les 30 secondes → ImuDrive
- [ ] Composant `DocumentEditor` principal

### Sprint 1-B (S7-S8) — Fonctionnalités essentielles

- [ ] Historique de versions (max 100 versions, diff visuel)
- [ ] Commentaires inline (ancrage sur texte sélectionné)
- [ ] Suggestions / mode révision (accepter / refuser)
- [ ] Export PDF basique (Puppeteer côté serveur)
- [ ] Page `/docs/[id]` — éditeur complet
- [ ] Page `/docs` — liste des documents de l'utilisateur
- [ ] Mini-app ImuChat : ouverture d'un document dans un chat

**Livrables Phase 1 :** Éditeur texte collaboratif fonctionnel, accessible via web et mini-app ✅

---

## 📊 Phase 2 — Import/Export & Alice IA (Semaines 9-12)

### Sprint 2-A (S9-S10) — Compatibilité formats

- [ ] Import `.docx` → TipTap JSON (via `mammoth.js` + convertisseur custom)
- [ ] Export `.docx` (via `docx-js`)
- [ ] Import `.odt` (via LibreOffice serveur)
- [ ] Export `.odt`, `.txt`, `.md`, `.html`
- [ ] Gestion des images inline (upload automatique ImuDrive)
- [ ] Test de fidélité import/export (suite de 50 documents test)

### Sprint 2-B (S11-S12) — Alice IA dans ImuDocs

- [ ] Barre latérale Alice IA dans l'éditeur :
  - Complétion de phrases (via API Alice)
  - Reformulation / amélioration du style
  - Correction orthographique & grammaticale avancée
  - Résumé automatique du document
  - Traduction instantanée (FR/EN/DE/ES/IT)
- [ ] Extraction intelligente (tableau → ImuSheets, liste → todo)
- [ ] Suggestions de formatage selon le type de document détecté

**Livrables Phase 2 :** Compatibilité .docx complète, Alice IA intégrée ✅

---

## 📊 Phase 3 — ImuSheets : Tableur collaboratif (Semaines 13-16)

### Sprint 3-A (S13-S14) — Moteur tableur

- [ ] Intégration Hyperformula (moteur de calcul)
  - Support 300+ fonctions Excel-compatibles
  - Formules : SOMME, SI, RECHERCHEV, TABLEAU_CROISÉ_DYNAMIQUE
- [ ] UI tableur custom React :
  - Rendu virtualisé (100k+ lignes sans lag)
  - Redimensionnement colonnes/lignes
  - Sélection multi-cellules, copier-coller
  - Mise en forme conditionnelle
- [ ] Collaboration Yjs : verrouillage optimiste par cellule

### Sprint 3-B (S15-S16) — Fonctionnalités avancées

- [ ] Graphiques (Chart.js intégré : barres, lignes, secteurs, aire)
- [ ] Tableaux croisés dynamiques basiques
- [ ] Import `.xlsx` (SheetJS)
- [ ] Export `.xlsx`, `.csv`
- [ ] Scripts automatisés (macros JavaScript sandboxées)
- [ ] Alice IA : analyse de données, formule suggérée, détection d'anomalies

**Livrables Phase 3 :** ImuSheets MVP — tableur collaboratif compatible Excel ✅

---

## 📽️ Phase 4 — ImuSlides : Présentations (Semaines 17-20)

### Sprint 4-A (S17-S18) — Éditeur de slides

- [ ] Éditeur canvas de slides (Fabric.js ou canvas API custom)
  - Ajout texte, images, formes, icônes
  - Thèmes et templates (12 templates professionnels)
  - Transitions et animations basiques
- [ ] Mode présentateur :
  - Vue présentateur (notes + chronomètre + slide suivante)
  - Présentation en plein écran
  - Contrôle à distance depuis mobile (QR code)
- [ ] Collaboration Yjs sur slides

### Sprint 4-B (S19-S20) — Intégrations & Export

- [ ] Import `.pptx` (pptx-js)
- [ ] Export `.pptx`, `.pdf`
- [ ] Intégration ImuMeet : présenter directement en visio
- [ ] Intégration ImuBoard : insérer un board comme slide
- [ ] Alice IA : génération de slides depuis un texte / un plan
- [ ] Templates sectoriels : Pitch Deck, Rapport, Formation

**Livrables Phase 4 :** ImuSlides MVP — présentations collaboratives compatibles PPTX ✅

---

## 📑 Phase 5 — ImuPDF & Signature eIDAS (Semaines 21-24)

### Sprint 5-A (S21-S22) — ImuPDF complet

- [ ] Lecteur PDF haute performance (PDF.js)
- [ ] Annotation PDF :
  - Surlignage, commentaires, formes, flèches
  - Annotations collaboratives (Yjs)
  - Export PDF annoté
- [ ] OCR (Tesseract.js côté serveur) — rendre les PDFs scannés cherchables
- [ ] Extraction intelligente Alice : tableaux → ImuSheets, texte → ImuDocs

### Sprint 5-B (S23-S24) — Signature électronique eIDAS

- [ ] Flux de signature numérique (eIDAS simple et avancé)
- [ ] Intégration avec des PSC (Prestataires de Services de Confiance) UE
- [ ] Certificat de signature horodaté
- [ ] Audit trail complet (qui a signé, quand, depuis quelle IP)
- [ ] Envoi de demandes de signature multi-signataires

**Livrables Phase 5 :** ImuPDF + Signature eIDAS — marché secteur public / juridique débloqué ✅

---

## 💻 Phase 6 — Applications Desktop & Mobile (Semaines 25-32)

### Sprint 6-A (S25-S26) — Desktop Electron V1

- [ ] App Electron+React `office-desktop/`
  - Réutilisation 100% des composants `@imuchat/office-ui`
  - IPC bridge Electron pour : accès fichiers locaux, menu natif, notifications
  - Mode hors-ligne complet (Yjs offline + sync au reconnect)
  - Synchronisation ImuDrive en background
- [ ] Distribution via Store ImuChat
  - Auto-updater (electron-updater)
  - Signature numérique binaire (Code Signing EU)
  - Packaging : `.exe` (Windows), `.dmg` (macOS), `.AppImage` (Linux)

### Sprint 6-B (S27-S28) — Mobile React Native

- [ ] App Expo `office-mobile/`
  - ImuDocs Lite : lecture + édition basique
  - ImuSheets Lite : consultation + édition cellules
  - ImuSlides Lite : présentation mobile
  - ImuPDF : lecture + annotation tactile
- [ ] Distribution via Store ImuChat (+ App Store / Play Store en parallèle)
- [ ] Sync offline avec résolution conflits Yjs

### Sprint 6-C (S29-S30) — Enterprise & GED

- [ ] Multi-tenant (espaces de travail par organisation)
- [ ] SSO SAML 2.0 / OpenID Connect
- [ ] LDAP / Active Directory
- [ ] GED basique : workflow d'approbation, archivage légal, rétention
- [ ] Tableaux de bord admin (utilisateurs, usage, conformité RGPD)
- [ ] RBAC granulaire (lecteur, commentateur, éditeur, admin)

### Sprint 6-D (S31-S32) — Polish & ImuOffice 1.0

- [ ] Performance : chargement < 1.5s, lazy loading, code splitting
- [ ] Accessibilité WCAG AA
- [ ] i18n : FR, EN, DE, ES, IT, PL
- [ ] Tests E2E (Playwright) — couverture 80%+
- [ ] Documentation utilisateur + API développeurs
- [ ] 🚀 **ImuDocs / ImuOffice 1.0 — Production**

**Livrables Phase 6 :** Suite complète sur toutes les plateformes ✅

---

## 🦀 Phase 7 — Tauri V2 / Rust Desktop (Mois 13-18)

*Migration progressive du desktop Electron vers Tauri+Rust*

### Objectifs Tauri V2

| Aspect | Electron (actuel) | Tauri V2 (cible) |
|--------|-------------------|------------------|
| Taille binaire | ~150 MB | ~12 MB |
| RAM au repos | ~300 MB | ~50 MB |
| Démarrage | ~3s | <1s |
| Chiffrement fichiers | Node.js crypto | Rust native (ring) |
| Accès FS | Node.js fs | Rust tokio + async |
| WebRTC | Via Electron | Via webrtc-rs |
| Sécurité | Moyen | Excellent (sandbox) |

### Sprints Tauri (S33-S44)

- [ ] **S33-S34 :** Architecture Tauri v2, commandes Rust de base, IPC migration
- [ ] **S35-S36 :** Chiffrement Rust (ring crate), accès fichiers sécurisé
- [ ] **S37-S38 :** Sync ImuDrive en Rust (tokio + reqwest), offline robuste
- [ ] **S39-S40 :** WebRTC Rust natif (pour ImuMeet intégré)
- [ ] **S41-S42 :** Tests performance, comparaison benchmarks Electron vs Tauri
- [ ] **S43-S44 :** 🚀 **ImuOffice 2.0 Tauri — Distribution via Store ImuChat**

---

## 📈 Métriques de succès

| Phase | KPI | Objectif |
|-------|-----|----------|
| Phase 1 | Documents créés en collaboration | 500 en beta |
| Phase 2 | Import .docx sans perte | 95% fidélité |
| Phase 3 | Compatibilité formules Excel | 95%+ |
| Phase 5 | Contrats signés eIDAS | 1000 en 3 mois |
| Phase 6 | Téléchargements desktop | 5000 en 1 mois |
| Global | NPS utilisateurs | > 40 |

---

## 🔗 Dépendances

| Module | Utilisation |
|--------|-------------|
| ImuBoard | Insertion de boards dans slides et documents |
| ImuMeet | Présentation de slides en visio |
| ImuChat Core | Mini-app, identité ImuID, Store distribution |
| Alice IA | Suggestions, résumés, génération, traduction |
| ImuDrive | Stockage S3 UE chiffré |

---

*Ce document est la roadmap détaillée du module ImuDocs (Suite Office).*  
*Référence globale : `IMUOFFICE_ROADMAP_GLOBAL.md`*  
*Créé le 10 mars 2026 — ImuChat Sovereign Suite*
