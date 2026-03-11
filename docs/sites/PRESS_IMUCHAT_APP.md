# 📰 press.imuchat.app — Kit Presse & Relations Médias

> Espace presse officiel : communiqués, kit média, assets visuels, contacts RP.

---

## 🎯 Objectif Stratégique

**Faciliter la couverture médiatique d'ImuChat** en fournissant aux journalistes et influenceurs toutes les ressources nécessaires en un seul endroit (assets de marque, communiqués, chiffres clés, contacts).

---

## 📋 Fiche d'identité

| Champ | Valeur |
|---|---|
| **Sous-domaine** | `press.imuchat.app` |
| **Type** | Kit presse / Relations médias |
| **Cibles principales** | Journalistes tech, influenceurs, analystes |
| **Priorité** | 🟡 Moyenne |
| **i18n** | FR, EN |

---

## 🧭 Arborescence

```
press.imuchat.app
├── /                     → Accueil presse (hero + navigation rapide)
├── /releases             → Communiqués de presse (chronologique)
├── /releases/[slug]      → Communiqué individuel
├── /brand                → Kit de marque (logos, couleurs, typographies)
├── /media                → Galerie médias (screenshots, photos, vidéos)
├── /facts                → Chiffres clés & fact sheet
├── /leadership           → Bios & photos de l'équipe dirigeante
├── /coverage             → Revue de presse (articles publiés)
├── /contact              → Contact relations presse
└── /fr, /en              → Versions linguistiques
```

---

## 📄 Pages clés

### 🏠 `/` — Accueil Presse

**Sections** :
1. **Hero** — "Espace Presse ImuChat" + baseline mission
2. **Dernier communiqué** — Card featured
3. **Navigation rapide** — 6 cards vers sections (Kit marque, Médias, Chiffres, Leadership, Communiqués, Contact)
4. **Inscription alertes presse** — Email pour recevoir les communiqués

### 📢 `/releases` — Communiqués

- Liste chronologique inverse
- Filtres : année, catégorie (produit, partenariat, levée, événement)
- Chaque communiqué : titre, date, résumé, PDF téléchargeable
- Bouton "Copier le texte" pour intégration rapide

### 🎨 `/brand` — Kit de Marque

**Assets téléchargeables** :
- **Logos** — SVG, PNG (fond clair/sombre), favicon, app icon
- **Couleurs** — Palette complète avec codes HEX/RGB/HSL
- **Typographies** — Inter (licences, fichiers)
- **Guidelines** — Do / Don't d'utilisation
- **Templates** — Présentation PPT/Keynote brandée

**Format de téléchargement** : ZIP par catégorie + téléchargement individuel

### 📸 `/media` — Galerie Médias

- **Screenshots produit** — Web, mobile, desktop (haute résolution)
- **Photos équipe** — Portraits officiels
- **Vidéos** — Démos produit, interviews
- **Infographies** — Architecture, chiffres clés

### 📊 `/facts` — Chiffres Clés

**Fact Sheet** incluant :
- Date de fondation
- Nombre d'utilisateurs
- Nombre de mini-apps dans le Store
- Pays couverts / langues supportées
- Équipe (taille, localisation)
- Partenaires clés
- Stack technologique (souveraineté)

### 👤 `/leadership` — Équipe Dirigeante

Par personne :
- Photo portrait (haute résolution, téléchargeable)
- Nom, titre, bio courte (150 mots)
- Citation clé
- Profils sociaux (LinkedIn, Twitter/X)

### 📬 `/contact` — Contact RP

- Formulaire de demande presse
- Email direct : press@imuchat.app
- Téléphone (si applicable)
- Temps de réponse garanti : < 24h (jours ouvrés)

---

## 🎨 Design System

| Token | Valeur |
|---|---|
| **Couleur primaire** | `#8B5CF6` (Violet ImuChat) |
| **Couleur secondaire** | `#1E293B` (Slate dark) |
| **Background** | `#FFFFFF` |
| **Typo** | Inter |
| **Style** | Épuré, professionnel, corporate |

---

## 🛠 Stack Technique

| Composant | Technologie |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Contenu | MDX (communiqués) |
| Stockage assets | Supabase Storage (ou S3) |
| Formulaire contact | Resend (email) |
| i18n | next-intl (FR/EN) |
| Déploiement | Firebase Hosting |

---

## 📅 Roadmap

### Phase 1 (Semaine 1-2)
- [ ] Page d'accueil `/`
- [ ] Page `/brand` avec kit téléchargeable
- [ ] Page `/contact`
- [ ] Premier communiqué de presse

### Phase 2 (Semaine 3-4)
- [ ] Pages `/releases`, `/media`, `/facts`
- [ ] Page `/leadership`
- [ ] Traductions EN
- [ ] Inscription alertes presse

---

## 🔗 Liens

- **`blog.imuchat.app`** → Articles de fond
- **`careers.imuchat.app`** → Recrutement (culture)
- **`imuchat.app`** → Site vitrine principal
