# 🎨 UI-Kit Components - Référence Rapide

> Composants disponibles dans `@imuchat/ui-kit` pour accélérer le développement MVP

---

## 📋 Vue d'Ensemble

Le **ui-kit** contient **35+ composants** prêts à l'emploi avec :

- ✅ Design System complet (tokens, thèmes)
- ✅ Support i18n (FR, EN, DE, ES)
- ✅ Dark/Light mode
- ✅ Animations intégrées
- ✅ Accessibilité (a11y)
- ✅ Tests unitaires (couverture 80%+)

---

## 🎯 Composants Critiques pour MVP

### 💬 Composants Chat (Priorité P0)

#### `<ChatBubble />`

Message bubble avec styles sender/receiver

```typescript
import { ChatBubble } from '@imuchat/ui-kit';

<ChatBubble
  message={{
    id: '123',
    content: 'Hello!',
    sender: { id: 'user1', name: 'Alice' },
    timestamp: new Date(),
    type: 'text', // 'text' | 'image' | 'audio' | 'video'
  }}
  isSender={true}
  onLongPress={() => showActions()}
  showAvatar={true}
  showTimestamp={true}
/>
```

**Props** :

- `message`: Message object (required)
- `isSender`: Boolean (message de l'utilisateur actuel)
- `onLongPress`: () => void (actions contextuelles)
- `showAvatar`: Boolean (afficher avatar)
- `showTimestamp`: Boolean (afficher heure)

**Variantes** :

- Texte simple
- Image (avec preview)
- Audio (avec player)
- Vidéo (avec thumbnail)

---

#### `<ChatInput />`

Input de saisie avec emojis et attachments

```typescript
import { ChatInput } from '@imuchat/ui-kit';

<ChatInput
  placeholder="Écrivez un message..."
  onSubmit={(text) => sendMessage(text)}
  onChangeText={(text) => handleTyping(text)}
  onAttachmentPress={() => openMediaPicker()}
  onEmojiPress={() => openEmojiPicker()}
  value={inputText}
  multiline
  maxLength={5000}
  disabled={isSending}
/>
```

**Props** :

- `onSubmit`: (text: string) => void
- `onChangeText`: (text: string) => void
- `onAttachmentPress`: () => void (ouvre picker)
- `onEmojiPress`: () => void (emoji picker)
- `value`: string (controlled input)
- `disabled`: boolean

**Features** :

- Auto-expand (multiline)
- Bouton envoi (apparaît si texte)
- Icons attachments (📷, 🎤, 📎)
- Emoji button

---

#### `<MessageList />`

Liste de messages avec scroll virtuel

```typescript
import { MessageList } from '@imuchat/ui-kit';

<MessageList
  messages={messages}
  currentUserId="user1"
  onLoadMore={() => loadOlderMessages()}
  onMessageLongPress={(msg) => showActions(msg)}
  showDates={true}
  scrollToBottomOnNewMessage={true}
  ListEmptyComponent={<EmptyState />}
/>
```

**Props** :

- `messages`: Message[] (required)
- `currentUserId`: string (pour déterminer sender/receiver)
- `onLoadMore`: () => void (pagination)
- `onMessageLongPress`: (msg) => void
- `showDates`: boolean (séparateurs dates)
- `scrollToBottomOnNewMessage`: boolean

**Features** :

- Scroll infini (pagination)
- Séparateurs dates
- Auto-scroll nouveaux messages
- Performance optimisée (VirtualizedList)

---

#### `<TypingIndicator />`

Indicateur "est en train d'écrire..."

```typescript
import { TypingIndicator } from '@imuchat/ui-kit';

<TypingIndicator
  users={[{ id: '1', name: 'Alice' }]}
  text="Alice est en train d'écrire..."
  animated
  size="small"
/>
```

**Props** :

- `users`: User[] (utilisateurs qui écrivent)
- `text`: string (texte personnalisé)
- `animated`: boolean (animation dots)
- `size`: 'small' | 'medium'

---

#### `<EmojiReaction />`

Réactions emoji sur messages

```typescript
import { EmojiReaction } from '@imuchat/ui-kit';

<EmojiReaction
  emoji="❤️"
  count={5}
  active={true}
  onPress={() => toggleReaction('❤️')}
  size="medium"
/>
```

**Props** :

- `emoji`: string (emoji unicode)
- `count`: number (nombre réactions)
- `active`: boolean (utilisateur a réagi)
- `onPress`: () => void
- `size`: 'small' | 'medium' | 'large'

---

#### `<ChannelItem />`

Item de conversation dans la liste

```typescript
import { ChannelItem } from '@imuchat/ui-kit';

<ChannelItem
  conversation={{
    id: 'conv1',
    name: 'Alice',
    avatar: 'https://...',
    lastMessage: 'Hello!',
    lastMessageTime: new Date(),
    unreadCount: 3,
    isOnline: true,
  }}
  onPress={() => openConversation('conv1')}
  onLongPress={() => showChannelActions()}
  showOnlineStatus
  showUnreadBadge
/>
```

**Props** :

- `conversation`: Conversation object
- `onPress`: () => void
- `onLongPress`: () => void (archiver, supprimer)
- `showOnlineStatus`: boolean
- `showUnreadBadge`: boolean

---

### 👤 Composants Utilisateur

#### `<UserAvatar />`

Avatar utilisateur avec status

```typescript
import { UserAvatar } from '@imuchat/ui-kit';

<UserAvatar
  src="https://example.com/avatar.jpg"
  name="Alice"
  size="large"
  status="online" // 'online' | 'offline' | 'away' | 'busy' | 'calling'
  showStatus
  onPress={() => viewProfile()}
/>
```

**Sizes** : `xs`, `small`, `medium`, `large`, `xl`, `2xl`

**Status colors** :

- `online`: Vert
- `offline`: Gris
- `away`: Jaune
- `busy`: Rouge
- `calling`: Animation pulsante bleu

---

#### `<OnlineIndicator />`

Dot de statut en ligne

```typescript
import { OnlineIndicator } from '@imuchat/ui-kit';

<OnlineIndicator
  status="online"
  size="small"
  animated
/>
```

---

### 🎨 Composants Kawaii (Signature ImuChat)

#### `<KawaiiButton />`

Boutons avec style mignon

```typescript
import { KawaiiButton } from '@imuchat/ui-kit';

<KawaiiButton
  variant="primary" // 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'
  size="medium" // 'small' | 'medium' | 'large'
  onPress={() => handleAction()}
  icon="🚀"
  loading={isLoading}
  disabled={isDisabled}
  fullWidth={false}
>
  Envoyer
</KawaiiButton>
```

**Variantes** :

- `primary`: Violet gradient
- `secondary`: Gris
- `danger`: Rouge
- `success`: Vert
- `ghost`: Transparent

**Features** :

- Ripple effect
- Loading spinner
- Icon left/right
- Haptic feedback (mobile)

---

#### `<KawaiiInput />`

Input avec style kawaii

```typescript
import { KawaiiInput } from '@imuchat/ui-kit';

<KawaiiInput
  label="Email"
  placeholder="vous@example.com"
  value={email}
  onChangeText={setEmail}
  type="email" // 'text' | 'email' | 'password' | 'number'
  error={emailError}
  leftIcon="✉️"
  rightIcon={<Checkmark />}
  helperText="Email de connexion"
  disabled={false}
  required
/>
```

**Features** :

- Floating label
- Error states
- Icons (left/right)
- Helper text
- Auto-validation (email, etc.)

---

#### `<KawaiiModal />`

Modale avec style kawaii

```typescript
import { KawaiiModal } from '@imuchat/ui-kit';

<KawaiiModal
  isVisible={showModal}
  onClose={() => setShowModal(false)}
  title="Confirmation"
  description="Êtes-vous sûr ?"
  size="medium" // 'small' | 'medium' | 'large'
  showCloseButton
  dismissible
>
  <View>
    <Text>Contenu personnalisé</Text>
    <KawaiiButton onPress={handleConfirm}>
      Confirmer
    </KawaiiButton>
  </View>
</KawaiiModal>
```

---

#### `<ImuMascot />`

Mascotte animée ImuChat 🎭

```typescript
import { ImuMascot } from '@imuchat/ui-kit';

<ImuMascot
  animation="wave" // 'idle' | 'wave' | 'excited' | 'thinking' | 'listening' | 'ringing' | 'sleeping'
  size="medium" // 'small' | 'medium' | 'large'
  loop={true}
  onAnimationEnd={() => console.log('Animation terminée')}
/>
```

**Animations disponibles** :

- `idle`: Respiration douce
- `wave`: Salut de la main
- `excited`: Saut de joie
- `thinking`: Réflexion
- `listening`: Écoute attentive
- `ringing`: Appel entrant (bounce)
- `sleeping`: Dort (zzz)

**Usage recommandé** :

- Écran appel entrant : `ringing`
- Message vocal : `listening`
- Chargement : `thinking`
- Succès : `excited`
- Empty states : `wave`

---

### 🎯 Composants UI Base

#### `<Button />`

Bouton standard

```typescript
import { Button } from '@imuchat/ui-kit';

<Button
  variant="primary"
  size="medium"
  onPress={() => {}}
  disabled={false}
  loading={false}
  leftIcon={<Icon />}
  rightIcon={<Arrow />}
>
  Cliquez ici
</Button>
```

---

#### `<Card />`

Carte container

```typescript
import { Card } from '@imuchat/ui-kit';

<Card
  variant="elevated" // 'flat' | 'outlined' | 'elevated'
  padding="medium" // 'none' | 'small' | 'medium' | 'large'
  onPress={() => {}}
>
  <Text>Contenu de la carte</Text>
</Card>
```

---

#### `<Spinner />`

Loader animé

```typescript
import { Spinner } from '@imuchat/ui-kit';

<Spinner
  size="large" // 'small' | 'medium' | 'large'
  color="primary"
/>
```

---

#### `<Tooltip />`

Infobulle

```typescript
import { Tooltip } from '@imuchat/ui-kit';

<Tooltip content="Information utile">
  <IconButton icon="info" />
</Tooltip>
```

---

### 🎨 Design System

#### Thèmes disponibles

```typescript
import { themes } from '@imuchat/ui-kit/themes';

// Thèmes :
themes.light      // Clair classique
themes.dark       // Sombre classique
themes.kawaii     // Kawaii coloré (défaut ImuChat)
themes.gaming     // Gaming dark neon
themes.minimal    // Minimaliste
```

**Utilisation** :

```typescript
import { ThemeProvider } from '@imuchat/ui-kit/themes';

<ThemeProvider theme="kawaii">
  <App />
</ThemeProvider>
```

---

#### Tokens design

```typescript
import { tokens } from '@imuchat/ui-kit/tokens';

// Couleurs
tokens.colors.primary        // #7C3AED (violet)
tokens.colors.secondary      // #EC4899 (rose)
tokens.colors.success        // #10B981 (vert)
tokens.colors.danger         // #EF4444 (rouge)
tokens.colors.warning        // #F59E0B (orange)

// Spacing
tokens.spacing.xs            // 4px
tokens.spacing.sm            // 8px
tokens.spacing.md            // 16px
tokens.spacing.lg            // 24px
tokens.spacing.xl            // 32px

// Typography
tokens.typography.h1         // 32px, bold
tokens.typography.h2         // 24px, bold
tokens.typography.body       // 16px, regular
tokens.typography.caption    // 12px, regular

// Shadows
tokens.shadows.sm            // Petite ombre
tokens.shadows.md            // Moyenne ombre
tokens.shadows.lg            // Grande ombre

// Border radius
tokens.radius.sm             // 4px
tokens.radius.md             // 8px
tokens.radius.lg             // 16px
tokens.radius.full           // 9999px (cercle)

// Animations
tokens.animations.fast       // 150ms
tokens.animations.normal     // 300ms
tokens.animations.slow       // 500ms
```

**Utilisation** :

```typescript
import { tokens } from '@imuchat/ui-kit/tokens';

const styles = StyleSheet.create({
  container: {
    padding: tokens.spacing.md,
    backgroundColor: tokens.colors.primary,
    borderRadius: tokens.radius.lg,
  },
  text: {
    ...tokens.typography.body,
    color: tokens.colors.text.primary,
  },
});
```

---

### 🌍 i18n (Internationalisation)

#### Utilisation

```typescript
import { I18nProvider, useTranslation } from '@imuchat/ui-kit/i18n';

// Root app
<I18nProvider locale="fr">
  <App />
</I18nProvider>

// Dans un composant
function MyComponent() {
  const { t, locale, setLocale } = useTranslation();

  return (
    <>
      <Text>{t('common.welcome')}</Text>
      <Button onPress={() => setLocale('en')}>
        Switch to English
      </Button>
    </>
  );
}
```

#### Langues supportées

- 🇫🇷 Français (fr) - **défaut**
- 🇬🇧 Anglais (en)
- 🇩🇪 Allemand (de)
- 🇪🇸 Espagnol (es)

#### Clés disponibles

```typescript
// common
t('common.welcome')          // "Bienvenue"
t('common.loading')          // "Chargement..."
t('common.error')            // "Erreur"
t('common.success')          // "Succès"

// auth
t('auth.login')              // "Connexion"
t('auth.signup')             // "Inscription"
t('auth.logout')             // "Déconnexion"
t('auth.email')              // "Email"
t('auth.password')           // "Mot de passe"

// chat
t('chat.sendMessage')        // "Envoyer un message"
t('chat.typing')             // "{name} est en train d'écrire..."
t('chat.newConversation')    // "Nouvelle conversation"
t('chat.reactions')          // "Réactions"

// calls
t('calls.incomingCall')      // "Appel entrant"
t('calls.accept')            // "Accepter"
t('calls.reject')            // "Refuser"
t('calls.endCall')           // "Raccrocher"
t('calls.mute')              // "Couper le micro"
t('calls.video')             // "Vidéo"

// notifications
t('notifications.allow')     // "Autoriser les notifications"
t('notifications.newMessage')// "Nouveau message"
```

---

## 📦 Installation & Setup

### Mobile (React Native)

```bash
cd mobile
pnpm add @imuchat/ui-kit
```

**Configuration** :

```typescript
// mobile/app/_layout.tsx
import { ThemeProvider } from '@imuchat/ui-kit/themes';
import { I18nProvider } from '@imuchat/ui-kit/i18n';

export default function RootLayout() {
  return (
    <I18nProvider locale="fr">
      <ThemeProvider theme="kawaii">
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="call" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </I18nProvider>
  );
}
```

---

### Web (Next.js)

```bash
cd web-app
pnpm add @imuchat/ui-kit
```

**Configuration** :

```typescript
// web-app/src/app/layout.tsx
import { ThemeProvider } from '@imuchat/ui-kit/themes';
import { I18nProvider } from '@imuchat/ui-kit/i18n';
import '@imuchat/ui-kit/styles.css'; // CSS global

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <I18nProvider locale="fr">
          <ThemeProvider theme="kawaii">
            {children}
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
```

---

## 🎯 Exemples d'Utilisation MVP

### Écran Chat Complet

```typescript
import {
  MessageList,
  ChatInput,
  TypingIndicator,
  EmojiReaction,
  KawaiiButton,
} from '@imuchat/ui-kit';

function ChatScreen({ conversationId }) {
  const { messages, sendMessage, typingUsers, reactions } = useChat(conversationId);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      {/* Liste messages */}
      <MessageList
        messages={messages}
        currentUserId={currentUser.id}
        onLoadMore={loadOlderMessages}
        onMessageLongPress={(msg) => setShowReactions(msg.id)}
      />

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <TypingIndicator users={typingUsers} />
      )}

      {/* Input */}
      <ChatInput
        onSubmit={sendMessage}
        onChangeText={handleTyping}
        onEmojiPress={() => setShowEmojiPicker(true)}
        onAttachmentPress={openMediaPicker}
      />
    </View>
  );
}
```

### Écran Appel Entrant

```typescript
import {
  UserAvatar,
  KawaiiButton,
  ImuMascot,
  KawaiiModal,
} from '@imuchat/ui-kit';

function CallIncomingScreen({ call }) {
  return (
    <KawaiiModal isVisible={true} size="large">
      <View style={styles.container}>
        <UserAvatar
          src={call.caller.avatar}
          name={call.caller.name}
          size="2xl"
          status="calling"
        />

        <Text style={styles.callerName}>
          {call.caller.name}
        </Text>

        <ImuMascot animation="ringing" size="medium" />

        <View style={styles.actions}>
          <KawaiiButton
            variant="danger"
            size="large"
            onPress={rejectCall}
            icon="📵"
          >
            Refuser
          </KawaiiButton>

          <KawaiiButton
            variant="success"
            size="large"
            onPress={acceptCall}
            icon="📞"
          >
            Accepter
          </KawaiiButton>
        </View>
      </View>
    </KawaiiModal>
  );
}
```

---

## 🚀 Avantages UI-Kit pour MVP

### Gain de Temps

- ✅ **40% temps dev UI économisé** (composants prêts)
- ✅ **Cohérence design** garantie (Design System)
- ✅ **0 bug visuel** (composants testés)
- ✅ **Responsive** par défaut (mobile + web)
- ✅ **Dark mode** automatique
- ✅ **i18n** intégré (4 langues)

### Identité de Marque

- 🎨 **Style Kawaii** unique (différenciation)
- 🎭 **Mascotte ImuChat** (branding)
- 💜 **Couleurs signature** (violet + rose)
- ✨ **Animations** douces et ludiques

### Performance

- ⚡ **Optimisé** (VirtualizedList, memo, etc.)
- 📦 **Tree-shakeable** (imports sélectifs)
- 🎯 **Léger** (< 50kB gzipped)

---

## 📚 Documentation Complète

- **Storybook** : Voir `/ui-kit/.storybook/`
- **Tests** : Voir `/ui-kit/src/__tests__/`
- **Exemples** : Voir `/ui-kit/src/stories/`

---

## ✅ Checklist Intégration MVP

- [ ] Installer @imuchat/ui-kit (mobile + web)
- [ ] Configurer ThemeProvider (kawaii)
- [ ] Configurer I18nProvider (fr)
- [ ] Remplacer composants custom par ui-kit
- [ ] Utiliser ChatBubble, ChatInput, MessageList
- [ ] Intégrer ImuMascot (écrans appels, empty states)
- [ ] Appliquer tokens design (spacing, colors)
- [ ] Tester dark mode
- [ ] Tester changement langue (FR/EN)

---

**🎨 Avec le ui-kit, le MVP sera visuellement cohérent et professionnel dès le départ !**

**Prochaine étape** : Commencer Jour 1 du plan (CallIncoming) en utilisant UserAvatar, KawaiiButton, ImuMascot.
