# 🗺️ ROADMAP — Navigation & Hub Mobile ImuChat

**Date de création :** 8 mars 2026  
**Document source :** `Vision_Structure_Mobile_v2.md`  
**Stack :** Expo SDK 52+ · expo-router · Zustand · Supabase · react-native-reanimated  
**État actuel :** 6 onglets existants (42/50 features, 84%) — Home 50% mock, FAB inexistant, Widgets inexistants

---

## Vue d'ensemble

| Phase | Nom | Sprints | Durée estimée |
|-------|-----|:-------:|:-------------:|
| 1 | Refonte Home Hub | 3 | 6 semaines |
| 2 | Bouton Flottant Universel (FAB) | 2 | 4 semaines |
| 3 | Système de Widgets | 3 | 6 semaines |
| 4 | Personnalisation Avancée & IA | 2 | 4 semaines |
| 5 | Onglets Enrichis (Social, Watch, Profil) | 3 | 6 semaines |
| 6 | Polish, Accessibilité & Performance | 2 | 4 semaines |
| **Total** | | **15 sprints** | **30 semaines** |

---

## Phase 1 — Refonte Home Hub (Sprints 1-3)

### Sprint 1 · Fondations Home Hub

**Objectif :** Remplacer le Home mock par une architecture réelle et configurable

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **home-config-store** | Créer `stores/home-config-store.ts` (Zustand + persist AsyncStorage + sync Supabase `user_home_config`) | P0 |
| **types/home.ts** | Définir `HomeWidget`, `QuickAction`, `HomeSection`, `HomeConfigStore` dans `types/home.ts` | P0 |
| **home-config-api.ts** | Service API `services/home-config-api.ts` — CRUD config Home vers Supabase | P0 |
| **Supabase table** | Table `user_home_config` (user_id, config JSON, updated_at) | P0 |
| **Refactor index.tsx** | Restructurer `app/(tabs)/index.tsx` (683 lig.) — extraire composants, supprimer mocks HeroCarousel et ExplorerGrid | P0 |
| **TopBar component** | Créer `components/home/TopBar.tsx` — logo, 🔔 badge, 🔍 search, 🤖 Alice, ⚙️ | P1 |

**Livrables Sprint 1 :**

- Store `home-config-store` fonctionnel (local + Supabase)
- Home Hub restructuré sans données mock
- Types partagés pour l'architecture Home

### Sprint 2 · Accès Rapides & Modules

**Objectif :** Grille de raccourcis configurable + section "Mes Modules" réelle

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **QuickActionsGrid** | `components/home/QuickActionsGrid.tsx` — grille 2x3 configurable (défaut : Chat, Appel, IA, Story, Event, Live) | P0 |
| **Drag & Drop** | Long press → mode édition, réorganisation via `react-native-reanimated` / `react-native-gesture-handler` | P1 |
| **MyModules** | `components/home/MyModulesRow.tsx` — scroll horizontal modules installés, source `useModulesStore()` (déjà connecté Supabase) | P0 |
| **Module tap** | Tap → navigation `miniapp/[id]` ou écran natif selon le type de module | P0 |
| **Long press module** | Long press → options "Retirer du Home" / "Réorganiser" | P1 |
| **Bouton "+"** | En fin de liste modules → navigation vers Store | P1 |

**Livrables Sprint 2 :**

- Section Accès Rapides fonctionnelle (6 raccourcis configurables)
- Section Mes Modules connectée à Supabase (données réelles)
- Drag & drop fonctionnel sur les raccourcis

### Sprint 3 · Activité Sociale & Trending

**Objectif :** Sections dynamiques alimentées par les données réelles

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **SocialActivitySection** | `components/home/SocialActivity.tsx` — Stories (existant `useStoriesStore`) + 2-3 derniers posts (`fetchFeed()`) | P0 |
| **TrendingSection** | `components/home/TrendingSection.tsx` — Trending hashtags + événements populaires | P1 |
| **Section ordering** | Permettre le réordonnancement par drag & drop des sections du Home | P1 |
| **Pull to refresh** | Lottie animation de refresh personnalisée ImuChat | P1 |
| **Skeleton loading** | Skeleton screens pour chaque section pendant le chargement | P1 |
| **Tests** | Tests unitaires pour home-config-store, QuickActionsGrid, MyModulesRow | P0 |

**Livrables Sprint 3 :**

- Home Hub complet avec toutes les sections alimentées en données réelles
- Sections réorganisables
- Animations de chargement (skeleton + pull-to-refresh)
- Couverture tests ≥ 80%

---

## Phase 2 — Bouton Flottant Universel / FAB (Sprints 4-5)

### Sprint 4 · FAB — Cœur du composant

**Objectif :** Créer le FAB avec menu radial animé

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **FloatingActionButton** | `components/FloatingActionButton.tsx` — bouton rond position absolute bottom-right, z-index > tab bar | P0 |
| **fab-store.ts** | `stores/fab-store.ts` (Zustand) — état ouvert/fermé, actions configurées, visibilité | P0 |
| **Menu radial** | Animation spring (reanimated) + rotation 45° du "+" à l'ouverture | P0 |
| **7 actions default** | 💬 Message, 📸 Story, 📝 Post, 🎥 Vidéo, 📅 Event, 📄 Document, 📞 Appel | P0 |
| **Navigation** | Chaque action navigue vers la route cible (chat/new, social/create-post, etc.) | P0 |
| **Overlay backdrop** | Semi-transparent overlay quand le menu est ouvert, tap pour fermer | P1 |

**Livrables Sprint 4 :**

- FAB visible sur tous les écrans avec menu radial animé
- 7 actions de création fonctionnelles avec navigation

### Sprint 5 · FAB — Personnalisation & Contexte

**Objectif :** FAB adaptatif et personnalisable

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **Actions conditionnelles** | Les actions dépendent des modules installés (Event → si module Events installé, Document → si module Office installé) | P0 |
| **Personnalisation FAB** | L'utilisateur peut réorganiser et choisir quelles actions afficher (max 7) | P1 |
| **Auto-hide** | Le FAB disparaît en mode lecture (ImuFeed plein écran, Watch plein écran, Story viewer) | P0 |
| **Contexte onglet** | Le FAB met en avant l'action la plus pertinente selon l'onglet (Social → 📝 Post, Chats → 💬 Message) | P2 |
| **Haptic feedback** | Retour haptique sur tap et ouverture du menu | P1 |
| **Tests** | Tests FloatingActionButton, fab-store, hide/show logic | P0 |

**Livrables Sprint 5 :**

- FAB contextuel et personnalisable
- Auto-hide intelligent
- Tests complets

---

## Phase 3 — Système de Widgets (Sprints 6-8)

### Sprint 6 · Infrastructure Widgets

**Objectif :** Architecture du système de widgets du Home

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **WidgetCard** | `components/home/WidgetCard.tsx` — conteneur générique pour tous les widgets (tailles 1x1, 2x1, 2x2) | P0 |
| **WidgetGrid** | `components/home/WidgetGrid.tsx` — grille responsive 2 colonnes avec layout dynamique | P0 |
| **widget-data.ts** | `services/widget-data.ts` — data provider unifié pour alimenter chaque type de widget | P0 |
| **WidgetType enum** | Définir les 12 types de widgets : Agenda, Météo, Tâches, Wallet, Arena, Musique, IA Tips, Colis, Gaming, Screen Time, Amis en ligne, Recap | P0 |
| **Widget registry** | Pattern de registration — chaque module peut fournir un widget | P1 |

**Livrables Sprint 6 :**

- Infrastructure widgets opérationnelle (WidgetCard, WidgetGrid)
- Data provider unifié

### Sprint 7 · Widgets Core (6 premiers)

**Objectif :** Implémenter les 6 widgets les plus utilisés

| Widget | Taille | Source données | Priorité |
|--------|--------|---------------|----------|
| 💰 Wallet | 1x1 | `wallet-store` (existant) | P0 |
| 🎵 Musique en cours | 2x1 | `music-store` (existant, Phase M4) | P0 |
| 👥 Amis en ligne | 2x1 | Supabase Realtime presence | P0 |
| 🔔 Recap notifications | 2x2 | NotificationBridge (existant) | P1 |
| 📊 Screen Time | 1x1 | analytics-insights (existant) | P1 |
| 🤖 IA Tips (Alice) | 1x1 | alice service (existant) | P1 |

**Livrables Sprint 7 :**

- 6 widgets fonctionnels avec données réelles
- Intégration dans le WidgetGrid du Home

### Sprint 8 · Widgets Modules + Gestion

**Objectif :** Widgets fournis par les modules + gestion utilisateur

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **Widget Agenda** | 2x1 — Prochain événement / réunion (si module Events installé) | P1 |
| **Widget Arena** | 2x1 — Rang, points, prochain concours (si Arena actif) | P1 |
| **Widget Gaming** | 2x1 — Dernière partie, stats (si module Games installé) | P2 |
| **Widget Météo** | 1x1 — Température, conditions (API externe) | P2 |
| **Widget Tâches** | 2x1 — Tâches du jour (si module Tasks installé) | P2 |
| **Modal "Gérer widgets"** | Interface d'ajout/retrait de widgets avec preview | P0 |
| **Drag & drop widgets** | Réorganisation dans la grille (reanimated) | P1 |
| **Persistance** | Sauvegarde config widgets dans `user_home_config` + sync Supabase | P0 |

**Livrables Sprint 8 :**

- 12 widgets disponibles au total
- Interface de gestion des widgets
- Drag & drop + persistance

---

## Phase 4 — Personnalisation Avancée & IA (Sprints 9-10)

### Sprint 9 · Moteur de Personnalisation

**Objectif :** Home qui s'adapte automatiquement à l'utilisateur

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **Usage tracking** | Incrémenter `usage_count` sur `user_modules` à chaque utilisation | P0 |
| **Module ordering** | Trier "Mes Modules" par `usage_count` décroissant | P0 |
| **Time-of-day** | Hook `useTimeOfDay()` — le matin : Agenda + Tâches. Le soir : Watch + Amis en ligne | P1 |
| **Suggestion "Redécouvrir"** | Module pas ouvert depuis 7j → suggestion discrète | P2 |
| **onboarding progressif** | Après N jours, suggestion contextuelle "Savais-tu que tu peux installer [module] ?" | P2 |
| **A/B testing framework** | Infrastructure pour tester différentes configurations Home | P2 |

**Livrables Sprint 9 :**

- Home adaptatif basé sur l'usage réel
- Suggestions intelligentes

### Sprint 10 · Alice IA dans le Home

**Objectif :** Intégrer Alice IA comme assistant proactif dans le Home

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **Proactive suggestions** | Bannière Alice : "Tu as un événement dans 30 min" / "3 messages non-lus" | P1 |
| **Résumé du jour** | Card résumé généré par Alice au premier lancement du matin | P2 |
| **Quick chat Alice** | Tap sur 🤖 dans la TopBar → ouvre un mini-chat inline avec Alice | P1 |
| **Recommandations de modules** | Alice recommande des modules basés sur le profil utilisateur | P2 |
| **Tests** | Tests moteur de personnalisation, Alice integration | P0 |

**Livrables Sprint 10 :**

- Alice IA intégrée dans le Home avec suggestions contextuelles
- Résumé quotidien

---

## Phase 5 — Onglets Enrichis (Sprints 11-13)

### Sprint 11 · Refonte Social (intégration ImuFeed)

**Objectif :** Ajouter les sous-onglets Social avec ImuFeed

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **Sous-onglets Social** | Restructurer `social.tsx` avec 3 sous-onglets : [Feed] [ImuFeed 🎬] [Stories] | P0 |
| **Tab animation** | Swipe horizontal entre les 3 sous-onglets (reanimated) | P0 |
| **ImuFeed placeholder** | Placeholder pour le sous-onglet ImuFeed (s'active quand le module ImuFeed est prêt) | P1 |
| **Stories sous-onglet** | Extraire Stories en sous-onglet dédié (grille highlights + viewer) | P1 |
| **Bottom tab hide** | Quand ImuFeed est actif en plein écran, la tab bar disparaît | P1 |

**Livrables Sprint 11 :**

- Social restructuré en 3 sous-onglets
- Navigation fluide entre Feed / ImuFeed / Stories

### Sprint 12 · Watch enrichi + Watch Party Foundation

**Objectif :** Enrichir l'onglet Watch et poser les bases Watch Party

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **Sous-onglets Watch** | [🎬 Vidéos] [🎧 Podcasts] [🎵 Musique] | P0 |
| **Live indicator** | Badge "LIVE" sur les Watch Parties en cours | P1 |
| **Watch Party UI** | Card "Rejoindre" pour les Watch Parties actives | P1 |
| **Watch Party creation** | Écran de création de Watch Party (titre, vidéo, invitations) | P2 |
| **Catégories enrichies** | Catégories dynamiques depuis Supabase (au lieu de hardcodé) | P1 |

**Livrables Sprint 12 :**

- Watch avec sous-onglets
- Watch Party UI (création + liste)

### Sprint 13 · Profil enrichi (Wallet + Arena + Analytics)

**Objectif :** Enrichir le profil avec Wallet, Arena et Analytics personnels

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **Wallet section** | Section Wallet dans le profil — solde ImuCoins, boutons Recharger / Historique / Envoyer | P0 |
| **Arena section** | Section Arena — Rang, barre de progression, classements | P1 |
| **Mes Modules** | Liste des modules installés avec gestion (désinstaller, ouvrir) | P0 |
| **Analytics** | Temps d'écran, catégories utilisées, graphiques | P2 |
| **Personnalisation thème** | Accès rapide au switch de thème (6 thèmes existants) | P1 |
| **Tests** | Tests pour les 3 sprints de la Phase 5 | P0 |

**Livrables Sprint 13 :**

- Profil enrichi avec Wallet, Arena, Modules, Analytics
- Accès rapide thème

---

## Phase 6 — Polish, Accessibilité & Performance (Sprints 14-15)

### Sprint 14 · Performance & Offline

**Objectif :** Optimiser les performances et la gestion offline

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **FlashList migration** | Remplacer FlatList par FlashList (Shopify) dans les feeds et listes | P0 |
| **Skeleton screens** | Skeleton loading sur tous les écrans clés | P1 |
| **Offline Home** | Le Home affiche les dernières données en cache si offline | P0 |
| **Lazy loading** | React.lazy + Suspense pour les sections non-visibles du Home | P1 |
| **Préchargement images** | expo-image avec politique de cache optimisée | P1 |
| **Memory profiling** | Audit mémoire — trouver et corriger les fuites | P0 |

**Livrables Sprint 14 :**

- Scroll 60 FPS constant
- Home fonctionnel offline
- Pas de fuite mémoire

### Sprint 15 · Accessibilité & Polish

**Objectif :** Accessibilité WCAG AA + polish final

| Tâche | Description | Priorité |
|-------|-------------|----------|
| **VoiceOver / TalkBack** | `accessibilityLabel` et `accessibilityRole` sur TOUS les composants interactifs | P0 |
| **Contraste** | Audit et correction ratio 4.5:1 minimum sur les 6 thèmes | P0 |
| **Reduced motion** | `useReducedMotion()` → animations simplifiées pour utilisateurs sensibles | P1 |
| **Font scaling** | Vérifier que tous les textes respectent le scaling système | P1 |
| **Daltonisme** | S'assurer qu'aucune information n'est transmise uniquement par la couleur | P1 |
| **Micro-animations polish** | Affiner les animations (like, FAB, widget reveal, transitions) | P1 |
| **Regression tests** | Suite de tests de régression complète sur les 6 phases | P0 |

**Livrables Sprint 15 :**

- Application conforme WCAG AA
- Animations polies et cohérentes
- Régression tests vert

---

## Dépendances & Risques

### Dépendances inter-phases

| Dépendance | Source | Cible | Impact |
|------------|--------|-------|--------|
| Types home.ts | Phase 1 Sprint 1 | Toutes les phases | Bloquant |
| home-config-store | Phase 1 Sprint 1 | Phases 3 et 4 | Bloquant |
| FAB | Phase 2 | Phase 5 (ImuFeed) | Fort |
| Widget registry | Phase 3 Sprint 6 | Phase 3 Sprint 8 | Fort |

### Risques identifiés

| Risque | Probabilité | Impact | Mitigation |
|--------|:-----------:|:------:|------------|
| Performance Home avec widgets | Moyen | Élevé | FlashList + lazy loading + profiling continu |
| Complexité drag & drop | Élevé | Moyen | Utiliser `react-native-gesture-handler` + `reanimated` (libraries prouvées) |
| Sync Supabase config | Faible | Moyen | Offline-first avec sync en arrière-plan |
| 6 thèmes à maintenir | Moyen | Faible | Design tokens via `useColors()` (déjà en place) |

---

## KPIs de succès

| KPI | Cible | Mesure |
|-----|-------|--------|
| Temps de chargement Home | < 800ms | Performance profiling |
| Widgets configurés par user | ≥ 3 en moyenne | Analytics |
| FAB utilisation quotidienne | ≥ 30% des users | Analytics |
| Taux de personnalisation Home | ≥ 40% des users modifient le défaut | Analytics |
| Crash-free rate | > 99.5% | Sentry / Crashlytics |
| Accessibilité score | WCAG AA | Audit a11y |
| Tests coverage | ≥ 80% | Jest |
