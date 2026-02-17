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
- [ ] 🔄 Activer Email Auth (dans dashboard)
- [ ] 🔄 Configurer OAuth providers (Google, Apple)

---

#### 2. Stream Video Setup

```bash
# Créer compte Stream (getstream.io)
# Plan: Free tier (10K mins/mois)

# Créer application "ImuChat Video"
# Récupérer:
STREAM_API_KEY=xxx
STREAM_API_SECRET=xxx (SECRET!)
```

**Actions** :

- [ ] Créer compte Stream.io
- [ ] Créer app Video
- [ ] Copier credentials `.env`
- [ ] Tester connexion avec SDK

---

#### 3. Firebase Cloud Messaging

```bash
# Console Firebase (console.firebase.google.com)
# Créer projet "ImuChat"

# Ajouter app iOS + Android
# Télécharger:
- google-services.json (Android)
- GoogleService-Info.plist (iOS)

# Générer VAPID keys (web push)
```

**Actions** :

- [ ] Créer projet Firebase
- [ ] Setup iOS + Android apps
- [ ] Download config files
- [ ] Générer VAPID keys
- [ ] Ajouter credentials dans repos

---

### ✅ Actions Jour 3-5 (Repos & Environnements)

#### 4. Configuration Repos

**Mobile** :

```bash
cd mobile/
cp .env.example .env

# Éditer .env:
SUPABASE_URL=xxx
SUPABASE_ANON_KEY=xxx
STREAM_API_KEY=xxx

# Installer dépendances
pnpm install

# Lancer dev
pnpm start
```

**Web** :

```bash
cd web-app/
cp .env.example .env.local

# Éditer .env.local:
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_STREAM_API_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx (server-side)

# Installer
pnpm install

# Dev
pnpm dev
```

**Actions** :

- [ ] Cloner tous les repos si nécessaire
- [ ] Setup .env files (NE PAS COMMIT)
- [ ] Install dependencies
- [ ] Test apps lancent sans erreur
- [ ] Config linter + prettier

---

#### 5. Database Schema Initial

**Créer les tables Supabase** :

```sql
-- SQL à exécuter dans Supabase SQL Editor

-- Table Users (étendue auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  status TEXT,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Table Conversations
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('direct', 'group')),
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Table Conversation Members
CREATE TABLE public.conversation_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see conversations they're member of
CREATE POLICY "Users can view their conversations"
  ON public.conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_members
      WHERE conversation_id = conversations.id
      AND user_id = auth.uid()
    )
  );

-- Table Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'video', 'audio', 'file')),
  media_url TEXT,
  metadata JSONB,
  edited_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX messages_conversation_id_idx ON public.messages(conversation_id);
CREATE INDEX messages_created_at_idx ON public.messages(created_at DESC);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read messages from their conversations
CREATE POLICY "Users can view conversation messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_members
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
    )
  );

-- Policy: Users can insert messages in their conversations
CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.conversation_members
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
    )
  );

-- Table Contacts
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, contact_id)
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Function: Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Actions** :

- [ ] Exécuter schema SQL dans Supabase
- [ ] Vérifier tables créées (Table Editor)
- [ ] Tester policies avec test user
- [ ] Backup schema (SQL dump)

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
