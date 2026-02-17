# ⚡ Platform-Core Integration with Supabase

> Adaptateur pour utiliser platform-core avec Supabase Auth + DB

## 🎯 Stratégie d'intégration

### Phase 1 : Adaptateur Supabase (MVP Sprint 1)

- Créer `SupabaseAuthModule` (remplace Firebase)
- Adapter schémas DB Drizzle → Supabase  
- Config unifiée Supabase

### Phase 2 : Integration Mobile/Web (Sprint 1-2)

- Import modules dans mobile (`@imuchat/platform-core`)
- Import modules dans web-app  
- Configuration partagée

### Phase 3 : Services backend (Sprint 2)

- WebSocket server (realtime)
- API REST endpoints
- Edge Functions

## 📝 Actions immédiates

### 1. Créer adaptateur Supabase pour platform-core

**Nouveau module** : `SupabaseAuthModule` (remplace `AuthModule`)
**Config** : Utilise credentials Supabase existants
**Schema** : Harmoniser avec `supabase_schema.sql` créé

### 2. Configuration mobile/web

```typescript
// mobile/services/platform.ts
import { ModuleRegistry, SupabaseAuthModule, ChatEngineModule } from '@imuchat/platform-core';

const modules = new ModuleRegistry();
modules.register(new SupabaseAuthModule(supabaseConfig));
modules.register(new ChatEngineModule());
```

### 3. Types partagés

Platform-core fournit **tous les types TypeScript** dont on a besoin :

- `Message`, `Conversation`, `UserPresence`
- `MessageReaction`, `ContactProfile`, etc.

## ✅ Avantages de cette intégration

1. **Réutilisation code** : Pas besoin de recréer la logique métier
2. **Types cohérents** : Même interfaces mobile/web/desktop  
3. **Modules optionnels** : On peut activer que les modules MVP nécessaires
4. **Tests included** : Modules déjà testés
5. **Scalabilité** : Architecture prête pour post-MVP

## 🚀 Démarrage immédiat

1. Adapter `platform-core` pour Supabase (30min)
2. Intégrer dans mobile/web (1h)  
3. Tester auth + chat basique (30min)

**Total** : 2h pour avoir une base solide avec tous les modules !

---

**Cette découverte accélère considérablement le développement MVP** 🔥
