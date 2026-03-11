# 👩‍💻 developers.imuchat.app — Portail Développeurs

> Portail développeurs ImuChat : documentation API, guides, SDK, et ressources pour créer des mini-apps.

---

## 🎯 Objectif Stratégique

**Bâtir un écosystème de développeurs tiers** capable d'enrichir le Store en mini-apps, extensions IA, connecteurs et thèmes. Le portail est la porte d'entrée technique : documentation, playground, communauté dev.

Comparable à : developer.apple.com, developers.line.biz, developers.facebook.com.

---

## 📋 Fiche d'identité

| Champ | Valeur |
|---|---|
| **Sous-domaine** | `developers.imuchat.app` |
| **Type** | Portail développeurs / Documentation technique |
| **Cibles principales** | Développeurs web/mobile, agences, intégrateurs, étudiants dev |
| **Priorité** | 🟠 Haute |
| **Lien écosystème** | `docs.imuchat.app`, `sandbox.imuchat.app`, `store.imuchat.app` |
| **Framework** | Next.js 14 ou Docusaurus (documentation) |
| **i18n** | FR, EN |

---

## 🧭 Arborescence des pages

```
developers.imuchat.app
├── /                     → Page d'accueil (Hero dev + getting started)
├── /docs                 → Documentation technique (API reference)
├── /guides               → Guides & tutoriels (getting started, avancé)
├── /sdk                  → SDKs disponibles (JS, Python, Dart)
├── /miniapps             → Créer une mini-app (spec, lifecycle, permissions)
├── /api                  → API Reference (REST + WebSocket)
├── /alice                → API Alice IA (intégration IA dans mini-apps)
├── /design               → Design guidelines (respect du design system ImuChat)
├── /publish              → Publier sur le Store (process, review, monetization)
├── /sandbox              → Sandbox de test (lien vers sandbox.imuchat.app)
├── /changelog            → Changelog API & SDK
├── /community            → Forum développeurs, issues, discussions
├── /status               → Statut des APIs
└── /legal                → Terms of Service développeurs
```

---

## 📄 Détail des pages

### 🏠 `/` — Page d'accueil développeurs

**Sections** :
1. **Hero** — "Construisez sur ImuChat. Touchez des millions." + code snippet
2. **Getting Started** — 3 étapes : Créer un compte dev → Suivre le guide → Publier
3. **Que pouvez-vous créer ?** — Mini-apps, Thèmes, Stickers, Extensions IA, Connecteurs, Widgets
4. **Chiffres** — "X utilisateurs actifs", "X mini-apps publiées", "70/30 revenue share"
5. **SDK** — Cards des SDKs disponibles (JS, Python, Dart)
6. **Showcase** — Mini-apps populaires créées par des devs tiers
7. **CTA** — "Commencer" / "Lire la documentation"

### 📚 `/docs` — Documentation technique

**Structure** :
```
/docs
├── /getting-started      → Prérequis, installation, premier projet
├── /authentication       → OAuth 2.0, tokens, scopes
├── /api-reference        → Endpoints REST détaillés
├── /websocket            → Connexions temps réel
├── /miniapps             → Spécifications mini-apps
├── /permissions          → Système de permissions & scopes
├── /events               → Webhooks & événements
├── /errors               → Codes d'erreur & troubleshooting
└── /migration            → Guides de migration entre versions
```

### 📱 `/miniapps` — Créer une mini-app

**Contenu** :
- **Architecture** : WebView sandbox + WebAssembly
- **Lifecycle** : Installation → Activation → Exécution → Mise à jour → Désinstallation
- **API Bridge** : `window.ImuAPI.request(scope, action, params)` — communication sécurisée avec la plateforme
- **Permissions** :
  - `user.profile.read` — Lire le profil
  - `user.contacts.read` — Accéder aux contacts
  - `camera` — Accéder à la caméra
  - `storage` — Stocker des données
  - `alice.chat` — Utiliser Alice IA
  - `payments` — Processus de paiement
- **Formats** : Bundle signé (.imuapp), manifest.json
- **Templates** : Starter templates (React, Vue, Svelte)
- **Best practices** : Performance, UX, sécurité, RGPD

### 🤖 `/alice` — API Alice IA

**Endpoints** :
```
POST /alice/v1/chat          → Conversation contextuelle
POST /alice/v1/summarize     → Résumé de contenu
POST /alice/v1/translate     → Traduction
POST /alice/v1/analyze       → Analyse de données
POST /alice/v1/moderate      → Modération de contenu
POST /alice/v1/generate      → Génération (texte, image)
```

**Limites** :
| Plan | Requêtes/jour | Tokens/requête |
|---|---|---|
| Free | 100 | 2 000 |
| Pro | 10 000 | 8 000 |
| Enterprise | Illimité | 32 000 |

### 🎨 `/design` — Design Guidelines

**Contenu** :
- Palette de couleurs ImuChat (tokens CSS/Tailwind)
- Typographie (Inter, tailles, poids)
- Composants UI réutilisables (boutons, cards, inputs)
- Iconographie (Lucide Icons)
- Responsive guidelines
- Thèmes : support des 6 thèmes ImuChat
- Accessibilité (WCAG 2.1 AA minimum)
- Do's & Don'ts visuels

### 📦 `/publish` — Publier sur le Store

**Process** :
1. **Développement** → Créer votre mini-app
2. **Test** → Valider dans le sandbox
3. **Soumission** → Upload du bundle + métadonnées (description, screenshots, catégorie)
4. **Review** → Vérification automatique (sécurité, performances) + review humaine
5. **Publication** → Disponible dans le Store
6. **Mises à jour** → Process simplifié pour les updates

**Monetization** :
- Gratuit : app gratuite, revenus = 0
- Payant : prix libre, commission 30% plateforme
- Freemium : app gratuite + achats in-app
- Abonnement : récurrent, commission 30% (15% après 1 an)

### 🧪 `/sandbox` — Sandbox de test

**Contenu** :
- Lien vers `sandbox.imuchat.app` (environnement isolé)
- Données de test fournies (utilisateurs, conversations, fichiers)
- Émulateur d'API Bridge dans le navigateur
- Logs de debug en temps réel
- Aucune donnée réelle, aucun paiement réel

---

## 🎨 Design System

- **Palette** : Noir (#0F172A) + Blanc + Vert code (#10B981) + Violet accent
- **Ambiance** : Développeur (dark mode par défaut), technique, clair
- **Code** : Syntax highlighting (Prism.js ou Shiki), copy button
- **Typographie** : Inter (texte) + JetBrains Mono (code)

### Composants spécifiques

- `CodeBlock` — Bloc de code avec syntax highlighting + copie
- `APIEndpoint` — Card endpoint (méthode, URL, description, params)
- `SDKCard` — Card SDK (langage, version, liens)
- `PermissionBadge` — Badge permission avec description
- `SidebarNav` — Navigation latérale documentation
- `TryItOut` — Playground API interactif
- `ChangelogEntry` — Entrée changelog technique

---

## 📅 Roadmap d'implémentation

### Phase 1 (Semaines 1-3)
- [ ] Page `/` — Home développeurs
- [ ] Page `/docs/getting-started` — Guide de démarrage
- [ ] Page `/miniapps` — Spécification mini-apps
- [ ] Page `/api` — API Reference (premiers endpoints)
- [ ] Page `/publish` — Process de publication

### Phase 2 (Semaines 4-6)
- [ ] Documentation complète API + WebSocket
- [ ] Page `/alice` — API Alice IA
- [ ] Page `/design` — Design guidelines
- [ ] Page `/sandbox` — Sandbox de test
- [ ] Page `/sdk` — SDKs

### Phase 3 (Semaines 7-8)
- [ ] Playground API interactif ("Try it out")
- [ ] Page `/changelog` — Changelog technique
- [ ] Page `/community` — Forum dev
- [ ] Traductions EN complètes
- [ ] Indexation SEO technique

---

## 🔗 Liens avec l'écosystème

- **`docs.imuchat.app`** → Documentation utilisateur (non-technique)
- **`sandbox.imuchat.app`** → Environnement de test
- **`store.imuchat.app`** → Catalogue public des mini-apps
- **`partners.imuchat.app`** → Programme partenaires (agences, intégrateurs)
- **`alice.imuchat.app`** → Présentation grand public d'Alice IA
