# 🏆 arena.imuchat.app — ImuArena

> Vitrine publique du hub de concours et compétitions ImuChat.

---

## 🎯 Objectif Stratégique

**Positionner ImuArena comme le hub de compétitions communautaires le plus complet**, fusionnant le meilleur de Discord Events, des challenges TikTok, de la structure e-sport et de l'économie créative.

Le site attire des participants **avant même l'inscription** et sert de vitrine pour les sponsors et organisateurs.

---

## 📋 Fiche d'identité

| Champ | Valeur |
|---|---|
| **Sous-domaine** | `arena.imuchat.app` |
| **Type** | Vitrine compétitions / Landing e-sport & créatif |
| **Cibles principales** | Gamers, créateurs, développeurs, sponsors, communautés |
| **Priorité** | 🟡 Moyenne |
| **Lien écosystème** | `gaming.imuchat.app`, `community.imuchat.app`, `creators.imuchat.app` |
| **Framework** | Next.js 14 (App Router) |
| **i18n** | FR, EN, JA |

---

## 🧭 Arborescence des pages

```
arena.imuchat.app
├── /                     → Page d'accueil (Hero + compétitions en cours)
├── /leagues              → Les 6 ligues (Gaming, Creative, Tech, Story, Knowledge, Visual)
├── /league/[slug]        → Détail d'une ligue
├── /contests             → Liste des concours ouverts
├── /contest/[id]         → Fiche détaillée d'un concours
├── /rankings             → Classements globaux & par ligue
├── /seasons              → Saisons & archives
├── /rewards              → Récompenses & prix
├── /sponsors             → Devenir sponsor / partenaire
├── /organize             → Organiser un concours
├── /about                → À propos d'ImuArena
└── /legal                → Règlement & CGU
```

---

## 📄 Détail des pages

### 🏠 `/` — Page d'accueil

**Sections** :
1. **Hero** — "Compétition. Création. Communauté." + visuel dynamique (compteur concours actifs)
2. **Concours en cours** — Carousel des 5-8 concours actuellement ouverts (timer, participants, catégorie)
3. **Les 6 ligues** — Grille visuelle avec icônes et descriptions courtes
4. **Classement du moment** — Top 10 joueurs/créateurs du mois
5. **Saison en cours** — Nom, thème, dates, progression
6. **Highlights** — Meilleures créations / meilleurs moments de la saison
7. **CTA** — "Rejoindre un concours" / "Organiser le vôtre"

### 🏅 `/leagues` — Les 6 Ligues

| Ligue | Domaine | Exemples de concours |
|---|---|---|
| 🎮 **Gaming League** | Jeux vidéo & e-sport | Tournois bracket, speedrun, battle royale, mini-jeux |
| 🎨 **Creative League** | Arts & création | Dessin, manga/BD, animation, musique, montage vidéo, stickers, design |
| 💻 **Tech League** | Code & innovation | Hackathons, coding challenges, mini-apps, IA |
| ✍️ **Story League** | Écriture & narration | Fan fiction, nouvelles, poésie, scénarios, worldbuilding |
| 🧠 **Knowledge League** | Quiz & culture | Trivia, quiz thématiques, débats, culture générale |
| 📸 **Visual League** | Photo & vidéo | Photographie, cinématographie, clips, documentaires |

### 🏆 `/contest/[id]` — Fiche concours

**Sections** :
1. **Header** — Titre + Ligue + Dates (début/fin) + Statut (ouvert/en cours/terminé)
2. **Description** — Objectif, thème, contraintes
3. **Règles** — Format, critères d'évaluation, jury vs vote public (60/40)
4. **Prix** — Récompenses (ImuCoins, badges, réel)
5. **Participants** — Nombre inscrit + profils
6. **Soumissions** — Galerie publique des participations (si concours créatif)
7. **Classement** — Résultats en temps réel ou finaux
8. **Timer** — Countdown dynamique
9. **CTA** — "Participer" (deep link vers l'app)

### 📊 `/rankings` — Classements

**Vues** :
- **Global** — Top 100 tous concours confondus
- **Par ligue** — Top 50 par ligue
- **Par saison** — Archives des classements passés
- **Par région** — France, Europe, Monde, Japon

**Profil joueur (aperçu)** :
- Avatar, pseudo, rang (Bronze → Diamant), XP, badges
- Historique des participations et résultats

### 📅 `/seasons` — Saisons

**Contenu** :
- Concept de saison (~3 mois), avec thème narratif
- Calendrier des concours de la saison
- Récompenses de fin de saison (exclusives)
- Archives des saisons passées (gagnants, stats)
- "Battle Pass" gratuit + premium (cosmétiques, badges rares)

### 🎁 `/rewards` — Récompenses

**Types** :
- **ImuCoins** — Prix en monnaie interne
- **Badges exclusifs** — NFT-style (sans blockchain) liés au profil
- **Récompenses physiques** — Merch, matériel (sponsors)
- **Visibilité** — Mise en avant dans le Store, profils featured
- **XP & progression** — System RPG (Bronze, Silver, Gold, Platinum, Diamond)

### 🤝 `/sponsors` — Devenir sponsor

**Contenu** :
- Avantages sponsoring (visibilité, co-branding, data, audience)
- Packages : Bronze / Silver / Gold sponsor
- Exemples de partenariats potentiels (marques gaming, tech, éducation)
- Formulaire de contact sponsoring

### 🎯 `/organize` — Organiser un concours

**Contenu** :
- Qui peut organiser ? (communautés, marques, développeurs)
- Processus : proposition → validation → publication
- Outils fournis (système de vote, bracket, timer, galerie)
- Revenue sharing sur les inscriptions payantes
- Lien vers la documentation développeurs

---

## 🎨 Design System

- **Palette** : Noir profond (#0F0F0F) + Or (#F59E0B) + Violet ImuChat + accents néon
- **Ambiance** : Gaming/e-sport premium, dynamique, compétitif
- **Animations** : Compteurs, timers, effets de particules, transitions rapides
- **Typographie** : Inter (texte) + police display pour les titres de ligue

### Composants spécifiques

- `ContestCard` — Carte concours (timer, participants, ligue, statut)
- `LeagueCard` — Carte ligue avec icône, couleur distinctive, stats
- `RankingTable` — Tableau classement avec avatars, rangs, badges
- `SeasonBanner` — Bannière de saison avec thème visuel
- `CountdownTimer` — Timer animé (jours:heures:minutes:secondes)
- `RewardBadge` — Badge récompense avec rareté (commun → légendaire)
- `BracketView` — Visualisation tournoi bracket (arbre)
- `GalleryGrid` — Grille de soumissions créatives
- `SponsorTier` — Card package sponsor (Bronze/Silver/Gold)

---

## 📅 Roadmap d'implémentation

### Phase 1 (Semaines 1-2)
- [ ] Page `/` — Home avec concours mock
- [ ] Page `/leagues` — Présentation des 6 ligues
- [ ] Page `/contest/[id]` — Fiche concours détaillée
- [ ] Page `/rankings` — Classements statiques

### Phase 2 (Semaines 3-4)
- [ ] Page `/seasons` — Système de saisons
- [ ] Page `/rewards` — Récompenses
- [ ] Page `/sponsors` — Devenir sponsor
- [ ] Page `/organize` — Organiser un concours
- [ ] Traductions FR/EN

### Phase 3 (Semaines 5-6)
- [ ] Données dynamiques (API platform-core)
- [ ] Timer temps réel, classements live
- [ ] SEO, OG images par concours
- [ ] Traduction JA

---

## 🔗 Liens avec l'écosystème

- **`gaming.imuchat.app`** → Gaming League = lien direct
- **`creators.imuchat.app`** → Creative League = lien avec créateurs
- **`community.imuchat.app`** → Discussions, votes, retours
- **`store.imuchat.app`** → Mini-apps liées aux concours
