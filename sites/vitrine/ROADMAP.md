# Roadmap Site Vitrine - Version Professionnelle

Ce document détaille la feuille de route pour faire évoluer le site vitrine MVP actuel vers une plateforme **professionnelle, crédible et performante**, alignée avec la vision "Super-App Européenne & Future-Ready Japan".

**Objectif clé :** Le site doit être une carte de visite stratégique pour PeeL, incubateurs, universités, partenaires et investisseurs.

---

## 🧭 Arborescence Cible

Structure validée pour inspirer confiance et sérieux :

- `/` (Home)
- `/product` (Vision Produit)
- `/features` (Fonctionnalités Clés)
- `/ai` (Intelligence Artificielle)
- `/developers` (Écosystème & API)
- `/partners` (Institutionnel & B2B)
- `/about` (Qui sommes-nous)
- `/news` (Actualités)
- `/contact` (Contact Pro)
- `/privacy` (Légal & RGPD)

---

## Phase 1 : Fondations & Identité (Immédiat)

**Objectif :** Poser les bases graphiques pour un effet "Whaou" et définir le message.

- [x] **Internationalisation (i18n)** (Architecture) ✅
  - [x] Mettre en place la structure i18n (Next-intl / in-app routing) dès maintenant pour éviter le refactoring.
  - [x] Préparer le support FR / EN / ES / DE / JP.
- [ ] **Définition du Messaging** (Priorité 1)
  - [ ] Définir le slogan officiel ImuChat.
  - [ ] Rédiger le "Elevator Pitch" (ImuChat en 1 phrase).
- [x] **Design System "ImuChat Premium"** ✅
  - [x] Palette : Blanc dominant, Deep Indigo/Purple en accent, Slate pour les textes.
  - [x] **Touche "Kawaii"** : Utiliser les tokens `secondary` (Sakura Pink) par touches subtiles (dégradés, targets Famille/Perso) pour le rappel "Japon/Anime" sans perdre le sérieux.
  - [x] Typographie : Inter ou Geist Sans (moderne, lisible, internationale).
  - [x] Iconographie : Set SVG custom ou librairie premium (Lucide/Heroicons).
  - [ ] Illustrations : Style isométrique ou 3D propre (pas de "Corporate Memphis" générique).

## Phase 2 : Pages "Produit & Vision" (Court Terme)

**Objectif :** Expliquer ce qu'est ImuChat au-delà d'une messagerie.

- [x] **Page `/product` (La Vision)** ✅
  - [x] Expliquer le concept de "Super-application" (Architecture modulaire).
  - [x] Scénarios d'usage : Étudiant, Famille, Organisation.
  - [x] Section : "Plus qu'une messagerie, une plateforme".
- [x] **Page `/features` (Le Concret)** ✅
  - [x] **Sélection des 50 fonctionnalités clés** (voir `docs/FUNCTIONNALITIES_LIST.md`) :
    - [x] Communication : Messagerie, Appels Audio/Vidéo.
    - [x] Personnalisation : Thèmes, Profils multiples.
    - [x] Mini-Apps : Stories, Groupes, Événements.
    - [x] Services : Transports, Services Publics.
  - [x] Mise en page claire : Grilles de fonctionnalités avec icônes.
- [x] **Page `/ai` (L'Intelligence)** ✅
  - [x] Présenter l'IA contextuelle et les assistants spécialisés.
  - [x] Rassurer sur le respect des données (Privacy-first AI).

## Phase 3 : Pages "Écosystème & Crédibilité" (Moyen Terme)

**Objectif :** Montrer l'ouverture et la solidité du projet aux partenaires.

- [x] **Page `/developers`** ✅
  - [x] Présenter le concept de Mini-apps & Store.
  - [x] Teasing API & SDK.
  - [x] Message : "ImuChat est une plateforme ouverte".
- [ ] **Page `/partners` (Stratégique PeeL)**
  - [ ] Cibles : Universités, Collectivités, Associations.
  - [ ] Appel à l'action : "Devenir partenaire pilote".
  - [ ] Cases d'usage co-construction services publics.
- [x] **Page `/about`** ✅
  - [x] Origine du projet, Vision Europe -> Japon.
  - [x] L'équipe & les valeurs.
- [ ] **Page `/news`**
  - [ ] Timeline du projet (Avancée MVP, Sélection PeeL, Bêta).
  - [ ] Montrer que le projet est vivant.

## Phase 4 : Conversion & Légal (Indispensable)

**Objectif :** Convertir et protéger.

- [x] **Page `/contact`** ✅
  - [x] Formulaire segmenté (Partenariat / Presse / Bêta).
- [x] **Pages Légales** (Partiellement complété)
  - [x] `/privacy` - Politique de confidentialité RGPD stricte. ✅
  - [ ] `/terms` - Conditions Générales d'Utilisation (CGU).
  - [ ] `/legal` - Mentions légales complètes.

## Phase 5 : Excellence Technique & Internationalisation

**Objectif :** Performance et Scale.

- [x] **Internationalisation (i18n)** (Partiellement complété)
  - [x] Architecture pour supporter FR / EN / JP (Japonais). ✅
  - [x] Traduction des contenus clés FR/EN. ✅
  - [ ] Traduction complète DE / ES / JA.
- [x] **SEO & Performance** (Largement complété) ✅
  - [x] SEO sémantique et Meta tags pour chaque page. ✅
  - [x] Sitemap XML dynamique multilingue. ✅
  - [x] Robots.txt et Manifest PWA. ✅
  - [x] JSON-LD structured data. ✅
  - [ ] Optimisation Lighthouse (Score > 95).
  - [ ] Accessibilité WCAG 2.1 AA.
