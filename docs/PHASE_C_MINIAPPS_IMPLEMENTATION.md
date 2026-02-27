# Phase C — Extraction des modules par défaut non-core

> **Statut** : ✅ TERMINÉE (9/9 modules extraits)  
> **Début** : 25 février 2026  
> **Dernière mise à jour** : 27 février 2026  
> **Prérequis** : Phase A (runtime + pilote imu-games), Phase B (13 modules optionnels extraits)

---

## Résumé

La Phase C extrait les **modules activés par défaut** (mais non-core) et les **modules optionnels restants** du monolithe `web-app` en mini-apps Vite standalone. Contrairement aux modules Phase B (désactivés par défaut), ces modules seront **pré-installés automatiquement** pour chaque utilisateur.

### Décisions architecturales

| Décision | Date | Détail |
|----------|------|--------|
| `customize` reste natif | 26 fév 2026 | Personnalisation UI trop liée au shell (thèmes, layout, CSS variables) |
| `stories` reste natif | 26 fév 2026 | Fonctionnalité sociale de base intégrée au feed principal |
| `download` abandonné | 26 fév 2026 | Module vide — fonctionnalité intégrée nativement (partage fichiers) |
| `@imuchat/miniapp-sdk` externalisé | 25 fév 2026 | Doit être dans `build.rollupOptions.external` de chaque vite.config.ts |

---

## Mini-apps créées (Phase C)

| # | Mini-app | Port | Composants | I18n | Build | Taille JS | Statut |
|---|---------|:----:|:----------:|:----:|:-----:|:---------:|:------:|
| 1 | `imu-events` | 3214 | 2 + pages | 3 langues | ✅ 3.81s | 198 KB | ✅ Complet |
| 2 | `imu-music` | 3215 | 16 UI + 14 + MusicProvider | 3 langues | ✅ 5.29s | 413 KB | ✅ Complet |
| 3 | `imu-watch` | 3216 | 20 UI + 28 + 5 pages | 3 langues, 5 ns | ✅ 6.47s | 580 KB | ✅ Complet |
| 4 | `imu-admin` | 3217 | Dashboard 4 sections | 3 langues | ✅ 4.86s | 173 KB | ✅ Complet |
| 5 | `imu-stickers` | 3218 | Hub + grille emoji | 3 langues | ✅ 3.34s | 172 KB | ✅ Complet |
| 6 | `imu-news` | 3220 | 6 UI + 10 + 4 pages | 3 langues | ✅ 12.02s | 458 KB | ✅ Complet |
| 7 | `imu-podcasts` | 3221 | 10 UI + 25 + 5 pages | 3 langues | ✅ 6.40s | 502 KB | ✅ Complet |
| 8 | `imu-social-hub` | 3222 | 9 UI + 8 + 3 pages | 3 langues | ✅ 6.15s | 306 KB | ✅ Complet |
| 9 | `imu-creator-studio` | 3223 | 5 UI + stats + articles | 3 langues | ✅ 3.95s | 258 KB | ✅ Complet |

---

## Architecture commune

Chaque mini-app Phase C suit le même pattern que Phase B avec ces améliorations :

```
imu-<name>/
├── manifest.json              # Manifest du module
├── package.json               # deps + scripts (port 32XX)
├── vite.config.ts             # Vite + base=/miniapps/imu-<name>/
│                              # ⚠️ Doit inclure external: ['@imuchat/miniapp-sdk']
├── tsconfig.json
├── tsconfig.node.json
├── index.html
├── postcss.config.js
├── tailwind.config.js
└── src/
    ├── main.tsx               # ImuChatProvider → I18nProvider → App
    ├── App.tsx                 # Loading spinner → Page principale
    ├── index.css              # Tailwind + variables CSS ImuChat
    ├── lib/
    │   ├── utils.ts           # cn() helper (clsx + tailwind-merge)
    │   └── logger.ts          # Logger préfixé [imu-<name>]
    ├── providers/
    │   ├── ImuChatProvider.tsx # Bridge SDK, fallback mode dev
    │   └── I18nProvider.tsx    # Internationalisation avec overloads
    ├── i18n/
    │   ├── en.json
    │   ├── fr.json
    │   └── ja.json
    ├── components/
    │   └── ui/
    │       └── card.tsx       # Card shadcn/ui (réutilisé)
    └── pages/
        └── <Name>Page.tsx     # Page principale
```

### Particularités par mini-app

| Mini-app | Spécificités |
|----------|-------------|
| `imu-events` | Composants légers, 1 page EventsPage |
| `imu-music` | MusicProvider (contexte audio), 16 composants UI (PlayerBar, TrackList, AlbumGrid...), 14 composants métier |
| `imu-watch` | La plus complexe — 5 pages avec routing interne, 5 namespaces i18n, VideoPlayer, ChannelPage, SearchPage |
| `imu-admin` | Dashboard avec 4 sections (Users, Settings, Analytics, Moderation), icônes lucide-react |
| `imu-stickers` | Hub avec 3 sections (My Packs, Trending, Categories), grille emoji responsive (16 emojis placeholder) |
| `imu-news` | 4 pages (News, ArticleDetail, SourceDetail, Subscriptions), routing interne, framer-motion, carousel, AI suggestions |
| `imu-podcasts` | 5 pages + 25 composants métier, hub 4-tab (ForYou, Explore, TopCharts, Live), player audio avec waveform, creator 3-step wizard |
| `imu-social-hub` | 3 pages (Feed, Discover, Groups), layout 3 colonnes, useSocialFeed hook, PostComposer, StoriesCarousel, TrendingPanel |
| `imu-creator-studio` | Dashboard créateur avec StatsCards + ArticlesTable, pré-existant (~26 fichiers) |

### Pattern I18nProvider

Deux variantes utilisées :

**Standard (admin, stickers, events, music) :**
```tsx
// Overload 1: useTranslations(namespace) → TranslateFunction
function useTranslations(namespace: string): (key: string) => string;
// Overload 2: useTranslations() → { t, locale }
function useTranslations(): { t: (ns: string, key: string) => string; locale: string };
```

**Auto-searching (watch) :**
```tsx
// Cherche la clé dans tous les namespaces chargés
function useTranslations(namespace?: string): TranslateFunction;
```

### Pattern ImuChatProvider

```tsx
// Tente d'importer le SDK au runtime
const sdk = await import('@imuchat/miniapp-sdk');
// En cas d'échec (dev standalone), fournit un mock user
const fallbackUser = { id: 'dev-user', name: 'Developer', avatar: '...' };
```

---

## Leçons apprises

| Problème | Solution | Impacte |
|----------|----------|---------|
| `@imuchat/miniapp-sdk` introuvable au build | Ajouter `external: ['@imuchat/miniapp-sdk']` dans vite.config.ts | Tous les mini-apps |
| `'use client'` Next.js invalide en Vite | Supprimer la directive | Tous les composants migrés |
| `AppLayout` / `usePageHeader` non disponible | Supprimer (la mini-app est son propre layout) | Pages migrées |
| `useTranslations` de `next-intl` | Remplacer par le provider local I18nProvider | Tous les composants i18n |
| `Image` de `next/image` | Remplacer par `<img>` natif | Composants avec images |
| `Link` de `next/link` | Remplacer par onClick handlers ou `<a>` | Navigation interne |
| `useRouter` de `next/navigation` | Non nécessaire (SPA Vite, pas de routing Next.js) | Pages avec navigation |
| Imports `@/` relatifs au web-app | Reconfigurer tsconfig avec `paths: { "@/*": ["./src/*"] }` | Tous |

---

## Statistiques cumulées

### Phase A + B + C combinées

| Métrique | Phase A | Phase B | Phase C | Total |
|----------|:-------:|:-------:|:-------:|:-----:|
| Mini-apps créées | 1 | 13 | 9 | **23** |
| Composants migrés | — | 264 | ~130 | **~394** |
| Composants UI | — | 142 | ~55 | **~197** |
| Erreurs TS | 0 | 0 | 0 | **0** |
| Builds réussis | ✅ | ✅ (13/13) | ✅ (9/9) | **23/23** |
| Ports utilisés | 3200 | 3201-3213 | 3214-3223 | 3200-3223 |

### Modules restants dans web-app (après Phase C complète)

| Catégorie | Modules | Quantité |
|-----------|---------|:--------:|
| Core natif | chat, calls, notifications, hometab, store, wallet, themes, profile, help, comms, customize, stories | 12 |
| Intégration système | settings, contacts | 2 |
| Template dev | example | 1 |
| **Total dans bundle** | | **15** (cible atteinte) |

---

## Prochaines étapes (Phase D)

1. **Pré-installation automatique** : les modules Phase C (default-enabled) s'installent automatiquement au premier login
2. **Migration données utilisateur** : script pour déplacer les préférences utilisateur des modules extraits
3. **Unification des registres** : fusionner ModulesContext (11), module-registry (28), et filesystem (37) en 1 source Supabase
4. **Suppression code legacy** : retirer `web-app/src/modules/<module>/` pour les modules extraits
5. **Seed Supabase Phase C** : ajouter les 9 nouveaux modules dans la table `modules`
6. **Runtime iframe** : connecter tous les mini-apps au shell via le SDK `@imuchat/miniapp-sdk`

---

## Documents de référence

- [ARCHITECTURE_MODULES_AUDIT.md](ARCHITECTURE_MODULES_AUDIT.md) — Audit principal avec plan en 4 phases
- [PHASE_A_IMPLEMENTATION.md](PHASE_A_IMPLEMENTATION.md) — Runtime iframe + pilote imu-games
- [PHASE_B_IMPLEMENTATION.md](PHASE_B_IMPLEMENTATION.md) — 13 modules optionnels extraits
