# 🗄️ 06 — Schéma de Base de Données · ENT ImuChat Éducation

> **Document :** Schéma SQL complet (PostgreSQL / Supabase + Drizzle ORM)
> **RLS activée sur toutes les tables · Multi-tenant par `organization_id`**

---

## 1. Organisations & établissements

```sql
-- ================================================================
-- ORGANISATIONS ÉDUCATIVES
-- ================================================================

CREATE TYPE edu_org_type AS ENUM (
  'primary_school',     -- École primaire (CP-CM2)
  'middle_school',      -- Collège (6e-3e)
  'high_school',        -- Lycée général et technologique
  'vocational_school',  -- Lycée professionnel / CFA
  'university',         -- Université
  'grande_ecole',       -- Grande école
  'research_lab',       -- Laboratoire de recherche
  'training_center'     -- Centre de formation continue
);

CREATE TABLE edu_organizations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  short_name            TEXT,                          -- "Lycée Pasteur" → "LPasteur"
  type                  edu_org_type NOT NULL,
  uai_code              TEXT UNIQUE,                   -- Code UAI (identifiant officiel FR)
  address               JSONB,                         -- { street, city, zip, country }
  contact_email         TEXT,
  contact_phone         TEXT,
  logo_url              TEXT,
  primary_color         TEXT DEFAULT '#7C3AED',        -- Couleur marque établissement
  website_url           TEXT,
  custom_domain         TEXT UNIQUE,                   -- "lycee-pasteur.education.imuchat.app"
  sso_config            JSONB,                         -- { provider, saml_config, cas_url, ... }
  scim_token            TEXT,                          -- Token pour provisioning SCIM
  active_modules        TEXT[] DEFAULT ARRAY[
    'timetable', 'gradebook', 'absences',
    'homework', 'messaging', 'resources'
  ],
  settings              JSONB DEFAULT '{}',
  subscription_plan     TEXT DEFAULT 'school',         -- 'school'|'university'|'enterprise'
  subscription_expires_at TIMESTAMPTZ,
  is_active             BOOLEAN DEFAULT true,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Index recherche par code UAI
CREATE UNIQUE INDEX idx_edu_org_uai ON edu_organizations(uai_code) WHERE uai_code IS NOT NULL;
```

---

## 2. Utilisateurs & rôles éducation

```sql
-- ================================================================
-- PROFILS UTILISATEURS ÉDUCATION
-- ================================================================

CREATE TYPE edu_role AS ENUM (
  'ORG_SUPER_ADMIN',
  'ORG_DIRECTOR',
  'ORG_ADMIN_EDU',
  'TEACHER',
  'EDU_STAFF',
  'STUDENT',
  'PARENT',
  'GUEST'
);

CREATE TYPE edu_staff_specialty AS ENUM (
  'CPE', 'DOC', 'INFIRMIER', 'AESH', 'PSYCHOLOGUE', 'ASSISTANT'
);

CREATE TABLE edu_user_profiles (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id       UUID NOT NULL REFERENCES edu_organizations(id) ON DELETE CASCADE,
  role                  edu_role NOT NULL,
  staff_specialty       edu_staff_specialty,           -- Uniquement pour EDU_STAFF
  -- Infos pédagogiques
  student_number        TEXT,                          -- Numéro étudiant / INE
  registration_year     INTEGER,                       -- Année d'inscription
  graduation_year       INTEGER,                       -- Année de diplôme prévue
  -- Données enseignant
  subjects              TEXT[],                        -- Matières enseignées
  -- Liens relationnels
  class_ids             UUID[],                        -- Classes de l'élève
  teaching_class_ids    UUID[],                        -- Classes de l'enseignant
  parent_of_student_ids UUID[],                        -- IDs des enfants (PARENT)
  -- Compte
  is_active             BOOLEAN DEFAULT true,
  expires_at            TIMESTAMPTZ,                   -- Pour les GUEST
  last_active_at        TIMESTAMPTZ,
  notification_preferences JSONB DEFAULT '{
    "grades": true,
    "absences": true,
    "homework": true,
    "messages": true,
    "announcements": true,
    "bulletin": true
  }',
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, organization_id)
);

-- RLS : un utilisateur ne voit que son profil
CREATE POLICY "edu_profile_own"
  ON edu_user_profiles FOR SELECT
  USING (user_id = auth.uid());

-- Les admins voient tous les profils de leur org
CREATE POLICY "edu_profile_org_admin"
  ON edu_user_profiles FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM edu_user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('ORG_SUPER_ADMIN', 'ORG_DIRECTOR', 'ORG_ADMIN_EDU')
    )
  );
```

---

## 3. Structure pédagogique

```sql
-- ================================================================
-- ANNÉES SCOLAIRES, PÉRIODES, NIVEAUX
-- ================================================================

CREATE TABLE edu_school_years (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES edu_organizations(id),
  name              TEXT NOT NULL,                -- "2025-2026"
  start_date        DATE NOT NULL,
  end_date          DATE NOT NULL,
  is_active         BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE edu_grading_periods (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES edu_organizations(id),
  school_year_id    UUID NOT NULL REFERENCES edu_school_years(id),
  name              TEXT NOT NULL,               -- "Trimestre 1", "Semestre 1"
  type              TEXT NOT NULL CHECK (type IN ('trimester', 'semester', 'quarter', 'custom')),
  start_date        DATE NOT NULL,
  end_date          DATE NOT NULL,
  bulletin_date     DATE,
  is_active         BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE edu_levels (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES edu_organizations(id),
  name              TEXT NOT NULL,               -- "6e", "Terminale S", "L3 Informatique"
  short_name        TEXT,                        -- "6", "TerS", "L3I"
  order_index       INTEGER,                     -- Pour le tri
  org_type          edu_org_type NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- CLASSES & MATIÈRES
-- ================================================================

CREATE TABLE edu_classes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES edu_organizations(id),
  school_year_id    UUID NOT NULL REFERENCES edu_school_years(id),
  level_id          UUID REFERENCES edu_levels(id),
  name              TEXT NOT NULL,               -- "6ème A", "Terminale STI2D 1"
  description       TEXT,
  main_teacher_id   UUID REFERENCES edu_user_profiles(id),  -- Professeur principal
  capacity          INTEGER DEFAULT 30,
  room_id           UUID,
  color             TEXT DEFAULT '#7C3AED',       -- Couleur dans l'emploi du temps
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE edu_class_members (
  class_id          UUID NOT NULL REFERENCES edu_classes(id) ON DELETE CASCADE,
  user_profile_id   UUID NOT NULL REFERENCES edu_user_profiles(id) ON DELETE CASCADE,
  role              TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'delegate')),
  joined_at         TIMESTAMPTZ DEFAULT NOW(),
  left_at           TIMESTAMPTZ,
  PRIMARY KEY (class_id, user_profile_id)
);

CREATE TABLE edu_subjects (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES edu_organizations(id),
  name              TEXT NOT NULL,               -- "Mathématiques"
  short_code        TEXT NOT NULL,               -- "MATHS"
  color             TEXT,                        -- Couleur dans l'emploi du temps
  coefficient       DECIMAL(3,1) DEFAULT 1.0,
  is_main           BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, short_code)
);

-- ================================================================
-- SALLES
-- ================================================================

CREATE TABLE edu_rooms (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES edu_organizations(id),
  name              TEXT NOT NULL,               -- "Salle 101", "Labo Physique"
  type              TEXT DEFAULT 'classroom' CHECK (type IN (
    'classroom', 'lab', 'gym', 'library', 'computer_room', 'auditorium', 'other'
  )),
  capacity          INTEGER,
  equipment         TEXT[],                      -- ["videoprojector", "whiteboard", "computers"]
  building          TEXT,
  floor             INTEGER,
  is_active         BOOLEAN DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Emploi du temps

```sql
-- ================================================================
-- EMPLOI DU TEMPS
-- ================================================================

CREATE TABLE edu_timetable_slots (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id       UUID NOT NULL REFERENCES edu_organizations(id),
  class_id              UUID NOT NULL REFERENCES edu_classes(id),
  teacher_profile_id    UUID NOT NULL REFERENCES edu_user_profiles(id),
  subject_id            UUID NOT NULL REFERENCES edu_subjects(id),
  room_id               UUID REFERENCES edu_rooms(id),
  -- Horaires
  day_of_week           INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 6), -- 1=Lundi
  start_time            TIME NOT NULL,
  end_time              TIME NOT NULL,
  -- Récurrence
  recurrence            TEXT DEFAULT 'weekly' CHECK (recurrence IN ('weekly', 'biweekly_odd', 'biweekly_even', 'once')),
  valid_from            DATE NOT NULL,
  valid_until           DATE,
  -- Annulation / remplacement
  is_cancelled          BOOLEAN DEFAULT false,
  cancellation_reason   TEXT,
  substitute_teacher_id UUID REFERENCES edu_user_profiles(id),
  cancellation_note     TEXT,                    -- Message aux élèves
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes fréquentes (emploi du temps d'une classe cette semaine)
CREATE INDEX idx_timetable_class_day ON edu_timetable_slots(class_id, day_of_week);
CREATE INDEX idx_timetable_teacher ON edu_timetable_slots(teacher_profile_id);

-- RLS
CREATE POLICY "timetable_org_isolation" ON edu_timetable_slots
  FOR ALL USING (organization_id = get_user_org_id(auth.uid()));
```

---

## 5. Notes & évaluations

```sql
-- ================================================================
-- NOTES
-- ================================================================

CREATE TABLE edu_evaluations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES edu_organizations(id),
  class_id          UUID NOT NULL REFERENCES edu_classes(id),
  subject_id        UUID NOT NULL REFERENCES edu_subjects(id),
  teacher_profile_id UUID NOT NULL REFERENCES edu_user_profiles(id),
  period_id         UUID NOT NULL REFERENCES edu_grading_periods(id),
  -- Évaluation
  title             TEXT NOT NULL,               -- "Contrôle fractions", "DM #3"
  type              TEXT NOT NULL CHECK (type IN (
    'test', 'homework', 'oral', 'project', 'participation', 'exam', 'competition'
  )),
  date              DATE NOT NULL,
  max_score         DECIMAL(5,2) DEFAULT 20.00,
  coefficient       DECIMAL(3,1) DEFAULT 1.0,
  is_published      BOOLEAN DEFAULT false,       -- Les élèves voient leurs notes seulement si publié
  description       TEXT,
  correction_url    TEXT,                        -- Lien vers la correction type (ImuDrive)
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE edu_grades (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id       UUID NOT NULL REFERENCES edu_organizations(id),
  evaluation_id         UUID NOT NULL REFERENCES edu_evaluations(id) ON DELETE CASCADE,
  student_profile_id    UUID NOT NULL REFERENCES edu_user_profiles(id),
  -- Note
  score                 DECIMAL(5,2),            -- NULL si absent / dispensé
  status                TEXT DEFAULT 'graded' CHECK (status IN (
    'graded', 'absent', 'dispensed', 'cheating', 'not_rendered'
  )),
  teacher_comment       TEXT,                    -- Commentaire individuel
  -- Compétences (si évaluation par compétences)
  competencies          JSONB,                   -- { "C1": "A", "C2": "B", "C3": "NA" }
  is_visible_to_student BOOLEAN DEFAULT false,   -- true quand l'enseignant publie
  is_visible_to_parent  BOOLEAN DEFAULT false,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(evaluation_id, student_profile_id)
);

-- RLS : Un élève ne voit QUE ses notes ET seulement si publiées
CREATE POLICY "grades_student_own" ON edu_grades
  FOR SELECT USING (
    student_profile_id = get_user_profile_id(auth.uid(), organization_id)
    AND is_visible_to_student = true
  );

-- Un enseignant voit les notes de ses classes uniquement
CREATE POLICY "grades_teacher_own_classes" ON edu_grades
  FOR ALL USING (
    evaluation_id IN (
      SELECT id FROM edu_evaluations
      WHERE teacher_profile_id = get_user_profile_id(auth.uid(), organization_id)
    )
  );
```

---

## 6. Devoirs

```sql
-- ================================================================
-- DEVOIRS
-- ================================================================

CREATE TABLE edu_homework (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id       UUID NOT NULL REFERENCES edu_organizations(id),
  class_id              UUID NOT NULL REFERENCES edu_classes(id),
  subject_id            UUID NOT NULL REFERENCES edu_subjects(id),
  teacher_profile_id    UUID NOT NULL REFERENCES edu_user_profiles(id),
  -- Devoir
  title                 TEXT NOT NULL,
  instructions          TEXT,                    -- Contenu riche (HTML/Markdown)
  type                  TEXT DEFAULT 'to_do' CHECK (type IN (
    'to_do',        -- Devoir à rendre
    'to_learn',     -- Leçon à apprendre
    'to_read',      -- Texte à lire
    'quiz',         -- Quiz en ligne
    'project'       -- Projet à long terme
  )),
  due_date              TIMESTAMPTZ NOT NULL,
  assigned_date         TIMESTAMPTZ DEFAULT NOW(),
  publish_at            TIMESTAMPTZ DEFAULT NOW(), -- Peut être planifié dans le futur
  -- Ressources attachées
  attachment_ids        UUID[],                  -- IDs de fichiers ImuDrive
  external_links        TEXT[],
  -- Correction
  correction_published  BOOLEAN DEFAULT false,
  correction_url        TEXT,
  max_score             DECIMAL(5,2),
  evaluation_id         UUID REFERENCES edu_evaluations(id), -- Si ce devoir est noté
  -- Groupes
  target_group          TEXT DEFAULT 'all' CHECK (target_group IN ('all', 'group_a', 'group_b', 'group_c')),
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE edu_homework_submissions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id       UUID NOT NULL REFERENCES edu_organizations(id),
  homework_id           UUID NOT NULL REFERENCES edu_homework(id) ON DELETE CASCADE,
  student_profile_id    UUID NOT NULL REFERENCES edu_user_profiles(id),
  -- Rendu
  content               TEXT,                    -- Texte inline
  attachment_ids        UUID[],                  -- Fichiers rendus (ImuDrive)
  imudoc_id             UUID,                    -- Si rendu via ImuDocs
  submitted_at          TIMESTAMPTZ DEFAULT NOW(),
  is_late               BOOLEAN DEFAULT false,
  -- Correction
  score                 DECIMAL(5,2),
  teacher_comment       TEXT,
  corrected_at          TIMESTAMPTZ,
  -- Statut
  status                TEXT DEFAULT 'submitted' CHECK (status IN (
    'draft', 'submitted', 'corrected', 'returned'
  )),
  UNIQUE(homework_id, student_profile_id)
);
```

---

## 7. Absences

```sql
-- ================================================================
-- ABSENCES & VIE SCOLAIRE
-- ================================================================

CREATE TABLE edu_absences (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id       UUID NOT NULL REFERENCES edu_organizations(id),
  student_profile_id    UUID NOT NULL REFERENCES edu_user_profiles(id),
  timetable_slot_id     UUID REFERENCES edu_timetable_slots(id),
  -- Absence
  date                  DATE NOT NULL,
  start_time            TIME,
  end_time              TIME,
  type                  TEXT DEFAULT 'absence' CHECK (type IN ('absence', 'late', 'early_departure', 'exemption')),
  minutes_late          INTEGER,                 -- Pour les retards
  -- Enregistrement
  recorded_by           UUID NOT NULL REFERENCES edu_user_profiles(id),
  recorded_at           TIMESTAMPTZ DEFAULT NOW(),
  -- Justification
  is_justified          BOOLEAN DEFAULT false,
  justification_reason  TEXT,
  justification_doc_url TEXT,                    -- Document justificatif (ImuDrive)
  justified_by          UUID REFERENCES edu_user_profiles(id),
  justified_at          TIMESTAMPTZ,
  -- Notification parents
  parent_notified_at    TIMESTAMPTZ,
  parent_acknowledged_at TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_absences_student_date ON edu_absences(student_profile_id, date);
CREATE INDEX idx_absences_class ON edu_absences(organization_id, date);

-- ================================================================
-- INCIDENTS DISCIPLINAIRES
-- ================================================================

CREATE TABLE edu_incidents (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id       UUID NOT NULL REFERENCES edu_organizations(id),
  student_profile_ids   UUID[],                  -- Peut impliquer plusieurs élèves
  reported_by           UUID NOT NULL REFERENCES edu_user_profiles(id),
  -- Incident
  date                  DATE NOT NULL,
  type                  TEXT NOT NULL CHECK (type IN (
    'disruption', 'violence', 'harassment', 'property_damage',
    'prohibited_item', 'cheating', 'cyberbullying', 'other'
  )),
  description           TEXT NOT NULL,
  location              TEXT,                    -- "Salle 101", "Cour de récréation"
  -- Sanction
  sanction_type         TEXT CHECK (sanction_type IN (
    'warning', 'detention', 'parent_meeting', 'temp_exclusion', 'perm_exclusion', 'none'
  )),
  sanction_date         DATE,
  sanction_notes        TEXT,
  -- Statut
  status                TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'escalated')),
  resolved_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 8. Communication & messagerie

```sql
-- ================================================================
-- COMMUNICATION PARENTS-ÉTABLISSEMENT
-- ================================================================

CREATE TABLE edu_messages (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id       UUID NOT NULL REFERENCES edu_organizations(id),
  from_profile_id       UUID NOT NULL REFERENCES edu_user_profiles(id),
  -- Destinataires (un seul parmi les 3)
  to_profile_id         UUID REFERENCES edu_user_profiles(id),      -- Message individuel
  to_class_id           UUID REFERENCES edu_classes(id),             -- Message à une classe
  to_all_org            BOOLEAN DEFAULT false,                       -- Annonce établissement
  -- Message
  subject               TEXT,
  body                  TEXT NOT NULL,
  attachment_ids        UUID[],
  priority              TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent')),
  -- Statut
  is_read               BOOLEAN DEFAULT false,
  read_at               TIMESTAMPTZ,
  requires_acknowledgement BOOLEAN DEFAULT false,
  acknowledged_at       TIMESTAMPTZ,
  parent_message_id     UUID REFERENCES edu_messages(id),            -- Réponse
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- ANNONCES
-- ================================================================

CREATE TABLE edu_announcements (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id       UUID NOT NULL REFERENCES edu_organizations(id),
  author_profile_id     UUID NOT NULL REFERENCES edu_user_profiles(id),
  -- Ciblage
  target_type           TEXT NOT NULL CHECK (target_type IN ('all', 'class', 'level', 'role')),
  target_ids            UUID[],                  -- IDs des classes / niveaux concernés
  target_roles          edu_role[],              -- Rôles ciblés si target_type = 'role'
  -- Annonce
  title                 TEXT NOT NULL,
  body                  TEXT NOT NULL,
  attachment_ids        UUID[],
  type                  TEXT DEFAULT 'info' CHECK (type IN ('info', 'event', 'alert', 'meeting')),
  -- Planification
  publish_at            TIMESTAMPTZ DEFAULT NOW(),
  expires_at            TIMESTAMPTZ,
  is_published          BOOLEAN DEFAULT false,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 9. Fonctions SQL utilitaires

```sql
-- ================================================================
-- FONCTIONS UTILITAIRES
-- ================================================================

-- Récupérer l'organization_id d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_org_id(p_user_id UUID)
RETURNS UUID AS $$
  SELECT organization_id FROM edu_user_profiles
  WHERE user_id = p_user_id AND is_active = true
  LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Récupérer le profil EDU d'un utilisateur dans une org
CREATE OR REPLACE FUNCTION get_user_profile_id(p_user_id UUID, p_org_id UUID)
RETURNS UUID AS $$
  SELECT id FROM edu_user_profiles
  WHERE user_id = p_user_id AND organization_id = p_org_id AND is_active = true;
$$ LANGUAGE SQL STABLE;

-- Calculer la moyenne d'un élève sur une période
CREATE OR REPLACE FUNCTION calculate_student_average(
  p_student_id UUID,
  p_subject_id UUID,
  p_period_id  UUID
)
RETURNS DECIMAL AS $$
DECLARE
  v_weighted_sum DECIMAL := 0;
  v_total_coeff  DECIMAL := 0;
  v_avg          DECIMAL;
BEGIN
  SELECT
    SUM(g.score * e.coefficient),
    SUM(CASE WHEN g.score IS NOT NULL THEN e.coefficient ELSE 0 END)
  INTO v_weighted_sum, v_total_coeff
  FROM edu_grades g
  JOIN edu_evaluations e ON g.evaluation_id = e.id
  WHERE g.student_profile_id = p_student_id
    AND e.subject_id = p_subject_id
    AND e.period_id = p_period_id
    AND g.status = 'graded'
    AND g.is_visible_to_student = true;

  IF v_total_coeff > 0 THEN
    v_avg := v_weighted_sum / v_total_coeff;
  ELSE
    v_avg := NULL;
  END IF;

  RETURN ROUND(v_avg, 2);
END;
$$ LANGUAGE plpgsql STABLE;

-- Compter les absences non justifiées d'un élève sur la période
CREATE OR REPLACE FUNCTION count_unjustified_absences(
  p_student_id UUID,
  p_start_date DATE,
  p_end_date   DATE
)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM edu_absences
  WHERE student_profile_id = p_student_id
    AND date BETWEEN p_start_date AND p_end_date
    AND is_justified = false
    AND type = 'absence';
$$ LANGUAGE SQL STABLE;
```

---

## 10. Migrations Drizzle ORM

```typescript
// platform-core/src/db/schema/education.ts

import { pgTable, uuid, text, boolean, timestamp, date, time, integer, decimal, jsonb } from 'drizzle-orm/pg-core';

export const eduOrganizations = pgTable('edu_organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  type: text('type', { enum: [
    'primary_school', 'middle_school', 'high_school',
    'vocational_school', 'university', 'grande_ecole',
    'research_lab', 'training_center'
  ]}).notNull(),
  uaiCode: text('uai_code').unique(),
  settings: jsonb('settings').default({}),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const eduUserProfiles = pgTable('edu_user_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => authUsers.id).notNull(),
  organizationId: uuid('organization_id').references(() => eduOrganizations.id).notNull(),
  role: text('role', { enum: [
    'ORG_SUPER_ADMIN', 'ORG_DIRECTOR', 'ORG_ADMIN_EDU',
    'TEACHER', 'EDU_STAFF', 'STUDENT', 'PARENT', 'GUEST'
  ]}).notNull(),
  subjects: text('subjects').array(),
  classIds: uuid('class_ids').array(),
  teachingClassIds: uuid('teaching_class_ids').array(),
  parentOfStudentIds: uuid('parent_of_student_ids').array(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// ... (tous les autres modèles suivent le même pattern)
```
