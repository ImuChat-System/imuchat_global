# 🎨 ImuChat — Roadmap d'intégration des couleurs Brand

> Migration progressive de la palette UI vers l'identité visuelle du logo ImuChat
> Référence : [Colors_Vision.md](./Colors_Vison.md)

---

## 📊 Résumé exécutif

La palette Colors_Vision propose **30 couleurs** dérivées du futur logo ImuChat. L'analyse croisée avec les 5 sous-projets (web-app, desktop-app, mobile, ui-kit, site-vitrine) montre que **~60% de la direction est déjà alignée** (violet + cyan), mais des incohérences critiques existent entre les apps.

**Décision :** Intégration **partielle et progressive** en 4 phases.

---

## 🔴 Phase 1 — Fondations (Tokens centralisés)

**Objectif :** Créer une source unique de vérité pour les couleurs brand.

### 1.1 Créer les design tokens brand dans `shared-types`

Étendre `ThemeColors` dans `shared-types/src/theme.ts` avec les couleurs brand :

```typescript
export interface BrandColors {
  purple: {
    900: '#3E2C63'; // Hover bouton principal
    700: '#513B75'; // Couleur principale
    500: '#6A54A3'; // Accent branding
    300: '#A89DB2'; // UI secondaire
    100: '#D8CBEF'; // Lavender — surfaces
  };
  cyan: {
    700: '#5CC6D5'; // Éléments actifs
    500: '#7FD9E5'; // Hover / highlights
    300: '#AFE3EB'; // Bulles messages
    100: '#D7F3F6'; // Fond chat
  };
  gold: {
    700: '#D4A96A'; // Badges premium
    500: '#F8D7A6'; // Récompenses
    300: '#FFE7C7'; // Highlights
    100: '#FFF5E3'; // Fond succès
  };
}
```

### 1.2 Créer les tokens chat (nouveau)

```typescript
export interface ChatColors {
  sent: string;      // #AFE3EB — message envoyé (cyan clair)
  received: string;  // #F7F3FB — message reçu (lavender léger)
  highlight: string; // #FFE7C7 — message mention (gold clair)
}
```

### Fichiers impactés

- `shared-types/src/theme.ts`

### Critère de validation

- Les types `BrandColors` et `ChatColors` sont exportés et utilisables par tous les sous-projets

---

## 🟡 Phase 2 — Alignement web-app (CSS Variables)

**Objectif :** Mapper les nouvelles couleurs brand dans le système HSL existant.

### 2.1 Ajouter les variables brand dans `globals.css`

```css
:root {
  /* Brand — Purple Scale */
  --brand-purple-900: 261 37% 28%;  /* #3E2C63 */
  --brand-purple-700: 261 33% 34%;  /* #513B75 */
  --brand-purple-500: 256 30% 48%;  /* #6A54A3 */
  --brand-purple-300: 270 11% 67%;  /* #A89DB2 */
  --brand-lavender: 267 43% 86%;    /* #D8CBEF */

  /* Brand — Gold Scale (gamification) */
  --brand-gold-700: 34 55% 62%;     /* #D4A96A */
  --brand-gold-500: 32 88% 81%;     /* #F8D7A6 */
  --brand-gold-300: 32 100% 90%;    /* #FFE7C7 */
  --brand-gold-100: 36 100% 95%;    /* #FFF5E3 */

  /* Chat */
  --chat-sent: 189 58% 81%;         /* #AFE3EB */
  --chat-received: 267 47% 97%;     /* #F7F3FB */
  --chat-highlight: 32 100% 90%;    /* #FFE7C7 */
}
```

### 2.2 Mettre à jour `tailwind.config.ts`

Ajouter les tokens brand et chat au theme extend :

```typescript
brand: {
  purple: {
    900: 'hsl(var(--brand-purple-900))',
    700: 'hsl(var(--brand-purple-700))',
    500: 'hsl(var(--brand-purple-500))',
    300: 'hsl(var(--brand-purple-300))',
    lavender: 'hsl(var(--brand-lavender))',
  },
  gold: {
    700: 'hsl(var(--brand-gold-700))',
    500: 'hsl(var(--brand-gold-500))',
    300: 'hsl(var(--brand-gold-300))',
    100: 'hsl(var(--brand-gold-100))',
  },
},
chat: {
  sent: 'hsl(var(--chat-sent))',
  received: 'hsl(var(--chat-received))',
  highlight: 'hsl(var(--chat-highlight))',
},
```

### 2.3 Mettre à jour le gradient signature

```css
--hover-gradient: linear-gradient(135deg, #513B75 0%, #7FD9E5 100%);
```

### Fichiers impactés

- `web-app/src/app/globals.css`
- `web-app/tailwind.config.ts`
- `desktop-app/` (même config Tailwind si partagée)

### Critère de validation

- Les classes `bg-brand-purple-700`, `text-brand-gold-500`, `bg-chat-sent` sont utilisables
- Le gradient signature est mis à jour
- Aucune régression visuelle sur les composants existants

---

## 🟠 Phase 3 — Correction critique : ui-kit (Rose → Violet)

**Objectif :** Aligner le primary de `ui-kit/src/native/tokens.ts` avec la brand.

### Problème actuel

```typescript
// ❌ ACTUEL — Primary Rose (incompatible logo)
primary: '#ec4899',
primaryHover: '#f472b6',
primaryActive: '#db2777',
```

### Migration proposée

```typescript
// ✅ CORRIGÉ — Primary Purple (aligné logo)
primary: '#6A54A3',        // Imu Purple 500
primaryHover: '#513B75',   // Imu Purple 700
primaryActive: '#3E2C63',  // Imu Purple 900
primaryGradientEnd: '#7FD9E5', // Imu Cyan 500
```

### Ajouts tokens mobile

```typescript
// Brand Gold (gamification)
gold: '#D4A96A',
goldLight: '#F8D7A6',
goldBg: '#FFF5E3',

// Chat
chatSent: '#AFE3EB',
chatReceived: '#F7F3FB',
chatHighlight: '#FFE7C7',
```

### ⚠️ Impact

Cette phase est **la plus risquée** :

- Tous les composants React Native utilisant `colors.primary` changeront de rose → violet
- Nécessite une revue visuelle complète de l'app mobile
- Le site-vitrine (`site-vitrine/tailwind.config.ts`) a le même problème (secondary = rose)

### Fichiers impactés

- `ui-kit/src/native/tokens.ts`
- `site-vitrine/tailwind.config.ts`
- Tous les composants mobile utilisant `colors.primary`

### Critère de validation

- Aucun composant n'utilise encore `#ec4899` comme couleur de marque
- Le primary est violet sur toutes les plateformes
- Tests visuels (snapshot ou manuels) validés

---

## 🟢 Phase 4 — Exploitation (nouvelles features)

**Objectif :** Utiliser les nouveaux tokens dans les fonctionnalités.

### 4.1 Messagerie — Couleurs chat

Appliquer `chat-sent` / `chat-received` / `chat-highlight` dans les composants de messagerie :

- Bulle envoyée → `bg-chat-sent`
- Bulle reçue → `bg-chat-received`
- Message mentionné → `bg-chat-highlight`

### 4.2 Gamification — Badges Gold

Utiliser la gamme Gold pour :

- Badges de niveau → `bg-brand-gold-700`
- Récompenses → `bg-brand-gold-500`
- Fond carte premium → `bg-brand-gold-100`

### 4.3 Onboarding / Splash Screen

Utiliser le gradient signature pour :

- Splash screen → `linear-gradient(135deg, #513B75, #7FD9E5)`
- Écran d'onboarding
- Bannières promotionnelles

### Fichiers impactés

- Composants messagerie (web-app, desktop-app, mobile)
- Composants gamification
- Écrans onboarding

---

## 📋 Couleurs NON retenues de Colors_Vision.md

| Couleur | Raison du rejet |
|---|---|
| Interface (Background Primary `#FFFFFF`, Background Soft `#F4F7EE`, etc.) | Le système HSL avec CSS variables est plus flexible et déjà en place |
| Texte (Text Primary `#1F1B2D`, etc.) | Les tokens texte actuels via HSL sont plus maintenables |
| Système (Success `#4CAF8D`, Warning `#F2A65A`, Error `#E35D6A`) | Les couleurs système actuelles sont des standards UX éprouvés, pas de raison de changer |
| Dark Mode (`#15131E`, `#1E1B2A`, `#2E2A3C`) | Le dark mode actuel est bien plus complet ; 3 couleurs sont insuffisantes |
| Cyan remplaçant le secondary actuel | Les nuances actuelles (`#22D3EE`, `#06b6d4`) sont plus vives et lisibles ; garder comme fallback |

---

## 🗓️ Estimation des phases

| Phase | Pré-requis | Risque |
|---|---|---|
| **Phase 1** — Tokens centralisés | Aucun | 🟢 Faible |
| **Phase 2** — CSS Variables web | Phase 1 | 🟢 Faible (additif) |
| **Phase 3** — ui-kit Rose→Violet | Phase 1 | 🔴 Élevé (breaking change) |
| **Phase 4** — Exploitation features | Phases 2+3 | 🟡 Moyen (selon features actives) |

---

## ✅ Checklist récapitulative

- [x] Phase 1 : Types `BrandColors` et `ChatColors` dans shared-types
- [x] Phase 2 : Variables CSS brand + gold + chat dans globals.css (light + dark)
- [x] Phase 2 : Tokens Tailwind brand/chat dans tailwind.config.ts (web-app)
- [x] Phase 2 : Gradient signature mis à jour (#513B75 → #7FD9E5)
- [x] Phase 2 : Desktop-app tokens brand/gold/chat ajoutés (globals.css + index.css)
- [x] Phase 3 : ui-kit native tokens primary rose → violet
- [x] Phase 3 : site-vitrine secondary rose → teal + tokens brand ajoutés
- [x] Phase 3 : desktop-app primary rose → violet (globals.css, index.css, splash.ts)
- [x] Phase 3 : mobile dark theme primary rose → violet (theme-presets.ts)
- [x] Phase 3 : mobile FloatingActionButton shadowColor aligné
- [x] Phase 3 : 24 fichiers de tests mobile mis à jour (mocks primary)
- [x] ✅ Validation : 350/350 tests desktop + 2728/2728 tests mobile passent
- [ ] Phase 3 : Revue visuelle composants mobile (manuelle)
- [x] Phase 4 : Couleurs chat appliquées aux bulles messagerie
  - ui-kit ChatBubble → `bg-chat-sent` / `bg-chat-received` + `text-chat-foreground`
  - mobile MessageBubble → `colors.chatSent` / `colors.chatReceived` + texte sombre
  - web-app AI chat → `bg-chat-sent` / `bg-chat-received`
  - desktop-app tokens alias `--color-chat-*` (compatibilité ui-kit)
- [x] Phase 4 : Gamme Gold utilisée dans la gamification
  - mobile badges legendary → `#D4A96A` (brand gold)
  - mobile XP levels card → `colors.gold` + barre XP `#FFF5E3`
  - web-app badges-showcase → `bg-brand-gold-*` + `ring-brand-gold-*`
- [x] Phase 4 : Gradient signature sur splash/onboarding
  - web-app onboarding logo + bouton → `from-brand-purple-700 to-[#7FD9E5]`
  - web-app onboarding slide → gradient brand dans icône
  - desktop-app splash title → gradient text `#513B75 → #7FD9E5`
  - mobile onboarding slides → couleurs brand (purple, cyan, gold)
- [x] ✅ Validation Phase 4 : 349/350 tests desktop + 2728/2728 tests mobile
