# MVP Phase 5 — Nice-to-Have & Écrans secondaires

> **Début** : Après Phase 4 (ImuCompanion IC-W1→W4 complets)  
> **Durée estimée** : À définir selon priorités  
> **Objectifs** : Compléter l'expérience utilisateur avec les fonctionnalités secondaires et écrans restants

---

## 1. Écrans & fonctionnalités secondaires identifiés

### 1.1 Expérience multimédia

| Fonctionnalité | Description | Priorité | Effort est. |
|----------------|-------------|:--------:|:-----------:|
| **Picture-in-Picture (PiP)** | Appels vidéo en PiP pendant navigation, mini-player flottant | 🟡 P1 | 2j |
| **Beauty filter AI + blur** | Filtres temps réel en appel vidéo (flou fond, lissage, éclairage) | 🟢 P2 | 3j |
| **Fonds animés conversations** | Arrière-plans animés pour le chat (thèmes, saisons, custom) | 🟢 P2 | 1.5j |
| **Création stickers** | Éditeur de stickers custom (crop, text overlay, filters) | 🟢 P2 | 2j |
| **Packs icônes/sons téléchargeables** | Store de packs notification sounds + app icons | 🟢 P2 | 1.5j |

### 1.2 Profils & personnalisation

| Fonctionnalité | Description | Priorité | Effort est. |
|----------------|-------------|:--------:|:-----------:|
| **Multi-profils** | Avoir plusieurs profils par compte (perso, pro, gaming…) | 🟡 P1 | 3j |
| **Police custom par conversation** | Choix de la police d'affichage par conversation | 🟢 P2 | 0.5j |
| **Avatar 3D personnalisable** | Éditeur d'avatar 3D intégré (au-delà de Live2D companion) | 🟢 P2 | 5j |
| **Thèmes créés par la communauté** | Marketplace de thèmes UI créés par les utilisateurs | 🟢 P2 | 3j |

### 1.3 Productivité & outils

| Fonctionnalité | Description | Priorité | Effort est. |
|----------------|-------------|:--------:|:-----------:|
| **Mini-blogs** | Espace blog intégré au profil utilisateur (posts longs, rich text) | 🟡 P1 | 3j |
| **Board collaboratif** | Tableau blanc type Miro/FigJam intégré (dessin, post-its, flux) | 🟡 P1 | 5j |
| **Suivi colis** | Intégration tracking colis (API transporteurs) | 🟢 P2 | 2j |
| **Annuaire services publics** | Répertoire des services publics (par pays, catégories) | 🟢 P2 | 1.5j |
| **Cooking & Home** | Module recettes, gestion courses, planification repas | 🟢 P2 | 3j |

### 1.4 Sécurité & administration

| Fonctionnalité | Description | Priorité | Effort est. |
|----------------|-------------|:--------:|:-----------:|
| **Vérification d'identité** | Flow KYC (selfie + pièce d'identité) pour badge vérifié | 🟡 P1 | 3j |
| **Multi-fenêtres (desktop)** | Ouvrir le chat dans une fenêtre séparée (Election IPC) | 🟡 P1 | 2j |
| **Split view** | Afficher 2 conversations côte à côte | 🟡 P1 | 2j |
| **Audit trail avancé** | Journal complet des actions admin avec filtres et export | 🟢 P2 | 1.5j |

### 1.5 Social & communauté

| Fonctionnalité | Description | Priorité | Effort est. |
|----------------|-------------|:--------:|:-----------:|
| **Stories / Statuts éphémères** | Publications temporaires (24h) type Instagram Stories | 🟡 P1 | 3j |
| **Sondages enrichis** | Sondages avec images, timer, résultats graphiques | 🟢 P2 | 1.5j |
| **Événements communautaires** | Calendrier d'événements avec RSVP, rappels, récurrence | 🟡 P1 | 2j |
| **Système de mentorat** | Matching mentor/mentoré dans les communautés | 🟢 P2 | 2j |

### 1.6 ImuCompanion avancé (IC-W5 & IC-W6)

| Fonctionnalité | Description | Priorité | Effort est. |
|----------------|-------------|:--------:|:-----------:|
| **IC-W5 : Customization** | Personnalisation avatar (skins, accessoires, couleurs, taille) | 🟡 P1 | 3 sem. |
| **IC-W6 : Intelligence** | Mémoire longue, apprentissage préférences, multi-langue avancé | 🟡 P1 | 3 sem. |

---

## 2. Matrice de priorisation

```
                   IMPACT ÉLEVÉ
                       ▲
                       │
    ┌──────────────────┼──────────────────┐
    │                  │                  │
    │  PiP             │ Multi-profils    │
    │  Multi-fenêtres  │ Mini-blogs       │
    │  Split view      │ Stories          │
    │  Événements      │ Board collab.    │
    │                  │ KYC              │
    │  EFFORT FAIBLE ──┼── EFFORT ÉLEVÉ  │
    │                  │                  │
    │  Police custom   │ Beauty filter    │
    │  Sondages        │ Avatar 3D        │
    │  Packs sons      │ Cooking & Home   │
    │  Fonds animés    │ Stickers         │
    │  Audit trail     │ Suivi colis      │
    │                  │ Annuaire         │
    │                  │ Thèmes community │
    │                  │ Mentorat         │
    └──────────────────┼──────────────────┘
                       │
                   IMPACT FAIBLE
```

---

## 3. Regroupement en sprints potentiels

### Sprint A — Social enrichi (~2 sem.)

- Stories / Statuts éphémères (3j)
- Sondages enrichis (1.5j)
- Événements communautaires (2j)
- Mini-blogs (3j)

### Sprint B — Multimédia avancé (~2 sem.)

- PiP vidéo (2j)
- Beauty filter + blur (3j)
- Fonds animés conversations (1.5j)
- Création stickers (2j)

### Sprint C — Profils & personnalisation (~2 sem.)

- Multi-profils (3j)
- Police custom par conversation (0.5j)
- Packs icônes/sons (1.5j)
- Thèmes communauté (3j)

### Sprint D — Outils & productivité (~2 sem.)

- Board collaboratif (5j)
- Split view (2j)
- Multi-fenêtres desktop (2j)

### Sprint E — Sécurité avancée & utilitaires (~2 sem.)

- Vérification identité KYC (3j)
- Suivi colis (2j)
- Annuaire services publics (1.5j)
- Audit trail avancé (1.5j)
- Cooking & Home (3j)

### Sprint F — ImuCompanion IC-W5+W6 (~6 sem.)

- IC-W5 : Customization (3 sem.)
- IC-W6 : Intelligence avancée (3 sem.)

---

## 4. Notes

- L'ordre des sprints A-F est indicatif et sera défini selon les retours utilisateurs et priorités business
- Certaines fonctionnalités peuvent être implémentées en tant que **modules du Store** plutôt qu'intégrées au core
- Les efforts sont des estimations hautes, certaines tâches pourraient être plus rapides grâce aux fondations posées en Phases 2-4
- IC-W5 et IC-W6 peuvent être menés en parallèle des sprints A-E si l'équipe le permet

---

> **Phase 5 documentée le 6 mars 2026**  
> **Prérequis** : Phase 4 complète (ImuCompanion IC-W1 à IC-W4)  
> **Total estimé** : ~16 semaines (8 sprints) | ~80 jours-dev  
> **Priorité 1** : Social enrichi (Sprint A) + Multimédia (Sprint B)
