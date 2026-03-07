# 🔍 AUDIT ULTRA-DÉTAILLÉ DU FRONTEND — Web App ImuChat

> **Date** : Février 2026
> **Scope** : `/web-app/` — Next.js 15.3.3 / React 19.1 / TypeScript 5
> **Objectif** : Identifier tout ce qu'il faut faire / implémenter pour atteindre les standards élevés d'une super-application de classe mondiale.

---

## 📊 TABLEAU DE SYNTHÈSE

| Aspect | Note | Statut | Priorité |
|--------|------|--------|----------|
| Architecture & Structure | **A** | ✅ Solide | — |
| Bibliothèque de composants | **A** | ✅ Excellent | — |
| Design Responsive | **B** | ⚠️ Lacunes mobile | 🟡 Moyenne |
| Accessibilité (a11y) | **C** | ⚠️ Couverture partielle | 🟡 Moyenne |
| Animations & Micro-interactions | **B+** | ⚠️ `reduceAnimations` incomplet | 🟡 Moyenne |
| Gestion d'état | **B** | ⚠️ Pas de couche cache (React Query) | 🟡 Moyenne |
| Gestion d'erreurs | **A-** | ⚠️ Pas de Suspense, pas de retry | 🟢 Faible |
| Performance | **B** | ⚠️ Memoization insuffisante | 🟡 Moyenne |
| Système de thèmes | **A** | ✅ 8 thèmes complets | — |
| Formulaires & Validation | **A** | ✅ zod + react-hook-form | — |
| Navigation | **B** | ⚠️ Pas de breadcrumbs, pas de sitemap | 🟡 Moyenne |
| Internationalisation (i18n) | **B+** | ⚠️ Couverture incomplète | 🟡 Moyenne |
| Tests | **C** | ⚠️ Seuil 50%, peu de fichiers tests | 🟠 Haute |
| **Sécurité UI** | **D** | 🔴 Failles critiques identifiées | 🔴 **Critique** |
| Qualité de code | **B+** | ⚠️ `ignoreBuildErrors: true` | 🟠 Haute |
| **NOTE GLOBALE** | **B-** | Fondations solides, améliorations critiques nécessaires | — |

---

## 1. 🏗️ ARCHITECTURE & STRUCTURE DES DOSSIERS — Note : A

### État actuel ✅

L'arborescence est bien organisée, modulaire et scalable :

```
web-app/src/
├── app/[locale]/           # Routes App Router (locale-aware)
│   ├── (auth)/             # Routes authentification (groupées)
│   ├── admin/              # Administration
│   ├── chat/[chatId]/      # Chat dynamique
│   ├── communities/        # Communautés
│   ├── contacts/           # Contacts
│   ├── discover/           # Découverte
│   ├── modules/            # Système de modules
│   ├── office/             # Suite bureautique
│   ├── profile/            # Profil utilisateur
│   ├── settings/           # Paramètres
│   ├── store/              # Boutique de modules
│   └── ...
├── components/
│   ├── ui/                 # 45+ composants Shadcn/UI + Radix
│   ├── auth/               # Composants d'authentification
│   ├── chat/               # Composants chat
│   ├── layout/             # Layout, sidebar, header
│   ├── privacy/            # Cookie consent, GDPR
│   ├── server/             # Composants de gestion serveur
│   └── store/              # Composants boutique
├── contexts/               # 16 contextes React
├── hooks/                  # Hooks personnalisés
├── lib/                    # Utilitaires, supabase client
├── messages/               # Fichiers i18n (en.json, fr.json, ja.json)
├── modules/                # Modules métier (customize, gamification, etc.)
├── services/               # API services
├── stores/                 # Zustand stores
└── types/                  # Types TypeScript
```

### Ce qui est bien

- Séparation claire entre composants UI réutilisables et composants métier
- Routes groupées par fonctionnalité via App Router
- Path aliases configurés (`@/` → `src/`)
- Modules métier dans `src/modules/` avec sous-dossiers dédiés

### ❌ Ce qu'il faut améliorer

| # | Tâche | Détail |
|---|-------|--------|
| 1.1 | Créer un fichier `barrel exports` par dossier clé | Un `index.ts` dans `components/ui/`, `hooks/`, `services/` pour des imports plus propres |
| 1.2 | Ajouter un dossier `constants/` | Centraliser les constantes magiques éparpillées dans le code |
| 1.3 | Séparer `lib/` en sous-dossiers | `lib/api/`, `lib/utils/`, `lib/config/` pour une meilleure organisation |
| 1.4 | Nettoyer les fichiers `.page.tsx.old` | Supprimer le code mort détecté |

---

## 2. 🧩 BIBLIOTHÈQUE DE COMPOSANTS UI — Note : A

### État actuel ✅

Fondation excellente avec **Shadcn/UI + Radix UI** :

**45+ composants Radix UI** intégrés :
`accordion`, `alert-dialog`, `aspect-ratio`, `avatar`, `badge`, `button`, `calendar`, `card`, `carousel`, `chart`, `checkbox`, `collapsible`, `command`, `context-menu`, `dialog`, `drawer`, `dropdown-menu`, `form`, `hover-card`, `input`, `input-otp`, `label`, `menubar`, `navigation-menu`, `popover`, `progress`, `radio-group`, `resizable`, `scroll-area`, `select`, `separator`, `sheet`, `skeleton`, `slider`, `sonner`, `switch`, `table`, `tabs`, `textarea`, `toast`, `toggle`, `toggle-group`, `tooltip`

**Composants métier** :

- `ChatMessage`, `ChatInput`, `ConversationList`, `ConversationItem`
- `ModuleCard`, `StoreCard`, `ModuleCategoryFilter`
- `ProfileCard`, `ProfileHeader`, `ProfileStats`
- `ServerSettings`, `AutoModerationSettings`
- `CookieConsentBanner`, `GuestBanner`
- `OtpInput`, `VerifyOtpForm`

### ❌ Ce qu'il faut implémenter

| # | Tâche | Priorité | Détail |
|---|-------|----------|--------|
| 2.1 | **Storybook** | 🟠 Haute | Installer et configurer Storybook pour documenter chaque composant UI avec des stories interactives |
| 2.2 | Variantes manquantes | 🟡 Moyenne | Ajouter des variantes `size` (sm/md/lg/xl) et `variant` (outline/ghost/destructive) cohérentes sur tous les composants |
| 2.3 | Composant **EmptyState** générique | 🟡 Moyenne | Un composant réutilisable pour les états vides (illustration + message + CTA) |
| 2.4 | Composant **LoadingState** unifié | 🟡 Moyenne | Standardiser les squelettes de chargement (Skeleton + shimmer) |
| 2.5 | Composant **ConfirmDialog** | 🟡 Moyenne | Dialog réutilisable pour les actions destructives (suppression, déconnexion) |
| 2.6 | **Design tokens** formalisés | 🟠 Haute | Documenter spacing scale, border radius, shadow scale, z-index scale comme tokens|
| 2.7 | Composant **Avatar group** | 🟢 Faible | Pour les listes de participants (conversations, communautés) |
| 2.8 | Composant **FileUpload** avancé | 🟡 Moyenne | Drag & drop, prévisualisation, barre de progression |

---

## 3. 📱 DESIGN RESPONSIVE & MOBILE — Note : B

### État actuel

- **Tailwind CSS** avec classes responsives (`sm:`, `md:`, `lg:`, `xl:`)
- Approche mobile-first globalement respectée
- Navigation mobile dédiée : `mobile-bottom-nav.tsx`
- Sheet/Drawer pour menus mobiles

### ❌ Ce qu'il faut implémenter

| # | Tâche | Priorité | Détail |
|---|-------|----------|--------|
| 3.1 | **Layouts mobiles dédiés** | 🟠 Haute | Créer des variantes de layout adaptées (pas seulement des breakpoints CSS). Les pages complexes (Chat, Office, Discover) nécessitent une UX repensée, pas juste responsive |
| 3.2 | **Container queries** | 🟡 Moyenne | Adopter les Container Queries CSS pour les composants qui doivent s'adapter à leur conteneur parent, pas au viewport |
| 3.3 | **Touch-friendly interactions** | 🟠 Haute | Taille minimum des cibles tactiles à 44×44px (WCAG), zones de swipe pour les conversations |
| 3.4 | **Pull-to-refresh** | 🟡 Moyenne | Pattern natif pour le rechargement des listes (conversations, feed) |
| 3.5 | **Gestes tactiles** | 🟡 Moyenne | Swipe-to-reply, swipe-to-delete dans le chat, pinch-to-zoom sur les images |
| 3.6 | **Tests visuels responsive** | 🟡 Moyenne | Intégrer des tests visuels (Chromatic/Percy) sur 4 breakpoints : 375px, 768px, 1024px, 1440px |
| 3.7 | **Landscape mode** | 🟢 Faible | Optimiser l'affichage paysage sur tablette pour le chat et l'office |
| 3.8 | **Safe area** insets | 🟡 Moyenne | Gérer les zones sûres iOS (notch, home indicator) via `env(safe-area-inset-*)` |

---

## 4. ♿ ACCESSIBILITÉ (a11y) — Note : C

### État actuel

- Skip-to-content link présent
- ~30 attributs `aria-label` détectés sur 100+ composants
- `jest-axe` installé mais peu utilisé
- Radix UI fournit une bonne base a11y par défaut

### ❌ Ce qu'il faut implémenter — PLAN COMPLET

| # | Tâche | Priorité | Détail |
|---|-------|----------|--------|
| 4.1 | **Audit ARIA systématique** | 🟠 Haute | Parcourir chaque composant interactif et ajouter `aria-label`, `aria-describedby`, `aria-live`, `role` appropriés |
| 4.2 | **Hiérarchie des titres** | 🟠 Haute | Vérifier que chaque page a une et une seule `<h1>`, avec une hiérarchie `h1 > h2 > h3` correcte (pas de sauts) |
| 4.3 | **Navigation clavier complète** | 🟠 Haute | Tester chaque composant interactif au clavier (Tab, Shift+Tab, Enter, Escape, Arrow keys). Les modals doivent trap le focus |
| 4.4 | **Contraste des couleurs** | 🟠 Haute | Vérifier WCAG AA (4.5:1 texte normal, 3:1 large texte) sur TOUS les 8 thèmes × 2 modes (clair/sombre) = 16 combinaisons |
| 4.5 | **`aria-live` pour contenu dynamique** | 🟡 Moyenne | Toasts, messages chat, notifications, résultats de recherche doivent annoncer via `aria-live="polite"` ou `"assertive"` |
| 4.6 | **Labels de formulaires** | 🟡 Moyenne | Vérifier que chaque `<input>` a un `<label>` associé via `htmlFor` ou `aria-labelledby` |
| 4.7 | **Alternative textuelle images** | 🟡 Moyenne | Chaque `<Image>` / `<img>` doit avoir un `alt` descriptif ou `alt=""` si décoratif |
| 4.8 | **Tests a11y automatisés** | 🟠 Haute | Intégrer `jest-axe` dans CHAQUE test de composant : `expect(await axe(container)).toHaveNoViolations()` |
| 4.9 | **Axe-core dans la CI** | 🟡 Moyenne | Ajouter `@axe-core/playwright` aux tests E2E pour détecter les régressions a11y |
| 4.10 | **Reduced motion** | 🟡 Moyenne | Vérifier que `prefers-reduced-motion` désactive TOUTES les animations (Framer Motion + CSS transitions) |
| 4.11 | **Screen reader testing** | 🟢 Faible | Tester avec VoiceOver (macOS) et NVDA (Windows) les flux principaux |
| 4.12 | **Focus visible** | 🟡 Moyenne | S'assurer que `focus-visible` est stylisé de manière cohérente et visible sur TOUS les composants interactifs |

---

## 5. 🎬 ANIMATIONS & MICRO-INTERACTIONS — Note : B+

### État actuel ✅

- **Framer Motion** v11.5.1 intégré
- Animations CSS pour les squelettes (shimmer)
- Pattern `AnimatePresence` + `motion.div` pour les transitions de page
- Préférence `reduceAnimations` stockée dans le contexte thème

### ❌ Ce qu'il faut implémenter

| # | Tâche | Priorité | Détail |
|---|-------|----------|--------|
| 5.1 | **Appliquer `reduceAnimations` partout** | 🟡 Moyenne | La préférence est stockée mais N'EST PAS consommée dans tous les composants animés. Créer un hook `useAnimationConfig()` qui retourne `{ animate: reduceAnimations ? false : variants }` |
| 5.2 | **Respecter `prefers-reduced-motion`** | 🟡 Moyenne | Synchroniser le media query système avec la préférence utilisateur au chargement initial |
| 5.3 | **Transitions de page** | 🟡 Moyenne | Implémenter des transitions fluides entre les routes (fade, slide) via `AnimatePresence` dans le layout |
| 5.4 | **Micro-interactions tactiles** | 🟡 Moyenne | Feedback haptique visuel sur les boutons (scale 0.95 au press), ripple effect optionnel |
| 5.5 | **Animation des listes** | 🟢 Faible | Stagger animation sur les listes de conversations, modules, contacts (chaque item apparaît en cascade) |
| 5.6 | **Loading skeleton cohérent** | 🟡 Moyenne | Standardiser le pattern shimmer sur TOUTES les zones de chargement |
| 5.7 | **Animation de messages chat** | 🟡 Moyenne | Entrée douce des bulles de message, animation de frappe (typing indicator) |
| 5.8 | **Spring physics** | 🟢 Faible | Utiliser des courbes spring réalistes plutôt que des easings linéaires pour un rendu plus organique |

---

## 6. 🗄️ GESTION D'ÉTAT — Note : B

### État actuel

- **Zustand** avec middleware `persist` pour l'état client
- **16 Contextes React** pour l'état global
- Hooks personnalisés (`useTasks`, `useContacts`, `useToast`, etc.)

**Contextes identifiés :**
`AuthContext`, `ThemeContext`, `LayoutContext`, `ModuleContext`, `ChatContext`, `PresenceContext`, `PageHeaderContext`, `PageFooterContext`, `MobileBottomNavContext`, `RightSidebarContext`, `LeftSidebarContext`, `AIAssistantContext`, `GamificationContext`, `NotificationContext`, `SearchContext`, `OfficeContext`

### ❌ Ce qu'il faut implémenter

| # | Tâche | Priorité | Détail |
|---|-------|----------|--------|
| 6.1 | **Intégrer React Query / TanStack Query** | 🟠 Haute | Pour le server state (données Supabase). Avantages : cache, déduplication, stale-while-revalidate, retry automatique, invalidation intelligente |
| 6.2 | **Réduire les 16 contextes** | 🟡 Moyenne | Consolider en ~6-8 contextes bien structurés pour réduire les re-renders. Ex : fusionner `LeftSidebarContext` + `RightSidebarContext` + `LayoutContext` → `LayoutContext` |
| 6.3 | **Optimistic updates** | 🟡 Moyenne | Pour les actions fréquentes (envoi de message, like, toggle) : mettre à jour l'UI avant la confirmation serveur |
| 6.4 | **Sélecteurs Zustand** | 🟡 Moyenne | Utiliser des sélecteurs granulaires (`useStore(state => state.specificField)`) pour éviter les re-renders inutiles |
| 6.5 | **DevTools** | 🟢 Faible | Intégrer Zustand DevTools et React Query DevTools en développement |
| 6.6 | **Middleware de logging** | 🟢 Faible | Ajouter un middleware Zustand pour logger les transitions d'état en dev |

---

## 7. ⚠️ GESTION D'ERREURS — Note : A-

### État actuel ✅

- **Error Boundary** composant (`error-boundary.tsx`)
- Error boundaries au niveau des sections
- **Sentry** intégré pour le monitoring
- **Toast notifications** via hook `useToast` + reducer
- Messages d'erreur génériques (pas de fuite d'info)

### ❌ Ce qu'il faut implémenter

| # | Tâche | Priorité | Détail |
|---|-------|----------|--------|
| 7.1 | **Adopter React Suspense** | 🟡 Moyenne | Utiliser `<Suspense fallback={<Skeleton />}>` pour le chargement asynchrone des composants et données |
| 7.2 | **Retry automatique** | 🟡 Moyenne | Implémenter un mécanisme de retry avec backoff exponentiel pour les appels API échoués (natif avec React Query) |
| 7.3 | **Timeouts sur les requêtes** | 🟡 Moyenne | Ajouter des timeouts (ex : 10s) pour éviter les requêtes qui pendent indéfiniment |
| 7.4 | **Page d'erreur globale** | 🟢 Faible | Améliorer `error.tsx` et `not-found.tsx` avec des illustrations, suggestions, et bouton de retry |
| 7.5 | **Offline mode basique** | 🟡 Moyenne | Détecter la perte de connexion et afficher un banner + mettre en queue les actions |
| 7.6 | **Error tracking catégorisé** | 🟢 Faible | Configurer Sentry avec des catégories d'erreurs (network, auth, validation, runtime) et des alertes différenciées |

---

## 8. ⚡ PERFORMANCE — Note : B

### État actuel

- `next/image` pour l'optimisation d'images
- `next/dynamic` pour le code splitting
- `optimizePackageImports` pour `lucide-react`, `date-fns`, `framer-motion`, `lodash`
- `@next/bundle-analyzer` intégré
- Google Fonts avec `display: swap`
- Lazy loading par intersection observer (`lazy-load-section.tsx`)

### ❌ Ce qu'il faut implémenter

| # | Tâche | Priorité | Détail |
|---|-------|----------|--------|
| 8.1 | **Memoization à grande échelle** | 🟠 Haute | Seulement ~5 `useMemo` détectés. Ajouter `React.memo()` sur les composants de liste (ConversationItem, ModuleCard, ContactItem), `useMemo` sur les calculs coûteux, `useCallback` sur les handlers passés en props |
| 8.2 | **Virtualisation des listes** | 🟠 Haute | Utiliser `react-window` ou `@tanstack/react-virtual` pour les listes longues (conversations, contacts, modules du store) |
| 8.3 | **Route prefetching** | 🟡 Moyenne | Configurer `<Link prefetch>` pour les navigations fréquentes (sidebar items, onglets) |
| 8.4 | **Batch des requêtes API** | 🟡 Moyenne | Les services ne batchent pas les requêtes. Implémenter un DataLoader pattern ou passer à GraphQL |
| 8.5 | **Déduplication des requêtes** | 🟡 Moyenne | Empêcher les appels API en double quand un composant se re-rend (natif avec React Query) |
| 8.6 | **Web Workers** | 🟢 Faible | Déplacer les opérations lourdes (recherche locale, parsing, encryption) dans des Web Workers |
| 8.7 | **Audit Socket.io** | 🟡 Moyenne | Socket.io client importé globalement → vérifier l'impact bundle et ne charger que quand nécessaire |
| 8.8 | **Service Worker** | 🟢 Faible | Implémenter un SW pour le cache des assets statiques et le mode offline |
| 8.9 | **Core Web Vitals monitoring** | 🟡 Moyenne | Tracker LCP, FID, CLS en production via `web-vitals` + Sentry Performance |

---

## 9. 🎨 SYSTÈME DE THÈMES — Note : A

### État actuel ✅ Excellent

**8 thèmes couleur** : Default, Rosé Pine, Retro Tokyo, Zen Garden, Forest Mystic, Pastel Dream, Cyberpunk Noir, Minimal Pro

**Système CSS Variables** :

```css
:root {
  --background: 220 20% 97%;
  --foreground: 210 23% 18%;
  --primary: 256 51% 56%;
  --secondary: 187 83% 50%;
  --accent: 34 100% 71%;
  /* ... */
}
.dark { /* overrides */ }
```

**Fonctionnalités** :

- Dark mode via classe `dark` sur `<html>` (Tailwind `darkMode: ['class']`)
- 3 niveaux de densité : `compact`, `normal`, `cozy`
- Préférence `reduceAnimations`
- Couleurs sidebar dédiées
- 5 couleurs chart pour la data viz
- Persistance localStorage

### ❌ Ce qu'il faut implémenter

| # | Tâche | Priorité | Détail |
|---|-------|----------|--------|
| 9.1 | **Vérifier le contraste de chaque thème** | 🟠 Haute | 8 thèmes × 2 modes = 16 combinaisons à vérifier pour la conformité WCAG AA |
| 9.2 | **Mode auto (system)** | 🟡 Moyenne | Ajouter un mode "Automatique" qui suit `prefers-color-scheme` du système |
| 9.3 | **Transition fluide de thème** | 🟢 Faible | Ajouter `transition: background-color 200ms, color 200ms` lors du changement de thème |
| 9.4 | **Preview de thème** | 🟢 Faible | Composant de prévisualisation rapide dans les settings (mini-aperçu avant sélection) |
| 9.5 | **Thèmes saisonniers** | 🟢 Faible | Infrastructure pour des thèmes temporaires (Noël, Halloween, etc.) |

---

## 10. 📝 FORMULAIRES & VALIDATION — Note : A

### État actuel ✅ Excellent

- **react-hook-form** v7.54.2 — Gestion d'état des formulaires
- **@hookform/resolvers** v4.1.3 — Intégration Zod
- **Zod** v3.24.2 — Validation de schéma

**Pattern standard** :

```tsx
const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
});

const form = useForm({ resolver: zodResolver(schema) });

<Form {...form}>
  <FormField control={form.control} name="email" render={({ field }) => (
    <FormItem>
      <FormLabel>{t('emailLabel')}</FormLabel>
      <FormControl><Input {...field} /></FormControl>
      <FormMessage />
    </FormItem>
  )} />
</Form>
```

**Composants input** : `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Switch`

### ❌ Ce qu'il faut implémenter

| # | Tâche | Priorité | Détail |
|---|-------|----------|--------|
| 10.1 | **Validation en temps réel** | 🟡 Moyenne | Ajouter `mode: 'onChange'` ou `'onBlur'` pour un feedback instantané |
| 10.2 | **Indicateur de force de mot de passe** | 🟡 Moyenne | Barre visuelle de force (faible/moyen/fort) sur les champs de création de mot de passe |
| 10.3 | **Auto-save sur les formulaires longs** | 🟡 Moyenne | Sauvegarder automatiquement les brouillons (localStorage ou Supabase) pour les formulaires multi-étapes |
| 10.4 | **Confirmation de sortie** | 🟡 Moyenne | Alerter l'utilisateur quand il quitte un formulaire avec des changements non sauvegardés (`beforeunload` + `useRouter`) |
| 10.5 | **Composant FormStepper** | 🟢 Faible | Formulaire multi-étapes avec barre de progression |
| 10.6 | **Gestion des erreurs serveur** | 🟡 Moyenne | Mapper les erreurs API aux champs spécifiques du formulaire (ex : "Email déjà utilisé" → champ email) |

---

## 11. 🧭 NAVIGATION — Note : B

### État actuel

- **Sidebar principale** dynamique avec items basés sur les modules actifs
- **Navigation mobile** : bottom tab bar + sheet drawer
- **Tabs** (Radix UI) pour les sous-sections
- **Sidebar personnalisable** avec drag-and-drop (`@dnd-kit`)
- Deep linking via routes dynamiques (`/[locale]/chat/[chatId]`)
- Layout context pour l'état de navigation imbriqué

### ❌ Ce qu'il faut implémenter

| # | Tâche | Priorité | Détail |
|---|-------|----------|--------|
| 11.1 | **Breadcrumb navigation** | 🟡 Moyenne | Ajouter un fil d'Ariane sur toutes les pages profondes (settings > beta, office > doc, etc.) |
| 11.2 | **Routes comme constantes** | 🟡 Moyenne | Centraliser toutes les routes dans un fichier `routes.ts` avec des constantes typées pour éviter les magic strings |
| 11.3 | **Sitemap XML** | 🟡 Moyenne | Générer automatiquement un sitemap pour le SEO |
| 11.4 | **Raccourcis clavier** | 🟡 Moyenne | Implémenter des shortcuts globaux : `Ctrl+K` (recherche), `Ctrl+N` (nouveau message), etc. |
| 11.5 | **Navigation récente** | 🟢 Faible | Historique des pages récemment visitées (type "Recent" dans Spotlight) |
| 11.6 | **Deep link sharing** | 🟢 Faible | Partager un lien direct vers une conversation, un module, un profil |

---

## 12. 🌍 INTERNATIONALISATION (i18n) — Note : B+

### État actuel

- **next-intl** v4.3.9
- 3 locales : `en`, `fr`, `ja`
- URL routing : `/:locale/[routes]`
- Pattern `useTranslations('Namespace')` → `t('key')`
- Fichiers messages : `src/messages/{locale}.json` + `{locale}-public.json`

### ❌ Ce qu'il faut implémenter

| # | Tâche | Priorité | Détail |
|---|-------|----------|--------|
| 12.1 | **Couverture complète** | 🟠 Haute | De nombreux composants utilisent encore du texte en dur (anglais ou français). Migrer TOUS les textes vers les fichiers i18n |
| 12.2 | **Vérifier `ja.json`** | 🟠 Haute | Le locale japonais est enregistré mais le fichier `ja.json` semble incomplet — vérifier et compléter toutes les clés |
| 12.3 | **Guide contributeur i18n** | 🟡 Moyenne | Documentation expliquant comment ajouter des traductions, les conventions de nommage des clés, la structure des namespaces |
| 12.4 | **Plateforme de traduction** | 🟡 Moyenne | Intégrer Crowdin ou Lokalise pour la gestion collaborative des traductions |
| 12.5 | **Détection d'incomplétude** | 🟡 Moyenne | Script CI qui compare les clés entre locales et signale les clés manquantes |
| 12.6 | **Pluralisation** | 🟡 Moyenne | Utiliser les rich text / ICU message format pour les pluriels (ex : "1 message" vs "5 messages") |
| 12.7 | **Formatage des dates/nombres** | 🟢 Faible | Utiliser `next-intl` formatters pour les dates, heures, nombres, devises selon la locale |
| 12.8 | **RTL support** | 🟢 Faible | Préparer le support arabe/hébreu avec `dir="rtl"` et classes Tailwind `rtl:` |

---

## 13. 🧪 TESTS — Note : C

### État actuel

- **Jest** v29.7.0 + **React Testing Library** v14.3.1
- **Playwright** v1.58.2 pour E2E
- **jest-axe** v10.0.0 installé (peu utilisé)
- Seuil de couverture : **50%** (branches, functions, lines, statements)
- ~10-15 fichiers de test pour 100+ composants
- Tests E2E limités au chat

### ❌ Ce qu'il faut implémenter — PLAN DE TEST COMPLET

| # | Tâche | Priorité | Détail |
|---|-------|----------|--------|
| 13.1 | **Augmenter le seuil à 70%** | 🟠 Haute | Modifier `jest.config.js` : `coverageThreshold.global` → 70% sur branches, functions, lines, statements |
| 13.2 | **Tests composants critiques** | 🟠 Haute | Écrire des tests pour les composants core sans couverture : `ChatMessage`, `ChatInput`, `ConversationList`, `Sidebar`, `ModuleCard` |
| 13.3 | **Tests des hooks** | 🟠 Haute | Tester chaque hook personnalisé avec `@testing-library/react-hooks` |
| 13.4 | **Tests d'intégration** | 🟡 Moyenne | Tester les workflows complets : login → chat → send message, store → install module → activate |
| 13.5 | **E2E des flux majeurs** | 🟡 Moyenne | Étendre Playwright : authentification, profil, paramètres, communautés, office suite |
| 13.6 | **Tests a11y systématiques** | 🟡 Moyenne | Ajouter `jest-axe` expect dans chaque test de composant |
| 13.7 | **Snapshot tests** | 🟢 Faible | Pour les composants UI stables (Button, Card, Badge) — détecter les changements visuels involontaires |
| 13.8 | **Tests de régression visuelle** | 🟡 Moyenne | Intégrer Chromatic ou Percy pour capturer les screenshots par composant |
| 13.9 | **Mocks complets** | 🟡 Moyenne | Créer des mocks factories pour Supabase, next-intl, next/navigation dans `__mocks__/` |
| 13.10 | **CI test pipeline** | 🟡 Moyenne | GitHub Actions : lint → type-check → unit tests → E2E → a11y audit |

**Couverture manquante identifiée :**

- ❌ Chat (fonctionnalité core — 0 test composant)
- ❌ Authentification (flux complet)
- ❌ Store / Module system
- ❌ Profil / Settings
- ❌ Communautés
- ❌ Office suite

---

## 14. 🔒 SÉCURITÉ UI — Note : D — 🔴 CRITIQUE

### État actuel

- Auth via Supabase (sessions, RLS)
- Variables d'environnement gérées via `.env.local`
- Messages d'erreur génériques (pas de fuite)

### 🔴 FAILLES CRITIQUES IDENTIFIÉES

| # | Tâche | Priorité | Détail |
|---|-------|----------|--------|
| 14.1 | **Sanitisation HTML (XSS)** | 🔴 **Critique** | Le contenu utilisateur (Tiptap rich text, messages) N'EST PAS sanitisé. **INSTALLER `DOMPurify`** et l'appliquer avant tout `dangerouslySetInnerHTML` ou rendu de contenu utilisateur |
| 14.2 | **Content Security Policy (CSP)** | 🔴 **Critique** | Aucun header CSP détecté. Implémenter dans `middleware.ts` ou `next.config.ts` : `script-src 'self'`, `style-src 'self' 'unsafe-inline'`, `img-src 'self' data: blob:` |
| 14.3 | **Protection CSRF** | 🟠 Haute | Pas de token CSRF visible sur les formulaires. Supabase gère l'auth via JWT mais les actions de mutation nécessitent un token CSRF additionnel pour les requêtes cross-origin |
| 14.4 | **Rate limiting frontend** | 🟡 Moyenne | Aucun rate limiting côté client. Implémenter un debounce sur les soumissions de formulaire et un throttle sur les appels API fréquents |
| 14.5 | **Supprimer `ignoreBuildErrors: true`** | 🟠 Haute | Dans `next.config.ts` — cette option désactive la vérification TypeScript au build, laissant passer des erreurs de type potentiellement dangereuses |
| 14.6 | **Validation des réponses API** | 🟡 Moyenne | Les réponses API brutes ne sont pas validées. Utiliser Zod pour parser/valider les réponses avant de les consommer |
| 14.7 | **Cookies sécurisés** | 🟡 Moyenne | Vérifier les flags `Secure`, `HttpOnly`, `SameSite=Strict` sur tous les cookies |
| 14.8 | **Encryption localStorage** | 🟡 Moyenne | Données sensibles stockées en clair dans localStorage. Encrypter les préférences sensibles |
| 14.9 | **Audit des dépendances** | 🟡 Moyenne | Intégrer `npm audit` ou `snyk` dans la CI pour détecter les vulnérabilités connues |
| 14.10 | **Headers de sécurité** | 🟡 Moyenne | Ajouter : `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` |

### Implémentation recommandée — CSP

```typescript
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co;"
  );
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return response;
}
```

### Implémentation recommandée — DOMPurify

```typescript
// lib/sanitize.ts
import DOMPurify from 'dompurify';

export function sanitizeUserContent(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
}
```

---

## 15. 🧹 QUALITÉ DE CODE — Note : B+

### État actuel

- `strict: true` dans `tsconfig.json` ✅
- Conventions de nommage cohérentes (kebab-case fichiers, PascalCase composants, camelCase fonctions)
- Path aliases `@/` configurés
- ESLint avec preset Next.js

### ❌ Ce qu'il faut implémenter

| # | Tâche | Priorité | Détail |
|---|-------|----------|--------|
| 15.1 | **Supprimer `ignoreBuildErrors: true`** | 🟠 Haute | `next.config.ts` → supprimer cette option et corriger les erreurs TypeScript existantes |
| 15.2 | **Supprimer `ignoreDeprecations: "5.0"`** | 🟡 Moyenne | `tsconfig.json` → corriger les APIs dépréciées au lieu de les ignorer |
| 15.3 | **Désactiver `allowJs: true`** | 🟡 Moyenne | Convertir les fichiers JS restants en TypeScript |
| 15.4 | **ESLint strict** | 🟡 Moyenne | Ajouter les règles : `no-unused-vars: error`, `no-console: warn`, `react-hooks/exhaustive-deps: error`, `import/order` |
| 15.5 | **Prettier** | 🟡 Moyenne | Configurer Prettier pour un formatage uniforme (si pas déjà présent) |
| 15.6 | **Husky + lint-staged** | 🟡 Moyenne | Pre-commit hooks pour lint + format automatique avant chaque commit |
| 15.7 | **Limiter la taille des composants** | 🟡 Moyenne | Règle : max 200-250 lignes par composant. Découper les fichiers 300+ lignes détectés |
| 15.8 | **JSDoc minimaliste** | 🟢 Faible | Documenter les hooks publics et fonctions utilitaires avec des JSDoc de 1 ligne |
| 15.9 | **Nettoyer le code mort** | 🟡 Moyenne | Supprimer les fichiers `.old`, imports inutilisés, fonctions non référencées |
| 15.10 | **Conventional commits** | 🟢 Faible | Adopter `feat:`, `fix:`, `chore:` pour un historique Git lisible et un changelog automatique |

---

## 🚀 PLAN D'ACTION PAR PRIORITÉ

### 🔴 Phase 1 — CRITIQUE (Sprint immédiat)

> Sécurité et stabilité fondamentale

1. **[14.1]** Installer DOMPurify et sanitiser tout le contenu utilisateur
2. **[14.2]** Implémenter les headers CSP dans le middleware
3. **[14.5 / 15.1]** Supprimer `ignoreBuildErrors: true` et corriger les erreurs TS
4. **[14.10]** Ajouter les headers de sécurité (X-Frame-Options, X-Content-Type-Options, etc.)

### 🟠 Phase 2 — HAUTE PRIORITÉ (1-2 sprints)

> Qualité, tests, performance

1. **[6.1]** Intégrer TanStack Query pour le server state
2. **[8.1]** Campagne de memoization (React.memo, useMemo, useCallback)
3. **[8.2]** Virtualisation des listes longues
4. **[13.1]** Augmenter le seuil de couverture à 70%
5. **[13.2]** Écrire les tests des composants critiques (Chat, Auth, Store)
6. **[4.1-4.4]** Audit ARIA et contraste sur tous les thèmes
7. **[2.1]** Installer Storybook
8. **[12.1-12.2]** Compléter la couverture i18n
9. **[14.3]** Protection CSRF
10. **[3.1]** Layouts mobiles dédiés
11. **[3.3]** Cibles tactiles 44×44px

### 🟡 Phase 3 — MOYENNE PRIORITÉ (3-4 sprints)

> Polish et UX avancé

1. **[4.5-4.9]** a11y avancée (aria-live, labels, tests axe)
2. **[5.1-5.3]** Système d'animations cohérent + transitions de page
3. **[6.2]** Consolider les 16 contextes → ~8
4. **[7.1-7.3]** Suspense, retry, timeouts
5. **[8.9]** Monitoring Core Web Vitals
6. **[10.1-10.4]** Formulaires avancés (temps réel, auto-save, confirmation)
7. **[11.1-11.4]** Breadcrumbs, routes constantes, sitemap, shortcuts
8. **[12.3-12.6]** Guide i18n, plateforme, détection d'incomplétude
9. **[13.4-13.8]** Tests intégration, E2E étendus, régression visuelle
10. **[14.4-14.9]** Rate limiting, validation API, audit dépendances
11. **[15.4-15.6]** ESLint strict, Prettier, Husky

### 🟢 Phase 4 — FAIBLE PRIORITÉ (amélioration continue)

> Nice-to-have et polish final

1. **[2.7-2.8]** Avatar group, FileUpload avancé
2. **[3.7]** Mode paysage tablette
3. **[5.5-5.8]** Animations de liste, spring physics
4. **[6.5-6.6]** DevTools, logging middleware
5. **[7.4-7.6]** Pages d'erreur améliorées, offline, error tracking
6. **[8.6-8.8]** Web Workers, Service Worker
7. **[9.3-9.5]** Transitions thème, preview, thèmes saisonniers
8. **[10.5-10.6]** FormStepper, erreurs serveur mappées
9. **[11.5-11.6]** Navigation récente, deep link sharing
10. **[12.7-12.8]** Formatage localisé, support RTL
11. **[13.9-13.10]** Mocks factories, CI pipeline complet
12. **[15.7-15.10]** Limiter taille composants, JSDoc, code mort, conventional commits

---

## 📈 MÉTRIQUES CIBLES SUPER-APP

| Métrique | Actuel | Cible |
|----------|--------|-------|
| Couverture de tests | ~20% | **80%+** |
| Score Lighthouse Performance | Non mesuré | **90+** |
| Score Lighthouse Accessibility | Non mesuré | **95+** |
| Score Lighthouse Best Practices | Non mesuré | **95+** |
| Composants avec tests a11y | ~5% | **100%** |
| Composants documentés (Storybook) | 0% | **90%+** |
| Couverture i18n | ~60% | **100%** |
| Headers de sécurité | 0/6 | **6/6** |
| Core Web Vitals (LCP) | Non mesuré | **< 2.5s** |
| Core Web Vitals (FID) | Non mesuré | **< 100ms** |
| Core Web Vitals (CLS) | Non mesuré | **< 0.1** |
| Taille bundle JS (gzip) | Non mesuré | **< 200KB initial** |
| Erreurs TypeScript au build | Ignorées | **0** |

---

> **Ce document est une feuille de route vivante.** Cocher les tâches au fur et à mesure de leur implémentation. Chaque phase peut être découpée en sprints de 1-2 semaines. La Phase 1 (sécurité) doit être traitée avant toute mise en production.
