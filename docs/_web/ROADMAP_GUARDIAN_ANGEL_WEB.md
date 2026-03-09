# 🛡️ ROADMAP — Imu Guardian Angel · Web App ImuChat

**Date de création :** 9 mars 2026  
**Document source :** `docs/Gardian_Angel_Vision.md`  
**Pré-requis :** Axe FX Phase 6 complétée (IA, Alice, Companion basique disponibles)  
**Stack :** Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS 3.4 · shadcn/ui · Supabase · Mapbox GL JS / Leaflet  
**Roadmaps liées :** `IMUCOMPANION_ROADMAP_WEBAPP.md` (IC-W5 → IA triggers), `ROADMAP_WEB_FEATURES_UX.md` (Phase 7)  
**Plateformes sœurs :** `docs/_mobile/ROADMAP_GUARDIAN_ANGEL_MOBILE.md` · `docs/_desktop/ROADMAP_GUARDIAN_ANGEL_DESKTOP.md`

---

## Positionnement

**Imu Guardian Angel** est un assistant IA spécialisé dans la sécurité et la prévention des risques.  
Il analyse la localisation, le contexte, le profil utilisateur et les données publiques mondiales pour donner des alertes, conseils et actions possibles.

**Modules dépendants :** Auth (profil), Géolocalisation (position), Alice IA (moteur NLP), ImuCompanion (déclencheurs contextuels), Notifications (push/in-app)

---

## Vue d'ensemble

| Phase | Nom | Sprints | Durée estimée |
|-------|-----|:-------:|:-------------:|
| GA-W1 | Fondations & Architecture | 2 | 4 semaines |
| GA-W2 | Alertes & Risques Temps Réel | 2 | 4 semaines |
| GA-W3 | Navigation Sécurisée & Carte | 2 | 4 semaines |
| GA-W4 | Mode Urgence & SOS | 2 | 4 semaines |
| GA-W5 | Mode Voyage & Protection Famille | 2 | 4 semaines |
| GA-W6 | Cyber Sécurité & Monétisation | 2 | 4 semaines |
| **Total** | | **12 sprints** | **24 semaines** |

---

## Phase GA-W1 — Fondations & Architecture (Sprints 1-2)

> 🎯 Poser l'infrastructure backend + frontend du module Guardian Angel sur le web.

### Sprint 1 · Backend & Data Layer

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Schéma Supabase Guardian Angel** | Tables : `guardian_profiles` (user_id, emergency_contacts[], home_location, work_location, preferences JSON), `risk_alerts` (id, type, severity, location, radius_km, source, expires_at), `alert_subscriptions` (user_id, alert_types[], radius_km, active), `sos_events` (id, user_id, location, type, status, contacts_notified[], recording_url) | 🟠 P0 | `supabase_guardian_angel.sql` |
| **API routes Guardian Angel** | Routes Next.js API : `POST /api/guardian/alerts` (fetch par zone), `GET /api/guardian/risk-score` (score position), `POST /api/guardian/sos` (déclencher SOS), `GET /api/guardian/travel-brief` (pays) | 🟠 P0 | `app/api/guardian/` |
| **Service APIs externes** | Intégrations : GDACS (catastrophes), WHO Disease Outbreak News (sanitaire), ACLED (conflits), OpenWeatherMap Alerts (météo), crime API locales. Abstraction `GuardianDataProvider` | 🟠 P0 | `services/guardian/data-providers/` |
| **Types partagés** | `types/guardian.ts` — `RiskCategory`, `RiskLevel` (🟢🟡🟠🔴), `GuardianAlert`, `SOSEvent`, `TravelBrief`, `SafeRoute`, `GuardianProfile` | 🟠 P0 | `types/guardian.ts` |
| **Store Zustand** | `stores/guardian-store.ts` — état : activeAlerts[], riskScore, sosActive, travelMode, preferences | 🟡 P1 | `stores/guardian-store.ts` |

**Livrables Sprint 1 :**

- ✅ Schéma Supabase avec RLS policies (user-scoped)
- ✅ API routes sécurisées (authentifié uniquement)
- ✅ 3+ data providers externes intégrés
- ✅ Types et store Zustand Guardian Angel

### Sprint 2 · UI Shell & Module Registration

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Page /guardian** | Page principale Guardian Angel : dashboard avec risk score zone actuelle, carte miniature, dernières alertes, accès rapides (SOS, Voyage, Famille) | 🟠 P0 | `app/[locale]/guardian/page.tsx` |
| **Layout Guardian** | Layout dédié avec sidebar navigation : Dashboard, Carte, Alertes, Voyage, Famille, Cyber, Settings | 🟡 P1 | `app/[locale]/guardian/layout.tsx` |
| **GuardianWidget** | Widget pour Home Hub : mini-card avec risk level actuel + dernière alerte + bouton SOS | 🟡 P1 | `components/guardian/GuardianWidget.tsx` |
| **Module Store entry** | Enregistrement dans le Store ImuChat : icône, description, screenshots, catégorie "Sécurité & Protection" | 🟡 P1 | Supabase `modules` table |
| **i18n Guardian** | Clés traduction FR/EN/JA pour tout le module Guardian Angel | 🟡 P1 | `messages/{fr,en,ja}.json` sections guardian.* |
| **Permission Geolocation** | Demande de permission géolocalisation (Geolocation API) avec fallback IP-based, dialogue d'explication | 🟠 P0 | `hooks/useGeolocation.ts` |

**Livrables Sprint 2 :**

- ✅ Page /guardian fonctionnelle avec dashboard basique
- ✅ Widget Guardian Angel pour Home Hub
- ✅ Module visible dans le Store
- ✅ Géolocalisation demandée et fonctionnelle

---

## Phase GA-W2 — Alertes & Risques Temps Réel (Sprints 3-4)

> 🎯 Système d'alertes multi-catégories avec niveaux de risque et notifications.

### Sprint 3 · Moteur d'Alertes

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Risk Engine service** | Service qui agrège les données de tous les providers, calcule un score de risque composite (0-100) par zone géographique, classifié en 4 niveaux (🟢🟡🟠🔴) | 🟠 P0 | `services/guardian/risk-engine.ts` |
| **6 catégories de risques** | Implémentation des 6 catégories : Catastrophes Naturelles 🌪, Risques Sanitaires 🦠, Risques Géopolitiques 🌍, Conflits Armés ⚔️, Criminalité Urbaine 🚨, Sécurité Personnelle 👤 | 🟠 P0 | `services/guardian/categories/` |
| **Alertes temps réel** | Supabase Realtime subscription sur `risk_alerts` filtrée par zone utilisateur. Nouvelles alertes → toast notification + badge Guardian | 🟠 P0 | `hooks/useGuardianAlerts.ts` |
| **Page /guardian/alerts** | Liste d'alertes filtrables par catégorie, sévérité, distance. Chaque alerte : type, niveau, source, date, distance, conseils | 🟡 P1 | `app/[locale]/guardian/alerts/page.tsx` |
| **Notification in-app** | Intégration avec le système de notifications ImuChat existant : badge sidebar, push browser (Notifications API) | 🟡 P1 | `components/guardian/AlertNotification.tsx` |

**Livrables Sprint 3 :**

- ✅ Risk Engine fonctionnel (score composite 0-100)
- ✅ 6 catégories de risques implémentées
- ✅ Alertes temps réel via Supabase Realtime
- ✅ Page alertes avec filtres

### Sprint 4 · Tableau de Bord Risques

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Dashboard enrichi** | Score de risque zone actuelle (jauge circulaire), breakdown par catégorie (radar chart), historique 30 jours (line chart), alertes actives | 🟡 P1 | `components/guardian/RiskDashboard.tsx` |
| **Heatmap criminalité** | Overlay carte avec données criminalité locales, code couleur par zone, légende, zoom adaptatif | 🟡 P1 | `components/guardian/CrimeHeatmap.tsx` |
| **Alertes personnalisées** | Page settings : choix des catégories actives, rayon d'alerte (1-50 km), seuil de notification (🟡 minimum ou 🟠 minimum), quiet hours | 🟡 P1 | `app/[locale]/guardian/settings/page.tsx` |
| **Historique alertes** | Journal des alertes reçues avec statut (vue, ignorée, action prise), analytics personnel | 🟢 P2 | `components/guardian/AlertHistory.tsx` |

**Livrables Sprint 4 :**

- ✅ Dashboard risques complet (jauge + radar + historique)
- ✅ Heatmap criminalité locale
- ✅ Préférences d'alertes personnalisables

---

## Phase GA-W3 — Navigation Sécurisée & Carte (Sprints 5-6)

> 🎯 Carte interactive avec itinéraires sécurisés et analyse contextuelle IA.

### Sprint 5 · Carte Interactive

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Page /guardian/map** | Carte pleine page (Mapbox GL JS ou Leaflet) avec layers : alertes actives (markers), zones de risque (polygones), position utilisateur | 🟠 P0 | `app/[locale]/guardian/map/page.tsx` |
| **Layers dynamiques** | Toggle layers par catégorie de risque, recherche d'adresse, geofencing visuel (rayon d'alerte), POI sécurité (hôpitaux, commissariats, ambassades) | 🟡 P1 | `components/guardian/MapLayers.tsx` |
| **Analyse contextuelle IA** | Intégration Alice IA : "Analyse ma zone actuelle" → résumé textuel du niveau de risque + recommandations. Exemple : "Il est 23h, zone à criminalité nocturne élevée. Recommandation : itinéraire éclairé ou VTC." | 🟡 P1 | `services/guardian/ai-analysis.ts` |
| **Responsive map** | Carte responsive : desktop plein écran, mobile drawer bottom sheet, sidebar collapsible sur tablette | 🟡 P1 | CSS responsive + composants adaptatifs |

**Livrables Sprint 5 :**

- ✅ Carte interactive avec markers alertes + zones risques
- ✅ Layers paramétrables + POI sécurité
- ✅ Analyse contextuelle IA fonctionnelle

### Sprint 6 · Itinéraires Sécurisés

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Safe routing** | Calcul d'itinéraire "le plus sûr" (pas le plus court) : évite zones rouges criminalité, privilégie rues éclairées, zones fréquentées. API Mapbox Directions + scoring sécurité | 🟠 P0 | `services/guardian/safe-routing.ts` |
| **Comparaison itinéraires** | Afficher 2-3 itinéraires : plus rapide vs plus sûr vs compromis. Chaque itinéraire avec score sécurité, temps estimé, zones traversées | 🟡 P1 | `components/guardian/RouteComparison.tsx` |
| **Mode nuit** | Thème carte sombre + highlight des éclairages publics (si data dispo), recommandations spécifiques nuit | 🟡 P1 | `components/guardian/NightMode.tsx` |
| **Partage itinéraire** | Partager son itinéraire avec un contact de confiance : lien temps réel, ETA, notification à l'arrivée | 🟢 P2 | `services/guardian/share-route.ts` |

**Livrables Sprint 6 :**

- ✅ Itinéraires sécurisés avec scoring
- ✅ Comparaison multi-itinéraires
- ✅ Mode nuit carte
- ✅ Partage d'itinéraire avec contacts

---

## Phase GA-W4 — Mode Urgence & SOS (Sprints 7-8)

> 🎯 Bouton SOS intelligent avec enregistrement, alertes contacts et suivi temps réel.

### Sprint 7 · Bouton SOS & Alertes Contacts

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Bouton SOS global** | Bouton SOS accessible depuis n'importe quelle page Guardian (floating, toujours visible). Activation : clic long 3s ou triple-clic rapide. Confirmation pour éviter faux déclenchements | 🟠 P0 | `components/guardian/SOSButton.tsx` |
| **Configuration contacts urgence** | Page gestion contacts d'urgence (max 5) : nom, téléphone, email, relation. Stockés chiffrés dans Supabase | 🟠 P0 | `app/[locale]/guardian/emergency-contacts/page.tsx` |
| **Déclenchement SOS** | Séquence SOS : (1) Envoi position GPS aux contacts, (2) SMS/email automatique avec lien suivi, (3) Notification push ImuChat aux contacts ImuChat, (4) Création entrée `sos_events` | 🟠 P0 | `services/guardian/sos-service.ts` |
| **Message SOS personnalisable** | Templates de message SOS par type (agression, malaise, accident, autre). Possibilité de message personnalisé | 🟡 P1 | `components/guardian/SOSTemplates.tsx` |

**Livrables Sprint 7 :**

- ✅ Bouton SOS fonctionnel avec anti-faux déclenchement
- ✅ Contacts d'urgence configurables (chiffrés)
- ✅ Séquence d'alerte multi-canal (position + message + push)

### Sprint 8 · Mode Escorte Virtuelle & Enregistrement

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Mode escorte** | "Je rentre chez moi" : Guardian suit le trajet, alerte si déviation > 500m, alerte si arrêt > 5min, notification arrivée aux contacts | 🟠 P0 | `services/guardian/escort-mode.ts` |
| **Enregistrement audio** | Activation discrète : enregistrement audio via MediaRecorder API, stocké en Supabase Storage (chiffré), lié au SOS event | 🟡 P1 | `services/guardian/audio-recorder.ts` |
| **Timeline SOS** | Vue chronologique de l'événement SOS : positions, actions, contacts alertés, enregistrements. Accessible post-SOS | 🟡 P1 | `components/guardian/SOSTimeline.tsx` |
| **Appel discret** | Un tap sur le bouton → appel factice (simulé) pour sortir d'une situation inconfortable sans éveiller les soupçons | 🟢 P2 | `components/guardian/FakeCall.tsx` |

**Livrables Sprint 8 :**

- ✅ Mode escorte virtuelle avec suivi temps réel
- ✅ Enregistrement audio discret (chiffré)
- ✅ Timeline SOS post-événement
- ✅ Appel discret fonctionnel

---

## Phase GA-W5 — Mode Voyage & Protection Famille (Sprints 9-10)

> 🎯 Briefing voyage intelligent et protection familiale / enfants.

### Sprint 9 · Mode Voyage

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Page /guardian/travel** | Interface voyage : champ destination (pays/ville), dates, génération du briefing sécurité | 🟠 P0 | `app/[locale]/guardian/travel/page.tsx` |
| **Travel Brief API** | Agrégation données pays : niveau sécurité global (FCO/MAE), vaccins recommandés (WHO), risques locaux, quartiers à éviter, numéros d'urgence locaux, ambassade, visa info | 🟠 P0 | `services/guardian/travel-brief.ts` |
| **Check-lists voyage** | Générées par IA selon destination : documents, vaccins, assurances, contacts utiles, kit urgence. Cochable, persistée | 🟡 P1 | `components/guardian/TravelChecklist.tsx` |
| **Alertes voyage** | Pendant le voyage : alertes locales activées pour la zone de destination, notifications push si nouvelle alerte dans la zone | 🟡 P1 | `services/guardian/travel-alerts.ts` |

**Livrables Sprint 9 :**

- ✅ Briefing voyage complet (sécurité, santé, pratique)
- ✅ Check-lists intelligentes par destination
- ✅ Alertes locales activées en voyage

### Sprint 10 · Protection Famille

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Page /guardian/family** | Dashboard famille : carte avec positions des membres, statuts, dernière activité | 🟠 P0 | `app/[locale]/guardian/family/page.tsx` |
| **Géolocalisation partagée** | Partage de position consent-based entre membres famille. Parent ↔ enfant avec permissions asymétriques (parent voit enfant, enfant peut être optionnel) | 🟠 P0 | `services/guardian/family-tracking.ts` |
| **Zones sûres (Geofencing)** | Définir des zones sûres (maison, école, travail). Alerte si un membre famille quitte/entre. Configuration par membre | 🟡 P1 | `components/guardian/SafeZones.tsx` |
| **Détection trajets anormaux** | IA détecte si un membre dévie significativement de ses trajets habituels (machine learning sur les patterns) | 🟡 P1 | `services/guardian/anomaly-detection.ts` |
| **Mode enfant** | Interface simplifiée pour enfants : bouton SOS agrandi, pas de carte détaillée, jeux éducatifs sécurité | 🟢 P2 | `components/guardian/ChildMode.tsx` |

**Livrables Sprint 10 :**

- ✅ Dashboard famille avec positions en temps réel
- ✅ Geofencing (zones sûres + alertes entrée/sortie)
- ✅ Détection de trajets anormaux (IA)
- ✅ Mode enfant simplifié

---

## Phase GA-W6 — Cyber Sécurité & Monétisation (Sprints 11-12)

> 🎯 Protection numérique intégrée + modèle freemium.

### Sprint 11 · Cyber Sécurité

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Page /guardian/cyber** | Dashboard cyber-sécurité : score sécurité compte (mot de passe, 2FA, sessions actives), alertes scam/phishing, tips | 🟡 P1 | `app/[locale]/guardian/cyber/page.tsx` |
| **Détection phishing** | Analyse IA des messages reçus dans le chat ImuChat : détection de liens suspects, messages d'arnaque, tentatives de phishing. Alerte inline + quarantaine | 🟡 P1 | `services/guardian/phishing-detector.ts` |
| **Alertes data breach** | Intégration Have I Been Pwned API (ou similaire) : vérification si l'email de l'utilisateur est dans une fuite de données | 🟡 P1 | `services/guardian/breach-check.ts` |
| **Conseils sécurité IA** | Alice IA donne des conseils cyber-sécurité contextuels : "Votre mot de passe n'a pas été changé depuis 6 mois" | 🟢 P2 | Intégration dans Alice IA |

**Livrables Sprint 11 :**

- ✅ Dashboard cyber-sécurité avec score
- ✅ Détection phishing dans les messages chat
- ✅ Vérification fuites de données
- ✅ Conseils contextuels IA

### Sprint 12 · Monétisation & Polish

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Modèle Freemium** | Tier gratuit : alertes basiques (🟠🔴 uniquement), score risque zone, 1 contact urgence. Tier Premium (5-10€/mois via Stripe) : toutes les alertes, navigation sécurisée, mode escorte, voyage, famille, cyber, 5 contacts | 🟠 P0 | `services/guardian/subscription.ts` |
| **Paywall UI** | Composant paywall avec feature comparison, CTA, intégration Stripe Checkout existant (réutiliser infra Wallet) | 🟠 P0 | `components/guardian/Paywall.tsx` |
| **Onboarding Guardian** | Wizard 4 étapes : (1) Présentation, (2) Permissions (localisation), (3) Contacts urgence, (4) Préférences alertes | 🟡 P1 | `components/guardian/Onboarding.tsx` |
| **Analytics module** | Tracking usage module : sessions, alertes vues, SOS déclenchés, conversions premium. Supabase + in-app analytics | 🟡 P1 | `services/guardian/analytics.ts` |
| **Tests** | Tests unitaires : risk-engine, sos-service, travel-brief, phishing-detector. Tests E2E : flow SOS, flow voyage, flow alertes | 🟡 P1 | `__tests__/guardian/` |

**Livrables Sprint 12 :**

- ✅ Modèle freemium Stripe intégré
- ✅ Onboarding wizard 4 étapes
- ✅ Analytics module complet
- ✅ Tests unitaires + E2E > 70%

---

## Dépendances

### Dépendances internes ImuChat

```
Auth (Supabase) ──────────────────────────────► GA-W1 (profiles, RLS)
Notifications système ─────────────────────────► GA-W2 (alertes push)
Alice IA (NLP) ────────────────────────────────► GA-W3 (analyse contextuelle)
ImuCompanion (IC-W5) ──────────────────────────► GA-W4 (SOS triggers Companion)
Chat système ──────────────────────────────────► GA-W6 (phishing in-chat)
Stripe / Wallet ───────────────────────────────► GA-W6 (subscription Premium)
```

### Dépendances externes (APIs tierces)

| API | Usage | Phase | Criticité |
|-----|-------|:-----:|:---------:|
| GDACS | Catastrophes naturelles temps réel | GA-W1 | 🟠 Élevée |
| WHO Disease Outbreaks | Alertes sanitaires mondiales | GA-W1 | 🟡 Moyenne |
| ACLED | Conflits armés et événements violents | GA-W1 | 🟡 Moyenne |
| OpenWeatherMap Alerts | Alertes météo sévères | GA-W1 | 🟡 Moyenne |
| Mapbox GL JS / Directions | Carte interactive + routing | GA-W3 | 🟠 Élevée |
| Have I Been Pwned | Data breach check | GA-W6 | 🟢 Faible |
| Stripe | Subscriptions Premium | GA-W6 | 🟠 Élevée |

### Dépendances avec roadmaps domaines

| Roadmap | Phase requise | Raison |
|---------|:-------------:|--------|
| `ROADMAP_WEB_FEATURES_UX.md` | Phase 6 (IA) | Alice IA disponible pour analyse contextuelle |
| `IMUCOMPANION_ROADMAP_WEBAPP.md` | IC-W5 | Companion peut déclencher SOS vocalement |
| `ROADMAP_WEB_QUALITY_SECURITY.md` | Phase 2+ | CSP, sanitization requis pour les data providers |

---

## Risques & Mitigations

| # | Risque | Prob. | Impact | Mitigation |
|---|--------|:-----:|:------:|------------|
| GA-R1 | APIs externes indisponibles (GDACS, ACLED down) | 🟡 Moyen | 🟠 Élevé | Cache 24h, fallback données statiques par pays, multi-provider par catégorie |
| GA-R2 | Faux déclenchement SOS massif | 🟡 Moyen | 🟠 Élevé | Confirmation 3s long-press, cooldown 5min, limite 3 SOS/jour (sauf override) |
| GA-R3 | RGPD — données de localisation sensibles | 🟠 Élevé | 🔴 Critique | Pas de stockage permanent localisation, données chiffrées, consentement explicite, suppression auto 30j |
| GA-R4 | Précision géolocalisation insuffisante (indoor, VPN) | 🟡 Moyen | 🟡 Moyen | Fallback IP-based, demander confirmation manuelle de la zone, afficher marge d'erreur |
| GA-R5 | Coûts APIs Mapbox/providers élevés | 🟡 Moyen | 🟡 Moyen | Caching agressif, rate limiting par user, tier gratuit Mapbox (50k req/mois) |
| GA-R6 | Responsabilité légale si alerte manquée | 🟠 Élevé | 🔴 Critique | Disclaimer clair "aide à la décision, pas de garantie", CGU spécifiques module Guardian, pas de substitute aux services d'urgence |

---

## KPIs de succès

| KPI | Cible GA-W3 | Cible GA-W6 | Cible GA-W6+3mois |
|-----|:-----------:|:-----------:|:------------------:|
| Taux d'activation (installs Store) | ≥ 15% | ≥ 25% | ≥ 35% |
| Score risque consultation / semaine | ≥ 2/user | ≥ 4/user | ≥ 5/user |
| SOS déclenchés / mois (vrais) | Baseline | ≥ 10 | Tracking |
| Alertes lues / alertes reçues | ≥ 50% | ≥ 65% | ≥ 75% |
| Conversion gratuit → Premium | — | ≥ 3% | ≥ 5% |
| Mode escorte activations / sem | — | ≥ 50 | ≥ 200 |
| Briefings voyage générés / mois | — | ≥ 100 | ≥ 500 |
| Phishing détectés / mois | — | ≥ 20 | ≥ 50 |
| NPS module Guardian | — | ≥ 40 | ≥ 50 |

---

## Résumé exécutif

| Donnée | Valeur |
|--------|--------|
| **Sprints** | 12 (GA-W1 à GA-W6 · 2 sprints/phase) |
| **Durée** | ~24 semaines (~6 mois) |
| **Équipe** | 2 devs (1 fullstack + 1 frontend) + 1 designer (partiel) |
| **Effort estimé** | ~800-1000 heures-dev |
| **Démarrage conseillé** | Après FX Phase 6 (IA/Alice) — ~S33 du planning web global |
| **Modèle économique** | Freemium (gratuit + Premium 5-10€/mois) |
| **APIs externes** | 7 (GDACS, WHO, ACLED, OpenWeather, Mapbox, HIBP, Stripe) |
| **Résultat** | Module Guardian Angel Web — Assistant IA sécurité personnel, alertes mondiales, navigation sécurisée, SOS, voyage, famille, cyber |
