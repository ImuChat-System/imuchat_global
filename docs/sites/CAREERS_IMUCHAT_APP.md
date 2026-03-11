# 💼 careers.imuchat.app — Recrutement ImuChat

> Page carrières : offres d'emploi, culture d'entreprise, processus de recrutement, candidatures.

---

## 🎯 Objectif Stratégique

**Attirer les meilleurs talents** en présentant la vision ImuChat, la culture d'entreprise, les avantages et les opportunités de carrière. Positionner ImuChat comme employeur de choix dans la tech souveraine.

---

## 📋 Fiche d'identité

| Champ | Valeur |
|---|---|
| **Sous-domaine** | `careers.imuchat.app` |
| **Type** | Page carrières / RH |
| **Cibles principales** | Développeurs, designers, product managers, commerciaux |
| **Priorité** | 🟡 Moyenne |
| **i18n** | FR, EN |

---

## 🧭 Arborescence

```
careers.imuchat.app
├── /                     → Accueil carrières (vision + culture)
├── /jobs                 → Liste des offres
├── /jobs/[slug]          → Fiche de poste détaillée
├── /culture              → Culture & valeurs
├── /benefits             → Avantages & rémunération
├── /process              → Processus de recrutement
├── /teams                → Présentation des équipes
├── /teams/[team]         → Focus équipe (Engineering, Design, Product...)
├── /apply/[jobSlug]      → Formulaire candidature
├── /internships          → Stages & alternances
└── /testimonials         → Témoignages collaborateurs
```

---

## 📄 Pages clés

### 🏠 `/` — Accueil Carrières

**Sections** :
1. **Hero** — "Construis le futur de la communication souveraine" + vidéo culture
2. **Mission** — Pourquoi ImuChat existe
3. **Chiffres** — Taille équipe, pays, âge moyen, ratio remote
4. **Valeurs** — 4 valeurs clés avec illustrations
5. **Offres à la une** — 3-5 postes prioritaires
6. **Ne trouve pas ton poste ?** — Candidature spontanée

### 📋 `/jobs` — Liste des Offres

**Filtres** :
- **Département** : Engineering, Design, Product, Marketing, Commercial, Ops
- **Type** : CDI, CDD, Freelance, Stage, Alternance
- **Localisation** : Remote, Paris, Hybride
- **Niveau** : Junior, Confirmé, Senior, Lead

**Card offre** :
- Titre du poste
- Département + Localisation + Type
- Résumé (2 lignes)
- Date de publication
- Tag "Nouveau" (< 7 jours)

### 📝 `/jobs/[slug]` — Fiche de Poste

**Structure** :
1. **Header** — Titre, département, localisation, type, salaire (fourchette)
2. **À propos du poste** — Contexte et mission
3. **Responsabilités** — Liste à puces (5-8 items)
4. **Profil recherché** — Compétences requises / souhaitées
5. **Stack technique** (si applicable) — Technologies utilisées
6. **Processus** — Étapes du recrutement pour ce poste
7. **Avantages** — Rappel des avantages
8. **CTA** — "Postuler" → formulaire `/apply/[jobSlug]`

### 🌟 `/culture` — Culture & Valeurs

- **Souveraineté** — Construire des alternatives européennes
- **Innovation** — IA responsable, open source, partage de connaissances
- **Bienveillance** — Inclusion, diversité, bien-être
- **Impact** — Chaque feature sert des millions d'utilisateurs

### 🎁 `/benefits` — Avantages

| Catégorie | Détail |
|---|---|
| 💰 Rémunération | Salaire compétitif + equity (BSPCE) |
| 🏠 Remote | Full remote ou hybride Paris |
| 📚 Formation | Budget formation 1500€/an |
| 🏖️ Congés | 30 jours + RTT |
| 💻 Matériel | MacBook Pro + écran + setup home office |
| 🍽️ Repas | Carte Swile |
| 🏥 Santé | Mutuelle Alan 100% |
| 🚀 Produit | Accès Premium gratuit à tout l'écosystème |

### 🔄 `/process` — Processus de Recrutement

**4 étapes** :
1. **Screening CV** (48h) — Review candidature
2. **Call RH** (30 min) — Fit culturel, motivations
3. **Entretien technique** (1h) — Live coding ou case study selon le rôle
4. **Entretien final** (45 min) — Avec le manager + team fit

Timeline : 2-3 semaines max.

### 👥 `/teams` — Équipes

Cards par équipe :
- **Engineering** — Frontend, Backend, Mobile, DevOps, IA
- **Design** — UI/UX, Brand, Motion
- **Product** — Product Managers, Data Analysts
- **Marketing** — Growth, Content, Community
- **Commercial** — Sales, Partnerships, Customer Success
- **Ops** — Finance, Legal, RH

---

## 🎨 Design System

| Token | Valeur |
|---|---|
| **Couleur primaire** | `#8B5CF6` (Violet ImuChat) |
| **Couleur accent** | `#10B981` (Emerald — énergie positive) |
| **Background** | `#FAFAFA` → sections alternées blanches/grises |
| **Typo** | Inter |
| **Style** | Moderne, dynamique, inspirant |

---

## 🛠 Stack Technique

| Composant | Technologie |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Offres d'emploi | MDX (Phase 1) → ATS API (Phase 2) |
| Formulaire candidature | React Hook Form + Supabase Storage (CV upload) |
| i18n | next-intl (FR/EN) |
| SEO | JSON-LD JobPosting schema |
| Déploiement | Firebase Hosting |

---

## 📊 KPIs

| Métrique | Objectif |
|---|---|
| Candidatures reçues/mois | 100+ |
| Temps moyen de recrutement | < 3 semaines |
| Taux d'acceptation offres | > 80% |
| Score Glassdoor | > 4.2/5 |
| Pages vues / offre | > 200 |

---

## 📅 Roadmap

### Phase 1 (Semaines 1-2)
- [ ] Page d'accueil `/`
- [ ] Page `/jobs` + `/jobs/[slug]`
- [ ] Formulaire candidature `/apply/[slug]`
- [ ] 5-10 offres initiales

### Phase 2 (Semaines 3-4)
- [ ] Pages `/culture`, `/benefits`, `/process`
- [ ] Pages `/teams`
- [ ] Traductions EN
- [ ] Intégration ATS (Ashby, Lever ou TeamTailor)

---

## 🔗 Liens

- **`press.imuchat.app`** → Couverture médiatique
- **`blog.imuchat.app`** → Articles culture
- **`imuchat.app`** → Site vitrine
