# 🛡️ Roadmap — `admin.imuchat.app` · Tableau de Bord Administrateur

> **Périmètre :** Back-office interne ImuChat — gestion plateforme, modération, analytics, config  
> **Stack :** Next.js 16 · React 19 · TypeScript 5 · Tailwind CSS · Supabase · Socket.IO · Recharts  
> **i18n :** next-intl · Locales : `fr`, `en`, `ja` · RTL ready  
> **Auth :** Firebase Admin + Supabase RLS · RBAC multi-niveaux  
> **Date :** Mars 2026

---

## Table des matières

1. [Vision & Principes](#1-vision--principes)
2. [Matrice des Rôles (RBAC)](#2-matrice-des-rôles-rbac)
3. [Architecture i18n Admin](#3-architecture-i18n-admin)
4. [Vue d'ensemble des Phases](#4-vue-densemble-des-phases)
5. [Phase 1 — Fondations Auth & RBAC](#phase-1--fondations-auth--rbac-sprints-1-2)
6. [Phase 2 — Gestion Utilisateurs](#phase-2--gestion-utilisateurs-sprints-3-4)
7. [Phase 3 — Modération & Sécurité](#phase-3--modération--sécurité-sprints-5-6)
8. [Phase 4 — Analytics & Monitoring](#phase-4--analytics--monitoring-sprints-7-8)
9. [Phase 5 — Store & Économie](#phase-5--store--économie-sprints-9-10)
10. [Phase 6 — Configuration Plateforme](#phase-6--configuration-plateforme-sprints-11-12)
11. [Phase 7 — IA & Companion Admin](#phase-7--ia--companion-admin-sprints-13-14)
12. [Phase 8 — i18n Admin Complet](#phase-8--i18n-admin-complet-sprints-15-16)
13. [Sitemap complet](#13-sitemap-complet)
14. [Modèle de données](#14-modèle-de-données)
15. [Checklist de déploiement](#15-checklist-de-déploiement)

---

## 1. Vision & Principes

`admin.imuchat.app` est le **back-office interne** d'ImuChat. Il n'est pas accessible au public et ne fait pas partie de la web-app utilisateur (`app.imuchat.app`). C'est un site indépendant, sécurisé, uniquement accessible aux équipes internes authentifiées.

### Principes directeurs

| Principe | Description |
|---|---|
| **Least privilege** | Chaque rôle ne voit que ce dont il a besoin — aucun accès superflu |
| **Audit trail complet** | Toute action admin est loggée (qui, quoi, quand, depuis où) |
| **i18n natif** | L'interface admin est disponible en FR/EN/JA dès le premier sprint |
| **Temps réel** | Les dashboards critiques (modération, monitoring) sont live via Socket.IO |
| **Séparation claire** | Les données sensibles (financier, logs) sont isolées par rôle |

---

## 2. Matrice des Rôles (RBAC)

### Définition des rôles

| Rôle | Code | Description |
|---|---|---|
| Super Admin | `SUPER_ADMIN` | Accès total — fondateurs & CTO |
| Admin Platform | `ADMIN_PLATFORM` | Gestion utilisateurs, config, feature flags |
| Admin Finance | `ADMIN_FINANCE` | Paiements, revenus, payouts, fraude |
| Modérateur Senior | `MOD_SENIOR` | File de modération + bans + escalade |
| Modérateur | `MOD_STANDARD` | Traitement signalements, warnings |
| Admin Store | `ADMIN_STORE` | Review & validation des modules soumis |
| Support Agent | `SUPPORT` | Tickets support, consultation users (read-only) |
| Data Analyst | `ANALYST` | Analytics, exports, métriques — lecture seule |
| Admin i18n | `ADMIN_I18N` | Gestion des traductions et locales |

---

### Matrice d'accès complète

| Section | `SUPER_ADMIN` | `ADMIN_PLATFORM` | `ADMIN_FINANCE` | `MOD_SENIOR` | `MOD_STANDARD` | `ADMIN_STORE` | `SUPPORT` | `ANALYST` | `ADMIN_I18N` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Dashboard global** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Users — liste** | ✅ | ✅ | 🔍 | ✅ | 🔍 | — | ✅ | 🔍 | — |
| **Users — édition** | ✅ | ✅ | — | ✅ | — | — | — | — | — |
| **Users — ban/suspend** | ✅ | ✅ | — | ✅ | ⚠️ | — | — | — | — |
| **Users — export** | ✅ | ✅ | — | — | — | — | — | ✅ | — |
| **Modération — queue** | ✅ | ✅ | — | ✅ | ✅ | — | — | — | — |
| **Modération — escalade** | ✅ | ✅ | — | ✅ | — | — | — | — | — |
| **Modération — bans** | ✅ | ✅ | — | ✅ | ⚠️ | — | — | — | — |
| **Store — review** | ✅ | ✅ | — | — | — | ✅ | — | — | — |
| **Store — approve/reject** | ✅ | ✅ | — | — | — | ✅ | — | — | — |
| **Finance — transactions** | ✅ | — | ✅ | — | — | — | — | 🔍 | — |
| **Finance — payouts** | ✅ | — | ✅ | — | — | — | — | — | — |
| **Finance — fraude** | ✅ | ✅ | ✅ | — | — | — | — | — | — |
| **Analytics — métriques** | ✅ | ✅ | ✅ | ✅ | — | ✅ | — | ✅ | — |
| **Analytics — exports** | ✅ | ✅ | ✅ | — | — | — | — | ✅ | — |
| **Config — feature flags** | ✅ | ✅ | — | — | — | — | — | — | — |
| **Config — maintenance** | ✅ | ✅ | — | — | — | — | — | — | — |
| **Config — i18n** | ✅ | ✅ | — | — | — | — | — | — | ✅ |
| **IA — personas** | ✅ | ✅ | — | — | — | — | — | — | — |
| **IA — modération** | ✅ | ✅ | — | ✅ | — | — | — | — | — |
| **Logs système** | ✅ | ✅ | 🔍 | — | — | — | — | — | — |
| **Gestion des rôles** | ✅ | — | — | — | — | — | — | — | — |
| **Support — tickets** | ✅ | ✅ | — | — | — | — | ✅ | — | — |

> ✅ Accès complet · 🔍 Lecture seule · ⚠️ Accès limité (ex: ban temporaire seulement) · — Aucun accès

---

## 3. Architecture i18n Admin

L'admin est en lui-même un produit multi-langue. L'équipe peut être internationale, et le dashboard admin de `ImuOffice` (pour les entreprises) doit être disponible dans la langue des administrateurs.

### Structure des fichiers de traduction

```
admin/
└── messages/
    ├── fr.json          ← Langue par défaut (FR)
    ├── en.json
    └── ja.json
```

### Namespaces i18n spécifiques admin

```json
// messages/fr.json — structure des namespaces
{
  "common": { ... },
  "auth": {
    "login": "Connexion à l'administration",
    "mfa_required": "Authentification double facteur requise",
    "session_expired": "Session expirée — reconnexion requise"
  },
  "nav": {
    "dashboard": "Tableau de bord",
    "users": "Utilisateurs",
    "moderation": "Modération",
    "store": "Store",
    "finance": "Finance",
    "analytics": "Analytics",
    "config": "Configuration",
    "ai": "Intelligence artificielle",
    "logs": "Journaux",
    "support": "Support",
    "i18n": "Traductions"
  },
  "roles": {
    "SUPER_ADMIN": "Super Administrateur",
    "ADMIN_PLATFORM": "Admin Plateforme",
    "ADMIN_FINANCE": "Admin Finance",
    "MOD_SENIOR": "Modérateur Senior",
    "MOD_STANDARD": "Modérateur",
    "ADMIN_STORE": "Admin Store",
    "SUPPORT": "Agent Support",
    "ANALYST": "Analyste",
    "ADMIN_I18N": "Admin Traductions"
  },
  "users": { ... },
  "moderation": { ... },
  "store": { ... },
  "finance": { ... },
  "analytics": { ... },
  "config": { ... },
  "ai": { ... },
  "logs": { ... },
  "support": { ... },
  "i18n_manager": { ... }
}
```

### Règles i18n admin

- Tous les messages d'audit log sont stockés en anglais en base (référence universelle)
- L'interface affiche les labels traduits selon la locale de l'admin connecté
- Les données utilisateurs (noms, contenus) sont toujours affichées telles quelles (pas traduites)
- Les actions destructives affichent une modale de confirmation avec `t('common.confirm_action')`
- Les statuts (`banned`, `suspended`, `active`) ont des badges avec couleur + label traduit

---

## 4. Vue d'ensemble des Phases

| Phase | Nom | Sprints | Durée | Rôles concernés |
|---|---|:---:|:---:|---|
| 1 | Fondations Auth & RBAC | 1-2 | 4 semaines | Tous |
| 2 | Gestion Utilisateurs | 3-4 | 4 semaines | `SUPER_ADMIN`, `ADMIN_PLATFORM`, `MOD_SENIOR`, `SUPPORT` |
| 3 | Modération & Sécurité | 5-6 | 4 semaines | `MOD_*`, `SUPER_ADMIN` |
| 4 | Analytics & Monitoring | 7-8 | 4 semaines | `ANALYST`, `ADMIN_PLATFORM`, `SUPER_ADMIN` |
| 5 | Store & Économie | 9-10 | 4 semaines | `ADMIN_STORE`, `ADMIN_FINANCE`, `SUPER_ADMIN` |
| 6 | Configuration Plateforme | 11-12 | 4 semaines | `ADMIN_PLATFORM`, `SUPER_ADMIN` |
| 7 | IA & Companion Admin | 13-14 | 4 semaines | `ADMIN_PLATFORM`, `SUPER_ADMIN` |
| 8 | i18n Admin Complet | 15-16 | 4 semaines | `ADMIN_I18N`, `SUPER_ADMIN` |
| **Total** | | **16 sprints** | **32 semaines** | |

---

## Phase 1 — Fondations Auth & RBAC (Sprints 1-2)

> **Objectif :** Mettre en place l'infrastructure d'authentification admin, le système de rôles, et le layout de base i18n.

### Sprint 1 · Auth Admin & Layout

**Priorité :** 🔴 Critique

| Tâche | Description | Fichiers |
|---|---|---|
| **Page de login admin** | Login distinct de `app.imuchat.app`. Firebase Admin Auth + MFA obligatoire. Pas de signup public — comptes créés uniquement par `SUPER_ADMIN`. Branding admin sobre (pas kawaii). | `app/login/page.tsx` |
| **Middleware RBAC** | Middleware Next.js qui vérifie le token Firebase Admin, récupère le rôle depuis Supabase `admin_users`, redirige selon les permissions. | `middleware.ts`, `lib/rbac.ts` |
| **Hook `useAdminAuth`** | Hook qui expose `{ adminUser, role, permissions, hasPermission(section, action) }`. Utilisé dans tous les composants pour conditionner l'affichage. | `hooks/useAdminAuth.ts` |
| **Layout admin** | Sidebar responsive avec navigation conditionnelle par rôle. Header avec : avatar admin, rôle badge, sélecteur de langue, déconnexion. Breadcrumbs. | `components/layout/AdminLayout.tsx` |
| **i18n setup** | Configurer `next-intl` pour l'admin. 3 locales : `fr`, `en`, `ja`. Sélecteur de langue dans le header. Détecter la langue du navigateur au premier accès. | `i18n.ts`, `messages/` |
| **Page d'accueil admin** | Dashboard vide avec widget de bienvenue, résumé du rôle, accès rapides selon permissions. | `app/dashboard/page.tsx` |
| **Session timeout** | Déconnexion automatique après 30min d'inactivité avec avertissement à 5min. | `hooks/useSessionTimeout.ts` |

**Livrables Sprint 1 :**
- ✅ Login admin sécurisé avec MFA
- ✅ Middleware RBAC opérationnel
- ✅ Layout avec navigation par rôle
- ✅ i18n FR/EN/JA configuré

---

### Sprint 2 · Gestion des Rôles & Audit Trail

**Priorité :** 🔴 Critique

| Tâche | Description | Fichiers |
|---|---|---|
| **Page `/roles`** | Liste des admins avec leur rôle. Créer/modifier/supprimer un compte admin. Uniquement `SUPER_ADMIN`. Confirmation obligatoire pour les suppressions. | `app/roles/page.tsx` |
| **Formulaire attribution rôle** | Assigner un rôle à un utilisateur ImuChat (le promouvoir admin). Champ email + sélecteur rôle + date d'expiration optionnelle. | `components/roles/AssignRoleForm.tsx` |
| **Audit trail service** | Service qui loggue toutes les actions admin : `{ adminId, role, action, targetId, targetType, payload, ip, userAgent, timestamp }`. Chaque action déclenche un insert dans `admin_audit_logs`. | `lib/auditLogger.ts` |
| **Page `/logs/audit`** | Table paginée des logs d'audit. Filtres : admin, action, date, type de cible. Export CSV. Visible : `SUPER_ADMIN`, `ADMIN_PLATFORM`. | `app/logs/audit/page.tsx` |
| **Composant `PermissionGate`** | Composant React qui cache son contenu si le rôle n'a pas la permission requise. Usage : `<PermissionGate section="finance" action="read">`. | `components/auth/PermissionGate.tsx` |
| **Traductions i18n — rôles** | Fichier `messages/*/roles.json` complet : noms de rôles, descriptions, messages d'erreur d'accès refusé pour les 3 locales. | `messages/fr/roles.json` |

**Livrables Sprint 2 :**
- ✅ Gestion complète des comptes admin
- ✅ Audit trail sur toutes les actions
- ✅ Composant `PermissionGate` réutilisable

---

## Phase 2 — Gestion Utilisateurs (Sprints 3-4)

> **Objectif :** Interface complète de gestion des utilisateurs ImuChat — recherche, actions, KYC.

### Sprint 3 · Liste & Recherche Utilisateurs

**Rôles accédant :** `SUPER_ADMIN`, `ADMIN_PLATFORM`, `MOD_SENIOR`, `SUPPORT`

| Tâche | Description | Fichiers |
|---|---|---|
| **Page `/users`** | Table paginée (50/page). Colonnes : avatar, nom, email, rôle app, statut, date inscription, KYC level. Tri sur toutes les colonnes. | `app/users/page.tsx` |
| **Recherche avancée** | Barre de recherche full-text (nom, email, ID). Filtres : statut (`active`, `suspended`, `banned`), rôle app, KYC level, date inscription (range), pays. | `components/users/UserFilters.tsx` |
| **Fiche utilisateur `/users/[id]`** | Vue complète : infos profil, statut, devices connectés, historique signalements reçus, historique actions admin sur ce compte, modules installés, wallet balance. | `app/users/[id]/page.tsx` |
| **Actions bulk** | Sélection multiple → actions groupées : suspendre, envoyer notification, exporter. Confirmation modale avec résumé des cibles. | `components/users/BulkActions.tsx` |
| **Export CSV/JSON** | Export des résultats filtrés (max 10 000 lignes). Champs exportés configurables. RGPD : log de l'export dans audit trail. | `lib/exportUsers.ts` |
| **i18n utilisateurs** | `messages/*/users.json` : statuts traduits, labels filtres, messages de confirmation pour les 3 locales. | `messages/*/users.json` |

---

### Sprint 4 · Actions & Sanctions

**Rôles accédant :** `SUPER_ADMIN`, `ADMIN_PLATFORM`, `MOD_SENIOR` (limité), `SUPPORT` (read-only)

| Tâche | Description | Fichiers |
|---|---|---|
| **Suspension temporaire** | Formulaire : durée (1h/24h/7j/30j/custom), motif obligatoire, notification à l'utilisateur (email). Enregistré dans `user_sanctions`. | `components/users/SuspendForm.tsx` |
| **Bannissement permanent** | Disponible `SUPER_ADMIN` et `MOD_SENIOR` seulement. Double confirmation. Motif + catégorie (spam, fraude, abus, contenu illégal). Déconnexion immédiate de tous les appareils. | `components/users/BanForm.tsx` |
| **Réinitialisation mot de passe** | Envoyer un lien de réinitialisation à l'utilisateur. Log dans audit trail. | `actions/resetUserPassword.ts` |
| **Révocation sessions** | Déconnecter l'utilisateur de tous ses appareils immédiatement (révocation token Firebase). | `actions/revokeUserSessions.ts` |
| **Historique sanctions** | Timeline des sanctions sur la fiche utilisateur : date, type, motif, admin ayant agi, durée restante si temporaire. | `components/users/SanctionHistory.tsx` |
| **Note interne** | Ajouter une note interne sur un utilisateur (invisible pour lui). Utile pour le support et les modérateurs. | `components/users/InternalNote.tsx` |
| **i18n sanctions** | `messages/*/sanctions.json` : motifs traduits, messages de confirmation, durées formatées avec pluralisation ICU. | `messages/*/sanctions.json` |

---

## Phase 3 — Modération & Sécurité (Sprints 5-6)

> **Objectif :** File de modération complète, gestion des signalements, outils anti-abus.

### Sprint 5 · Queue de Modération

**Rôles accédant :** `SUPER_ADMIN`, `ADMIN_PLATFORM`, `MOD_SENIOR`, `MOD_STANDARD`

| Tâche | Description | Fichiers |
|---|---|---|
| **Page `/moderation`** | Dashboard modération : compteurs en temps réel (Socket.IO) — signalements en attente par catégorie, temps moyen de traitement, taux de résolution. | `app/moderation/page.tsx` |
| **File `/moderation/queue`** | Liste des signalements non traités. Colonnes : type de contenu, catégorie, signalements, date, priorité auto-calculée. Tri par urgence. Attribution à un modérateur. | `app/moderation/queue/page.tsx` |
| **Fiche signalement `/moderation/[id]`** | Vue complète du contenu signalé avec contexte. Preview in-situ (message, image, vidéo, profil). Historique du signalement. Actions disponibles. | `app/moderation/[id]/page.tsx` |
| **Actions de modération** | Boutons d'action : Ignorer (faux positif), Supprimer contenu, Avertir utilisateur, Suspendre, Bannir, Escalader. Chaque action ouvre une modale de confirmation avec motif. | `components/moderation/ModerationActions.tsx` |
| **Escalade** | `MOD_STANDARD` peut escalader vers `MOD_SENIOR`. Notification push + email au senior. Log d'escalade dans la fiche. | `actions/escalateReport.ts` |
| **Catégories de signalement** | Filtres par catégorie : Spam, Harcèlement, Contenu adulte, Contenu illégal, Discours haineux, Désinformation, Autre. Stats par catégorie. | `components/moderation/CategoryFilter.tsx` |
| **i18n modération** | `messages/*/moderation.json` : catégories, actions, statuts, messages de confirmation traduits. | `messages/*/moderation.json` |

---

### Sprint 6 · Sécurité & Anti-abus

**Rôles accédant :** `SUPER_ADMIN`, `ADMIN_PLATFORM`, `MOD_SENIOR`

| Tâche | Description | Fichiers |
|---|---|---|
| **Page `/security`** | Dashboard sécurité : alertes actives, tentatives de connexion suspectes, IP bannies, pics d'activité anormaux. | `app/security/page.tsx` |
| **Gestion IPs bannies** | Liste des IP bloquées avec raison et date. Ajouter/retirer une IP. Import CSV. | `app/security/ip-bans/page.tsx` |
| **Détection multi-comptes** | Outil de recherche par device fingerprint ou IP pour détecter les comptes multiples d'un même utilisateur. | `app/security/multi-accounts/page.tsx` |
| **Automodération config** | Configurer les règles d'automodération : liste de mots interdits, seuils de flood (messages/min), détection liens suspects. | `app/security/automod/page.tsx` |
| **Alertes sécurité temps réel** | Panel live (Socket.IO) : pics de signalements, tentatives login suspectes, transactions anormales. Avec dismiss et acknowledgement. | `components/security/SecurityAlerts.tsx` |
| **Journaux sécurité `/logs/security`** | Logs filtrables : tentatives d'auth échouées, accès admin, changements de permissions, exports de données. | `app/logs/security/page.tsx` |

---

## Phase 4 — Analytics & Monitoring (Sprints 7-8)

> **Objectif :** Tableaux de bord analytiques complets pour piloter la croissance et la santé de la plateforme.

### Sprint 7 · Dashboard Analytics Principal

**Rôles accédant :** `SUPER_ADMIN`, `ADMIN_PLATFORM`, `ADMIN_FINANCE`, `MOD_SENIOR`, `ADMIN_STORE`, `ANALYST`

| Tâche | Description | Fichiers |
|---|---|---|
| **KPIs en temps réel** | Widget en-tête : DAU, MAU, nouvelles inscriptions (24h), messages envoyés (24h), revenus (24h). Mis à jour toutes les 30s via polling. | `components/analytics/KPIStrip.tsx` |
| **Graphique croissance** | Recharts LineChart : inscriptions cumulées vs actifs. Sélecteur période : 7j / 30j / 90j / 1an / custom. | `components/analytics/GrowthChart.tsx` |
| **Funnel de rétention** | Taux de rétention D1/D7/D30 sous forme de funnel. Comparaison cohorte vs cohorte précédente. | `components/analytics/RetentionFunnel.tsx` |
| **Heatmap d'activité** | Heatmap heure × jour de la semaine de l'activité (messages envoyés). Permet d'identifier les pics pour le dimensionnement. | `components/analytics/ActivityHeatmap.tsx` |
| **Métriques par locale** | Ventilation DAU/MAU par langue (FR/EN/JA + autres). Permet de cibler les investissements i18n. | `components/analytics/LocaleMetrics.tsx` |
| **Export métriques** | Export CSV/JSON/Excel des métriques sur une période. Disponible `ANALYST` et au-dessus. Log dans audit trail. | `lib/exportAnalytics.ts` |

---

### Sprint 8 · Monitoring Technique & Revenus

**Rôles accédant :** `SUPER_ADMIN`, `ADMIN_PLATFORM` (technique), `ADMIN_FINANCE` (revenus)

| Tâche | Description | Fichiers |
|---|---|---|
| **Monitoring infra** | Consommation CPU/RAM/DB connections en temps réel. Intégration avec l'endpoint `/health` de `api.imuchat.app`. Alertes si seuil dépassé. | `app/monitoring/page.tsx` |
| **Métriques Socket.IO** | Connexions WebSocket actives, messages/s, rooms actives, latence moyenne. Source : `ws.imuchat.app/health`. | `components/monitoring/WebSocketStats.tsx` |
| **Dashboard revenus** | Total revenus : ImuCoins vendus, abonnements Premium, commissions Store. Graphique revenus/jour sur 30j. | `app/analytics/revenue/page.tsx` |
| **Métriques Store** | Modules les plus installés, modules les plus achetés, top développeurs par revenus, taux de conversion visite→achat. | `app/analytics/store/page.tsx` |
| **Métriques modération** | Temps moyen de traitement par catégorie, taux de résolution, charge par modérateur, faux positifs IA. | `app/analytics/moderation/page.tsx` |
| **i18n analytics** | `messages/*/analytics.json` : labels graphiques, périodes, métriques traduits. Attention aux formats de nombres selon locale (1 234,56 vs 1,234.56). | `messages/*/analytics.json` |

---

## Phase 5 — Store & Économie (Sprints 9-10)

> **Objectif :** Gestion complète du cycle de vie des modules et de l'économie ImuCoins.

### Sprint 9 · Review & Validation des Modules

**Rôles accédant :** `SUPER_ADMIN`, `ADMIN_PLATFORM`, `ADMIN_STORE`

| Tâche | Description | Fichiers |
|---|---|---|
| **File de review `/store/review`** | Liste des modules en attente de validation. Colonnes : nom, développeur, catégorie, permissions demandées, date soumission. Tri par ancienneté. | `app/store/review/page.tsx` |
| **Fiche module `/store/review/[id]`** | Vue complète : metadata, screenshots, manifeste JSON, permissions demandées, sandbox de test (iframe isolé), historique des soumissions précédentes. | `app/store/review/[id]/page.tsx` |
| **Actions review** | Approuver (avec message optionnel), Rejeter (motif obligatoire + catégorie), Demander modifications (checklist), Mettre en vedette. | `components/store/ReviewActions.tsx` |
| **Sandbox test** | Iframe sandboxé pour tester la mini-app soumise sans risque. Affiche les appels API Bridge effectués par la mini-app. | `components/store/ModuleSandbox.tsx` |
| **Historique décisions** | Timeline des décisions sur un module. Comparaison entre versions. | `components/store/ReviewHistory.tsx` |
| **Catalogue store admin** | Vue du catalogue complet avec possibilité de mettre en avant, masquer, ou retirer un module publié. | `app/store/catalog/page.tsx` |

---

### Sprint 10 · Finance & Paiements

**Rôles accédant :** `SUPER_ADMIN`, `ADMIN_FINANCE`

| Tâche | Description | Fichiers |
|---|---|---|
| **Dashboard financier** | Revenus totaux, transactions du jour, payouts en attente, alertes fraude. | `app/finance/page.tsx` |
| **Transactions `/finance/transactions`** | Table paginée de toutes les transactions : ID, user, type (achat, payout, remboursement), montant, statut, date. Filtres avancés. | `app/finance/transactions/page.tsx` |
| **Gestion payouts `/finance/payouts`** | Payouts développeurs en attente. Approuver/rejeter manuellement. Historique des payouts exécutés. | `app/finance/payouts/page.tsx` |
| **Remboursements `/finance/refunds`** | File de remboursements demandés. Approuver ou rejeter avec motif. Crédit automatique en ImuCoins ou virement. | `app/finance/refunds/page.tsx` |
| **Alertes fraude** | Transactions marquées comme suspectes par les règles de fraude (montant anormal, pays à risque, multiple transactions rapides). Actions : valider, bloquer, enquêter. | `app/finance/fraud/page.tsx` |
| **i18n finance** | `messages/*/finance.json` : types de transactions, statuts, montants formatés avec `Intl.NumberFormat` selon locale (€ pour FR, $ pour EN, ¥ pour JA). | `messages/*/finance.json` |

---

## Phase 6 — Configuration Plateforme (Sprints 11-12)

> **Objectif :** Interface de configuration complète — feature flags, limites, maintenance, i18n config.

### Sprint 11 · Feature Flags & Limites

**Rôles accédant :** `SUPER_ADMIN`, `ADMIN_PLATFORM`

| Tâche | Description | Fichiers |
|---|---|---|
| **Feature flags `/config/flags`** | Liste de tous les feature flags avec leur statut (actif/inactif) et leur scope (global, par locale, par tier d'âge, par plan). Toggle avec confirmation. | `app/config/flags/page.tsx` |
| **Flags par locale** | Certains flags sont activables uniquement pour une locale : ex. activer une fonctionnalité en beta uniquement pour `ja` (Japon) avant déploiement global. | `components/config/LocaleFlag.tsx` |
| **Flags par tier d'âge** | Flags liés à l'architecture de segmentation par âge (KIDS/JUNIOR/TEEN/ADULT). Activer/désactiver des features pour chaque tier. | `components/config/AgeTierFlag.tsx` |
| **Limites plateforme** | Configurer les limites : taille max upload (Mo), messages/min par user, membres max par groupe, stockage max par compte. | `app/config/limits/page.tsx` |
| **Taux de commission** | Configurer la commission ImuChat sur les ventes Store (%) et les payouts développeurs. Historique des changements de taux. | `app/config/commissions/page.tsx` |
| **i18n config** | `messages/*/config.json` : labels de tous les paramètres avec descriptions, messages de confirmation. | `messages/*/config.json` |

---

### Sprint 12 · Maintenance & Incidents

**Rôles accédant :** `SUPER_ADMIN`, `ADMIN_PLATFORM`

| Tâche | Description | Fichiers |
|---|---|---|
| **Mode maintenance** | Activer/désactiver le mode maintenance avec : message personnalisé par locale, délai estimé, services affectés. Le message est affiché sur `app.imuchat.app`. | `app/config/maintenance/page.tsx` |
| **Gestion des incidents** | Créer/éditer/résoudre un incident. Lien avec `status.imuchat.app` via l'API Upptime. Description de l'impact + services touchés. | `app/config/incidents/page.tsx` |
| **Notifications système** | Envoyer une notification push à tous les utilisateurs (ou par locale). Prévisualisation avant envoi. Confirmation avec estimation du nombre de destinataires. | `app/config/broadcast/page.tsx` |
| **Bannières d'alerte** | Configurer une bannière d'alerte sur `app.imuchat.app` (ex : "maintenance prévue ce soir 23h"). Ciblage par locale. | `app/config/banners/page.tsx` |
| **Logs système `/logs/system`** | Logs Fastify + Socket.IO consultables dans l'admin. Filtres : niveau (error/warn/info), service, date. Recherche full-text. | `app/logs/system/page.tsx` |

---

## Phase 7 — IA & Companion Admin (Sprints 13-14)

> **Objectif :** Administrer Alice IA — personas, mémoire, modération IA, paramètres Companion.

### Sprint 13 · Gestion Alice IA

**Rôles accédant :** `SUPER_ADMIN`, `ADMIN_PLATFORM`

| Tâche | Description | Fichiers |
|---|---|---|
| **Dashboard IA `/ai`** | Requêtes Alice du jour, coût token estimé, taux d'utilisation, modèles actifs, alertes quota. | `app/ai/page.tsx` |
| **Gestion personas `/ai/personas`** | Liste des personas IA disponibles (assistant, coach, prof…). Créer/éditer/désactiver. Éditeur de prompt système. Test live du persona. | `app/ai/personas/page.tsx` |
| **Éditeur persona** | Formulaire : nom, description, prompt système, langue, ton, limites. Test en temps réel avec preview de réponse. | `components/ai/PersonaEditor.tsx` |
| **Gestion mémoire utilisateurs** | Recherche de la mémoire IA d'un utilisateur par ID. Visualiser les souvenirs stockés. Supprimer des entrées spécifiques (RGPD). | `app/ai/memory/page.tsx` |
| **Journal IA `/ai/logs`** | Log de toutes les requêtes Alice (sans contenu — seulement metadata : user, persona, tokens, durée, erreurs). Filtres avancés. | `app/ai/logs/page.tsx` |
| **Quotas et coûts** | Configurer les quotas de tokens par plan (Free/Premium/Enterprise). Vue du coût réel par modèle. | `app/ai/quotas/page.tsx` |

---

### Sprint 14 · Modération IA & Companion

**Rôles accédant :** `SUPER_ADMIN`, `ADMIN_PLATFORM`, `MOD_SENIOR`

| Tâche | Description | Fichiers |
|---|---|---|
| **Config modération IA** | Configurer les seuils de détection automatique : toxicité, spam, contenu adulte. Sliders de sensibilité par catégorie. Preview sur des exemples. | `app/ai/moderation/page.tsx` |
| **Faux positifs IA** | File des contenus marqués par l'IA mais contestés par les utilisateurs. Revoir et corriger : valider la décision IA ou l'infirmer. Améliore le modèle. | `app/ai/false-positives/page.tsx` |
| **Config Companion `/ai/companion`** | Paramètres globaux du Companion (Alice Live2D) : archétypes disponibles, skins premium, comportements proactifs activés. | `app/ai/companion/page.tsx` |
| **i18n IA** | `messages/*/ai.json` : noms de personas traduits, catégories de modération, statuts, messages d'erreur. | `messages/*/ai.json` |

---

## Phase 8 — i18n Admin Complet (Sprints 15-16)

> **Objectif :** Interface complète de gestion des traductions de la plateforme ImuChat (accessible à `ADMIN_I18N`).

### Sprint 15 · Gestionnaire de Traductions

**Rôles accédant :** `SUPER_ADMIN`, `ADMIN_PLATFORM`, `ADMIN_I18N`

| Tâche | Description | Fichiers |
|---|---|---|
| **Dashboard i18n `/i18n`** | Tableau de couverture : pour chaque locale (FR/EN/JA), % de clés traduites par namespace. Clés manquantes en rouge. | `app/i18n/page.tsx` |
| **Éditeur de traductions `/i18n/[locale]/[namespace]`** | Table éditable : clé (readonly) · valeur en locale de référence (EN) · valeur dans la locale cible. Filtre : toutes / manquantes / modifiées. Sauvegarde en temps réel. | `app/i18n/[locale]/[namespace]/page.tsx` |
| **Clés manquantes** | Vue dédiée aux clés non traduites. Tri par namespace. Option "traduire automatiquement" via Alice IA (suggestion soumise à validation). | `app/i18n/missing/page.tsx` |
| **Import/Export** | Importer un fichier `.json` de traduction (merge ou replace). Exporter un namespace en `.json` pour travail hors ligne. | `components/i18n/ImportExport.tsx` |
| **Historique des modifications** | Timeline des changements par clé : qui a modifié, quelle était l'ancienne valeur, date. | `components/i18n/TranslationHistory.tsx` |

---

### Sprint 16 · Gestion des Locales & Déploiement

**Rôles accédant :** `SUPER_ADMIN`, `ADMIN_I18N`

| Tâche | Description | Fichiers |
|---|---|---|
| **Ajout d'une nouvelle locale** | Formulaire pour déclarer une nouvelle locale (ex : `ar`, `de`, `es`). Crée les fichiers vides basés sur `en.json`. Configure le support RTL si nécessaire. | `app/i18n/locales/page.tsx` |
| **Support RTL** | Toggle RTL pour les locales arabes/hébraïques. Preview de l'interface admin en mode RTL. | `components/i18n/RTLPreview.tsx` |
| **Validation CI** | Déclencher manuellement le script de validation i18n (compare les clés entre locales). Affiche les erreurs avec lien direct vers l'éditeur. | `app/i18n/validate/page.tsx` |
| **Déploiement traductions** | Après modification, déclencher le rebuild uniquement des messages i18n (sans rebuild complet). | `app/i18n/deploy/page.tsx` |
| **Gestion des pluriels** | Éditeur spécialisé pour les clés ICU pluriel. Affiche les formes (zero/one/other/few/many) selon la locale. | `components/i18n/PluralEditor.tsx` |

---

## 13. Sitemap complet

```
admin.imuchat.app/
│
├── /login                          ← Auth MFA (tous)
│
├── /dashboard                      ← Dashboard principal (tous)
│
├── /users                          ← Liste utilisateurs
│   ├── /[id]                       ← Fiche utilisateur
│   │   ├── /sessions               ← Sessions actives
│   │   ├── /sanctions              ← Historique sanctions
│   │   └── /notes                  ← Notes internes
│   ├── /bulk                       ← Actions groupées
│   └── /export                     ← Export CSV/JSON
│
├── /moderation                     ← Dashboard modération
│   ├── /queue                      ← File d'attente
│   ├── /[reportId]                 ← Fiche signalement
│   └── /history                    ← Historique traité
│
├── /security                       ← Dashboard sécurité
│   ├── /ip-bans                    ← IPs bloquées
│   ├── /multi-accounts             ← Détection multi-comptes
│   └── /automod                    ← Config automodération
│
├── /analytics                      ← Dashboard analytics
│   ├── /users                      ← Métriques utilisateurs
│   ├── /content                    ← Métriques contenu
│   ├── /revenue                    ← Métriques revenus
│   ├── /store                      ← Métriques Store
│   └── /moderation                 ← Métriques modération
│
├── /store                          ← Admin Store
│   ├── /review                     ← File de review
│   │   └── /[moduleId]             ← Fiche module
│   └── /catalog                    ← Catalogue publié
│
├── /finance                        ← Dashboard finance
│   ├── /transactions               ← Toutes les transactions
│   ├── /payouts                    ← Payouts développeurs
│   ├── /refunds                    ← Remboursements
│   └── /fraud                      ← Alertes fraude
│
├── /config                         ← Configuration
│   ├── /flags                      ← Feature flags
│   ├── /limits                     ← Limites plateforme
│   ├── /commissions                ← Taux de commission
│   ├── /maintenance                ← Mode maintenance
│   ├── /incidents                  ← Gestion incidents
│   ├── /broadcast                  ← Notifications système
│   └── /banners                    ← Bannières d'alerte
│
├── /ai                             ← Administration IA
│   ├── /personas                   ← Gestion personas
│   │   └── /[personaId]            ← Éditeur persona
│   ├── /memory                     ← Mémoire utilisateurs
│   ├── /logs                       ← Journal IA
│   ├── /quotas                     ← Quotas et coûts
│   ├── /moderation                 ← Config modération IA
│   ├── /false-positives            ← Faux positifs IA
│   └── /companion                  ← Config Companion
│
├── /i18n                           ← Gestionnaire traductions
│   ├── /[locale]/[namespace]       ← Éditeur traductions
│   ├── /missing                    ← Clés manquantes
│   ├── /locales                    ← Gestion des locales
│   └── /validate                   ← Validation CI
│
├── /logs                           ← Journaux système
│   ├── /audit                      ← Audit trail admin
│   ├── /security                   ← Logs sécurité
│   └── /system                     ← Logs Fastify/WS
│
├── /support                        ← Tickets support
│   ├── /queue                      ← File tickets
│   └── /[ticketId]                 ← Fiche ticket
│
└── /roles                          ← Gestion rôles admin
    └── /[adminId]                  ← Fiche admin
```

---

## 14. Modèle de données

### Table `admin_users`

```sql
CREATE TABLE admin_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role          TEXT NOT NULL CHECK (role IN (
    'SUPER_ADMIN','ADMIN_PLATFORM','ADMIN_FINANCE',
    'MOD_SENIOR','MOD_STANDARD','ADMIN_STORE',
    'SUPPORT','ANALYST','ADMIN_I18N'
  )),
  granted_by    UUID REFERENCES admin_users(id),
  expires_at    TIMESTAMPTZ,                    -- NULL = permanent
  is_active     BOOLEAN NOT NULL DEFAULT true,
  locale        TEXT NOT NULL DEFAULT 'fr',     -- Langue interface admin
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Table `admin_audit_logs`

```sql
CREATE TABLE admin_audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id      UUID NOT NULL REFERENCES admin_users(id),
  admin_role    TEXT NOT NULL,
  action        TEXT NOT NULL,                  -- ex: 'user.ban', 'module.approve'
  target_type   TEXT,                           -- 'user', 'module', 'config', etc.
  target_id     TEXT,
  payload       JSONB,                          -- Détails de l'action
  ip_address    INET,
  user_agent    TEXT,
  locale        TEXT,                           -- Locale admin au moment de l'action
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour les filtres fréquents
CREATE INDEX idx_audit_admin_id    ON admin_audit_logs(admin_id);
CREATE INDEX idx_audit_action      ON admin_audit_logs(action);
CREATE INDEX idx_audit_target      ON admin_audit_logs(target_type, target_id);
CREATE INDEX idx_audit_created_at  ON admin_audit_logs(created_at DESC);
```

### Table `user_sanctions`

```sql
CREATE TABLE user_sanctions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id),
  admin_id      UUID NOT NULL REFERENCES admin_users(id),
  type          TEXT NOT NULL CHECK (type IN ('warning','mute','suspend','ban')),
  reason        TEXT NOT NULL,
  category      TEXT,                           -- 'spam','abuse','fraud','illegal_content'
  expires_at    TIMESTAMPTZ,                    -- NULL = permanent (ban)
  lifted_at     TIMESTAMPTZ,
  lifted_by     UUID REFERENCES admin_users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 15. Checklist de déploiement

### Infrastructure
- [ ] DNS : `admin.imuchat.app` → serveur dédié ou namespace K8s isolé
- [ ] SSL/TLS : certificat Let's Encrypt via Traefik
- [ ] Pas d'indexation SEO : `X-Robots-Tag: noindex` dans les headers
- [ ] IP whitelist optionnelle (VPN d'entreprise) pour bloquer l'accès externe
- [ ] Rate limiting strict sur `/login` (5 tentatives / 15min)

### Sécurité
- [ ] MFA obligatoire pour tous les comptes admin (TOTP)
- [ ] Session timeout 30min
- [ ] Audit trail actif sur toutes les actions dès le premier déploiement
- [ ] HTTPS uniquement — redirection HTTP → HTTPS
- [ ] Headers sécurité : CSP strict, `X-Frame-Options: DENY`

### RGPD & Conformité
- [ ] Tout export de données loggé dans l'audit trail
- [ ] Accès aux données personnelles limité au minimum selon le rôle
- [ ] Logs de consultation des fiches utilisateurs (qui a consulté qui)
- [ ] Politique de rétention des logs : audit trail 2 ans, logs système 90 jours

### i18n
- [ ] Les 3 locales (FR/EN/JA) disponibles dès le lancement
- [ ] Aucun texte hardcodé dans les composants
- [ ] Script CI de validation i18n activé dans le pipeline
- [ ] Formatage des dates/montants selon locale

---

*Document créé le 11 mars 2026 — ImuChat Admin Team*  
*Version : 1.0*
