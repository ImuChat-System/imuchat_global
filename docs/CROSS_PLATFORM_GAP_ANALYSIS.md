# 📊 ANALYSE CROSS-PLATFORM — Reste à implémenter

**Date de création :** 9 mars 2026  
**Sources :**  

- `50_FONCTIONNALITIES_SCREENS.md` — 50 features core (10 groupes G1-G10)  
- `OTHERS_SCREENS.md` — ~120 écrans complémentaires (14 catégories)  
- `OTHERS_SCREENS_FONCTIONNALITIES.md` — ~110 fonctionnalités structurelles  
- `AUDIT_MISSING_SCREENS.md` — Audit web 117 routes, 28 absentes  
- Roadmaps unifiées : Mobile, Web, Desktop

---

## Vue d'ensemble

```
                   Mobile          Web             Desktop
Features core     42/50 (84%)    19/50 (38%)     3/50 (6%)
Écrans réels      ~80/130        117/190         ~8/150
Tests             2296           ~faible (20%)    0
Sécurité          B+             D (critique)     N/A
```

---

## PARTIE 1 — 50 Fonctionnalités Core

### G1 — Messagerie & Communication (5 features)

| # | Fonctionnalité | 📱 Mobile | 🌐 Web | 🖥️ Desktop | Sprint Mobile | Sprint Web | Sprint Desktop |
|---|---------------|:---------:|:------:|:----------:|:-------------:|:----------:|:--------------:|
| 1 | Chat principal (liste conversations) | ✅ | ✅ | ❌ | — | — | S1-S2 |
| 2 | Conversation (texte, emojis, GIFs, PJ) | ✅ | ✅ | ❌ | — | — | S1-S2 |
| 3 | Message vocal + transcription | ✅ | 🟡 | ❌ | — | FX-8 | S3-S4 |
| 4 | Options message (edit, delete, react) | ✅ | ✅ | ❌ | — | — | S1-S2 |
| 5 | Preview pièces jointes | ✅ | ✅ | ❌ | — | — | S1-S2 |

### G2 — Appels audio & vidéo (5 features)

| # | Fonctionnalité | 📱 Mobile | 🌐 Web | 🖥️ Desktop | Sprint Mobile | Sprint Web | Sprint Desktop |
|---|---------------|:---------:|:------:|:----------:|:-------------:|:----------:|:--------------:|
| 6 | Appel audio (1-to-1, groupe) | ✅ | ✅ | ❌ | — | — | S5-S6 |
| 7 | Appel vidéo HD | ✅ | ✅ | ❌ | — | — | S5-S6 |
| 8 | Mini-fenêtre PiP | ❌ | ❌ | ❌ | Axe B S22 | FX-9 | S7-S8 |
| 9 | Partage d'écran | ❌ | ❌ | ❌ | — | FX-9 | S5-S6 |
| 10 | Filtres IA (beauté, flou) | ❌ | ❌ | ❌ | — | FX-9 | S7-S8 |

### G3 — Profils & Identité (5 features)

| # | Fonctionnalité | 📱 Mobile | 🌐 Web | 🖥️ Desktop | Sprint Mobile | Sprint Web | Sprint Desktop |
|---|---------------|:---------:|:------:|:----------:|:-------------:|:----------:|:--------------:|
| 11 | Profil utilisateur (privé/public/anonyme) | ✅ | ✅ | ❌ | — | — | S3-S4 |
| 12 | Multi-profils (perso/pro/créateur) | ❌ | ❌ | ❌ | Backlog | Backlog C | S19-S20 |
| 13 | Avatar 2D/3D | ❌ | ❌ | ❌ | IC-M5 | IC-W5 | S23-S24 |
| 14 | Statuts animés | ❌ | ❌ | ❌ | Backlog | Backlog B | Backlog |
| 15 | Vérification identité | ❌ | ❌ | ❌ | Backlog | FX-19 (KYC) | Backlog |

### G4 — Personnalisation avancée (5 features)

| # | Fonctionnalité | 📱 Mobile | 🌐 Web | 🖥️ Desktop | Sprint Mobile | Sprint Web | Sprint Desktop |
|---|---------------|:---------:|:------:|:----------:|:-------------:|:----------:|:--------------:|
| 16 | Paramètres thèmes | ✅ | ✅ | 🟡 | — | — | S1-S2 |
| 17 | Arrière-plans animés | ❌ | ❌ | ❌ | Backlog | Backlog B | Backlog |
| 18 | Police par conversation | ❌ | ❌ | ❌ | Backlog | Backlog C | Backlog |
| 19 | Packs icônes/sons | ❌ | ❌ | ❌ | Backlog | Backlog C | Backlog |
| 20 | Widget homescreen | ✅ | ❌ | ❌ | — | N/A (web) | N/A (desktop) |

### G5 — Mini-apps sociales natives (5 features)

| # | Fonctionnalité | 📱 Mobile | 🌐 Web | 🖥️ Desktop | Sprint Mobile | Sprint Web | Sprint Desktop |
|---|---------------|:---------:|:------:|:----------:|:-------------:|:----------:|:--------------:|
| 21 | Stories | ✅ | 🟡 | ❌ | — | FX-7 | S11-S12 |
| 22 | Mur social (timeline) | ✅ | 🟡 | ❌ | — | FX-4 | S9-S10 |
| 23 | Mini-blog | ❌ | ❌ | ❌ | Backlog | FX-7 | S13-S14 |
| 24 | Événements | ✅ | 🟡 | ❌ | — | FX-7 | S11-S12 |
| 25 | Groupes publics/privés | ✅ | ✅ | ❌ | — | — | S9-S10 |

### G6 — Modules avancés (5 features)

| # | Fonctionnalité | 📱 Mobile | 🌐 Web | 🖥️ Desktop | Sprint Mobile | Sprint Web | Sprint Desktop |
|---|---------------|:---------:|:------:|:----------:|:-------------:|:----------:|:--------------:|
| 26 | Productivity Hub | ✅ | 🟡 | ❌ | — | FX-6 | S15-S16 |
| 27 | Suite Office | ✅ | 🟡 | ❌ | — | FX-6 | S15-S16 |
| 28 | PDF viewer/editor | ✅ | 🟡 | ❌ | — | FX-6 | S15-S16 |
| 29 | Board collaboratif | ❌ | ❌ | ❌ | Backlog | Backlog D | S21-S22 |
| 30 | Cooking & Home | ❌ | ❌ | ❌ | Backlog | Backlog E | Backlog |

### G7 — Services utilitaires publics (5 features)

| # | Fonctionnalité | 📱 Mobile | 🌐 Web | 🖥️ Desktop | Sprint Mobile | Sprint Web | Sprint Desktop |
|---|---------------|:---------:|:------:|:----------:|:-------------:|:----------:|:--------------:|
| 31 | Horaires transport | ❌ | ❌ | ❌ | Backlog | Backlog E | Backlog |
| 32 | Info trafic routier | ❌ | ❌ | ❌ | Backlog | Backlog E | Backlog |
| 33 | Numéros d'urgence | ✅ | ❌ | ❌ | — | Non planifié | Backlog |
| 34 | Annuaire services publics | ❌ | ❌ | ❌ | Backlog | Backlog E | Backlog |
| 35 | Suivi colis | ❌ | ❌ | ❌ | Backlog | Backlog E | Backlog |

### G8 — Divertissement & Création (6 features)

| # | Fonctionnalité | 📱 Mobile | 🌐 Web | 🖥️ Desktop | Sprint Mobile | Sprint Web | Sprint Desktop |
|---|---------------|:---------:|:------:|:----------:|:-------------:|:----------:|:--------------:|
| 36 | Mini-lecteur musique | ✅ | 🟡 | ❌ | — | FX-7 | S17-S18 |
| 37 | Livres | ✅ | ❌ | ❌ | — | Non planifié | Backlog |
| 38 | Podcasts | ✅ | 🟡 | ❌ | — | FX-7 | S17-S18 |
| 39 | Lecteur vidéo | ✅ | ✅ | ❌ | — | — | S17-S18 |
| 40 | Mini-jeux sociaux | ✅ | ❌ | ❌ | Axe C S22 | FX-17 | S25-S26 |
| 41 | Création stickers/emojis | ❌ | ❌ | ❌ | Backlog | Backlog B | Backlog |

### G9 — IA intégrée (5 features)

| # | Fonctionnalité | 📱 Mobile | 🌐 Web | 🖥️ Desktop | Sprint Mobile | Sprint Web | Sprint Desktop |
|---|---------------|:---------:|:------:|:----------:|:-------------:|:----------:|:--------------:|
| 42 | Chatbot multi-personas (Alice) | ✅ | ✅ | ❌ | — | — | S7-S8 |
| 43 | Suggestions réponses (smart replies) | ❌ | ❌ | ❌ | IC-M3 | FX-16 | S23-S24 |
| 44 | Résumé conversation | ❌ | ❌ | ❌ | IC-M3 | FX-16 | S23-S24 |
| 45 | Modération groupes IA | ✅ | 🟡 | ❌ | — | FX-16 | S23-S24 |
| 46 | Traduction instantanée | ✅ | ✅ | ❌ | — | — | S7-S8 |

### G10 — App Store & Écosystème (5 features)

| # | Fonctionnalité | 📱 Mobile | 🌐 Web | 🖥️ Desktop | Sprint Mobile | Sprint Web | Sprint Desktop |
|---|---------------|:---------:|:------:|:----------:|:-------------:|:----------:|:--------------:|
| 47 | Store apps internes/partenaires | ✅ | ✅ | ❌ | — | — | S9-S10 |
| 48 | Installation/désinstallation modules | ✅ | ✅ | ❌ | — | — | S9-S10 |
| 49 | Permissions app | ✅ | 🟡 | ❌ | — | FX-12 | S9-S10 |
| 50 | Marketplace services | ✅ | 🟡 | ❌ | — | FX-12 | S13-S14 |
| 51 | Paiement + portefeuille | ✅ | 🟡 | ❌ | — | FX-11 | S13-S14 |

---

### Synthèse 50 features core

| Plateforme | ✅ Fait | 🟡 Partiel | ❌ Absent | % Complet |
|:----------:|:------:|:----------:|:---------:|:---------:|
| **📱 Mobile** | 35 | 0 | 16 | **69%** |
| **🌐 Web** | 14 | 14 | 23 | **41%** |
| **🖥️ Desktop** | 0 | 1 | 50 | **1%** |

> **Note :** Le 84% mobile cité dans les docs existants inclut les features partielles et les composants réutilisables déjà prêts. Le 69% ici est plus strict (features complètes uniquement).

---

## PARTIE 2 — Écrans complémentaires (~120 écrans, 14 catégories)

### Matrice de couverture par catégorie

| # | Catégorie | Écrans | 📱 Mobile | 🌐 Web | 🖥️ Desktop |
|---|-----------|:------:|:---------:|:------:|:----------:|
| 1 | **Auth & Sécurité** | 16 | ✅ 14/16 | 🟡 8/16 | ❌ 2/16 |
| 2 | **Confidentialité & RGPD** | 9 | ✅ 7/9 | 🟡 3/9 | ❌ 0/9 |
| 3 | **Communautés / Serveurs** | 10 | ✅ 8/10 | 🟡 6/10 | ❌ 0/10 |
| 4 | **Wallet & Monétisation** | 10 | ✅ 7/10 | 🟡 4/10 | ❌ 0/10 |
| 5 | **Store Dev & Créateurs** | 11 | 🟡 3/11 | 🟡 2/11 | ❌ 0/11 |
| 6 | **IA Administration** | 7 | 🟡 4/7 | 🟡 2/7 | ❌ 0/7 |
| 7 | **Analytics & Insights** | 7 | 🟡 3/7 | 🟡 2/7 | ❌ 0/7 |
| 8 | **Fichiers & Stockage** | 7 | ✅ 5/7 | 🟡 3/7 | ❌ 0/7 |
| 9 | **Paramètres globaux** | 9 | ✅ 7/9 | 🟡 5/9 | ❌ 1/9 |
| 10 | **Support & Assistance** | 8 | 🟡 4/8 | 🟡 3/8 | ❌ 0/8 |
| 11 | **Gamification** | 6 | ✅ 5/6 | 🟡 2/6 | ❌ 0/6 |
| 12 | **Desktop spécifique** | 6 | N/A | N/A | ❌ 0/6 |
| 13 | **Web spécifique** | 5 | N/A | 🟡 2/5 | N/A |
| 14 | **Backoffice** | 8 | N/A | 🟡 3/8 | ❌ 0/8 |
| | **TOTAL** | **~119** | **~71/103** | **~45/113** | **~3/113** |
| | **%** | | **~69%** | **~40%** | **~3%** |

---

## PARTIE 3 — Fonctionnalités structurelles manquantes (priorité)

### 🔴 Priorité CRITIQUE — Sécurité & Conformité

| Fonctionnalité | 📱 | 🌐 | 🖥️ | Action requise |
|---------------|:--:|:--:|:---:|----------------|
| DOMPurify / sanitization inputs | ✅ | ❌ | ❌ | Web QS-1 urgent, Desktop S1 |
| CSP headers | N/A | ❌ | ❌ | Web QS-1 |
| CSRF protection | ✅ | ❌ | N/A | Web QS-2 |
| `ignoreBuildErrors: true` suppression | N/A | ❌ | N/A | Web QS-1 immédiat |
| Cookies httpOnly/Secure/SameSite | N/A | ❌ | N/A | Web QS-2 |
| 2FA activation/gestion | ✅ | 🟡 | ❌ | Web FX-1, Desktop S3 |
| Clés E2EE | ✅ | ❌ | ❌ | Web FX-16, Desktop S7 |
| Gestion sessions/appareils | ✅ | ❌ | ❌ | Web QS-2, Desktop S3 |
| Vérification OTP | ✅ | ❌ | ❌ | Web QS-1, Desktop S1 |
| Cookie consent (RGPD) | N/A | ❌ | N/A | Web QS-2 |

### 🟠 Priorité HAUTE — Features core manquantes

| Fonctionnalité | 📱 | 🌐 | 🖥️ | Action requise |
|---------------|:--:|:--:|:---:|----------------|
| PiP (Picture-in-Picture) | ❌ | ❌ | ❌ | Mobile S22, Web FX-9, Desktop S7 |
| Partage d'écran | ❌ | ❌ | ❌ | Web FX-9, Desktop S5 |
| Beauty filters | ❌ | ❌ | ❌ | Web FX-9, Desktop S7 |
| Feed enrichi / timeline | ✅ | 🟡 | ❌ | Web FX-4, Desktop S9 |
| Smart replies IA | ❌ | ❌ | ❌ | Mobile IC-M3, Web FX-16, Desktop S23 |
| Résumé conversation | ❌ | ❌ | ❌ | Mobile IC-M3, Web FX-16, Desktop S23 |
| Stories timeline | ✅ | 🟡 | ❌ | Web FX-7, Desktop S11 |
| Events / Événements | ✅ | 🟡 | ❌ | Web FX-7, Desktop S11 |
| Creator Studio / Dashboard | 🟡 | ❌ | ❌ | Mobile Axe B S12, Web FX-6 |
| Store Stripe / Paiement réel | ✅ | ❌ | ❌ | Web FX-11, Desktop S13 |

### 🟡 Priorité MOYENNE — Enrichissement

| Fonctionnalité | 📱 | 🌐 | 🖥️ | Action requise |
|---------------|:--:|:--:|:---:|----------------|
| Dating module | ✅ | ❌ | ❌ | Web FX-5 |
| Sports Hub | ✅ | ❌ | ❌ | Web FX-5 |
| Smart Home | ✅ | ❌ | ❌ | Web FX-5 |
| Discover page | ✅ | ❌ | ❌ | Web FX-7 |
| Voice waveform / threads / pins | ✅ | 🟡 | ❌ | Web FX-8, Desktop S3 |
| PWA offline / push | N/A | ❌ | N/A | Web FX-14 |
| Admin panel enrichi | ✅ | 🟡 | ❌ | Web FX-15 |
| Modération IA auto | ✅ | ❌ | ❌ | Mobile S20, Web FX-16 |
| ImuFeed Video (complet) | ❌ | ❌ | ❌ | Mobile Axe B, Web FX-4+, Desktop backlog |
| Live Streaming | ❌ | ❌ | ❌ | Mobile Axe B S15-17, Web backlog |

### 🔵 Priorité BASSE — Cross-Domain & Nice-to-have

| Fonctionnalité | 📱 | 🌐 | 🖥️ | Action requise |
|---------------|:--:|:--:|:---:|----------------|
| Gaming Hub | ❌ | ❌ | ❌ | Mobile Axe C S22, Web FX-17, Desktop S25 |
| ImuArena | ❌ | ❌ | ❌ | Mobile Axe C S23, Web FX-18, Desktop S25 |
| Finance Hub (KYC/P2P/cartes) | ❌ | ❌ | ❌ | Mobile Axe C S24, Web FX-19, Desktop S27 |
| ImuCompanion complet | ❌ | ❌ | ❌ | Mobile IC-M1→6, Web IC-W1→6, Desktop S23+ |
| Multi-profils | ❌ | ❌ | ❌ | Backlog toutes plateformes |
| Avatar 2D/3D enrichi | ❌ | ❌ | ❌ | Companion roadmaps |
| Board collaboratif | ❌ | ❌ | ❌ | Backlog toutes plateformes |
| Services publics (transport, colis…) | ❌ | ❌ | ❌ | Backlog toutes plateformes |
| Sticker creation tool | ❌ | ❌ | ❌ | Backlog toutes plateformes |
| Fonds animés | ❌ | ❌ | ❌ | Backlog toutes plateformes |

---

## PARTIE 4 — Synthèse par plateforme

### 📱 Mobile — Reste à faire

| Catégorie | Items restants | Sprints concernés |
|-----------|:--------------:|-------------------|
| Features core manquantes | 16/51 | Axes A+B+C, IC-M |
| ImuFeed Video complet | ~24 sprints | Axe B (S1→S25) |
| ImuCompanion | ~6 phases | IC-M1→IC-M6 (S17→S28) |
| Cross-Domain (Gaming, Arena, Finance) | 4 sprints | Axe C (S22→S25) |
| Nice-to-have (stickers, fonds animés…) | ~8 items | Post-roadmap backlog |
| **Total effort restant** | | **~60 semaines** |

### 🌐 Web — Reste à faire

| Catégorie | Items restants | Sprints concernés |
|-----------|:--------------:|-------------------|
| 🔴 Sécurité critique | 6 failles | QS-1, QS-2 (S1-S4) |
| Tests 20% → 88% | ~4000 tests à écrire | QS-3→QS-5 |
| i18n 60% → 100% | ~40% textes | FX-1→FX-3 |
| Modules manquants | 8+ modules | FX-4→FX-7 |
| Chat avancé | 3 sprints | FX-8→FX-10 |
| Store & Monétisation | 2 sprints | FX-11→FX-12 |
| PWA | 2 sprints | FX-13→FX-14 |
| Admin & IA | 2 sprints | FX-15→FX-16 |
| Cross-Domain | 4 sprints | FX-17→FX-20 |
| ImuCompanion | 6 phases | IC-W1→IC-W6 (S31→S44) |
| Écrans manquants | 28 absents + 15 partiels | Répartis sur toute la roadmap |
| **Total effort restant** | | **~44 semaines** |

### 🖥️ Desktop — Reste à faire

| Catégorie | Items restants | Sprints concernés |
|-----------|:--------------:|-------------------|
| Fondation complète | Infrastructure Electron | S0 (Sprint 0) |
| Core comm (chat, appels) | ~6 sprints | S1→S6 |
| Profils & Settings | ~2 sprints | S3→S4 |
| Social & Store | ~6 sprints | S9→S14 |
| Modules avancés | ~4 sprints | S15→S18 |
| Desktop-spécifique | ~4 sprints | S19→S22 |
| IA & Companion | ~4 sprints | S23→S26 |
| Cross-Domain | ~4 sprints | S25→S28 |
| Polish & Release | ~2 sprints | S29→S30 |
| **Total effort restant** | | **~60 semaines** |

---

## PARTIE 5 — Recommandations stratégiques

### Ordre de priorité cross-platform

```
1. 🌐 WEB — Sécurité D → B (QS-1, QS-2) .............. IMMÉDIAT
2. 🌐 WEB — Tests 20% → 70% (QS-3→QS-5) .............. T1
3. 📱 MOBILE — ImuFeed MVP (Axe B S1→S4) ............... T1
4. 📱 MOBILE — Home Hub refonte (Axe A S1→S3) .......... T1
5. 🖥️ DESKTOP — Sprint 0 fondation ..................... T1
6. 🌐 WEB — i18n 100% + modules manquants .............. T1-T2
7. 🖥️ DESKTOP — Core comm (S1→S6) ..................... T1-T2
8. 📱 MOBILE — Widgets + Personnalisation ............... T2
9. 🌐 WEB — Chat avancé + Store ........................ T2
10. 📱 MOBILE — Éditeur avancé + Créateurs .............. T2-T3
11. 🌐 WEB — PWA + Admin + IA .......................... T3
12. 📱 MOBILE — Live Streaming .......................... T3
13. ALL — ImuCompanion .................................. T3-T4
14. ALL — Cross-Domain (Gaming, Arena, Finance) ......... T4
15. ALL — Nice-to-have backlog .......................... Post-roadmap
```

### Features absentes sur TOUTES les plateformes (0/3)

Ces 16 features ne sont implémentées nulle part :

| # | Feature | Type | Planifié ? |
|---|---------|------|:----------:|
| 1 | PiP (Picture-in-Picture) | Core | ✅ |
| 2 | Partage d'écran | Core | ✅ |
| 3 | Filtres IA beauté | Core | ✅ |
| 4 | Multi-profils | Core | Backlog |
| 5 | Avatar 2D/3D | Core | ✅ (IC) |
| 6 | Statuts animés | Core | Backlog |
| 7 | Arrière-plans animés | Perso | Backlog |
| 8 | Police par conversation | Perso | Backlog |
| 9 | Packs icônes/sons | Perso | Backlog |
| 10 | Board collaboratif | Module | Backlog |
| 11 | Cooking & Home | Module | Backlog |
| 12 | Smart replies IA | IA | ✅ (IC) |
| 13 | Résumé conversation IA | IA | ✅ (IC) |
| 14 | Création stickers/emojis | Création | Backlog |
| 15 | Gaming Hub | Cross-Domain | ✅ |
| 16 | ImuArena | Cross-Domain | ✅ |
| 17 | Finance Hub | Cross-Domain | ✅ |
| 18 | ImuFeed Video | Cross-Domain | ✅ |
| 19 | Live Streaming | Cross-Domain | ✅ |
| 20 | ImuCompanion | Cross-Domain | ✅ |

> **13/20 sont planifiés** dans les roadmaps unifiées.  
> **7/20 sont en backlog** (priorité basse, nice-to-have).

---

## Conclusion

| Plateforme | Complétion actuelle | Complétion fin roadmap | Effort restant |
|:----------:|:-------------------:|:----------------------:|:--------------:|
| **📱 Mobile** | 69% strict / 84% broad | 96% + backlog | ~60 semaines |
| **🌐 Web** | 41% features | 96% + backlog | ~44 semaines |
| **🖥️ Desktop** | ~1-5% | 90% + backlog | ~60 semaines |

**Points d'attention immédiats :**

1. **Sécurité web D** — Bloquant pour toute mise en production
2. **Tests web 20%** — Risque élevé de régressions
3. **Desktop à 5%** — Démarrage Sprint 0 requis avant parallélisation
4. **16 features absentes partout** — ImuCompanion, Cross-Domain, et PiP sont les plus impactantes

---

> 📱 Roadmap mobile → [`docs/_mobile/MOBILE_ROADMAP_UNIFIED.md`](../_mobile/MOBILE_ROADMAP_UNIFIED.md)  
> 🌐 Roadmap web → [`docs/_web/WEB_ROADMAP_UNIFIED.md`](../_web/WEB_ROADMAP_UNIFIED.md)  
> 🖥️ Roadmap desktop → [`docs/_desktop/DESKTOP_ROADMAP_UNIFIED.md`](../_desktop/DESKTOP_ROADMAP_UNIFIED.md)
