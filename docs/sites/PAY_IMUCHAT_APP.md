# 💰 pay.imuchat.app — ImuBank / ImuWallet / ImuPay

> Présentation de la couche financière d'ImuChat : paiements, wallet, cartes, épargne, investissements.

---

## 🎯 Objectif Stratégique

**Créer la confiance nécessaire pour que les utilisateurs confient leur argent à une super-app.** Le site est une page de rassurance orientée conversion, avec les certifications, la sécurité financière et les cas d'usage concrets.

Comparable à : pages de présentation de Revolut, Cash App, WeChat Pay, Lydia.

---

## 📋 Fiche d'identité

| Champ | Valeur |
|---|---|
| **Sous-domaine** | `pay.imuchat.app` |
| **Type** | Landing page fintech / Page de confiance |
| **Cibles principales** | Utilisateurs hésitants, early adopters finance, commerçants |
| **Priorité** | 🟡 Moyenne |
| **Lien écosystème** | `trust.imuchat.app`, `security.imuchat.app` |
| **Framework** | Next.js 14 (App Router) |
| **i18n** | FR, EN, DE |

---

## 🧭 Arborescence des pages

```
pay.imuchat.app
├── /                     → Page d'accueil (Hero finance + proposition de valeur)
├── /wallet               → ImuWallet (portefeuille multi-devises)
├── /send                 → Paiements P2P (envoyer, demander, diviser)
├── /cards                → Cartes ImuChat (virtuelles & physiques)
├── /savings              → Épargne & objectifs
├── /invest               → Investissements (actions fractionnées, ETF)
├── /merchants            → Solutions commerçants (QR, NFC, terminal)
├── /imucoins             → ImuCoins (monnaie interne)
├── /security             → Sécurité financière & certifications
├── /pricing              → Tarification & commissions
├── /faq                  → Questions fréquentes
├── /contact              → Contact & support
└── /legal                → CGU financières & mentions légales
```

---

## 📄 Détail des pages

### 🏠 `/` — Page d'accueil

**Sections** :

1. **Hero** — "Votre argent. Votre contrôle. Partout." + visuel carte ImuChat + interface wallet
2. **En 1 phrase** — "ImuPay intègre un wallet, des cartes, des paiements P2P et de l'investissement, directement dans votre super-app."
3. **Fonctionnalités clés** — 6 piliers visuels : Wallet, Envoyer, Cartes, Épargne, Investir, Commerçants
4. **Rassurance sécurité** — Barre de confiance : "Chiffrement bancaire", "RGPD", "Licence EME" (objectif), "Fonds séquestrés"
5. **Comparaison** — "Tout ce que font Revolut, Lydia et PayPal séparément, ImuChat le fait en un seul endroit."
6. **Témoignages** — 3 utilisateurs types (étudiant, famille, freelance)
7. **CTA** — "Ouvrir mon wallet" / "En savoir plus"

### 👛 `/wallet` — ImuWallet

**Contenu** :

- **Multi-devises** : EUR, USD, GBP, JPY, CHF (conversion instantanée)
- **ImuCoins** : Monnaie interne (100 IC = 1€), utilisable partout dans l'écosystème
- **Solde unifié** : Un seul écran pour tout voir
- **Historique** : Transactions détaillées, filtres, export CSV
- **Notifications** : Alertes de réception, dépenses, seuils
- **Recharge** : Virement, carte bancaire, Apple Pay, Google Pay

### 💸 `/send` — Paiements P2P

**Contenu** :

- **Envoyer** : Envoyer de l'argent à un contact ImuChat en 1 tap
- **Demander** : Créer une demande de paiement
- **Diviser** : Partager une note (restaurant, courses, voyages)
- **Cagnottes** : Cagnottes de groupe (anniversaires, voyages)
- **Instantané** : Transfert en temps réel entre wallets ImuChat
- **International** : Envoi cross-border avec conversion automatique

### 💳 `/cards` — Cartes ImuChat

**Contenu** :

- **Carte virtuelle** : Générable instantanément, utilisable en ligne
- **Carte physique** : Visa/Mastercard, livraison à domicile
- **Contrôles** : Bloquer/débloquer, limites de dépense, zones géographiques
- **Cashback** : Programme de cashback sur achats sélectionnés
- **Notifications** : Alerte instantanée à chaque transaction
- **Apple Pay / Google Pay** : Compatible NFC

### 🐖 `/savings` — Épargne & Objectifs

**Contenu** :

- **Coffres-objectifs** : Créer un objectif d'épargne (vacances, gadget, urgence)
- **Arrondi automatique** : Arrondir chaque dépense au supérieur, la différence va dans l'épargne
- **Épargne programmée** : Virements automatiques récurrents
- **Taux** : Rémunération sur les fonds épargnés (sous conditions réglementaires)
- **Visuels** : Barre de progression, graphiques d'évolution

### 📈 `/invest` — Investissements

**Contenu** :

- **Actions fractionnées** : Investir dès 1€ (Apple, Tesla, LVMH…)
- **ETF** : Portefeuilles diversifiés clé en main
- **Crypto Hub** : Acheter/vendre (BTC, ETH, SOL…), staking, portfolio
- **Alice Finance** : IA qui analyse votre profil et suggère des investissements
- **Éducation** : Cours intégrés "Les bases de l'investissement"
- **Avertissement** : Mentions légales investissement, risques

### 🏪 `/merchants` — Solutions commerçants

**Contenu** :

- **QR Code** : Paiement par scan QR (rapide, sans matériel)
- **NFC** : Paiement sans contact via carte ou téléphone
- **Terminal** : Application terminal de paiement (tablette/smartphone)
- **Dashboard** : Tableau de bord commerçant (ventes, analytics)
- **API Paiement** : Intégration pour les e-commerçants
- **Commissions** : Grille transparente (% par transaction)
- **CTA** → "Devenir commerçant partenaire"

### 🪙 `/imucoins` — ImuCoins

**Contenu** :

- **Qu'est-ce qu'un ImuCoin ?** — Monnaie interne de l'écosystème (100 IC = 1€)
- **Où les utiliser ?** — Store (achats mini-apps), Arena (tickets concours), Feed (pourboires), Gaming (in-game), Chat (cadeaux)
- **Comment en obtenir ?** :
  - Acheter : 5 packages (0,99€ → 49,99€)
  - Gagner : concours, quêtes quotidiennes, challenges
  - Recevoir : pourboires, cadeaux
- **Conversion** : ImuCoins → EUR (sous conditions, pour les créateurs)
- **Transparence** : Pas de spéculation, taux fixe, pas de blockchain

### 🔒 `/security` — Sécurité financière

**Contenu** :

- **Chiffrement** : TLS 1.3, AES-256, PCI DSS
- **Licence** : Objectif licence EME (Établissement de Monnaie Électronique) / agent PSP
- **Fonds séquestrés** : L'argent des utilisateurs est séparé des fonds de l'entreprise
- **3D Secure** : Authentification renforcée pour les paiements carte
- **Anti-fraude** : Détection d'anomalies IA, géolocalisation, limites automatiques
- **Assurance** : Fonds protégés jusqu'à 100 000€ (selon licence)
- **Audit** : Audits externes annuels, rapports de conformité publics
- **Bug Bounty** : Programme de sécurité pour chercheurs

### 💰 `/pricing` — Tarification

| Service | Coût |
|---|---|
| Ouverture de compte | Gratuit |
| Carte virtuelle | Gratuite |
| Carte physique | 9,90€ (unique) |
| Paiement P2P (ImuChat→ImuChat) | Gratuit |
| Conversion devises | 0,5% (marché) |
| Retrait DAB | 2 gratuits/mois, puis 2€ |
| Achat ImuCoins | 0% commission |
| Commerçant (par transaction) | 1,5% |
| Investissements | 0% achat, 0,5% vente |

### ❓ `/faq` — Questions fréquentes

**Catégories** :

- Sécurité & confiance
- Wallet & solde
- Cartes
- Paiements
- ImuCoins
- Investissements
- Commerçants
- Litiges & remboursements

---

## 🎨 Design System

- **Palette** : Vert finance (#059669) + Noir élégant (#111827) + Blanc + Or accent (#F59E0B)
- **Ambiance** : Fintech premium, propre, rassurante (inspiration Revolut/N26)
- **Illustrations** : Mockups carte + interface wallet, isométrique
- **Typographie** : Inter (chiffres bien lisibles, monospace pour montants)

### Composants spécifiques

- `WalletPreview` — Mockup interface wallet (solde, dernières transactions)
- `CardPreview` — Visualisation 3D de la carte ImuChat
- `TrustBar` — Barre de badges de confiance (PCI DSS, RGPD, licence)
- `PricingRow` — Ligne de tarification avec icône + description
- `SecurityShield` — Icône bouclier animée avec détails sécurité
- `CoinPackage` — Card de package ImuCoins (montant + prix + bonus)
- `FAQAccordion` — Accordion FAQ par catégorie
- `MerchantDashboard` — Preview du dashboard commerçant

---

## 📅 Roadmap d'implémentation

### Phase 1 (Semaines 1-2)

- [ ] Page `/` — Home finance (rassurance)
- [ ] Page `/wallet` — ImuWallet
- [ ] Page `/security` — Sécurité financière
- [ ] Page `/pricing` — Grille tarifaire
- [ ] Page `/faq` — FAQ

### Phase 2 (Semaines 3-4)

- [ ] Pages `/send`, `/cards`, `/imucoins`
- [ ] Page `/merchants` — Solutions commerçants
- [ ] Page `/contact` — Support financier
- [ ] Traductions FR/EN

### Phase 3 (Semaines 5-6)

- [ ] Pages `/savings`, `/invest`
- [ ] Mockup 3D carte
- [ ] SEO fintech keywords
- [ ] Pages légales financières
- [ ] Traduction DE

---

## 📊 KPIs de succès

| KPI | Objectif |
|---|---|
| Temps sur /security | > 2 min |
| Clics "Ouvrir mon wallet" | > 5% visiteurs |
| FAQ consultée | > 30% visiteurs |
| Taux de rebond | < 40% |

---

## 🔗 Liens avec l'écosystème

- **`trust.imuchat.app`** → Page de transparence
- **`store.imuchat.app`** → ImuCoins utilisables dans le Store
- **`arena.imuchat.app`** → ImuCoins pour tickets de compétition
- **`creators.imuchat.app`** → Pourboires et monétisation
- **`enterprise.imuchat.app`** → Solutions paiement entreprise
