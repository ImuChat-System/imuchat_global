# 📅 07 — Roadmap de Développement · ENT ImuChat Éducation

> **Document :** Roadmap complète de développement — 8 phases · 24 sprints · 48 semaines
> **Stack :** Next.js 16 · Fastify · Supabase · Socket.IO · Drizzle ORM · TipTap · Yjs

---

## Vue d'ensemble

| Phase | Nom | Sprints | Durée | Priorité |
|---|---|:---:|:---:|:---:|
| 1 | Fondations, Auth & RBAC | 1-3 | 6 sem. | 🔴 |
| 2 | Modules Core ENT | 4-8 | 10 sem. | 🔴 |
| 3 | Communication Parents | 9-11 | 6 sem. | 🔴 |
| 4 | ImuOffice Éducation | 12-15 | 8 sem. | 🟠 |
| 5 | Alice IA Éducation | 16-18 | 6 sem. | 🟠 |
| 6 | Visioconférence & Projets | 19-20 | 4 sem. | 🟠 |
| 7 | Analytics & Admin | 21-22 | 4 sem. | 🟠 |
| 8 | Intégrations & Conformité | 23-24 | 4 sem. | 🟡 |
| **Total** | | **24 sprints** | **48 sem.** | |

---

## Phase 1 — Fondations, Auth & RBAC (Sprints 1-3)

> **Objectif :** Infrastructure multi-tenant, authentification scolaire, rôles éducation.

### Sprint 1 · Multi-tenant & Organisation (Semaines 1-2)

**Priorité :** 🔴 Critique

| Tâche | Description | Fichiers |
|---|---|---|
| **Schéma SQL complet** | Exécuter toutes les migrations education (doc 06). Tables : `edu_organizations`, `edu_user_profiles`, `edu_school_years`, `edu_grading_periods`, `edu_levels`, `edu_classes`, `edu_subjects`, `edu_rooms` | `platform-core/src/db/migrations/education/` |
| **Middleware tenant** | `eduTenantMiddleware` — résolution de l'organization_id depuis le JWT, injection dans la requête | `platform-core/src/middleware/eduTenant.ts` |
| **Module organisation** | CRUD organisations éducatives. Endpoint de configuration initiale d'un établissement | `platform-core/src/modules/edu/OrgModule.ts` |
| **RLS Supabase** | Toutes les politiques RLS d'isolation par organisation et par rôle | `supabase/migrations/edu_rls.sql` |
| **Onboarding établissement** | Wizard de création d'un établissement : type, nom, UAI, timezone, année scolaire, première classe | `education/app/onboarding/` |
| **i18n éducation** | Fichiers de traduction `fr/en` pour tous les namespaces ENT. ICU pluriel pour "1 élève / 2 élèves" | `education/messages/` |

**Livrables Sprint 1 :**
- ✅ Schéma BDD complet créé et migré
- ✅ Isolation multi-tenant opérationnelle (tests RLS)
- ✅ Onboarding établissement fonctionnel

---

### Sprint 2 · Authentification Scolaire (Semaines 3-4)

| Tâche | Description | Fichiers |
|---|---|---|
| **Login ENT** | Page de login distincte sur `education.imuchat.app/login`. Détection automatique de l'établissement via email ou sous-domaine | `education/app/login/` |
| **SSO SAML 2.0** | Intégration SAML 2.0 pour les universités. Callback + mapping profil → rôle | `platform-core/src/modules/edu/SSOModule.ts` |
| **SSO CAS** | Intégration CAS (universités françaises). Validation ticket CAS | `platform-core/src/modules/edu/CASAdapter.ts` |
| **Email magique** | Connexion par lien magique pour les élèves/parents sans SSO (établissements primaires) | `platform-core/src/modules/edu/MagicLinkAuth.ts` |
| **SCIM provisioning** | Endpoints SCIM 2.0 pour provisioning automatique depuis l'annuaire LDAP | `platform-core/src/routes/edu/scim.ts` |
| **LTI 1.3 receiver** | Recevoir un lancement LTI depuis Pronote / Moodle / Skolengo | `platform-core/src/routes/edu/lti.ts` |
| **Consentement parental** | Flux de vérification parentale pour les élèves mineurs (integration age-tier ImuChat) | `education/app/consent/` |

---

### Sprint 3 · RBAC & Gestion des Rôles (Semaines 5-6)

| Tâche | Description | Fichiers |
|---|---|---|
| **Hook `useEduPermission`** | Implémentation complète (doc 03) | `education/src/hooks/useEduPermission.ts` |
| **Composant `EduPermissionGate`** | Wrapper conditionnel sur les sections par permission | `education/src/components/EduPermissionGate.tsx` |
| **Middleware API RBAC** | `requireEduPermission()` sur toutes les routes sensibles | `platform-core/src/middleware/eduRBAC.ts` |
| **Interface gestion rôles** | Page `/admin/users` : liste des membres, attribuer un rôle, inviter | `education/app/admin/users/` |
| **Invitation utilisateur** | Inviter un enseignant / parent par email avec rôle pré-assigné. Lien d'activation 7 jours | `platform-core/src/modules/edu/InvitationModule.ts` |
| **Lien parent ↔ enfant** | Associer un parent à ses enfants. Vérification manuelle ou automatique (via l'admin) | `platform-core/src/modules/edu/ParentLinkModule.ts` |
| **Dashboard home par rôle** | Page d'accueil différente selon le rôle : enseignant / élève / parent / direction | `education/app/dashboard/` |

---

## Phase 2 — Modules Core ENT (Sprints 4-8)

> **Objectif :** Les 5 modules fondamentaux qu'un ENT doit avoir dès le lancement.

### Sprint 4 · Emploi du Temps (Semaines 7-8)

| Tâche | Description | Fichiers |
|---|---|---|
| **API emploi du temps** | CRUD `edu_timetable_slots`. Détection automatique des conflits (salle déjà réservée, enseignant double). | `platform-core/src/routes/edu/timetable.ts` |
| **Vue semaine (enseignant/élève)** | Grille horaire 5 jours × créneaux de 30min. Vue responsive. Code couleur par matière. | `education/app/timetable/` |
| **Vue calendrier mensuel** | Vue mensuelle pour les enseignants : jours de cours, contrôles prévus, réunions. | `education/components/timetable/MonthView.tsx` |
| **Gestion des salles** | CRUD salles. Calendrier de disponibilité d'une salle. | `education/app/admin/rooms/` |
| **Import Pronote** | Import de l'emploi du temps depuis un export Pronote (.xml ou API). | `platform-core/src/services/edu/PronoteAdapter.ts` |
| **Export iCal** | Export `.ics` (Google Calendar, Outlook, Apple Calendar) pour chaque utilisateur. | `platform-core/src/routes/edu/timetable-ical.ts` |
| **Notifications changements** | Notification push quand un cours est annulé ou la salle changée. | `platform-core/src/services/edu/TimetableNotifications.ts` |

---

### Sprint 5 · Absences & Appel (Semaines 9-10)

| Tâche | Description | Fichiers |
|---|---|---|
| **Interface d'appel** | Liste de la classe avec photo, statut en un tap. Mode offline supporté (sync différée). | `education/app/attendance/call/` |
| **API absences** | CRUD absences. RPC `record_attendance(classId, date, absences[])` — transaction atomique | `platform-core/src/routes/edu/absences.ts` |
| **Dashboard absences (CPE)** | Vue du jour : toutes les absences par heure. Workflow de justification. | `education/app/attendance/dashboard/` |
| **Justification parent** | Formulaire parent pour justifier une absence. Upload document (ImuDrive). | `education/app/attendance/justify/` |
| **Notifications parents** | Notification immédiate à l'absence détectée. Configuration par préférence (push/email/SMS). | `platform-core/src/services/edu/AbsenceNotifications.ts` |
| **Statistiques absences** | Taux d'absentéisme par classe, par élève, par matière. Seuil d'alerte configurable. | `education/app/analytics/absences/` |
| **Export absences** | Export CSV pour le rectorat. Format réglementaire (Siècle, Sconet). | `platform-core/src/services/edu/AbsenceExport.ts` |

---

### Sprint 6 · Notes & Évaluations (Semaines 11-12)

| Tâche | Description | Fichiers |
|---|---|---|
| **Interface de saisie notes** | Tableau notes par classe, copier-coller depuis Excel, saisie en masse. | `education/app/grades/entry/` |
| **API notes** | CRUD `edu_evaluations` + `edu_grades`. Calcul de moyenne (fonction SQL `calculate_student_average`). | `platform-core/src/routes/edu/grades.ts` |
| **Carnet de notes enseignant** | Vue par période : toutes ses classes, toutes les matières. Export CSV. | `education/app/grades/gradebook/` |
| **Relevé de notes élève** | Vue de l'élève : ses notes par matière, par période. Évolution graphique. | `education/app/grades/student/` |
| **Évaluation par compétences** | Grille de compétences A/B/C/D. Vue synthétique par élève. | `education/app/grades/competencies/` |
| **Génération bulletin PDF** | Template configurable par établissement. Génération via Puppeteer/pdfkit. | `platform-core/src/services/edu/BulletinGenerator.ts` |
| **Publication bulletin** | Workflow : enseignant → admin → direction → publication aux parents avec accusé de lecture. | `education/app/grades/bulletin/` |

---

### Sprint 7 · Devoirs (Semaines 13-14)

| Tâche | Description | Fichiers |
|---|---|---|
| **API devoirs** | CRUD `edu_homework`. Planification de publication. Devoirs différenciés (groupes A/B/C). | `platform-core/src/routes/edu/homework.ts` |
| **Interface enseignant** | Créer un devoir : éditeur riche (TipTap), pièces jointes ImuDrive, date limite, type. | `education/app/homework/create/` |
| **Agenda élève** | Vue calendrier des devoirs à faire. Code couleur par matière. Badge "en retard". | `education/app/homework/agenda/` |
| **Interface de rendu** | Élève rend son devoir : upload fichier ou texte en ligne. Confirmation de réception. | `education/app/homework/submit/` |
| **Correction enseignant** | Liste des rendus par devoir. Annotation inline. Note + commentaire. Rendu à l'élève. | `education/app/homework/correct/` |
| **Détection plagiat (Alice)** | Comparaison sémantique des rendus d'une même classe. Rapport pour l'enseignant. | `platform-core/src/services/edu/PlagiarismDetector.ts` |
| **Rappels automatiques** | Push à J-3, J-1 avant la date limite. Configurable par l'enseignant. | `platform-core/src/services/edu/HomeworkReminders.ts` |

---

### Sprint 8 · Cahier de Texte Numérique (Semaines 15-16)

| Tâche | Description | Fichiers |
|---|---|---|
| **API cahier de texte** | CRUD `edu_lesson_records`. Liaison automatique avec l'emploi du temps. | `platform-core/src/routes/edu/lessonnotes.ts` |
| **Interface saisie (enseignant)** | Éditeur TipTap embarqué dans le créneau de cours. Tampons rapides. Statuts de progression. | `education/app/diary/teacher/` |
| **Vue élève/parent** | Fil chronologique des cours par matière. Indicateur "cours non saisi" (en gris). | `education/app/diary/student/` |
| **Ressources attachées** | Intégration ImuDrive : joindre des fichiers depuis la bibliothèque de cours. | `education/components/diary/ResourceAttachment.tsx` |
| **Résumé Alice** | Bouton "Résumé IA" sur chaque cours → Alice génère un résumé en 5 points clés. | `education/components/diary/AliceSummary.tsx` |
| **Progression du programme** | Vue synthétique de la couverture du programme (séquences validées / restantes). | `education/app/diary/progression/` |

---

## Phase 3 — Communication Parents (Sprints 9-11)

> **Objectif :** Carnet de liaison numérique complet — remplacer les carnets papier et WhatsApp.

### Sprint 9 · Messagerie Enseignant ↔ Parent (Semaines 17-18)

| Tâche | Description | Fichiers |
|---|---|---|
| **API messagerie edu** | CRUD `edu_messages`. Distinction messages individuels / classe / établissement. | `platform-core/src/routes/edu/messages.ts` |
| **Boîte de réception** | Interface unifiée : messages reçus, envoyés, archivés. Fil de conversation. | `education/app/messages/inbox/` |
| **Accusé de lecture** | Marquage lu/non-lu. Demande d'accusé de réception obligatoire pour certains messages. | `education/components/messages/ReadReceipt.tsx` |
| **Traduction Alice** | Bouton "Traduire ce message" pour les parents non-francophones. | `education/components/messages/TranslateButton.tsx` |
| **Pièces jointes** | Upload de justificatifs, documents, images. Stockage ImuDrive éducation. | `education/components/messages/AttachmentUpload.tsx` |
| **Archivage légal** | Conservation des messages 5 ans. Impossibilité de supprimer (sauf RGPD). Audit trail. | `platform-core/src/services/edu/MessageArchive.ts` |

---

### Sprint 10 · Annonces & Notifications (Semaines 19-20)

| Tâche | Description | Fichiers |
|---|---|---|
| **API annonces** | CRUD `edu_announcements`. Ciblage flexible (tout l'établissement, une classe, un rôle). | `platform-core/src/routes/edu/announcements.ts` |
| **Interface publication** | Créer une annonce : titre, corps, type (info/événement/alerte), pièces jointes, planification. | `education/app/announcements/create/` |
| **Fil d'actualités** | Page d'accueil : fil des dernières annonces de l'établissement et des classes. | `education/app/announcements/feed/` |
| **Centre de notifications** | Cloche de notifications : notes publiées, absences, devoirs, messages, bulletins. | `education/components/NotificationCenter.tsx` |
| **Préférences notifications** | Chaque utilisateur configure ses alertes : immédiat / résumé quotidien / résumé hebdo. | `education/app/settings/notifications/` |
| **Notifications urgentes** | Alerte rouge (fermeture établissement, accident) → push immédiat + SMS + email. | `platform-core/src/services/edu/UrgentAlert.ts` |

---

### Sprint 11 · Rendez-vous Parents-Enseignants (Semaines 21-22)

| Tâche | Description | Fichiers |
|---|---|---|
| **Disponibilités enseignant** | Plages de disponibilité configurables pour les réunions parents-enseignants. | `education/app/meetings/availability/` |
| **Prise de RDV parent** | Calendrier de prise de rendez-vous. Confirmation automatique. | `education/app/meetings/book/` |
| **Réunion ImuMeet** | Lancement de la visio directement depuis le RDV. Lien unique sécurisé par parent. | `education/app/meetings/video/` |
| **Rappels automatiques** | Rappel push J-2 et H-1 avant le rendez-vous pour les deux parties. | `platform-core/src/services/edu/MeetingReminders.ts` |
| **Note post-réunion** | Note privée de l'enseignant après chaque réunion (non visible par le parent). | `education/app/meetings/notes/` |
| **Export agenda** | Export des créneaux de réunion en `.ics` pour les enseignants. | `platform-core/src/routes/edu/meetings-ical.ts` |

---

## Phase 4 — ImuOffice Éducation (Sprints 12-15)

> **Objectif :** Adapter ImuOffice pour l'éducation — templates, collaboration scolaire, ImuDrive éducation.

### Sprint 12 · ImuDrive Éducation (Semaines 23-24)

| Tâche | Description | Fichiers |
|---|---|---|
| **Arborescence de stockage** | Créer la structure de buckets Supabase par établissement (doc 02, section 7.1). | `platform-core/src/services/edu/DriveSetup.ts` |
| **Quota par rôle** | Quotas configurables : élève 5 Go, étudiant 50 Go, enseignant 20 Go (doc 02, section 7.2). | `platform-core/src/modules/edu/DriveQuotaModule.ts` |
| **Interface ImuDrive Éducation** | Explorateur de fichiers adapté : mes fichiers / classes / établissement. | `education/app/drive/` |
| **Partage de ressources classe** | Un clic pour partager un fichier avec toute une classe. Permissions lecture/édition. | `education/components/drive/ShareWithClass.tsx` |
| **Bibliothèque enseignant** | Espace organisé par matière / niveau / année pour réutiliser les cours. | `education/app/drive/teacher-library/` |
| **Intégration GAR** | Afficher les ressources numériques du GAR (manuels scolaires) dans ImuDrive. | `platform-core/src/services/edu/GARConnector.ts` |

---

### Sprint 13 · ImuDocs Pédagogique (Semaines 25-26)

| Tâche | Description | Fichiers |
|---|---|---|
| **Templates éducation** | 15 templates ImuDocs pré-conçus : fiche de révision, fiche de lecture, rapport de stage, mémoire, comptes-rendu TP, plan de cours. | `education/templates/docs/` |
| **Devoir ImuDocs** | Rendre un devoir directement dans ImuDocs : l'élève ouvre un document vierge depuis le devoir, édite, soumet. | `education/app/homework/imudocs-submit/` |
| **Correction ImuDocs** | L'enseignant annote directement dans le document de l'élève (commentaires + suggestions). | `education/app/homework/imudocs-correct/` |
| **Collaboration groupe** | Mode co-édition pour les projets de groupe. Historique des contributions individuelles. | `education/components/docs/GroupCollaboration.tsx` |
| **Mode révision** | Mode "cahier de révision" : double colonne cours + notes personnelles, structure guidée. | `education/components/docs/RevisionMode.tsx` |

---

### Sprint 14 · ImuSlides & ImuBoard Pédagogiques (Semaines 27-28)

| Tâche | Description | Fichiers |
|---|---|---|
| **Templates cours** | Templates ImuSlides : cours magistral, TP, exposé étudiant, soutenance. | `education/templates/slides/` |
| **Mode présentateur** | Vue présentateur avec notes, chronomètre, slide suivante visible. | `education/components/slides/TeacherPresenter.tsx` |
| **Partage écran en cours** | Projeter les slides directement depuis ImuMeet (cours à distance). | `education/components/slides/ScreenShare.tsx` |
| **ImuBoard pédagogique** | Tableau blanc avec outils pédagogiques : formes, post-its, mindmap, grille de concepts. | `education/app/board/` |
| **Templates brainstorming** | Cartes mentales prêtes pour l'analyse littéraire, les cartes historiques, les schémas scientifiques. | `education/templates/board/` |

---

### Sprint 15 · ImuSheets Éducation (Semaines 29-30)

| Tâche | Description | Fichiers |
|---|---|---|
| **Templates tableur** | Tableaux de bord : emploi du temps perso, suivi des notes, budget étudiant, planning révisions. | `education/templates/sheets/` |
| **Tableur partagé (projets)** | Co-édition sur un tableur pour les projets de groupe (budget, analyse de données). | `education/app/sheets/collaborative/` |
| **Export notes en tableur** | L'enseignant exporte son carnet de notes vers ImuSheets pour des calculs avancés. | `platform-core/src/routes/edu/grades-export-sheets.ts` |

---

## Phase 5 — Alice IA Éducation (Sprints 16-18)

> **Objectif :** Déployer Alice en mode pédagogique (tuteur, pédagogue, admin).

### Sprint 16 · Alice Tuteur (Semaines 31-32)

| Tâche | Description | Fichiers |
|---|---|---|
| **Persona Alice Tuteur** | Prompt système socratique (doc 05). Configuration par age-tier. Garde-fous anti-triche. | `platform-core/src/modules/alice/EduTutorPersona.ts` |
| **Interface tuteur** | Fenêtre Alice dans l'interface ENT. Contexte automatique depuis la matière active. | `education/components/alice/TutorPanel.tsx` |
| **Résumé de cours** | Bouton "Résumé IA" sur chaque entrée du cahier de texte. | `platform-core/src/modules/alice/LessonSummaryFlow.ts` |
| **Quiz de révision** | Alice génère un quiz personnalisé depuis le cours actif. Correction instantanée. | `platform-core/src/modules/alice/RevisionQuizFlow.ts` |
| **Limite de session par age-tier** | KIDS: 30min, JUNIOR: 60min, TEEN: 120min. Pause forcée avec message encourageant. | `education/components/alice/SessionTimer.tsx` |

---

### Sprint 17 · Alice Pédagogue (Semaines 33-34)

| Tâche | Description | Fichiers |
|---|---|---|
| **Interface enseignant Alice** | Panneau Alice dans l'espace enseignant. Accès aux outils de génération pédagogique. | `education/components/alice/TeacherPanel.tsx` |
| **Générateur d'exercices** | Formulaire : matière, niveau, notion, type, difficulté. Génération + correction type. Importable dans le module Devoirs. | `platform-core/src/modules/alice/ExerciseGeneratorFlow.ts` |
| **Générateur d'appréciations** | L'enseignant fournit les données d'un élève → Alice propose une appréciation de bulletin. L'enseignant valide et modifie. | `platform-core/src/modules/alice/BulletinCommentFlow.ts` |
| **Détection difficultés** | Alice analyse les patterns de questions d'un élève et signale les notions systématiquement difficiles à l'enseignant. | `platform-core/src/modules/alice/LearningDifficultiesDetector.ts` |

---

### Sprint 18 · Alice Supervision & Confidentialité (Semaines 35-36)

| Tâche | Description | Fichiers |
|---|---|---|
| **Résumés sessions pour enseignants** | L'enseignant voit un résumé anonymisé (notions abordées, pas contenu) des sessions de ses élèves. | `education/app/alice/teacher-overview/` |
| **Rapport hebdo parent** | Email / push résumant l'utilisation d'Alice par l'enfant (opt-in parent). | `platform-core/src/services/edu/AliceParentReport.ts` |
| **Configuration par établissement** | L'admin peut désactiver Alice pour certaines matières ou certains jours (contrôles). | `education/app/admin/alice-config/` |
| **Effacement données Alice** | Effacement des historiques de session Alice pour un élève (RGPD). Opération irréversible avec confirmation. | `platform-core/src/routes/edu/alice-gdpr.ts` |

---

## Phase 6 — Visioconférence & Projets (Sprints 19-20)

### Sprint 19 · ImuMeet Éducation (Semaines 37-38)

| Tâche | Description | Fichiers |
|---|---|---|
| **Cours à distance** | Démarrage depuis l'emploi du temps. Salle automatiquement nommée par cours. | `education/app/meeting/class/` |
| **Outils cours en ligne** | Lever la main, file d'attente, sondage live, partage d'écran, tableau blanc ImuBoard. | `education/components/meeting/TeacherTools.tsx` |
| **Enregistrement cours** | Enregistrement automatique (si activé). Stockage ImuDrive. Transcription Alice. | `platform-core/src/services/edu/CourseRecorder.ts` |
| **Salle de permanence** | File d'attente pour les questions individuelles. L'enseignant gère les entrées. | `education/app/meeting/office-hours/` |
| **RDV parents visio** | Démarrage depuis le module RDV. Sécurisé par lien unique par parent. | `education/app/meeting/parent/` |

---

### Sprint 20 · Projets Collaboratifs (Semaines 39-40)

| Tâche | Description | Fichiers |
|---|---|---|
| **Espace projet** | Création d'un espace de travail de groupe : nom, membres, date de rendu, outils actifs. | `education/app/projects/` |
| **Tableau Kanban** | Tableau de suivi des tâches du projet (To Do / En cours / Terminé). | `education/components/projects/Kanban.tsx` |
| **Contribution individuelle** | Historique des modifications par auteur dans ImuDocs. Graphique de participation. | `education/components/projects/ContributionChart.tsx` |
| **Évaluation de groupe** | L'enseignant note le groupe + évaluation individuelle de la contribution. | `education/app/projects/grade/` |

---

## Phase 7 — Analytics & Admin (Sprints 21-22)

### Sprint 21 · Dashboard Analytics (Semaines 41-42)

| Tâche | Description | Fichiers |
|---|---|---|
| **Dashboard enseignant** | Progression de ses classes : moyennes par matière, taux devoir rendu, absences, alertes élèves. | `education/app/analytics/teacher/` |
| **Dashboard direction** | Vue d'ensemble établissement. Alertes : classe en dessous du seuil, taux d'absentéisme anormal. | `education/app/analytics/director/` |
| **Suivi élève individuel** | Fiche élève complète : évolution notes, absences, devoirs, utilisation Alice. | `education/app/analytics/student/` |
| **Rapport automatique direction** | PDF hebdomadaire généré et envoyé à la direction : indicateurs clés de l'établissement. | `platform-core/src/services/edu/WeeklyReport.ts` |

---

### Sprint 22 · Admin ENT (Semaines 43-44)

| Tâche | Description | Fichiers |
|---|---|---|
| **Paramètres établissement** | Année scolaire, périodes, congés, modules activés, configuration Alice, branding. | `education/app/admin/settings/` |
| **Gestion des classes** | CRUD classes, affecter enseignants, déplacer élèves entre classes, groupes de besoin. | `education/app/admin/classes/` |
| **Import en masse** | Import CSV élèves / enseignants (format SCONET, Pronote, ou générique). | `education/app/admin/import/` |
| **RGPD tableau de bord** | Registre des traitements, demandes d'effacement, exports de données, consentements. | `education/app/admin/gdpr/` |
| **Fin d'année scolaire** | Workflow de clôture : archivage des données, dépromotion des élèves, création nouvelle année. | `education/app/admin/year-end/` |

---

## Phase 8 — Intégrations & Conformité (Sprints 23-24)

### Sprint 23 · Intégrations ENT (Semaines 45-46)

| Tâche | Description | Fichiers |
|---|---|---|
| **Sync Pronote bidirectionnelle** | Import depuis Pronote + push des notes/absences vers Pronote (API partenaire). | `platform-core/src/services/edu/PronoteSync.ts` |
| **Sync Skolengo** | Import/export via API REST Skolengo. | `platform-core/src/services/edu/SkolengoSync.ts` |
| **Référencement GAR** | Intégration avec le Gestionnaire d'Accès aux Ressources (ressources numériques). | `platform-core/src/services/edu/GARConnector.ts` |
| **Widget ImuChat** | Widget ENT intégrable dans Pronote/Moodle via iframe ou LTI. | `education/app/widget/` |

---

### Sprint 24 · Certification & Conformité (Semaines 47-48)

| Tâche | Description | Fichiers |
|---|---|---|
| **Audit RGPD complet** | Revue de toutes les politiques RLS, consentements, durées de rétention, exports. | Audit + documentation |
| **Tests de pénétration** | Pentest sur les endpoints ENT (injection, privilege escalation, tenant isolation). | Rapport sécurité |
| **Accessibilité RGAA** | Conformité RGAA 4.1 (équivalent WCAG 2.1 AA) requis pour les marchés publics français. | Audit accessibilité |
| **Documentation technique** | Guide d'intégration pour les DSI académiques. Guide d'administration ENT. Fiches RGPD. | `education/docs/` |
| **Dossier référencement Éduthèque** | Dossier de candidature pour être référencé comme ressource numérique éducative. | Dossier administratif |

---

## Équipes recommandées

| Squad | Effectif | Phases |
|---|:---:|---|
| **Squad ENT Core** | 2 dev full-stack + 1 backend | Phases 1-3 (fondations + modules core) |
| **Squad Office Éducation** | 1 dev full-stack + 1 dev frontend | Phase 4 (ImuOffice adapté) |
| **Squad IA** | 1 dev IA + 1 dev backend | Phase 5 (Alice Éducation) |
| **Squad Intégrations** | 1 dev backend + 1 dev QA | Phases 6-8 (visio, analytics, intégrations) |
| **Design** | 1 designer UX/UI | Toutes les phases |

---

## Indicateurs de succès

| KPI | Cible à 12 mois | Cible à 24 mois |
|---|---|---|
| Établissements pilotes | 10 | 100 |
| Élèves actifs mensuels | 5 000 | 100 000 |
| Enseignants actifs mensuels | 500 | 8 000 |
| Taux rétention enseignants (M3) | 60% | 75% |
| NPS enseignants | > 40 | > 60 |
| Messages parents envoyés / mois | 10 000 | 500 000 |
| Sessions Alice tuteur / semaine | 2 000 | 50 000 |
