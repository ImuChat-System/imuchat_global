# 🔗 go.imuchat.app — Redirections Marketing

> Service de liens courts et redirections marketing pour les campagnes ImuChat.

---

## 🎯 Objectif Stratégique

**Centraliser toutes les redirections marketing** avec tracking UTM, analytics intégrés et vanity URLs pour les campagnes (réseaux sociaux, partenariats, événements, QR codes).

---

## 📋 Fiche d'identité

| Champ | Valeur |
|---|---|
| **Sous-domaine** | `go.imuchat.app` |
| **Type** | URL Shortener / Redirect Service |
| **Cibles principales** | Équipe marketing, partenaires, utilisateurs (clic final) |
| **Priorité** | 🟡 Moyenne |
| **i18n** | Non applicable (redirections) |

---

## 🧭 Arborescence

```
go.imuchat.app
├── /[slug]               → Redirection vers URL cible (301/302)
├── /download             → Redirection vers store approprié (iOS/Android/Desktop)
├── /download/ios         → App Store direct
├── /download/android     → Google Play direct
├── /download/desktop     → Download page desktop
├── /signup               → Inscription ImuChat
├── /enterprise           → Landing enterprise
├── /education            → Landing éducation
├── /event/[eventSlug]    → Redirections événementielles
├── /partner/[partnerSlug]→ Liens trackés partenaires
├── /qr/[id]              → Redirections QR codes
└── /_admin               → Dashboard interne (protégé)
```

---

## ⚙️ Fonctionnement

### Redirections Intelligentes

| Type | Logique |
|---|---|
| **`/download`** | Détection User-Agent → iOS/Android/Desktop |
| **`/[slug]`** | Lookup en base → redirect 301 + tracking |
| **`/qr/[id]`** | QR code → redirect avec analytics visite |

### Tracking

Chaque redirection capture :
- **UTM parameters** (source, medium, campaign, content, term)
- **User-Agent** (OS, navigateur, device)
- **Géolocalisation** (pays, ville)
- **Timestamp** (UTC)
- **Referrer**

### Liens prédéfinis

| Lien court | Destination |
|---|---|
| `go.imuchat.app/download` | Smart link (iOS/Android/Desktop) |
| `go.imuchat.app/signup` | `imuchat.app/signup` |
| `go.imuchat.app/enterprise` | `enterprise.imuchat.app` |
| `go.imuchat.app/education` | `education.imuchat.app` |
| `go.imuchat.app/discord` | Serveur Discord ImuChat |
| `go.imuchat.app/github` | Organisation GitHub |
| `go.imuchat.app/docs` | `docs.imuchat.app` |

---

## 🛠 Stack Technique

| Composant | Technologie |
|---|---|
| Runtime | Cloudflare Workers (edge, latence minimale) |
| Base de données | Cloudflare KV (lookup rapide) ou Supabase |
| Analytics | Événements vers Plausible / Supabase |
| Dashboard | Next.js admin (protégé) |
| QR Generator | `qrcode` npm package |

### Pourquoi Cloudflare Workers ?

- **Latence < 10ms** — Les redirections doivent être instantanées
- **Edge global** — Pas de cold start
- **Gratuit** jusqu'à 100K requêtes/jour
- **Alternative** : Vercel Edge Functions ou Next.js middleware

---

## 📊 KPIs

| Métrique | Objectif |
|---|---|
| Temps de redirection | < 50ms |
| Liens actifs | 100+ |
| Clics trackés/mois | 50 000+ |
| Taux de conversion (download) | > 15% |

---

## 📅 Roadmap

### Phase 1 (Semaine 1)
- [ ] Setup Cloudflare Worker
- [ ] Redirections `/download` (smart link)
- [ ] Redirections statiques prédéfinies
- [ ] Tracking analytics basique

### Phase 2 (Semaine 2-3)
- [ ] Dashboard admin (CRUD liens)
- [ ] Générateur QR codes
- [ ] Analytics détaillés par lien
- [ ] API pour créer des liens programmatiquement

---

## 🔗 Liens

- **`analytics.imuchat.app`** → Dashboard analytics global
- **`blog.imuchat.app`** → Campagnes blog
- **`partners.imuchat.app`** → Liens trackés partenaires
