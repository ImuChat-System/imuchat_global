# 🎬 creators.imuchat.app — Espace Créateurs

> Espace dédié aux créateurs de contenu ImuChat : ImuFeed, monétisation, outils, analytics.

---

## 🎯 Objectif Stratégique

**Attirer les créateurs de contenu (vidéastes, artistes, streamers, blogueurs) vers ImuChat** en leur montrant qu'ils peuvent **gagner des revenus** et **fidéliser leur audience** directement dans l'écosystème, sans dépendre de plateformes tierces.

---

## 📋 Fiche d'identité

| Champ | Valeur |
|---|---|
| **Sous-domaine** | `creators.imuchat.app` |
| **Type** | Landing page créateurs / Portail monétisation |
| **Cibles principales** | Vidéastes, artistes, streamers, blogueurs, musiciens |
| **Priorité** | 🟡 Moyenne |
| **Lien écosystème** | `developers.imuchat.app`, `community.imuchat.app`, `pay.imuchat.app` |
| **Framework** | Next.js 14 (App Router) |
| **i18n** | FR, EN, JA |

---

## 🧭 Arborescence des pages

```
creators.imuchat.app
├── /                     → Page d'accueil (Hero créateurs + promesse de revenu)
├── /monetization         → Comment gagner de l'argent sur ImuChat
├── /tools                → Outils de création (éditeur, filtres, IA)
├── /imufeed              → Présentation d'ImuFeed (vidéo courte/longue)
├── /live                 → Live streaming
├── /analytics            → Dashboard analytics créateur
├── /community            → Construire sa communauté
├── /store                → Vendre dans le Store (modules, stickers, thèmes)
├── /success              → Stories de créateurs
├── /apply                → Candidater au programme créateur
├── /faq                  → Questions fréquentes
└── /legal                → CGU créateurs
```

---

## 📄 Détail des pages

### 🏠 `/` — Page d'accueil

**Sections** :
1. **Hero** — "Créez. Partagez. Gagnez." + visuel créateur avec interface ImuFeed
2. **La promesse** — "Sur ImuChat, vos créations vous rapportent. Vraiment."
3. **Sources de revenus** — 5 piliers visuels : Pourboires, Abonnements, Ventes, Lives, Concours
4. **Chiffres** — "80% des revenus pour vous", "0 algorithme punitif", "Paiements instantanés en ImuCoins"
5. **Créateurs en vedette** — 3-4 profils mis en avant (même fictifs au lancement)
6. **Outils** — Aperçu des outils de création intégrés
7. **CTA** — "Rejoindre le programme créateur" / "Commencer à publier"

### 💰 `/monetization` — Gagner de l'argent

**Sources de revenus détaillées** :

| Source | Description | Commission |
|---|---|---|
| **Pourboires** | Les fans envoient des ImuCoins pendant la consommation de contenu | 80% créateur / 20% plateforme |
| **Abonnements** | Abonnement premium créateur (contenu exclusif) | 85% créateur |
| **Ventes contenu** | Vidéos, photos, tutoriels réservés aux abonnés | 80% créateur |
| **Live Gifts** | Cadeaux animés pendant les lives | 70% créateur |
| **Store** | Vente de stickers, thèmes, mini-apps créées | 70% créateur |
| **Concours** | Gains ImuArena (prix de compétitions) | 100% créateur |
| **Sponsoring** | Partenariats marques via le marketplace | Négocié |

**Calcul de revenus** :
- Simulateur interactif : "Combien pouvez-vous gagner ?"
- Inputs : nombre d'abonnés, taux d'engagement, type de contenu
- Output : estimation de revenu mensuel

### 🛠️ `/tools` — Outils de création

**Contenu** :
- **Éditeur vidéo** : Trim, multi-clip, musique, transitions
- **Filtres IA** : Style manga/anime, vintage, cinématique
- **Sous-titres automatiques** : Alice génère les sous-titres dans toutes les langues
- **Traduction IA** : Contenu traduit automatiquement pour l'audience internationale
- **Stickers & effets** : Bibliothèque de stickers, effets sparkle/speed lines
- **Thumbnails** : Génération automatique de miniatures
- **Planification** : Programmer ses publications
- **Templates** : Modèles de posts, stories, miniatures

### 🎬 `/imufeed` — ImuFeed

**Contenu** :
- **Vidéo courte** : Format TikTok-like (15s-3min), scroll vertical infini
- **Vidéo longue** : Format YouTube-like (jusqu'à 60min)
- **Stories** : Contenu éphémère 24h
- **Algorithme** : "Pour toi" basé sur les intérêts, pas sur le sensationnalisme
- **Différenciateurs** :
  - Intégration chat : les abonnés peuvent discuter directement
  - Économie transparente : voir exactement combien chaque vidéo rapporte
  - Gamification RPG : badges Bronze → Diamant pour les créateurs
  - Pas de suppression de reach (pas de "shadow ban")
  - Mini-apps intégrables dans les vidéos
- **ADN visuel** : Style manga/anime (filtres, stickers, transitions kawaii)

### 📺 `/live` — Live Streaming

**Contenu** :
- Streaming en direct (caméra, écran, jeu)
- Gifts en direct (ImuCoins animés, réactions visuelles)
- Chat en temps réel avec modération Alice
- Co-streaming : inviter un autre créateur en live
- Replays automatiques + clips
- Événements programmés (rappels pour l'audience)
- Monétisation live : gifts + super-chats + abonnements

### 📊 `/analytics` — Dashboard Analytics

**Contenu** :
- Vues, likes, partages, commentaires (par contenu et global)
- Audience : démographie, géographie, heures de pointe
- Revenus : breakdown par source (pourboires, abonnements, ventes)
- Croissance : courbe d'abonnés, taux d'engagement
- Contenu performant : top posts, recommendations IA
- Export : CSV, PDF pour comptabilité

### 👥 `/community` — Construire sa communauté

**Contenu** :
- Création de communauté créateur (type serveur)
- Channels exclusifs pour abonnés premium
- Sondages et interactions (questions/réponses, votes)
- Événements : meet & greet virtuels, sessions Q&A
- Modération IA + modérateurs humains
- Intégration ImuArena (concours communautaires)

### 🏪 `/store` — Vendre dans le Store

**Contenu** :
- Créer et vendre : stickers, thèmes, emojis animés, sons
- Mini-apps : si vous savez coder, publiez vos créations
- Templates : modèles ImuOffice vendables
- Revenue share : 70% créateur / 30% plateforme
- Lien → `developers.imuchat.app` pour la doc technique
- Lien → `store.imuchat.app` pour le catalogue public

### 🌟 `/success` — Stories de créateurs

**Format** :
- 5-8 profils de créateurs (diversifiés : vidéaste, artiste, gamer, éducateur, musicien)
- Pour chacun : photo, bio, type de contenu, revenus (fourchette), citation
- Parcours : comment ils ont démarré, ce qui a fonctionné
- Conseils : tips pour les nouveaux créateurs

### 📝 `/apply` — Programme créateur

**Niveaux** :

| Niveau | Condition | Avantages |
|---|---|---|
| **Starter** | 0+ abonnés | Accès outils de base, monétisation pourboires |
| **Rising** | 100+ abonnés | Badge vérifié, abonnements, analytics avancés |
| **Partner** | 1 000+ abonnés | Support prioritaire, early access features, commissions réduites |
| **Star** | 10 000+ abonnés | Manager dédié, mise en avant, revenus sponsoring |

**Formulaire** :
- Pseudo ImuChat
- Plateformes actuelles (YouTube, TikTok, Instagram, Twitch)
- Type de contenu
- Nombre d'abonnés actuels (toutes plateformes)
- Motivation

---

## 🎨 Design System

- **Palette** : Rose vif (#EC4899) + Violet (#8B5CF6) + Noir + Blanc
- **Ambiance** : Créatif, dynamique, jeune, inspirant
- **Illustrations** : Style manga/anime, créateurs en action
- **Animations** : Confettis, sparkles, transitions fluides

### Composants spécifiques

- `RevenueSimulator` — Calculateur de revenus interactif
- `CreatorProfileCard` — Carte créateur (photo, stats, badge)
- `MonetizationPillar` — Pilier de revenu avec icône + description + %
- `ToolCard` — Carte outil de création (screenshot + description)
- `AnalyticsPreview` — Preview du dashboard (graphiques mockés)
- `TierCard` — Carte niveau du programme créateur
- `LivePreview` — Preview interface live streaming

---

## 📅 Roadmap d'implémentation

### Phase 1 (Semaines 1-2)
- [ ] Page `/` — Home créateurs
- [ ] Page `/monetization` — Sources de revenus + simulateur
- [ ] Page `/imufeed` — Présentation ImuFeed
- [ ] Page `/apply` — Programme créateur

### Phase 2 (Semaines 3-4)
- [ ] Pages `/tools`, `/live`, `/analytics`
- [ ] Page `/community` — Construire sa communauté
- [ ] Page `/success` — Stories créateurs
- [ ] Traductions FR/EN

### Phase 3 (Semaines 5-6)
- [ ] Page `/store` — Vendre dans le Store
- [ ] Page `/faq` — FAQ créateurs
- [ ] SEO (mots-clés monétisation, créateurs)
- [ ] Traduction JA

---

## 🔗 Liens avec l'écosystème

- **`developers.imuchat.app`** → Créateurs qui codent des mini-apps
- **`community.imuchat.app`** → Forum communautaire
- **`pay.imuchat.app`** → ImuCoins et paiements
- **`store.imuchat.app`** → Publication dans le Store
- **`arena.imuchat.app`** → Compétitions créatives
