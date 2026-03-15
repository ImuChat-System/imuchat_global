# 🚀 Guide d'intégration — Landing Page `app.imuchat.app`

> **Date :** Mars 2026
> **Stack :** Next.js 16 · Tailwind CSS · next-intl · shadcn/ui

---

## Structure des fichiers produits

```
web-app/
├── src/
│   ├── app/
│   │   └── [locale]/
│   │       └── (public)/
│   │           └── page.tsx                  ← ① Copier page.tsx ici
│   │
│   ├── components/
│   │   └── landing/                          ← ② Créer ce dossier
│   │       ├── LandingNav.tsx
│   │       ├── HeroSection.tsx
│   │       ├── FeaturesSection.tsx           (StatsBar + FeaturesGrid + ModulesStrip + SovereigntyPillars)
│   │       ├── PricingSection.tsx
│   │       └── DownloadFooter.tsx            (DownloadSection + LandingFooter)
│   │
│   └── messages/
│       ├── fr.json                           ← ③ Fusionner le bloc "landing" dans fr.json existant
│       ├── en.json                           ← ③ Idem pour en.json
│       └── ja.json                           ← ③ Traduire le bloc "landing" pour ja.json
```

---

## Étapes d'intégration

### 1. Copier les composants

```bash
mkdir -p src/components/landing
cp LandingNav.tsx      src/components/landing/
cp HeroSection.tsx     src/components/landing/
cp FeaturesSection.tsx src/components/landing/
cp PricingSection.tsx  src/components/landing/
cp DownloadFooter.tsx  src/components/landing/
```

### 2. Remplacer la page existante

```bash
cp page.tsx src/app/[locale]/(public)/page.tsx
```

> Si une landing page existe déjà, vérifier si elle a du contenu à conserver avant de remplacer.

### 3. Fusionner les traductions

Dans `src/messages/fr.json`, ajouter le bloc complet :
```json
{
  "landing": { ... }  // Contenu de messages/fr.json
}
```

Faire de même pour `en.json`. Pour `ja.json`, traduire les clés (voir section traductions JA ci-dessous).

### 4. Vérifier les dépendances

Toutes les dépendances utilisées sont déjà dans le projet :

| Dépendance | Version requise | Statut |
|---|---|---|
| `next-intl` | ^4.x | ✅ Déjà installé |
| `tailwindcss` | ^3.x | ✅ Déjà installé |
| `lucide-react` | ^0.x | ✅ Déjà installé |
| `next/link` | (Next.js 16) | ✅ Déjà installé |

---

## Variables CSS à vérifier

La landing utilise des classes Tailwind standard + quelques couleurs custom.
S'assurer que `tailwind.config.ts` a ces couleurs ou les ajouter :

```ts
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      // Utilisé dans la navbar et hero pour le fond dark
      // Ces couleurs sont en hardcode dans les classes mais doivent
      // rester cohérentes avec le design system ImuChat
    }
  }
}
```

Les classes `dark:bg-[#0F0A1E]`, `dark:bg-[#0A0614]`, `dark:bg-[#0B0617]` sont des valeurs arbitraires Tailwind.
Elles correspondent à la palette sombre ImuChat (violet très foncé/noir).

---

## Traductions japonaises (ja.json) — clés à créer

```json
{
  "landing": {
    "nav": {
      "features": "機能",
      "pricing": "料金",
      "login": "ログイン",
      "register": "登録"
    },
    "hero": {
      "badge": "欧州主権スーパーアプリ",
      "headline_1": "チャット。仕事。",
      "headline_2": "すべてひとつのアプリで。",
      "subheadline": "ImuChatはメッセージング、オフィス、AIとゲームを統合した欧州スーパーアプリです。",
      "cta_primary": "ベータに参加",
      "cta_secondary": "デモを見る",
      "trust_1": "GDPRネイティブ",
      "trust_2": "EU内ホスティング",
      "trust_3": "広告なし"
    }
  }
}
```

---

## Checklist avant déploiement

- [ ] Composants copiés dans `src/components/landing/`
- [ ] `page.tsx` remplacé dans `src/app/[locale]/(public)/`
- [ ] Clés i18n ajoutées dans `fr.json`, `en.json`, `ja.json`
- [ ] Image OG créée (`public/og-image.png` — 1200×630px)
- [ ] Build de test : `pnpm build` sans erreur TypeScript
- [ ] Lighthouse score > 90 en performance et SEO
- [ ] Responsive vérifié sur mobile (375px) et tablette (768px)
- [ ] Dark mode vérifié

---

## Points d'attention

### Scroll-to-anchor (`#features`, `#pricing`)
Les ancres `href="#features"` et `href="#pricing"` doivent correspondre aux `id` dans les sections.
`FeaturesGrid` a `id="features"` et `PricingSection` a `id="pricing"` — vérifier qu'ils sont bien sur les `<section>`.

### Images OG dynamiques
Pour générer les images OG dynamiquement selon la locale, créer :
```
src/app/[locale]/(public)/opengraph-image.tsx
```
Avec le composant `ImageResponse` de Next.js.

### Analytics
Ajouter le tracking d'événements sur les deux CTAs principaux :
```tsx
// Dans HeroSection.tsx — bouton primaire
onClick={() => analytics.track('landing_cta_primary_clicked', { locale })}

// Dans PricingSection.tsx — bouton Premium
onClick={() => analytics.track('landing_pricing_premium_clicked')}
```

### Cookie consent
Le cookie consent banner (`components/privacy/`) doit s'afficher sur la landing.
Vérifier que le `layout.tsx` de `(public)` l'inclut déjà.

---

## Architecture des composants

```
page.tsx
├── <LandingNav />              Navigation sticky scroll-aware
├── <main>
│   ├── <HeroSection />         Hero + AppMockup inline
│   ├── <StatsBar />            5 métriques clés
│   ├── <FeaturesGrid />        6 features cards
│   ├── <ModulesStrip />        18+ module chips
│   ├── <SovereigntyPillars />  3 piliers EU/RGPD/Open
│   ├── <PricingSection />      3 plans tarifaires
│   └── <DownloadSection />     CTA téléchargement
└── <LandingFooter />           4 colonnes de liens
```

---

*Document généré le 15 mars 2026 — ImuChat Web Team*
