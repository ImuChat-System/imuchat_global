# 🏪 store.imuchat.app — ImuStore

> Vitrine publique du Store ImuChat, accessible sans compte. Catalogue des mini-apps, top modules, catégories et fiches détaillées.

---

## 🎯 Objectif Stratégique

**Faire du Store un levier d'acquisition** en permettant à quiconque de découvrir l'écosystème d'applications ImuChat avant même de s'inscrire. Le site sert aussi de **pont vers le portail développeurs**.

Comparable à : pages web de l'App Store / Google Play / Chrome Web Store — consultable sans compte.

---

## 📋 Fiche d'identité

| Champ | Valeur |
|---|---|
| **Sous-domaine** | `store.imuchat.app` |
| **Type** | Catalogue public / Vitrine marketplace |
| **Cibles principales** | Utilisateurs curieux, développeurs, médias |
| **Priorité** | 🟠 Haute |
| **Lien écosystème** | `developers.imuchat.app`, `sandbox.imuchat.app` |
| **Framework** | Next.js 14 (App Router) |
| **Hosting** | Firebase Hosting |
| **i18n** | FR, EN, DE, ES, JA |

---

## 🧭 Arborescence des pages

```
store.imuchat.app
├── /                     → Page d'accueil Store (trending, catégories, mises en avant)
├── /categories           → Toutes les catégories
├── /category/[slug]      → Liste des apps d'une catégorie
├── /app/[id]             → Fiche détaillée d'une mini-app
├── /top                  → Classements (populaires, nouveautés, recommandées)
├── /collections          → Collections thématiques (éditorialisées)
├── /developers           → Devenir développeur (lien portail)
├── /submit               → Soumettre une mini-app (teasing)
├── /search               → Recherche globale
├── /about                → À propos du Store
└── /legal                → CGU Store & politique développeurs
```

---

## 📄 Détail des pages

### 🏠 `/` — Page d'accueil Store

**Rôle** : Donner un aperçu riche et engageant du catalogue.

**Sections** :
1. **Hero** — "Des milliers d'apps. Un écosystème. Zéro limite." + barre de recherche
2. **Spotlight** — 3-5 apps mises en avant (rotation éditoriale)
3. **Tendances** — Top 10 du moment (icônes + noms + notes)
4. **Catégories** — Grille visuelle des catégories principales
5. **Nouveautés** — Dernières apps publiées
6. **Pour les développeurs** — Bannière "Créez votre mini-app" → lien portail dev
7. **CTA** — "Téléchargez ImuChat pour installer vos apps"

### 📂 `/categories` — Toutes les catégories

**Catégories principales** :

| Catégorie | Icône | Description |
|---|---|---|
| **Mini-Apps** | 📱 | Applications intégrées (jeux, outils, social) |
| **Thèmes** | 🎨 | Thèmes visuels pour personnaliser l'interface |
| **Stickers** | 💬 | Packs de stickers et emojis animés |
| **Extensions IA** | 🤖 | Modules d'IA spécialisés (Alice plugins) |
| **Connecteurs** | 🔗 | Intégrations ERP, CRM, outils tiers |
| **Templates** | 📋 | Modèles sectoriels (Office, Gaming, Education) |
| **Widgets** | 🧩 | Widgets pour l'écran d'accueil ImuChat |
| **Jeux** | 🎮 | Mini-jeux et jeux sociaux |
| **Productivité** | ⚡ | Outils de productivité et automatisation |
| **Social** | 👥 | Extensions sociales (événements, sondages, lives) |

### 📱 `/app/[id]` — Fiche détaillée

**Sections de la fiche** :
1. **Header** — Icône + Nom + Éditeur + Note moyenne + Nombre d'installations
2. **Captures d'écran** — Carousel horizontal (3-6 screenshots)
3. **Description** — Texte riche (markdown)
4. **Fonctionnalités clés** — Liste à puces
5. **Avis & notes** — Étoiles + commentaires utilisateurs (lecture seule)
6. **Informations techniques** :
   - Version actuelle
   - Taille du bundle
   - Permissions requises (accès caméra, contacts, IA…)
   - Compatibilité (web, mobile, desktop)
   - Dernière mise à jour
   - Politique de confidentialité de l'app
7. **Éditeur** — Lien profil développeur, autres apps
8. **Apps similaires** — Recommandations
9. **CTA** — "Installer dans ImuChat" (deep link vers l'app)

### 🏆 `/top` — Classements

**Onglets** :
- **Populaires** — Top 50 par installations
- **Mieux notées** — Top 50 par note moyenne (min. 100 avis)
- **Nouveautés** — Dernières 30 jours
- **Gratuites** — Top apps gratuites
- **Premium** — Top apps payantes
- **Recommandées par Alice** — Sélection IA personnalisée

### 📚 `/collections` — Collections éditorialisées

**Exemples** :
- "Rentrée scolaire : les apps essentielles"
- "Boostez votre productivité"
- "Les meilleurs jeux multijoueur"
- "Apps souveraines : 100% UE"
- "Découverte manga & anime"

Chaque collection = titre + description + liste d'apps curatée.

### 🧑‍💻 `/developers` — Devenir développeur

**Contenu** :
- Pourquoi publier sur ImuStore ?
- Avantages : audience captive, monétisation, IA intégrée, distribution multi-plateforme
- Revenue share : **70% développeur / 30% plateforme**
- Processus de publication (soumission → review → publication)
- Lien direct → `developers.imuchat.app` pour la documentation complète
- Lien → `sandbox.imuchat.app` pour tester

### 🔍 `/search` — Recherche globale

**Fonctionnalités** :
- Barre de recherche avec autocomplétion
- Filtres : catégorie, note minimale, gratuit/payant, compatibilité
- Résultats paginés avec preview (icône + nom + note + description courte)
- Recherche par tag/mot-clé

---

## 🎨 Design System

### Identité visuelle

- **Palette** : Blanc + Violet ImuChat (#8B5CF6) + accents par catégorie
- **Style** : Clean, aéré, orienté contenu (inspiration App Store web)
- **Cards** : Coins arrondis, ombres subtiles, hover effects
- **Typographie** : Inter

### Composants spécifiques

- `AppCard` — Carte mini-app (icône 64px + nom + note + catégorie)
- `AppCardLarge` — Carte mise en avant (screenshot + description)
- `CategoryPill` — Pill de catégorie avec icône
- `RatingStars` — Étoiles de notation (lecture seule)
- `ScreenshotCarousel` — Carousel responsive de screenshots
- `SearchBar` — Barre de recherche avec autocomplétion
- `CollectionBanner` — Bannière collection thématique
- `DeveloperBadge` — Badge "Vérifié" / "Top développeur"
- `PermissionList` — Liste des permissions requises avec icônes
- `InstallButton` — Bouton "Installer" avec deep link

---

## 🛠️ Stack technique

| Composant | Technologie |
|---|---|
| **Framework** | Next.js 14 (App Router, ISR pour les fiches) |
| **Styling** | Tailwind CSS |
| **i18n** | next-intl |
| **Data** | Supabase (catalogue apps) ou API REST platform-core |
| **Recherche** | Algolia ou Supabase Full-Text Search |
| **Images** | Cloudinary ou Supabase Storage (icônes, screenshots) |
| **Hosting** | Firebase Hosting + API Edge Functions |

---

## 📅 Roadmap d'implémentation

### Phase 1 — Catalogue statique (Semaines 1-2)

- [ ] Setup projet Next.js 14
- [ ] Design system : AppCard, CategoryPill, SearchBar
- [ ] Page `/` — Home avec données mockées (JSON statique)
- [ ] Page `/categories` — Grille des catégories
- [ ] Page `/app/[id]` — Fiche détaillée (données mock)
- [ ] Page `/top` — Classements statiques

### Phase 2 — Contenu & navigation (Semaines 3-4)

- [ ] Page `/search` — Recherche avec filtres
- [ ] Page `/collections` — Collections éditorialisées
- [ ] Page `/developers` — Landing développeurs
- [ ] Traductions FR/EN
- [ ] SEO : sitemap dynamique, meta par fiche

### Phase 3 — Données dynamiques (Semaines 5-8)

- [ ] Connexion API Supabase / platform-core (catalogue réel)
- [ ] ISR pour les fiches apps (régénération incrémentale)
- [ ] Recherche full-text avec autocomplétion
- [ ] Deep links "Installer dans ImuChat"
- [ ] Analytics par fiche (vues, clics install)
- [ ] Page `/submit` — Formulaire soumission basique

---

## 📊 KPIs de succès

| KPI | Objectif |
|---|---|
| Pages vues catalogue | > 1 000/mois |
| Fiches apps consultées | > 500/mois |
| Clics "Installer" | > 5% des vues fiche |
| Clics "Devenir développeur" | > 2% visiteurs |
| Apps référencées | > 50 au lancement |

---

## 🔗 Liens avec l'écosystème

- **`developers.imuchat.app`** → Documentation complète pour publier
- **`sandbox.imuchat.app`** → Environnement de test développeurs
- **`imuchat.app`** → Site vitrine principal
- **`alice.imuchat.app`** → Alice = moteur de recommandation dans le Store
