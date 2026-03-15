# 💬 feedback.imuchat.app — Feedback & Roadmap Publique

> Plateforme de feedback utilisateur : suggestions, votes, roadmap publique, bêta-tests.

---

## 🎯 Objectif Stratégique

**Impliquer les utilisateurs dans la construction du produit** en recueillant leurs retours, permettant de voter sur les priorités, et en affichant une roadmap publique transparente.

---

## 📋 Fiche d'identité

| Champ | Valeur |
|---|---|
| **Sous-domaine** | `feedback.imuchat.app` |
| **Type** | Feedback board / Roadmap publique |
| **Cibles principales** | Utilisateurs actifs, power users, bêta-testeurs |
| **Priorité** | 🟢 Haute |
| **i18n** | FR, EN |

---

## 🧭 Arborescence

```
feedback.imuchat.app
├── /                     → Accueil (trending + catégories)
├── /ideas                → Toutes les suggestions
├── /ideas/[id]           → Détail suggestion + commentaires
├── /ideas/new            → Soumettre une idée
├── /roadmap              → Roadmap publique (Kanban)
├── /changelog            → Journal des mises à jour
├── /changelog/[slug]     → Détail d'une release
├── /beta                 → Programme bêta-test
├── /beta/[feature]       → Inscription bêta feature spécifique
└── /my                   → Mes suggestions & votes (authentifié)
```

---

## 📄 Pages clés

### 🏠 `/` — Accueil

**Sections** :

1. **Hero** — "Construisons ImuChat ensemble" + stats (X idées, Y votes, Z implémentées)
2. **Tendances** — Top 5 idées les plus votées cette semaine
3. **Catégories** — Messagerie, Alice IA, ImuOffice, Store, Arena, Pay, Mobile, Desktop, Web
4. **Dernières implémentations** — 3 features récemment livrées grâce aux votes
5. **CTA** — "Proposer une idée"

### 💡 `/ideas` — Suggestions

**Filtres** :

- **Statut** : Nouvelle, En revue, Planifiée, En cours, Livrée, Refusée
- **Catégorie** : Par produit/module
- **Tri** : Plus votées, Récentes, Tendances, Commentées

**Card suggestion** :

- Compteur de votes (▲ upvote)
- Titre
- Catégorie (tag coloré)
- Statut (badge)
- Nombre de commentaires
- Auteur + date

### 📝 `/ideas/[id]` — Détail

- Titre + description complète
- Votes (upvote avec compte)
- Statut actuel + historique des changements de statut
- Commentaires (fil de discussion)
- Réponse officielle de l'équipe ImuChat (épinglée)
- "Idées similaires" (dédoublonnage)

### 📝 `/ideas/new` — Soumettre une idée

**Formulaire** :

- Titre (obligatoire, 10-100 caractères)
- Description (obligatoire, Markdown supporté)
- Catégorie (dropdown)
- Screenshots/mockups (upload optionnel)
- Vérification de doublons (suggestions similaires affichées avant soumission)

### 🗺️ `/roadmap` — Roadmap Publique

**Vue Kanban** 4 colonnes :

| En réflexion | Planifié | En cours | Livré |
|---|---|---|---|
| Idées en évaluation | Sprint planifié | Développement actif | Déployé en production |

- Chaque card : titre, catégorie, nb de votes, ETA estimé
- Clic → détail de l'idée
- Filtres par catégorie/produit

### 📋 `/changelog` — Journal des Mises à Jour

- Liste chronologique des releases
- Tags : `Nouveau`, `Amélioration`, `Correction`, `Sécurité`
- Liens vers les idées de la communauté qui ont inspiré la feature
- Newsletter changelog (inscription)

### 🧪 `/beta` — Programme Bêta

- Inscription au programme bêta global
- Listing des features en bêta test
- Par feature : description, date de début, critères d'éligibilité, feedback form
- Badge "Bêta-testeur" sur le profil ImuChat

---

## 🎨 Design System

| Token | Valeur |
|---|---|
| **Couleur primaire** | `#8B5CF6` (Violet ImuChat) |
| **Couleur accent vote** | `#F59E0B` (Amber — votes) |
| **Couleur statuts** | Vert (livré), Bleu (en cours), Jaune (planifié), Gris (en revue) |
| **Background** | `#FFFFFF` |
| **Typo** | Inter |

---

## 🛠 Stack Technique

| Composant | Technologie |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Base de données | Supabase (idées, votes, commentaires) |
| Auth | Supabase Auth (SSO ImuChat) |
| Recherche | Supabase full-text search |
| Notifications | Supabase Realtime + email (Resend) |
| Kanban | Custom React DnD (read-only public) |
| Changelog | MDX |
| i18n | next-intl (FR/EN) |
| Déploiement | Firebase Hosting + Supabase |

---

## 📊 KPIs

| Métrique | Objectif M+6 |
|---|---|
| Idées soumises | 500+ |
| Votes totaux | 10 000+ |
| Taux d'implémentation (top 50 idées) | > 30% |
| Temps moyen de réponse officielle | < 48h |
| Bêta-testeurs actifs | 200+ |
| NPS (utilisateurs ayant vu leur idée livrée) | > 80 |

---

## 📅 Roadmap

### Phase 1 (Semaines 1-2)

- [ ] Page d'accueil + listing idées
- [ ] Soumission d'idées + votes (upvote)
- [ ] Détail idée + commentaires
- [ ] Auth Supabase

### Phase 2 (Semaines 3-4)

- [ ] Roadmap publique (Kanban)
- [ ] Changelog
- [ ] Programme bêta
- [ ] Notifications (statut changé, réponse officielle)
- [ ] i18n EN

---

## 🔗 Liens

- **`community.imuchat.app`** → Forum communautaire (discussions, ambassadeurs)
- **`help.imuchat.app`** → Centre d'aide (résolution problèmes)
- **`blog.imuchat.app`** → Annonces features
