# 🔌 Phase A — Module Runtime fonctionnel

> **Date** : 25 février 2026  
> **Statut** : Implémenté  
> **Module pilote** : `imu-games`

---

## Résumé des changements

La Phase A connecte les briques existantes (loader, SDK, module review) en un flux bout-en-bout fonctionnel, avec `imu-games` comme premier module chargé dynamiquement dans un sandbox iframe.

---

## Architecture implémentée

```
┌─────────────────────────────────────────────────────────────┐
│                    Web App (Next.js)                         │
│                                                             │
│  ModulesContext ──────────> Modules Core (statiques)         │
│       │                    chat, calls, store, wallet...     │
│       │                                                     │
│       └──────────────────> Mini-apps (dynamiques)            │
│           │                 Supabase: user_modules           │
│           │                                                  │
│  ┌────────▼────────┐                                        │
│  │  MiniAppHost    │  ← Composant React                     │
│  │  (sandbox)      │                                        │
│  │  ┌────────────┐ │                                        │
│  │  │  iframe    │◄├──── Bundle chargé depuis CDN/public     │
│  │  │  (mini-app)│ │                                        │
│  │  └─────┬──────┘ │                                        │
│  │        │        │                                        │
│  │  ┌─────▼──────┐ │                                        │
│  │  │ HostBridge │ │  ← postMessage bidirectionnel          │
│  │  └────────────┘ │                                        │
│  └─────────────────┘                                        │
│                                                             │
│  API Routes                                                 │
│  ├── POST   /api/modules/[id]/install    → Supabase persist │
│  ├── DELETE /api/modules/[id]/uninstall  → Supabase delete  │
│  └── POST   /api/modules/[id]/update     → Supabase update  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
         │                           ▲
         │ postMessage               │ postMessage
         ▼                           │
┌─────────────────────────────────────────────────────────────┐
│                  imu-games (iframe)                          │
│                                                             │
│  ImuChatProvider ─── ImuChatBridge ─── postMessage          │
│       │                                                     │
│       ├── auth.getUser()                                    │
│       ├── storage.get/set()                                 │
│       ├── theme.getCurrent()                                │
│       ├── ui.showToast()                                    │
│       └── notifications.send()                              │
│                                                             │
│  Build: Vite → dist/ → web-app/public/miniapps/imu-games/  │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase                                  │
│                                                             │
│  ┌──────────────┐  ┌───────────────┐  ┌────────────────┐   │
│  │   modules    │  │ user_modules  │  │ module_reviews │   │
│  │  (catalogue) │  │ (installés)   │  │  (avis)        │   │
│  └──────────────┘  └───────────────┘  └────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Fichiers créés

| Fichier | Rôle |
|---------|------|
| `supabase_modules.sql` | Migration DB — tables `modules`, `user_modules`, `module_reviews` + seed `imu-games` |
| `web-app/src/services/host-bridge.ts` | HostBridge — gère les requêtes postMessage côté hôte |
| `web-app/src/services/host-bridge.types.ts` | Types partagés (BridgeMessage, StoredModuleManifest, UserInstalledModule) |
| `web-app/src/services/modules-api.ts` | Service CRUD Supabase pour modules et user_modules |
| `web-app/src/components/miniapps/MiniAppHost.tsx` | Composant React — iframe sandboxé + bridge + lifecycle |
| `web-app/src/app/api/modules/[id]/uninstall/route.ts` | Route API DELETE pour désinstaller un module |

## Fichiers modifiés

| Fichier | Modification |
|---------|-------------|
| `web-app/src/services/loader.ts` | Ajout de `loadFromStore()`, `resolveEntryUrl()`, `resolveSandbox()` |
| `web-app/src/contexts/ModulesContext.tsx` | Support des mini-apps dynamiques (Supabase), nouvelles méthodes |
| `web-app/src/app/[locale]/games/page.tsx` | Chargement dynamique via MiniAppHost avec fallback legacy |
| `web-app/src/app/api/modules/[id]/install/route.ts` | Persistance DB, auth, recherche en DB avant registre statique |
| `imu-games/vite.config.ts` | Base path `/miniapps/imu-games/` en production |
| `imu-games/package.json` | Scripts `build:miniapp` et `deploy:local` |

---

## Comment tester le cycle complet

### 1. Appliquer la migration Supabase

```bash
# Copier et exécuter le SQL dans la console Supabase
cat supabase_modules.sql
```

### 2. Builder la mini-app imu-games

```bash
cd imu-games
pnpm install
pnpm deploy:local    # Build + copie vers web-app/public/miniapps/imu-games/
```

### 3. Démarrer la web-app

```bash
cd web-app
pnpm dev
```

### 4. Tester le flux

1. Naviguer vers `/games`
2. Si non installé → le wizard d'installation s'affiche
3. L'utilisateur accorde les permissions
4. L'API `POST /api/modules/imu-games/install` persiste en DB
5. La page recharge → `MiniAppHost` crée un iframe vers `/miniapps/imu-games/index.html`
6. Le SDK dans l'iframe exécute le handshake postMessage
7. Le HostBridge répond et la mini-app se connecte
8. La mini-app peut appeler les API (auth, storage, theme, etc.)

---

## Communication postMessage — Protocole

### Handshake (initialisation)

```
Mini-app → Hôte:  { type: "request", namespace: "system", method: "handshake", params: { appId, sdkVersion } }
Hôte → Mini-app:  { type: "response", result: { status: "connected" } }
Hôte → Mini-app:  { type: "event", method: "ready" }
```

### Requête API

```
Mini-app → Hôte:  { type: "request", namespace: "auth", method: "getUser", id: "xxx" }
Hôte → Mini-app:  { type: "response", id: "xxx", result: { id, username, displayName, ... } }
```

### Événement système

```
Hôte → Mini-app:  { type: "event", method: "theme:changed", params: { mode: "dark", ... } }
Hôte → Mini-app:  { type: "event", method: "visibility:changed", params: { visible: false } }
```

---

## Sécurité

| Mesure | Implémentation |
|--------|---------------|
| **Sandbox iframe** | `allow-scripts allow-same-origin allow-forms allow-popups` |
| **Vérification permissions** | Le HostBridge vérifie chaque requête API contre `grantedPermissions` |
| **Storage isolé** | Préfixé par `miniapp:{appId}:` — aucun accès au storage de l'app mère |
| **CSP** | Configurable par module via `content_security_policy` |
| **Modules non-vérifiés** | Forcés en iframe (pas de web component) |
| **Checksum + Signature** | Infrastructure prête dans `moduleReview.ts` (à activer en Phase B) |

---

## Prochaines étapes (Phase B)

- [ ] Extraire les 11 modules optionnels restants vers `imu-miniapps/`
- [ ] Supprimer les routes Next.js correspondantes de la web-app
- [ ] Activer `moduleReview.ts` avec checksums et signatures
- [ ] Pipeline CI/CD pour build + déploiement des mini-apps sur Supabase Storage
- [ ] Table `user_modules` : migration des installations existantes (React state → DB)
