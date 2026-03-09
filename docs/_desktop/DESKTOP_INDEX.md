# 📑 INDEX — Documentation Desktop App ImuChat

**Dernière mise à jour :** 8 mars 2026

---

## 🗂️ Hiérarchie documentaire

### Documents actifs (à consulter)

| Document | Rôle | Statut |
|----------|------|:------:|
| **📑 `DESKTOP_INDEX.md`** (ce fichier) | Point d'entrée. Explique le rôle de chaque document. | ✅ Actif |
| **🗺️ `DESKTOP_ROADMAP_UNIFIED.md`** | **SOURCE UNIQUE DE VÉRITÉ.** Roadmap complète S0→S30, état actuel, métriques, risques, milestones. | ✅ Actif |
| **🏛️ `DESKTOP_ARCHITECTURE_GUIDE.md`** | Architecture technique cible : structure de fichiers, patterns, intégration des packages partagés, code samples. | ✅ Actif |
| **🔄 `DESKTOP_REUSE_MATRIX.md`** | Matrice de réutilisation : ce qui est importable directement, à adapter, ou à créer. Score ~95%. | ✅ Actif |
| **🤖 `IMUCOMPANION_ROADMAP_DESKTOP.md`** | Roadmap détaillée ImuCompanion (IC-D1→IC-D6, ~20 sem). Référencé depuis UNIFIED S23 et S30. | ✅ Actif (sous-roadmap) |
| **🛡️ `ROADMAP_GUARDIAN_ANGEL_DESKTOP.md`** | Roadmap détaillée Guardian Angel (GA-D1→GA-D6, ~24 sem). Module sécurité IA, SOS, navigation, cyber. | ✅ Actif (sous-roadmap) |

### Documents archivés (supersédés)

> ⚠️ Ces documents sont conservés à titre historique. Leur contenu a été absorbé et harmonisé dans `DESKTOP_ROADMAP_UNIFIED.md`.

| Document | Raison de l'archivage | Remplacé par |
|----------|----------------------|:------------:|
| `ROADMAP_DESKTOP_GLOBAL.md` | Consolidation des 3 roadmaps en une seule unifiée | UNIFIED |
| `ROADMAP_DESKTOP_FOUNDATIONS.md` | Sprints F-1→F-12 absorbés dans S1→S12 | UNIFIED |
| `ROADMAP_DESKTOP_FEATURES_NATIVE.md` | Sprints B-1→B-18 absorbés dans S13→S30 | UNIFIED |
| `DESKTOP_APP_DEVELOPMENT_TRACKER.md` | Diagnostic initial (21 fév 2026) absorbé dans la section "État actuel" | UNIFIED |
| `DESKTOP_GAP_ANALYSIS.md` | Analyse d'écart absorbée dans la section "État actuel" | UNIFIED |
| `DESKTOP_SPRINT_PLAN.md` | Plan S0-S10 remplacé par le plan unifié S0-S30 | UNIFIED |

---

## 🔢 Correspondance des sprints

L'ancienne numérotation (F-x, B-x, Sx) est remplacée par une numérotation unique **S0→S30** :

| Sprint unifié | Ancien ID | Source document |
|:-------------:|:---------:|:---------------:|
| S0 | Setup (S0) | FOUNDATIONS / SPRINT_PLAN |
| S1 | F-1 | FOUNDATIONS Phase 1 |
| S2 | F-2 | FOUNDATIONS Phase 1 |
| S3 | F-3 | FOUNDATIONS Phase 2 |
| S4 | F-4 | FOUNDATIONS Phase 2 |
| S5 | F-5 | FOUNDATIONS Phase 2 |
| S6 | F-6 | FOUNDATIONS Phase 3 |
| S7 | F-7 | FOUNDATIONS Phase 3 |
| S8 | F-8 | FOUNDATIONS Phase 4 |
| S9 | F-9 | FOUNDATIONS Phase 4 |
| S10 | F-10 | FOUNDATIONS Phase 4 |
| S11 | F-11 | FOUNDATIONS Phase 5 |
| S12 | F-12 | FOUNDATIONS Phase 5 |
| — | — | **🏁 MVP RELEASE** |
| S13 | B-1 | FEATURES Phase 1 |
| S14 | B-2 | FEATURES Phase 1 |
| S15 | B-3 | FEATURES Phase 2 |
| S16 | B-4 | FEATURES Phase 2 |
| S17 | B-5 | FEATURES Phase 2 |
| S18 | B-6 | FEATURES Phase 3 |
| S19 | B-7 | FEATURES Phase 3 |
| S20 | B-8 | FEATURES Phase 4 |
| S21 | B-9 | FEATURES Phase 4 |
| S22 | B-10 | FEATURES Phase 5 |
| S23 | B-11 | FEATURES Phase 5 |
| S24 | B-12 | FEATURES Phase 6 |
| S25 | B-13 | FEATURES Phase 6 |
| S26 | B-14 | FEATURES Phase 6 |
| — | — | **🏁 APP 1.0 CORE** |
| S27 | B-15 | FEATURES Phase 7 |
| S28 | B-16 | FEATURES Phase 7 |
| S29 | B-17 | FEATURES Phase 7 |
| S30 | B-18 | FEATURES Phase 7 |
| — | — | **🏁 APP 2.0 COMPLÈTE** |

---

## 🔗 Liens entre documents

```
DESKTOP_INDEX.md (ce fichier)
    │
    ├── DESKTOP_ROADMAP_UNIFIED.md ──── Source de vérité (quoi faire, quand)
    │       │
    │       └── Réf. IMUCOMPANION_ROADMAP_DESKTOP.md (S23, S30)
    │
    ├── DESKTOP_ARCHITECTURE_GUIDE.md ── Référence technique (comment faire)
    │
    └── DESKTOP_REUSE_MATRIX.md ──────── Inventaire de réutilisation (avec quoi)
```

---

## 📋 Comment utiliser ces documents

1. **Avant de commencer un sprint** → Consulter `DESKTOP_ROADMAP_UNIFIED.md` section du sprint concerné
2. **Pour les patterns de code** → Consulter `DESKTOP_ARCHITECTURE_GUIDE.md`
3. **Pour savoir quoi importer** → Consulter `DESKTOP_REUSE_MATRIX.md`
4. **Pour le Companion spécifiquement** → Consulter `IMUCOMPANION_ROADMAP_DESKTOP.md`
5. **Pour Guardian Angel** → Consulter `ROADMAP_GUARDIAN_ANGEL_DESKTOP.md`
6. **Pour l'historique d'une décision** → Consulter les documents archivés

---

*Créé le 8 mars 2026 — Point d'entrée de la documentation desktop*
