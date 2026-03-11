# 📚 docs.imuchat.app — Documentation Technique

> Documentation technique complète de l'écosystème ImuChat : API, SDK, guides d'intégration, références.

---

## 🎯 Objectif Stratégique

**Fournir une documentation technique de référence** permettant aux développeurs internes et tiers de construire sur l'écosystème ImuChat. La qualité de la documentation est un facteur clé d'adoption du Store et des APIs.

---

## 📋 Fiche d'identité

| Champ | Valeur |
|---|---|
| **Sous-domaine** | `docs.imuchat.app` |
| **Type** | Documentation technique (Docusaurus-like) |
| **Cibles principales** | Développeurs (internes + tiers), intégrateurs |
| **Priorité** | 🟢 Haute |
| **i18n** | FR, EN |

---

## 🧭 Arborescence

```
docs.imuchat.app
├── /                         → Accueil docs (getting started rapide)
├── /getting-started          → Guides de démarrage
│   ├── /quickstart           → Démarrage en 5 minutes
│   ├── /authentication       → Authentification (OAuth, API keys)
│   └── /first-miniapp        → Créer sa première mini-app
├── /api                      → Référence API REST
│   ├── /users                → Endpoints Users
│   ├── /messages             → Endpoints Messages
│   ├── /servers              → Endpoints Servers/Channels
│   ├── /alice                → Endpoints Alice IA
│   ├── /store                → Endpoints Store
│   ├── /pay                  → Endpoints ImuPay
│   └── /webhooks             → Webhooks & Events
├── /sdk                      → SDKs & Librairies
│   ├── /javascript           → SDK JavaScript/TypeScript
│   ├── /python               → SDK Python
│   ├── /dart                 → SDK Dart/Flutter
│   └── /rest                 → Appels REST directs
├── /miniapps                 → Développement Mini-Apps
│   ├── /architecture         → Architecture (WebView sandbox)
│   ├── /imuapi-bridge        → ImuAPI Bridge référence
│   ├── /permissions          → Système de permissions
│   ├── /ui-guidelines        → Guidelines UI/UX
│   ├── /testing              → Tests & debugging
│   └── /publishing           → Publication sur le Store
├── /alice-api                → API Alice IA
│   ├── /chat                 → Chat completions
│   ├── /embeddings           → Embeddings
│   ├── /vision               → Vision (analyse d'images)
│   ├── /audio                → Audio (speech-to-text, TTS)
│   └── /companions           → ImuCompanion API
├── /realtime                 → Temps réel
│   ├── /websocket            → WebSocket API
│   ├── /events               → Événements système
│   └── /presence             → Présence utilisateur
├── /guides                   → Guides avancés
│   ├── /rate-limits          → Rate limiting & quotas
│   ├── /error-handling       → Gestion d'erreurs
│   ├── /pagination           → Pagination (cursor-based)
│   ├── /file-uploads         → Upload de fichiers
│   ├── /localization         → Internationalisation
│   └── /security             → Bonnes pratiques sécurité
├── /changelog                → Changelog API (versioning)
├── /status                   → État de l'API
└── /search                   → Recherche full-text
```

---

## 📄 Pages clés

### 🏠 `/` — Accueil

**Layout** :
1. **Hero** — "Documentation ImuChat" + search bar proéminente
2. **Quick Start cards** — 3 parcours : API REST, Mini-App, Alice IA
3. **SDKs** — Cards avec logos (JS, Python, Dart)
4. **Popular pages** — Top 10 pages visitées
5. **Status** — API uptime badge

### 📖 `/api` — Référence API REST

**Format par endpoint** :
```
## GET /api/v1/users/{userId}

Récupère les informations d'un utilisateur.

### Paramètres
| Param   | Type   | Required | Description         |
|---------|--------|----------|---------------------|
| userId  | string | ✅       | ID de l'utilisateur |

### Headers
| Header        | Value              |
|---------------|--------------------|
| Authorization | Bearer {API_KEY}   |

### Réponse 200
```json
{
  "id": "usr_abc123",
  "username": "alice",
  "displayName": "Alice Dupont",
  "avatar": "https://cdn.imuchat.app/avatars/..."
}
```

### Erreurs
| Code | Description |
|------|-------------|
| 401  | Non authentifié |
| 404  | Utilisateur non trouvé |
| 429  | Rate limit dépassé |
```

**Fonctionnalités** :
- Code samples multi-langages (cURL, JavaScript, Python)
- Bouton "Try it" (sandbox intégré)
- Copier le code en un clic

### 🧩 `/miniapps` — Mini-Apps

- Architecture sandbox (WebView isolé)
- ImuAPI Bridge : toutes les méthodes disponibles
- Cycle de vie de la mini-app
- Permissions et scopes
- Testing avec le Sandbox
- Processus de publication (6 étapes)
- Monétisation (freemium, premium, achats in-app)

### 🤖 `/alice-api` — Alice IA

- Chat completions (streaming et non-streaming)
- Embeddings pour RAG / recherche sémantique
- Vision (analyse d'images)
- Audio (transcription, TTS)
- Rate limits par tier :
  | Tier | Requêtes/min | Tokens/jour |
  |------|-------------|-------------|
  | Free | 10 | 50K |
  | Pro | 60 | 500K |
  | Enterprise | 300 | Illimité |

---

## 🎨 Design System

| Token | Valeur |
|---|---|
| **Background** | `#0F172A` (Dark — convention docs dev) |
| **Text** | `#E2E8F0` |
| **Accent** | `#8B5CF6` (Violet) |
| **Code blocks** | `#1E293B` avec syntax highlighting |
| **Typo titres** | Inter Bold |
| **Typo code** | JetBrains Mono |
| **Navigation** | Sidebar sticky à gauche |

---

## 🛠 Stack Technique

| Composant | Technologie |
|---|---|
| Framework | **Docusaurus 3** ou Next.js 14 + MDX |
| Styling | Tailwind CSS + custom theme |
| Contenu | MDX (Git-based) |
| Recherche | Algolia DocSearch |
| API Reference | OpenAPI spec → génération automatique |
| Code playground | Sandpack (Monaco editor embedded) |
| Versioning | Multi-version docs (v1, v2) |
| i18n | next-intl ou Docusaurus i18n |
| Déploiement | Firebase Hosting |

---

## 📊 KPIs

| Métrique | Objectif |
|---|---|
| Pages de docs | 300+ |
| Temps moyen sur page | > 4 min |
| Recherches sans résultats | < 3% |
| Satisfaction (feedback widget) | > 90% utile |
| API calls générés depuis docs | 10K/mois |

---

## 📅 Roadmap

### Phase 1 (Semaines 1-3)
- [ ] Setup Docusaurus/Next.js + MDX
- [ ] Getting Started (quickstart, auth, first miniapp)
- [ ] API Reference (users, messages, servers)
- [ ] SDK JavaScript
- [ ] Recherche Algolia

### Phase 2 (Semaines 4-6)
- [ ] Mini-Apps documentation complète
- [ ] Alice API reference
- [ ] Realtime / WebSocket
- [ ] Guides avancés
- [ ] Code playground interactif
- [ ] i18n EN

---

## 🔗 Liens

- **`developers.imuchat.app`** → Portail développeur (inscriptions, dashboard)
- **`sandbox.imuchat.app`** → Environnement de test
- **`store.imuchat.app`** → Publication mini-apps
