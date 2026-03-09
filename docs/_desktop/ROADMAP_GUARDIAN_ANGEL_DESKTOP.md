# 🛡️ ROADMAP — Imu Guardian Angel · Desktop App ImuChat

**Date de création :** 9 mars 2026  
**Document source :** `docs/Gardian_Angel_Vision.md`  
**Pré-requis :** Phase C5 complétée (IA, Companion basique), Phase C6 recommandée (sécurité Electron)  
**Stack :** Electron 30 · Vite 5 · React 18 · TypeScript 5 · Supabase · Mapbox GL JS / Leaflet · Node.js APIs natives  
**Roadmaps liées :** `IMUCOMPANION_ROADMAP_DESKTOP.md` (IC-D5 → triggers IA), `ROADMAP_DESKTOP_FEATURES_NATIVE.md` (Phase 7)  
**Plateformes sœurs :** `docs/_web/ROADMAP_GUARDIAN_ANGEL_WEB.md` · `docs/_mobile/ROADMAP_GUARDIAN_ANGEL_MOBILE.md`

---

## Positionnement

**Imu Guardian Angel Desktop** offre une expérience complémentaire à la version mobile.  
Sur desktop, l'accent est mis sur le **centre de commande familial**, la **cyber-sécurité renforcée** (phishing, data breach, sessions), la **planification voyage** et le **monitoring multi-écran**.

**Avantages natifs desktop :** fenêtre dédiée multi-écran, system tray quick SOS, notifications natives OS, intégration fichiers locaux (export PDF/CSV), keyboard shortcuts, écran large pour carte + dashboard côte à côte, processing local pour IA.

---

## Vue d'ensemble

| Phase | Nom | Sprints | Durée estimée |
|-------|-----|:-------:|:-------------:|
| GA-D1 | Fondations & Architecture Electron | 2 | 4 semaines |
| GA-D2 | Alertes & Dashboard Multi-Panel | 2 | 4 semaines |
| GA-D3 | Carte & Navigation Desktop | 2 | 4 semaines |
| GA-D4 | Mode Urgence & SOS Desktop | 2 | 4 semaines |
| GA-D5 | Mode Voyage & Centre Famille | 2 | 4 semaines |
| GA-D6 | Cyber Sécurité Avancée & Monétisation | 2 | 4 semaines |
| **Total** | | **12 sprints** | **24 semaines** |

---

## Phase GA-D1 — Fondations & Architecture Electron (Sprints 1-2)

> 🎯 Réutiliser le backend partagé + exploiter les capacités Electron.

### Sprint 1 · Backend Partagé & IPC Guardian

| Tâche | Description | Priorité |
|-------|-------------|:--------:|
| **Schéma Supabase** | Réutilise le schéma commun : `guardian_profiles`, `risk_alerts`, `alert_subscriptions`, `sos_events`. Même RLS que web/mobile | 🟠 P0 |
| **Types partagés** | Import `@imuchat/shared-types` : `RiskCategory`, `RiskLevel`, `GuardianAlert`, `SOSEvent`, `TravelBrief`, `SafeRoute`, `GuardianProfile`. Alignés cross-platform | 🟠 P0 |
| **Store Zustand** | `stores/guardian-store.ts` — même shape que web/mobile. Persist via electron-store | 🟠 P0 |
| **IPC channels Guardian** | `ipcMain`/`ipcRenderer` channels : `guardian:sos-trigger`, `guardian:tray-status`, `guardian:notification`, `guardian:geolocation`. Secure preload expose | 🟠 P0 |
| **Service APIs** | `services/guardian/` — même abstraction GuardianDataProvider. GDACS, WHO, ACLED, OpenWeather. Fetch depuis le main process (pas de CORS) | 🟡 P1 |

**Livrables Sprint 1 :**
- ✅ Backend Supabase partagé cross-platform
- ✅ Types 1:1 alignés
- ✅ IPC channels sécurisés
- ✅ Data providers via main process (bypass CORS)

### Sprint 2 · UI Shell & System Tray

| Tâche | Description | Priorité |
|-------|-------------|:--------:|
| **Page /guardian** | Page Guardian avec layout sidebar : Dashboard, Carte, Alertes, Voyage, Famille, Cyber, Settings. Exploite la largeur écran desktop (split view) | 🟠 P0 |
| **System Tray Guardian** | Icône tray avec risk level couleur (🟢🟡🟠🔴). Menu contextuel : "Ouvrir Guardian", "SOS", "Mode Escorte ON/OFF", "Statut : [niveau]" | 🟠 P0 |
| **Notifications natives OS** | `new Notification()` Electron avec icon, body, actions. Alerte 🔴 → notification urgente (son + badge). Paramétrable via Notification Center OS | 🟡 P1 |
| **Géolocalisation** | Geolocation API (Chromium) + fallback IP-based. Note : moins précis que mobile — afficher marge d'erreur | 🟡 P1 |
| **Keyboard shortcuts** | `Ctrl+Shift+S` → SOS, `Ctrl+Shift+G` → ouvrir Guardian, `Ctrl+Shift+E` → mode escorte toggle | 🟡 P1 |

**Livrables Sprint 2 :**
- ✅ Page Guardian multi-panel desktop
- ✅ System tray avec statut risque + quick actions
- ✅ Notifications OS natives
- ✅ Keyboard shortcuts Guardian

---

## Phase GA-D2 — Alertes & Dashboard Multi-Panel (Sprints 3-4)

> 🎯 Dashboard plein écran avec vue simultanée carte + alertes + risques.

### Sprint 3 · Moteur d'Alertes Desktop

| Tâche | Description | Priorité |
|-------|-------------|:--------:|
| **Risk Engine** | Même logique serveur-side (Supabase Edge Function). Score composite 0-100, 4 niveaux. Cache local electron-store pour mode offline | 🟠 P0 |
| **6 catégories de risques** | Catastrophes 🌪, Sanitaire 🦠, Géopolitique 🌍, Conflits ⚔️, Criminalité 🚨, Sécurité Personnelle 👤 — mêmes catégories cross-platform | 🟠 P0 |
| **Supabase Realtime** | Subscription temps réel filtrée par zone. Nouvelles alertes → notification OS + tray badge update + son optionnel | 🟠 P0 |
| **Liste alertes** | Panel latéral : liste scrollable, filtres (catégorie, sévérité, distance), recherche, tri par date/sévérité. Clic → détail sur panel principal | 🟡 P1 |

**Livrables Sprint 3 :**
- ✅ Risk Engine avec cache offline
- ✅ 6 catégories + Realtime
- ✅ Alertes panel avec filtres avancés

### Sprint 4 · Dashboard Multi-Panel

| Tâche | Description | Priorité |
|-------|-------------|:--------:|
| **Split view dashboard** | Layout desktop : gauche = carte miniature + carte risques, droite = jauge score + radar catégories + historique 30j (recharts). Redimensionnable | 🟡 P1 |
| **Multi-window** | Possibilité d'ouvrir la carte dans une fenêtre séparée (BrowserWindow). Utile pour multi-écran : carte sur écran 2, dashboard sur écran 1 | 🟡 P1 |
| **Heatmap criminalité** | Overlay carte chaleur avec données criminalité, zoom adaptatif, légende | 🟡 P1 |
| **Préférences alertes** | Settings complètes : catégories, rayon, seuil notification, quiet hours, son alerte, position tray | 🟡 P1 |
| **Export données** | Export PDF/CSV des alertes, historique risques, statistiques. Dialogue natif de sauvegarde (`dialog.showSaveDialog`) | 🟢 P2 |

**Livrables Sprint 4 :**
- ✅ Dashboard split view (carte + stats)
- ✅ Mode multi-fenêtre / multi-écran
- ✅ Export PDF/CSV natif

---

## Phase GA-D3 — Carte & Navigation Desktop (Sprints 5-6)

> 🎯 Carte plein écran avec layers avancés et itinéraires sécurisés.

### Sprint 5 · Carte Interactive Desktop

| Tâche | Description | Priorité |
|-------|-------------|:--------:|
| **Carte plein écran** | Mapbox GL JS (rendu WebGL performant sur desktop). Markers alertes, polygones zones, position utilisateur, clustering. Contrôles zoom/rotate/tilt | 🟠 P0 |
| **Layers avancés** | Desktop peut afficher plus de layers simultanément : toutes catégories + POI + heatmap + itinéraires. Toggle sidebar avec checkboxes | 🟡 P1 |
| **Analyse IA contextuelle** | Panel latéral : "Analyse zone" → résumé IA (Alice) + recommandations. Historique des analyses sauvegardé localement | 🟡 P1 |
| **Search & bookmarks** | Barre recherche avec autocomplete + lieux favoris (bookmarkés). Historique recherche | 🟡 P1 |
| **Impression carte** | Export carte en image PNG haute résolution. Menu clic droit → "Imprimer cette zone" (electron print API) | 🟢 P2 |

**Livrables Sprint 5 :**
- ✅ Carte WebGL haute performance
- ✅ Layers multiples simultanés
- ✅ Analyse IA + export carte

### Sprint 6 · Itinéraires Sécurisés

| Tâche | Description | Priorité |
|-------|-------------|:--------:|
| **Safe routing** | Itinéraires sécurisés via Mapbox Directions : évitement zones rouges, scoring sécurité par segment | 🟠 P0 |
| **Comparaison côte à côte** | Affichage 3 itinéraires simultanés sur la carte (couleurs distinctes) + tableau comparatif (temps, score sécu, zones) | 🟡 P1 |
| **Partage itinéraire** | Partage vers contacts via lien ImuChat + option email/copier lien | 🟡 P1 |
| **Mode nuit** | Carte dark mode + highlight éclairage si data dispo | 🟢 P2 |

**Livrables Sprint 6 :**
- ✅ Itinéraires sécurisés avec comparaison visuelle
- ✅ Partage multi-canal

---

## Phase GA-D4 — Mode Urgence & SOS Desktop (Sprints 7-8)

> 🎯 SOS via tray/keyboard avec alertes contacts et mode escorte.

### Sprint 7 · SOS & Alertes Contacts

| Tâche | Description | Priorité |
|-------|-------------|:--------:|
| **SOS tray + keyboard** | Déclenchement : `Ctrl+Shift+S` (long 3s) ou menu tray "SOS". Confirmation modale anti-faux déclenchement | 🟠 P0 |
| **Contacts urgence** | Page gestion contacts (max 5). Import depuis contacts OS (si autorisé) ou saisie manuelle. Chiffrés Supabase | 🟠 P0 |
| **Séquence SOS desktop** | (1) Position → contacts, (2) Email automatique (via Supabase Edge Function / SendGrid), (3) Notification push ImuChat aux contacts, (4) Entrée `sos_events` | 🟠 P0 |
| **Notification SOS overlay** | Fenêtre overlay plein écran transparente avec countdown annulable + instruction "SOS envoyé à X contacts" (always-on-top BrowserWindow) | 🟡 P1 |

**Livrables Sprint 7 :**
- ✅ SOS tray + keyboard (Ctrl+Shift+S)
- ✅ Séquence SOS email + push
- ✅ Overlay SOS plein écran

### Sprint 8 · Mode Escorte & Enregistrement

| Tâche | Description | Priorité |
|-------|-------------|:--------:|
| **Mode escorte** | "Je rentre" : suivi via Geolocation API (refresh 30s). Alerte si arrêt prolongé. Notification contacts à l'arrivée. Visible dans le tray | 🟡 P1 |
| **Enregistrement audio** | MediaRecorder API : enregistrement audio discret, lié au SOS event, upload chiffré Supabase Storage | 🟡 P1 |
| **Timeline SOS** | Vue chronologique post-événement avec positions, actions, enregistrements. Export PDF natif (`dialog.showSaveDialog`) | 🟡 P1 |
| **Appel discret** | Fenêtre "appel entrant" factice (BrowserWindow always-on-top, sonnerie audio) | 🟢 P2 |

**Livrables Sprint 8 :**
- ✅ Mode escorte avec suivi tray
- ✅ Enregistrement audio chiffré
- ✅ Export PDF timeline SOS

---

## Phase GA-D5 — Mode Voyage & Centre Famille (Sprints 9-10)

> 🎯 Planning voyage riche + centre de commande familial grand écran.

### Sprint 9 · Mode Voyage Desktop

| Tâche | Description | Priorité |
|-------|-------------|:--------:|
| **Page voyage** | Interface destination avec carte monde, sélection pays/ville, dates, génération briefing. Layout multi-colonne desktop | 🟠 P0 |
| **Travel Brief enrichi** | Même API que web/mobile + affichage enrichi desktop : tabs (Sécurité, Santé, Pratique, Carte), images, liens utiles | 🟠 P0 |
| **Check-lists interactives** | Checklists générées IA, cochables, imprimables (export PDF). Drag & drop pour réorganiser | 🟡 P1 |
| **Alertes voyage** | Auto-activation alertes zone destination. Historique voyages passés | 🟡 P1 |
| **Export dossier voyage** | Compilation PDF complet : briefing + checklist + carte + contacts urgence locaux + ambassade | 🟢 P2 |

**Livrables Sprint 9 :**
- ✅ Briefing voyage multi-tabs (desktop-optimisé)
- ✅ Checklists IA imprimables
- ✅ Export dossier voyage PDF complet

### Sprint 10 · Centre Famille Grand Écran

| Tâche | Description | Priorité |
|-------|-------------|:--------:|
| **Dashboard famille** | Carte grand format avec positions membres, sidebar statuts, dernière activité. Layout optimisé grand écran avec panneau détail | 🟠 P0 |
| **Partage position** | Consent-based. Affichage temps réel sur carte. Historique trajets (24h) | 🟠 P0 |
| **Geofencing config** | Interface Desktop pour définir zones sûres : dessiner sur carte (polygon tool), nommer, assigner membres. Alertes entrée/sortie | 🟡 P1 |
| **Multi-window famille** | Fenêtre séparée "Famille" détachable : surveillance permanente sur écran secondaire | 🟡 P1 |
| **Rapports famille** | Rapport hebdomadaire : trajets, temps passé par zone, alertes, PDF exportable | 🟢 P2 |

**Livrables Sprint 10 :**
- ✅ Centre famille grand écran (carte + statuts)
- ✅ Geofencing dessiné sur carte
- ✅ Mode multi-fenêtre détachable

---

## Phase GA-D6 — Cyber Sécurité Avancée & Monétisation (Sprints 11-12)

> 🎯 Protection numérique renforcée desktop + monétisation.

### Sprint 11 · Cyber Sécurité Desktop

| Tâche | Description | Priorité |
|-------|-------------|:--------:|
| **Dashboard cyber** | Score sécurité compte, sessions actives (avec révocation), force mot de passe, 2FA status, alertes scam/phishing, data breach check | 🟡 P1 |
| **Détection phishing** | Scan messages chat ImuChat. Desktop ajoute : scan liens copiés dans le presse-papier (`clipboard.readText` Electron — opt-in uniquement) | 🟡 P1 |
| **Alertes data breach** | Check HIBP API. Notification native OS si compromis. Bouton direct changement mot de passe | 🟡 P1 |
| **Scan réseau local** | Desktop-only : scan réseau Wi-Fi local pour détecter appareils inconnus (Node.js `net` / `dns`). Alerte si appareil suspect | 🟢 P2 |
| **Verrouillage app** | Verrouillage Guardian par PIN ou biométrie (Touch ID Mac via Electron / Windows Hello) avant accès données sensibles (famille, SOS history) | 🟡 P1 |

**Livrables Sprint 11 :**
- ✅ Dashboard cyber complet
- ✅ Scan phishing + clipboard
- ✅ Scan réseau local (desktop-only)
- ✅ Verrouillage biométrique

### Sprint 12 · Monétisation & Polish

| Tâche | Description | Priorité |
|-------|-------------|:--------:|
| **Modèle Freemium** | Gratuit : alertes 🟠🔴, score risque, 1 contact urgence. Premium (Stripe 5-10€/mois) : illimité, escorte, voyage, famille, cyber, 5 contacts, export PDF | 🟠 P0 |
| **Paywall UI** | Dialog natif paywall avec feature comparison, CTA Stripe Checkout. Réutilise infrastructure Wallet existante | 🟠 P0 |
| **Onboarding** | Wizard 4 étapes dialog : (1) Présentation, (2) Permissions, (3) Contacts urgence, (4) Préférences. Option "Rappeler plus tard" | 🟡 P1 |
| **Analytics** | Tracking usage module. Supabase analytics + local electron-store stats | 🟡 P1 |
| **Tests** | Tests unitaires (Vitest) : risk-engine, sos-service, travel-brief, phishing. Tests E2E (Playwright Electron) : flow SOS, flow voyage, flow alertes | 🟡 P1 |

**Livrables Sprint 12 :**
- ✅ Freemium Stripe intégré
- ✅ Onboarding wizard
- ✅ Tests > 70%

---

## Dépendances

### Dépendances internes ImuChat

```
Auth (Supabase) ──────────────────────────► GA-D1 (profiles, RLS)
Phase C5 IA (Alice + Companion) ──────────► GA-D3 (analyse contextuelle)
ImuCompanion (IC-D5) ────────────────────► GA-D4 (SOS vocal Companion)
Phase C6 Sécurité Electron ──────────────► GA-D1 (CSP, secure storage)
Chat système ─────────────────────────────► GA-D6 (phishing in-chat)
Stripe / Wallet (Sprint B-4) ────────────► GA-D6 (subscription Premium)
```

### Fonctionnalités Desktop-Only (vs Web & Mobile)

| Fonctionnalité | Desktop | Web | Mobile | Raison |
|----------------|:-------:|:---:|:------:|--------|
| Multi-window / multi-écran | ✅ | ❌ | ❌ | BrowserWindow Electron |
| System tray avec statut risque | ✅ | ❌ | ❌ | Tray API Electron |
| Keyboard shortcuts (Ctrl+Shift+S) | ✅ | Partiel | ❌ | globalShortcut Electron |
| Scan réseau local | ✅ | ❌ | ❌ | Node.js net/dns |
| Clipboard phishing scan | ✅ | ❌ | ❌ | clipboard API Electron |
| Export PDF natif (dialog) | ✅ | Basique | ❌ | dialog.showSaveDialog |
| Impression carte | ✅ | Basique | ❌ | webContents.print |
| Centre famille grand écran | ✅ | Adaptatif | ❌ | Large screen layout |
| Fenêtre famille détachable | ✅ | ❌ | ❌ | BrowserWindow séparé |
| Touch ID / Windows Hello | ✅ | ❌ | Via expo | systemPreferences Electron |

### Dépendances avec roadmaps domaines

| Roadmap | Phase requise | Raison |
|---------|:-------------:|--------|
| `DESKTOP_ROADMAP_UNIFIED.md` | S22-S23 (C5 IA) | Alice IA pour analyse contextuelle |
| `IMUCOMPANION_ROADMAP_DESKTOP.md` | IC-D5 | Companion peut déclencher SOS vocalement |
| `DESKTOP_ROADMAP_UNIFIED.md` | S24-S26 (C6 Sécu) | CSP, secure storage requis |

---

## Risques & Mitigations

| # | Risque | Prob. | Impact | Mitigation |
|---|--------|:-----:|:------:|------------|
| GA-R1 | APIs externes indisponibles | 🟡 | 🟠 | Cache electron-store, offline mode, multi-provider |
| GA-R2 | Géolocalisation imprécise (desktop = IP-based) | 🟠 | 🟡 | Afficher marge d'erreur, demander confirmation zone, permettre saisie manuelle |
| GA-R3 | RGPD données localisation | 🟠 | 🔴 | Consentement explicite, pas de stockage permanent, chiffrement, suppression auto 30j |
| GA-R4 | Memory footprint Guardian (carte + multi-window) | 🟡 | 🟡 | Lazy load carte, libérer BrowserWindow quand fermée, process isolation |
| GA-R5 | Scan réseau perçu comme intrusif | 🟡 | 🟡 | Feature opt-in uniquement, explication claire, pas d'envoi de données réseau au serveur |
| GA-R6 | Responsabilité légale alerte manquée | 🟠 | 🔴 | Disclaimer "aide à la décision", CGU spécifiques, pas de substitut services d'urgence |

---

## KPIs de succès

| KPI | Cible GA-D3 | Cible GA-D6 | Cible GA-D6+3mois |
|-----|:-----------:|:-----------:|:------------------:|
| Taux d'activation | ≥ 10% | ≥ 20% | ≥ 30% |
| Dashboard consultations / sem | ≥ 2/user | ≥ 3/user | ≥ 5/user |
| SOS déclenchés / mois | Baseline | ≥ 5 | Tracking |
| Multi-window utilisé | — | ≥ 15% users | ≥ 25% |
| Export PDF / mois | — | ≥ 50 | ≥ 200 |
| Conversion gratuit → Premium | — | ≥ 2% | ≥ 4% |
| Briefings voyage / mois | — | ≥ 80 | ≥ 300 |
| Scan réseau activations | — | ≥ 5% users | ≥ 10% |
| NPS module Guardian | — | ≥ 35 | ≥ 45 |

---

## Résumé exécutif

| Donnée | Valeur |
|--------|--------|
| **Sprints** | 12 (GA-D1 à GA-D6 · 2 sprints/phase) |
| **Durée** | ~24 semaines (~6 mois) |
| **Équipe** | 1 dev Electron senior + 1 dev frontend + 1 designer (partiel) |
| **Effort estimé** | ~800-1000 heures-dev |
| **Démarrage conseillé** | Après S23 (C5 IA) — ~S47 du planning desktop unifié (ou en parallèle de C7 Cross-Domain) |
| **Modèle économique** | Freemium (gratuit + Premium 5-10€/mois Stripe) |
| **APIs externes** | 7 (GDACS, WHO, ACLED, OpenWeather, Mapbox, HIBP, Stripe) |
| **Features desktop-only** | 10 (multi-window, tray, shortcuts, scan réseau, clipboard scan, export PDF, print, grand écran famille, fenêtre détachable, biométrie OS) |
| **Résultat** | Module Guardian Angel Desktop — Centre de commande sécurité, multi-fenêtre, cyber renforcé, export natif, mode famille grand écran |
