# 🏢 office.imuchat.app — ImuOffice Sovereign Suite

> Site vitrine dédié à la suite bureautique souveraine européenne d'ImuChat.

---

## 🎯 Objectif Stratégique

**Positionner ImuOffice comme l'alternative européenne souveraine à Microsoft 365 / Google Workspace.**
Cibles : PME, ETI, collectivités, établissements d'enseignement, administrations, défense, secteurs sensibles.

Le site doit inspirer **confiance institutionnelle**, démontrer la **maturité produit** et générer des **leads B2B qualifiés**.

---

## 📋 Fiche d'identité

| Champ | Valeur |
|---|---|
| **Sous-domaine** | `office.imuchat.app` |
| **Type** | Site vitrine B2B / Landing produit |
| **Cibles principales** | DSI, décideurs IT, responsables conformité, enseignants |
| **Priorité** | 🟠 Haute |
| **Lien écosystème** | `enterprise.imuchat.app`, `docs.imuchat.app` |
| **Framework** | Next.js 14 (App Router) |
| **Hosting** | Firebase Hosting (ou Vercel) |
| **i18n** | FR, EN, DE (prioritaire UE) |

---

## 🧭 Arborescence des pages

```
office.imuchat.app
├── /                     → Page d'accueil (Hero + positionnement souverain)
├── /suite                → Présentation de la suite complète
├── /docs                 → ImuDocs (traitement de texte)
├── /sheets               → ImuSheets (tableur)
├── /slides               → ImuSlides (présentations)
├── /drive                → ImuDrive (stockage & sync)
├── /pdf                  → ImuPDF (lecture, annotation, OCR)
├── /ged                  → GED (gestion électronique de documents)
├── /ai                   → Alice IA dans ImuOffice
├── /security             → Sécurité, RGPD, SecNumCloud, chiffrement
├── /pricing              → Plans tarifaires (SaaS / On-Premise / Éducation)
├── /compare              → Comparatif vs Microsoft 365 / Google Workspace
├── /customers            → Témoignages & cas d'usage sectoriels
├── /contact              → Formulaire contact commercial + démo
├── /privacy              → Politique de confidentialité
└── /legal                → Mentions légales
```

---

## 📄 Détail des pages

### 🏠 `/` — Page d'accueil

**Rôle** : Convaincre en 10 secondes que ImuOffice est une alternative crédible et souveraine.

**Sections** :

1. **Hero** — Slogan + illustration suite (ex: "La suite bureautique souveraine. Made in Europe.")
2. **Problème** — Dépendance aux GAFAM, données hors UE, coûts cachés
3. **Solution** — ImuOffice en 1 phrase + aperçu des 6 outils
4. **Chiffres clés** — "100% UE", "Chiffrement E2E", "RGPD natif", "On-Premise disponible"
5. **Secteurs cibles** — Grille : Administration, Santé, Éducation, PME, Défense
6. **Témoignages** — 2-3 citations d'early adopters / partenaires pilotes
7. **CTA** — "Demander une démo" / "Essayer gratuitement"

**Ton** : Institutionnel, sobre, confiance. Pas de marketing agressif.

### 📦 `/suite` — La suite complète

**Contenu** :

- Vue d'ensemble des 6 produits (ImuDocs, ImuSheets, ImuSlides, ImuDrive, ImuPDF, GED)
- Architecture modulaire : activez uniquement ce dont vous avez besoin
- Collaboration temps réel (CRDT) sur tous les outils
- Interopérabilité : import/export .docx, .xlsx, .pptx, .odt, .pdf
- Intégration native avec la messagerie ImuChat

### 📝 `/docs` — ImuDocs

**Contenu** :

- Traitement de texte professionnel
- Collaboration temps réel (CRDT, curseurs multi-utilisateurs)
- Formats supportés : .docx, .odt, .pdf, .md
- Signature électronique (eIDAS)
- Templates métiers (contrats, courriers administratifs, rapports)
- Alice IA : rédaction assistée, reformulation, résumé

### 📊 `/sheets` — ImuSheets

**Contenu** :

- Tableur collaboratif
- Formules avancées, tableaux croisés dynamiques
- Import/export .xlsx, .csv, .ods
- Scripts d'automatisation (macros)
- Visualisations intégrées (graphiques, dashboards)
- Alice IA : analyse de données, détection d'anomalies

### 🎨 `/slides` — ImuSlides

**Contenu** :

- Présentations professionnelles
- Mode présentateur avec notes
- Templates sectoriels (pitch, rapport, formation)
- Export PPTX, PDF, vidéo
- Collaboration temps réel
- Alice IA : génération de slides, suggestions de mise en page

### ☁️ `/drive` — ImuDrive

**Contenu** :

- Stockage cloud souverain (hébergement 100% UE)
- Chiffrement bout-en-bout, zero-knowledge optionnel
- Versioning fichiers (historique illimité)
- Synchronisation desktop/mobile
- Partage granulaire (lien, mot de passe, expiration)
- Quotas configurables par organisation

### 📄 `/pdf` — ImuPDF

**Contenu** :

- Lecteur PDF avancé
- Annotations, surlignage, commentaires
- OCR intégré (extraction texte depuis scans)
- Signature numérique (eIDAS)
- Conversion PDF → document éditable

### 🗃️ `/ged` — Gestion Électronique de Documents

**Contenu** :

- Workflow d'approbation multi-niveaux
- Archivage légal (conformité NF Z42-013)
- Classification IA automatique
- Recherche plein texte + sémantique
- Métadonnées personnalisables
- Intégration avec ImuDrive

### 🤖 `/ai` — Alice IA dans ImuOffice

**Contenu** :

- Alice = IA intégrée nativement dans chaque outil
- Cas d'usage : rédaction, analyse, résumé, traduction, recherche
- IA privée : option de déploiement local (pas de données envoyées hors infra)
- Modèles souverains (Mistral, LLaMA) en option
- RGPD : aucune donnée utilisée pour l'entraînement

### 🔒 `/security` — Sécurité & Conformité

**Contenu** :

- RGPD natif (DPO, registre traitements, droit à l'oubli)
- Chiffrement : TLS 1.3 en transit, AES-256 au repos, E2E optionnel
- Hébergement 100% UE (datacenters France/Allemagne)
- Objectif certification SecNumCloud & ISO 27001
- SSO (SAML 2.0, OIDC) + LDAP/Active Directory
- RBAC + ABAC (contrôle d'accès granulaire)
- Audit trail complet (qui a fait quoi, quand)
- Déploiement On-Premise disponible

### 💰 `/pricing` — Tarification

**Plans proposés** :

| Plan | Cible | Prix indicatif | Inclus |
|---|---|---|---|
| **Starter** | TPE / Freelances | 4,90€/user/mois | ImuDocs, ImuSheets, ImuDrive (50 Go) |
| **Business** | PME / ETI | 9,90€/user/mois | Suite complète, GED, Alice IA, 200 Go |
| **Enterprise** | Grands comptes | Sur devis | On-Premise, SSO, SLA, support dédié |
| **Éducation** | Écoles / Universités | Gratuit ou réduit | Suite complète, admin ENT |
| **Souverain** | Administrations | Sur devis | SecNumCloud, audit, DPO dédié |

**Sections** :

- Tableau comparatif des plans
- FAQ pricing
- Calculateur de coût (nombre d'utilisateurs × plan)
- CTA : "Contacter l'équipe commerciale"

### ⚖️ `/compare` — Comparatif

**Tableau ImuOffice vs Microsoft 365 vs Google Workspace** :

| Critère | ImuOffice | Microsoft 365 | Google Workspace |
|---|:---:|:---:|:---:|
| Hébergement 100% UE | ✅ | ❌ | ❌ |
| On-Premise disponible | ✅ | ❌ | ❌ |
| IA privée (local) | ✅ | ❌ | ❌ |
| RGPD natif | ✅ | 🟡 | 🟡 |
| Open-core | ✅ | ❌ | ❌ |
| Messagerie intégrée | ✅ (ImuChat) | 🟡 (Teams) | 🟡 (Chat) |
| GED intégrée | ✅ | ❌ (SharePoint) | ❌ |
| SecNumCloud (objectif) | ✅ | ❌ | ❌ |

**Ton** : Factuel, pas dénigrant. Mettre en avant les forces sans attaquer.

### 🏆 `/customers` — Témoignages & cas d'usage

**Sections** :

- Cas d'usage par secteur (Administration, Santé, Éducation, PME)
- Témoignages clients (même fictifs/pilotes au début)
- Logos partenaires
- Études de cas détaillées (PDF téléchargeables)

### ✉️ `/contact` — Contact commercial

**Formulaire segmenté** :

- Type : Démo / Devis / Partenariat / Support
- Secteur d'activité
- Taille de l'organisation
- Besoins spécifiques (On-Premise, SSO, GED…)
- Délai de décision

---

## 🎨 Design System

### Identité visuelle

- **Palette principale** : Bleu institutionnel (#1E40AF) + Violet ImuChat (#8B5CF6) en accent
- **Palette secondaire** : Gris slate pour textes, blanc pour fonds
- **Typographie** : Inter ou Geist Sans (pro, lisible)
- **Iconographie** : Lucide Icons (cohérent avec l'écosystème)
- **Illustrations** : Style isométrique professionnel, pas de "Corporate Memphis"

### Composants spécifiques

- `PricingTable` — Tableau tarification responsive avec toggle mensuel/annuel
- `ComparisonTable` — Tableau comparatif animé
- `ProductCard` — Carte produit (ImuDocs, ImuSheets…) avec icône + description
- `TestimonialCard` — Carte témoignage avec photo + citation
- `SecurityBadge` — Badge certification (RGPD, ISO, SecNumCloud)
- `CTABanner` — Bannière d'appel à l'action "Demander une démo"
- `SectorGrid` — Grille des secteurs cibles avec icônes

---

## 🌍 Internationalisation

### Langues prioritaires

| Langue | Priorité | Justification |
|---|---|---|
| 🇫🇷 Français | P0 | Marché principal |
| 🇬🇧 Anglais | P0 | International + UE |
| 🇩🇪 Allemand | P1 | Marché DACH, sensible données |
| 🇪🇸 Espagnol | P2 | Marché hispanique UE |

### Structure i18n

```
messages/
├── fr.json    → Traduction complète
├── en.json    → Traduction complète
├── de.json    → Priorité Phase 2
└── es.json    → Priorité Phase 3
```

---

## 🛠️ Stack technique

| Composant | Technologie |
|---|---|
| **Framework** | Next.js 14 (App Router, export statique) |
| **Styling** | Tailwind CSS |
| **i18n** | next-intl |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Formulaires** | React Hook Form + Zod |
| **Analytics** | Plausible (privacy-first) ou PostHog |
| **Hosting** | Firebase Hosting |
| **CI/CD** | GitHub Actions |

---

## 📅 Roadmap d'implémentation

### Phase 1 — Fondations (Semaines 1-2)

- [ ] Setup projet Next.js 14 + Tailwind + next-intl
- [ ] Configuration Firebase Hosting + CI/CD
- [ ] Design system : composants de base (Navbar, Footer, Container, CTABanner)
- [ ] Page `/` (Home) — Hero + Problème + Solution + CTA
- [ ] Page `/suite` — Vue d'ensemble des produits
- [ ] Page `/pricing` — Tableau tarification
- [ ] Page `/contact` — Formulaire segmenté

### Phase 2 — Pages produits (Semaines 3-4)

- [ ] Pages individuelles : `/docs`, `/sheets`, `/slides`, `/drive`, `/pdf`, `/ged`
- [ ] Page `/ai` — Alice dans ImuOffice
- [ ] Page `/security` — Sécurité & conformité
- [ ] Page `/compare` — Comparatif concurrents
- [ ] Traductions FR/EN complètes

### Phase 3 — Crédibilité & conversion (Semaines 5-6)

- [ ] Page `/customers` — Témoignages & cas d'usage
- [ ] SEO : meta tags, sitemap, JSON-LD Organization/Product
- [ ] OG images pour chaque page
- [ ] Intégration analytics (Plausible)
- [ ] Pages légales (`/privacy`, `/legal`)
- [ ] Traduction DE

---

## 📊 KPIs de succès

| KPI | Objectif Phase 1 |
|---|---|
| Pages complètes | 15/16 |
| Lighthouse Score | > 90 |
| Formulaires de contact reçus | > 10/mois |
| Temps moyen sur site | > 2 min |
| Taux de rebond | < 50% |
| Traductions complètes | FR, EN |

---

## 🔗 Liens avec l'écosystème

- **`enterprise.imuchat.app`** → Lien pour les besoins grands comptes / déploiement avancé
- **`imuchat.app`** → Retour vers le site vitrine principal
- **`docs.imuchat.app`** → Documentation technique API ImuOffice
- **`alice.imuchat.app`** → Page dédiée Alice IA (vision transversale)
