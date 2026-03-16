# Audit Frontend — ImuChat Global

> Date : 2026-03-16
> Périmètre : web-app (Next.js 15) · desktop-app (Electron + Vite + React) · ui-kit
> Focus anomalies : côté web-app uniquement (sauf mentions explicites)

---

## Sommaire

1. [Vue d'ensemble](#1-vue-densemble)
2. [Anomalies web-app](#2-anomalies-web-app)
3. [Incohérences inter-applications](#3-incohérences-inter-applications)
4. [Question : la desktop-app doit-elle ressembler à la web-app ?](#4-question--la-desktop-app-doit-elle-ressembler-à-la-web-app-)
5. [État de la desktop-app (synthèse)](#5-état-de-la-desktop-app-synthèse)
6. [Recommandations priorisées](#6-recommandations-priorisées)

---

## 1. Vue d'ensemble

| Critère | web-app | desktop-app | ui-kit |
|---|---|---|---|
| Framework | Next.js 15 App Router | Electron + Vite + React | tsup (lib) |
| Routing | File-based (125 pages) | React Router v7 (53 KB conf) | — |
| State | 18+ React Context | 15 Zustand stores | — |
| Styling | Tailwind CSS 3 + CSS vars | Tailwind CSS v4 + `--imu-*` hardcodées | Radix + CVA |
| i18n | next-intl · 3 locales | i18next · 8 locales | propre i18n |
| Tests | 97 fichiers (Jest + Playwright) | 4 fichiers (Vitest) | 12 fichiers |
| Avancement | ~85 % MVP | ~70 % feature parity web | Design system complet |

---

## 2. Anomalies web-app

### 2.1 Provider tree surchargé (20+ niveaux)

**Fichier :** `web-app/src/app/[locale]/providers.tsx`

Le provider tree atteint 20 niveaux d'imbrication, dont plusieurs inutilement globaux :

```
QueryProvider → LayoutProvider → ThemeProvider → PageThemeProvider
→ AuthProvider → AgePolicyProvider → PlatformProvider
→ StreamVideoProvider → SocketProvider → ModulesProvider
→ MusicProvider → EffectProvider → SearchProvider
→ GuildDetailsProvider → WalletProvider → CartProvider
→ BettingProvider → CallProvider → PageHeaderProvider → PageFooterProvider
```

**Problèmes :**

- `GuildDetailsProvider` et `BettingProvider` montés globalement alors qu'ils ne servent qu'à 1-2 routes
- `CallProvider` au niveau 18 provoque des re-renders sur tout l'arbre lors d'un appel entrant
- `MusicProvider` + `EffectProvider` : aucune raison d'être au niveau racine

**Recommandation :** Déplacer `GuildDetailsProvider`, `BettingProvider`, `MusicProvider`, `EffectProvider` au plus proche de leur route d'usage. Migrer l'état global vers Zustand (voir §6).

---

### 2.2 48 composants UI locaux dupliquant le ui-kit

**Répertoire :** `web-app/src/components/ui/` (48 fichiers)

La web-app maintient sa propre bibliothèque de composants de base (Button, Input, Dialog, Tabs, etc.) en parallèle du `@imuchat/ui-kit`. Cela crée :

- Une double maintenance (bug fix à appliquer deux fois)
- Des divergences visuelles silencieuses entre web et desktop
- Des imports ambigus pour les développeurs (`import { Button } from '@/components/ui'` vs `from '@imuchat/ui-kit'`)

**Composants redondants identifiés :** `button`, `input`, `dialog`, `avatar`, `badge`, `card`, `checkbox`, `select`, `switch`, `tabs`, `tooltip`, `popover`, `dropdown-menu`, `skeleton`, `scroll-area`, `separator`, `accordion`, `alert`, `toast`, `progress`, `slider`.

**Recommandation :** Migration progressive vers ui-kit. Conserver uniquement les composants métier (`chat/`, `calls/`, `wallet/`…) en local.

---

### ~~2.3 Sécurité : DOMPurify absent~~ ✅ Déjà implémenté

**Statut :** Faux positif — `dompurify` ^3.3.2 est installé et `web-app/src/lib/sanitize.ts` expose déjà `sanitizeRichHTML`, `sanitizePlainText` et `sanitizeUrl`. Les `dangerouslySetInnerHTML` présents dans le code concernent uniquement du CSS/JSON-LD contrôlés par le serveur (pas de contenu utilisateur).

---

### 2.4 CSP headers non configurés

**Fichier attendu :** `web-app/next.config.ts`

Les headers Content-Security-Policy ne sont pas présents dans la configuration Next.js. Sans CSP :

- XSS reste exploitable même avec DOMPurify partiel
- Scripts inline non contrôlés
- Chargement de ressources tierces non restreint

**Recommandation :** Ajouter dans `next.config.ts` :

```ts
headers: async () => [{
  source: '/(.*)',
  headers: [
    { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; ..." },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  ]
}]
```

---

### 2.5 Tailwind CSS v3 alors que desktop utilise v4

**Fichier :** `web-app/package.json` → `tailwindcss: ^3.4.1`
**Comparaison :** `desktop-app/package.json` → `@tailwindcss/postcss` (Tailwind v4)

La web-app est bloquée en Tailwind v3 avec un `tailwind.config.ts` classique. La desktop-app utilise déjà Tailwind v4 (PostCSS plugin, pas de config file). Cela complique la mutualisation des tokens de design et l'alignement des utilitaires CSS.

**Recommandation :** Planifier la migration web-app vers Tailwind v4 après stabilisation du MVP, en synchronisant les tokens avec le ui-kit.

---

### 2.6 i18n : locale `ja` incomplète et locales manquantes

**Répertoires :** `web-app/messages/`

- `en.json` (~24 KB), `fr.json` (~27 KB) semblent complets
- `ja.json` existe mais n'a pas de version `-public` (`ja-public.json` absent alors que `en-public.json` et `fr-public.json` existent)
- La desktop-app supporte 8 locales (es, pt, zh, ar en plus) — la web-app ne les propose pas

**Conséquence :** Les utilisateurs japonais non connectés voient un fallback non localisé. Les utilisateurs ES/PT/ZH/AR n'ont pas d'accès web.

**Recommandation :**

1. Créer `web-app/messages/ja-public.json`
2. Évaluer si es/pt/zh/ar doivent être activées côté web (alignement avec la roadmap)

---

### 2.7 Route `test-push` exposée en production

**Route :** `web-app/src/app/[locale]/test-push/`

Une route de test pour les notifications push est présente dans le code de production. Elle peut révéler des informations sur l'infrastructure FCM.

**Recommandation :** Supprimer ou conditionner avec `if (process.env.NODE_ENV !== 'production')` via middleware.

---

### 2.8 `CallProvider` placé au niveau 18 du provider tree

Voir §2.1. Impact spécifique : lors d'un appel entrant (événement Socket.IO), le `CallProvider` re-rend tout l'arbre des 18 providers, impactant les performances perçues.

**Recommandation :** Extraire l'état d'appel dans un store Zustand dédié `useCallStore`, ne garder en contexte que les callbacks stables.

---

### 2.9 Services : 73 fichiers sans organisation claire

**Répertoire :** `web-app/src/services/`

73 fichiers de services sans sous-dossiers visibles, ce qui rend la découvrabilité difficile. Contraste avec desktop-app qui organise en sous-répertoires domaine.

**Recommandation :** Organiser en `services/auth/`, `services/chat/`, `services/wallet/`, etc. (alignement avec desktop-app).

---

### ~~2.10 Hooks sans guards de contexte~~ ✅ Déjà implémenté

**Statut :** Faux positif — tous les hooks exportés (`useWallet`, `useCart`, `useMusic`, `useBetting`, `useCall`, `useGuildDetails`, `useModules`, `useLayout`, `useSearch`, `useSocketContext`, `usePageHeader`, `usePageFooter`, `useAuth`…) contiennent déjà un guard explicite avec message d'erreur lisible.

---

## 3. Incohérences inter-applications

Ces points concernent la divergence entre web-app et desktop-app (à titre informatif, correctifs à prioriser selon la réponse à la question §4).

| # | Sujet | web-app | desktop-app | Impact |
|---|---|---|---|---|
| A | State management | 18+ React Context | 15 Zustand stores | Patterns différents, knowledge barrier |
| B | Tailwind version | v3 (config file) | v4 (PostCSS) | Tokens non mutualisés |
| C | CSS variables | `--background`, `--primary`… | `--imu-bg`, `--imu-primary`… | Nommage incompatible |
| D | i18n | next-intl · 3 locales | i18next · 8 locales | Traductions non partagées |
| E | Composants UI | 48 locaux (shadcn) | Re-export ui-kit uniquement | Duplication web-app |
| F | Tests | 97 fichiers | 4 fichiers | Risque régressif desktop |
| G | Feature set | 37 routes | 85+ modules | Parité non documentée |
| H | Socket init | Dans provider tree | Au niveau App root | Cycles de vie différents |
| I | Auth pattern | Context (AuthProvider) | Zustand (useAuthStore) | Sync potentiellement fragile |
| J | Tailwind config | `tailwind.config.ts` | Absent | Thème non extensible côté desktop |

---

## 4. Question : la desktop-app doit-elle ressembler à la web-app ?

### Réponse courte : **Alignement des tokens et composants, pas nécessairement de la mise en page**

### Détail

**Ce qui DOIT être identique (brand consistency) :**

- Couleurs primaires, secondaires, état (success/warning/error)
- Typographie (familles de polices, échelles)
- Icônes (même set Lucide React)
- Composants atomiques : boutons, inputs, avatars, badges, bulles de chat
- Thèmes (dark/light/kawaii/gaming/minimal) — gérés par ui-kit

**Ce qui PEUT différer légitimement (context d'usage) :**

- **Layout général** : la desktop-app a une `TitleBar` Electron et une `StatusBar` qui n'existent pas en web. La sidebar peut être persistante (desktop) vs collapsible (web mobile-first).
- **Navigation** : React Router v7 vs Next.js App Router — les patterns d'intercept routes (modales parallèles) du web n'ont pas d'équivalent direct en desktop.
- **Densité d'information** : un écran desktop 1920px justifie plus de colonnes et de panneaux côte à côte qu'un viewport web responsive.
- **Raccourcis clavier** : le `KeyboardShortcuts` component desktop n'a pas d'équivalent web (à évaluer).
- **Fenêtre native** : drag, resize, minimize gérés par Electron — la web-app n'a pas à simuler ça.

**Ce qui est actuellement incohérent et devrait être corrigé :**

- Nommage des CSS variables (`--primary` web vs `--imu-primary` desktop) → unifier via ui-kit tokens
- Couleur de fond sombre hardcodée desktop (`#0f0a1a`) qui n'est pas la valeur dark du ui-kit → utiliser le token
- Tailwind versions différentes → planifier alignement sur v4

### Verdict UX

La desktop-app est fondamentalement un **wrapper natif de la même expérience**, donc l'utilisateur qui passe de la web-app à la desktop-app ne doit pas avoir de surprise sur les couleurs, les composants ou les interactions core. La mise en page peut exploiter les avantages du bureau (plus d'espace, menus natifs, raccourcis), mais l'identité visuelle doit être unifiée via le ui-kit.

---

## 5. État de la desktop-app (synthèse)

| Critère | État | Note |
|---|---|---|
| Features | 85+ modules | Dépasse la web-app en volume |
| Tests | ❌ 4 fichiers / 161 composants | Risque élevé |
| Tailwind config | ❌ Absent | CSS vars hardcodées |
| Alignement ui-kit | ⚠️ Partiel | Re-export mais vars CSS non alignées |
| Auth UI | ✅ app/auth/ présent | À vérifier exhaustivité (OTP, reset) |
| i18n | ✅ 8 locales | Avance sur web-app |
| State management | ✅ Zustand | Pattern plus scalable |
| Electron packaging | ✅ electron-builder.json5 | Configuré multi-OS |

---

## 6. Recommandations priorisées

### P0 — Sécurité (immédiat)

| Action | Fichier(s) | Effort | Statut |
|---|---|---|---|
| ~~DOMPurify~~ | ~~`lib/sanitize.ts`~~ | ~~M~~ | ✅ déjà fait |
| ~~CSRF protection~~ | ~~`lib/csrf.ts`~~ | ~~M~~ | ✅ déjà fait |
| Enrichir CSP dans `middleware.ts` (Firebase, Stream, Fonts…) | `src/middleware.ts` | S | ✅ fait 2026-03-16 |
| Conditionner route `test-push` en prod | `middleware-routes.ts` + `middleware.ts` | XS | ✅ fait 2026-03-16 |

### P1 — Qualité web-app (court terme)

| Action | Fichier(s) | Effort | Statut |
| --- | --- | --- | --- |
| ~~Guards dans hooks de contexte~~ | ~~`contexts/*.tsx`~~ | ~~S~~ | ✅ déjà fait |
| Réduire provider tree (providers hors layout global) | `app/[locale]/providers.tsx` | M | ⬜ à faire |
| Créer `ja-public.json` | `messages/` | XS | ✅ fait 2026-03-16 |
| Organiser `services/` en sous-dossiers domaine | `services/` | M | ⬜ à faire |

### P2 — Alignement design system (moyen terme)

| Action | Effort |
|---|---|
| Unifier nommage CSS variables (ui-kit → web + desktop) | L |
| Migrer composants `ui/` web-app vers ui-kit | L |
| Créer `tailwind.config.ts` desktop-app avec tokens ui-kit | S |

### P3 — Tests desktop-app (continu)

| Action | Effort |
|---|---|
| Atteindre 70 % de couverture Vitest sur desktop-app | XL |
| Documenter matrice features web vs desktop vs mobile | M |

### P4 — i18n unifiée (long terme)

| Action | Effort |
|---|---|
| Créer package `@imuchat/i18n` avec traductions partagées | L |
| Aligner locales web-app sur desktop-app (es, pt, zh, ar) | M |

---

*Généré le 2026-03-16 — audit manuel assisté par analyse statique du code source.*
