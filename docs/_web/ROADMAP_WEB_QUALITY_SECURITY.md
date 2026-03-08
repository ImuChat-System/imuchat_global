# 🔒 ROADMAP — Qualité, Sécurité & Performance · Web App ImuChat

**Date de création :** 8 mars 2026  
**Document source :** `FRONTEND_AUDIT_SUPERAPP.md`  
**Stack :** Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS 3.4 · shadcn/ui · Supabase · Sentry  
**État actuel :** Note globale B- · Sécurité D (critique) · Tests C · Performance B · a11y C

---

## Vue d'ensemble

| Phase | Nom | Sprints | Durée estimée |
|-------|-----|:-------:|:-------------:|
| 1 | Sécurité Critique | 2 | 4 semaines |
| 2 | Couverture Tests | 3 | 6 semaines |
| 3 | Performance & State | 2 | 4 semaines |
| 4 | Accessibilité (a11y) | 2 | 4 semaines |
| 5 | Qualité de Code & CI/CD | 2 | 4 semaines |
| 6 | Monitoring & Observabilité | 1 | 2 semaines |
| **Total** | | **12 sprints** | **24 semaines** |

---

## Phase 1 — Sécurité Critique (Sprints 1-2)

> 🔴 **Bloque la mise en production.** Corriger toutes les failles identifiées dans l'audit.

### Sprint 1 · Blindage XSS, CSP & Headers

**Objectif :** Fermer les failles XSS et ajouter les headers de sécurité manquants

| Tâche | Description | Priorité | Fichiers impactés |
|-------|-------------|:--------:|-------------------|
| **DOMPurify** | Installer `dompurify` + `@types/dompurify`. Créer `src/lib/sanitize.ts` avec `sanitizeUserContent()`. Appliquer sur TipTap output, messages chat, profils bio, tout `dangerouslySetInnerHTML` | 🔴 P0 | `lib/sanitize.ts`, `components/chat/message-item.tsx`, `components/office/tiptap-editor.tsx`, tout composant affichant du HTML user |
| **CSP Headers** | Ajouter Content-Security-Policy dans `src/middleware.ts` : `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sentry.io; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://*.stream-io-cdn.com` | 🔴 P0 | `middleware.ts` |
| **Security Headers** | Ajouter dans middleware : `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=self, microphone=self, geolocation=()` | 🔴 P0 | `middleware.ts` |
| **ignoreBuildErrors** | Supprimer `ignoreBuildErrors: true` de `next.config.ts`. Identifier et corriger toutes les erreurs TypeScript résultantes | 🔴 P0 | `next.config.ts`, fichiers avec erreurs TS |
| **Audit TS errors** | Exécuter `tsc --noEmit` et corriger chaque erreur systématiquement. Documenter les erreurs complexes si besoin de refactoring ultérieur | 🟠 P1 | Multiple |

**Livrables Sprint 1 :**

- ✅ 0 failles XSS (`dangerouslySetInnerHTML` toujours derrière DOMPurify)
- ✅ Headers de sécurité 6/6 actifs
- ✅ Build TypeScript sans `ignoreBuildErrors`
- ✅ CSP bloquant les scripts non autorisés

**Tests de validation :**

- `curl -I https://localhost:3000` → vérifier présence de tous les headers
- Test Playwright injectant `<script>alert(1)</script>` dans le chat → aucune exécution
- `pnpm build` passe sans erreur

---

### Sprint 2 · CSRF, Cookies, Validation API & Audit Dépendances

**Objectif :** Protéger les mutations, sécuriser le stockage, valider les données entrantes

| Tâche | Description | Priorité | Fichiers impactés |
|-------|-------------|:--------:|-------------------|
| **CSRF tokens** | Implémenter un middleware CSRF pour les routes API de mutation (POST /api/wallet/*, POST /api/store/*). Pattern : double-submit cookie + header `X-CSRF-Token` | 🟠 P1 | `middleware.ts`, `app/api/*/route.ts` |
| **Cookies flags** | Auditer tous les cookies (Supabase session, préférences). S'assurer : `Secure` (HTTPS only), `HttpOnly` (pas de JS access), `SameSite=Lax` (ou Strict) | 🟠 P1 | `lib/supabase/server.ts`, `lib/supabase/client.ts` |
| **Validation Zod API** | Créer des schémas Zod pour valider les réponses API Supabase avant consommation. Pattern : `const parsed = ResponseSchema.safeParse(data); if (!parsed.success) throw new APIValidationError()` | 🟡 P1 | Tous les fichiers `services/*-api.ts` |
| **localStorage encryption** | Pour les données sensibles (tokens refresh, préférences KYC) : chiffrer via `crypto.subtle.encrypt` avant stockage. Créer `lib/secure-storage.ts` | 🟡 P1 | `lib/secure-storage.ts`, stores Zustand avec persist |
| **Audit dépendances** | Ajouter `pnpm audit` dans le pipeline CI. Corriger les vulnérabilités high/critical. Configurer Snyk ou `npm audit --audit-level=high` dans pre-commit | 🟡 P1 | `package.json`, `.github/workflows/` |
| **Rate limiting client** | Créer `lib/rate-limiter.ts` avec debounce/throttle. Appliquer sur : soumission formulaires (500ms debounce), recherche (300ms), upload (1 req/5s) | 🟡 P1 | `lib/rate-limiter.ts`, composants formulaire |
| **Firebase cleanup** | Supprimer tous les résidus Firebase : `.env` vars `NEXT_PUBLIC_FIREBASE_*`, `firebase.json`, `firestore.rules`, service workers Firebase obsolètes | 🟡 P1 | `.env.example`, `firebase.json`, `firestore.rules` |

**Livrables Sprint 2 :**

- ✅ CSRF actif sur toutes les routes de mutation
- ✅ Cookies sécurisés (Secure + HttpOnly + SameSite)
- ✅ Validation Zod sur les 10 services API les plus critiques
- ✅ 0 dépendance avec vulnérabilité high/critical
- ✅ Résidus Firebase supprimés

**Métriques cibles Phase 1 :**

| Métrique | Avant | Après |
|----------|:-----:|:-----:|
| Headers de sécurité | 0/6 | 6/6 |
| Vulnérabilités npm high/critical | Non mesuré | 0 |
| `ignoreBuildErrors` | `true` | Supprimé |
| Sanitisation XSS | 0% | 100% |

---

## Phase 2 — Couverture Tests (Sprints 3-5)

> Passer de ~20% de couverture à 70%+ avec une stratégie pyramidale.

### Sprint 3 · Infrastructure Tests & Composants Core

**Objectif :** Mettre en place l'infrastructure de test et couvrir les composants critiques

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Mocks factories** | Créer `__mocks__/factories/` avec : `createMockUser()`, `createMockConversation()`, `createMockMessage()`, `createMockModule()`, `createMockProfile()`. Chaque factory retourne des données typées avec des valeurs réalistes par défaut et des overrides | 🟠 P0 | `__mocks__/factories/*.ts` |
| **MSW handlers** | Étendre les handlers MSW existants pour couvrir : `auth/*`, `conversations/*`, `messages/*`, `profiles/*`, `store/*`, `wallet/*`, `gamification/*` | 🟠 P0 | `__mocks__/handlers/*.ts` |
| **Tests Auth** | Écrire les tests pour : `LoginForm` (submit, validation, erreurs), `SignupForm` (validation email/password, OAuth), `AuthContext` (session hydration, token refresh, signOut), protected routes (redirect) | 🟠 P0 | `components/auth/__tests__/`, `contexts/__tests__/auth.test.tsx` |
| **Tests Chat** | Tests pour : `MessageItem` (rendu texte/média/vocal, réactions), `MessageInput` (envoi, emoji, upload), `ConversationList` (recherche, filtres, unread badge), `ChatLayout` (panel switch) | 🟠 P0 | `components/chat/__tests__/` |
| **Tests Store** | Tests pour : `ModuleCard` (install flow, prix, rating), `PurchaseModal` (validation, Stripe), `ModuleCategoryFilter` | 🟠 P0 | `components/store/__tests__/` |
| **jest-axe systématique** | Ajouter `expect(await axe(container)).toHaveNoViolations()` dans chaque nouveau test de composant. Créer un helper `testA11y(component)` | 🟠 P0 | Tous les nouveaux `__tests__/` |

**Livrables Sprint 3 :**

- ✅ Factories mock complètes (5 domaines)
- ✅ MSW handlers pour 7 domaines API
- ✅ Tests Auth : 15+ tests
- ✅ Tests Chat composants : 20+ tests
- ✅ Tests Store : 10+ tests
- ✅ a11y check dans chaque test

---

### Sprint 4 · Tests Hooks, Services & Contextes

**Objectif :** Couvrir la couche logique (hooks, services API, contextes)

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Tests hooks** | Tester avec `renderHook` : `useAuth`, `useConversations`, `useMessages`, `useSocket`, `useProfile`, `useGamification`, `useTasks`, `useContacts`, `useWallet`, `useStore` (10 hooks min) | 🟠 P0 | `hooks/__tests__/` |
| **Tests services** | Tester chaque service avec MSW : `companion-api`, `gamification-api`, `office-api`, `files-api`, `store-transactions-api`, `notification-api`, `analytics-api`, `events-api`, `tasks-api`, `imucoin-api` (10 services min) | 🟠 P0 | `services/__tests__/` |
| **Tests contextes** | Tester : `ThemeContext` (switch theme, density, persist), `ModulesContext` (install, activate, deactivate), `SocketContext` (connect, disconnect, events), `WalletContext` (balance, transactions) | 🟡 P1 | `contexts/__tests__/` |
| **Seuil couverture** | Modifier `jest.config.js` : `coverageThreshold.global` → `{ branches: 60, functions: 65, lines: 65, statements: 65 }` (étape intermédiaire) | 🟡 P1 | `jest.config.js` |
| **Coverage badge** | Ajouter badge couverture dans le README. Script CI qui échoue si couverture < seuil | 🟢 P2 | `README.md`, `.github/workflows/` |

**Livrables Sprint 4 :**

- ✅ 10+ hooks testés
- ✅ 10+ services testés
- ✅ 4+ contextes testés
- ✅ Seuil couverture monté à 65%

---

### Sprint 5 · Tests E2E & Régression Visuelle

**Objectif :** Couvrir les flux utilisateur complets et prévenir les régressions visuelles

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **E2E Auth flow** | Playwright : signup → verify email → login → voir hometab → logout → redirect login | 🟠 P0 | `e2e/auth.spec.ts` |
| **E2E Chat flow** | Login → ouvrir conversation → envoyer message texte → voir message → envoyer emoji → voir réaction | 🟠 P0 | `e2e/chat.spec.ts` |
| **E2E Store flow** | Login → store → chercher module → voir détail → installer → vérifier activé | 🟡 P1 | `e2e/store.spec.ts` |
| **E2E Profile flow** | Login → profil → éditer bio → upload avatar → sauvegarder → vérifier | 🟡 P1 | `e2e/profile.spec.ts` |
| **E2E Settings flow** | Login → settings → changer thème → vérifier appliqué → changer langue → vérifier | 🟡 P1 | `e2e/settings.spec.ts` |
| **axe-core Playwright** | Installer `@axe-core/playwright`. Ajouter scan a11y dans chaque test E2E : `await checkA11y(page)` | 🟡 P1 | Tous les `e2e/*.spec.ts` |
| **Snapshot tests** | Ajouter snapshot tests pour les composants UI stables : Button (5 variantes), Card (3), Badge (4), Dialog, Toast, Avatar | 🟢 P2 | `components/ui/__tests__/snapshots/` |
| **Seuil final** | Monter `coverageThreshold.global` à `{ branches: 70, functions: 70, lines: 70, statements: 70 }` | 🟡 P1 | `jest.config.js` |

**Livrables Sprint 5 :**

- ✅ 5 flux E2E complets (Auth, Chat, Store, Profile, Settings)
- ✅ a11y audit automatisé dans chaque test E2E
- ✅ Snapshot tests pour composants UI stables
- ✅ Couverture ≥ 70%

**Métriques cibles Phase 2 :**

| Métrique | Avant | Après |
|----------|:-----:|:-----:|
| Couverture tests | ~20% | 70%+ |
| Tests unitaires composants | ~15 fichiers | 60+ fichiers |
| Tests E2E | 1 (chat) | 5 flux |
| Composants avec test a11y | ~5% | 80%+ |

---

## Phase 3 — Performance & State Management (Sprints 6-7)

### Sprint 6 · TanStack Query & Memoization

**Objectif :** Optimiser le data fetching et réduire les re-renders

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **TanStack Query setup** | Configurer `QueryClient` avec : `staleTime: 5 * 60 * 1000`, `gcTime: 30 * 60 * 1000`, `retry: 2`, `retryDelay: exponentialBackoff`. Wrapping dans `QueryProvider` (déjà existant — vérifier config) | 🟠 P0 | `providers/QueryProvider.tsx` |
| **Query hooks migration** | Migrer les 10 services les plus utilisés vers `useQuery` / `useMutation` : conversations, messages, profile, contacts, modules, gamification, wallet, notifications, tasks, events | 🟠 P0 | `hooks/queries/*.ts` (nouveau dossier) |
| **Optimistic updates** | Implémenter optimistic updates sur : envoi message (apparaît immédiatement), toggle réaction, install module, envoi like. Pattern : `onMutate → update cache → rollback on error` | 🟡 P1 | `hooks/queries/useMessages.ts`, `hooks/queries/useReactions.ts` |
| **React.memo** | Ajouter `React.memo()` sur les composants de liste : `ConversationItem`, `MessageItem`, `ContactItem`, `ModuleCard`, `NotificationItem`, `TaskCard` (6 composants minimum) | 🟠 P0 | Composants listés |
| **useMemo / useCallback** | Audit complet : ajouter `useMemo` sur les calculs coûteux (filtrage listes, tri, agrégation), `useCallback` sur les handlers passés en props enfants | 🟡 P1 | Multiple |
| **Sélecteurs Zustand** | Remplacer les `useStore()` complets par des sélecteurs granulaires : `useStore(s => s.field)` pour éviter les re-renders sur champs non consommés | 🟡 P1 | Tous les appels `useStore()` |

**Livrables Sprint 6 :**

- ✅ TanStack Query opérationnel avec 10 query hooks
- ✅ Optimistic updates sur messages, réactions, modules
- ✅ 6+ composants de liste memoized
- ✅ Re-renders réduits de 40%+ (mesurable via React DevTools Profiler)

---

### Sprint 7 · Virtualisation, Lazy Loading & Core Web Vitals

**Objectif :** Optimiser le rendu des listes longues et les métriques web

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Virtualisation listes** | Installer `@tanstack/react-virtual`. Appliquer sur : ConversationList (100+ items), ContactList, MessageList (infini scroll), ModuleList (store), NotificationList | 🟠 P0 | `components/chat/conversation-list.tsx`, `components/contacts/`, etc. |
| **Code splitting** | Auditer avec `@next/bundle-analyzer`. Créer des chunks dynamiques pour : Office (TipTap est lourd), Calls (Stream SDK), AI (Genkit), Companion (Live2D) | 🟡 P1 | `next.config.ts`, composants via `next/dynamic` |
| **Route prefetching** | Ajouter `prefetch` sur les navigations fréquentes (sidebar: chat, contacts, settings, store, profile) | 🟡 P1 | `components/layout/sidebar.tsx` |
| **Core Web Vitals** | Installer `web-vitals`. Reporter vers Sentry Performance : LCP, FID, CLS, TTFB. Créer dashboard | 🟡 P1 | `src/app/layout.tsx`, Sentry config |
| **Image optimization** | Auditer les images non optimisées. S'assurer que tout passe par `next/image` avec `sizes` et `priority` correctement configurés | 🟡 P1 | Multiple (composants avec `<img>`) |
| **Socket.io lazy** | Ne charger socket.io-client que quand l'utilisateur est authentifié et sur une page qui en a besoin (chat, calls). Ne pas importer globalement | 🟡 P1 | `contexts/SocketContext.tsx` |
| **React Query DevTools** | Ajouter `@tanstack/react-query-devtools` en dev uniquement | 🟢 P2 | `providers/QueryProvider.tsx` |

**Livrables Sprint 7 :**

- ✅ Listes virtualisées (5 composants)
- ✅ Bundle réduit de 30%+ (Office, Calls, AI en lazy)
- ✅ Core Web Vitals monitorés en production
- ✅ LCP < 2.5s, CLS < 0.1

**Métriques cibles Phase 3 :**

| Métrique | Avant | Après |
|----------|:-----:|:-----:|
| LCP | Non mesuré | < 2.5s |
| CLS | Non mesuré | < 0.1 |
| Bundle initial (gzip) | Non mesuré | < 200KB |
| Re-renders inutiles | Fréquents | -40% |

---

## Phase 4 — Accessibilité WCAG AA (Sprints 8-9)

### Sprint 8 · Audit ARIA & Navigation Clavier

**Objectif :** Conformité WCAG AA sur les flux principaux

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Audit ARIA systématique** | Parcourir les 20 composants interactifs les plus utilisés. Ajouter : `aria-label`, `aria-describedby`, `aria-expanded`, `aria-haspopup`, `role` manquants | 🟠 P0 | `components/chat/`, `components/layout/`, `components/store/`, `components/auth/` |
| **Hiérarchie headings** | Vérifier chaque page : 1 seul `<h1>`, hiérarchie `h1 > h2 > h3` sans saut. Corriger les violations | 🟠 P0 | Toutes les pages `app/[locale]/*/page.tsx` |
| **Focus management** | Vérifier que `focus-visible` est stylisé de manière visible sur tous les composants interactifs. Les modals doivent trap le focus. Escape ferme toujours | 🟠 P0 | `components/ui/dialog.tsx`, `components/ui/sheet.tsx`, tous les modals |
| **Navigation clavier complète** | Tester au clavier : sidebar (Tab, Arrow), chat (Enter envoie, Shift+Enter newline), store (Tab travers les cards), settings (Tab entre sections). Corriger les tabindex cassés | 🟠 P0 | Multiple |
| **aria-live** | Ajouter `aria-live="polite"` sur : toasts, messages chat nouveaux, résultats recherche, notifications badge count. `aria-live="assertive"` pour erreurs critiques | 🟡 P1 | `components/ui/toast.tsx`, `components/chat/message-list.tsx`, `components/layout/notification-panel.tsx` |
| **Labels formulaires** | Auditer tous les `<input>` : chacun doit avoir un `<label>` associé via `htmlFor` ou `aria-labelledby`. Corriger les inputs orphelins | 🟡 P1 | Tous les formulaires |
| **Alt text images** | Auditer toutes les `<Image>` / `<img>` : alt descriptif pour les images informatives, `alt=""` pour les décoratives. Aucun alt manquant | 🟡 P1 | Multiple |

**Livrables Sprint 8 :**

- ✅ 20+ composants avec ARIA complet
- ✅ Hiérarchie headings correcte sur toutes les pages
- ✅ Focus visible + trap dans tous les modals
- ✅ Navigation clavier complète sur les flux principaux

---

### Sprint 9 · Contraste, Animations & Tests a11y

**Objectif :** Contraste WCAG AA sur tous les thèmes, animations accessibles, tests automatisés

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **Audit contraste 16 combinaisons** | Vérifier le contraste WCAG AA (4.5:1 texte normal, 3:1 grand texte) sur : 8 thèmes × 2 modes (light/dark) = 16 combinaisons. Utiliser `axe-core` + test manuel | 🟠 P0 | `src/index.css` (variables CSS), fichiers de thèmes |
| **Corriger les contrastes** | Ajuster les couleurs qui ne passent pas le contraste AA. Priorité : texte principal, labels, placeholder, liens, boutons disabled | 🟠 P0 | Variables CSS des thèmes |
| **prefers-reduced-motion** | Synchroniser le media query système avec la préférence utilisateur. Créer `useAnimationConfig()` qui retourne `{ shouldAnimate, transition }`. Appliquer partout où Framer Motion est utilisé | 🟡 P1 | Nouveau hook, tous les composants avec `motion.div` |
| **Taille cibles tactiles** | Auditer les cibles tactiles : minimum 44×44px (WCAG 2.5.5). Corriger les boutons, liens, icônes trop petits — surtout dans le chat et la sidebar mobile | 🟡 P1 | Composants interactifs mobiles |
| **Screen reader testing** | Tester VoiceOver (macOS) sur les 5 flux principaux : login, chat, store, profile, settings. Documenter les problèmes et corriger | 🟡 P1 | Documentation + corrections |
| **axe-core CI** | Ajouter `@axe-core/playwright` dans les tests E2E CI. Chaque test E2E inclut un scan a11y. Le pipeline échoue si violations critical/serious | 🟡 P1 | `.github/workflows/`, `e2e/*.spec.ts` |

**Livrables Sprint 9 :**

- ✅ Contraste AA validé sur 16 combinaisons thème/mode
- ✅ `prefers-reduced-motion` respecté partout
- ✅ Cibles tactiles ≥ 44×44px
- ✅ a11y CI automatisé

**Métriques cibles Phase 4 :**

| Métrique | Avant | Après |
|----------|:-----:|:-----:|
| Score Lighthouse a11y | Non mesuré | 95+ |
| Composants avec ARIA complet | ~30% | 95%+ |
| Violations axe-core critical | Non mesuré | 0 |
| Thèmes conformes AA | Non vérifié | 16/16 |

---

## Phase 5 — Qualité de Code & CI/CD (Sprints 10-11)

### Sprint 10 · Lint, Format & Consolidation Contextes

**Objectif :** Automatiser la qualité et réduire la complexité architecturale

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **ESLint strict** | Ajouter les règles : `no-unused-vars: error`, `no-console: warn` (sauf `console.error`), `react-hooks/exhaustive-deps: error`, `import/order: error`, `@typescript-eslint/no-explicit-any: warn` | 🟡 P1 | `eslint.config.mjs` |
| **Prettier** | Configurer Prettier : `singleQuote: true`, `semi: true`, `tabWidth: 2`, `trailingComma: 'es5'`, `printWidth: 100`. Ajouter `prettier --write` dans lint-staged | 🟡 P1 | `.prettierrc`, `package.json` |
| **Consolider contextes** | Fusionner 17 → ~10 contextes : `LeftSidebarContext` + `RightSidebarContext` + `LayoutContext` → `LayoutContext`, `PageHeaderContext` + `PageFooterContext` + `PageThemeContext` → `PageContext`, supprimer contextes non utilisés | 🟡 P1 | `contexts/*.tsx` |
| **ignoreDeprecations** | Supprimer `"ignoreDeprecations": "5.0"` de `tsconfig.json`. Corriger les APIs dépréciées TypeScript | 🟡 P1 | `tsconfig.json`, fichiers avec APIs dépréciées |
| **Supabase types** | Exécuter `supabase gen types typescript` pour générer les types DB. Remplacer `Database = any` dans `lib/supabase.ts` par les types générés | 🟡 P1 | `lib/supabase.ts`, `types/database.ts` |
| **Code mort** | Supprimer : fichiers `.old`, imports inutilisés, composants non référencés, résidus Firebase. Utiliser `ts-prune` pour détecter les exports inutilisés | 🟡 P1 | Multiple |

**Livrables Sprint 10 :**

- ✅ ESLint strict + Prettier configurés
- ✅ Contextes réduits de 17 → ~10
- ✅ Types Supabase générés (plus de `Database = any`)
- ✅ Code mort supprimé

---

### Sprint 11 · CI/CD Pipeline & Storybook

**Objectif :** Pipeline CI complet et documentation des composants

| Tâche | Description | Priorité | Fichiers |
|-------|-------------|:--------:|----------|
| **GitHub Actions pipeline** | Créer `.github/workflows/ci.yml` : `lint` → `typecheck` → `unit tests` → `e2e tests` → `a11y audit` → `security audit`. Matrix : Node 20/22 | 🟡 P1 | `.github/workflows/ci.yml` |
| **PR checks** | Configurer : la CI doit passer pour merge. Coverage diff affiché dans le PR. Bundle size diff affiché | 🟡 P1 | `.github/workflows/`, settings repo |
| **Storybook** | Installer Storybook 8. Créer des stories pour les 20 composants UI les plus utilisés : Button, Input, Dialog, Card, Badge, Avatar, Tabs, Toast, Sidebar, Dropdown, Select, Checkbox, Switch, Tooltip, Sheet, Command, Progress, Skeleton, ScrollArea, Table | 🟡 P1 | `.storybook/`, `components/ui/*.stories.tsx` |
| **Storybook deploy** | Déployer Storybook sur Chromatic ou Vercel pour review. Lien dans le README | 🟢 P2 | `.github/workflows/storybook.yml` |
| **Conventional commits** | Configurer `commitlint` + `@commitlint/config-conventional`. Hooks Husky dans `commit-msg`. Changelog auto | 🟢 P2 | `.commitlintrc`, `.husky/commit-msg` |
| **Bundle analyzer CI** | Ajouter `@next/bundle-analyzer` report dans la CI. Alerte si bundle initial > 200KB gzip | 🟢 P2 | `.github/workflows/ci.yml` |

**Livrables Sprint 11 :**

- ✅ CI/CD pipeline complet (lint → test → deploy)
- ✅ Storybook avec 20+ composants documentés
- ✅ PR checks automatiques

---

## Phase 6 — Monitoring & Observabilité (Sprint 12)

### Sprint 12 · Sentry Enrichi & Analytics

**Objectif :** Monitoring production complet

| Tâche | Description | Priorité |
|-------|-------------|:--------:|
| **Sentry catégorisation** | Configurer les catégories d'erreurs Sentry : `network`, `auth`, `validation`, `runtime`, `api`. Alertes différenciées par catégorie | 🟡 P1 |
| **Sentry Performance** | Activer le tracing Sentry : transactions sur les routes principales, spans sur les appels API critiques. Budget : LCP < 2.5s, FID < 100ms | 🟡 P1 |
| **Error boundary enrichis** | Améliorer les error boundaries avec : illustration custom, bouton retry, lien support, envoi automatique à Sentry avec contexte | 🟡 P1 |
| **Suspense boundaries** | Adopter `<Suspense>` avec fallback `<Skeleton />` pour les composants data-dependent. Remplacer les patterns `isLoading ? <Spinner /> : <Content />` | 🟡 P1 |
| **Offline detection** | Créer `useOnlineStatus()` hook. Afficher un banner quand offline. Mettre en queue les actions et retry quand online | 🟡 P1 |
| **Logging structuré** | Créer `lib/logger.ts` avec niveaux (debug, info, warn, error). En dev : console coloré. En prod : envoi à Sentry. Pas de `console.log` sauvage | 🟢 P2 |

**Livrables Sprint 12 :**

- ✅ Sentry catégorisé avec alertes
- ✅ Performance monitoring actif
- ✅ Suspense boundaries sur les composants data-dependent
- ✅ Détection offline avec queue d'actions

---

## Dépendances inter-sprints

```
Sprint 1 (XSS/CSP/Headers)
    │
    ├──→ Sprint 2 (CSRF/Cookies/Validation)
    │       │
    │       └──→ Sprint 10 (ESLint/Types/Cleanup)
    │               │
    │               └──→ Sprint 11 (CI/CD/Storybook)
    │
    └──→ Sprint 3 (Infra tests/Mocks)
            │
            ├──→ Sprint 4 (Tests hooks/services)
            │       │
            │       └──→ Sprint 5 (E2E/Snapshots)
            │
            └──→ Sprint 6 (React Query/Memo)
                    │
                    └──→ Sprint 7 (Virtual/Lazy/CWV)
                            │
                            └──→ Sprint 12 (Monitoring)

Sprint 8 (ARIA/Clavier) ──→ Sprint 9 (Contraste/Motion)
```

---

## KPIs globaux

| Métrique | Actuel | Cible Sprint 5 | Cible Sprint 12 |
|----------|:------:|:--------------:|:---------------:|
| **Note sécurité** | D | B+ | A |
| **Couverture tests** | ~20% | 70% | 80% |
| **Score Lighthouse perf** | Non mesuré | 85+ | 90+ |
| **Score Lighthouse a11y** | Non mesuré | 90+ | 95+ |
| **Headers sécurité** | 0/6 | 6/6 | 6/6 |
| **Erreurs TS build** | Ignorées | 0 | 0 |
| **LCP** | Non mesuré | < 2.5s | < 2s |
| **CLS** | Non mesuré | < 0.1 | < 0.05 |
| **Bundle initial** | Non mesuré | < 250KB | < 200KB |
| **Contextes React** | 17 | 17 | ~10 |
| **Storybook** | 0 composants | — | 20+ composants |
