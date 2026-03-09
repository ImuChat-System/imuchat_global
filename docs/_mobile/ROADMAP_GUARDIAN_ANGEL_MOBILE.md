# 🛡️ ROADMAP — Imu Guardian Angel · Mobile App ImuChat

**Date de création :** 9 mars 2026  
**Document source :** `docs/Gardian_Angel_Vision.md`  
**Pré-requis :** Axe A Phase 6 complétée (Polish & Perf), Alice IA disponible  
**Stack :** Expo SDK 52+ · React Native · TypeScript 5 · Zustand · expo-router · expo-location · react-native-maps · Supabase  
**Roadmaps liées :** `IMUCOMPANION_ROADMAP_MOBILE.md` (IC-M5 → triggers IA), `ROADMAP_MOBILE_NAVIGATION_HUB.md` (Phase 7)  
**Plateformes sœurs :** `docs/_web/ROADMAP_GUARDIAN_ANGEL_WEB.md` · `docs/_desktop/ROADMAP_GUARDIAN_ANGEL_DESKTOP.md`

---

## Positionnement

**Imu Guardian Angel** est un assistant IA spécialisé dans la sécurité et la prévention des risques.  
Sur mobile, il exploite les capteurs natifs (GPS, accéléromètre, caméra, micro) pour offrir une protection contextuelle supérieure à la version web.

**Avantages natifs mobile :** GPS haute précision (expo-location), background location tracking, push notifications natives, enregistrement audio/vidéo natif (expo-av), haptic feedback, biométrie (FaceID/TouchID), appels téléphoniques réels (expo-linking), accéléromètre (détection chute).

---

## Vue d'ensemble

| Phase | Nom | Sprints | Durée estimée |
|-------|-----|:-------:|:-------------:|
| GA-M1 | Fondations & Capteurs Natifs | 2 | 4 semaines |
| GA-M2 | Alertes & Risques Temps Réel | 2 | 4 semaines |
| GA-M3 | Navigation Sécurisée & Carte Native | 2 | 4 semaines |
| GA-M4 | Mode Urgence & SOS Natif | 2 | 4 semaines |
| GA-M5 | Mode Voyage & Protection Famille | 2 | 4 semaines |
| GA-M6 | Cyber Sécurité, Monétisation & Capteurs Avancés | 2 | 4 semaines |
| **Total** | | **12 sprints** | **24 semaines** |

---

## Phase GA-M1 — Fondations & Capteurs Natifs (Sprints 1-2)

> 🎯 Infrastructure backend partagée + intégration capteurs natifs mobile.

### Sprint 1 · Backend Partagé & Types

| Tâche | Description | Priorité |
|-------|-------------|:--------:|
| **Schéma Supabase Guardian Angel** | Réutilise le schéma commun (si non créé par Web) : `guardian_profiles`, `risk_alerts`, `alert_subscriptions`, `sos_events`. RLS user-scoped | 🟠 P0 |
| **Types partagés** | `types/guardian.ts` — `RiskCategory`, `RiskLevel`, `GuardianAlert`, `SOSEvent`, `TravelBrief`, `SafeRoute`, `GuardianProfile`. Alignés 1:1 avec le web | 🟠 P0 |
| **Store Zustand** | `stores/guardian-store.ts` — activeAlerts[], riskScore, sosActive, travelMode, escortActive, preferences. Persist AsyncStorage | 🟠 P0 |
| **Service APIs** | `services/guardian/` — GuardianDataProvider abstraction. Même providers que web (GDACS, WHO, ACLED, OpenWeather). Client HTTP partagé | 🟠 P0 |
| **API service layer** | `services/guardian-api.ts` — CRUD Supabase (alertes, profil, SOS events). Réutilise les mêmes tables que web | 🟡 P1 |

**Livrables Sprint 1 :**

- ✅ Schéma Supabase partagé avec la web-app
- ✅ Types Guardian 1:1 alignés cross-platform
- ✅ Store Zustand avec persistence
- ✅ Services API data providers

### Sprint 2 · Capteurs & Permissions Natives

| Tâche | Description | Priorité |
|-------|-------------|:--------:|
| **expo-location intégration** | Foreground + Background location avec `expo-location`. Permissions granulaires : "pendant l'utilisation" / "toujours" (pour escorte). Accuracy: BestForNavigation | 🟠 P0 |
| **Écran Guardian Hub** | Tab ou page dédiée `/guardian` : score risque zone, mini-carte, dernières alertes, accès rapides (SOS, Voyage, Famille). Style bottom sheet ou full page | 🟠 P0 |
| **Widget Home Hub** | `components/home/widgets/GuardianWidget.tsx` — risk level badge (🟢🟡🟠🔴), dernière alerte, bouton SOS mini. Intégré au système de widgets Axe A Phase 3 | 🟡 P1 |
| **FAB contextuel Guardian** | Action "🛡️ Guardian" dans le FAB universel. Contextuel : sur Home → ouvre Guardian Hub, sur Chat → scan phishing | 🟡 P1 |
| **Permissions dialogue** | Écran d'explanation avant demande permissions : localisation, notifications, microphone, caméra. Respecte les guidelines Apple/Google | 🟡 P1 |
| **Push notifications** | Configuration expo-notifications pour les alertes Guardian : channels/categories dédiés (Alerte, SOS, Famille) | 🟡 P1 |

**Livrables Sprint 2 :**

- ✅ Géolocalisation native (foreground + background)
- ✅ Guardian Hub accessible
- ✅ Widget Guardian dans Home Hub
- ✅ Push notifications configurées

---

## Phase GA-M2 — Alertes & Risques Temps Réel (Sprints 3-4)

> 🎯 Système d'alertes push natives avec niveaux de risque et haptic feedback.

### Sprint 3 · Moteur d'Alertes Mobile

| Tâche | Description | Priorité |
|-------|-------------|:--------:|
| **Risk Engine** | Même logique que web — score composite 0-100, 4 niveaux (🟢🟡🟠🔴). Calcul côté serveur (Supabase Edge Function) pour économiser batterie | 🟠 P0 |
| **6 catégories de risques** | Catastrophes 🌪, Sanitaire 🦠, Géopolitique 🌍, Conflits ⚔️, Criminalité 🚨, Sécurité Personnelle 👤 — mêmes catégories que web | 🟠 P0 |
| **Alertes push natives** | Supabase Realtime → expo-notifications push locale. Rich notification avec image, catégorie, niveau, action buttons ("Voir sur carte", "Ignorer") | 🟠 P0 |
| **Haptic feedback** | Alertes 🔴 → Haptic fort (expo-haptics Heavy), 🟠 → Medium, 🟡 → Light. Pas de haptic pour 🟢 | 🟡 P1 |
| **Écran alertes** | Liste d'alertes FlatList avec filtres (catégorie, sévérité, distance). Pull-to-refresh. Swipe pour archiver | 🟡 P1 |

**Livrables Sprint 3 :**

- ✅ Risk Engine score composite (serveur-side)
- ✅ Push notifications natives riches avec actions
- ✅ Haptic feedback par sévérité
- ✅ Écran liste alertes natif

### Sprint 4 · Dashboard Risques Mobile

| Tâche | Description | Priorité |
|-------|-------------|:--------:|
| **Dashboard natif** | Score risque zone (jauge circulaire animée react-native-reanimated), breakdown catégories (radar SVG), tendance 7j (sparkline) | 🟡 P1 |
| **Alertes background** | Background fetch (expo-background-fetch) : vérification périodique des nouvelles alertes même app fermée. Push si alerte 🟠🔴 | 🟠 P0 |
| **Préférences alertes** | Settings : catégories actives, rayon (slider 1-50km), seuil notification, quiet hours, mode silencieux | 🟡 P1 |
| **Historique alertes** | Journal scrollable avec statuts (vue, ignorée, action). Statistiques mensuelles | 🟢 P2 |

**Livrables Sprint 4 :**

- ✅ Dashboard mobile natif animé
- ✅ Alertes background (app fermée)
- ✅ Préférences complètes

---

## Phase GA-M3 — Navigation Sécurisée & Carte Native (Sprints 5-6)

> 🎯 Carte react-native-maps avec itinéraires sécurisés et turn-by-turn.

### Sprint 5 · Carte Interactive Native

| Tâche | Description | Priorité |
|-------|-------------|:--------:|
| **Carte plein écran** | `react-native-maps` (MapView) avec markers alertes, polygones zones risque, position utilisateur animée, clustering pour les markers denses | 🟠 P0 |
| **Layers dynamiques** | Toggle layers par catégorie (switch list). POI sécurité : hôpitaux, commissariats, ambassades, pharmacies. Source : Overpass API / Google Places | 🟡 P1 |
| **Analyse contextuelle IA** | Intégration Alice IA : bottom sheet "Analyse ma zone" → résumé textuel + recommandations. Peut être lancée via ImuCompanion vocal | 🟡 P1 |
| **Search location** | Barre de recherche avec autocomplete (Google Places / Mapbox Geocoding). Tap résultat → zoom + risk score de la zone | 🟡 P1 |

**Livrables Sprint 5 :**

- ✅ Carte native performante avec markers + zones
- ✅ POI sécurité (hôpitaux, police, ambassades)
- ✅ Analyse IA contextuelle

### Sprint 6 · Itinéraires Sécurisés & Turn-by-Turn

| Tâche | Description | Priorité |
|-------|-------------|:--------:|
| **Safe routing** | Calcul itinéraire sécurisé (Mapbox Directions API) : évitement zones rouges, préférence éclairage/fréquentation. Fallback Google Directions | 🟠 P0 |
| **Comparaison itinéraires** | Bottom sheet avec 2-3 options : rapide / sûr / compromis. Score sécurité, durée, zones traversées (color-coded) | 🟡 P1 |
| **Turn-by-turn navigation** | Navigation guidée sur la carte avec instructions vocales (expo-speech). Alerte si entrée dans zone dangereuse pendant la navigation | 🟡 P1 |
| **Mode nuit** | Carte dark mode automatique (sunset/sunrise) + highlight zones éclairées si data dispo | 🟢 P2 |
| **Partage itinéraire** | Partage temps réel avec contact de confiance (lien deep link ImuChat, position auto-refresh 30s, ETA) | 🟡 P1 |

**Livrables Sprint 6 :**

- ✅ Itinéraires sécurisés avec scoring
- ✅ Navigation turn-by-turn vocale
- ✅ Mode nuit automatique
- ✅ Partage itinéraire temps réel

---

## Phase GA-M4 — Mode Urgence & SOS Natif (Sprints 7-8)

> 🎯 SOS natif avec enregistrement, appels réels, detection chute et volume button trigger.

### Sprint 7 · Bouton SOS & Alertes Contacts

| Tâche | Description | Priorité |
|-------|-------------|:--------:|
| **Bouton SOS persistent** | Floating SOS button accessible depuis Guardian Hub + FAB. Activation : long press 3s avec vibration progressive (expo-haptics). Widget lock screen (Android) | 🟠 P0 |
| **Volume button SOS** | Trigger SOS discret via 5× volume up rapides (BackgroundService). Pour les situations où l'écran n'est pas accessible | 🟠 P0 |
| **Contacts urgence** | Écran gestion contacts urgence (max 5). Sélection depuis carnet d'adresses natif (expo-contacts). Stockés chiffrés Supabase | 🟠 P0 |
| **Séquence SOS** | (1) Position GPS → contacts, (2) SMS natif (expo-sms) avec lien suivi, (3) Push ImuChat aux contacts ImuChat, (4) Appel automatique premier contact (expo-linking tel:), (5) Entrée `sos_events` | 🟠 P0 |
| **Templates SOS** | Messages SOS par type (agression, malaise, accident, autre) avec position GPS inline | 🟡 P1 |

**Livrables Sprint 7 :**

- ✅ Bouton SOS natif avec haptic + volume button trigger
- ✅ Contacts urgence depuis carnet natif
- ✅ Séquence SOS multi-canal (SMS + appel + push)

### Sprint 8 · Mode Escorte & Capteurs Avancés

| Tâche | Description | Priorité |
|-------|-------------|:--------:|
| **Mode escorte natif** | "Je rentre chez moi" : background location tracking (expo-location Background), alerte déviation > 500m, alerte arrêt > 5min, notification contacts à l'arrivée | 🟠 P0 |
| **Enregistrement audio/vidéo** | Activation discrète (dans la poche) : enregistrement audio (expo-av Audio.Recording), vidéo optionnelle (expo-camera). Upload chiffré Supabase Storage. Lié au SOS event | 🟡 P1 |
| **Détection de chute** | Accéléromètre (expo-sensors Accelerometer) : détection chute brutale. Si chute détectée → countdown 30s → SOS auto si pas d'annulation | 🟡 P1 |
| **Appel discret** | Fake call natif : sonnerie simulée, écran d'appel factice réaliste, "conversation" audio pré-enregistrée | 🟡 P1 |
| **Timeline SOS** | Vue chronologique post-SOS : positions, actions, enregistrements, contacts alertés. Exportable PDF | 🟢 P2 |

**Livrables Sprint 8 :**

- ✅ Mode escorte avec background tracking
- ✅ Enregistrement discret audio/vidéo (chiffré)
- ✅ Détection de chute avec SOS auto
- ✅ Fake call réaliste

---

## Phase GA-M5 — Mode Voyage & Protection Famille (Sprints 9-10)

> 🎯 Briefing voyage intelligent + suivi famille natif avec geofencing.

### Sprint 9 · Mode Voyage

| Tâche | Description | Priorité |
|-------|-------------|:--------:|
| **Écran voyage** | Interface destination (autocomplete pays/ville), dates, génération briefing sécurité. Card-based UI avec sections collapsibles | 🟠 P0 |
| **Travel Brief** | Même API que web : sécurité pays (FCO/MAE), vaccins (WHO), risques locaux, quartiers à éviter, numéros urgence, ambassade, visa | 🟠 P0 |
| **Check-lists voyage** | Générées par IA, cochables, persistées AsyncStorage + Supabase. Push reminder J-7 et J-1 | 🟡 P1 |
| **Alertes voyage** | Auto-activation des alertes pour la zone de destination. Push notifications même en background | 🟡 P1 |
| **Offline maps** | Téléchargement carte zone de destination pour consultation hors-ligne (Mapbox Offline) | 🟢 P2 |

**Livrables Sprint 9 :**

- ✅ Briefing voyage complet natif
- ✅ Check-lists avec push reminders
- ✅ Alertes voyage background
- ✅ Cartes offline (basique)

### Sprint 10 · Protection Famille

| Tâche | Description | Priorité |
|-------|-------------|:--------:|
| **Dashboard famille** | Carte avec positions temps réel des membres famille (react-native-maps markers). Statuts, dernière activité, batterie restante | 🟠 P0 |
| **Partage position** | Consent-based (invitation + acceptation). Permissions asymétriques parent/enfant. Background location sharing | 🟠 P0 |
| **Geofencing natif** | `expo-location` Geofencing : zones sûres (maison, école, travail). Events ENTER/EXIT → push notification parent | 🟡 P1 |
| **Détection trajets anormaux** | Pattern learning (7j historique) : alerte si déviation significative des trajets habituels d'un membre | 🟡 P1 |
| **Mode enfant** | Interface simplifiée : gros bouton SOS, pas de carte détaillée, avatar animé rassurant, jeux éducatifs sécurité | 🟢 P2 |
| **Widget famille Home** | Widget Home Hub : mini-carte famille, statuts badges, accès rapide | 🟢 P2 |

**Livrables Sprint 10 :**

- ✅ Dashboard famille temps réel sur carte
- ✅ Geofencing natif (zones sûres)
- ✅ Détection trajets anormaux
- ✅ Mode enfant simplifié

---

## Phase GA-M6 — Cyber Sécurité, Monétisation & Capteurs Avancés (Sprints 11-12)

> 🎯 Protection numérique + freemium + capteurs avancés mobile-only.

### Sprint 11 · Cyber Sécurité & Capteurs

| Tâche | Description | Priorité |
|-------|-------------|:--------:|
| **Écran cyber-sécurité** | Score sécurité compte, alertes scam, sessions actives, vérification biométrique (expo-local-authentication FaceID/TouchID) pour les actions sensibles | 🟡 P1 |
| **Détection phishing** | Scan messages chat ImuChat : liens suspects, patterns d'arnaque. Alerte inline dans le chat avec bouton "Signaler" | 🟡 P1 |
| **Alertes data breach** | Check HIBP API : notification si mail compromis. Bouton "Changer mot de passe" direct | 🟡 P1 |
| **Shake to SOS** | Si activé : secouer le téléphone fortement 3× → SOS en 5s (avec countdown annulable). Capteur accéléromètre | 🟢 P2 |
| **Noise detection** | Microphone ambiant : détection cri/bruit fort anormal → alerte discrète "Tout va bien ?" avec countdown SOS | 🟢 P2 |

**Livrables Sprint 11 :**

- ✅ Dashboard cyber-sécurité avec biométrie
- ✅ Détection phishing in-chat
- ✅ Shake to SOS + noise detection

### Sprint 12 · Monétisation & Polish

| Tâche | Description | Priorité |
|-------|-------------|:--------:|
| **Modèle Freemium** | Tier gratuit : alertes 🟠🔴, score risque, 1 contact urgence. Tier Premium (IAP via expo-in-app-purchases ou Stripe) : tout illimité, escorte, voyage, famille, cyber, 5 contacts | 🟠 P0 |
| **Paywall UI natif** | Bottom sheet paywall avec feature comparison, animations Lottie, CTA. Respecte les guidelines Apple/Google pour IAP | 🟠 P0 |
| **Onboarding Guardian** | Wizard 4 écrans (react-native-reanimated transitions) : (1) Présentation, (2) Permissions, (3) Contacts urgence, (4) Préférences | 🟡 P1 |
| **Apple Watch / Wear OS** | Specs pour extension future : SOS depuis montre, haptic alerte, position. Non implémenté mais architecture prête | 🟢 P2 |
| **Analytics** | Tracking usage : sessions, alertes, SOS, conversions. Supabase analytics | 🟡 P1 |
| **Tests** | Tests unitaires (Vitest/Jest) : risk-engine, sos-service, geofencing. Tests E2E (Detox) : flow SOS, flow voyage | 🟡 P1 |

**Livrables Sprint 12 :**

- ✅ Freemium IAP + Stripe intégré
- ✅ Onboarding 4 étapes animé
- ✅ Architecture Watch-ready
- ✅ Tests > 70%

---

## Dépendances

### Dépendances internes ImuChat

```
Auth (Supabase) ────────────────────────────► GA-M1 (profiles, RLS)
Home Hub Widgets (Axe A Phase 3) ───────────► GA-M1 (GuardianWidget)
FAB universel (Axe A Phase 2) ──────────────► GA-M1 (action Guardian)
Alice IA (NLP) ─────────────────────────────► GA-M3 (analyse contextuelle)
ImuCompanion (IC-M5) ──────────────────────► GA-M4 (SOS vocal Companion)
Chat système ───────────────────────────────► GA-M6 (phishing in-chat)
Stripe / IAP ───────────────────────────────► GA-M6 (subscription Premium)
```

### Dépendances natives Expo

| Package | Usage | Phase |
|---------|-------|:-----:|
| `expo-location` | Foreground + Background + Geofencing | GA-M1 |
| `expo-notifications` | Push locales + remote | GA-M2 |
| `expo-haptics` | Feedback haptique alertes | GA-M2 |
| `react-native-maps` | Carte native (Apple Maps / Google Maps) | GA-M3 |
| `expo-sensors` | Accéléromètre (chute, shake) | GA-M4 |
| `expo-av` | Enregistrement audio | GA-M4 |
| `expo-camera` | Enregistrement vidéo | GA-M4 |
| `expo-sms` | Envoi SMS SOS | GA-M4 |
| `expo-contacts` | Sélection contacts urgence | GA-M4 |
| `expo-speech` | Turn-by-turn vocal | GA-M3 |
| `expo-local-authentication` | Biométrie (FaceID/TouchID) | GA-M6 |
| `expo-background-fetch` | Alertes background | GA-M2 |

### Dépendances avec roadmaps domaines

| Roadmap | Phase requise | Raison |
|---------|:-------------:|--------|
| `ROADMAP_MOBILE_NAVIGATION_HUB.md` | Phase 3 (Widgets) | Système de widgets pour GuardianWidget |
| `ROADMAP_MOBILE_NAVIGATION_HUB.md` | Phase 2 (FAB) | Action Guardian dans le FAB |
| `IMUCOMPANION_ROADMAP_MOBILE.md` | IC-M5 | Companion peut déclencher SOS vocalement |

---

## Fonctionnalités Mobile-Only (vs Web)

| Fonctionnalité | Mobile | Web | Raison |
|----------------|:------:|:---:|--------|
| Background location tracking | ✅ | ❌ | Capteur GPS natif |
| Volume button SOS | ✅ | ❌ | Accès hardware buttons |
| Détection de chute | ✅ | ❌ | Accéléromètre natif |
| Shake to SOS | ✅ | ❌ | Accéléromètre natif |
| Noise detection | ✅ | ❌ | Microphone toujours accessible |
| Appel téléphonique réel (SOS) | ✅ | ❌ | expo-linking tel: |
| SMS natif (SOS) | ✅ | ❌ | expo-sms |
| Haptic feedback alertes | ✅ | ❌ | Moteur haptique |
| Geofencing natif | ✅ | ❌ | expo-location Geofencing |
| Turn-by-turn vocal | ✅ | Partiel | expo-speech + background audio |
| Offline maps | ✅ | ❌ | Mapbox Offline tiles |
| Apple Watch extension | ✅ (futur) | ❌ | WatchKit |

---

## Risques & Mitigations

| # | Risque | Prob. | Impact | Mitigation |
|---|--------|:-----:|:------:|------------|
| GA-R1 | APIs externes indisponibles | 🟡 | 🟠 | Cache 24h, fallback données statiques, multi-provider |
| GA-R2 | Faux SOS (volume button accidentel) | 🟠 | 🟠 | Countdown 5s annulable, cooldown 5min, confirmation haptic |
| GA-R3 | RGPD + App Store privacy | 🟠 | 🔴 | Consentement granulaire, App Tracking Transparency, pas de stockage permanent position, Privacy Nutrition Label complet |
| GA-R4 | Batterie consumée par background tracking | 🟠 | 🟡 | Significant location changes (low power), reduce accuracy hors escorte, monitoring batterie |
| GA-R5 | Rejet App Store (SOS features) | 🟡 | 🟠 | Documentation Apple Guidelines Emergency SOS, pas de remplacement du 911/112, disclaimer visible |
| GA-R6 | Responsabilité légale alerte manquée | 🟠 | 🔴 | Disclaimer "aide à la décision", CGU spécifiques, pas de substitut aux services d'urgence |
| GA-R7 | Background fetch limitation iOS | 🟡 | 🟡 | Push notifications server-side via APNs, fallback lors de l'ouverture app |

---

## KPIs de succès

| KPI | Cible GA-M3 | Cible GA-M6 | Cible GA-M6+3mois |
|-----|:-----------:|:-----------:|:------------------:|
| Taux d'activation | ≥ 20% | ≥ 30% | ≥ 40% |
| Score risque consultations / sem | ≥ 3/user | ≥ 5/user | ≥ 7/user |
| SOS déclenchés / mois (vrais) | Baseline | ≥ 15 | Tracking |
| Mode escorte activations / sem | — | ≥ 100 | ≥ 500 |
| Background alertes reçues / actionnées | — | ≥ 40% | ≥ 55% |
| Conversion gratuit → Premium | — | ≥ 4% | ≥ 7% |
| Briefings voyage / mois | — | ≥ 150 | ≥ 700 |
| Détection chute true positive | — | ≥ 85% | ≥ 92% |
| NPS module Guardian | — | ≥ 45 | ≥ 55 |

---

## Résumé exécutif

| Donnée | Valeur |
|--------|--------|
| **Sprints** | 12 (GA-M1 à GA-M6 · 2 sprints/phase) |
| **Durée** | ~24 semaines (~6 mois) |
| **Équipe** | 2 devs RN + 1 designer (partiel) |
| **Effort estimé** | ~900-1100 heures-dev |
| **Démarrage conseillé** | Après Axe A Phase 6 (Polish) — ~S33 du planning mobile global |
| **Modèle économique** | Freemium (gratuit + Premium via IAP/Stripe) |
| **APIs externes** | 7 (GDACS, WHO, ACLED, OpenWeather, Mapbox, HIBP, Stripe/IAP) |
| **Packages Expo** | 12 packages natifs (location, notifications, haptics, sensors, av, camera, sms, contacts, speech, auth, maps, background-fetch) |
| **Features mobile-only** | 12 (background tracking, chute, shake, noise, SMS, appel, haptics, geofencing, turn-by-turn, offline, volume SOS, Watch) |
| **Résultat** | Module Guardian Angel Mobile — Protection IA native avec capteurs, SOS, navigation, voyage, famille, cyber |
