# 🎓 education.imuchat.app — ImuChat Éducation

> Déclinaison verticale pour les écoles, universités, associations et établissements d'enseignement.

---

## 🎯 Objectif Stratégique

**Devenir la plateforme de communication et collaboration de référence pour l'éducation en Europe**, en remplacement des outils américains non conformes (Google Classroom, Teams Education, Discord dans les campus).

Cibles : enseignants, administration scolaire, étudiants, parents d'élèves, associations éducatives.

---

## 📋 Fiche d'identité

| Champ | Valeur |
|---|---|
| **Sous-domaine** | `education.imuchat.app` |
| **Type** | Landing page verticale Éducation |
| **Cibles principales** | Enseignants, DSI académiques, étudiants, parents |
| **Priorité** | 🟢 Basse (après enterprise) |
| **Lien écosystème** | `enterprise.imuchat.app`, `partners.imuchat.app`, `office.imuchat.app` |
| **Framework** | Next.js 14 (App Router) |
| **i18n** | FR, EN, DE |

---

## 🧭 Arborescence des pages

```
education.imuchat.app
├── /                     → Page d'accueil (Hero éducation + offres)
├── /schools              → Offre écoles primaires & secondaires
├── /university           → Offre universités & grandes écoles
├── /students             → Offre étudiants (gratuit / réduit)
├── /teachers             → Espace enseignants (outils pédagogiques)
├── /parents              → Espace parents (suivi, communication)
├── /usecases             → Cas d'usage pédagogiques
├── /ent                  → Intégration ENT (Environnement Numérique)
├── /pricing              → Tarification éducation
├── /contact              → Contact partenariat éducatif
└── /legal                → Mentions légales
```

---

## 📄 Détail des pages

### 🏠 `/` — Page d'accueil Éducation

**Sections** :
1. **Hero** — "L'outil numérique souverain pour l'éducation." + illustration campus/classe
2. **Problème** — Outils américains non RGPD, dispersion (Teams + Discord + WhatsApp + Drive…)
3. **Solution** — ImuChat = une seule plateforme : communication + bureautique + IA + collaboration
4. **Pour qui ?** — Grille : Écoles, Universités, Étudiants, Parents, Associations
5. **Offre spéciale** — "Gratuit pour les étudiants" / "Offres dédiées établissements"
6. **Partenaires éducatifs** — Logos d'institutions pilotes
7. **CTA** — "Découvrir l'offre Éducation" / "Contacter l'équipe"

### 🏫 `/schools` — Écoles primaires & secondaires

**Contenu** :
- Communication enseignants ↔ parents sécurisée
- Groupes de classe (chat + partage fichiers)
- ImuOffice pour les travaux scolaires
- Alice IA en mode "tuteur adaptatif" (aide aux devoirs, quiz)
- Modération renforcée (contenu inapproprié, harcèlement)
- Interface simplifiée pour les plus jeunes (6-12 ans)
- Admin pour la direction : suivi, rapports, gestion comptes

### 🎓 `/university` — Universités & grandes écoles

**Contenu** :
- Communication inter-campus (chat, visio, channels thématiques)
- Groupes de TD/TP/projets avec partage de documents
- ImuOffice : rédaction collaborative de mémoires, rapports
- Alice IA : résumé de cours, aide à la recherche, correction
- Intégration SSO universitaire (Shibboleth, CAS, LDAP)
- Store d'apps académiques (emploi du temps, BU, restauration)
- Événements campus (conférences, associations, soirées)
- Gestion des alumni

### 👩‍🎓 `/students` — Offre étudiants

**Contenu** :
- **Gratuit** : accès complet à ImuChat + ImuOffice (version éducation)
- Vérification du statut étudiant (email .edu / carte étudiante)
- Stockage ImuDrive : 50 Go gratuits
- Alice IA illimité pour l'aide aux études
- Réductions sur le Store (thèmes, stickers)
- Profil étudiant (formation, promotion, campus)
- Communautés étudiantes (BDE, associations, entraide)

### 👩‍🏫 `/teachers` — Espace enseignants

**Contenu** :
- Outils de création de cours (templates ImuSlides)
- Quiz et évaluations en ligne (mini-app Store)
- Partage de ressources avec les étudiants
- Suivi de progression (tableau de bord enseignant)
- Collaboration entre enseignants (groupes inter-établissements)
- Alice IA : aide à la correction, génération d'exercices, différenciation pédagogique

### 👨‍👩‍👧 `/parents` — Espace parents

**Contenu** :
- Communication directe avec l'établissement (chat sécurisé)
- Suivi des activités numériques de l'enfant (Guardian Angel)
- Notifications : devoirs, absences, événements
- Interface simplifiée (pas besoin d'être tech-savvy)
- Contrôle parental intégré (temps d'écran, filtrage contenu)

### 📚 `/usecases` — Cas d'usage pédagogiques

**Exemples** :
- **Projet collaboratif** : 4 étudiants rédigent un mémoire avec ImuDocs, Alice corrige et résume
- **Cours à distance** : Visio intégrée + partage d'écran + enregistrement + résumé IA
- **Évaluation continue** : Quiz via mini-app, résultats automatiques, analytics enseignant
- **Communication parents-école** : Groupe de classe, annonces, suivi individuel
- **Recherche universitaire** : ImuDrive partagé entre chercheurs, indexation IA, collaboration internationale

### 🔗 `/ent` — Intégration ENT

**Contenu** :
- Compatibilité avec les ENT français (Pronote, Skolengo, Mon Bureau Numérique)
- Protocoles : LTI, SAML/OIDC, API REST
- Single Sign-On transparent pour les utilisateurs
- Synchronisation annuaires (élèves, classes, enseignants)
- Widget ImuChat intégrable dans l'ENT existant
- Documentation technique pour les DSI académiques

### 💰 `/pricing` — Tarification éducation

| Plan | Cible | Prix |
|---|---|---|
| **Étudiant** | Étudiants vérifiés | Gratuit |
| **Enseignant** | Enseignants | Gratuit (usage pédagogique) |
| **Établissement** | Écoles | 2€/élève/an |
| **Université** | Campus entier | Sur devis (dépend du nb d'étudiants) |
| **Recherche** | Labos & équipes recherche | Gratuit (usage académique) |

### ✉️ `/contact` — Contact partenariat éducatif

**Formulaire** :
- Type d'établissement
- Nombre d'élèves/étudiants
- Besoins spécifiques (ENT, SSO, hébergement)
- Calendrier de déploiement
- Interlocuteur (DSI, direction, enseignant pilote)

---

## 🎨 Design System

- **Palette** : Vert éducation (#059669) + Violet ImuChat + Blanc
- **Ton** : Chaleureux, rassurant, pédagogique
- **Illustrations** : Style "campus life", inclusif, diversifié
- **Iconographie** : Lucide + icônes éducation personnalisées

---

## 📅 Roadmap d'implémentation

### Phase 1 (Semaines 1-2)
- [ ] Page `/` — Home éducation
- [ ] Page `/students` — Offre étudiants
- [ ] Page `/pricing` — Grille tarifaire
- [ ] Page `/contact` — Formulaire

### Phase 2 (Semaines 3-4)
- [ ] Pages `/schools`, `/university`, `/teachers`, `/parents`
- [ ] Page `/usecases` — 5 cas d'usage
- [ ] Page `/ent` — Intégration ENT
- [ ] Traductions FR/EN

---

## 🔗 Liens avec l'écosystème

- **`enterprise.imuchat.app`** → Besoins IT avancés (SSO, déploiement)
- **`office.imuchat.app`** → Suite bureautique pour l'éducation
- **`alice.imuchat.app`** → Alice tuteur IA
- **`partners.imuchat.app`** → Programme partenaires éducatifs
