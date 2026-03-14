# 🤖 alice.imuchat.app — Alice IA

> Landing page dédiée à Alice, l'intelligence artificielle transversale de l'écosystème ImuChat.

---

## 🎯 Objectif Stratégique

**Faire d'Alice un différenciateur de marque reconnu**, au même titre que Siri (Apple), Alexa (Amazon) ou Copilot (Microsoft).
Alice n'est pas un gadget : c'est le fil rouge intelligent qui relie tous les modules de la super-app.

Le site doit **démystifier l'IA**, rassurer sur la **confidentialité**, et montrer la **polyvalence** d'Alice à travers des cas d'usage concrets.

---

## 📋 Fiche d'identité

| Champ | Valeur |
|---|---|
| **Sous-domaine** | `alice.imuchat.app` |
| **Type** | Landing page produit / Vitrine IA |
| **Cibles principales** | Grand public, early adopters, entreprises, intégrateurs, presse |
| **Priorité** | 🟡 Moyenne |
| **Lien écosystème** | `office.imuchat.app`, `store.imuchat.app`, `developers.imuchat.app` |
| **Framework** | Next.js 14 (App Router) |
| **Hosting** | Firebase Hosting |
| **i18n** | FR, EN, DE, JA |

---

## 🧭 Arborescence des pages

```
alice.imuchat.app
├── /                     → Page d'accueil (Qui est Alice ?)
├── /capabilities         → Ce qu'Alice sait faire
├── /personas             → Les personnalités d'Alice (Companions)
├── /privacy              → IA privée & respect des données
├── /usecases             → Cas d'usage concrets par domaine
├── /developers           → Intégrer Alice dans vos mini-apps
├── /about                → Vision & philosophie IA
└── /legal                → Mentions légales
```

---

## 📄 Détail des pages

### 🏠 `/` — Qui est Alice ?

**Rôle** : Présenter Alice en 30 secondes, créer une connexion émotionnelle.

**Sections** :

1. **Hero** — Avatar Alice animé + "Bonjour, je suis Alice. Votre IA, votre allié(e)."
2. **En 1 phrase** — "Alice est l'intelligence artificielle intégrée partout dans ImuChat. Elle vous assiste, vous protège et s'adapte à vous."
3. **Où est Alice ?** — Grille visuelle : Chat, Office, Store, Finance, Gaming, Feed (chaque module = 1 icône)
4. **Démo interactive** — Mini-conversation simulée (3-4 échanges) montrant Alice en contexte
5. **Différenciateurs** — "IA privée", "Pas de revente de données", "Fonctionne hors-ligne" (optionnel), "Souverain"
6. **CTA** — "Découvrir les capacités" / "Essayer Alice"

**Ton** : Chaleureux, accessible, rassurant. Ni trop technique ni trop marketing.

### ⚡ `/capabilities` — Ce qu'Alice sait faire

**Organisation par domaine** :

| Domaine | Capacités |
|---|---|
| **💬 Communication** | Reformulation, traduction instantanée, résumé de conversation, modération |
| **📝 Bureautique** | Rédaction assistée, correction, génération de documents, analyse de données |
| **🎨 Création** | Suggestions de contenu, génération d'images, aide à l'écriture créative |
| **💰 Finance** | Alice Finance : analyse dépenses, alertes budget, suggestions d'épargne |
| **🎮 Gaming** | Matchmaking intelligent, coaching, recommandations de jeux |
| **🔒 Sécurité** | Guardian Angel : alertes catastrophes, risques sanitaires, veille sécurité |
| **📚 Éducation** | Tuteur adaptatif, quiz personnalisés, aide aux devoirs |
| **🏢 Entreprise** | Résumé de réunions, extraction d'actions, recherche sémantique |

**Format** : Cards interactives avec animation au survol, démo visuelle pour chaque domaine.

### 🎭 `/personas` — Les personnalités d'Alice (ImuCompanion)

**Contenu** :

- **Concept** : Alice n'a pas qu'un seul visage. Elle s'incarne dans des **Companions** personnalisables.
- **Archétypes officiels** :
  - 🧑‍💼 **Assistant Pro** — Sobre, efficace, orienté tâches
  - 👩‍🏫 **Professeur** — Patient, pédagogue, adaptatif
  - 🏋️ **Coach** — Motivant, encourageant, suivi d'objectifs
  - 🐱 **Mascotte** — Kawaii, ludique, pour les plus jeunes
  - 🛡️ **Modérateur** — Protecteur, sécurité, bien-être
- **Personnalisation** :
  - Apparence (2D / 3D, skins, accessoires)
  - Voix (tonalité, vitesse, langue)
  - Comportement (intensité d'initiative, formalité)
- **Segmentation par âge** : Enfant (6-12), Ado (13-17), Adulte (18+), Senior (65+)
- **Galerie** : Visualisation des différents avatars/styles

### 🔐 `/privacy` — IA privée & respect des données

**Contenu** :

- **Principe fondamental** : "Vos données ne quittent jamais votre contrôle."
- **Pas d'entraînement sur vos données** — Aucune conversation n'est utilisée pour améliorer les modèles
- **Option IA locale** — Déploiement on-premise pour entreprises (Mistral, LLaMA)
- **Stratégie LLM hybride** :
  - Phase 1 : APIs propriétaires (OpenAI, Anthropic, Mistral) avec anonymisation
  - Phase 2 : Modèles open-source auto-hébergés pour tâches courantes
  - Phase 3 : Infrastructure souveraine UE (GPU dédiés)
- **ImuAI Gateway** : Routing intelligent (la requête va au modèle le plus adapté sans exposer les données)
- **Certifications visées** : RGPD, ISO 27001, SecNumCloud
- **Transparence** : Logs d'utilisation IA accessibles à l'utilisateur

### 💡 `/usecases` — Cas d'usage concrets

**Par persona** :

**👩‍🎓 Étudiante (Marie, 20 ans)**
> Marie demande à Alice de résumer son cours de 50 pages, de générer des flashcards, et de corriger son mémoire. Alice détecte les incohérences et suggère des sources.

**👨‍👩‍👧 Famille (Les Martin)**
> Les parents activent le mode Guardian Angel pour leurs enfants. Alice filtre les contenus inappropriés, résume les activités en ligne, et alerte en cas de comportement à risque.

**🏢 PME (TechCorp, 50 employés)**
> L'équipe utilise Alice dans ImuOffice pour résumer les réunions, extraire les actions, et rechercher dans les 10 000 documents de l'entreprise. Déploiement on-premise, données restent en interne.

**🎮 Gamer (Kenji, 17 ans)**
> Alice recommande des jeux, forme des équipes équilibrées pour les tournois, et coach Kenji sur ses stats de jeu.

### 🧑‍💻 `/developers` — Intégrer Alice dans vos mini-apps

**Contenu** :

- **Alice SDK** : API simple pour intégrer Alice dans n'importe quelle mini-app ImuChat
- **Endpoints** :
  - `/alice/chat` — Conversation contextuelle
  - `/alice/summarize` — Résumé de contenu
  - `/alice/translate` — Traduction
  - `/alice/analyze` — Analyse de données
  - `/alice/moderate` — Modération de contenu
- **Exemples de code** (JavaScript, Python)
- **Limites & quotas** selon le plan développeur
- **Lien** → `developers.imuchat.app` pour la doc complète

### 🔮 `/about` — Vision & philosophie IA

**Contenu** :

- L'IA au service de l'humain, pas l'inverse
- Pourquoi "Alice" ? (référence littéraire, curiosité, exploration)
- Roadmap IA : court terme (assistants) → moyen terme (agents autonomes) → long terme (IA souveraine UE)
- Éthique IA : pas de biais volontaire, transparence algorithmique, droit à l'explication
- Engagement open-source (publication de certains modèles/outils)

---

## 🎨 Design System

### Identité visuelle

- **Palette** : Violet profond (#7C3AED) + Cyan IA (#06B6D4) + Blanc
- **Ambiance** : Futuriste mais chaleureuse (ni froide ni clinique)
- **Avatar Alice** : Illustration 2D stylisée (style anime/manga subtil), déclinable en plusieurs poses
- **Animations** : Particules flottantes, effets de "pensée" IA, transitions fluides
- **Typographie** : Inter (principal) + monospace pour les snippets code

### Composants spécifiques

- `AliceAvatar` — Avatar animé responsive (idle, talking, thinking)
- `CapabilityCard` — Carte capacité avec icône + démo interactive
- `PersonaCard` — Carte Companion avec preview avatar
- `UseCaseStory` — Story scroll avec illustrations
- `ChatDemo` — Mini-conversation interactive simulée
- `PrivacyBadge` — Badge "IA Privée" / "RGPD" / "Souverain"
- `CodeSnippet` — Bloc de code avec syntax highlighting

---

## 🌍 Internationalisation

| Langue | Priorité | Justification |
|---|---|---|
| 🇫🇷 Français | P0 | Marché principal |
| 🇬🇧 Anglais | P0 | International + tech |
| 🇩🇪 Allemand | P1 | Sensibilité IA/données en DACH |
| 🇯🇵 Japonais | P1 | ADN kawaii + marché Japon |

---

## 🛠️ Stack technique

| Composant | Technologie |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Styling** | Tailwind CSS |
| **i18n** | next-intl |
| **Animations** | Framer Motion + Lottie (avatar) |
| **3D (optionnel)** | Three.js / React Three Fiber (avatar 3D) |
| **Hosting** | Firebase Hosting |

---

## 📅 Roadmap d'implémentation

### Phase 1 — MVP Landing (Semaines 1-2)

- [ ] Setup projet Next.js 14 + Tailwind
- [ ] Design system : palette IA, composants de base
- [ ] Avatar Alice (illustration 2D, 3 poses minimum)
- [ ] Page `/` (Home) — Hero + grille "Où est Alice" + CTA
- [ ] Page `/capabilities` — Grille des capacités par domaine
- [ ] Page `/privacy` — Rassurance données

### Phase 2 — Profondeur (Semaines 3-4)

- [ ] Page `/personas` — Galerie Companions
- [ ] Page `/usecases` — 4 stories illustrées
- [ ] Page `/developers` — Teasing SDK + endpoints
- [ ] ChatDemo interactif (conversation simulée)
- [ ] Traductions FR/EN

### Phase 3 — Polish (Semaines 5-6)

- [ ] Page `/about` — Vision IA
- [ ] Animations avancées (Lottie avatar, particules)
- [ ] SEO : meta, sitemap, JSON-LD
- [ ] OG images
- [ ] Traductions DE, JA
- [ ] Analytics

---

## 📊 KPIs de succès

| KPI | Objectif |
|---|---|
| Temps sur page Home | > 1 min 30 |
| Scroll depth | > 70% |
| Clics "Essayer Alice" | > 5% visiteurs |
| Partage social | > 2% |
| ChatDemo interactions | > 30% visiteurs |

---

## 🔗 Liens avec l'écosystème

- **`imuchat.app`** → Landing principale (Alice mentionnée dans Features)
- **`office.imuchat.app`** → Alice dans ImuOffice
- **`store.imuchat.app`** → Mini-apps utilisant Alice
- **`developers.imuchat.app`** → Documentation SDK Alice
- **`enterprise.imuchat.app`** → Alice pour entreprises (on-premise)
