# 📋 logs.imuchat.app — Interface Logs & Observabilité

> Dashboard de logs et observabilité interne : logs applicatifs, traces distribuées, alertes, santé infrastructure.

---

## 🎯 Objectif Stratégique

**Assurer la fiabilité et la performance de la plateforme** en centralisant les logs, traces et métriques d'infrastructure. Permettre un diagnostic rapide des incidents et une surveillance proactive.

---

## 📋 Fiche d'identité

| Champ | Valeur |
|---|---|
| **Sous-domaine** | `logs.imuchat.app` |
| **Type** | Observabilité & Logs (interne) |
| **Cibles principales** | DevOps, SRE, Backend Engineers, On-call |
| **Priorité** | 🔴 Critique |
| **Accès** | SSO interne + RBAC (Engineering uniquement) |
| **i18n** | EN (convention Engineering) |

---

## 🧭 Arborescence

```
logs.imuchat.app
├── /                     → Overview santé système
├── /logs                 → Explorateur de logs
├── /logs/search          → Recherche avancée (query language)
├── /logs/live            → Tail en temps réel
├── /traces               → Traces distribuées
├── /traces/[traceId]     → Détail d'une trace (waterfall)
├── /metrics              → Métriques infrastructure
├── /metrics/api          → Latence & throughput API
├── /metrics/db           → Performance base de données
├── /metrics/services     → Santé par service
├── /alerts               → Alertes actives & historique
├── /alerts/rules         → Configuration des règles d'alerte
├── /incidents            → Gestion d'incidents
├── /incidents/[id]       → Timeline incident
├── /uptime               → Monitoring uptime (public status mirror)
└── /settings             → Configuration (rétention, sources, intégrations)
```

---

## 📄 Pages clés

### 🏠 `/` — Overview Santé Système

**Widgets** :
| Widget | Description |
|---|---|
| **Uptime global** | 99.9% target, jauge temps réel |
| **Error rate** | Erreurs/min par service (sparkline) |
| **Latence P50/P95/P99** | API gateway |
| **Services status** | Grid : vert/jaune/rouge par service |
| **Alertes actives** | Nombre + sévérité |
| **Derniers incidents** | 5 plus récents |

**Services monitorés** :
- `platform-core` — API principale
- `auth-service` — Authentification
- `messaging-service` — Messagerie temps réel
- `media-service` — Upload/traitement médias
- `alice-service` — IA Alice
- `store-service` — ImuStore
- `pay-service` — ImuPay
- `notification-service` — Push/email
- `search-service` — Recherche (Algolia/Meilisearch)

### 📜 `/logs` — Explorateur de Logs

**Interface** :
- **Barre de recherche** — Query language structuré
  ```
  service:messaging-service level:error timestamp:>now-1h
  ```
- **Filtres** — Service, niveau (debug/info/warn/error/fatal), timestamp
- **Résultats** — Table scrollable, syntax highlighting JSON
- **Détail log** — Panel latéral (full JSON, context, trace linkée)
- **Export** — CSV, JSON

**Niveaux de log** :
| Niveau | Couleur | Usage |
|---|---|---|
| `DEBUG` | Gris | Développement uniquement |
| `INFO` | Bleu | Opérations normales |
| `WARN` | Jaune | Comportement inattendu non bloquant |
| `ERROR` | Rouge | Erreur récupérable |
| `FATAL` | Rouge vif | Erreur critique, service down |

### 📡 `/logs/live` — Tail Temps Réel

- Stream de logs en temps réel (WebSocket)
- Filtres persistants
- Pause/Resume
- Highlight des patterns (regex)
- Utile pour le debugging en live

### 🔗 `/traces` — Traces Distribuées

**Liste** :
- Filtres : service, durée (> X ms), statut (OK/ERROR), timestamp
- Chaque trace : ID, service racine, durée totale, nombre de spans, statut

**Détail trace** `/traces/[traceId]` :
- **Waterfall view** — Spans imbriqués avec durées
- **Metadata** — Headers, body (sanitized), user ID
- **Erreurs** — Stack traces des spans en erreur
- **Liens** — Vers les logs associés à cette trace

### ⚡ `/metrics` — Métriques Infrastructure

**API Gateway** `/metrics/api` :
- Requêtes/sec (throughput)
- Latence P50, P95, P99
- Taux d'erreur (4xx, 5xx)
- Top endpoints les plus lents
- Top endpoints les plus appelés

**Base de données** `/metrics/db` :
- Connexions actives / pool size
- Requêtes/sec
- Slow queries (> 100ms)
- Taille tables principales
- Réplication lag

**Par service** `/metrics/services` :
- CPU, RAM, instances actives
- Restarts
- Health check status
- Version déployée

### 🚨 `/alerts` — Alertes

**Règles d'alerte** (exemples) :
| Règle | Condition | Sévérité | Action |
|---|---|---|---|
| Error spike | Error rate > 5% pendant 5 min | Critical | PagerDuty + Slack |
| High latency | P99 > 2s pendant 10 min | Warning | Slack |
| Service down | Health check fail × 3 | Critical | PagerDuty |
| DB connections | Pool > 80% | Warning | Slack |
| Disk usage | > 85% | Warning | Email |

**Canaux de notification** :
- Slack (#incidents)
- PagerDuty (on-call)
- Email
- SMS (critical uniquement)

### 🔥 `/incidents` — Gestion d'Incidents

**Workflow** :
1. **Détecté** — Alerte déclenchée
2. **Acknowledged** — On-call prend en charge
3. **Investigating** — Diagnostic en cours
4. **Mitigated** — Impact réduit
5. **Resolved** — Problème résolu
6. **Post-mortem** — Analyse post-incident

**Timeline** `/incidents/[id]` :
- Événements chronologiques
- Actions prises
- Communications (Slack messages embeddés)
- Métriques pendant l'incident (overlay)
- Post-mortem (causes, actions correctives)

---

## 🛠 Stack Technique

| Composant | Technologie |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI Components | Shadcn/ui + Tailwind CSS |
| Graphiques | Tremor / Recharts |
| Logs backend | Loki (Grafana) ou Supabase logs |
| Traces | OpenTelemetry → Jaeger ou Tempo |
| Métriques | Prometheus + Grafana |
| Alertes | Alertmanager (Prometheus) |
| Incidents | PagerDuty ou custom |
| Streaming logs | WebSocket (Supabase Realtime) |
| Auth | SSO interne + RBAC |
| Déploiement | Firebase Hosting (accès restreint) |

### Architecture Observabilité

```
[Services] → [OpenTelemetry SDK]
                   ↓
        ┌──────────┼──────────┐
        ↓          ↓          ↓
     [Loki]    [Tempo]   [Prometheus]
     (logs)    (traces)   (metrics)
        ↓          ↓          ↓
        └──────────┼──────────┘
                   ↓
          [logs.imuchat.app]
          (unified dashboard)
```

---

## 📊 SLOs (Service Level Objectives)

| Service | Métrique | Objectif |
|---|---|---|
| API Gateway | Uptime | 99.9% |
| API Gateway | Latence P99 | < 500ms |
| Messaging | Delivery time | < 200ms |
| Auth | Login latency | < 300ms |
| Media upload | Success rate | > 99.5% |
| Alice IA | Response time | < 2s |
| ImuPay | Transaction success | > 99.95% |

---

## 📅 Roadmap

### Phase 1 (Semaines 1-3)
- [ ] Overview dashboard santé
- [ ] Explorateur de logs (recherche + filtres)
- [ ] Métriques API (latence, throughput, erreurs)
- [ ] Alertes basiques (Slack)
- [ ] Auth SSO

### Phase 2 (Semaines 4-6)
- [ ] Traces distribuées (OpenTelemetry)
- [ ] Tail logs temps réel
- [ ] Métriques DB + services
- [ ] Gestion d'incidents
- [ ] PagerDuty integration
- [ ] Uptime monitoring

---

## 🔗 Liens

- **`admin.imuchat.app`** → Administration plateforme
- **`analytics.imuchat.app`** → Analytics produit
- **`help.imuchat.app/status`** → Status page publique
