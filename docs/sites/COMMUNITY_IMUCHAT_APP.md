# 💬 community.imuchat.app — Communauté ImuChat

> Forum et espace communautaire ouvert : votes de features, retours, discussions, changelog.

---

## 🎯 Objectif Stratégique

**Centraliser les échanges entre ImuChat et sa communauté** dans un espace transparent et participatif. Les utilisateurs votent pour les fonctionnalités, signalent les bugs, suivent le changelog et échangent entre eux.

---

## 📋 Fiche d'identité

| Champ | Valeur |
|---|---|
| **Sous-domaine** | `community.imuchat.app` |
| **Type** | Forum communautaire / Plateforme de feedback |
| **Cibles principales** | Utilisateurs actifs, bêta-testeurs, contributeurs |
| **Priorité** | 🟡 Moyenne |
| **Lien écosystème** | `feedback.imuchat.app`, `blog.imuchat.app`, `developers.imuchat.app` |
| **Framework** | Next.js 14 ou solution dédiée (Discourse, Fider, Canny) |
| **i18n** | FR, EN |

---

## 🧭 Arborescence des pages

```
community.imuchat.app
├── /                     → Page d'accueil (activité récente, trending)
├── /discussions          → Forum de discussions (catégorisé)
├── /ideas                → Propositions de features (votables)
├── /bugs                 → Signalements de bugs
├── /changelog            → Changelog public (versions, features)
├── /roadmap              → Roadmap publique (planifié, en cours, livré)
├── /ambassadors          → Programme ambassadeurs
├── /guidelines           → Règles de la communauté
└── /about                → À propos
```

---

## 📄 Détail des pages

### 🏠 `/` — Accueil communauté

**Sections** :
1. **Activité récente** — Derniers posts, derniers votes, derniers changelogs
2. **Trending** — Discussions et idées les plus populaires cette semaine
3. **Stats communauté** — Nombre de membres, idées soumises, bugs résolus
4. **Recherche** — Barre de recherche globale
5. **CTA** — "Proposer une idée" / "Rejoindre la discussion"

### 💡 `/ideas` — Propositions de features

**Fonctionnalités** :
- Soumettre une idée (titre + description + catégorie)
- Voter pour/contre (upvote)
- Statuts : Proposé → En évaluation → Planifié → En cours → Livré → Refusé
- Filtres : catégorie, statut, popularité, date
- Commentaires et discussions sur chaque idée
- Réponses officielles de l'équipe ImuChat

### 🐛 `/bugs` — Signalements de bugs

**Template de signalement** :
- Description du bug
- Étapes pour reproduire
- Plateforme (web, mobile, desktop)
- Version de l'app
- Captures d'écran
- Statuts : Signalé → Confirmé → En cours → Résolu → Fermé

### 📋 `/changelog` — Changelog public

**Format** :
- Par version (v1.2.3)
- Date de publication
- Catégories : ✨ Nouveautés, 🐛 Corrections, ⚡ Améliorations, 🔒 Sécurité
- Tags : web, mobile, desktop, API
- Lien vers les PR/issues GitHub (si open-source)

### 🗺️ `/roadmap` — Roadmap publique

**Colonnes Kanban** :
- **💭 À l'étude** — Idées populaires en évaluation
- **📋 Planifié** — Confirmé, dans le backlog
- **🔨 En cours** — En développement actif
- **✅ Livré** — Déployé en production
- Chaque carte = feature avec titre, description, nombre de votes, date estimée

### 🌟 `/ambassadors` — Programme ambassadeurs

**Contenu** :
- Devenir ambassadeur ImuChat dans votre communauté
- Avantages : accès bêta anticipé, badge spécial, merch, contact direct avec l'équipe
- Missions : tester, reporter, promouvoir, traduire
- Candidature : formulaire avec motivations et communautés

---

## 🎨 Design System

- **Palette** : Blanc + Gris clair + Violet ImuChat accent
- **Ton** : Ouvert, transparent, participatif
- **Style** : Clean, orienté contenu, type forum moderne

### Composants

- `IdeaCard` — Carte idée (titre, votes, statut, auteur)
- `BugReport` — Template de bug structuré
- `ChangelogEntry` — Entrée changelog avec badges version/catégorie
- `RoadmapColumn` — Colonne Kanban
- `VoteButton` — Bouton de vote avec compteur
- `StatusBadge` — Badge de statut coloré

---

## 📅 Roadmap d'implémentation

### Phase 1 (Semaines 1-2)
- [ ] Page `/` — Home communauté
- [ ] Page `/ideas` — Système de propositions + votes
- [ ] Page `/changelog` — Changelog public
- [ ] Page `/guidelines` — Règles

### Phase 2 (Semaines 3-4)
- [ ] Page `/discussions` — Forum catégorisé
- [ ] Page `/bugs` — Signalements
- [ ] Page `/roadmap` — Roadmap publique
- [ ] Page `/ambassadors` — Programme ambassadeurs

---

## 🔗 Liens avec l'écosystème

- **`feedback.imuchat.app`** → Formulaire de feedback simplifié (alias/redirection possible)
- **`blog.imuchat.app`** → Annonces officielles qui alimentent le changelog
- **`developers.imuchat.app`** → Feedback technique et API
- **`status.imuchat.app`** → Statut de la plateforme
