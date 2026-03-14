# 🎓 01 — Vision & Stratégie · ImuChat Éducation

> **Document :** Vision produit, positionnement et analyse concurrentielle
> **Cible :** Fondateurs, Product Managers, équipe commerciale

---

## 1. Constat & Opportunité

### Le problème actuel dans l'éducation française et européenne

Les établissements scolaires utilisent aujourd'hui un empilement d'outils déconnectés et souvent non conformes :

| Outil actuel | Usage | Problème |
|---|---|---|
| Pronote / Skolengo | ENT (notes, absences, cahier de texte) | Vieillissant, peu collaboratif, pas de bureautique intégrée |
| Microsoft Teams Education | Visio + partage de fichiers | Non souverain, données hors UE, coût élevé |
| Google Classroom | Devoirs + documents | Non RGPD, dépendance GAFAM |
| WhatsApp / Discord | Communication informelle parents-enseignants | Illégal RGPD, non sécurisé, aucun contrôle |
| WeTransfer / Google Drive | Partage de fichiers | Hors UE, pas de contrôle de rétention |

**Résultat :** un enseignant jongle entre 4 à 6 applications différentes. Les parents ne savent plus où regarder. Les élèves utilisent leurs propres outils en contournant l'établissement.

### L'opportunité

Le marché des ENT en France représente des dizaines de milliers d'établissements. La directive NIS2 et le Règlement européen sur l'IA (AI Act) vont forcer les établissements à migrer vers des solutions souveraines. **Aucun acteur européen ne propose aujourd'hui une solution unifiée ENT + bureautique + IA.**

---

## 2. Proposition de valeur

### Pour les établissements

> "Une seule plateforme souveraine qui remplace Pronote, Teams Education, Google Classroom et Google Drive. Conforme RGPD dès le premier jour."

- Zéro donnée hors Union Européenne
- Conformité RGPD et DSA pour les mineurs native (architecture age-tier ImuChat)
- Un seul contrat, une seule facture, un seul support
- Intégration avec les ENT existants (Pronote, Skolengo) via LTI et API

### Pour les enseignants

> "Créez vos cours, suivez vos élèves, collaborez avec vos collègues — tout dans un seul outil, avec l'IA à portée de main."

- ImuDocs pour les cours collaboratifs
- Alice IA pour générer des exercices, corriger des copies, adapter le niveau
- Messagerie intégrée avec les parents et les élèves
- Emploi du temps synchronisé avec l'agenda personnel

### Pour les élèves

> "Ton espace de travail numérique, avec l'IA qui t'aide à comprendre — pas à tricher."

- Accès gratuit à ImuOffice complet
- Alice tuteur adaptatif disponible 24h/24
- Environnement sécurisé, sans publicité, sans tracking comportemental
- Interface adaptée à l'âge (tier KIDS/JUNIOR/TEEN selon l'âge)

### Pour les parents

> "Suivez la vie scolaire de vos enfants en un coup d'œil, communiquez directement avec les enseignants."

- Carnet de liaison numérique en temps réel
- Notifications absences, notes, devoirs
- Communication directe sécurisée avec les enseignants
- Dashboard de suivi de l'activité numérique de l'enfant (ImuGuardian)

---

## 3. Positionnement concurrentiel

### Matrice de positionnement

| Critère | ImuChat Éducation | Pronote | Teams Education | Google Classroom | Moodle |
|---|:---:|:---:|:---:|:---:|:---:|
| **Souveraineté UE** | ✅ | ✅ (FR) | ❌ | ❌ | ✅ (self-hosted) |
| **RGPD natif** | ✅ | ⚠️ | ⚠️ | ❌ | ⚠️ |
| **Bureautique intégrée** | ✅ ImuOffice | ❌ | ✅ (M365) | ✅ (G Suite) | ❌ |
| **IA pédagogique** | ✅ Alice | ❌ | ⚠️ Copilot (payant) | ⚠️ Gemini (limité) | ❌ |
| **Communication parents** | ✅ | ✅ | ⚠️ | ⚠️ | ❌ |
| **Messagerie instantanée** | ✅ | ⚠️ | ✅ Teams | ⚠️ | ❌ |
| **Visioconférence** | ✅ WebRTC | ❌ | ✅ | ✅ Meet | ⚠️ |
| **Emploi du temps** | ✅ | ✅ | ❌ | ❌ | ⚠️ plugin |
| **Notes & absences** | ✅ | ✅ | ❌ | ⚠️ | ⚠️ plugin |
| **Store mini-apps** | ✅ | ❌ | ⚠️ Teams Apps | ⚠️ | ✅ Moodle plugins |
| **Interface mobile native** | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| **Prix** | 💰 Bas | 💰💰 Moyen | 💰💰💰 Élevé | 💰 (mais tracking) | 💰 (maintenance) |

### Différenciateurs clés

**1. Tout-en-un sans compromis**
ImuChat Éducation est le seul produit qui combine ENT + bureautique collaborative + messagerie + IA dans une seule plateforme souveraine. Pas besoin de jongler entre Pronote pour les notes et Teams pour les cours.

**2. Alice IA vraiment pédagogique**
Contrairement à Copilot (Microsoft) ou Gemini (Google), Alice IA est conçue pour l'éducation : elle aide à comprendre sans donner les réponses directement, génère des exercices adaptés au niveau de l'élève, et respecte la vie privée (pas de données envoyées vers des serveurs américains).

**3. Architecture age-tier native**
ImuChat a déjà une architecture de segmentation par âge (KIDS/JUNIOR/TEEN/ADULT) avec consentement parental, contrôle parental (ImuGuardian) et feature flags par tranche d'âge. Aucun concurrent ne propose cela nativement.

**4. Interopérabilité sans lock-in**
ImuChat s'intègre avec les ENT existants (Pronote, Skolengo) plutôt que de les remplacer brutalement. Les établissements peuvent migrer progressivement.

---

## 4. Cibles et segments

### Segmentation des établissements

| Segment | Taille | Besoins prioritaires | Approche commerciale |
|---|---|---|---|
| **Écoles primaires** (CP→CM2) | ~45 000 en France | Communication parents, suivi simple, interface KIDS | Déploiement via académies |
| **Collèges** | ~7 000 | Emploi du temps, notes, absences, devoirs, JUNIOR | Contrat établissement |
| **Lycées** | ~4 500 | Bac/orientation, projets collaboratifs, TEEN | Contrat établissement |
| **Universités** | ~250 | SSO Shibboleth, recherche, projets inter-campus | Contrat université |
| **Grandes écoles** | ~300 | Projets, alumni, networking, premium | Contrat personnalisé |
| **Centres de formation** (CFA, etc.) | ~2 500 | Alternance, suivi employeurs, modules métier | Self-service + support |

### Segmentation des utilisateurs

| Profil | Volume estimé | Besoins |
|---|---|---|
| **Élèves (7-17 ans)** | 12M en France | Interface simple, IA aide devoirs, devoirs, emploi du temps |
| **Étudiants (18+)** | 2,9M en France | Bureautique complète, collaboration, Alice sans restrictions |
| **Enseignants** | 870 000 en France | Création de cours, notes, corrections, communication |
| **Parents** | ~20M en France | Suivi enfant, communication enseignants, notifications |
| **Direction / Admin** | ~55 000 | Gestion établissement, statistiques, conformité |
| **Chercheurs** | ~150 000 | ImuDrive partagé, collaboration internationale, publications |

---

## 5. Modèle économique

| Plan | Cible | Prix | Inclus |
|---|---|---|---|
| **Étudiant** | Étudiants vérifiés (.edu) | Gratuit | ImuOffice complet, Alice IA, 50 Go ImuDrive |
| **Enseignant** | Enseignants vérifiés | Gratuit | Outils pédagogiques, Alice sans limite |
| **École** | Écoles primaires et collèges | 2 €/élève/an | ENT complet, modules core, support standard |
| **Lycée** | Lycées et lycées professionnels | 2,50 €/élève/an | ENT + modules orientation + Alice Éducation |
| **Université** | Campus entier | Sur devis (≈1 €/étudiant/an) | ENT + SSO Shibboleth + admin + SLA |
| **Recherche** | Labos & équipes recherche | Gratuit | ImuDrive 1 To, collaboration internationale |
| **On-Premise** | Académies, ministère | Sur devis | Hébergement sur infrastructure client, conformité SecNumCloud |

### Revenus complémentaires

- **Modules premium éducation** dans l'ImuStore (outils métier, langues, prépa concours)
- **Formation & déploiement** (intégration avec SI académiques, migration données depuis Pronote)
- **API partenaires** (éditeurs de manuels scolaires, plateformes MOOC)

---

## 6. Stratégie de déploiement

### Go-to-market en 3 étapes

**Étape 1 — Pilotes (mois 1-6)**
Recruter 5 à 10 établissements pilotes volontaires (mix collège / lycée / université) en échange d'un accès gratuit la première année et d'un accompagnement prioritaire. Objectif : validation produit, retours terrain, cas d'usage réels.

**Étape 2 — Académies (mois 7-18)**
Contacter les DSI des académies régionales. Une académie peut représenter des centaines d'établissements. Présenter les certifications RGPD, la conformité DSA, et l'hébergement souverain. Préparer un dossier de marché public.

**Étape 3 — National & Europe (mois 19+)**
S'appuyer sur les succès des académies pour adresser le niveau national (MEN, MENJ) et les marchés européens francophones (Belgique, Suisse, Luxembourg, Maroc).

### Partenariats stratégiques

- **Éditeurs de manuels scolaires** (Hachette, Nathan, Magnard) → intégration de leurs ressources dans ImuDrive Éducation
- **Prestataires ENT existants** (Kosmos / Skolengo, Index-Education / Pronote) → mode widget / API pour migration douce
- **Académies numériques** (DANE — Délégués Académiques au Numérique Éducatif) → ambassadeurs institutionnels
- **Associations enseignants** → feedback produit et adoption organique
