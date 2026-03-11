# 📝 blog.imuchat.app — Blog Officiel ImuChat

> Blog officiel : actualités produit, tutoriels, études de cas, culture tech, témoignages.

---

## 🎯 Objectif Stratégique

**Positionner ImuChat comme leader de la souveraineté numérique** à travers du contenu de qualité (SEO, thought leadership, éducation utilisateur). Générer du trafic organique qualifié.

---

## 📋 Fiche d'identité

| Champ | Valeur |
|---|---|
| **Sous-domaine** | `blog.imuchat.app` |
| **Type** | Blog / Content Marketing |
| **Cibles principales** | Utilisateurs, développeurs, décideurs, presse |
| **Priorité** | 🟢 Haute |
| **i18n** | FR, EN |
| **CMS** | MDX local (Git-based) + Headless CMS (Sanity ou Contentful) en Phase 2 |

---

## 🧭 Arborescence

```
blog.imuchat.app
├── /                     → Listing articles (filtrage par catégorie)
├── /[slug]               → Article individuel
├── /category/[category]  → Articles par catégorie
├── /tag/[tag]            → Articles par tag
├── /authors/[author]     → Page auteur
├── /newsletter           → Inscription newsletter
├── /rss.xml              → Flux RSS
└── /search               → Recherche full-text
```

---

## 📄 Pages clés

### 🏠 `/` — Listing Principal

**Layout** :
1. **Article à la une** — Grand hero card (image, titre, excerpt, CTA)
2. **Grille d'articles** — Cards 3 colonnes, pagination infinite scroll
3. **Sidebar** — Catégories, tags populaires, newsletter CTA
4. **Filtres** — Par catégorie, date, auteur

**Catégories** :
- 🚀 **Produit** — Nouvelles features, release notes
- 📖 **Tutoriels** — Guides pas-à-pas
- 🏢 **Études de cas** — Success stories partenaires
- 🔒 **Souveraineté** — Articles de fond sur la souveraineté numérique
- 🧠 **IA & Alice** — IA responsable, innovations Alice
- 👥 **Communauté** — Événements, spotlight créateurs

### 📰 `/[slug]` — Article

**Composants** :
- **Header** — Titre, date, auteur (avatar + nom), temps de lecture, catégorie
- **Image de couverture** — Responsive, lazy-loaded
- **Corps MDX** — Rendu riche (code blocks, callouts, images, vidéos embed)
- **Table des matières** — Sticky sidebar (desktop)
- **Partage social** — Twitter/X, LinkedIn, copier le lien
- **Articles connexes** — 3 suggestions (même catégorie/tags)
- **Commentaires** — Via système ImuChat (authentifié)
- **CTA fin d'article** — Newsletter ou inscription ImuChat

### 👤 `/authors/[author]` — Page Auteur

- Photo, bio, rôle
- Liste de ses articles
- Liens sociaux

---

## 🎨 Design System

| Token | Valeur |
|---|---|
| **Couleur primaire** | `#8B5CF6` (Violet ImuChat) |
| **Couleur accent** | `#F59E0B` (Amber pour highlights) |
| **Background** | `#FFFFFF` (Light) / `#0F172A` (Dark) |
| **Typo titres** | Inter Bold |
| **Typo corps** | Inter Regular, 18px, line-height 1.75 |
| **Typo code** | JetBrains Mono |

---

## 🛠 Stack Technique

| Composant | Technologie |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + `@tailwindcss/typography` |
| Contenu | MDX (Phase 1) → Headless CMS (Phase 2) |
| Recherche | Algolia DocSearch |
| Analytics | Plausible Analytics |
| Newsletter | Resend ou Loops |
| RSS | next-rss |
| SEO | next-seo, JSON-LD Article schema |
| Déploiement | Firebase Hosting (static export) |

---

## 📊 KPIs

| Métrique | Objectif M+6 |
|---|---|
| Articles publiés | 50+ |
| Visiteurs uniques/mois | 10 000 |
| Temps moyen sur page | > 3 min |
| Inscriptions newsletter | 2 000 |
| Position Google (mots-clés cibles) | Top 10 |

---

## 📅 Roadmap

### Phase 1 (Semaines 1-2)
- [ ] Setup Next.js + MDX pipeline
- [ ] Page listing `/`
- [ ] Page article `/[slug]`
- [ ] 5 articles inauguraux
- [ ] RSS + SEO

### Phase 2 (Semaines 3-4)
- [ ] Pages catégories et tags
- [ ] Pages auteurs
- [ ] Newsletter integration
- [ ] Recherche Algolia
- [ ] Migration vers Headless CMS

---

## 🔗 Liens

- **`press.imuchat.app`** → Kit presse
- **`community.imuchat.app`** → Changelog produit
- **`help.imuchat.app`** → Tutoriels détaillés
