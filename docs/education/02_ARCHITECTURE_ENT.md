# 🏗️ 02 — Architecture Technique · ENT ImuChat Éducation

> **Document :** Architecture technique complète du ENT, intégrations et infrastructure
> **Stack :** Next.js 16 · Fastify · Supabase · Socket.IO · Drizzle ORM · LTI 1.3 · SAML 2.0

---

## 1. Vue d'ensemble de l'architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                     education.imuchat.app                            │
│                                                                      │
│  ┌───────────┐  ┌────────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │  Portail  │  │   ENT      │  │ ImuOffice │  │   Alice IA      │  │
│  │  public   │  │  (modules  │  │ Education │  │   Education     │  │
│  │ (vitrine) │  │ scolaires) │  │           │  │   (tuteur IA)   │  │
│  └───────────┘  └─────┬──────┘  └─────┬─────┘  └────────┬────────┘  │
│                       │               │                  │            │
└───────────────────────┼───────────────┼──────────────────┼────────────┘
                        │               │                  │
              ┌─────────▼───────────────▼──────────────────▼──────────┐
              │              platform-core (Fastify)                  │
              │                                                        │
              │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
              │  │  ENT Module  │  │ Office Module│  │ Alice Module│  │
              │  │              │  │              │  │             │  │
              │  │ • Grades     │  │ • Documents  │  │ • Tutoring  │  │
              │  │ • Absences   │  │ • Sheets     │  │ • Exercise  │  │
              │  │ • Timetable  │  │ • Slides     │  │   generator │  │
              │  │ • Homework   │  │ • Drive      │  │ • Correction│  │
              │  └──────────────┘  └──────────────┘  └─────────────┘  │
              │                                                        │
              │  ┌──────────────┐  ┌──────────────┐                   │
              │  │  Auth Module │  │  RBAC Module │                   │
              │  │ (SAML/OIDC/  │  │ (8 rôles     │                   │
              │  │  CAS/Shib.)  │  │  éducation)  │                   │
              │  └──────────────┘  └──────────────┘                   │
              └───────────────────────────┬───────────────────────────┘
                                          │
              ┌───────────────────────────▼───────────────────────────┐
              │                     Supabase                          │
              │                                                        │
              │  PostgreSQL (données ENT)  │  Storage (ImuDrive edu)  │
              │  RLS par établissement     │  Buckets par organisation │
              │  RLS par age-tier          │                          │
              └────────────────────────────────────────────────────────┘
                                          │
              ┌───────────────────────────▼───────────────────────────┐
              │            Intégrations externes                      │
              │                                                        │
              │  Pronote API  │  Skolengo API  │  GEPI  │  ADN LDAP   │
              │  LTI 1.3      │  SCIM 2.0      │  GAR   │  Shibboleth │
              └────────────────────────────────────────────────────────┘
```

---

## 2. Multi-tenant par établissement

Chaque établissement est un **tenant isolé**. L'isolation est assurée à trois niveaux :

### 2.1 Niveau DNS (optionnel premium)

```
lycee-pasteur.education.imuchat.app  → tenant: lycee_pasteur_paris_id
univ-grenoble.education.imuchat.app  → tenant: univ_grenoble_alpes_id
```

### 2.2 Niveau Supabase (Row Level Security)

Toutes les tables ENT ont une colonne `organization_id`. Les politiques RLS garantissent qu'aucun utilisateur ne peut lire les données d'un autre établissement.

```sql
-- Politique RLS type sur toutes les tables ENT
CREATE POLICY "tenant_isolation"
ON ent_grades
FOR ALL
USING (
  organization_id = (
    SELECT organization_id
    FROM profiles
    WHERE id = auth.uid()
  )
);
```

### 2.3 Niveau application (middleware)

```typescript
// middleware ENT — platform-core
export async function eduTenantMiddleware(req: FastifyRequest, reply: FastifyReply) {
  const user = req.user; // injecté par auth middleware
  const orgId = await getUserOrganizationId(user.uid);

  if (!orgId) {
    return reply.status(403).send({ error: 'Not associated with an educational institution' });
  }

  req.organizationId = orgId;
  req.organizationType = await getOrganizationType(orgId); // 'school' | 'university' | 'cfa'
}
```

---

## 3. Authentification & SSO

L'ENT doit s'intégrer avec les systèmes d'authentification académiques existants.

### 3.1 Protocoles supportés

| Protocole | Usage | Établissements cibles |
|---|---|---|
| **SAML 2.0** | SSO enterprise | Universités, grandes écoles |
| **OpenID Connect** | SSO moderne | Tous établissements |
| **CAS (Central Auth Service)** | SSO académique FR | Universités françaises |
| **Shibboleth** | Fédération d'identité | RENATER (réseau éducatif FR) |
| **ENT/GAR** | SSO collèges/lycées FR | Collèges, lycées (via rectorats) |
| **LDAP / Active Directory** | Annuaire établissement | Tous (optionnel) |
| **Email magique** | Accès simple | Écoles primaires, parents |

### 3.2 Implémentation SSO dans platform-core

```typescript
// platform-core/src/modules/edu/SSOModule.ts

export class EduSSOModule extends BaseModule {
  // SAML 2.0
  async handleSAMLCallback(samlResponse: string, orgId: string): Promise<AuthResult> {
    const profile = await parseSAMLResponse(samlResponse);
    const user = await this.upsertEduUser({
      externalId: profile.nameId,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      role: mapSAMLRoleToEduRole(profile.groups),
      organizationId: orgId,
    });
    return { user, token: await generateJWT(user) };
  }

  // CAS (universités françaises)
  async handleCASCallback(ticket: string, serviceUrl: string, orgId: string): Promise<AuthResult> {
    const casProfile = await validateCASTicket(ticket, serviceUrl);
    return this.upsertAndAuthenticate(casProfile, orgId);
  }

  // Shibboleth / RENATER
  async handleShibbolethAttributes(attrs: ShibbolethAttributes, orgId: string): Promise<AuthResult> {
    return this.upsertAndAuthenticate({
      email: attrs['urn:oid:0.9.2342.19200300.100.1.3'],
      firstName: attrs['urn:oid:2.5.4.42'],
      lastName: attrs['urn:oid:2.5.4.4'],
      role: attrs['eduPersonAffiliation'] === 'faculty' ? 'TEACHER' : 'STUDENT',
    }, orgId);
  }
}
```

### 3.3 Provisioning automatique (SCIM 2.0)

Les établissements peuvent synchroniser automatiquement leurs annuaires :

```
POST /api/edu/scim/v2/Users        → Créer un utilisateur
PUT  /api/edu/scim/v2/Users/:id    → Mettre à jour
DELETE /api/edu/scim/v2/Users/:id  → Désactiver (soft delete)
POST /api/edu/scim/v2/Groups       → Créer une classe/groupe
```

---

## 4. Intégration LTI 1.3

LTI (Learning Tools Interoperability) permet d'intégrer ImuChat dans les ENT existants et d'intégrer des outils tiers dans ImuChat.

### 4.1 ImuChat comme fournisseur LTI (Tool Provider)

Des ENT comme Pronote ou Moodle peuvent lancer ImuChat directement depuis leur interface :

```
ENT existant (Pronote)  →  LTI Launch Request  →  ImuChat Education
     [élève clique sur "Ouvrir ImuChat"]
              ↓
     ImuChat reçoit le context LTI
     (élève identifié, classe connue, cours actif)
              ↓
     Ouverture directe sur le bon contexte
     (devoirs de la classe, documents du cours)
```

### 4.2 Implémentation LTI

```typescript
// platform-core/src/routes/edu/lti.ts

fastify.post('/api/edu/lti/launch', async (req, reply) => {
  const ltiMessage = req.body;

  // Valider la signature LTI 1.3 (JWT signé par la plateforme)
  const validated = await validateLTI13Launch(ltiMessage, {
    clientId: process.env.LTI_CLIENT_ID!,
    jwksUrl: ltiMessage['https://purl.imsglobal.org/spec/lti/claim/tool_platform'].jwks_url,
  });

  // Extraire le contexte
  const context = {
    userId: validated.sub,
    email: validated.email,
    name: validated.name,
    roles: validated['https://purl.imsglobal.org/spec/lti/claim/roles'],
    courseId: validated['https://purl.imsglobal.org/spec/lti/claim/context']?.id,
    courseName: validated['https://purl.imsglobal.org/spec/lti/claim/context']?.title,
    organizationId: extractOrgFromIssuer(validated.iss),
  };

  // Créer ou retrouver l'utilisateur
  const user = await upsertEduUserFromLTI(context);
  const token = await generateJWT(user);

  // Rediriger vers l'app avec le token
  const redirectUrl = buildEduAppUrl(context, token);
  return reply.redirect(redirectUrl);
});
```

---

## 5. Intégration avec les ENT français existants

### 5.1 Pronote (Index-Education)

Pronote propose une API (Pronote API Partenaires) permettant de lire les données ENT :

```typescript
// services/edu/pronoteSync.ts

export class PronoteAdapter {
  constructor(private config: PronoteConfig) {}

  async syncTimetable(classId: string): Promise<TimetableSlot[]> {
    const response = await this.pronoteClient.get(`/emploi-du-temps/${classId}`);
    return response.data.map(mapPronoteSlotToImuSlot);
  }

  async syncGrades(studentId: string): Promise<Grade[]> {
    const response = await this.pronoteClient.get(`/eleve/${studentId}/notes`);
    return response.data.map(mapPronoteGradeToImuGrade);
  }

  async syncAbsences(classId: string, date: Date): Promise<Absence[]> {
    const response = await this.pronoteClient.get(`/classe/${classId}/absences`, {
      params: { date: format(date, 'yyyy-MM-dd') }
    });
    return response.data.map(mapPronoteAbsenceToImuAbsence);
  }
}
```

### 5.2 GAR (Gestionnaire d'Accès aux Ressources)

Le GAR est le SSO officiel des établissements scolaires français (collèges, lycées). ImuChat doit être référencé comme ressource numérique du GAR.

```
Processus de référencement GAR :
1. Dépôt du dossier sur la plateforme GAR (Canopé)
2. Certification RGPD et conformité données mineurs
3. Intégration SAML 2.0 avec les IDentity Providers des académies
4. Tests avec 2-3 rectorats pilotes
5. Déploiement national
```

### 5.3 Skolengo (ex ENT Kosmos)

```typescript
// services/edu/skolengoSync.ts — via API Skolengo REST
export class SkolengoAdapter {
  async importClasses(schoolId: string): Promise<EduClass[]> { ... }
  async importUsers(schoolId: string): Promise<EduUser[]> { ... }
  async pushGrade(grade: Grade): Promise<void> { ... } // Write back vers Skolengo
}
```

---

## 6. Architecture des données temps réel

### 6.1 Socket.IO rooms éducation

Les événements temps réel utilisent le `WebSocketModule` existant du platform-core :

```typescript
// Rooms Socket.IO pour l'éducation
`edu:org:${orgId}`              // Tous les membres d'un établissement
`edu:class:${classId}`          // Tous les membres d'une classe
`edu:teacher:${teacherId}`      // Enseignant et ses classes
`edu:student:${studentId}`      // Élève (devoirs, notes, messages)
`edu:parent:${parentId}`        // Parent (notifications enfant)
`edu:admin:${orgId}`            // Direction et administration

// Événements émis
'edu:grade:new'              // Nouvelle note publiée
'edu:absence:recorded'       // Absence enregistrée
'edu:homework:assigned'      // Nouveau devoir
'edu:timetable:changed'      // Changement emploi du temps
'edu:message:parent'         // Message enseignant → parent
'edu:announcement:class'     // Annonce dans la classe
```

### 6.2 Gestion des notifications push (FCM)

```typescript
// services/edu/notifications.ts

export async function notifyHomeworkAssigned(homework: Homework, classId: string) {
  const students = await getClassStudents(classId);
  const parents = await getParentsOfStudents(students.map(s => s.id));

  // Notifier les élèves
  await sendBulkPush(students.map(s => s.fcmToken), {
    title: `Nouveau devoir — ${homework.subject}`,
    body: `À rendre le ${format(homework.dueDate, 'dd/MM')} : ${homework.title}`,
    data: { type: 'edu:homework', homeworkId: homework.id },
  });

  // Notifier les parents (résumé quotidien ou immédiat selon préférences)
  const immediateParents = parents.filter(p => p.notifPreference === 'immediate');
  await sendBulkPush(immediateParents.map(p => p.fcmToken), {
    title: `Devoir donné à ${homework.studentName}`,
    body: `${homework.subject} — À rendre le ${format(homework.dueDate, 'dd/MM')}`,
    data: { type: 'edu:homework:parent', childId: homework.studentId },
  });
}
```

---

## 7. ImuDrive Éducation

ImuDrive est le stockage de fichiers de la plateforme, adapté à l'éducation :

### 7.1 Arborescence des buckets Supabase

```
Bucket: edu-{orgId}/
├── classes/
│   └── {classId}/
│       ├── resources/          ← Ressources partagées par l'enseignant
│       ├── homework/           ← Devoirs rendus par les élèves
│       └── shared/             ← Documents collaboratifs de la classe
├── teachers/
│   └── {teacherId}/
│       ├── courses/            ← Cours préparés
│       ├── corrections/        ← Corrections types (privé)
│       └── templates/          ← Templates de cours
├── students/
│   └── {studentId}/
│       ├── personal/           ← Documents personnels (50 Go)
│       └── submitted/          ← Devoirs rendus
└── org/
    ├── admin/                  ← Documents direction
    ├── public/                 ← Documents partagés établissement
    └── archive/                ← Archives (accès direction seulement)
```

### 7.2 Quotas par rôle

| Rôle | Quota personnel | Quota partagé |
|---|---|---|
| Élève (KIDS/JUNIOR/TEEN) | 5 Go | 1 Go par classe |
| Étudiant (ADULT) | 50 Go | 10 Go par groupe |
| Enseignant | 20 Go | 5 Go par classe |
| Direction / Admin | 50 Go | Illimité (org) |
| Établissement (org total) | Configurable | — |

---

## 8. Sécurité & conformité spécifique éducation

### 8.1 Conformité RGPD mineurs (Art. 8)

La conformité RGPD pour les mineurs s'appuie sur l'architecture age-tier existante d'ImuChat :

```typescript
// Mapping âge → tier pour l'éducation
const EDU_AGE_TIER_MAP = {
  primarySchool: 'KIDS',   // CP→CM2 (6-11 ans)
  middleSchool: 'JUNIOR',  // 6e→4e (11-14 ans)
  highSchool: 'TEEN',      // 3e→Terminale (14-18 ans)
  university: 'ADULT',     // 18+
};
```

Restrictions spécifiques dans le contexte éducatif :
- **Aucun tracking comportemental** sur les élèves (KIDS/JUNIOR/TEEN)
- **Aucune publicité** dans l'interface éducation
- **Consentement parental enregistré** et vérifiable pour chaque élève mineur
- **Droit à l'effacement** exécutable par la direction de l'établissement
- **Export complet** des données d'un élève en JSON/CSV sur demande

### 8.2 Chiffrement

| Donnée | Méthode |
|---|---|
| Mots de passe | bcrypt (cost 12) |
| Données personnelles élèves | AES-256 au repos (Supabase Vault) |
| Communications parents-enseignants | TLS 1.3 en transit |
| Notes et bulletins | AES-256 + accès RLS strict |
| Documents ImuDrive | AES-256 (Supabase Storage) |
| Données IA Alice | Aucun stockage persistant par défaut |

### 8.3 Audit trail éducation

Toutes les actions sensibles sont loggées dans `edu_audit_logs` :

```typescript
type EduAuditAction =
  | 'grade.create' | 'grade.modify' | 'grade.delete'
  | 'absence.record' | 'absence.justify' | 'absence.delete'
  | 'student.data.export' | 'student.data.delete'
  | 'parent.message.send' | 'bulletin.publish'
  | 'homework.assign' | 'homework.grade'
  | 'admin.user.create' | 'admin.user.delete' | 'admin.role.change';
```

---

## 9. API publique ENT

L'ENT expose une API REST documentée pour les intégrations partenaires :

### 9.1 Endpoints principaux

```
Base URL : api.imuchat.app/edu/v1/

# Organisations
GET    /organizations/:orgId

# Classes
GET    /organizations/:orgId/classes
POST   /organizations/:orgId/classes
GET    /classes/:classId
PATCH  /classes/:classId

# Utilisateurs
GET    /organizations/:orgId/users
POST   /organizations/:orgId/users              ← Provisioning manuel
GET    /users/:userId
PATCH  /users/:userId

# Emploi du temps
GET    /classes/:classId/timetable?week=2026-W12
POST   /classes/:classId/timetable/slots
PATCH  /timetable/slots/:slotId

# Notes
GET    /classes/:classId/grades?subject=Maths&period=T1
POST   /classes/:classId/grades                 ← Saisir une note
GET    /students/:studentId/grades
PATCH  /grades/:gradeId

# Absences
GET    /classes/:classId/absences?date=2026-03-14
POST   /absences                                ← Saisir une absence
PATCH  /absences/:absenceId                     ← Justifier

# Devoirs
GET    /classes/:classId/homework
POST   /homework
GET    /students/:studentId/homework

# Communications
GET    /users/:userId/messages
POST   /messages/parent                         ← Message enseignant→parent
GET    /organizations/:orgId/announcements
POST   /announcements
```

### 9.2 Webhooks

```typescript
// Événements déclenchables en webhook
type EduWebhookEvent =
  | 'student.enrolled'
  | 'student.graduated'
  | 'grade.published'
  | 'absence.recorded'
  | 'bulletin.generated'
  | 'parent.message.sent';
```

---

## 10. Déploiement

### 10.1 Options de déploiement

| Option | Description | Cible |
|---|---|---|
| **Cloud mutualisé** | SaaS hébergé sur infrastructure ImuChat UE | PME, écoles, collèges, lycées |
| **Cloud dédié** | Instance Kubernetes dédiée par académie | Académies régionales |
| **On-Premise** | Déploiement sur infrastructure de l'académie | Ministère, rectorats exigeants |

### 10.2 Stack déploiement

```yaml
# docker-compose.edu.yml (dev / petits établissements)
services:
  platform-core-edu:
    image: imuchat/platform-core:latest
    environment:
      - EDU_MODE=true
      - ORG_ID=${ORG_ID}
      - SUPABASE_URL=${SUPABASE_URL}
    ports:
      - "3000:3000"  # REST
      - "3001:3001"  # WebSocket

  # Pronote sync worker (optionnel)
  pronote-sync:
    image: imuchat/edu-sync:latest
    environment:
      - PRONOTE_URL=${PRONOTE_URL}
      - SYNC_INTERVAL=3600  # toutes les heures
```
