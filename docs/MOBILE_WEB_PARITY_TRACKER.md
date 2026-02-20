# 📱↔️🌐 Mobile / Web Parity Tracker

> Suivi de la mise à parité mobile ↔ web-app — Démarré le 19 février 2026

## Résumé

| Métrique | Valeur |
|---|---|
| Tests avant parité | 1 078 (905 web + 173 mobile) |
| Tests après parité | **1 163** (905 web + 258 mobile) |
| Écrans corrigés | **6 / 7** |
| MVP % | 97% → **99%** |

---

## 1. Settings — Account Edit + Password ✅

**Gap identifié** : Section Compte en lecture seule (email + identifiant affichés mais non modifiables). Pas de changement de mot de passe.

**Web référence** : `web-app/src/components/settings/my-account-tab.tsx`

- Username + Email éditables → bouton "Sauvegarder"
- Mot de passe : ancien + nouveau → `supabase.auth.updateUser()`
- Supprimer le compte (déjà présent mobile ✅)

**Implémentation mobile** :

- [x] TextInput username + email éditables
- [x] Bouton "Sauvegarder les modifications"
- [x] Section mot de passe (ancien + nouveau + bouton)
- [x] Tests unitaires (+26 tests)

---

## 2. Settings — Language + Stories ✅

**Gap identifié** : Pas de sélecteur de langue. Pas de paramètres Stories.

**Web référence** :

- `language-tab.tsx` : Select en/fr/ja → navigation locale
- `stories-tab.tsx` : Visibilité (public/friends/private), Allow replies, Auto archive

**Implémentation mobile** :

- [x] Section Langue avec 3 radio buttons (FR 🇫🇷 / EN 🇺🇸 / JA 🇯🇵)
- [x] Persistance Supabase profiles.language
- [x] Section Stories : 3 boutons visibilité + 2 switches
- [x] Tests unitaires (inclus dans settings.test.tsx)

---

## 3. Home Screen — Contenu dynamique ✅

**Gap identifié** : Écran stub avec données hardcodées ("12 messages", "5 serveurs", "Alice il y a 2 min").

**Web référence** : `web-app/src/app/[locale]/hometab/page.tsx`

- Hero Carousel (featured worlds, contests, rewards)
- Friends Card (3 conversations récentes)
- Feed placeholder (stories avatars + filtres)
- Explorer Grid (6 catégories navigation)
- Podcast Widget

**Implémentation mobile** :

- [x] HeroCarousel auto-scroll (3 slides, dots, 7s interval)
- [x] StoryCarousel (6 avatars avec ring border)
- [x] FriendsCard (données réelles via getConversations)
- [x] ExplorerGrid (6 cartes navigation)
- [x] PodcastWidget (3 podcasts)
- [x] Tests unitaires (+21 tests — home.test.tsx)

---

## 4. Social — Stories Feed ✅

**Gap identifié** : Stub "Feed social à venir" avec emoji placeholder.

**Web référence** : `web-app/src/modules/stories/ui/page.tsx`

- Story Carousel (avatars horizontaux cliquables)
- Story Grid (2-4 colonnes)
- Story Viewer (modal plein écran)
- Boutons : Create, Archive, Settings

**Implémentation mobile** :

- [x] StoryCarousel (7 utilisateurs avec indicateur hasNew)
- [x] FeedFilters (Mixte / News / Stories)
- [x] Feed de posts (5 posts avec like/comment/share, badge news)
- [x] Bouton FAB créer story
- [x] Tests unitaires (+14 tests — social.test.tsx)

---

## 5. Watch — Hub Vidéo ✅

**Gap identifié** : Stub "Lecteur vidéo et Watch Party à venir" avec emoji placeholder.

**Web référence** : `web-app/src/app/[locale]/watch/page.tsx`

- Featured carousel (watch parties live/populaires)
- Category filter bar (All, Anime, Movie, Series, Documentary)
- Watch Party cards (thumbnail, status, participants, countdown)
- CTA créer party

**Implémentation mobile** :

- [x] FeaturedCarousel (3 items avec badge/viewers/join)
- [x] CategoryFilter (5 catégories : all/anime/movie/series/documentary)
- [x] WatchPartyCards (5 parties live avec filtrage)
- [x] UpcomingSection (3 événements à venir)
- [x] Bouton "Créer une Watch Party"
- [x] Tests unitaires (+18 tests — watch.test.tsx)

---

## 6. Store — Catalogue ✅

**Gap identifié** : Stub "Store d'applications et thèmes à venir" avec emoji placeholder.

**Web référence** : `web-app/src/app/[locale]/store/page.tsx`

- 5 onglets : All, Apps, Contents, Services, Bundles
- Barre recherche + filtres
- Cards polymorphes (AppCard, RewardCard, BundleCard)
- Modale d'achat

**Implémentation mobile** :

- [x] DynamicHero banner
- [x] SearchBar avec clear
- [x] 5 Tabs (All/Apps/Contents/Services/Bundles)
- [x] SortBar (popular/newest/price-asc/price-desc)
- [x] MixedContentGrid (10 items catalogue)
- [x] PurchaseModal (détails + achat/install)
- [x] Tests unitaires (+22 tests — store.test.tsx)

---

## 7. Notification Center ✅

**Gap identifié** : Backend push prêt (`notification-api.ts`, `notifications.ts`) mais aucune UI in-app pour voir l'historique.

**Implémentation mobile** :

- [x] Écran `notifications.tsx` (~550 lignes) — Centre complet
- [x] 5 catégories (Tout, Messages, Appels, Social, Système)
- [x] Recherche textuelle avec clear
- [x] Filtre lu/non-lu/tous
- [x] Mark as read (individuel, optimistic update)
- [x] Mark all read (global, optimistic update)
- [x] Badge count non-lues dans header
- [x] Onglet Notifications ajouté dans la tab bar (bell icon)
- [x] Onglets Watch et Store activés (plus masqués)
- [x] Fallback mock data quand API indisponible
- [x] Tests unitaires (+23 tests — notifications.test.tsx)

---

## Changelog

| Date | Action | Tests ajoutés |
|---|---|---|
| 19/02/2026 | Settings mobile créé (6 sections) | +15 |
| 19/02/2026 | Début parité mobile/web | — |
| 19/02/2026 | Settings enrichi (Account, Password, Language, Stories) | +26 (réécriture) |
| 19/02/2026 | Home screen réécriture complète (5 sections) | +21 |
| 19/02/2026 | Social screen réécriture complète (Stories+Feed+Filters) | +14 |
| 19/02/2026 | Watch screen réécriture complète (Featured+Parties+Upcoming) | +18 |
| 19/02/2026 | Store screen réécriture complète (Tabs+Search+Sort+Modal) | +22 |
| 19/02/2026 | FlatList mock amélioré (rend data+renderItem) | — |
| 19/02/2026 | Notifications screen créé + onglet ajouté | +23 |
| 19/02/2026 | Desktop-app réécrit (sidebar + Home + Messages panels) | — |
| 19/02/2026 | **Total mobile : 281 tests, 22 suites, 0 échecs** | **+108 net** |
