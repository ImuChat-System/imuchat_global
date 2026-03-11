# ❓ help.imuchat.app — Centre d'Aide

> Centre d'aide ImuChat : FAQ, guides, tutoriels, support, base de connaissances.

---

## 🎯 Objectif Stratégique

**Réduire la charge du support humain** en offrant une base de connaissances complète et self-service. Permettre aux utilisateurs de résoudre 80%+ de leurs problèmes sans contacter le support.

---

## 📋 Fiche d'identité

| Champ | Valeur |
|---|---|
| **Sous-domaine** | `help.imuchat.app` |
| **Type** | Centre d'aide / Knowledge Base |
| **Cibles principales** | Tous les utilisateurs ImuChat |
| **Priorité** | 🟢 Haute |
| **i18n** | FR, EN, DE, ES, JA |

---

## 🧭 Arborescence

```
help.imuchat.app
├── /                     → Accueil (recherche + catégories)
├── /getting-started      → Premiers pas
├── /account              → Gestion de compte
├── /messaging            → Messagerie & appels
├── /alice                → Alice IA
├── /office               → ImuOffice (Docs, Sheets, Slides, Drive)
├── /store                → ImuStore
├── /arena                → ImuArena
├── /pay                  → ImuPay / ImuWallet
├── /creators             → Espace Créateurs
├── /privacy              → Vie privée & sécurité
├── /billing              → Facturation & abonnements
├── /[category]/[slug]    → Article d'aide individuel
├── /contact              → Contacter le support
├── /status               → État des services (uptime)
└── /search               → Recherche full-text
```

---

## 📄 Pages clés

### 🏠 `/` — Accueil

**Layout** :
1. **Barre de recherche proéminente** — "Comment pouvons-nous vous aider ?"
2. **Catégories principales** — 10-12 cards avec icônes
3. **Questions populaires** — Top 5 FAQ
4. **Alice Assistant** — Widget IA flottant "Demandez à Alice"
5. **Contact** — CTA "Besoin d'aide humaine ?"

### 🚀 `/getting-started` — Premiers pas

- Créer un compte
- Configurer son profil
- Envoyer son premier message
- Rejoindre un serveur
- Installer les applications (Web, Mobile, Desktop)
- Personnaliser l'interface

### 📄 `/[category]/[slug]` — Article d'aide

**Composants** :
- **Breadcrumb** — Accueil > Catégorie > Article
- **Titre + Résumé**
- **Corps** — Étapes numérotées, screenshots annotés, vidéos embed
- **Utile ?** — Vote 👍/👎
- **Articles connexes** — 3 suggestions
- **Contact support** — Si l'article n'a pas résolu le problème
- **Dernière mise à jour** — Date

### 🤖 Alice Assistant

Widget IA intégré dans toutes les pages :
- Répond aux questions en langage naturel
- Cite les articles de la knowledge base
- Escalade vers support humain si nécessaire
- Historique de conversation

### 📞 `/contact` — Support

**Canaux** :
| Canal | Disponibilité | Temps de réponse |
|---|---|---|
| Alice IA | 24/7 | Instantané |
| Chat humain | Lun-Ven 9h-18h | < 5 min |
| Email | 24/7 | < 24h |
| Ticket | 24/7 | < 48h |

**Formulaire** :
- Catégorie du problème
- Description
- Screenshots (upload)
- Informations système (auto-détectées)

### 🟢 `/status` — État des Services

- Status page en temps réel
- Historique des incidents (90 jours)
- SLA par service
- Inscription aux alertes (email/SMS)

---

## 🎨 Design System

| Token | Valeur |
|---|---|
| **Couleur primaire** | `#8B5CF6` (Violet ImuChat) |
| **Couleur secondaire** | `#3B82F6` (Blue — confiance) |
| **Background** | `#F8FAFC` (Light gray) |
| **Typo** | Inter |
| **Style** | Clair, aéré, accessible |
| **Iconographie** | Heroicons outline |

---

## 🛠 Stack Technique

| Composant | Technologie |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Contenu | MDX (articles) |
| Recherche | Algolia DocSearch |
| IA Assistant | Alice API (`alice.imuchat.app`) |
| Status page | Betteruptime ou custom Supabase |
| i18n | next-intl (FR/EN/DE/ES/JA) |
| Analytics | Plausible |
| Feedback (👍/👎) | Supabase |
| Déploiement | Firebase Hosting |

---

## 📊 KPIs

| Métrique | Objectif |
|---|---|
| Articles publiés | 200+ |
| Taux de résolution self-service | > 80% |
| Score utile (👍) | > 85% |
| Recherches sans résultats | < 5% |
| Temps moyen de résolution (support) | < 2h |
| NPS support | > 60 |

---

## 📅 Roadmap

### Phase 1 (Semaines 1-3)
- [ ] Page d'accueil + recherche
- [ ] Structure catégories
- [ ] 50 premiers articles (getting-started, account, messaging)
- [ ] Page `/contact`
- [ ] i18n FR/EN

### Phase 2 (Semaines 4-6)
- [ ] Intégration Alice Assistant
- [ ] Status page
- [ ] Articles ImuOffice, Store, Arena, Pay
- [ ] Algolia DocSearch
- [ ] Traductions DE/ES/JA

---

## 🔗 Liens

- **`community.imuchat.app`** → Bug reports, feature requests
- **`docs.imuchat.app`** → Documentation technique (développeurs)
- **`feedback.imuchat.app`** → Feedback produit
