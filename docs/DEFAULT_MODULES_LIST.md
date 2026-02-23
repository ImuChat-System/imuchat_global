# Modules installés par défaut — ImuChat

> **Version** : 1.0  
> **Date** : 2026-02-20  
> **Objectif** : Définir la liste complète des modules activés par défaut à la première ouverture d'ImuChat, en plus des modules cœur.

---

## 1. Vue d'ensemble

ImuChat est une super-app modulaire. À la première connexion, l'utilisateur doit disposer d'une expérience riche et immédiate, sans avoir à installer manuellement des modules depuis le Store.

Les modules sont classés en 3 niveaux :

| Niveau | Description | Désinstallable ? |
|--------|-------------|------------------|
| **Core** | Indispensables au fonctionnement de l'app | ❌ Non |
| **Default** | Installés par défaut, enrichissent l'expérience | ✅ Oui |
| **Optional** | Disponibles via le Store, installation manuelle | ✅ Oui |

---

## 2. Modules Core (non désinstallables)

Ces modules constituent le socle fondamental d'ImuChat. Ils ne peuvent pas être désinstallés.

| # | Module | ID | Route | Description |
|---|--------|----|-------|-------------|
| 1 | **Chat** | `chat` | `/chat` | Messagerie texte, audio, image, vidéo, fichiers |
| 2 | **Appels** | `calls` | `/calls` | Appels audio & vidéo (compact, PiP, full-screen) |
| 3 | **Accueil** | `hometab` | `/` | Hub central, tableau de bord personnalisé |
| 4 | **Notifications** | `notifications` | — | Push, in-app, badges |
| 5 | **Store** | `store` | `/store` | Marketplace de modules, thèmes, extensions IA |
| 6 | **Thèmes** | `themes` | `/themes` | Personnalisation visuelle (Sakura, Cyber Neon…) |
| 7 | **Wallet** | `wallet` | `/wallet` | Portefeuille intégré, paiements, transactions |

---

## 3. Modules Default — Existants (déjà `defaultEnabled: true`)

Ces modules sont déjà activés par défaut et désinstallables par l'utilisateur.

| # | Module | ID | Route | Description |
|---|--------|----|-------|-------------|
| 8 | **Communautés** | `comms` | `/comms` | Groupes enrichis, espaces publics/privés |
| 9 | **Personnalisation** | `customize` | `/customize` | Paramètres de layout et préférences UI |
| 10 | **Événements** | `events` | `/events` | Agenda partagé, RSVP, tickets |
| 11 | **Aide** | `help` | `/help` | Centre d'aide, FAQ, support |
| 12 | **Musique** | `music` | `/music` | Lecteur, playlists, découverte |
| 13 | **Profil** | `profile` | `/me` | Profil social, préférences, comptes multiples |
| 14 | **Sports** | `sports` | `/sports` | Scores en direct, équipes, matchs |
| 15 | **Voom (Feed)** | `voom` | `/feed` | Feed vidéo/audio style TikTok |
| 16 | **Watch** | `watch` | `/watch` | Contenus vidéo, séries, replay |

---

## 4. Modules à ajouter par défaut (NOUVEAUX)

### Objectif

Enrichir l'expérience out-of-the-box pour que chaque nouvel utilisateur bénéficie immédiatement d'un hub de vie quotidienne complet, sans friction.

### Liste des modules à passer en `defaultEnabled: true`

| # | Module | ID | Route | Catégorie | Justification |
|---|--------|----|-------|-----------|---------------|
| 17 | **Mobility** | `mobility` | `/mobility` | Vie quotidienne | Covoiturage, gestion véhicule électrique, suivi de trajets. Essentiel dans un hub de vie quotidienne. |
| 18 | **News** | `news` | `/news` | Social & Contenus | Actualités, tendances, articles. Contenu quotidien qui fidélise les utilisateurs. |
| 19 | **Smart Home** | `smart-home` | `/home` | Vie quotidienne | Maison connectée (lumières, alarme, énergie). Complète le triptyque Mobility + Smart Home + Events pour la vie quotidienne. |
| 20 | **Social Hub** | `social-hub` | `/social` | Social & Contenus | Publications, timeline sociale, interactions. Pilier social qui enrichit le Feed (Voom). |
| 21 | **Stories** | `stories` | `/stories` | Social & Contenus | Stories éphémères type Instagram/WhatsApp. Fonctionnalité attendue par défaut dans toute app de messagerie moderne. |
| 22 | **Stickers** | `stickers` | `/stickers` | Chat enrichi | Packs de stickers, emojis animés. Extension naturelle du Chat, attendue par tous les utilisateurs. |
| 23 | **Games** | `games` | `/games` | Divertissement | Mini-jeux intégrés. Engagement quotidien, rétention utilisateur. |
| 24 | **Podcasts** | `podcasts` | `/podcasts` | Social & Contenus | Écoute de podcasts, abonnements. Complète l'offre audio (Musique + Podcasts). |
| 25 | **Download** | `download` | `/downloads` | Utilitaire | Gestionnaire de téléchargements. Utilitaire transversal nécessaire pour les médias (vidéos, musique, docs). |

---

## 5. Récapitulatif complet — Tous les modules par défaut

### Par catégorie

#### 🔒 Core (7 modules)
- Chat, Appels, Accueil, Notifications, Store, Thèmes, Wallet

#### 💬 Communication & Social (5 modules)
- Communautés, Social Hub, Stories, Stickers, Voom (Feed)

#### 📰 Contenus & Média (5 modules)
- News, Musique, Podcasts, Watch, Download

#### 🏠 Vie quotidienne (3 modules)
- Mobility, Smart Home, Événements

#### 🎮 Divertissement (2 modules)
- Games, Sports

#### ⚙️ Utilitaires (3 modules)
- Profil, Personnalisation, Aide

### Tableau de synthèse

| # | Module | ID | Core ? | Désinstallable ? | Statut actuel |
|---|--------|----|--------|------------------|---------------|
| 1 | Chat | `chat` | ✅ | ❌ | ✅ Déjà default |
| 2 | Appels | `calls` | ✅ | ❌ | ✅ Déjà default |
| 3 | Accueil | `hometab` | ✅ | ❌ | ✅ Déjà default |
| 4 | Notifications | `notifications` | ✅ | ❌ | ✅ Déjà default |
| 5 | Store | `store` | ✅ | ❌ | ✅ Déjà default |
| 6 | Thèmes | `themes` | ✅ | ❌ | ✅ Déjà default |
| 7 | Wallet | `wallet` | ✅ | ❌ | ✅ Déjà default |
| 8 | Communautés | `comms` | — | ✅ | ✅ Déjà default |
| 9 | Personnalisation | `customize` | — | ✅ | ✅ Déjà default |
| 10 | Événements | `events` | — | ✅ | ✅ Déjà default |
| 11 | Aide | `help` | — | ✅ | ✅ Déjà default |
| 12 | Musique | `music` | — | ✅ | ✅ Déjà default |
| 13 | Profil | `profile` | — | ✅ | ✅ Déjà default |
| 14 | Sports | `sports` | — | ✅ | ✅ Déjà default |
| 15 | Voom (Feed) | `voom` | — | ✅ | ✅ Déjà default |
| 16 | Watch | `watch` | — | ✅ | ✅ Déjà default |
| 17 | **Mobility** | `mobility` | — | ✅ | 🆕 À activer |
| 18 | **News** | `news` | — | ✅ | 🆕 À activer |
| 19 | **Smart Home** | `smart-home` | — | ✅ | 🆕 À activer |
| 20 | **Social Hub** | `social-hub` | — | ✅ | 🆕 À activer |
| 21 | **Stories** | `stories` | — | ✅ | 🆕 À activer |
| 22 | **Stickers** | `stickers` | — | ✅ | 🆕 À activer |
| 23 | **Games** | `games` | — | ✅ | 🆕 À activer |
| 24 | **Podcasts** | `podcasts` | — | ✅ | 🆕 À activer |
| 25 | **Download** | `download` | — | ✅ | 🆕 À activer |

**Total : 25 modules par défaut** (7 Core + 9 Default existants + 9 nouveaux)

---

## 6. Modules restant optionnels (via le Store)

Ces modules restent installables à la demande via le Store :

| Module | ID | Catégorie | Raison |
|--------|----|-----------|--------|
| Admin | `admin` | Système | Réservé aux administrateurs |
| Contests | `contests` | Divertissement | Contenu événementiel, pas quotidien |
| Creator Studio | `creator-studio` | Créativité | Public créateurs, pas grand public |
| Dating | `dating` | Social | Sensible (vie privée), opt-in uniquement |
| Finance | `finance` | Pro | Nécessite configuration bancaire |
| Formations | `formations` | Éducation | Public étudiant/pro spécifique |
| Library | `library` | Utilitaire | Dépendance technique, pas orienté user |
| Resources | `resources` | Utilitaire | Contenu spécialisé |
| Services | `services` | Marketplace | Baby-sitter, plombier… marché local |
| Style & Beauty | `style-beauty` | Lifestyle | Public niche |
| Worlds | `worlds` | Expérimental | Fonctionnalité exploratoire 3D/metaverse |

---

## 7. Actions techniques requises

Pour activer les 9 nouveaux modules par défaut, il faut modifier leur `manifest.json` :

```json
// Changements à appliquer dans chaque manifest.json :
{
  "defaultEnabled": true,    // ← passer de false à true
  "allowUninstall": true     // ← s'assurer que c'est désinstallable
}
```

### Fichiers à modifier :

1. `web-app/src/modules/mobility/manifest.json`
2. `web-app/src/modules/news/manifest.json`
3. `web-app/src/modules/smart-home/manifest.json`
4. `web-app/src/modules/social-hub/manifest.json`
5. `web-app/src/modules/stories/manifest.json`
6. `web-app/src/modules/stickers/manifest.json`
7. `web-app/src/modules/games/manifest.json`
8. `web-app/src/modules/podcasts/manifest.json`
9. `web-app/src/modules/download/manifest.json`

> ⚠️ **Note** : Certains modules ont des `dependencies` (ex: `mobility` → `smart-home`, `stickers` → `chat`, `podcasts` → `library`). S'assurer que les dépendances sont satisfaites par les modules default ou mettre à jour la résolution automatique.

---

## 8. Dépendances à vérifier

| Module | Dépendance(s) | Statut dépendance |
|--------|---------------|-------------------|
| Mobility | `smart-home` | 🆕 Sera default |
| News | `profile` | ✅ Déjà default |
| Smart Home | `family-hub` | ⚠️ Module non existant (à créer ou retirer la dépendance) |
| Social Hub | `profile` | ✅ Déjà default |
| Stories | `profile` | ✅ Déjà default |
| Stickers | `chat` | ✅ Core |
| Games | `profile` | ✅ Déjà default |
| Podcasts | `library` | ⚠️ `library` est optional (à rendre default ou retirer la dépendance) |
| Download | aucune | ✅ OK |

### Points d'attention :
1. **`smart-home`** dépend de `family-hub` qui n'existe pas encore → à créer ou retirer la dépendance
2. **`podcasts`** dépend de `library` qui est optional → soit rendre `library` default, soit retirer la dépendance

---

*Document généré pour planification. Les modifications techniques (manifest.json) seront appliquées après validation.*
