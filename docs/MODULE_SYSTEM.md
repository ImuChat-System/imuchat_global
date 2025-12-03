# Module System Architecture

## Vue d'ensemble

Le système de modules d'ImuChat fournit une architecture modulaire extensible pour gérer les fonctionnalités core de la plateforme. Il est basé sur trois composants principaux :

1. **ModuleRegistry** - Gestionnaire de cycle de vie des modules
2. **EventBus** - Système de communication inter-modules
3. **BaseModule** - Classe abstraite pour créer de nouveaux modules

## Architecture

```
┌─────────────────────────────────────────────────┐
│              ModuleRegistry                      │
│  ┌────────────────────────────────────────┐    │
│  │  register() | start() | stop()         │    │
│  │  Gestion dépendances & topologie       │    │
│  └────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼──────┐          ┌──────▼────────┐
│   EventBus   │          │  BaseModule   │
│              │          │               │
│ publish()    │◄─────────│ handleEvent() │
│ subscribe()  │          │ initialize()  │
│ Priority Q   │          │ start()       │
│ Retry logic  │          │ stop()        │
└──────────────┘          │ dispose()     │
                          └───────────────┘
                                  △
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
            ┌───────┴────────┐         ┌───────┴────────┐
            │  AuthModule    │         │  OtherModule   │
            │  Firebase Admin│         │  À venir...    │
            └────────────────┘         └────────────────┘
```

## Composants

### 1. ModuleRegistry

Gestionnaire centralisé du cycle de vie des modules.

**Fichier:** `/platform-core/src/modules/ModuleRegistry.ts`

**Fonctionnalités:**
- Enregistrement et désenregistrement de modules
- Validation des dépendances
- Tri topologique pour l'ordre de démarrage
- Gestion de l'état global des modules
- Limitation du nombre de modules (max 50)
- Protection des modules core

**API principale:**
```typescript
class ModuleRegistry {
  register(module: IModule): void
  unregister(moduleId: string): Promise<void>
  initialize(moduleId: string): Promise<void>
  start(moduleId: string): Promise<void>
  stop(moduleId: string): Promise<void>
  startAll(): Promise<void>
  stopAll(): Promise<void>
  getModule(moduleId: string): IModule | undefined
  getAllModules(): IModule[]
  getDependents(moduleId: string): string[]
}
```

**Événements émis:**
- `module:registered` - Module enregistré
- `module:unregistered` - Module désenregistré
- `module:initialized` - Module initialisé
- `module:started` - Module démarré
- `module:stopped` - Module arrêté

### 2. EventBus

Système de publication/abonnement pour la communication inter-modules.

**Fichier:** `/platform-core/src/modules/EventBus.ts`

**Fonctionnalités:**
- File de priorité (critical, high, normal, low)
- Mécanisme de retry (3 tentatives par défaut)
- Ciblage d'événements spécifiques par module
- Gestion des abonnements one-time
- Limite de taille de file (1000 événements)

**API principale:**
```typescript
class EventBus {
  publish(event: ModuleEvent): void
  subscribe(
    eventType: string, 
    moduleId: string,
    listener: (event: ModuleEvent) => void | Promise<void>,
    once?: boolean
  ): void
  unsubscribe(eventType: string, moduleId: string, listener: Function): void
  clearQueue(): void
  getQueueSize(): number
}
```

**Priorités:**
```typescript
enum EventPriority {
  CRITICAL = 0,  // Traité en premier
  HIGH = 1,
  NORMAL = 2,
  LOW = 3        // Traité en dernier
}
```

### 3. BaseModule

Classe abstraite pour créer de nouveaux modules.

**Fichier:** `/platform-core/src/modules/BaseModule.ts`

**Lifecycle hooks:**
```typescript
abstract class BaseModule implements IModule {
  // Hooks à implémenter (optionnel)
  protected async onInitialize?(): Promise<void>
  protected async onStart?(): Promise<void>
  protected async onStop?(): Promise<void>
  protected async onDispose?(): Promise<void>
  
  // Méthodes publiques
  async initialize(): Promise<void>
  async start(): Promise<void>
  async stop(): Promise<void>
  async dispose(): Promise<void>
  handleEvent(event: ModuleEvent): void | Promise<void>
  getApi<T>(): T | undefined
}
```

**États du module:**
```typescript
enum ModuleStatus {
  REGISTERED = 'registered',  // Enregistré dans le registry
  INITIALIZED = 'initialized', // Ressources initialisées
  RUNNING = 'running',         // Actif
  STOPPED = 'stopped',         // Arrêté proprement
  ERROR = 'error',             // Erreur critique
  DISABLED = 'disabled'        // Désactivé définitivement
}
```

## Modules implémentés

### AuthModule

Module d'authentification avec Firebase Admin SDK.

**Fichier:** `/platform-core/src/modules/AuthModule.ts`

**API:**
```typescript
class AuthModule extends BaseModule {
  // Vérification de token
  async verifyToken(idToken: string): Promise<admin.auth.DecodedIdToken>
  
  // Gestion utilisateurs
  async createUser(data: AuthUserData): Promise<admin.auth.UserRecord>
  async updateUser(uid: string, updates: Partial<AuthUserData>): Promise<void>
  async deleteUser(uid: string): Promise<void>
  async listUsers(maxResults?: number): Promise<admin.auth.UserRecord[]>
  
  // Tokens & Claims
  async setCustomClaims(uid: string, claims: Record<string, unknown>): Promise<void>
  async createCustomToken(uid: string, claims?: Record<string, unknown>): Promise<string>
  async revokeRefreshTokens(uid: string): Promise<void>
  
  // État du compte
  async disableUser(uid: string): Promise<void>
  async enableUser(uid: string): Promise<void>
}
```

**Événements émis:**
- `auth:user-created` - Utilisateur créé
- `auth:user-updated` - Utilisateur mis à jour
- `auth:user-deleted` - Utilisateur supprimé
- `auth:token-verified` - Token vérifié
- `auth:custom-claims-set` - Claims personnalisés définis

**Configuration:**
```typescript
interface AuthModuleConfig {
  projectId: string
  clientEmail?: string
  privateKey?: string
  databaseURL?: string
}
```

**Tests:** 42 tests unitaires (100% passants)

### WebSocketModule

Module de communication temps réel avec Socket.IO.

**Fichier:** `/platform-core/src/modules/WebSocketModule.ts`

**Fonctionnalités:**
- Gestion des connexions Socket.IO
- Système de rooms/channels
- Broadcasting d'événements
- Authentification des clients
- Tracking des connexions actives
- Gestion des événements custom

**API:**
```typescript
class WebSocketModule extends BaseModule {
  // Gestion d'événements
  on(eventName: string, handler: SocketEventHandler): void
  off(eventName: string, handler?: SocketEventHandler): void
  
  // Émission d'événements
  emit(socketId: string, eventName: string, data: any): void
  broadcast(eventName: string, data: any, excludeSocketId?: string): void
  emitToRoom(roomId: string, eventName: string, data: any): void
  
  // Gestion des connexions
  getConnections(): ClientConnection[]
  getConnection(socketId: string): ClientConnection | undefined
  getConnectionCount(): number
  
  // Authentification
  getUserId(socketId: string): string | undefined
  getUserSockets(userId: string): string[]
  
  // Administration
  disconnectClient(socketId: string, reason?: string): void
  disconnectUser(userId: string, reason?: string): void
  getIO(): SocketIOServer | null
}
```

**Événements système:**
- `auth:authenticate` - Authentifier un client (client → serveur)
- `auth:success` - Authentification réussie (serveur → client)
- `auth:error` - Erreur d'authentification (serveur → client)
- `room:join` - Rejoindre une room (client → serveur)
- `room:joined` - Room rejointe (serveur → client)
- `room:leave` - Quitter une room (client → serveur)
- `room:left` - Room quittée (serveur → client)
- `room:error` - Erreur room (serveur → client)

**Événements EventBus émis:**
- `websocket:started` - Module démarré
- `websocket:stopped` - Module arrêté
- `websocket:client-connected` - Client connecté
- `websocket:client-disconnected` - Client déconnecté
- `websocket:client-authenticated` - Client authentifié
- `websocket:room-joined` - Client a rejoint une room
- `websocket:error` - Erreur Socket.IO

**Configuration:**
```typescript
interface WebSocketModuleConfig {
  port?: number                // Port du serveur (optionnel)
  httpServer?: HTTPServer      // Serveur HTTP existant (optionnel)
  cors?: {
    origin: string | string[]
    credentials?: boolean
  }
  socketOptions?: {
    pingTimeout?: number
    pingInterval?: number
    maxHttpBufferSize?: number
  }
  debug?: boolean
}
```

**Exemple d'utilisation:**
```typescript
import { WebSocketModule } from '@imuchat/platform-core';

// Créer le module
const wsModule = new WebSocketModule(
  {
    description: 'WebSocket service',
    category: 'core',
    permissions: { network: true },
    dependencies: [],
    removable: false,
    priority: 1,
  },
  {
    port: 3001,
    cors: { origin: '*' },
    debug: true,
  },
  eventBus
);

await wsModule.initialize();
await wsModule.start();

// Écouter un événement custom
wsModule.on('chat:message', (socket, data) => {
  console.log('Message reçu:', data);
  
  // Broadcaster aux autres clients de la room
  wsModule.emitToRoom(data.roomId, 'chat:message', {
    ...data,
    timestamp: Date.now(),
  });
});

// Gérer l'authentification
wsModule.on('auth:authenticate', async (socket, { token }) => {
  // Vérifier avec AuthModule
  try {
    const decodedToken = await authModule.verifyToken(token);
    socket.emit('auth:success', { userId: decodedToken.uid });
  } catch (error) {
    socket.emit('auth:error', { message: 'Invalid token' });
  }
});
```

**Tests:** 27 tests unitaires (100% passants)

## Utilisation

### Exemple 1 : Créer un module simple

```typescript
import { BaseModule, ModuleConfig, ModuleStatus } from '@imuchat/platform-core';

export class MyModule extends BaseModule {
  constructor(config: ModuleConfig) {
    super(config);
  }

  protected async onInitialize(): Promise<void> {
    console.log('Initializing MyModule...');
    // Charger ressources, connexions DB, etc.
  }

  protected async onStart(): Promise<void> {
    console.log('Starting MyModule...');
    // Démarrer services, listeners, etc.
  }

  protected async onStop(): Promise<void> {
    console.log('Stopping MyModule...');
    // Arrêter services proprement
  }

  // API publique du module
  public async doSomething(): Promise<void> {
    if (this.status !== ModuleStatus.RUNNING) {
      throw new Error('Module not running');
    }
    // Logique métier
  }
}
```

### Exemple 2 : Utiliser le ModuleRegistry

```typescript
import { ModuleRegistry, EventBus } from '@imuchat/platform-core';
import { AuthModule } from '@imuchat/platform-core/modules/auth';

// Créer l'infrastructure
const eventBus = new EventBus({ queueSize: 1000 });
const registry = new ModuleRegistry(eventBus);

// Créer et enregistrer le module Auth
const authModule = new AuthModule(
  {
    description: 'Firebase Authentication',
    category: 'core',
    permissions: { network: true, storage: true },
    dependencies: [],
    removable: false,
    priority: 0,
  },
  {
    projectId: 'my-firebase-project',
    // ... autres configs Firebase
  },
  eventBus
);

registry.register(authModule);

// Initialiser et démarrer
await registry.initialize('core.auth');
await registry.start('core.auth');

// Utiliser l'API
const token = 'firebase-id-token...';
const user = await authModule.verifyToken(token);
console.log('User:', user.uid);
```

### Exemple 3 : Écouter des événements

```typescript
import { EventBus, EventPriority } from '@imuchat/platform-core';

const eventBus = new EventBus();

// S'abonner à un événement
eventBus.subscribe('auth:user-created', 'my-module', async (event) => {
  console.log('New user created:', event.data);
  // Envoyer email de bienvenue, créer profil, etc.
});

// Publier un événement
eventBus.publish({
  type: 'auth:user-created',
  source: 'core.auth',
  timestamp: Date.now(),
  priority: EventPriority.HIGH,
  data: { uid: 'user-123', email: 'user@example.com' }
});
```

## Tests

**Localisation:** `/platform-core/src/modules/__tests__/`

**Exécution:**
```bash
cd platform-core
pnpm test                # Mode watch
pnpm test --run          # Exécution unique
pnpm test:coverage       # Avec couverture
```

**Résultats actuels:**
- 42 tests unitaires
- 100% de réussite
- Couverture: À mesurer

## Hooks React (Client)

Pour l'intégration côté client, des hooks React sont disponibles dans `shared-types`.

**Fichiers:**
- `/shared-types/src/hooks/useAuth.ts`
- `/shared-types/src/hooks/AuthProvider.tsx`

**Exemple d'utilisation:**
```tsx
import { AuthProvider, useAuth } from '@imuchat/shared-types/hooks';

// Wrapper de l'app
function App() {
  return (
    <AuthProvider>
      <MyComponent />
    </AuthProvider>
  );
}

// Dans un composant
function MyComponent() {
  const { user, loading, signIn, signOut } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {user ? (
        <>
          <p>Welcome {user.email}</p>
          <button onClick={signOut}>Sign Out</button>
        </>
      ) : (
        <button onClick={() => signIn('email@example.com', 'password')}>
          Sign In
        </button>
      )}
    </div>
  );
}
```

## Prochaines étapes

### Modules à créer

1. **WebSocketModule** - Service Socket.IO pour la messagerie temps réel
2. **ContactsModule** - Gestion des contacts et amis
3. **NotificationsModule** - Système de notifications unifié
4. **MediaModule** - Upload/téléchargement de médias
5. **VoiceModule** - Canaux vocaux et appels

### Améliorations système

- [ ] Métriques et monitoring des modules
- [ ] Health checks automatiques
- [ ] Gestion de configuration dynamique
- [ ] Hot-reload des modules
- [ ] Module sandboxing pour la sécurité
- [ ] Documentation API générée (TypeDoc)

## Références

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html)
- [Module Pattern](https://www.patterns.dev/posts/module-pattern)

---

*Dernière mise à jour: Janvier 2026*
*Version: 1.0.0*
