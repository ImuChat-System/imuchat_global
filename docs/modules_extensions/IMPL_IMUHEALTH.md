# 🏥 ImuHealth — Document d'Implémentation Complet

> **Version** : 1.0  
> **Date** : 11 mars 2026  
> **Statut** : 📐 Spécification — prêt pour développement  
> **Priorité** : 🟡 P2 — Niche mais très fidélisant, fort potentiel famille  
> **Dépendances** : `notifications`, `events` (rendez-vous), `ai-assistant` (optionnel)  
> **⚠️ Conformité :** RGPD renforcé (données de santé = catégorie spéciale)

---

## Table des matières

1. [Vision & Positionnement](#1-vision--positionnement)
2. [Architecture générale](#2-architecture-générale)
3. [Schéma de base de données](#3-schéma-de-base-de-données)
4. [API & Routes](#4-api--routes)
5. [Mapping des écrans](#5-mapping-des-écrans)
6. [Composants UI](#6-composants-ui)
7. [Conformité RGPD & Sécurité](#7-conformité-rgpd--sécurité)
8. [Partage familial](#8-partage-familial)
9. [Plan d'implémentation](#9-plan-dimplémentation)

---

## 1. Vision & Positionnement

ImuHealth est un **carnet de santé numérique** personnel et familial. Il centralise les informations médicales de l'utilisateur, suit ses symptômes, rappelle les rendez-vous médicaux, et permet un partage sécurisé avec un proche ou un médecin.

**Positionnement :** pas une app médicale (pas de diagnostic), mais un **organisateur de santé** — comme un carnet de santé papier passé au numérique.

**Cas d'usage :**
- "J'ai eu de la fièvre 3 jours cette semaine — je note ça pour le médecin"
- "Rappelle-moi de prendre mon médicament à 8h"
- "Mon enfant doit faire son rappel vaccin DTP en juin"
- "Je partage mon carnet avec ma maman qui a besoin d'aide"

**Ce que ImuHealth N'EST PAS :**
- ❌ Un outil de diagnostic
- ❌ Un remplacement du médecin
- ❌ Une télémedecine
- ✅ Un organisateur de santé

---

## 2. Architecture générale

```
ImuHealth
│
├── Core Layer
│   ├── HealthContext (React)
│   ├── useHealth hook
│   └── health-store (Zustand)
│
├── Services
│   ├── health-api.ts          — CRUD profils, symptômes, traitements, rdv
│   ├── health-share-api.ts    — Partage sécurisé avec proches
│   └── health-reminder-api.ts — Rappels médicaments / RDV
│
├── Routes (Next.js)
│   ├── /health/               — Hub santé (accueil)
│   ├── /health/profile        — Mon profil médical
│   ├── /health/symptoms       — Journal des symptômes
│   ├── /health/treatments     — Traitements & médicaments
│   ├── /health/appointments   — Rendez-vous médicaux
│   ├── /health/vaccinations   — Carnet vaccinal
│   └── /health/share          — Partage avec proches
│
└── ⚠️ Données chiffrées (AES-256 sur champs sensibles)
```

---

## 3. Schéma de base de données

```sql
-- ================================================================
-- IMUHEALTH — SCHÉMA SUPABASE
-- ================================================================
-- ⚠️ RGPD : Données de santé = catégorie spéciale (Art. 9)
-- Chiffrement applicatif sur les champs sensibles
-- Audit log obligatoire sur tous les accès

-- 1. Profil médical de base
CREATE TABLE IF NOT EXISTS public.health_profiles (
  user_id           UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  birth_date        DATE,
  sex               TEXT CHECK (sex IN ('male', 'female', 'other', 'prefer_not_to_say')),
  blood_type        TEXT CHECK (blood_type IN ('A+','A-','B+','B-','AB+','AB-','O+','O-','unknown')),
  height_cm         INTEGER CHECK (height_cm BETWEEN 50 AND 300),
  weight_kg         NUMERIC(5,1),
  
  -- Champs sensibles (chiffrés côté application avant insertion)
  allergies_enc     TEXT, -- JSON chiffré : [{substance, severity, reaction}]
  chronic_conditions_enc TEXT, -- JSON chiffré : [{name, diagnosed_at, status}]
  emergency_contact_enc  TEXT, -- JSON chiffré : {name, phone, relationship}
  
  -- Consentements explicites RGPD
  consent_data_processing BOOLEAN NOT NULL DEFAULT false,
  consent_date        TIMESTAMPTZ,
  data_retention_months INTEGER NOT NULL DEFAULT 36, -- suppression auto après X mois
  
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- 2. Journal des symptômes
CREATE TABLE IF NOT EXISTS public.health_symptoms (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  symptom_date    TIMESTAMPTZ NOT NULL DEFAULT now(),
  title           TEXT NOT NULL, -- "Maux de tête", "Fièvre", etc.
  description_enc TEXT, -- Chiffré : description détaillée
  severity        INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 10),
  body_location   TEXT, -- "tête", "poitrine", "abdomen", etc.
  duration_minutes INTEGER,
  tags            TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 3. Traitements & médicaments
CREATE TABLE IF NOT EXISTS public.health_treatments (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  type            TEXT NOT NULL DEFAULT 'medication' CHECK (type IN (
    'medication', 'supplement', 'therapy', 'surgery', 'other'
  )),
  dosage          TEXT, -- "500mg", "2 comprimés", etc.
  frequency       TEXT, -- "Matin et soir", "1x par semaine"
  start_date      DATE NOT NULL,
  end_date        DATE,
  prescriber      TEXT, -- nom du médecin
  notes_enc       TEXT, -- Notes chiffrées
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 4. Rappels de médicaments
CREATE TABLE IF NOT EXISTS public.health_reminders (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  treatment_id    UUID REFERENCES public.health_treatments(id) ON DELETE CASCADE,
  reminder_time   TIME NOT NULL,
  days_of_week    INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5,6,7}', -- 1=lundi, 7=dimanche
  is_active       BOOLEAN NOT NULL DEFAULT true,
  last_sent_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 5. Rendez-vous médicaux
CREATE TABLE IF NOT EXISTS public.health_appointments (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  doctor_name     TEXT,
  specialty       TEXT, -- "Généraliste", "Cardiologue", etc.
  location        TEXT,
  appointment_at  TIMESTAMPTZ NOT NULL,
  notes_enc       TEXT,
  status          TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'completed', 'cancelled', 'postponed'
  )),
  reminder_sent   BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 6. Carnet vaccinal
CREATE TABLE IF NOT EXISTS public.health_vaccinations (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vaccine_name    TEXT NOT NULL,
  dose_number     INTEGER DEFAULT 1,
  vaccinated_at   DATE NOT NULL,
  next_dose_at    DATE,
  lot_number      TEXT,
  administered_by TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- 7. Partage du carnet de santé
CREATE TABLE IF NOT EXISTS public.health_shares (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  shared_with_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  access_level    TEXT NOT NULL DEFAULT 'read' CHECK (access_level IN ('read', 'emergency_only')),
  sections        TEXT[] NOT NULL DEFAULT '{appointments,vaccinations}', -- sections partagées
  expires_at      TIMESTAMPTZ,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(owner_id, shared_with_id)
);

-- 8. Audit log (RGPD obligatoire)
CREATE TABLE IF NOT EXISTS public.health_audit_log (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES public.profiles(id),
  actor_id    UUID NOT NULL REFERENCES public.profiles(id), -- qui a accédé
  action      TEXT NOT NULL, -- 'view', 'create', 'update', 'delete', 'export', 'share'
  table_name  TEXT NOT NULL,
  record_id   UUID,
  ip_address  INET,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ================================================================
-- FONCTIONS
-- ================================================================

-- Vaccination due dans les 30 prochains jours
CREATE OR REPLACE FUNCTION public.get_upcoming_vaccinations(p_user_id UUID)
RETURNS TABLE (vaccine_name TEXT, next_dose_at DATE, days_until INTEGER)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT hv.vaccine_name, hv.next_dose_at,
         (hv.next_dose_at - CURRENT_DATE)::INTEGER
  FROM public.health_vaccinations hv
  WHERE hv.user_id = p_user_id
    AND hv.next_dose_at BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
  ORDER BY hv.next_dose_at;
END;
$$;

-- Suppression automatique après retention_months
CREATE OR REPLACE FUNCTION public.cleanup_health_data()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM public.health_symptoms hs
  USING public.health_profiles hp
  WHERE hs.user_id = hp.user_id
    AND hs.created_at < now() - (hp.data_retention_months || ' months')::INTERVAL;
  -- Idem pour les autres tables
END;
$$;

-- RLS
ALTER TABLE public.health_profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_symptoms      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_treatments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_reminders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_appointments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_vaccinations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_shares        ENABLE ROW LEVEL SECURITY;

-- Propriétaire + partenaire de partage autorisé
CREATE POLICY "owner_or_shared" ON public.health_appointments
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.health_shares
      WHERE owner_id = health_appointments.user_id
        AND shared_with_id = auth.uid()
        AND is_active = true
        AND 'appointments' = ANY(sections)
    )
  );
```

---

## 4. API & Routes

### 4.1 Routes Next.js API

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/health/profile` | Mon profil médical |
| `PUT` | `/api/health/profile` | Mettre à jour le profil |
| `GET` | `/api/health/symptoms` | Journal symptoms (filtrable) |
| `POST` | `/api/health/symptoms` | Ajouter un symptôme |
| `GET` | `/api/health/treatments` | Mes traitements actifs |
| `POST` | `/api/health/treatments` | Ajouter un traitement |
| `POST` | `/api/health/treatments/[id]/reminders` | Créer rappel médicament |
| `GET` | `/api/health/appointments` | RDV à venir + passés |
| `POST` | `/api/health/appointments` | Créer un RDV (+ synchro Events) |
| `GET` | `/api/health/vaccinations` | Carnet vaccinal |
| `POST` | `/api/health/vaccinations` | Ajouter une vaccination |
| `GET` | `/api/health/upcoming` | Rappels prochains (vaccins + RDV) |
| `GET` | `/api/health/share` | Partages actifs |
| `POST` | `/api/health/share` | Partager avec un proche |
| `DELETE` | `/api/health/share/[id]` | Révoquer le partage |
| `GET` | `/api/health/export` | Export PDF du carnet (RGPD) |

---

## 5. Mapping des écrans

| Route | Composant | Description |
|-------|-----------|-------------|
| `/health` | `HealthHub` | Résumé : prochains RDV, rappels médicaments, vaccins dus |
| `/health/profile` | `HealthProfile` | Infos de base, allergies, groupe sanguin |
| `/health/symptoms` | `SymptomJournal` | Calendrier + liste symptoms |
| `/health/symptoms/new` | `AddSymptom` | Formulaire saisie symptôme |
| `/health/treatments` | `TreatmentList` | Médicaments actifs + passés |
| `/health/treatments/new` | `AddTreatment` | Formulaire traitement + rappels |
| `/health/appointments` | `AppointmentCalendar` | Vue calendrier + liste |
| `/health/appointments/new` | `AddAppointment` | Formulaire RDV (+ notif Events) |
| `/health/vaccinations` | `VaccinationPassport` | Carnet vaccinal visuel |
| `/health/share` | `HealthShare` | Gérer les partages |

---

## 6. Composants UI

```
components/health/
├── HealthHubWidget.tsx          — Widget du hub principal ImuChat
├── HealthProfileCard.tsx        — Carte récap profil (groupe sanguin, allergies)
├── SymptomCalendar.tsx          — Calendrier des symptômes (heatmap)
├── SymptomItem.tsx              — Item symptôme avec severity badge
├── AddSymptomForm.tsx           — Formulaire avec body selector
├── BodyMapPicker.tsx            — Silhouette humaine pour localiser
├── SeveritySlider.tsx           — Slider 1-10 avec emoji indicatif
├── TreatmentCard.tsx            — Card médicament + prochaine prise
├── ReminderTimePicker.tsx       — Sélecteur heure + jours de la semaine
├── AppointmentCard.tsx          — RDV avec countdown "dans X jours"
├── VaccinationRow.tsx           — Ligne vaccin avec badge "à jour" / "à faire"
├── HealthShareModal.tsx         — Configuration du partage
├── HealthExportButton.tsx       — Export PDF RGPD
└── ConsentBanner.tsx            — Consentement RGPD première ouverture
```

---

## 7. Conformité RGPD & Sécurité

### 7.1 Données de santé = catégorie spéciale (Art. 9 RGPD)

| Exigence | Implémentation |
|---------|---------------|
| Consentement explicite | `ConsentBanner` au premier lancement, stocké en DB |
| Chiffrement des données sensibles | AES-256 côté client avant envoi à Supabase |
| Droit d'accès | `/api/health/export` — PDF complet de toutes les données |
| Droit à l'effacement | Suppression en cascade depuis `health_profiles` |
| Durée de conservation limitée | `data_retention_months` configurable, cron de nettoyage |
| Audit log | Table `health_audit_log` — tous les accès tracés |
| Minimisation des données | Ne collecter que l'indispensable |

### 7.2 Chiffrement applicatif

```typescript
// lib/health-encryption.ts
// Les données sensibles sont chiffrées AVANT envoi à Supabase

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';

export function encryptHealthData(data: object, userId: string): string {
  // Clé dérivée de l'ID utilisateur + secret serveur (jamais stocké en DB)
  const key = scryptSync(`${process.env.HEALTH_ENCRYPTION_SECRET}:${userId}`, 'salt', 32);
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(data), 'utf8'),
    cipher.final()
  ]);
  const authTag = cipher.getAuthTag();

  return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':');
}

export function decryptHealthData<T>(encrypted: string, userId: string): T {
  const [ivHex, authTagHex, dataHex] = encrypted.split(':');
  const key = scryptSync(`${process.env.HEALTH_ENCRYPTION_SECRET}:${userId}`, 'salt', 32);
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, 'hex')),
    decipher.final()
  ]);
  return JSON.parse(decrypted.toString('utf8'));
}
```

---

## 8. Partage familial

Le partage permet à un proche (parent, enfant, médecin) de voir tout ou partie du carnet de santé d'un utilisateur.

**Niveaux d'accès :**

| Niveau | Contenu visible |
|--------|----------------|
| `emergency_only` | Groupe sanguin, allergies, contact urgence uniquement |
| `read` | Sections choisies : RDV, vaccinations, traitements (sans symptômes par défaut) |

**Flow de partage :**
1. L'utilisateur choisit un contact ImuChat
2. Sélectionne les sections à partager + niveau d'accès
3. Définit une date d'expiration optionnelle
4. Le contact reçoit une notification + accès à la section `/health/shared/[ownerId]`

---

## 9. Plan d'implémentation

| Sprint | Tâches | Durée |
|--------|--------|-------|
| **S1** | Schéma SQL + chiffrement + RGPD consent + audit log | 4 jours |
| **S2** | `health-api.ts` + encryption lib | 3 jours |
| **S3** | HealthHub + HealthProfile + ConsentBanner | 3 jours |
| **S4** | SymptomJournal + AddSymptomForm + BodyMapPicker | 4 jours |
| **S5** | TreatmentList + ReminderTimePicker + notifications | 3 jours |
| **S6** | AppointmentCalendar + intégration module Events | 3 jours |
| **S7** | VaccinationPassport + rappels vaccins | 2 jours |
| **S8** | HealthShare + export PDF RGPD + tests | 4 jours |

**Durée totale estimée : ~5 semaines**

> ⚠️ **Note importante :** ce module nécessite une revue juridique RGPD avant mise en production (données de santé = catégorie spéciale Art. 9). Prévoir un DPO ou consultant RGPD.

---

*Fichier généré le 11 mars 2026 — ImuChat Implementation Docs*
