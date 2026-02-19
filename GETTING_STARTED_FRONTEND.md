# 🚀 Getting Started - Développement Frontend MVP

> **Guide pratique** : Commencer le développement frontend aujourd'hui (19 février 2026)

---

## 📋 Prérequis - Vérification Rapide

### Environnement de Développement

```bash
# Vérifier Node.js (version 18+)
node --version
# ✅ Devrait afficher : v18.x.x ou v20.x.x

# Vérifier pnpm (version 8+)
pnpm --version
# ✅ Devrait afficher : 8.x.x ou 10.x.x

# Vérifier Git
git --version
# ✅ Devrait afficher : git version 2.x.x
```

**Si manquant** :
```bash
# Installer Node.js
# https://nodejs.org/ ou brew install node

# Installer pnpm
npm install -g pnpm

# Git devrait être préinstallé sur macOS
```

---

## 🏗️ Setup Initial (5-10 minutes)

### 1. Dépendances du Monorepo

```bash
# Depuis la racine du projet
cd /Users/nathanimogo/Documents/GitHub/imuchat_global

# Installer toutes les dépendances
pnpm install

# ✅ Attendez ~2-3 minutes
# Devrait installer : mobile, web-app, platform-core, ui-kit, shared-types
```

### 2. Vérifier Configuration .env

#### Mobile
```bash
# Vérifier fichier existe
cat mobile/.env

# Devrait contenir :
# EXPO_PUBLIC_SUPABASE_URL=...
# EXPO_PUBLIC_SUPABASE_ANON_KEY=...
# EXPO_PUBLIC_STREAM_API_KEY=...
# EXPO_PUBLIC_FIREBASE_API_KEY=...
```

#### Web
```bash
# Vérifier fichier existe
cat web-app/.env.local

# Devrait contenir :
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# NEXT_PUBLIC_STREAM_API_KEY=...
# NEXT_PUBLIC_FIREBASE_API_KEY=...
```

**Si fichiers manquants** :
```bash
# Copier depuis examples
cp mobile/.env.example mobile/.env
cp web-app/.env.example web-app/.env.local

# Puis remplir les valeurs depuis :
# - Supabase Dashboard : https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
# - Stream Dashboard : https://dashboard.getstream.io/
# - Firebase Console : https://console.firebase.google.com/project/YOUR_PROJECT/settings/general
```

---

## 🎯 Commencer le Développement

### Option 1 : Développement Mobile (Recommandé pour Jour 1)

**Objectif** : Créer écrans d'appels vidéo

#### Lancer l'app mobile

```bash
# Depuis la racine
cd mobile

# Démarrer Expo
pnpm start

# Dans le terminal Expo :
# - Appuyez sur 'i' pour iOS Simulator
# - Appuyez sur 'a' pour Android Emulator
# - Scannez QR code avec Expo Go (smartphone)
```

#### Créer les écrans d'appels (Jour 1 - 4-6h)

**Fichiers à créer** :

```bash
# Dossier call déjà existant : mobile/app/call/
# Créer les fichiers suivants :

1. mobile/app/call/incoming.tsx       # Écran appel entrant
2. mobile/app/call/active.tsx         # Écran appel actif
3. mobile/app/call/outgoing.tsx       # Écran sortant
4. mobile/components/CallControls.tsx # Boutons contrôle
5. mobile/components/ParticipantView.tsx # Affichage participant
```

**Templates de démarrage** :

##### 1. incoming.tsx
```typescript
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useCalls } from '@/hooks/useCalls';
import { KawaiiButton } from '@imuchat/ui-kit';
import { UserAvatar } from '@imuchat/ui-kit';

export default function CallIncomingScreen() {
  const { callId } = useLocalSearchParams<{ callId: string }>();
  const { acceptCall, rejectCall } = useCalls();

  const handleAccept = async () => {
    await acceptCall(callId);
    router.push(`/call/active?callId=${callId}`);
  };

  const handleReject = async () => {
    await rejectCall(callId);
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Avatar appel entrant */}
      <UserAvatar size="2xl" status="calling" />
      
      {/* Nom appelant */}
      <Text style={styles.callerName}>Alice Dupont</Text>
      <Text style={styles.callType}>Appel vidéo entrant...</Text>

      {/* Boutons Accept / Reject */}
      <View style={styles.actions}>
        <KawaiiButton variant="success" onPress={handleAccept}>
          Accepter
        </KawaiiButton>
        <KawaiiButton variant="danger" onPress={handleReject}>
          Refuser
        </KawaiiButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0a1a',
    padding: 20,
  },
  callerName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
  },
  callType: {
    fontSize: 16,
    color: '#8B5CF6',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 60,
  },
});
```

##### 2. active.tsx
```typescript
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useCalls } from '@/hooks/useCalls';
import CallControls from '@/components/CallControls';
import ParticipantView from '@/components/ParticipantView';

export default function CallActiveScreen() {
  const { callId } = useLocalSearchParams<{ callId: string }>();
  const { hangUp, toggleMute, toggleVideo } = useCalls();

  const handleHangUp = async () => {
    await hangUp(callId);
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Vue participant distant */}
      <ParticipantView 
        participantId="remote-user-id" 
        isRemote 
      />

      {/* Vue participant local (petit, en haut à droite) */}
      <View style={styles.localView}>
        <ParticipantView 
          participantId="local-user-id" 
          isLocal 
        />
      </View>

      {/* Contrôles call (bas de l'écran) */}
      <CallControls
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        onHangUp={handleHangUp}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  localView: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
});
```

##### 3. CallControls.tsx
```typescript
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

interface CallControlsProps {
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onHangUp: () => void;
}

export default function CallControls({
  onToggleMute,
  onToggleVideo,
  onHangUp,
}: CallControlsProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);

  const handleMute = () => {
    setIsMuted(!isMuted);
    onToggleMute();
  };

  const handleVideo = () => {
    setIsVideoOn(!isVideoOn);
    onToggleVideo();
  };

  return (
    <View style={styles.container}>
      {/* Bouton Mute */}
      <TouchableOpacity
        style={[styles.button, isMuted && styles.buttonActive]}
        onPress={handleMute}
      >
        <Ionicons
          name={isMuted ? 'mic-off' : 'mic'}
          size={28}
          color="#fff"
        />
      </TouchableOpacity>

      {/* Bouton Hang Up */}
      <TouchableOpacity
        style={[styles.button, styles.hangUpButton]}
        onPress={onHangUp}
      >
        <Ionicons name="call" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Bouton Vidéo */}
      <TouchableOpacity
        style={[styles.button, !isVideoOn && styles.buttonActive]}
        onPress={handleVideo}
      >
        <Ionicons
          name={isVideoOn ? 'videocam' : 'videocam-off'}
          size={28}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    borderColor: '#EF4444',
  },
  hangUpButton: {
    backgroundColor: '#EF4444',
    borderColor: '#DC2626',
    transform: [{ rotate: '135deg' }],
  },
});
```

**Ressources disponibles** :
- Hook useCalls : `mobile/hooks/useCalls.ts` (257 lignes - déjà créé)
- Service calls : `mobile/services/calls.ts` (392 lignes - déjà créé)
- UI Kit : `@imuchat/ui-kit` (KawaiiButton, UserAvatar, etc.)

---

### Option 2 : Développement Web (Alternatif)

**Objectif** : Créer pages d'appels vidéo web

#### Lancer l'app web

```bash
# Depuis la racine
cd web-app

# Démarrer Next.js
pnpm dev

# Ouvrir navigateur : http://localhost:3000
```

#### Créer les pages d'appels (Jour 1 - 4-6h)

**Fichiers à créer** :

```bash
# Créer les fichiers suivants :

1. web-app/src/app/(app)/calls/incoming/page.tsx
2. web-app/src/app/(app)/calls/active/page.tsx
3. web-app/src/app/(app)/calls/outgoing/page.tsx
4. web-app/src/components/calls/CallControls.tsx
5. web-app/src/components/calls/ParticipantView.tsx
```

**Templates similaires à mobile, adapter avec** :
- Next.js App Router `page.tsx`
- Tailwind CSS pour styles
- shadcn components
- Hook useCalls : `web-app/src/hooks/useCalls.ts` (324 lignes)

---

## 🧪 Tests & Validation

### Tester l'appel vidéo

**Scénario de test** :

1. **Initier un appel** :
   - Ouvrir app mobile/web
   - Aller dans Chats
   - Sélectionner une conversation
   - Appuyer sur bouton "Appel vidéo"
   - Devrait naviguer vers `/call/outgoing`

2. **Recevoir un appel** :
   - Simuler notification
   - Naviguer vers `/call/incoming?callId=test-123`
   - Appuyer sur "Accepter"
   - Devrait naviguer vers `/call/active`

3. **Appel actif** :
   - Voir vidéo participant distant (simulé)
   - Voir vidéo locale en petit (coin)
   - Tester boutons : Mute (audio), Vidéo (on/off), Raccrocher

4. **Raccrocher** :
   - Appuyer sur bouton rouge
   - Devrait fermer appel et retourner au chat

**Logs à vérifier** :

```bash
# Terminal Expo/Next.js
✅ Call initiated: callId=...
✅ Stream token generated
✅ WebRTC connection established
✅ Participant joined
✅ Call ended
```

---

## 📚 Ressources Utiles

### Documentation

| Document | Description |
|----------|-------------|
| [PLAN_DEVELOPPEMENT_FRONTEND_MVP.md](../PLAN_DEVELOPPEMENT_FRONTEND_MVP.md) | Plan complet 3 semaines |
| [MVP_STATUS_19_FEV_2026.md](../MVP_STATUS_19_FEV_2026.md) | État actuel MVP |
| [UI_KIT_COMPONENTS_REFERENCE.md](../UI_KIT_COMPONENTS_REFERENCE.md) | Référence composants UI |

### Hooks Disponibles

```typescript
// Mobile
import { useCalls } from '@/hooks/useCalls';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { useNotifications } from '@/hooks/useNotifications';

// Web
import { useCalls } from '@/hooks/useCalls';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { useNotifications } from '@/hooks/useNotifications';
```

### Composants UI Kit

```typescript
// Chat
import { ChatBubble, ChatInput, MessageList, TypingIndicator, EmojiReaction } from '@imuchat/ui-kit';

// User
import { UserAvatar, OnlineIndicator } from '@imuchat/ui-kit';

// Kawaii
import { KawaiiButton, KawaiiInput, KawaiiModal, ImuMascot } from '@imuchat/ui-kit';

// Base
import { Button, Badge, Card, Spinner, Tooltip, Separator } from '@imuchat/ui-kit';
```

---

## 🐛 Problèmes Fréquents

### Erreur : "Cannot find module '@imuchat/ui-kit'"

```bash
# Solution : Rebuilder ui-kit
cd ui-kit
pnpm build

# Puis revenir à mobile/web-app
cd ../mobile  # ou ../web-app
pnpm install
```

### Expo Metro Bundler bloqué

```bash
cd mobile
pnpm start --clear
```

### Next.js erreurs de build

```bash
cd web-app
rm -rf .next
pnpm dev
```

### Erreur Supabase "Invalid API key"

```bash
# Vérifier .env contient bonnes clés
cat mobile/.env  # ou web-app/.env.local

# Récupérer depuis Supabase Dashboard :
# Project Settings > API > Project URL + anon public key
```

### Erreur Stream "Invalid API key"

```bash
# Vérifier .env contient Stream API key
# Récupérer depuis Stream Dashboard :
# https://dashboard.getstream.io/
```

---

## ✅ Checklist Jour 1

### Avant de commencer
- [ ] Node.js + pnpm installés
- [ ] Dépendances installées (`pnpm install`)
- [ ] .env configurés (mobile + web)
- [ ] App mobile/web démarre sans erreurs

### Pendant le développement
- [ ] Créer écrans d'appels (incoming, active, outgoing)
- [ ] Créer composants CallControls + ParticipantView
- [ ] Intégrer hook useCalls
- [ ] Tester navigation entre écrans

### Tests
- [ ] Initier appel fonctionne
- [ ] Recevoir appel fonctionne
- [ ] Boutons contrôles fonctionnent (mute, vidéo, hang up)
- [ ] Raccrocher retourne au chat

### À la fin du jour
- [ ] Commit code : `git commit -m "feat: add video call screens"`
- [ ] Push : `git push origin main`
- [ ] Mettre à jour PROGRESS.md (optionnel)

---

## 🚀 Prochaines Étapes

### Après Jour 1 (Écrans Appels)

**Jour 2** : Compléter appels web + intégration Stream SDK réel
**Jour 3** : Notifications push (permission, foreground, background)
**Jour 4** : Tests + polish Semaine 1

**Voir planning complet** : [PLAN_DEVELOPPEMENT_FRONTEND_MVP.md](../PLAN_DEVELOPPEMENT_FRONTEND_MVP.md)

---

## 📞 Support

### Problème bloquant ?

1. Vérifier logs terminal (Expo/Next.js)
2. Vérifier .env correctement configurés
3. Consulter documentation :
   - [platform-core/docs/QUICK_START.md](../platform-core/docs/QUICK_START.md)
   - [platform-core/docs/CLIENT_API_INTEGRATION.md](../platform-core/docs/CLIENT_API_INTEGRATION.md)
4. Vérifier GitHub Issues
5. Contacter lead dev

---

**Bonne chance ! 🚀**

**Objectif** : Écrans d'appels vidéo fonctionnels en fin de journée

**Timeline** : MVP complet dans 3 semaines (12 mars 2026)

---

**Version** : 1.0  
**Date** : 19 février 2026  
**Dernière mise à jour** : 19 février 2026

---
