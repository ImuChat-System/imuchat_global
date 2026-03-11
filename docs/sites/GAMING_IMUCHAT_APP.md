# 🎮 gaming.imuchat.app — Gaming Hub

> Landing page du Gaming Hub ImuChat : catalogue de jeux, profils gaming, voice chat, communautés.

---

## 🎯 Objectif Stratégique

**Attirer les gamers qui ne connaissent pas encore ImuChat** et les convaincre que c'est une alternative crédible à Discord pour le gaming. Le site présente l'expérience gaming intégrée : jeux, voice chat, communautés, streaming, profils.

---

## 📋 Fiche d'identité

| Champ | Valeur |
|---|---|
| **Sous-domaine** | `gaming.imuchat.app` |
| **Type** | Landing page produit Gaming |
| **Cibles principales** | Gamers, communautés e-sport, streamers, studios indés |
| **Priorité** | 🟡 Moyenne |
| **Lien écosystème** | `arena.imuchat.app`, `community.imuchat.app` |
| **Framework** | Next.js 14 (App Router) |
| **i18n** | FR, EN, JA |

---

## 🧭 Arborescence des pages

```
gaming.imuchat.app
├── /                     → Page d'accueil (Hero gaming + features)
├── /features             → Fonctionnalités gaming détaillées
├── /games                → Catalogue de mini-jeux intégrés
├── /voice                → Voice chat gaming (salons, push-to-talk)
├── /communities          → Communautés gaming (guildes, clans)
├── /streaming            → Streaming & clips
├── /profiles             → Profils gaming & connexions plateformes
├── /compare              → Comparatif vs Discord / Guilded
├── /about                → À propos du Gaming Hub
└── /legal                → Mentions légales
```

---

## 📄 Détail des pages

### 🏠 `/` — Page d'accueil Gaming

**Sections** :
1. **Hero** — "Game. Chat. Dominate." + visuel interface gaming (sombre, néon)
2. **Pourquoi ImuChat Gaming ?** — "Discord + mini-jeux + économie + IA, en une seule app"
3. **Features highlight** — 6 cards : Voice Chat, Mini-Jeux, Communautés, Streaming, Profils, Tournois
4. **Mini-jeux populaires** — Carousel de 5-6 jeux intégrés (screenshots + noms)
5. **Amis en jeu** — Démo de la feature "Friends Playing" (voir qui joue à quoi)
6. **Connexions** — Logos : Steam, PlayStation, Xbox, Nintendo, Epic, Riot, Battle.net
7. **CTA** — "Rejoindre le gaming hub" / "Télécharger ImuChat"

### ⚡ `/features` — Fonctionnalités gaming

**Liste complète** :

| Feature | Description |
|---|---|
| **🎙️ Voice Chat Premium** | Salons vocaux persistants, push-to-talk, réduction de bruit IA, spatial audio |
| **🎮 Mini-Jeux Intégrés** | Quiz, dessin, battle royale 2D, word games, coop — jouables sans quitter le chat |
| **👥 Guildes & Clans** | Création de guildes avec rôles, channels, événements, recrutement |
| **📺 Streaming Natif** | Stream en direct depuis l'app, clips 30s, intégration Twitch/YouTube/Kick |
| **🏆 Tournois** | Bracket, round robin, système de matchmaking — lié à ImuArena |
| **👤 Profils Gaming** | Jeux favoris, stats, rangs, badges, trophées, historique |
| **🔗 Connexions Plateforme** | Link Steam, PSN, Xbox, Nintendo, Epic, Riot, Battle.net — statut cross-platform |
| **🤖 IA Gaming** | Alice gaming : matchmaking intelligent, coaching, recommandations, équipes équilibrées |
| **🛒 Gaming Store** | Section dédiée dans le Store : jeux, mods, skins, outils |
| **📊 Stats & Analytics** | Temps de jeu, winrate, progression, comparaison amis |

### 🕹️ `/games` — Catalogue mini-jeux

**Catégories** :
- **Party Games** — Quiz, Pictionary, trivia (jouables en groupe chat)
- **Battle Royale 2D** — Mini battle royale casual
- **Coop** — Jeux coopératifs (puzzle, escape room virtuelle)
- **Compétitif** — 1v1 (échecs, go, combat cards)
- **Créatif** — Sandbox, pixel art collaboratif

**Format par jeu** :
- Screenshot + Description courte
- Nombre de joueurs (solo / 2-4 / 4-16)
- Tags : casual, compétitif, créatif, social
- Note & popularité
- "Jouer dans ImuChat" (deep link)

### 🎙️ `/voice` — Voice Chat Gaming

**Contenu** :
- Salons vocaux persistants (type Discord)
- Push-to-talk & détection de voix
- Réduction de bruit IA (même en environnement bruyant)
- Audio spatial 3D (optionnel, pour jeux compatibles)
- Partage de musique dans le salon
- Modération : mute, kick, limites de participants
- Intégration jeux : overlay vocal, qui parle en jeu

### 👥 `/communities` — Communautés gaming

**Contenu** :
- Création de serveurs gaming (équivalent serveurs Discord)
- Channels texte + vocaux + médias
- Système de rôles et permissions
- Recrutement : "Cherche joueurs pour..."
- Événements programmés (raids, sessions, soirées)
- Intégration ImuArena pour les tournois communautaires
- Bots & automatisation (annonces, modération, webhooks)

### 📺 `/streaming` — Streaming & Clips

**Contenu** :
- Streaming natif depuis l'app (écran, jeu, webcam)
- Clips de 15-60 secondes (partageables dans le chat et sur ImuFeed)
- Watch party : regarder ensemble un stream/une vidéo en sync
- Intégrations : Twitch, YouTube Gaming, Kick (affichage statut + lien)
- Réactions en direct (emotes, ImuCoins gifts pendant les lives)

### 👤 `/profiles` — Profils gaming

**Contenu** :
- Carte de profil visuelle (avatar, bannière, rang)
- Jeux favoris (liés aux plateformes connectées)
- Statistiques agrégées (temps de jeu, genres préférés)
- Badges & trophées (système RPG ImuChat)
- "Currently playing" (statut automatique via connexions plateforme)
- Comparaison avec amis

### ⚖️ `/compare` — Vs Discord / Guilded

| Critère | ImuChat Gaming | Discord | Guilded |
|---|:---:|:---:|:---:|
| Voice chat | ✅ | ✅ | ✅ |
| Mini-jeux intégrés | ✅ | 🟡 (Activities) | ❌ |
| Économie intégrée (ImuCoins) | ✅ | ❌ | ❌ |
| Suite bureautique | ✅ (ImuOffice) | ❌ | ❌ |
| IA gaming (Alice) | ✅ | ❌ | ❌ |
| Connexions multi-plateforme | ✅ | 🟡 | 🟡 |
| Tournois natifs | ✅ (ImuArena) | ❌ | ✅ |
| Streaming natif | ✅ | ✅ | ❌ |
| Store d'extensions | ✅ | 🟡 (Bots) | ❌ |
| Profils gaming riches | ✅ | 🟡 | ✅ |
| RGPD natif | ✅ | ❌ | ❌ |

---

## 🎨 Design System

- **Palette** : Noir profond (#0A0A0A) + Violet néon (#A855F7) + Cyan (#06B6D4) + accents RGB
- **Ambiance** : Gaming premium, dark mode obligatoire, effets glow/neon
- **Animations** : Particules, pulse effects, transitions fluides
- **Typographie** : Inter (texte) + police gaming display pour titres

### Composants spécifiques

- `GameCard` — Carte mini-jeu (screenshot, joueurs, tags)
- `VoiceChannel` — Visualisation salon vocal (utilisateurs connectés)
- `GuildCard` — Carte communauté (nom, membres, jeux, recrutement)
- `ProfileCard` — Carte profil gaming (avatar, rang, stats)
- `PlatformBadge` — Badge plateforme (Steam, PSN, Xbox…)
- `StreamPreview` — Preview de stream en cours
- `ComparisonTable` — Tableau comparatif animé

---

## 📅 Roadmap d'implémentation

### Phase 1 (Semaines 1-2)
- [ ] Page `/` — Home gaming (dark theme)
- [ ] Page `/features` — Features détaillées
- [ ] Page `/games` — Catalogue mock
- [ ] Page `/compare` — Comparatif Discord

### Phase 2 (Semaines 3-4)
- [ ] Pages `/voice`, `/communities`, `/streaming`, `/profiles`
- [ ] Traductions FR/EN
- [ ] OG images gaming

### Phase 3 (Semaines 5-6)
- [ ] Données dynamiques (jeux réels, stats)
- [ ] Deep links vers l'app
- [ ] Traduction JA
- [ ] SEO gaming keywords

---

## 🔗 Liens avec l'écosystème

- **`arena.imuchat.app`** → Tournois et compétitions gaming
- **`store.imuchat.app`** → Section gaming du Store
- **`community.imuchat.app`** → Forum communautaire gaming
- **`creators.imuchat.app`** → Streamers et créateurs gaming
