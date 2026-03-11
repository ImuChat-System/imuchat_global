# 🏛️ enterprise.imuchat.app — ImuChat Enterprise

> Site dédié aux grandes entreprises, administrations, défense, santé et éducation.

---

## 🎯 Objectif Stratégique

**Positionner ImuChat comme une plateforme de communication et de collaboration de confiance pour les organisations exigeantes en matière de sécurité, conformité et souveraineté.**

Le site doit rassurer les DSI, RSSI et décideurs sur la capacité d'ImuChat à opérer dans des environnements régulés.

---

## 📋 Fiche d'identité

| Champ | Valeur |
|---|---|
| **Sous-domaine** | `enterprise.imuchat.app` |
| **Type** | Site B2B / Institutionnel |
| **Cibles principales** | DSI, RSSI, DPO, décideurs IT, acheteurs publics |
| **Priorité** | 🟠 Haute |
| **Lien écosystème** | `office.imuchat.app`, `trust.imuchat.app`, `partners.imuchat.app` |
| **Framework** | Next.js 14 (App Router) |
| **i18n** | FR, EN, DE |

---

## 🧭 Arborescence des pages

```
enterprise.imuchat.app
├── /                     → Page d'accueil (Hero B2B + proposition de valeur)
├── /solutions            → Solutions par secteur
├── /security             → Sécurité, conformité & certifications
├── /deployment           → Options de déploiement (Cloud / Hybrid / On-Premise)
├── /sso                  → Intégration SSO, LDAP, Active Directory
├── /admin                → Console d'administration & MDM
├── /sla                  → SLA & engagements de service
├── /customers            → Références clients & études de cas
├── /pricing              → Tarification entreprise
├── /contact              → Contact commercial + formulaire RFP
├── /privacy              → Politique de confidentialité
└── /legal                → Mentions légales & CGU enterprise
```

---

## 📄 Détail des pages

### 🏠 `/` — Page d'accueil Enterprise

**Sections** :
1. **Hero** — "La super-app souveraine pour votre organisation." + visuel interface admin
2. **Chiffres de confiance** — "100% UE", "Chiffrement E2E", "On-Premise disponible", "RGPD natif"
3. **Pourquoi ImuChat Enterprise ?** — 4 piliers : Communication unifiée, Suite bureautique, IA privée, Store modulaire
4. **Secteurs** — Administration, Santé, Éducation, Défense, Industries régulées
5. **Témoignages** — Citations de pilotes / early adopters
6. **CTA** — "Demander une démo" / "Télécharger le whitepaper"

### 🏢 `/solutions` — Solutions par secteur

**Sous-pages ou sections** :

**🏛️ Administrations & Collectivités**
- Communication sécurisée entre services
- Remplacement de solutions propriétaires américaines
- Conformité marchés publics
- Intégration avec les SI existants

**🏥 Santé**
- Messagerie conforme HDS (Hébergement Données de Santé)
- Échange sécurisé de dossiers patients
- Téléconsultation (visio intégrée)
- Intégration DPI (Dossier Patient Informatisé)

**🎓 Éducation**
- Lien direct avec `education.imuchat.app`
- Communication enseignants/étudiants/parents
- Suite bureautique pour établissements
- Intégration ENT (Environnement Numérique de Travail)

**🛡️ Défense & Secteurs sensibles**
- Déploiement air-gap (réseau fermé)
- Chiffrement de grade militaire
- Audit de sécurité sur demande
- Certification en cours (SecNumCloud)

**🏭 Industrie & PME/ETI**
- Communication unifiée (chat, visio, fichiers)
- Réduction du shadow IT
- ImuOffice en remplacement de Microsoft 365
- Store d'apps métier internes

### 🔒 `/security` — Sécurité & conformité

**Contenu détaillé** :
- **Chiffrement** : TLS 1.3, AES-256 au repos, E2E optionnel (Signal Protocol)
- **Authentification** : MFA, biométrie, clés physiques (FIDO2)
- **Conformité** :
  - RGPD (registre, DPO, portabilité, effacement)
  - HDS (Hébergement Données de Santé)
  - ISO 27001 (en cours)
  - SecNumCloud (objectif)
  - eIDAS (signature électronique)
- **Audit** : Trail complet, exports conformes, rapports automatisés
- **Pentesting** : Programme de bug bounty, audits externes réguliers
- **Localisation données** : Datacenters France & Allemagne exclusivement

### 🖥️ `/deployment` — Options de déploiement

| Option | Description | Cible |
|---|---|---|
| **Cloud UE** | SaaS hébergé 100% en UE (France/Allemagne) | PME, Éducation |
| **Cloud Privé** | Instance dédiée, VPC isolé | ETI, Santé |
| **Hybride** | Cloud + composants on-premise | Grandes entreprises |
| **On-Premise** | Installation complète sur infrastructure client | Défense, Administrations |
| **Air-Gap** | Réseau fermé, aucune connexion extérieure | Secteurs sensibles |

**Détails techniques** :
- Orchestration : Kubernetes (Helm charts fournis)
- Bases de données : PostgreSQL (Supabase compatible)
- Stockage : S3-compatible (MinIO pour on-premise)
- IA locale : Modèles Mistral/LLaMA déployables localement

### 🔑 `/sso` — Intégration SSO

**Protocoles supportés** :
- SAML 2.0
- OpenID Connect (OIDC)
- LDAP / Active Directory
- SCIM (provisioning automatique)

**Intégrations certifiées** :
- Microsoft Entra ID (Azure AD)
- Okta
- Keycloak
- Google Workspace
- OneLogin

**Fonctionnalités** :
- Provisioning/deprovisioning automatique
- Groupes synchronisés
- Politiques de session (timeout, IP whitelisting)
- MFA conditionnel

### ⚙️ `/admin` — Console d'administration

**Présentation de la console** :
- **Dashboard** : Vue d'ensemble (utilisateurs actifs, stockage, alertes)
- **Gestion utilisateurs** : Création, groupes, rôles (RBAC + ABAC)
- **Politiques de sécurité** : Mots de passe, MFA, rétention données
- **Modules** : Activation/désactivation des modules par groupe
- **Audit logs** : Qui a fait quoi, quand, où
- **Rapports** : Usage, conformité, incidents
- **MDM** : Gestion des appareils mobiles (wipe à distance, app obligatoire)
- **DLP** : Prévention de fuite de données (règles de partage)

### 📋 `/sla` — Engagements de service

| Plan | Disponibilité | Temps de réponse | Support |
|---|---|---|---|
| **Business** | 99,5% | 4h (heures ouvrées) | Email + Chat |
| **Enterprise** | 99,9% | 1h (24/7) | Dédié + Téléphone |
| **Souverain** | 99,95% | 30 min (24/7) | TAM dédié + On-site |

**Inclus** :
- Monitoring proactif
- Notification incidents en temps réel (`status.imuchat.app`)
- Post-mortem pour tout incident majeur
- Mises à jour de sécurité sous 24h

### 💰 `/pricing` — Tarification entreprise

| Plan | Prix | Inclus |
|---|---|---|
| **Business** | 14,90€/user/mois | Cloud UE, SSO OIDC, Admin console, 500 Go/org |
| **Enterprise** | Sur devis | Cloud privé/hybride, SAML, SCIM, SLA 99,9%, TAM |
| **Souverain** | Sur devis | On-premise, air-gap, SecNumCloud, audit, formation |

**CTA** : "Contacter l'équipe commerciale" / "Demander un devis personnalisé"

### 🏆 `/customers` — Références

**Structure** :
- Logos de clients/partenaires pilotes
- 3-5 études de cas détaillées (PDF téléchargeables)
- Témoignages vidéo (si disponibles)
- Secteurs représentés

### ✉️ `/contact` — Contact commercial

**Formulaire** :
- Nom, Prénom, Email pro
- Organisation + Secteur d'activité
- Taille (nombre d'utilisateurs)
- Besoin : Démo / Devis / RFP / Partenariat
- Déploiement souhaité : Cloud / Hybride / On-Premise
- Délai de décision
- Message libre

---

## 🎨 Design System

- **Palette** : Bleu marine (#0F172A) + Blanc + Accent violet ImuChat
- **Ton** : Sobre, institutionnel, confiance
- **Illustrations** : Schémas d'architecture, captures d'écran console admin
- **Pas de** : emojis excessifs, animations ludiques, ton "startup cool"

### Composants spécifiques

- `TrustBar` — Barre de logos certifications (RGPD, ISO, SecNumCloud)
- `DeploymentDiagram` — Schéma interactif des options de déploiement
- `SLATable` — Tableau SLA responsive
- `SectorCard` — Carte secteur avec illustration + CTA
- `WhitepaperDownload` — Bloc téléchargement whitepaper avec capture email
- `RFPForm` — Formulaire de réponse à appel d'offres

---

## 📅 Roadmap d'implémentation

### Phase 1 — Fondations (Semaines 1-2)

- [ ] Setup projet + design system "institutionnel"
- [ ] Page `/` — Home B2B
- [ ] Page `/security` — Sécurité & conformité
- [ ] Page `/deployment` — Options de déploiement
- [ ] Page `/contact` — Formulaire commercial
- [ ] Page `/pricing` — Grille tarifaire

### Phase 2 — Approfondissement (Semaines 3-4)

- [ ] Page `/solutions` — 5 sous-sections sectorielles
- [ ] Page `/sso` — Intégrations détaillées
- [ ] Page `/admin` — Console d'administration
- [ ] Page `/sla` — Engagements de service
- [ ] Traductions FR/EN

### Phase 3 — Crédibilité (Semaines 5-6)

- [ ] Page `/customers` — Références & études de cas
- [ ] Whitepapers téléchargeables (sécurité, conformité, architecture)
- [ ] SEO B2B, OG images
- [ ] Traduction DE
- [ ] Analytics conversion

---

## 📊 KPIs de succès

| KPI | Objectif |
|---|---|
| Formulaires reçus | > 20/mois |
| Téléchargements whitepaper | > 50/mois |
| Taux conversion visite→contact | > 3% |
| Pages vues /security | Top 3 pages |

---

## 🔗 Liens avec l'écosystème

- **`office.imuchat.app`** → Suite bureautique détaillée
- **`trust.imuchat.app`** → Page de confiance & transparence
- **`partners.imuchat.app`** → Programme partenaires
- **`education.imuchat.app`** → Déclinaison éducation
- **`status.imuchat.app`** → Statut de la plateforme
