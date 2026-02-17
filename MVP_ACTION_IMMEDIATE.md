# 🎯 MVP ImuChat - Plan d'Action Immédiat

> Guide de démarrage sprint - Semaine 1

---

## 🚀 Quick Start - Ce qu'il faut faire MAINTENANT

### ✅ Actions Jour 1-2 (Setup Infrastructure) - **TERMINÉ** ✅

#### 1. Supabase Project Setup - **FAIT** ✅

```bash
# ✅ FAIT - Projet Supabase créé
# Nom: imuchat-mvp  
# Region: EU (RGPD compliance)
# URL: https://dsbhktfynanuwgbwejkm.supabase.co

# ✅ FAIT - Credentials configurés:
SUPABASE_URL=https://dsbhktfynanuwgbwejkm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Actions** :

- [x] ✅ Créer compte Supabase
- [x] ✅ Créer projet
- [x] ✅ Copier credentials dans `.env` (mobile + web)
- [x] ✅ Schema SQL déployé (tables + policies + triggers)
- [ ] 🔄 Activer Email Auth (dans dashboard)
- [ ] 🔄 Configurer OAuth providers (Google, Apple)

---

#### 2. Stream Video Setup - **FAIT** ✅

```bash
# ✅ FAIT - Compte Stream créé (getstream.io)
# Plan: Free tier (10K mins/mois)

# ✅ FAIT - Application "ImuChat Video" créée
# Credentials configurés:
STREAM_API_KEY=z57h7zb5875r
STREAM_SECRET_KEY=mkhjusvzgddz2srcwhru7yr35nc8kepqtdr6d4q6ub4vcszcjc2vmbzjgedbc4qe
```

**Actions** :

- [x] ✅ Créer compte Stream.io
- [x] ✅ Créer app Video
- [x] ✅ Copier credentials `.env` (mobile + web)
- [ ] 🔄 Tester connexion avec SDK

---

#### 3. Firebase Cloud Messaging - **FAIT** ✅

```bash
# ✅ FAIT - Console Firebase (console.firebase.google.com)
# Projet: imuchat-378ad

# ✅ FAIT - Apps iOS + Android ajoutées
# Bundle ID: com.imuchat.imuchat

# ✅ FAIT - Fichiers de configuration téléchargés:
# - google-services.json (Android) ✅
# - GoogleService-Info.plist (iOS) ✅
```

**Fichiers ajoutés** :

- [x] ✅ `mobile/google-services.json` - Config Firebase Android
- [x] ✅ `mobile/GoogleService-Info.plist` - Config Firebase iOS
- [x] ✅ `mobile/app.json` - Références vers les fichiers Firebase
- [x] ✅ Credentials Stream ajoutés dans `.env` files

**Credentials Firebase** :
- ✅ Sender ID: `524860706727`
- ✅ VAPID Public Key: `BCXX6GoVcGhNusdAJZcAT3YtmH9kmFtuadig5pOKW_UY...`
- ✅ VAPID Private Key: Configurée dans `.env` files

**Actions** :

- [x] ✅ Créer projet Firebase
- [x] ✅ Setup iOS + Android apps
- [x] ✅ Download config files
- [x] ✅ Ajouter config files dans mobile/
- [x] ✅ Générer VAPID keys (web push)
- [x] ✅ Credentials Firebase ajoutées dans `.env` files
- [ ] 🔄 Installer Firebase SDK (si nécessaire pour notifications)

---

### ✅ Actions Jour 3-5 (Repos & Environnements) - **EN COURS** 🔄

#### 4. Configuration Repos - **PARTIELLEMENT FAIT** ✅

**Mobile** :

```bash
cd mobile/

# ✅ FAIT - .env configuré:
EXPO_PUBLIC_SUPABASE_URL=https://dsbhktfynanuwgbwejkm.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_STREAM_API_KEY=z57h7zb5875r
STREAM_SECRET_KEY=mkhjusvzgddz2srcwhru7yr35nc8kepqtdr6d4q6ub4vcszcjc2vmbzjgedbc4qe

# ✅ FAIT - Installer dépendances
pnpm install

# ✅ FAIT - Firebase config files ajoutés
# - google-services.json (Android)
# - GoogleService-Info.plist (iOS)

# Lancer dev
pnpm start
```

**Web** :

```bash
cd web-app/

# ✅ FAIT - .env.local configuré:
NEXT_PUBLIC_SUPABASE_URL=https://dsbhktfynanuwgbwejkm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_STREAM_API_KEY=z57h7zb5875r
STREAM_SECRET_KEY=mkhjusvzgddz2srcwhru7yr35nc8kepqtdr6d4q6ub4vcszcjc2vmbzjgedbc4qe

# ✅ FAIT - Installer
pnpm install

# Dev
pnpm dev
```

**Actions** :

- [x] ✅ Cloner tous les repos
- [x] ✅ Setup .env files (mobile + web)
- [x] ✅ Install dependencies
- [x] ✅ Firebase config files ajoutés
- [ ] 🔄 Test apps lancent sans erreur
- [ ] 🔄 Config linter + prettier

---

#### 5. Database Schema Initial - **FAIT** ✅

**✅ FAIT - Schema Supabase déployé** :

Toutes les tables ont été créées et configurées dans Supabase SQL Editor. Voir [supabase_schema.sql](./supabase_schema.sql) pour le schema complet.

**Tables créées** :
- ✅ `public.profiles` - Profils utilisateurs (étendue de auth.users)
- ✅ `public.conversations` - Conversations (direct + group)
- ✅ `public.conversation_members` - Participants aux conversations
- ✅ `public.messages` - Messages avec support media
- ✅ `public.message_reactions` - Réactions emoji aux messages
- ✅ `public.contacts` - Demandes d'amis
- ✅ `public.call_logs` - Historique des appels audio/vidéo

**Features configurées** :
- ✅ Row Level Security (RLS) activée sur toutes les tables
- ✅ Policies créées pour la sécurité
- ✅ Triggers pour auto-création de profile
- ✅ Indexes pour performance
- ✅ Storage buckets configurés (avatars, messages-media, voice-notes)

**Actions** :

- [x] ✅ Exécuter schema SQL dans Supabase
- [x] ✅ Vérifier tables créées (Table Editor)
- [x] ✅ Tester policies avec test user
- [x] ✅ Backup schema ([supabase_schema.sql](./supabase_schema.sql))

---

## 📋 Sprint 1 - Checklist Semaine 1

### Lundi-Mardi : Setup

- [ ] **Infrastructure**
  - [ ] Supabase projet créé
  - [ ] Stream SDK configuré
  - [ ] Firebase setup iOS/Android
  - [ ] Database schema déployé

- [ ] **Repositories**
  - [ ] Tous repos clonés
  - [ ] .env files configurés (à partir de .env.example)
  - [ ] Dependencies installées
  - [ ] Apps lancent localement

- [ ] **Design**
  - [ ] Figma access pour équipe
  - [ ] Design tokens exportés
  - [ ] Palette couleurs définie
  - [ ] Composants de base mockés (Button, Input, Avatar)

---

### Mercredi-Jeudi : Auth - Mobile

- [ ] **Mobile Auth UI**
  - [ ] Écran Welcome
  - [ ] Écran Login
  - [ ] Écran Signup
  - [ ] Écran Forgot Password

- [ ] **Mobile Auth Logic**
  - [ ] Integration Supabase Auth
  - [ ] Login email/password
  - [ ] Signup + email verification
  - [ ] OAuth Google (optionnel Sprint 1)
  - [ ] Session persistence
  - [ ] Error handling

- [ ] **Tests**
  - [ ] Test signup flow
  - [ ] Test login flow
  - [ ] Test logout
  - [ ] Test session refresh

---

### Vendredi : Auth - Web

- [ ] **Web Auth UI**
  - [ ] Page /login
  - [ ] Page /signup
  - [ ] Page /forgot-password
  - [ ] Composants formulaires

- [ ] **Web Auth Logic**
  - [ ] Integration Supabase SSR
  - [ ] Middleware auth check
  - [ ] Protected routes
  - [ ] Session cookies

- [ ] **Tests**
  - [ ] E2E auth flow (Playwright)
  - [ ] SSR auth correcte

---

### Weekend (Optionnel) : Profils

- [ ] **Profile Setup**
  - [ ] Écran setup profil initial
  - [ ] Upload avatar (Supabase Storage)
  - [ ] Edit display name
  - [ ] Edit bio/status

---

## 💻 Code Snippets - Quick Start

### Mobile : Supabase Client Setup

**`mobile/services/supabase.ts`** :

```typescript
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### Mobile : Auth Hook

**`mobile/hooks/useAuth.ts`** :

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    loading,
    signUp: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signUp({ email, password });
      return { data, error };
    },
    signIn: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      return { error };
    },
  };
}
```

### Web : Supabase Client Setup

**`web-app/src/lib/supabase/client.ts`** :

```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**`web-app/src/lib/supabase/server.ts`** :

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}
```

---

## 🎨 Design System - Composants Prioritaires

### Semaine 1 : Composants à Créer

**Mobile** :

- [ ] `Button` (primary, secondary, text)
- [ ] `Input` (text, email, password)
- [ ] `Avatar` (image, fallback initials)
- [ ] `Card` (container de base)
- [ ] `Text` (variants typography)

**Web** :

- [ ] Utiliser shadcn/ui pour:
  - `Button`
  - `Input`
  - `Card`
  - `Avatar`
  - `Form` (avec react-hook-form)

---

## 📊 Suivi Sprint 1

### Daily Standup Questions

1. **Hier** : Qu'as-tu terminé ?
2. **Aujourd'hui** : Sur quoi travailles-tu ?
3. **Blockers** : Qu'est-ce qui te bloque ?

### Sprint Review (Fin Semaine 1)

**Démo attendue** :

- [ ] Mobile : Login/Signup fonctionnel
- [ ] Web : Login/Signup fonctionnel
- [ ] Backend : Users peuvent s'inscrire et se connecter
- [ ] Database : Profiles auto-créés

**Critères de succès** :

- ✅ User peut créer compte
- ✅ User peut se connecter
- ✅ Session persiste après refresh
- ✅ Profile créé automatiquement

---

## 🚨 Troubleshooting Commun

### "Supabase connection failed"

```bash
# Vérifier .env
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Tester connexion
curl https://YOUR_SUPABASE_URL/rest/v1/ \
  -H "apikey: YOUR_ANON_KEY"

# Si 401 : Vérifier RLS policies
```

### "OAuth redirect not working"

```bash
# Ajouter URL redirects dans Supabase:
# Dashboard > Authentication > URL Configuration

# Redirect URLs à ajouter:
# Mobile: exp://localhost:8081 (Expo dev)
# Web: http://localhost:3000/auth/callback
```

### "Image upload fails"

```bash
# Vérifier bucket exists:
# Supabase > Storage > Create bucket 'avatars'
# Settings : Public = true

# Vérifier policy:
CREATE POLICY "Avatar images publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() = (storage.foldername(name))[1]::uuid
  );
```

---

## 📚 Ressources Utiles

### Documentation

- [Supabase Docs](https://supabase.com/docs)
- [Stream Video Docs](https://getstream.io/video/docs/)
- [Expo Docs](https://docs.expo.dev/)
- [Next.js Docs](https://nextjs.org/docs)

### Tutoriels Rapides

- [Supabase Auth with React Native](https://supabase.com/docs/guides/auth/auth-helpers/react-native)
- [Next.js + Supabase SSR](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Stream Video React Native SDK](https://getstream.io/video/docs/react-native/)

### Tools

- [Supabase CLI](https://supabase.com/docs/guides/cli) - Local dev
- [Expo Go](https://expo.dev/go) - Test app sur device
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)

---

## ✅ Definition of Done - Sprint 1

Un ticket est "Done" quand :

- [ ] Code écrit et fonctionnel
- [ ] Tests unitaires passent (si applicable)
- [ ] Code review approuvé (1+ reviewer)
- [ ] Testé manuellement sur 2+ devices/browsers
- [ ] Documentation updated si nécessaire
- [ ] Merged dans `develop` branch

---

## 🎯 Objectif Final Semaine 1

**Livrable minimum** :
> Un utilisateur peut créer un compte (mobile OU web), se connecter, et voir son profil basique.

**Demo video** :

- [ ] Enregistrer screencast 2-3min
- [ ] Montrer signup flow complet
- [ ] Montrer login
- [ ] Montrer profil créé dans Supabase

---

## 🚀 Prêt à Démarrer ?

### Checklist Avant Kick-off

- [ ] Équipe complète assignée
- [ ] Comptes créés (Supabase, Stream, Firebase)
- [ ] Repos clonés localement
- [ ] Figma access OK
- [ ] Communication channels setup (Slack/Discord)
- [ ] Planning Sprint 1 partagé (calendar)
- [ ] Première standup schedulée

### Go/No-Go Launch Sprint 1

**GO si** :

- ✅ 3+ développeurs disponibles
- ✅ Infrastructure configurée
- ✅ Design mockups prêts (onboarding + auth)
- ✅ Backlog Sprint 1 défini

**NO-GO si** :

- ❌ Pas d'accès infra
- ❌ Équipe incomplète
- ❌ Specs manquantes

---

## 📞 Support & Questions

**Product Owner** : _________  
**Tech Lead** : _________  
**Channel Slack** : #imuchat-mvp-dev

**Emergency** : Si blocker critique, ping @tech-lead immédiatement

---

**Document créé** : 12 février 2026  
**Sprint** : Sprint 1 - Semaine 1  
**Deadline** : 19 février 2026  
**Next review** : Vendredi 19/02, 16h

---

*🔥 Let's ship Sprint 1! One week to auth magic!*
