# 👥 03 — Rôles & Permissions · RBAC ENT ImuChat Éducation

> **Document :** Système de rôles complet, matrice d'accès et implémentation
> **8 rôles · Hiérarchie par établissement · Age-tier intégré**

---

## 1. Définition des rôles

| Rôle | Code | Description | Portée |
|---|---|---|---|
| Super Admin Établissement | `ORG_SUPER_ADMIN` | Directeur informatique, DSI académique | Organisation entière |
| Direction | `ORG_DIRECTOR` | Chef d'établissement, proviseur, doyen | Organisation entière |
| Admin Pédagogique | `ORG_ADMIN_EDU` | Secrétariat scolaire, gestionnaire | Organisation entière |
| Enseignant | `TEACHER` | Professeur, maître de conférence | Ses classes / matières |
| Élève / Étudiant | `STUDENT` | Élève (KIDS/JUNIOR/TEEN) ou étudiant (ADULT) | Son profil + ses classes |
| Parent / Tuteur | `PARENT` | Parent d'élève, tuteur légal | Ses enfants uniquement |
| Assistant Éducatif | `EDU_STAFF` | CPE, documentaliste, infirmière, AESH | Selon périmètre assigné |
| Invité | `GUEST` | Intervenant ponctuel, remplaçant | Accès temporaire limité |

---

## 2. Hiérarchie des rôles

```
ORG_SUPER_ADMIN
      │
      ├── ORG_DIRECTOR
      │       │
      │       ├── ORG_ADMIN_EDU
      │       │       │
      │       │       ├── TEACHER ──── EDU_STAFF
      │       │       │       │
      │       │       │       └── STUDENT ──── PARENT
      │       │       │
      │       │       └── GUEST (temporaire)
      │       │
      │       └── EDU_STAFF (CPE, etc.)
      │
      └── [admin.imuchat.app ADMIN_PLATFORM] ← niveau platform global
```

---

## 3. Matrice d'accès complète

### 3.1 Gestion de l'organisation

| Action | `ORG_SUPER_ADMIN` | `ORG_DIRECTOR` | `ORG_ADMIN_EDU` | `TEACHER` | `EDU_STAFF` | `STUDENT` | `PARENT` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Voir les infos de l'organisation | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Modifier les infos de l'org | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Gérer la facturation | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Configurer SSO | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Activer/désactiver modules | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Exporter données RGPD | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### 3.2 Gestion des utilisateurs

| Action | `ORG_SUPER_ADMIN` | `ORG_DIRECTOR` | `ORG_ADMIN_EDU` | `TEACHER` | `EDU_STAFF` | `STUDENT` | `PARENT` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Voir liste des enseignants | ✅ | ✅ | ✅ | ✅ | 🔍 | ❌ | ❌ |
| Voir liste des élèves | ✅ | ✅ | ✅ | 🔍 ses classes | 🔍 | ❌ | 🔍 ses enfants |
| Créer un compte utilisateur | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Modifier un profil | ✅ | ✅ | ✅ | ❌ | ❌ | 🔍 soi-même | 🔍 soi-même |
| Désactiver un compte | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Attribuer un rôle | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Lier parent ↔ enfant | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### 3.3 Classes & groupes

| Action | `ORG_SUPER_ADMIN` | `ORG_DIRECTOR` | `ORG_ADMIN_EDU` | `TEACHER` | `EDU_STAFF` | `STUDENT` | `PARENT` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Créer une classe | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Modifier une classe | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Voir composition d'une classe | ✅ | ✅ | ✅ | ✅ (ses classes) | 🔍 | 🔍 (sa classe) | 🔍 (classe de son enfant) |
| Créer un groupe de travail | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ (groupes étudiants) | ❌ |
| Affecter un enseignant à une classe | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### 3.4 Emploi du temps

| Action | `ORG_SUPER_ADMIN` | `ORG_DIRECTOR` | `ORG_ADMIN_EDU` | `TEACHER` | `EDU_STAFF` | `STUDENT` | `PARENT` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Voir emploi du temps (global) | ✅ | ✅ | ✅ | ✅ (le sien) | 🔍 | ✅ (le sien) | ✅ (son enfant) |
| Créer/modifier emploi du temps | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Signaler une indisponibilité | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Voir les salles disponibles | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

### 3.5 Notes & évaluations

| Action | `ORG_SUPER_ADMIN` | `ORG_DIRECTOR` | `ORG_ADMIN_EDU` | `TEACHER` | `EDU_STAFF` | `STUDENT` | `PARENT` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Saisir des notes | ✅ | ✅ | ❌ | ✅ (ses classes) | ❌ | ❌ | ❌ |
| Modifier une note | ✅ | ✅ | ❌ | ✅ (ses notes) | ❌ | ❌ | ❌ |
| Supprimer une note | ✅ | ✅ | ❌ | ⚠️ avec motif | ❌ | ❌ | ❌ |
| Voir les notes de tous | ✅ | ✅ | ✅ | ✅ (ses classes) | ❌ | 🔍 les siennes | 🔍 son enfant |
| Publier le bulletin | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Exporter les notes (CSV) | ✅ | ✅ | ✅ | ✅ (ses classes) | ❌ | ❌ | ❌ |

### 3.6 Absences & vie scolaire

| Action | `ORG_SUPER_ADMIN` | `ORG_DIRECTOR` | `ORG_ADMIN_EDU` | `TEACHER` | `EDU_STAFF` | `STUDENT` | `PARENT` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Enregistrer une absence | ✅ | ✅ | ✅ | ✅ (appel) | ✅ (CPE) | ❌ | ❌ |
| Justifier une absence | ✅ | ✅ | ✅ | ❌ | ✅ (CPE) | ❌ | ✅ (son enfant) |
| Voir absences (toutes) | ✅ | ✅ | ✅ | ✅ (ses classes) | ✅ | ❌ | ❌ |
| Voir ses absences | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🔍 enfant |
| Envoyer alerte absence parent | ✅ | ✅ | ✅ | ✅ | ✅ (CPE) | ❌ | ❌ |

### 3.7 Devoirs & ressources pédagogiques

| Action | `ORG_SUPER_ADMIN` | `ORG_DIRECTOR` | `ORG_ADMIN_EDU` | `TEACHER` | `EDU_STAFF` | `STUDENT` | `PARENT` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Publier un devoir | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Modifier un devoir | ✅ | ✅ | ❌ | ✅ (ses devoirs) | ❌ | ❌ | ❌ |
| Rendre un devoir | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Corriger un devoir | ✅ | ✅ | ❌ | ✅ (ses devoirs) | ❌ | ❌ | ❌ |
| Voir les devoirs rendus | ✅ | ✅ | ❌ | ✅ (ses classes) | ❌ | 🔍 les siens | 🔍 enfant |
| Partager des ressources | ✅ | ✅ | ✅ | ✅ | ✅ (docs) | ❌ | ❌ |

### 3.8 Communication

| Action | `ORG_SUPER_ADMIN` | `ORG_DIRECTOR` | `ORG_ADMIN_EDU` | `TEACHER` | `EDU_STAFF` | `STUDENT` | `PARENT` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Envoyer message à tous les parents | ✅ | ✅ | ✅ | ✅ (sa classe) | ✅ (CPE) | ❌ | ❌ |
| Envoyer message à un parent | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ (répondre) |
| Envoyer message à un élève | ✅ | ✅ | ✅ | ✅ (ses élèves) | ✅ | ✅ (pairs) | ❌ |
| Publier une annonce établissement | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Publier une annonce de classe | ✅ | ✅ | ✅ | ✅ (ses classes) | ❌ | ❌ | ❌ |
| Voir messagerie de tous | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 3.9 Analytics & reporting

| Action | `ORG_SUPER_ADMIN` | `ORG_DIRECTOR` | `ORG_ADMIN_EDU` | `TEACHER` | `EDU_STAFF` | `STUDENT` | `PARENT` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Dashboard général établissement | ✅ | ✅ | 🔍 | ❌ | ❌ | ❌ | ❌ |
| Stats de sa classe | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Suivi progression élève | ✅ | ✅ | ✅ | ✅ (ses élèves) | ❌ | 🔍 soi-même | 🔍 son enfant |
| Rapport d'activité numérique | ✅ | ✅ | ✅ | ❌ | ❌ | 🔍 soi-même | ✅ (enfant via ImuGuardian) |
| Export données conformité | ✅ | ✅ | 🔍 | ❌ | ❌ | ❌ | ❌ |

### 3.10 Alice IA Éducation

| Action | `TEACHER` | `EDU_STAFF` | `STUDENT` (JUNIOR/TEEN) | `STUDENT` (ADULT) | `PARENT` |
|---|:---:|:---:|:---:|:---:|:---:|
| Accès Alice tuteur | ✅ | ✅ | ✅ (filtré âge) | ✅ | ❌ |
| Générer des exercices | ✅ | ❌ | ❌ | ❌ | ❌ |
| Correction automatique (partielle) | ✅ | ❌ | ❌ | ❌ | ❌ |
| Aide aux devoirs | N/A | N/A | ✅ (mode guidé) | ✅ | ❌ |
| Résumé de cours | ✅ | ✅ | ✅ | ✅ | ❌ |
| Alice sans filtre contenu | ✅ | ✅ | ❌ | ✅ | ❌ |
| Voir historique Alice élève | ✅ (ses élèves) | ❌ | 🔍 soi-même | 🔍 soi-même | 🔍 son enfant |

> ✅ Accès complet · 🔍 Lecture seule ou accès limité · ⚠️ Avec condition · ❌ Aucun accès

---

## 4. Implémentation RBAC

### 4.1 Schéma des rôles en base

```typescript
// shared-types/src/education.ts

export type EduRole =
  | 'ORG_SUPER_ADMIN'
  | 'ORG_DIRECTOR'
  | 'ORG_ADMIN_EDU'
  | 'TEACHER'
  | 'EDU_STAFF'
  | 'STUDENT'
  | 'PARENT'
  | 'GUEST';

export type EduStaffSpecialty =
  | 'CPE'         // Conseiller Principal d'Éducation
  | 'DOC'         // Documentaliste
  | 'INFIRMIER'   // Infirmier scolaire
  | 'AESH'        // Accompagnant Élève Handicap
  | 'PSYCHOLOGUE' // Psychologue scolaire
  | 'ASSISTANT';  // Assistant d'éducation

export interface EduUserProfile {
  userId: string;
  organizationId: string;
  role: EduRole;
  staffSpecialty?: EduStaffSpecialty; // Pour EDU_STAFF uniquement
  ageTier: 'KIDS' | 'JUNIOR' | 'TEEN' | 'ADULT'; // Hérité du profil ImuChat
  classIds: string[];     // Classes dont l'utilisateur est membre (élèves)
  teachingClassIds: string[]; // Classes dont l'utilisateur est enseignant
  parentOfStudentIds: string[]; // IDs des enfants (PARENT uniquement)
  isActive: boolean;
  expiresAt?: Date; // Pour les GUEST
}
```

### 4.2 Hook `useEduPermission` (frontend)

```typescript
// web-app/src/hooks/useEduPermission.ts

import { useEduProfile } from './useEduProfile';

type EduPermission =
  | 'grades.read.own'
  | 'grades.read.class'
  | 'grades.read.all'
  | 'grades.write'
  | 'absences.record'
  | 'absences.justify'
  | 'homework.assign'
  | 'homework.submit'
  | 'messages.send.parents'
  | 'messages.send.all'
  | 'announcements.publish'
  | 'timetable.edit'
  | 'users.manage'
  | 'org.admin'
  | 'ai.teacher_mode'
  | 'ai.student_mode'
  | 'analytics.org'
  | 'analytics.class';

const ROLE_PERMISSIONS: Record<EduRole, EduPermission[]> = {
  ORG_SUPER_ADMIN: ['grades.read.all', 'grades.write', 'absences.record', 'absences.justify',
    'homework.assign', 'messages.send.all', 'announcements.publish', 'timetable.edit',
    'users.manage', 'org.admin', 'ai.teacher_mode', 'analytics.org', 'analytics.class'],

  ORG_DIRECTOR: ['grades.read.all', 'grades.write', 'absences.record', 'absences.justify',
    'homework.assign', 'messages.send.all', 'announcements.publish', 'timetable.edit',
    'users.manage', 'ai.teacher_mode', 'analytics.org', 'analytics.class'],

  ORG_ADMIN_EDU: ['grades.read.all', 'absences.record', 'absences.justify',
    'messages.send.parents', 'announcements.publish', 'timetable.edit',
    'users.manage', 'analytics.org', 'analytics.class'],

  TEACHER: ['grades.read.class', 'grades.write', 'absences.record',
    'homework.assign', 'messages.send.parents', 'ai.teacher_mode', 'analytics.class'],

  EDU_STAFF: ['absences.record', 'absences.justify', 'messages.send.parents'],

  STUDENT: ['grades.read.own', 'homework.submit', 'ai.student_mode'],

  PARENT: ['grades.read.own', 'absences.justify', 'messages.send.parents'],

  GUEST: [],
};

export function useEduPermission() {
  const { profile } = useEduProfile();

  const hasPermission = (permission: EduPermission): boolean => {
    if (!profile) return false;
    return ROLE_PERMISSIONS[profile.role]?.includes(permission) ?? false;
  };

  const canAccessClass = (classId: string): boolean => {
    if (!profile) return false;
    if (['ORG_SUPER_ADMIN', 'ORG_DIRECTOR', 'ORG_ADMIN_EDU'].includes(profile.role)) return true;
    if (profile.role === 'TEACHER') return profile.teachingClassIds.includes(classId);
    if (profile.role === 'STUDENT') return profile.classIds.includes(classId);
    if (profile.role === 'PARENT') {
      // Le parent peut voir les classes de ses enfants
      return profile.parentOfStudentIds.some(childId =>
        getStudentClassIds(childId).includes(classId)
      );
    }
    return false;
  };

  return { hasPermission, canAccessClass, role: profile?.role };
}
```

### 4.3 Middleware RBAC côté API

```typescript
// platform-core/src/middleware/eduRBAC.ts

export function requireEduPermission(permission: EduPermission) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const { userId, organizationId } = req.eduContext;
    const profile = await getEduProfile(userId, organizationId);

    if (!profile) {
      return reply.status(403).send({ error: 'Not a member of this institution' });
    }

    const allowed = ROLE_PERMISSIONS[profile.role]?.includes(permission);
    if (!allowed) {
      // Log la tentative d'accès non autorisé
      await logEduAudit({
        userId, organizationId,
        action: `unauthorized.${permission}`,
        ip: req.ip,
      });
      return reply.status(403).send({ error: `Permission required: ${permission}` });
    }

    req.eduProfile = profile;
  };
}

// Usage dans les routes
fastify.post('/api/edu/grades', {
  preHandler: [
    eduTenantMiddleware,
    requireEduPermission('grades.write'),
  ],
}, async (req, reply) => {
  // ...
});
```

---

## 5. Gestion des rôles hybrides

Un même utilisateur peut avoir des rôles différents selon les contextes.

### Exemple : enseignant qui est aussi parent

```typescript
// Un utilisateur peut avoir plusieurs profils EDU dans différentes organisations
// ET être PARENT dans la même organisation s'il a un enfant scolarisé

interface EduUserMultiContext {
  userId: string;
  contexts: Array<{
    organizationId: string;
    role: EduRole;
    // ...
  }>;
}

// Résolution du contexte actif
function resolveActiveEduContext(userId: string, organizationId: string): EduUserProfile {
  // Si l'utilisateur est TEACHER dans cette org ET PARENT d'un élève de cette org,
  // le rôle actif dépend de la section consultée :
  // - /notes/mes-classes → TEACHER
  // - /suivi/mon-enfant → PARENT
  // Résolution par le routeur frontend
}
```

### Exemple : CPE (EDU_STAFF avec spécialité)

```typescript
// Un CPE a les mêmes droits qu'un TEACHER pour les absences,
// mais des droits supplémentaires pour la vie scolaire
const CPE_EXTRA_PERMISSIONS: EduPermission[] = [
  'absences.justify',
  'messages.send.all',  // Peut écrire à tous les parents
  // ...
];
```
