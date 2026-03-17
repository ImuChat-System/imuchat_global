# 🗺️ ROADMAP — Cross-Platform Parity Web-App ImuChat

**Date de création :** 8 mars 2026  
**Alignement :** `docs/_mobile/ROADMAP_MOBILE_NAVIGATION_HUB.md` (7 phases, 19 sprints, 38 semaines)  
**Source audit :** Exploration exhaustive `web-app/src/` vs roadmap mobile  
**Stack web :** Next.js App Router · TypeScript · Supabase · Zustand · @dnd-kit · Socket.IO  
**État actuel web :** ~70-80% feature-complete vs mobile — Watch Tab = gap critique (0%)

---

## Vue d'ensemble — Gaps identifiés

| Domaine | Web actuel | Objectif parité | Gap | Priorité |
|---------|:----------:|:---------------:|:---:|:--------:|
| Home Hub | 85% | 95% | MyModulesRow, TopBar enrichie | 🟠 HAUTE |
| FAB / Quick Create | 90% | 95% | Haptic → Keyboard shortcuts, polish | 🟢 FAIBLE |
| Widget System | 50% | 85% | Widgets par page, dashboard, catalogue | 🟠 HAUTE |
| Alice IA / Personnalisation | 95% | 98% | Proactive nudges, saisonnalité CSS | 🟢 FAIBLE |
| Social / Feed / Stories | 90% | 95% | Mini-blog, Events calendar | 🟡 MOYENNE |
| **Watch Tab** | **0%** | **80%** | **Tout à créer** | **🔴 CRITIQUE** |
| Profil enrichi | 85% | 90% | Vue unifiée profil | 🟢 FAIBLE |
| Gaming Hub | 90% | 95% | Daily challenges widget | 🟢 FAIBLE |
| Arena / Contests | 60% | 80% | Route dédiée `/contests` | 🟡 MOYENNE |
| Finance Hub | 95% | 98% | Stripe real payments | 🟡 MOYENNE |
| ImuCompanion | 90% | 95% | Proactive suggestions | 🟢 FAIBLE |
| Accessibilité | 80% | 95% | Audit ARIA, focus indicators, prefers-reduced-motion | 🟠 HAUTE |

---

## Planning par phases (aligné sur roadmap mobile)

| Phase Web | Alignement Mobile | Sprints Web | Durée estimée |
|-----------|-------------------|:-----------:|:-------------:|
| W1 | Phase 1 — Home Hub Parity | 2 | 4 semaines |
| W2 | Phase 3 — Widget System Web | 2 | 4 semaines |
| W3 | Phase 5 — Watch Tab (CRITIQUE) | 3 | 6 semaines |
| W4 | Phase 5 — Social Enrichments | 1 | 2 semaines |
| W5 | Phase 6 — Accessibilité & Polish | 2 | 4 semaines |
| W6 | Phase 7 — Cross-Domain Integrations | 2 | 4 semaines |
| **Total** | | **12 sprints** | **24 semaines** |

> **Note :** FAB, Alice IA, Gaming Hub, ImuCompanion et Finance sont déjà bien implémentés côté web.  
> Cette roadmap ne couvre que les écarts significatifs nécessitant du travail.

---

## Phase W1 — Home Hub Parity (Sprints W1-W2)

### Alignement Mobile : Phase 1 (Sprints 1-3) — Refonte Home Hub

*Côté web, le Home Hub est à 85%. L'essentiel fonctionne (HeroCarousel, FriendsCard, FeaturedWorldCard, FeaturedContestCard, ExplorerGrid, PodcastWidget, CommsCard). Les gaps résiduels suivants doivent être comblés.*

### Sprint W1 · Home Config Store & MyModulesRow

| Tâche | Description | Priorité | Réf. mobile |
|-------|-------------|:--------:|:-----------:|
| **MyModulesRow** | Créer `components/hometab/my-modules-row.tsx` — grille horizontale des modules activés par l'utilisateur, lien vers `/store` | P0 | Sprint 2 mobile |
| **home-config sync Supabase** | Aligner `user-settings.ts` sur la table Supabase `user_home_config` — même schéma que mobile pour sync cross-device | P1 | Sprint 1 mobile |
| **QuickActions grid** | Ajouter grille d'accès rapides configurable sur Home (raccourcis vers les modules les plus utilisés) | P1 | Sprint 2 mobile |
| **TopBar enrichie** | Enrichir le header Home — ajouter badge notifications, raccourci Alice, raccourci recherche globale | P2 | Sprint 1 mobile |

**Livrables Sprint W1 :**

- `MyModulesRow` visible sur le Home Hub
- Home config synchronisée cross-device via Supabase
- Grille QuickActions configurable

### Sprint W2 · Sections dynamiques & Skeleton polish

| Tâche | Description | Priorité | Réf. mobile |
|-------|-------------|:--------:|:-----------:|
| **Sections réordonnables** | Permettre le drag-and-drop des sections Home via @dnd-kit (déjà disponible dans le projet) pour réordonner le layout | P1 | Sprint 3 mobile |
| **Section vide states** | Ajouter des empty states illustrés pour chaque section Home quand il n'y a pas de contenu | P2 | Sprint 3 mobile |
| **Skeleton screens polish** | Auditer et uniformiser les skeleton screens de chaque section Home — assurer une cohérence visuelle avec le mobile | P2 | Sprint 3 mobile |
| **Home tour / onboarding** | Tooltip overlay guidé pour les nouveaux utilisateurs expliquant chaque section du Home | P2 | Sprint 3 mobile |

**Livrables Sprint W2 :**

- Layout Home réordonnables par l'utilisateur
- Empty states + skeleton polish
- Onboarding Home optionnel

---

## Phase W2 — Widget System Web (Sprints W3-W4)

### Alignement Mobile : Phase 3 (Sprints 6-8) — Système de Widgets

*Côté web, le widget system existe mais est limité au layout Home (3 tailles : compact/standard/large, drag-drop @dnd-kit, persistence user-settings.ts). Il manque les widgets par page et le catalogue.*

### Sprint W3 · Widget Catalogue & Registration

| Tâche | Description | Priorité | Réf. mobile |
|-------|-------------|:--------:|:-----------:|
| **Widget Registry** | Créer `services/widget-registry.ts` — registre centralisé de tous les widgets disponibles (ID, composant, taille, pages autorisées, permissions requises) | P0 | Sprint 6 mobile |
| **Widget Catalogue UI** | Page `/settings/widgets` ou modal catalogue — liste tous les widgets avec preview, filtre par catégorie, activation/désactivation | P0 | Sprint 6 mobile |
| **Widget Sidebar** | Permettre l'ajout de widgets dans la sidebar droite (en plus du Home) — sticky widgets contextuels par page | P1 | Sprint 7 mobile |
| **Widget API types** | Définir types partagés `WidgetConfig`, `WidgetInstance`, `WidgetPlacement` dans `shared-types/` ou local | P0 | Sprint 6 mobile |

**Livrables Sprint W3 :**

- Registre de widgets extensible
- Catalogue UI browsable par l'utilisateur
- Types partagés prêts pour cross-platform

### Sprint W4 · Widgets par page & Persistence

| Tâche | Description | Priorité | Réf. mobile |
|-------|-------------|:--------:|:-----------:|
| **Widgets par page** | Permettre l'ajout de widgets sur les pages : `/feed`, `/finance`, `/gamification`, `/profile` — sidebar widgets contextuels | P1 | Sprint 7 mobile |
| **Widget persistence Supabase** | Synchroniser la config widgets sur `user_widget_config` Supabase (cross-device) | P1 | Sprint 8 mobile |
| **Widgets tiers / modules** | Permettre aux modules installés via le Store d'enregistrer leurs propres widgets | P2 | Sprint 8 mobile |
| **Widget resize/collapse** | Permettre le resize (compact ↔ standard ↔ large) et le collapse/expand des widgets dans la sidebar | P2 | Sprint 7 mobile |

**Livrables Sprint W4 :**

- Widgets contextuels par page
- Sync Supabase cross-device
- Widgets de modules tiers

---

## Phase W3 — Watch Tab (Sprints W5-W7) 🔴 CRITIQUE

### Alignement Mobile : Phase 5 (Sprints 11-13) — Onglets Enrichis

*C'est le gap le plus important : aucune route `/watch`, aucun composant vidéo, aucun Watch Party. Seuls un `podcast-widget` sur le Home et un `music-panel` basique existent.*

### Sprint W5 · Fondations Watch Hub

| Tâche | Description | Priorité | Réf. mobile |
|-------|-------------|:--------:|:-----------:|
| **Route `/watch`** | Créer `app/[locale]/watch/page.tsx` + layout avec sous-navigation (Vidéos, Musique, Podcasts, Live) | P0 | Sprint 11 mobile |
| **Video Player** | Composant `components/watch/video-player.tsx` — lecteur HTML5 avec contrôles custom, PiP support (`document.pictureInPictureEnabled`), barre de progression | P0 | Sprint 11 mobile |
| **Watch Feed** | `components/watch/watch-feed.tsx` — grille/liste de vidéos avec thumbnails, durée, vues, créateur | P0 | Sprint 11 mobile |
| **watch-api.ts** | Service `services/watch-api.ts` — CRUD vidéos, playlists, historique, recommandations | P0 | Sprint 11 mobile |
| **Sidebar navigation** | Ajouter l'onglet Watch 📺 dans la sidebar principale (`app-layout.tsx`) | P0 | — |

**Livrables Sprint W5 :**

- Route `/watch` accessible depuis la sidebar
- Lecteur vidéo fonctionnel avec PiP
- Feed de vidéos navigable

### Sprint W6 · Musique, Podcasts & Sous-tabs

| Tâche | Description | Priorité | Réf. mobile |
|-------|-------------|:--------:|:-----------:|
| **Music Hub** | `app/[locale]/watch/music/page.tsx` — lecteur musique complet remplaçant le `music-panel` basique, playlists, queue, mini-player persistent en bas de page | P0 | Sprint 12 mobile |
| **Podcasts Hub** | `app/[locale]/watch/podcasts/page.tsx` — catalogue podcasts, lecteur épisode, abonnements, progression par épisode | P0 | Sprint 12 mobile |
| **Live Streaming** | `app/[locale]/watch/live/page.tsx` — listing des lives en cours, badge LIVE, compteur viewers | P1 | Sprint 12 mobile |
| **Mini-player persistent** | Composant `components/watch/mini-player.tsx` — barre fixe en bas de l'écran quand musique/podcast joue, visible sur toutes les pages | P0 | Sprint 12 mobile |
| **Sous-navigation Watch** | Tabs horizontaux : Vidéos | Musique | Podcasts | Live — comme le mobile | P0 | Sprint 12 mobile |

**Livrables Sprint W6 :**

- Music Hub complet avec queue et playlists
- Podcasts avec suivi de progression
- Mini-player persistent cross-page
- Live streaming listing

### Sprint W7 · Watch Party & Social Video

| Tâche | Description | Priorité | Réf. mobile |
|-------|-------------|:--------:|:-----------:|
| **Watch Party** | `app/[locale]/watch/party/[id]/page.tsx` — visionnage synchronisé multi-utilisateurs via Socket.IO, chat latéral, contrôles partagés (play/pause/seek) | P1 | Sprint 13 mobile |
| **Commentaires vidéo** | Système de commentaires sous les vidéos (réutiliser le pattern des posts sociaux) | P1 | Sprint 13 mobile |
| **Historique & Reprendre** | `components/watch/watch-history.tsx` — historique de visionnage, "Reprendre où vous en étiez" avec barre de progression | P1 | Sprint 13 mobile |
| **Playlists créateur** | Permettre la création de playlists publiques/privées, partage de playlists | P2 | Sprint 13 mobile |
| **Recommandations IA** | Suggestions vidéo/musique basées sur l'historique et les préférences Alice | P2 | Sprint 13 mobile |

**Livrables Sprint W7 :**

- Watch Party temps réel via Socket.IO
- Commentaires intégrés aux vidéos
- Historique avec reprise de lecture
- Playlists utilisateur

---

## Phase W4 — Social Enrichments (Sprint W8)

### Alignement Mobile : Phase 5 (Sprints 11-13) — Onglets Social enrichi

*Le Social Tab web est à 90% (Feed + Stories fonctionnels). Les enrichissements suivants alignent avec ce que le mobile prévoit.*

### Sprint W8 · Mini-blog, Events & Feed enrichi

| Tâche | Description | Priorité | Réf. mobile |
|-------|-------------|:--------:|:-----------:|
| **Mini-blog** | `app/[locale]/blog/page.tsx` — articles longs format, éditeur rich-text, catégories, tags | P1 | Sprint 11 mobile |
| **Events Calendar** | `app/[locale]/events/page.tsx` — calendrier d'événements communautaires, RSVP, rappels, vue liste/grille/calendrier | P1 | Sprint 12 mobile |
| **Reactions enrichies** | Ajouter réactions animées sur les posts (au-delà du like simple — love, haha, wow, triste, colère) | P2 | Sprint 11 mobile |
| **Feed algorithmic** | Implémenter un tri intelligent du feed (chronologique, pertinence, trending) — sélectionnable par l'utilisateur | P2 | Sprint 13 mobile |
| **Share sheet** | Dialog de partage unifié pour posts, vidéos, profils — partage interne (DM, groupe) + externe (copier lien) | P2 | Sprint 13 mobile |

**Livrables Sprint W8 :**

- Mini-blog avec éditeur rich-text
- Events avec calendrier et RSVP
- Réactions animées
- Tri du feed configurable

---

## Phase W5 — Accessibilité & Polish (Sprints W9-W10)

### Alignement Mobile : Phase 6 (Sprints 14-15) — Polish, Accessibilité & Performance

*Le framework d'accessibilité web est à 80% (settings existent dans advanced-settings-api.ts). L'audit révèle des gaps dans l'implémentation CSS réelle et les ARIA labels.*

### Sprint W9 · Audit WCAG & Correction

| Tâche | Description | Priorité | Réf. mobile |
|-------|-------------|:--------:|:-----------:|
| **Audit ARIA complet** | Passer chaque composant interactif (modals, dropdowns, sidebar, FAB) — ajouter `aria-label`, `aria-describedby`, `role`, `aria-expanded` manquants | P0 | Sprint 14 mobile |
| **Focus indicators** | Implémenter des focus rings visibles et cohérents sur tous les éléments interactifs (`:focus-visible` custom) | P0 | Sprint 14 mobile |
| **prefers-reduced-motion** | Ajouter `@media (prefers-reduced-motion: reduce)` dans les styles globaux — désactiver toutes les animations CSS et Framer Motion transitions | P0 | Sprint 14 mobile |
| **Keyboard navigation complète** | Assurer la navigation au clavier dans : sidebar, FAB menu, modals, widget drag-drop, tabs Watch | P0 | Sprint 14 mobile |
| **Skip navigation link** | Ajouter un lien "Passer au contenu principal" visible au focus en haut de chaque page | P1 | Sprint 14 mobile |

**Livrables Sprint W9 :**

- Tous les composants interactifs avec ARIA correct
- Focus visible partout
- Respect `prefers-reduced-motion`
- Navigation clavier complète

### Sprint W10 · Performance & Colorblind / Contraste

| Tâche | Description | Priorité | Réf. mobile |
|-------|-------------|:--------:|:-----------:|
| **Mode daltonien CSS** | Appliquer les settings `colorblindMode` (protanopia, deuteranopia, tritanopia) de advanced-settings-api.ts via CSS filters/custom properties sur le `<html>` | P1 | Sprint 15 mobile |
| **High contrast mode** | Implémenter les 3 niveaux de contraste (normal, high, highest) via CSS custom properties dynamiques | P1 | Sprint 15 mobile |
| **Text size application** | Appliquer les 6 niveaux de taille de texte (xs→2xl) de advanced-settings-api.ts sur le root `font-size` | P1 | Sprint 15 mobile |
| **Performance bundle** | Audit Lighthouse, code-splitting par route, lazy loading des modules Watch et Finance, objectif LCP < 2.5s | P1 | Sprint 15 mobile |
| **Captions / Sous-titres** | Support sous-titres WebVTT dans le video-player du Watch Tab | P2 | Sprint 15 mobile |

**Livrables Sprint W10 :**

- Modes daltonien fonctionnels
- Contraste et taille de texte dynamiques
- Bundle optimisé, LCP < 2.5s
- Sous-titres vidéo

---

## Phase W6 — Cross-Domain Integrations (Sprints W11-W12)

### Alignement Mobile : Phase 7 (Sprints 16-19) — Gaming, Arena, Finance, Companion

*Côté web, Gaming (90%), Finance (95%) et ImuCompanion (90%) sont déjà bien implémentés. Les intégrations visent à combler les derniers écarts et assurer la cohérence des données cross-platform.*

### Sprint W11 · Arena dédiée & Gaming polish

| Tâche | Description | Priorité | Réf. mobile |
|-------|-------------|:--------:|:-----------:|
| **Route `/contests`** | Créer `app/[locale]/contests/page.tsx` — route dédiée avec liste des contests actifs, à venir, passés (actuellement noyé dans `/gamification`) | P1 | Sprint 17 mobile |
| **Contest detail page** | `app/[locale]/contests/[id]/page.tsx` — détail d'un contest avec classement, règles, récompenses, inscription | P1 | Sprint 17 mobile |
| **Daily challenges widget** | Widget sidebar "Challenge du jour" sur le Home — mission quotidienne avec récompense XP | P2 | Sprint 16 mobile |
| **Mini-jeux sociaux** | Intégrer un iframe/composant pour les mini-jeux (réutiliser `imu-miniapps/`) dans une section Gaming | P2 | Sprint 16 mobile |

**Livrables Sprint W11 :**

- Route `/contests` dédiée et fonctionnelle
- Pages détail contest
- Daily challenges sur Home

### Sprint W12 · Finance Stripe, Companion proactif & Sync

| Tâche | Description | Priorité | Réf. mobile |
|-------|-------------|:--------:|:-----------:|
| **Stripe Connect** | Intégrer Stripe Elements pour les paiements réels dans Finance Hub (actuellement mocks) — checkout, cards, P2P | P1 | Sprint 18 mobile |
| **Companion proactif** | Ajouter des nudges proactifs à ImuCompanion — suggestions contextuelles ("Tu n'as pas vérifié tes messages depuis 2h", "Un nouveau contest commence !") | P2 | Sprint 19 mobile |
| **Cross-device sync audit** | Vérifier que toutes les configs utilisateur (Home layout, Widgets, Watch history, Alice prefs) sont bien synchronisées via Supabase entre web et mobile | P1 | Sprint 19 mobile |
| **Shared types alignment** | Aligner les types `shared-types/` avec les types mobile pour garantir la sérialisation/désérialisation cross-platform | P1 | Sprint 19 mobile |

**Livrables Sprint W12 :**

- Paiements réels Stripe
- Companion avec suggestions proactives
- Sync cross-device validée
- Types partagés alignés

---

## 📊 Résumé — Effort total

| Phase | Sprints | Effort estimé | Impact parité |
|-------|:-------:|:-------------:|:-------------:|
| W1 — Home Hub Parity | 2 | 4 semaines | 85% → 95% |
| W2 — Widget System | 2 | 4 semaines | 50% → 85% |
| W3 — Watch Tab 🔴 | 3 | 6 semaines | 0% → 80% |
| W4 — Social Enrichments | 1 | 2 semaines | 90% → 95% |
| W5 — Accessibilité | 2 | 4 semaines | 80% → 95% |
| W6 — Cross-Domain | 2 | 4 semaines | ~85% → 95% |
| **Total** | **12** | **24 semaines** | **~70% → ~93%** |

---

## 🎯 Dépendances & Prérequis

| Prérequis | Nécessaire pour | Statut |
|-----------|-----------------|:------:|
| Table Supabase `user_home_config` | Phase W1 | 🟡 À créer (existe côté mobile roadmap) |
| Table Supabase `user_widget_config` | Phase W2 | 🟡 À créer |
| Infra vidéo (stockage, streaming CDN) | Phase W3 | ❌ À planifier |
| Socket.IO events Watch Party | Phase W3 Sprint W7 | 🟡 Existant mais à étendre |
| Stripe API keys (test + prod) | Phase W6 Sprint W12 | 🟡 À configurer |
| `shared-types/` extension | Phases W1, W2, W3 | ✅ Package existant |

---

## 🔗 Correspondance Mobile ↔ Web

| Phase Mobile | Sprints Mobile | Phase Web | Sprints Web | Notes |
|:-------------|:--------------:|:----------|:-----------:|:------|
| 1 — Home Hub Refonte | 1-3 | W1 — Home Hub Parity | W1-W2 | Web à 85%, effort réduit |
| 2 — FAB Universel | 4-5 | *(Non nécessaire)* | — | Web déjà à 90% (CompanionFAB + CreateFAB) |
| 3 — Widgets | 6-8 | W2 — Widget System | W3-W4 | Web a la base, manque extensibilité |
| 4 — Personnalisation IA | 9-10 | *(Non nécessaire)* | — | Web Alice à 95% |
| 5 — Onglets Enrichis | 11-13 | W3 + W4 — Watch + Social | W5-W8 | Watch = gap critique, Social = polish |
| 6 — Polish & A11y | 14-15 | W5 — Accessibilité | W9-W10 | Framework prêt, implémentation à faire |
| 7 — Cross-Domain | 16-19 | W6 — Cross-Domain | W11-W12 | Web déjà avancé, effort réduit |

---

## ✅ Ce qui est déjà bon côté web (pas dans cette roadmap)

| Feature | Complétude web | Commentaire |
|---------|:--------------:|-------------|
| Alice IA / Personnalisation | 95% | Time-of-day, saisonnalité, multi-providers, context-aware |
| FAB / Quick Create | 90% | CompanionFAB + Create button + Quick Create modals |
| Social Feed + Stories | 90% | Feed, Stories (viewer, hub, creator, analytics, archive) |
| Finance Hub | 95% | KYC, P2P, Cards, Savings, Invest, Transactions, Wallet |
| Gaming Hub | 90% | XP, Achievements, Leaderboard, Missions, Rewards, Badges |
| ImuCompanion (Live2D) | 90% | 4 modes (fab, panel, fullscreen, hidden), Live2D canvas, AI connected |
| Profile System | 85% | Header, Posts, Media, Stats, Badges, Activity Timeline |

---

*Ce document sera mis à jour au fur et à mesure de l'avancement des sprints web. Chaque sprint complété sera marqué ✅ avec la date de livraison.*
