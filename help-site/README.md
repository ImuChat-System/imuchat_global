# help.imuchat.app — Centre d'Aide

> Centre d'aide ImuChat : FAQ, guides, tutoriels, support, base de connaissances.

## 🚀 Démarrage

```bash
pnpm install
pnpm dev
```

Ouvrir [http://localhost:3010](http://localhost:3010)

## 📁 Structure

```
src/
├── app/
│   ├── [locale]/         # Routes i18n (fr, en, de, es, ja)
│   │   ├── layout.tsx
│   │   ├── page.tsx      # Accueil
│   │   ├── getting-started/
│   │   ├── [category]/
│   │   │   └── [slug]/   # Articles d'aide
│   │   ├── contact/
│   │   └── search/
│   └── globals.css
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── SearchBar.tsx
│   ├── CategoryCard.tsx
│   └── Breadcrumb.tsx
├── i18n/
│   └── request.ts
├── messages/
│   ├── fr.json
│   └── en.json
└── lib/
    └── articles.ts       # Gestion du contenu MDX
```

## 🌍 Langues supportées

- 🇫🇷 Français (fr) — par défaut
- 🇬🇧 English (en)
- 🇩🇪 Deutsch (de)
- 🇪🇸 Español (es)
- 🇯🇵 日本語 (ja)

## 🛠 Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **i18n**: next-intl
- **Icons**: Lucide React
- **Animations**: Framer Motion
