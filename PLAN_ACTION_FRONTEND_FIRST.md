# 🚀 Plan d'Action MVP - Approche Frontend-First

> **Date**: 17 février 2026  
> **Durée**: 3 semaines (21 jours)  
> **Stratégie**: Frontend-First avec UI-Kit existant  

---

## 🎯 Objectif

**MVP déployable en 3 semaines** avec :

- ✅ Auth complète (déjà fait)
- ✅ Chat temps réel (déjà fait)
- 🎯 Appels vidéo/audio fonctionnels
- 🎯 Notifications push actives
- 🎯 Features chat avancées (typing, réactions, médias)

---

## 📦 Ressources UI-Kit Disponibles

### Composants Chat (Prêts à Utiliser) ✅

```typescript
// Déjà disponibles dans @imuchat/ui-kit
import {
  ChatBubble,        // Bulles de messages ✅
  ChatInput,         // Input avec emojis ✅
  MessageList,       // Liste messages avec scroll ✅
  ChannelItem,       // Item conversation ✅
  TypingIndicator,   // "Alice is typing..." ✅
  EmojiReaction,     // Réactions emojis ✅
  UserAvatar,        // Avatar utilisateur ✅
  OnlineIndicator,   // Statut en ligne ✅
} from '@imuchat/ui-kit';
```

### Composants UI Base ✅

```typescript
import {
  Button,           // Boutons standards
  KawaiiButton,     // Boutons style kawaii
  Input,            // Inputs formulaires
  KawaiiInput,      // Inputs kawaii
  Card,             // Cartes
  KawaiiCard,       // Cartes kawaii
  Modal,            // Modales
  KawaiiModal,      // Modales kawaii
  Avatar,           // Avatars génériques
  KawaiiAvatar,     // Avatars kawaii
  Badge,            // Badges
  KawaiiBadge,      // Badges kawaii
  Spinner,          // Loaders
  Tooltip,          // Tooltips
  KawaiiTooltip,    // Tooltips kawaii
  ImuMascot,        // Mascotte ImuChat 🎨
} from '@imuchat/ui-kit';
```

### Design System ✅

```typescript
// Thèmes disponibles
import { themes } from '@imuchat/ui-kit/themes';
// - light, dark, kawaii, gaming, minimal

// Tokens design
import { tokens } from '@imuchat/ui-kit/tokens';
// - colors, spacing, typography, shadows, animations

// i18n intégré
import { I18nProvider, useTranslation } from '@imuchat/ui-kit/i18n';
// - FR, EN, DE, ES support
```

---

## 📅 SEMAINE 1 : Appels Vidéo + Notifications UI (4 jours)

### Jour 1 : Écrans Appels - Incoming Call (Lundi)

**Objectif** : Écran d'appel entrant fonctionnel avec Stream SDK

#### Mobile (`mobile/app/call/incoming.tsx`)

```typescript
import { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { UserAvatar, KawaiiButton, ImuMascot } from '@imuchat/ui-kit';
import { useCalls } from '@/hooks/useCalls';
import { useRouter } from 'expo-router';

export default function CallIncomingScreen() {
  const router = useRouter();
  const { 
    incomingCall, 
    acceptCall, 
    rejectCall,
    isInitializing 
  } = useCalls();

  const handleAccept = useCallback(async () => {
    await acceptCall(incomingCall.callId);
    router.push(`/call/active?callId=${incomingCall.callId}`);
  }, [incomingCall, acceptCall, router]);

  const handleReject = useCallback(async () => {
    await rejectCall(incomingCall.callId);
    router.back();
  }, [incomingCall, rejectCall, router]);

  if (!incomingCall) return null;

  return (
    <View style={styles.container}>
      {/* Avatar appelant */}
      <UserAvatar
        src={incomingCall.caller.avatar}
        name={incomingCall.caller.name}
        size="xl"
        status="calling"
      />

      {/* Nom appelant */}
      <Text style={styles.callerName}>
        {incomingCall.caller.name}
      </Text>

      {/* Type d'appel */}
      <Text style={styles.callType}>
        {incomingCall.type === 'video' ? '📹 Appel vidéo' : '📞 Appel audio'}
      </Text>

      {/* Mascotte animée */}
      <ImuMascot 
        animation="ringing" 
        size="medium"
        style={styles.mascot}
      />

      {/* Actions */}
      <View style={styles.actions}>
        <KawaiiButton
          variant="danger"
          size="large"
          onPress={handleReject}
          icon="📵"
          disabled={isInitializing}
        >
          Refuser
        </KawaiiButton>

        <KawaiiButton
          variant="success"
          size="large"
          onPress={handleAccept}
          icon={incomingCall.type === 'video' ? '📹' : '📞'}
          loading={isInitializing}
        >
          Accepter
        </KawaiiButton>
      </View>
    </View>
  );
}
```

#### Web (`web-app/src/app/call/incoming/page.tsx`)

```typescript
'use client';

import { useCallback } from 'react';
import { UserAvatar, KawaiiButton, ImuMascot } from '@imuchat/ui-kit';
import { useCalls } from '@/hooks/useCalls';
import { useRouter } from 'next/navigation';

export default function CallIncomingPage() {
  const router = useRouter();
  const { incomingCall, acceptCall, rejectCall, isInitializing } = useCalls();

  const handleAccept = useCallback(async () => {
    await acceptCall(incomingCall!.callId);
    router.push(`/call/active?callId=${incomingCall!.callId}`);
  }, [incomingCall, acceptCall, router]);

  const handleReject = useCallback(async () => {
    await rejectCall(incomingCall!.callId);
    router.back();
  }, [incomingCall, rejectCall, router]);

  if (!incomingCall) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-500 to-pink-500 dark:from-purple-900 dark:to-pink-900">
      <UserAvatar
        src={incomingCall.caller.avatar}
        name={incomingCall.caller.name}
        size="xl"
        status="calling"
        className="mb-6"
      />

      <h1 className="text-4xl font-bold text-white mb-2">
        {incomingCall.caller.name}
      </h1>

      <p className="text-xl text-white/80 mb-8">
        {incomingCall.type === 'video' ? '📹 Appel vidéo entrant' : '📞 Appel audio entrant'}
      </p>

      <ImuMascot 
        animation="ringing" 
        size="medium"
        className="mb-12"
      />

      <div className="flex gap-6">
        <KawaiiButton
          variant="danger"
          size="large"
          onClick={handleReject}
          disabled={isInitializing}
        >
          📵 Refuser
        </KawaiiButton>

        <KawaiiButton
          variant="success"
          size="large"
          onClick={handleAccept}
          loading={isInitializing}
        >
          {incomingCall.type === 'video' ? '📹' : '📞'} Accepter
        </KawaiiButton>
      </div>
    </div>
  );
}
```

**Tâches Jour 1** :

- [ ] Créer `mobile/app/call/incoming.tsx`
- [ ] Créer `web-app/src/app/call/incoming/page.tsx`
- [ ] Tester appel entrant dans les deux apps
- [ ] Vérifier ringtone et notification

**Livrables** : Écran incoming fonctionnel mobile + web ✅

---

### Jour 2 : Écran Appel Actif (Mardi)

**Objectif** : Écran d'appel en cours avec vidéo/audio

#### Mobile (`mobile/app/call/active.tsx`)

```typescript
import { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { StreamCall, CallContent } from '@stream-io/video-react-native-sdk';
import { KawaiiButton, UserAvatar, Spinner } from '@imuchat/ui-kit';
import { useCalls } from '@/hooks/useCalls';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function CallActiveScreen() {
  const router = useRouter();
  const { callId } = useLocalSearchParams<{ callId: string }>();
  const {
    activeCall,
    endCall,
    toggleMute,
    toggleVideo,
    isMuted,
    isVideoEnabled,
    callDuration,
  } = useCalls();

  const handleEndCall = useCallback(async () => {
    await endCall(callId);
    router.back();
  }, [callId, endCall, router]);

  if (!activeCall) {
    return (
      <View style={styles.loading}>
        <Spinner size="large" />
        <Text>Connexion en cours...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Vidéo Stream */}
      <StreamCall call={activeCall}>
        <CallContent />
      </StreamCall>

      {/* Overlay controls */}
      <View style={styles.header}>
        <Text style={styles.duration}>{callDuration}</Text>
        <Text style={styles.participantName}>
          {activeCall.state.callingState.participants[0]?.user.name}
        </Text>
      </View>

      {/* Contrôles */}
      <View style={styles.controls}>
        <KawaiiButton
          variant={isMuted ? 'danger' : 'secondary'}
          size="medium"
          onPress={toggleMute}
          icon={isMuted ? '🔇' : '🎤'}
        />

        {activeCall.type === 'video' && (
          <KawaiiButton
            variant={!isVideoEnabled ? 'danger' : 'secondary'}
            size="medium"
            onPress={toggleVideo}
            icon={isVideoEnabled ? '📹' : '📵'}
          />
        )}

        <KawaiiButton
          variant="danger"
          size="large"
          onPress={handleEndCall}
          icon="📞"
        >
          Raccrocher
        </KawaiiButton>
      </View>
    </View>
  );
}
```

#### Web (`web-app/src/app/call/active/page.tsx`)

```typescript
'use client';

import { Suspense } from 'react';
import { StreamCall, CallControls, SpeakerLayout } from '@stream-io/video-react-sdk';
import { KawaiiButton, Spinner } from '@imuchat/ui-kit';
import { useCalls } from '@/hooks/useCalls';
import { useSearchParams, useRouter } from 'next/navigation';

function CallActiveContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callId = searchParams.get('callId');
  const { activeCall, endCall, callDuration } = useCalls();

  const handleEndCall = async () => {
    if (callId) {
      await endCall(callId);
      router.back();
    }
  };

  if (!activeCall) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="large" />
        <p>Connexion en cours...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black">
      <StreamCall call={activeCall}>
        {/* Layout vidéo */}
        <SpeakerLayout />

        {/* Header */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-white">
          <span className="text-lg font-semibold">{callDuration}</span>
          <span className="text-sm opacity-80">
            {activeCall.state.callingState.participants.length} participant(s)
          </span>
        </div>

        {/* Contrôles */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <CallControls onLeave={handleEndCall} />
        </div>
      </StreamCall>
    </div>
  );
}

export default function CallActivePage() {
  return (
    <Suspense fallback={<Spinner />}>
      <CallActiveContent />
    </Suspense>
  );
}
```

**Tâches Jour 2** :

- [ ] Créer `mobile/app/call/active.tsx`
- [ ] Créer `web-app/src/app/call/active/page.tsx`
- [ ] Implémenter contrôles (mute, video, end)
- [ ] Tester qualité audio/vidéo
- [ ] Vérifier reconnexion automatique

**Livrables** : Appel vidéo/audio fonctionnel ✅

---

### Jour 3 : Historique Appels + Notifications UI (Mercredi)

#### Historique Appels (`mobile/app/(tabs)/calls.tsx`)

```typescript
import { FlatList, View, Text } from 'react-native';
import { ChannelItem, KawaiiButton, UserAvatar } from '@imuchat/ui-kit';
import { useCalls } from '@/hooks/useCalls';
import { useRouter } from 'expo-router';

export default function CallsHistoryScreen() {
  const router = useRouter();
  const { callHistory, initiateCall } = useCalls();

  const handleCallUser = async (userId: string, type: 'audio' | 'video') => {
    const callId = await initiateCall(userId, type);
    router.push(`/call/active?callId=${callId}`);
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={callHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', padding: 16, alignItems: 'center' }}>
            <UserAvatar
              src={item.participant.avatar}
              name={item.participant.name}
              size="medium"
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: '600' }}>
                {item.participant.name}
              </Text>
              <Text style={{ fontSize: 14, color: '#666' }}>
                {item.type === 'video' ? '📹' : '📞'} {item.status} • {item.duration}
              </Text>
              <Text style={{ fontSize: 12, color: '#999' }}>
                {new Date(item.timestamp).toLocaleString('fr-FR')}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <KawaiiButton
                size="small"
                variant="secondary"
                onPress={() => handleCallUser(item.participant.id, 'audio')}
                icon="📞"
              />
              <KawaiiButton
                size="small"
                variant="primary"
                onPress={() => handleCallUser(item.participant.id, 'video')}
                icon="📹"
              />
            </View>
          </View>
        )}
      />
    </View>
  );
}
```

#### Notifications Permission (`mobile/components/NotificationPrompt.tsx`)

```typescript
import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { KawaiiModal, KawaiiButton, ImuMascot } from '@imuchat/ui-kit';
import { useNotifications } from '@/hooks/useNotifications';

export function NotificationPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const { requestPermission, hasPermission } = useNotifications();

  useEffect(() => {
    // Afficher après 3 secondes si pas de permission
    const timer = setTimeout(() => {
      if (!hasPermission) {
        setIsVisible(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [hasPermission]);

  const handleAllow = async () => {
    await requestPermission();
    setIsVisible(false);
  };

  return (
    <KawaiiModal
      isVisible={isVisible}
      onClose={() => setIsVisible(false)}
      title="Notifications"
    >
      <View style={{ alignItems: 'center', padding: 20 }}>
        <ImuMascot animation="excited" size="medium" />
        
        <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 16, textAlign: 'center' }}>
          Restez connecté ! 🔔
        </Text>
        
        <Text style={{ fontSize: 14, color: '#666', marginTop: 8, textAlign: 'center' }}>
          Activez les notifications pour ne jamais manquer un message ou un appel.
        </Text>

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
          <KawaiiButton
            variant="secondary"
            onPress={() => setIsVisible(false)}
          >
            Plus tard
          </KawaiiButton>
          <KawaiiButton
            variant="primary"
            onPress={handleAllow}
          >
            Activer 🎉
          </KawaiiButton>
        </View>
      </View>
    </KawaiiModal>
  );
}
```

**Tâches Jour 3** :

- [ ] Créer écran historique appels (mobile + web)
- [ ] Créer prompt notifications permission
- [ ] Implémenter affichage notifications foreground
- [ ] Tester notifications background (FCM)

**Livrables** : Historique + Notifications fonctionnels ✅

---

### Jour 4 : Polish Appels + Tests (Jeudi)

**Tâches** :

- [ ] Ajouter animations transitions (écrans appels)
- [ ] Implémenter Picture-in-Picture mobile
- [ ] Ajouter sons (ringtone, fin appel)
- [ ] Tests end-to-end appels (2 devices)
- [ ] Vérifier CallKit (iOS) et ConnectionService (Android)

**Livrables** : Appels vidéo/audio production-ready ✅

---

## 📅 SEMAINE 2 : Features Chat Avancées (4 jours)

### Jour 5 : Typing Indicators + Réactions (Lundi)

#### Typing Indicator (utilise composant UI-Kit)

**Mobile** (`mobile/app/chat/[id].tsx` - mise à jour)

```typescript
import { TypingIndicator } from '@imuchat/ui-kit';
import { useChat } from '@/hooks/useChat';

// Dans le composant
const { messages, typingUsers, sendTypingIndicator } = useChat(conversationId);

return (
  <View>
    <MessageList messages={messages} />
    
    {/* Typing indicator du ui-kit */}
    {typingUsers.length > 0 && (
      <TypingIndicator 
        users={typingUsers}
        text={typingUsers.length === 1 
          ? `${typingUsers[0].name} est en train d'écrire...`
          : `${typingUsers.length} personnes écrivent...`
        }
      />
    )}
    
    <ChatInput 
      onChangeText={(text) => {
        if (text.length > 0) {
          sendTypingIndicator(true);
        } else {
          sendTypingIndicator(false);
        }
      }}
      onSubmit={sendMessage}
    />
  </View>
);
```

#### Réactions Messages (utilise EmojiReaction)

```typescript
import { EmojiReaction } from '@imuchat/ui-kit';

// Dans MessageList
<ChatBubble 
  message={message}
  onLongPress={() => setShowReactions(message.id)}
/>

{showReactions === message.id && (
  <View style={styles.reactionPicker}>
    {['❤️', '👍', '😂', '😮', '😢', '🙏'].map(emoji => (
      <EmojiReaction
        key={emoji}
        emoji={emoji}
        onPress={() => handleReaction(message.id, emoji)}
      />
    ))}
  </View>
)}

{/* Afficher réactions existantes */}
{message.reactions && message.reactions.length > 0 && (
  <View style={styles.reactions}>
    {message.reactions.map(reaction => (
      <EmojiReaction
        key={`${reaction.emoji}-${reaction.count}`}
        emoji={reaction.emoji}
        count={reaction.count}
        active={reaction.userReacted}
        onPress={() => handleToggleReaction(message.id, reaction.emoji)}
      />
    ))}
  </View>
)}
```

**Tâches Jour 5** :

- [ ] Implémenter typing indicators (Supabase Realtime)
- [ ] Créer système réactions messages
- [ ] Ajouter picker réactions (long press)
- [ ] Synchroniser réactions temps réel

---

### Jour 6 : Upload Images + Preview (Mardi)

#### Image Picker & Upload

```typescript
import { ImagePicker } from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { KawaiiButton, Spinner } from '@imuchat/ui-kit';

const handleImagePick = async () => {
  // Permission
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') return;

  // Picker
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
    base64: false,
  });

  if (!result.canceled) {
    await uploadImage(result.assets[0]);
  }
};

const uploadImage = async (image: ImageAsset) => {
  setUploading(true);
  
  // Upload vers Supabase Storage
  const fileName = `${Date.now()}_${image.fileName}`;
  const { data, error } = await supabase.storage
    .from('messages-media')
    .upload(fileName, {
      uri: image.uri,
      type: 'image/jpeg',
      name: fileName,
    });

  if (error) {
    console.error('Upload error:', error);
    setUploading(false);
    return;
  }

  // Récupérer URL publique
  const { data: { publicUrl } } = supabase.storage
    .from('messages-media')
    .getPublicUrl(fileName);

  // Envoyer message avec image
  await sendMessage({
    conversationId,
    content: '',
    type: 'image',
    mediaUrl: publicUrl,
  });

  setUploading(false);
};
```

**Tâches Jour 6** :

- [ ] Implémenter image picker (mobile + web)
- [ ] Upload vers Supabase Storage
- [ ] Afficher preview images dans chat
- [ ] Lightbox pour zoom images
- [ ] Compression automatique (< 1MB)

---

### Jour 7 : Messages Vocaux (Mercredi)

#### Voice Recording

```typescript
import { Audio } from 'expo-av';
import { KawaiiButton } from '@imuchat/ui-kit';

const [recording, setRecording] = useState<Audio.Recording | null>(null);
const [isRecording, setIsRecording] = useState(false);

const startRecording = async () => {
  const { status } = await Audio.requestPermissionsAsync();
  if (status !== 'granted') return;

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });

  const { recording } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );

  setRecording(recording);
  setIsRecording(true);
};

const stopRecording = async () => {
  if (!recording) return;

  setIsRecording(false);
  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();

  // Upload audio
  if (uri) {
    await uploadVoiceNote(uri);
  }
  
  setRecording(null);
};

// UI
<KawaiiButton
  onPressIn={startRecording}
  onPressOut={stopRecording}
  icon="🎤"
  variant={isRecording ? 'danger' : 'secondary'}
>
  {isRecording ? 'Relâcher pour envoyer' : 'Maintenir pour enregistrer'}
</KawaiiButton>
```

**Tâches Jour 7** :

- [ ] Implémenter enregistrement audio
- [ ] Upload vers Supabase Storage
- [ ] Player audio dans chat bubbles
- [ ] Waveform animation
- [ ] Durée enregistrement (max 2min)

---

### Jour 8 : Polish Chat + Tests (Jeudi)

**Tâches** :

- [ ] Édition messages (< 15min)
- [ ] Suppression messages
- [ ] Améliorer scroll auto (nouveaux messages)
- [ ] Tests typing, réactions, médias
- [ ] Performance optimization (pagination)

**Livrables** : Chat complet production-ready ✅

---

## 📅 SEMAINE 3 : Backend Critical + Tests + Démo (5 jours)

### Jour 9-10 : Endpoints Backend Critiques (Lundi-Mardi)

**Endpoints à créer** :

```typescript
// platform-core/src/routes/notifications.ts
POST /api/v1/notifications/register-token
POST /api/v1/notifications/send

// platform-core/src/routes/media.ts  
POST /api/v1/media/upload-url       // Presigned URL sécurisée
POST /api/v1/media/confirm-upload   // Validation upload
```

**Tâches Jours 9-10** :

- [ ] Créer routes notifications
- [ ] Créer routes media (presigned URLs)
- [ ] Tests API endpoints
- [ ] Documentation OpenAPI

---

### Jour 11-12 : Tests End-to-End (Mercredi-Jeudi)

**Scénarios à tester** :

1. **Auth Flow**
   - [ ] Signup → Email → Login
   - [ ] Forgot password → Reset
   - [ ] Session persistence

2. **Chat Flow**
   - [ ] Créer conversation
   - [ ] Envoyer texte, image, audio
   - [ ] Réactions temps réel
   - [ ] Typing indicators

3. **Calls Flow**
   - [ ] Appel audio (2 devices)
   - [ ] Appel vidéo (2 devices)
   - [ ] Historique appels

4. **Notifications**
   - [ ] Push foreground
   - [ ] Push background
   - [ ] Deep linking (ouvrir chat)

5. **Cross-Platform**
   - [ ] Message mobile → web
   - [ ] Appel web → mobile
   - [ ] Sync real-time

---

### Jour 13 : Préparation Démo + Documentation (Vendredi)

**Tâches** :

- [ ] Screencast démo (5 min)
- [ ] Documentation utilisateur
- [ ] Guide déploiement
- [ ] Présentation slides

**Livrables** : MVP complet déployable ✅

---

## 📋 Checklist MVP Complet

### Frontend ✅

- [x] Auth (login, signup, forgot password)
- [x] Chat (liste conversations, chat room)
- [ ] Appels (incoming, active, history)
- [ ] Notifications (permission, display)
- [ ] Typing indicators
- [ ] Réactions messages
- [ ] Upload images
- [ ] Messages vocaux
- [ ] Édition/suppression messages

### Backend ✅

- [x] Supabase Auth
- [x] Supabase Realtime (chat)
- [x] Stream API (4 endpoints)
- [ ] Notifications API (2 endpoints)
- [ ] Media API (2 endpoints)

### UI/UX ✅

- [ ] Thème dark/light (ui-kit)
- [ ] Animations transitions
- [ ] Mascotte ImuChat intégrée
- [ ] i18n (FR, EN)
- [ ] Responsive design

### Tests ✅

- [ ] Unit tests (hooks)
- [ ] Integration tests (API)
- [ ] E2E tests (flows critiques)
- [ ] Performance tests

### Déploiement 🚀

- [ ] Web (Vercel)
- [ ] Mobile (TestFlight/Play Console Beta)
- [ ] Backend (Railway/Fly.io)
- [ ] Monitoring (Sentry)

---

## 🎯 Résumé Timeline

```
SEMAINE 1 (Jours 1-4)   : Appels Vidéo + Notifications UI
SEMAINE 2 (Jours 5-8)   : Features Chat Avancées
SEMAINE 3 (Jours 9-13)  : Backend Endpoints + Tests + Démo

TOTAL: 13 jours = MVP Complet ✅
```

---

## 📦 Intégration UI-Kit - Guide Rapide

### Installation

**Mobile** :

```bash
cd mobile
pnpm add @imuchat/ui-kit
```

**Web** :

```bash
cd web-app
pnpm add @imuchat/ui-kit
```

### Configuration Thème

```typescript
// mobile/app/_layout.tsx
import { ThemeProvider } from '@imuchat/ui-kit/themes';
import { I18nProvider } from '@imuchat/ui-kit/i18n';

export default function RootLayout() {
  return (
    <I18nProvider locale="fr">
      <ThemeProvider theme="kawaii">
        <Stack />
      </ThemeProvider>
    </I18nProvider>
  );
}
```

### Utilisation Composants

```typescript
// Exemple complet avec composants ui-kit
import {
  ChatBubble,
  ChatInput,
  TypingIndicator,
  EmojiReaction,
  UserAvatar,
  KawaiiButton,
  ImuMascot,
} from '@imuchat/ui-kit';

function ChatScreen() {
  return (
    <>
      {messages.map(msg => (
        <ChatBubble 
          key={msg.id}
          message={msg}
          onLongPress={() => showReactions(msg.id)}
        >
          {msg.reactions.map(r => (
            <EmojiReaction emoji={r.emoji} count={r.count} />
          ))}
        </ChatBubble>
      ))}

      <TypingIndicator users={typingUsers} />
      
      <ChatInput onSubmit={sendMessage} />
      
      <ImuMascot animation="listening" />
    </>
  );
}
```

---

## 🚀 Prochaine Action IMMÉDIATE

**1. Configurer credentials platform-core (15-20min)** 🔴 BLOQUANT

```bash
cd platform-core
# Voir docs/QUICK_START.md pour :
# - Firebase Service Account
# - Supabase Service Role Key  
# - JWT Secret
```

**2. Commencer Jour 1 - CallIncoming Screen (MAINTENANT)**

```bash
# Créer les fichiers
touch mobile/app/call/incoming.tsx
touch web-app/src/app/call/incoming/page.tsx

# Copier les templates ci-dessus
# Tester avec Stream API backend
```

---

**📅 Date de fin estimée** : 7 mars 2026 (3 semaines)  
**🎯 Objectif** : MVP déployable avec Auth + Chat + Calls + Notifications  
**🎨 Avantage** : UI-Kit prêt = gain 40% temps développement UI

---

**Prêt à commencer ? Let's go! 🚀**
