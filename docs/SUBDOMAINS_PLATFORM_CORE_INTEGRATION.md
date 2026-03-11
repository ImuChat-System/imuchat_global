# 🔧 ImuChat — Intégration des Sous-domaines Techniques au Platform-Core

> **Objectif :** Guide d'implémentation complet pour rattacher chaque sous-domaine technique au `platform-core` (Fastify + Socket.IO + Firebase + Drizzle ORM)
> **Stack de référence :** Monorepo pnpm · Fastify · Socket.IO · Supabase · Firebase FCM · PostgreSQL
> **Date :** Mars 2026

---

## Table des matières

1. [Vue d'ensemble de l'architecture cible](#1-vue-densemble)
2. [Configuration du reverse proxy (Traefik/Nginx)](#2-reverse-proxy)
3. [Endpoint `/health` dans le platform-core](#3-endpoint-health)
4. [Séparation des ports REST / WebSocket](#4-séparation-des-ports)
5. [Configuration CORS par sous-domaine](#5-cors)
6. [Rattachement sous-domaine par sous-domaine](#6-rattachement-détaillé)
   - [ws.imuchat.app → Socket.IO](#61-wsimuchatapp)
   - [storage.imuchat.app → Supabase Storage](#62-storageimuchatapp)
   - [media.imuchat.app → Streaming média](#63-mediaimuchatapp)
   - [push.imuchat.app → Firebase FCM](#64-pushimuchatapp)
   - [auth.imuchat.app → Supabase Auth](#65-authimuchatapp)
   - [status.imuchat.app → Healthcheck](#66-statusimuchatapp)
7. [Mise à jour des variables d'environnement](#7-variables-denvironnement)
8. [Mise à jour des clients (web, mobile, desktop)](#8-mise-à-jour-des-clients)
9. [Checklist de déploiement](#9-checklist)

---

## 1. Vue d'ensemble

### Architecture cible

```
                    ┌─────────────────────────────────────────────┐
                    │           DNS / Cloudflare                  │
                    └──────────────────┬──────────────────────────┘
                                       │
                    ┌──────────────────▼──────────────────────────┐
                    │     Reverse Proxy (Traefik / Nginx)         │
                    │                                             │
                    │  api.imuchat.app     → :3000 (REST)         │
                    │  ws.imuchat.app      → :3001 (Socket.IO)    │
                    │  push.imuchat.app    → :3000/notifications  │
                    │  auth.imuchat.app    → Supabase Auth        │
                    │  storage.imuchat.app → Supabase Storage     │
                    │  media.imuchat.app   → CDN / proxy média    │
                    │  status.imuchat.app  → outil externe        │
                    └──────────────────┬──────────────────────────┘
                                       │
              ┌────────────────────────┼─────────────────────────┐
              │                        │                         │
   ┌──────────▼──────────┐  ┌─────────▼──────────┐  ┌──────────▼──────────┐
   │  platform-core      │  │  Supabase           │  │  Firebase           │
   │  :3000 (Fastify)    │  │  Auth + Storage     │  │  FCM + Auth         │
   │  :3001 (Socket.IO)  │  │  + PostgreSQL       │  │                     │
   └─────────────────────┘  └────────────────────┘  └─────────────────────┘
```

### Mapping DNS final

| Sous-domaine | Cible | Type |
|---|---|---|
| `api.imuchat.app` | `platform-core:3000` | Proxy |
| `ws.imuchat.app` | `platform-core:3001` | Proxy WebSocket |
| `auth.imuchat.app` | `<project>.supabase.co` | CNAME ou Proxy |
| `storage.imuchat.app` | Supabase Storage ou proxy | CNAME ou Proxy |
| `media.imuchat.app` | CDN externe (Cloudflare R2 / Mux) | CNAME |
| `push.imuchat.app` | `platform-core:3000/api/notifications` | Proxy |
| `status.imuchat.app` | Upptime / Betterstack | Page statique externe |

---

## 2. Reverse Proxy

### Option A — Traefik (recommandé pour Docker/K8s)

Fichier : `infra/docker/traefik/dynamic.yml`

```yaml
http:
  routers:
    # REST API
    api:
      rule: "Host(`api.imuchat.app`)"
      service: platform-core-rest
      tls:
        certResolver: letsencrypt

    # WebSocket dédié
    ws:
      rule: "Host(`ws.imuchat.app`)"
      service: platform-core-ws
      tls:
        certResolver: letsencrypt

    # Notifications Push
    push:
      rule: "Host(`push.imuchat.app`)"
      service: platform-core-rest
      middlewares:
        - strip-push-prefix
      tls:
        certResolver: letsencrypt

    # Auth (proxy vers Supabase)
    auth:
      rule: "Host(`auth.imuchat.app`)"
      service: supabase-auth
      tls:
        certResolver: letsencrypt

  middlewares:
    strip-push-prefix:
      stripPrefix:
        prefixes: []  # push.imuchat.app/* → api/notifications/*

  services:
    platform-core-rest:
      loadBalancer:
        servers:
          - url: "http://platform-core:3000"

    platform-core-ws:
      loadBalancer:
        sticky:
          cookie:
            name: "io_sticky"  # Nécessaire pour Socket.IO sticky sessions
        servers:
          - url: "http://platform-core:3001"

    supabase-auth:
      loadBalancer:
        servers:
          - url: "https://<YOUR_PROJECT>.supabase.co"
```

### Option B — Nginx (serveur classique)

Fichier : `/etc/nginx/sites-available/imuchat`

```nginx
# api.imuchat.app — REST Fastify
server {
    listen 443 ssl;
    server_name api.imuchat.app;

    ssl_certificate     /etc/letsencrypt/live/imuchat.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/imuchat.app/privkey.pem;

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}

# ws.imuchat.app — Socket.IO WebSocket
server {
    listen 443 ssl;
    server_name ws.imuchat.app;

    ssl_certificate     /etc/letsencrypt/live/imuchat.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/imuchat.app/privkey.pem;

    location / {
        proxy_pass             http://127.0.0.1:3001;
        proxy_http_version     1.1;
        proxy_set_header       Upgrade $http_upgrade;
        proxy_set_header       Connection "upgrade";
        proxy_set_header       Host $host;
        proxy_set_header       X-Real-IP $remote_addr;
        proxy_read_timeout     86400;   # 24h — essentiel pour WebSocket
        proxy_send_timeout     86400;
    }
}

# push.imuchat.app — Notifications (sous-chemin platform-core)
server {
    listen 443 ssl;
    server_name push.imuchat.app;

    ssl_certificate     /etc/letsencrypt/live/imuchat.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/imuchat.app/privkey.pem;

    location / {
        proxy_pass         http://127.0.0.1:3000/api/notifications/;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
    }
}

# auth.imuchat.app — Proxy vers Supabase Auth
server {
    listen 443 ssl;
    server_name auth.imuchat.app;

    ssl_certificate     /etc/letsencrypt/live/imuchat.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/imuchat.app/privkey.pem;

    location / {
        proxy_pass         https://<YOUR_PROJECT>.supabase.co/auth/;
        proxy_http_version 1.1;
        proxy_set_header   Host <YOUR_PROJECT>.supabase.co;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_ssl_server_name on;
    }
}
```

---

## 3. Endpoint `/health`

Le point d'entrée de `status.imuchat.app` repose sur un endpoint `/health` dans le platform-core qui agrège l'état de tous les services.

### Fichier à créer : `platform-core/src/routes/health.ts`

```typescript
import type { FastifyInstance } from 'fastify';
import { getDB } from '../db';
import { getWebSocketModule } from '../modules/WebSocketModule';
import { getFirebaseAdmin } from '../config/firebase';

interface ServiceStatus {
  status: 'ok' | 'degraded' | 'down';
  latency_ms?: number;
  detail?: string;
}

interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  version: string;
  services: {
    database: ServiceStatus;
    websocket: ServiceStatus;
    storage: ServiceStatus;
    push: ServiceStatus;
  };
}

async function checkDatabase(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    const db = getDB();
    await db.execute('SELECT 1');
    return { status: 'ok', latency_ms: Date.now() - start };
  } catch (err) {
    return { status: 'down', detail: String(err) };
  }
}

async function checkWebSocket(): Promise<ServiceStatus> {
  try {
    const wsModule = getWebSocketModule();
    const count = wsModule.getConnectionCount();
    return {
      status: 'ok',
      detail: `${count} active connection(s)`,
    };
  } catch (err) {
    return { status: 'down', detail: String(err) };
  }
}

async function checkStorage(): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    // Ping Supabase Storage via une requête HEAD sur un bucket public
    const res = await fetch(
      `${process.env.SUPABASE_URL}/storage/v1/bucket`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}` },
      }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { status: 'ok', latency_ms: Date.now() - start };
  } catch (err) {
    return { status: 'degraded', detail: String(err) };
  }
}

async function checkPush(): Promise<ServiceStatus> {
  try {
    // Vérification que le SDK Firebase Admin est initialisé
    const admin = getFirebaseAdmin();
    await admin.messaging(); // throws si non initialisé
    return { status: 'ok' };
  } catch (err) {
    return { status: 'down', detail: String(err) };
  }
}

export async function healthRoutes(fastify: FastifyInstance) {
  // Health check public — utilisé par status.imuchat.app
  fastify.get('/health', async (_req, reply) => {
    const [database, websocket, storage, push] = await Promise.all([
      checkDatabase(),
      checkWebSocket(),
      checkStorage(),
      checkPush(),
    ]);

    const allStatuses = [database, websocket, storage, push];
    const globalStatus: HealthResponse['status'] = allStatuses.some(
      (s) => s.status === 'down'
    )
      ? 'down'
      : allStatuses.some((s) => s.status === 'degraded')
      ? 'degraded'
      : 'ok';

    const response: HealthResponse = {
      status: globalStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? 'unknown',
      services: { database, websocket, storage, push },
    };

    const httpStatus = globalStatus === 'down' ? 503 : 200;
    return reply.status(httpStatus).send(response);
  });

  // Liveness probe minimal (pour Kubernetes)
  fastify.get('/health/live', async (_req, reply) => {
    return reply.status(200).send({ status: 'alive' });
  });

  // Readiness probe (vérifie la DB uniquement)
  fastify.get('/health/ready', async (_req, reply) => {
    const db = await checkDatabase();
    const code = db.status === 'ok' ? 200 : 503;
    return reply.status(code).send(db);
  });
}
```

### Enregistrement dans `platform-core/src/server.ts`

```typescript
import { healthRoutes } from './routes/health';

// Ajouter avec les autres routes
await fastify.register(healthRoutes);
```

---

## 4. Séparation des ports REST / WebSocket

Actuellement, le platform-core fait tourner Fastify (REST) et Socket.IO sur le même port. Il faut les séparer pour permettre un routage DNS indépendant.

### Modification : `platform-core/src/server.ts`

```typescript
import Fastify from 'fastify';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

const REST_PORT  = parseInt(process.env.PORT_REST  ?? '3000', 10);
const WS_PORT    = parseInt(process.env.PORT_WS    ?? '3001', 10);

// ─── Serveur REST (Fastify) ────────────────────────────────────────────────
const fastify = Fastify({ logger: true });

await fastify.register(import('./routes/health'));
await fastify.register(import('./routes/auth'));
await fastify.register(import('./routes/chat'));
await fastify.register(import('./routes/notifications'));
await fastify.register(import('./routes/store'));
// ... autres routes

await fastify.listen({ port: REST_PORT, host: '0.0.0.0' });
console.log(`REST API listening on port ${REST_PORT}`);

// ─── Serveur WebSocket (Socket.IO) ────────────────────────────────────────
const httpServer = createServer();
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: [
      'https://app.imuchat.app',
      'https://ws.imuchat.app',
      ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : []),
    ],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Initialiser le WebSocketModule avec ce serveur HTTP dédié
const wsModule = new WebSocketModule(wsConfig, eventBus);
await wsModule.initializeWithServer(httpServer);

httpServer.listen(WS_PORT, '0.0.0.0', () => {
  console.log(`WebSocket server listening on port ${WS_PORT}`);
});
```

---

## 5. CORS

Toutes les origines autorisées doivent être déclarées explicitement dans le platform-core. Une seule source de vérité centralisée évite les erreurs.

### Fichier à créer : `platform-core/src/config/cors.ts`

```typescript
// Liste exhaustive de toutes les origines autorisées
export const ALLOWED_ORIGINS = [
  // Clients ImuChat
  'https://imuchat.app',
  'https://app.imuchat.app',
  'https://ws.imuchat.app',
  'https://auth.imuchat.app',
  'https://storage.imuchat.app',
  'https://media.imuchat.app',
  'https://push.imuchat.app',
  'https://developers.imuchat.app',
  'https://docs.imuchat.app',
  'https://status.imuchat.app',

  // Environnements non-production
  ...(process.env.NODE_ENV !== 'production'
    ? [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:4000',
        'http://localhost:8080',
        'https://staging.imuchat.app',
        'https://dev.imuchat.app',
      ]
    : []),
] as const;

export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return false;
  return (ALLOWED_ORIGINS as readonly string[]).includes(origin);
}
```

### Intégration dans `server.ts`

```typescript
import cors from '@fastify/cors';
import { ALLOWED_ORIGINS, isAllowedOrigin } from './config/cors';

await fastify.register(cors, {
  origin: (origin, callback) => {
    if (!origin || isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
});
```

### Côté Supabase

Dans le dashboard Supabase → **Authentication → URL Configuration**, ajouter :

```
https://app.imuchat.app
https://auth.imuchat.app
https://staging.imuchat.app  (si besoin)
```

---

## 6. Rattachement détaillé

### 6.1 `ws.imuchat.app`

**Objectif :** Exposer Socket.IO sur un sous-domaine dédié pour pouvoir le scaler indépendamment du REST.

**Côté platform-core** — déjà en place via le `WebSocketModule`. S'assurer que la configuration utilise le bon port :

```typescript
// platform-core/src/modules/WebSocketModule.ts — config
const wsModuleConfig = {
  port: parseInt(process.env.PORT_WS ?? '3001', 10),
  cors: {
    origin: ALLOWED_ORIGINS,
    credentials: true,
  },
  socketOptions: {
    pingTimeout: 60000,
    pingInterval: 25000,
    maxHttpBufferSize: 10e6, // 10 MB — pour les transferts fichiers
  },
};
```

**Variable d'environnement à ajouter :**

```env
PORT_WS=3001
```

**Côté DNS :**

```
ws.imuchat.app  A  <IP_SERVEUR>
```

---

### 6.2 `storage.imuchat.app`

**Objectif :** URL propre pour tous les uploads/downloads de fichiers, indépendante de `api`.

**Option recommandée — CNAME direct vers Supabase :**

```
storage.imuchat.app  CNAME  <YOUR_PROJECT>.supabase.co
```

Avantage : zéro latence supplémentaire, Supabase gère le SSL.

**Option alternative — Proxy via platform-core** (si tu veux filtrer les uploads) :

Fichier : `platform-core/src/routes/storage.ts`

```typescript
import type { FastifyInstance } from 'fastify';
import { createClient } from '@supabase/supabase-js';

export async function storageRoutes(fastify: FastifyInstance) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  // Upload proxy avec validation
  fastify.post('/api/storage/upload', {
    preHandler: [fastify.authenticate], // middleware auth JWT
  }, async (req, reply) => {
    const data = await req.file();
    if (!data) return reply.status(400).send({ error: 'No file' });

    // Validation type MIME
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'audio/webm'];
    if (!allowedMimes.includes(data.mimetype)) {
      return reply.status(415).send({ error: 'Unsupported media type' });
    }

    const buffer = await data.toBuffer();
    const path = `uploads/${Date.now()}-${data.filename}`;

    const { data: result, error } = await supabase.storage
      .from('media')
      .upload(path, buffer, { contentType: data.mimetype });

    if (error) return reply.status(500).send({ error: error.message });

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(path);

    return reply.send({ url: publicUrl, path });
  });
}
```

---

### 6.3 `media.imuchat.app`

**Objectif :** Diffusion optimisée des vidéos (ImuFeed, Live) avec CDN et transcodage.

**Option A — CNAME vers Cloudflare R2 + Stream :**

```
media.imuchat.app  CNAME  <account>.r2.cloudflarestorage.com
```

**Option B — Proxy de streaming dans le platform-core :**

Fichier : `platform-core/src/routes/media.ts`

```typescript
import type { FastifyInstance } from 'fastify';

export async function mediaRoutes(fastify: FastifyInstance) {
  // Proxy streaming avec support Range requests (nécessaire pour video)
  fastify.get('/api/media/stream/:fileId', async (req, reply) => {
    const { fileId } = req.params as { fileId: string };
    const rangeHeader = req.headers.range;

    // Récupère le fichier depuis Supabase Storage
    const supabaseUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/media/${fileId}`;

    const headers: HeadersInit = {};
    if (rangeHeader) headers['Range'] = rangeHeader;

    const upstream = await fetch(supabaseUrl, { headers });

    reply.status(upstream.status);
    upstream.headers.forEach((value, key) => reply.header(key, value));
    reply.header('Cache-Control', 'public, max-age=3600');

    return reply.send(upstream.body);
  });

  // Récupérer la miniature d'une vidéo
  fastify.get('/api/media/thumbnail/:fileId', async (req, reply) => {
    const { fileId } = req.params as { fileId: string };
    const thumbUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/thumbnails/${fileId}`;

    const res = await fetch(thumbUrl);
    if (!res.ok) return reply.status(404).send({ error: 'Thumbnail not found' });

    reply.header('Content-Type', res.headers.get('content-type') ?? 'image/webp');
    reply.header('Cache-Control', 'public, max-age=86400');
    return reply.send(res.body);
  });
}
```

---

### 6.4 `push.imuchat.app`

**Objectif :** Exposer les routes de notifications push (Firebase FCM) sur leur propre sous-domaine pour monitoring indépendant.

Fichier : `platform-core/src/routes/notifications.ts` (à enrichir)

```typescript
import type { FastifyInstance } from 'fastify';
import * as admin from 'firebase-admin';

export async function notificationsRoutes(fastify: FastifyInstance) {
  // Envoyer une notification à un utilisateur
  fastify.post('/api/notifications/send', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['userId', 'title', 'body'],
        properties: {
          userId:  { type: 'string' },
          title:   { type: 'string' },
          body:    { type: 'string' },
          data:    { type: 'object' },
          imageUrl:{ type: 'string' },
        },
      },
    },
  }, async (req, reply) => {
    const { userId, title, body, data, imageUrl } = req.body as {
      userId: string; title: string; body: string;
      data?: Record<string, string>; imageUrl?: string;
    };

    // Récupérer les tokens FCM de l'utilisateur depuis la DB
    const db = getDB();
    const tokens = await db
      .select({ token: deviceTokens.fcmToken })
      .from(deviceTokens)
      .where(eq(deviceTokens.userId, userId));

    if (!tokens.length) {
      return reply.status(404).send({ error: 'No registered device tokens' });
    }

    const messaging = admin.messaging();
    const results = await Promise.allSettled(
      tokens.map(({ token }) =>
        messaging.send({
          token,
          notification: { title, body, ...(imageUrl ? { imageUrl } : {}) },
          data: data ?? {},
          android: { priority: 'high' },
          apns: { payload: { aps: { sound: 'default' } } },
        })
      )
    );

    const sent     = results.filter((r) => r.status === 'fulfilled').length;
    const failed   = results.filter((r) => r.status === 'rejected').length;

    return reply.send({ sent, failed, total: tokens.length });
  });

  // Enregistrer un token FCM pour l'utilisateur courant
  fastify.post('/api/notifications/token', {
    preHandler: [fastify.authenticate],
  }, async (req, reply) => {
    const { token, platform } = req.body as { token: string; platform: 'web' | 'ios' | 'android' };
    const userId = req.user.uid;
    const db = getDB();

    await db
      .insert(deviceTokens)
      .values({ userId, fcmToken: token, platform, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: deviceTokens.fcmToken,
        set: { updatedAt: new Date() },
      });

    return reply.status(201).send({ success: true });
  });

  // Supprimer un token FCM (déconnexion)
  fastify.delete('/api/notifications/token/:token', {
    preHandler: [fastify.authenticate],
  }, async (req, reply) => {
    const { token } = req.params as { token: string };
    const db = getDB();
    await db.delete(deviceTokens).where(eq(deviceTokens.fcmToken, token));
    return reply.send({ success: true });
  });
}
```

**Le sous-domaine `push.imuchat.app` route simplement vers ces endpoints :**

```
push.imuchat.app/*  →  platform-core:3000/api/notifications/*
```

---

### 6.5 `auth.imuchat.app`

**Objectif :** URL propre pour le flux d'authentification (OAuth redirects, magic links, SSO).

**Option recommandée — CNAME Supabase :**

Dans Supabase Dashboard → **Project Settings → Custom Domain**, configurer :

```
auth.imuchat.app  CNAME  <YOUR_PROJECT>.supabase.co
```

Supabase gère nativement les custom domains. Les redirect URLs des OAuth providers (Google, Discord) devront être mises à jour pour pointer vers `https://auth.imuchat.app`.

**Mise à jour des redirect URLs OAuth :**

```typescript
// web-app/src/lib/supabase.ts
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Pour le login OAuth Google
await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'https://auth.imuchat.app/callback',
  },
});
```

---

### 6.6 `status.imuchat.app`

**Objectif :** Page de statut publique qui consomme les endpoints `/health` du platform-core.

**Outil recommandé — Upptime (open-source, hébergé sur GitHub Pages) :**

Fichier : `.github/upptime.yml` (dans un repo dédié `imuchat-status`)

```yaml
owner: ImuChat-System
repo: imuchat-status
user-agent: imuchat-status

sites:
  - name: API REST
    url: https://api.imuchat.app/health/live
    expectedStatusCodes:
      - 200

  - name: WebSocket
    url: https://ws.imuchat.app/health/live
    expectedStatusCodes:
      - 200

  - name: Auth
    url: https://auth.imuchat.app/health
    expectedStatusCodes:
      - 200

  - name: Storage
    url: https://storage.imuchat.app
    expectedStatusCodes:
      - 200
      - 301
      - 302

  - name: Push Notifications
    url: https://push.imuchat.app/health/live
    expectedStatusCodes:
      - 200

status-website:
  cname: status.imuchat.app
  name: ImuChat Status
  theme: dark
  showActiveIncidents: true
  introTitle: "🟢 All Systems Operational"
  introMessage: "This page shows the real-time status of ImuChat services."
```

---

## 7. Variables d'environnement

### `platform-core/.env` — version complète mise à jour

```env
# ── Serveur ────────────────────────────────────────────────────────────────
NODE_ENV=production
PORT_REST=3000
PORT_WS=3001

# ── Supabase ───────────────────────────────────────────────────────────────
SUPABASE_URL=https://<YOUR_PROJECT>.supabase.co
SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_KEY=<service_role_key>

# ── Firebase ───────────────────────────────────────────────────────────────
FIREBASE_PROJECT_ID=imuchat-prod
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@imuchat-prod.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."

# ── Sous-domaines publics (pour CORS & génération de liens) ────────────────
PUBLIC_URL_API=https://api.imuchat.app
PUBLIC_URL_WS=wss://ws.imuchat.app
PUBLIC_URL_AUTH=https://auth.imuchat.app
PUBLIC_URL_STORAGE=https://storage.imuchat.app
PUBLIC_URL_MEDIA=https://media.imuchat.app
PUBLIC_URL_PUSH=https://push.imuchat.app

# ── Version ────────────────────────────────────────────────────────────────
npm_package_version=1.0.0
```

### `platform-core/.env.example`

```env
NODE_ENV=development
PORT_REST=3000
PORT_WS=3001

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here

FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="your_firebase_private_key"

PUBLIC_URL_API=http://localhost:3000
PUBLIC_URL_WS=ws://localhost:3001
PUBLIC_URL_AUTH=http://localhost:3000/auth
PUBLIC_URL_STORAGE=http://localhost:3000/storage
PUBLIC_URL_MEDIA=http://localhost:3000/media
PUBLIC_URL_PUSH=http://localhost:3000/notifications
```

---

## 8. Mise à jour des clients

### 8.1 Web App (`web-app/.env.local`)

```env
NEXT_PUBLIC_API_URL=https://api.imuchat.app
NEXT_PUBLIC_WS_URL=wss://ws.imuchat.app
NEXT_PUBLIC_AUTH_URL=https://auth.imuchat.app
NEXT_PUBLIC_STORAGE_URL=https://storage.imuchat.app
NEXT_PUBLIC_MEDIA_URL=https://media.imuchat.app
NEXT_PUBLIC_PUSH_URL=https://push.imuchat.app

# Supabase (pointe maintenant vers le custom domain)
NEXT_PUBLIC_SUPABASE_URL=https://auth.imuchat.app
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
```

**Fichier : `web-app/src/lib/config.ts`** (centraliser les URLs)

```typescript
export const config = {
  api:     process.env.NEXT_PUBLIC_API_URL     ?? 'http://localhost:3000',
  ws:      process.env.NEXT_PUBLIC_WS_URL      ?? 'ws://localhost:3001',
  auth:    process.env.NEXT_PUBLIC_AUTH_URL    ?? 'http://localhost:3000/auth',
  storage: process.env.NEXT_PUBLIC_STORAGE_URL ?? 'http://localhost:3000/storage',
  media:   process.env.NEXT_PUBLIC_MEDIA_URL   ?? 'http://localhost:3000/media',
  push:    process.env.NEXT_PUBLIC_PUSH_URL    ?? 'http://localhost:3000/notifications',
} as const;
```

**Mise à jour du client Socket.IO :**

```typescript
// web-app/src/services/socket.ts
import { io } from 'socket.io-client';
import { config } from '@/lib/config';

export const socket = io(config.ws, {
  transports: ['websocket', 'polling'],
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});
```

---

### 8.2 Mobile (`mobile/.env`)

```env
EXPO_PUBLIC_API_URL=https://api.imuchat.app
EXPO_PUBLIC_WS_URL=wss://ws.imuchat.app
EXPO_PUBLIC_STORAGE_URL=https://storage.imuchat.app
EXPO_PUBLIC_MEDIA_URL=https://media.imuchat.app
EXPO_PUBLIC_SUPABASE_URL=https://auth.imuchat.app
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
```

**Fichier : `mobile/src/config/index.ts`**

```typescript
export const config = {
  api:     process.env.EXPO_PUBLIC_API_URL     ?? 'http://localhost:3000',
  ws:      process.env.EXPO_PUBLIC_WS_URL      ?? 'ws://localhost:3001',
  storage: process.env.EXPO_PUBLIC_STORAGE_URL ?? 'http://localhost:3000/storage',
  media:   process.env.EXPO_PUBLIC_MEDIA_URL   ?? 'http://localhost:3000/media',
} as const;
```

---

### 8.3 Desktop (`desktop-app/.env`)

```env
VITE_API_URL=https://api.imuchat.app
VITE_WS_URL=wss://ws.imuchat.app
VITE_STORAGE_URL=https://storage.imuchat.app
VITE_MEDIA_URL=https://media.imuchat.app
VITE_SUPABASE_URL=https://auth.imuchat.app
VITE_SUPABASE_ANON_KEY=<anon_key>
```

**Fichier : `desktop-app/src/lib/config.ts`**

```typescript
export const config = {
  api:     import.meta.env.VITE_API_URL     ?? 'http://localhost:3000',
  ws:      import.meta.env.VITE_WS_URL      ?? 'ws://localhost:3001',
  storage: import.meta.env.VITE_STORAGE_URL ?? 'http://localhost:3000/storage',
  media:   import.meta.env.VITE_MEDIA_URL   ?? 'http://localhost:3000/media',
} as const;
```

---

## 9. Checklist de déploiement

### Phase 1 — Platform-core (backend)

- [ ] Ajouter `PORT_WS` dans les variables d'environnement
- [ ] Modifier `server.ts` pour écouter sur deux ports distincts (3000 REST, 3001 WS)
- [ ] Créer `platform-core/src/routes/health.ts` avec les 3 endpoints (`/health`, `/health/live`, `/health/ready`)
- [ ] Créer `platform-core/src/config/cors.ts` avec la liste des origines autorisées
- [ ] Mettre à jour la config CORS de Fastify pour utiliser `cors.ts`
- [ ] Mettre à jour la config CORS du `WebSocketModule` pour utiliser `cors.ts`
- [ ] Créer/enrichir `platform-core/src/routes/notifications.ts` (send, register token, delete token)
- [ ] Créer `platform-core/src/routes/media.ts` (proxy streaming si option proxy choisie)
- [ ] Ajouter la table `device_tokens` dans le schéma Drizzle (`platform-core/src/db/schema.ts`)
- [ ] Générer la migration Drizzle : `pnpm drizzle-kit generate`
- [ ] Appliquer la migration : `pnpm drizzle-kit migrate`

### Phase 2 — Infrastructure / DNS

- [ ] Configurer les entrées DNS pour chaque sous-domaine (A ou CNAME)
- [ ] Obtenir les certificats SSL Let's Encrypt pour `*.imuchat.app`
- [ ] Configurer le reverse proxy (Traefik ou Nginx) selon la section 2
- [ ] Configurer le custom domain Supabase pour `auth.imuchat.app`
- [ ] Mettre à jour les redirect URLs OAuth dans Google Cloud Console et Discord Developer Portal
- [ ] Configurer le CNAME `storage.imuchat.app` → Supabase Storage (ou proxy)
- [ ] Configurer le CNAME/proxy `media.imuchat.app` → CDN

### Phase 3 — Monitoring

- [ ] Créer le repo GitHub `imuchat-status` pour Upptime
- [ ] Configurer `upptime.yml` avec les endpoints `/health/live`
- [ ] Vérifier que `status.imuchat.app` CNAME pointe bien vers GitHub Pages du repo Upptime
- [ ] Tester chaque endpoint de health en production

### Phase 4 — Clients

- [ ] Mettre à jour `web-app/.env.local` (et `.env.production`) avec les nouveaux sous-domaines
- [ ] Créer `web-app/src/lib/config.ts` et remplacer toutes les URLs hardcodées
- [ ] Mettre à jour `mobile/.env` et `mobile/src/config/index.ts`
- [ ] Mettre à jour `desktop-app/.env` et `desktop-app/src/lib/config.ts`
- [ ] Lancer les tests : `pnpm test` sur tous les packages
- [ ] Vérifier la connexion Socket.IO depuis chaque client vers `wss://ws.imuchat.app`
- [ ] Vérifier l'upload de fichiers vers `storage.imuchat.app`
- [ ] Vérifier la réception des notifications push

---

## Résumé des fichiers à créer / modifier

| Fichier | Action |
|---|---|
| `platform-core/src/server.ts` | Modifier — séparation ports 3000/3001 |
| `platform-core/src/config/cors.ts` | **Créer** — liste des origines autorisées |
| `platform-core/src/routes/health.ts` | **Créer** — endpoints `/health`, `/health/live`, `/health/ready` |
| `platform-core/src/routes/notifications.ts` | Modifier — ajouter send, register, delete token |
| `platform-core/src/routes/media.ts` | **Créer** — proxy streaming (optionnel) |
| `platform-core/src/db/schema.ts` | Modifier — ajouter table `device_tokens` |
| `platform-core/.env` | Modifier — ajouter `PORT_WS` + URLs publiques |
| `platform-core/.env.example` | Modifier — documenter toutes les nouvelles vars |
| `web-app/src/lib/config.ts` | **Créer** — centraliser les URLs |
| `web-app/src/services/socket.ts` | Modifier — pointer vers `wss://ws.imuchat.app` |
| `mobile/src/config/index.ts` | **Créer** — centraliser les URLs |
| `desktop-app/src/lib/config.ts` | **Créer** — centraliser les URLs |
| `infra/docker/traefik/dynamic.yml` | **Créer** — configuration Traefik |
| `.github/upptime.yml` (repo dédié) | **Créer** — configuration status page |

---

*Document créé le 10 mars 2026 — ImuChat Infrastructure Team*
