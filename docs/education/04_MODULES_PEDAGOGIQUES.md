# 📖 04 — Modules Pédagogiques · ENT ImuChat Éducation

> **Document :** Spécification fonctionnelle de tous les modules ENT
> **13 modules · Du cahier de texte au carnet de liaison numérique**

---

## Vue d'ensemble des modules

| # | Module | Description | Rôles principaux | Priorité |
|---|---|---|---|:---:|
| 01 | **Emploi du temps** | Planning des cours, salles, enseignants | Tous | 🔴 |
| 02 | **Cahier de texte numérique** | Contenu des cours, progression | Enseignants, élèves | 🔴 |
| 03 | **Devoirs** | Assignation, rendu, correction | Enseignants, élèves | 🔴 |
| 04 | **Notes & évaluations** | Saisie, bulletins, compétences | Enseignants, direction | 🔴 |
| 05 | **Absences & vie scolaire** | Appel, justification, alertes parents | CPE, enseignants, parents | 🔴 |
| 06 | **Communication parents** | Carnet de liaison numérique, messagerie | Tous | 🔴 |
| 07 | **Ressources pédagogiques** | ImuDrive éducation, bibliothèque de cours | Enseignants, élèves | 🟠 |
| 08 | **Visioconférence éducation** | Cours à distance, permanences, réunions | Tous | 🟠 |
| 09 | **Projets collaboratifs** | Travaux de groupe avec ImuDocs/ImuBoard | Enseignants, élèves | 🟠 |
| 10 | **Orientation & parcours** | Stages, orientation, portfolio élève | Lycéens, enseignants | 🟡 |
| 11 | **Vie associative & events** | BDE, clubs, événements campus | Étudiants, direction | 🟡 |
| 12 | **Analytics pédagogiques** | Dashboard progression, alertes | Enseignants, direction | 🟠 |
| 13 | **Admin ENT** | Gestion établissement, paramètres, RGPD | Direction, admin | 🔴 |

---

## Module 01 — Emploi du temps

### Fonctionnalités

**Vue enseignant**
- Emploi du temps personnel de la semaine (vue semaine / jour)
- Couleurs par matière configurables
- Indication des salles disponibles
- Vue sur l'emploi du temps de ses classes
- Signalement d'indisponibilité / remplacement

**Vue élève / étudiant**
- Emploi du temps de sa classe (web + mobile)
- Synchronisation avec le calendrier du téléphone (iCal / .ics export)
- Notifications push pour les changements de salle ou annulation de cours
- Mode hors-ligne (cache 7 jours)

**Vue direction / admin**
- Tableau de bord global : toutes les classes, tous les enseignants
- Gestion des salles (capacité, équipements)
- Détection des conflits (double réservation)
- Import depuis Pronote ou fichier CSV
- Export PDF / impression

**Intégrations**
- Import automatique depuis Pronote via API partenaire
- Export `.ics` (Google Calendar, Apple Calendar, Outlook)
- Widget ImuChat Home : prochains cours du jour

### Modèle de données clé

```typescript
interface TimetableSlot {
  id: string;
  organizationId: string;
  classId: string;
  teacherId: string;
  subject: string;
  subjectCode: string;         // ex: "MATHS", "FR", "HG"
  roomId: string;
  startTime: Date;
  endTime: Date;
  recurrence: 'weekly' | 'biweekly' | 'once';
  recurrenceUntil?: Date;
  isCancelled: boolean;
  cancellationReason?: string;
  substituteTeacherId?: string;
}
```

---

## Module 02 — Cahier de texte numérique

### Fonctionnalités

**Pour l'enseignant**
- Saisie du contenu de chaque cours (éditeur riche TipTap — intégration ImuDocs)
- Indication du travail fait en classe vs. à faire à la maison
- Attachement de ressources (documents ImuDrive, liens, vidéos)
- Progression pédagogique : liaison avec les séquences du programme
- Historique complet de l'année par classe et par matière
- Tampons rapides : "Cours terminé", "Exercices corrigés", "Contrôle rendu"

**Pour l'élève**
- Lecture du contenu de chaque cours par date et par matière
- Vue "ce que j'ai raté" en cas d'absence (contenu de cours accessible)
- Fil d'actualité : derniers cours mis à jour
- Notifications push quand l'enseignant met à jour le cahier de texte

**Pour les parents**
- Consultation du cahier de texte de leur enfant
- Alertes si des cours n'ont pas encore été saisis (retard enseignant)
- Vue par matière ou par semaine

**Liens avec d'autres modules**
- **Devoirs** : les devoirs apparaissent automatiquement dans le cahier de texte
- **Ressources** : les fichiers partagés depuis ImuDrive s'affichent inline
- **Absences** : indication visuelle pour les cours manqués

---

## Module 03 — Devoirs

### Fonctionnalités

**Assignation (enseignant)**
- Créer un devoir : titre, consignes (éditeur riche), date limite, matière, classe
- Joindre des fichiers (depuis ImuDrive ou upload direct)
- Choisir le type : rendu numérique, pas de rendu ("devoir maison"), quiz en ligne
- Devoirs différenciés : version A / version B pour différents groupes d'élèves
- Rappels automatiques (3 jours avant la date limite, puis la veille)

**Rendu (élève)**
- Interface de rendu : texte en ligne, upload de fichier, ou lien
- Rendu via ImuDocs (document collaboratif directement dans le devoir)
- Historique des rendus avec statut : en attente / rendu / en retard / noté
- Notification de confirmation quand le devoir est bien reçu

**Correction (enseignant)**
- Interface de correction inline : annotations sur le document rendu
- Note + commentaire personnalisé
- Retour groupé : commentaire général pour toute la classe
- Statistiques : taux de rendu, distribution des notes, élèves en difficulté
- Correction type téléchargeable après notation

**Gestion avancée**
- Planification à l'avance (publier à une date précise)
- Modèles de devoirs réutilisables
- Devoirs de groupe (remis par groupes, noté individuellement ou collectivement)
- Export des notes des devoirs vers le module Notes

---

## Module 04 — Notes & Évaluations

### Fonctionnalités

**Saisie des notes (enseignant)**
- Carnet de notes par classe et par matière
- Saisie en vrac ou par élève
- Coefficients configurables par évaluation et par période
- Moyennes automatiques (pondérées par coefficient)
- Compétences : évaluation par item (A/B/C/D ou pas acquis/en cours/acquis/dépassé)
- Import depuis un fichier CSV / tableur

**Bulletins de notes**
- Génération automatique du bulletin de période (PDF)
- Modèles de bulletins configurables (logo établissement, mentions)
- Appréciation de l'enseignant par matière (texte riche)
- Appréciation du conseil de classe
- Publication aux parents via la messagerie ENT
- Accusé de réception parent
- Archivage légal (conservation 10 ans)

**Suivi de la progression**
- Évolution des moyennes sur l'année par élève et par matière
- Alerte automatique si la moyenne d'un élève chute de plus de X points
- Comparaison avec la moyenne de classe (anonymisée pour les parents)
- Tableau de bord enseignant : élèves en difficulté identifiés

**Conseil de classe (module avancé)**
- Saisie des appréciations générales et des décisions (passage, redoublement, félicitations)
- Workflow : proposition → validation direction → publication
- Accès sécurisé par établissement

### Périodes configurables

```typescript
interface GradingPeriod {
  id: string;
  organizationId: string;
  name: string;           // "Trimestre 1", "Semestre 1", etc.
  startDate: Date;
  endDate: Date;
  bulletinDate?: Date;    // Date de remise des bulletins
  type: 'trimester' | 'semester' | 'quarter' | 'custom';
  isActive: boolean;
}
```

---

## Module 05 — Absences & Vie Scolaire

### Fonctionnalités

**Appel en classe (enseignant)**
- Interface d'appel rapide : liste de la classe avec photo + case à cocher
- Modes : présent / absent / retard / dispensé
- Motif optionnel pour l'enseignant
- Synchronisation en temps réel (le CPE voit les absences dès qu'elles sont saisies)
- Mode hors-ligne (synchronisation différée si pas de connexion)

**Gestion des absences (CPE / admin)**
- Tableau de bord absences du jour : toutes les classes
- Timeline des absences de chaque élève sur l'année
- Taux d'absentéisme par classe, par élève, par matière
- Workflow de justification : parent envoie justificatif → CPE valide
- Signalement automatique au rectorat si seuil atteint (décrochage scolaire)
- Notification SMS / push aux parents dès la première heure de cours manquée

**Communication absences (parents)**
- Notification immédiate : "Votre enfant est absent au cours de Maths à 8h"
- Formulaire de justification en ligne (upload document médical possible)
- Accusé de réception du justificatif
- Vue historique des absences de leur enfant

**Sanctions et incidents (CPE)**
- Enregistrement d'un incident (motif, classe, élèves impliqués)
- Sanctions : retenue, exclusion temporaire, convocation parent
- Suivi des sanctions : planifiées, réalisées, annulées
- Rapport disciplinaire pour le conseil de discipline

---

## Module 06 — Communication Parents

### Le carnet de liaison numérique

Ce module remplace le carnet de liaison papier. Il est le canal officiel de communication entre l'établissement et les familles.

**Messagerie enseignant ↔ parent**
- Messagerie directe sécurisée (pas de WhatsApp, pas d'email personnel)
- Accusé de lecture
- Pièces jointes (justificatifs, documents)
- Archivage légal de toutes les communications
- Traduction automatique par Alice IA (pour les familles non-francophones)

**Annonces établissement**
- Diffusion à toutes les familles d'une classe / de l'établissement
- Types : information, événement, urgence
- Niveaux de priorité : routine / important / urgent (alerte rouge)
- Accusé de réception obligatoire pour les communications urgentes

**Notifications push personnalisées**
- Note publiée → notification parent
- Absence détectée → notification immédiate parent
- Bulletin disponible → notification parent avec lien direct
- Rendez-vous parents-professeurs → invitation dans l'agenda

**Rendez-vous parents-professeurs**
- Système de prise de rendez-vous en ligne
- Disponibilités de l'enseignant configurables
- Rappels automatiques (J-2, H-1)
- Mode visio intégré (ImuMeet) pour les rencontres à distance
- Compte-rendu de réunion (note privée enseignant)

---

## Module 07 — Ressources Pédagogiques

### ImuDrive Éducation

C'est le module de gestion des ressources pédagogiques, basé sur ImuDrive.

**Espace enseignant**
- Bibliothèque personnelle de cours (organisée par matière / niveau / année)
- Partage de ressources avec les élèves d'une classe (un clic)
- Gestion des versions (modifier le cours sans perdre l'ancien)
- Templates de cours ImuDocs : fiches de révision, supports de cours, QCM

**Espace classe (partagé)**
- Dossier partagé pour toute la classe
- Permissions : lecture seule pour les élèves par défaut, édition collaborative si activée
- Sous-dossiers par matière
- Accès limité à la durée de l'année scolaire

**Bibliothèque de l'établissement**
- Ressources mutualisées entre tous les enseignants
- Indexation IA par Alice pour la recherche sémantique
- Intégration avec les ressources numériques du GAR (manuels scolaires numériques)

**Intégrations ressources externes**
- Lien avec les ressources Éduthèque (droits gérés par l'établissement)
- Intégration Gallica / BNF pour les ressources patrimoniales
- Liaison avec les éditeurs partenaires (Hachette, Nathan, etc.)

---

## Module 08 — Visioconférence Éducation

### ImuMeet pour l'éducation

Basé sur le module WebRTC natif d'ImuChat (LiveKit SFU auto-hébergé), adapté pour l'éducation.

**Cours à distance**
- Démarrage depuis l'emploi du temps (un clic pour rejoindre le cours prévu)
- Capacité : jusqu'à 30 élèves simultanément
- Outils enseignant : lever la main, file d'attente de questions, sondage live
- Tableau blanc collaboratif (ImuBoard intégré)
- Partage d'écran avec annotation en temps réel
- Enregistrement du cours (avec consentement) → stocké dans ImuDrive
- Transcription automatique par Alice IA (pour les élèves dyslexiques ou absents)

**Salle de permanence virtuelle**
- Enseignant disponible en visio pour des questions individuelles
- Système de file d'attente (élèves rejoignent une par une)
- Plage horaire configurable

**Réunion parents-enseignants à distance**
- Réunion sécurisée avec lien unique par parent
- Durée limitée configurable (15 / 30 / 45 minutes)
- Compte-rendu automatique (résumé Alice IA)

**Soutenance et jury**
- Mode soutenance : présentation élève + panel de jury
- Enregistrement obligatoire (archive légale)
- Grille d'évaluation en temps réel pour les jurés

---

## Module 09 — Projets Collaboratifs

### Travaux de groupe avec ImuOffice

**Création d'un projet**
- Espace de travail dédié : ImuDocs pour le rapport, ImuSlides pour la présentation, ImuBoard pour le brainstorming
- Constitution des groupes par l'enseignant ou par les élèves
- Assignation des rôles dans le groupe : rédacteur, présentateur, chef de projet
- Date de rendu et jalons intermédiaires

**Collaboration en temps réel**
- Co-édition en temps réel (CRDT / Yjs) sur tous les documents
- Chat du groupe intégré dans l'espace projet
- Historique complet des contributions (qui a écrit quoi, quand)
- Mentions et commentaires dans les documents

**Suivi enseignant**
- Vue en lecture sur tous les projets en cours
- Contribution individuelle visible (analytics de participation)
- Commentaires et retours sur les versions intermédiaires
- Alice IA : détection de plagiat entre projets de la même classe

---

## Module 10 — Orientation & Parcours (Lycée)

### Portfolio élève

- Profil de compétences (basé sur l'évaluation par compétences)
- Activités extra-scolaires et engagement citoyen
- Productions scolaires mises en avant (textes, projets, présentations)
- Lettres de motivation et CV (template ImuDocs)
- Auto-évaluation guidée par Alice IA

### Stages et alternance

- Dossier de stage numérique (convention, rapport, évaluation employeur)
- Carnet de bord de stage (journal quotidien ImuDocs)
- Communication stagiaire ↔ tuteur enseignant pendant le stage
- Évaluation du stage : grille renseignée par l'entreprise d'accueil via lien sécurisé

### Orientation (Parcoursup / orientation post-bac)

- Fiche de voeux et projets d'orientation
- Lettre de motivation guidée par Alice IA (guide, pas rédige)
- Avis du conseil de classe intégré dans le dossier
- Calendrier de l'orientation avec rappels

---

## Module 11 — Vie Associative & Events (Université)

### BDE et associations étudiantes

- Espace association : profil, membres, agenda, actualités
- Gestion des adhésions (paiement intégré via ImuWallet)
- Publication d'événements : sorties, soirées, conférences, tournois
- Billetterie intégrée (QR code à l'entrée)

### Agenda campus

- Agenda commun de l'établissement : conférences, portes ouvertes, examens
- Abonnement par centre d'intérêt (Informatique, Droit, Arts...)
- Rappels push configurables

### Forum étudiant

- Channels thématiques : recherche de colocation, offres de stage, entraide cours
- Modération par les associations étudiantes (délégués de promo)
- Annuaire des promos (alumni network pour les universités)

---

## Module 12 — Analytics Pédagogiques

### Dashboard enseignant

- Suivi de la progression de chaque élève sur l'année
- Identification automatique des élèves en difficulté (note en baisse sur 3 semaines)
- Taux de complétion des devoirs par classe
- Participation en cours (si appel avec marquage "actif / passif")
- Distribution des notes par évaluation (courbe de Gauss)
- Corrélation absences / notes

### Dashboard direction

- Vue d'ensemble de l'établissement : taux de réussite par classe, par niveau
- Comparaison inter-classes (même niveau, même matière)
- Alertes : classes avec taux d'absentéisme anormal, enseignant n'ayant pas mis de notes
- Rapport automatique hebdomadaire PDF envoyé à la direction
- Préparation des conseils de classe : données agrégées prêtes

### Rapport parents

- Rapport de suivi mensuel automatique (envoyé par email + notification push)
- Résumé : notes de la période, absences, devoirs rendus, commentaires enseignants
- Comparaison anonymisée avec la moyenne de classe

---

## Module 13 — Administration ENT

### Paramètres de l'établissement

- Informations générales : nom, logo, couleurs, contacts
- Paramètres de l'année scolaire : dates de rentrée, vacances, périodes de notation
- Configuration des modules activés (certains modules sont optionnels)
- Paramètres de notification (quels événements déclenchent des alertes)

### Gestion des comptes

- Import en masse depuis un fichier CSV ou via SCIM/LDAP
- Invitations par email avec rôle pré-assigné
- Gestion du cycle de vie : activation à la rentrée, désactivation en fin d'année
- Export RGPD : données complètes d'un élève sur demande
- Suppression RGPD : effacement des données en fin de scolarité

### Conformité RGPD

- Registre des traitements de données automatiquement mis à jour
- Consentements recueillis et archivés (enseignants + parents d'élèves mineurs)
- Durées de rétention configurables par type de donnée
- Export des données en format lisible (JSON / CSV)
- Journaux d'accès aux données sensibles (notes, absences)

### Rapports & exports

- Rapport statistique annuel (pour le rectorat)
- Export des bulletins de l'année en ZIP
- Export des données de l'établissement (migration vers un autre ENT)
- Rapport RGPD pour le DPO
