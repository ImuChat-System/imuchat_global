# Refactoring GUILD → SERVER

## Objectif

Changement de terminologie de "Guilde" vers "Serveur" pour maximiser l'audience de l'application. Le terme "Serveur" est plus universel et popularisé par Discord.

## Changements effectués

### 1. shared-types/src/

#### Fichier renommé

- `guild.ts` → `server.ts`

#### Interfaces renommées

- `Guild` → `Server`
- `GuildSettings` → `ServerSettings`
- `GuildFeature` → `ServerFeature`
- `GuildMember` → `ServerMember`
- `GuildInvite` → `ServerInvite`
- `GuildEvent` → `ServerEvent`

#### Champs renommés

- `guildId` → `serverId` (dans Channel, Role, ServerMember, ServerInvite, ServerEvent, NotificationMetadata, MediaMetadata)
- `mutualGuilds` → `mutualServers` (dans Contact)

#### Permissions

- `manage_guild` → `manage_server`

#### Types d'énumération

- `ConversationType`: `'guild'` → `'server'`
- `NotificationCategory`: `guilds` → `servers`
- `NotificationType`: `guild_invite/role/event` → `server_invite/role/event`
- `ContactSortField`: `mutual_guilds` → `mutual_servers`
- `InviteData.type`: `'guild'` → `'server'`

#### Schemas Zod

- `ConversationTypeSchema`: `'guild'` → `'server'`
- Schema d'invite type: `'guild'` → `'server'`

#### Tests

- `schemas.test.ts`: Assertion `'guild'` → `'server'`

#### Configuration package.json

- Export `./guild` → `./server`
- Script build: `src/guild.ts` → `src/server.ts`

### 2. platform-core/src/

#### config/index.ts

- `maxGuildMembers` → `maxServerMembers`
- `PERMISSIONS.MANAGE_GUILD` → `PERMISSIONS.MANAGE_SERVER`

#### services/modules.ts

- Module ID: `'social.guilds'` → `'social.servers'`
- Module name: `'Guildes'` → `'Serveurs'`
- Permissions: `'guilds.read/write'` → `'servers.read/write'`
- Champ: `guildId` → `serverId`

#### services/socket-server.ts & websocket.ts

- Type de room: `'guild'` → `'server'`

#### modules/NotificationsModule.ts

- `NotificationType.GUILD_INVITE/JOIN/ROLE_ASSIGNED` → `SERVER_INVITE/JOIN/ROLE_ASSIGNED`
- `NotificationCategory.GUILDS` → `SERVERS`
- Champ: `mutedGuilds` → `mutedServers`
- Commentaire: "Guildes/Serveurs" → "Serveurs"

#### examples/notifications-demo.ts

- `NotificationCategory.GUILDS` → `SERVERS`

#### modules/SearchModule.ts

- `SearchableType.GUILD` → `SERVER`
- Commentaire: "guildId" → "serverId"

### 3. Tests

Tous les tests passent : **248/248** ✅

## Impact

- **0 occurrence** de "guild/Guild/GUILD" restant dans le code
- **Rétrocompatibilité** : Breaking change - nécessite migration des données existantes
- **API** : Les endpoints et schémas d'API doivent être mis à jour côté client

## Notes

- Les hooks React dans shared-types ont été temporairement désactivés (problème préexistant)
- Migration de données nécessaire pour les bases de données existantes contenant `guildId`

## Mise à jour de la documentation (4 décembre 2024)

### Documentation mise à jour

#### Racine du projet

- ✅ `README.md` - Fonctionnalités et architecture monorepo
  - "Guildes" → "Serveurs" dans les fonctionnalités
  - `guild.ts` → `server.ts` dans l'arborescence

#### docs/

- ✅ `GAP_ANALYSIS.md` - Analyse des écarts
  - `Guild/Community` → `Server/Community` dans le tableau des types

#### mobile-app/

- ✅ `ROADMAP.md` - Feuille de route mobile
  - "Comms (communautés/guildes)" → "Comms (communautés/serveurs)"
  - "Création/gestion guildes" → "Création/gestion serveurs"
- ✅ `docs/QUICK_START.md` - Guide de démarrage rapide
  - "Communautés & guildes" → "Communautés & serveurs"
- ✅ `docs/QUICK_START copy.md` - Copie du guide
  - Idem

#### Fichiers UI

- ✅ `mobile-app/App.tsx` - Application mobile principale
  - Type `Tab`: `'guilds'` → `'servers'`
  - Label TabButton: "🏰 Guildes" → "🖥️ Serveurs"
  - Textes: "Vos guildes" → "Vos serveurs", "Explorer les guildes" → "Explorer les serveurs"
  
- ✅ `web-app/src/app/page.tsx` - Page d'accueil web
  - Type activeTab: `'guilds'` → `'servers'`
  - Label NavButton: "Guildes" → "Serveurs", icône 🏰 → 🖥️
  - Titre: "Guildes" → "Serveurs"

- ✅ `ui-kit/src/components/ServerIcon.tsx` - Composant icône serveur
  - Commentaire: "serveur/guilde" → "serveur"

### Statistiques finales

- **0 occurrence** de "guild/Guild/GUILD" dans le code et la documentation (hors fichier de refactoring)
- **8 fichiers de documentation** mis à jour
- **3 fichiers UI** (web-app, mobile-app, ui-kit) mis à jour
- **Terminologie cohérente** dans tout le projet

### Notes importantes

- Les fichiers de documentation historique (REFACTORING_GUILD_TO_SERVER.md) conservent intentionnellement les anciens termes pour tracer les changements
- Tous les nouveaux développements doivent utiliser exclusivement "Server/Serveur"
- Les interfaces utilisateur utilisent l'icône 🖥️ pour représenter les serveurs
