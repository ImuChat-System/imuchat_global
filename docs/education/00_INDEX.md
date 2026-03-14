# 📚 ImuChat Éducation — Index de Documentation

> **Domaine :** `education.imuchat.app`
> **Périmètre :** ENT moderne souverain + ImuOffice pour les établissements scolaires et universitaires
> **Date :** Mars 2026
> **Version :** 1.0

---

## 📂 Documents de cette suite

| # | Fichier | Contenu | Priorité |
|---|---|---|:---:|
| 01 | `01_VISION_STRATEGIE.md` | Vision produit, positionnement, cibles, analyse concurrentielle | 🔴 |
| 02 | `02_ARCHITECTURE_ENT.md` | Architecture technique du ENT, intégrations (SSO, LTI, SCIM) | 🔴 |
| 03 | `03_ROLES_PERMISSIONS.md` | RBAC complet : 8 rôles, matrice d'accès, hiérarchie | 🔴 |
| 04 | `04_MODULES_PEDAGOGIQUES.md` | Tous les modules ENT : cahier de texte, notes, absences, devoirs... | 🔴 |
| 05 | `05_ALICE_IA_EDUCATION.md` | Alice IA en mode éducation : tuteur adaptatif, aide aux devoirs, correction | 🟠 |
| 06 | `06_SCHEMA_DATABASE.md` | Schéma SQL complet (Drizzle ORM / Supabase) | 🔴 |
| 07 | `07_ROADMAP.md` | Roadmap de développement — 8 phases, 24 sprints, 48 semaines | 🔴 |
| 08 | `08_SITE_VITRINE.md` | Documentation du site vitrine education.imuchat.app | 🟠 |

---

## 🎯 Vision en une phrase

> **ImuChat Éducation = un ENT moderne, souverain et pédagogique, qui unifie la communication, la bureautique (ImuOffice), et l'IA (Alice) dans une seule plateforme européenne — pour remplacer Pronote, Teams Education et Google Classroom à la fois.**

---

## 🏗️ Écosystème associé

```
education.imuchat.app
        │
        ├── office.imuchat.app    → ImuOffice (ImuDocs, ImuSheets, ImuSlides, ImuDrive)
        ├── alice.imuchat.app     → Alice IA tuteur adaptatif
        ├── enterprise.imuchat.app → SSO, déploiement on-premise, SLA
        ├── app.imuchat.app       → Application principale (messagerie, social)
        └── admin.imuchat.app     → Back-office établissement (admin ENT)
```

---

## 📅 Calendrier macro

| Phase | Durée | Objectif |
|---|---|---|
| Fondations | 8 sem. | Auth, RBAC, architecture ENT, onboarding |
| Modules Core ENT | 12 sem. | Cahier de texte, notes, absences, devoirs, emploi du temps |
| ImuOffice Éducation | 8 sem. | ImuDocs/Sheets/Slides adaptés pédagogie, ImuDrive établissement |
| Alice IA Éducation | 8 sem. | Tuteur adaptatif, générateur exercices, correction automatique |
| Communication | 6 sem. | Messagerie parents, carnet de liaison numérique, notifications |
| Admin & Conformité | 6 sem. | Dashboard direction, RGPD, exports, interopérabilité ENT |
| **Total** | **48 sem.** | **ENT complet production-ready** |
