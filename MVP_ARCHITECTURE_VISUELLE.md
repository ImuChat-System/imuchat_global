# 🎨 MVP ImuChat - Architecture Visuelle

> Diagrammes architecturaux et flux features

---

## 📐 Architecture Système Globale

```mermaid
graph TB
    subgraph "Frontend Layer"
        Mobile["📱 Mobile App<br/>React Native + Expo<br/>iOS + Android"]
        Web["🌐 Web App<br/>Next.js 14 SSR"]
        Desktop["🖥️  Desktop App<br/>Electron + React"]
    end
    
    subgraph "Backend Services"
        Supabase["🗄️ Supabase<br/>Auth + DB + Storage + Realtime"]
        Stream["📹 Stream SDK<br/>Video/Audio Calls"]
        Firebase["🔔 Firebase<br/>Push Notifications"]
    end
    
    subgraph "External Services"
        Giphy["😄 GIPHY API<br/>GIFs"]
        Whisper["🎤 Whisper AI<br/>Transcription"]
    end
    
    Mobile --> Supabase
    Mobile --> Stream
    Mobile --> Firebase
    Mobile --> Giphy
    
    Web --> Supabase
    Web --> Stream
    Web --> Firebase
    Web --> Giphy
    
    Desktop --> Supabase
    Desktop --> Stream
    Desktop --> Giphy
    
    Supabase --> Whisper
    
    style Mobile fill:#7C3AED
    style Web fill:#2563EB
    style Desktop fill:#059669
    style Supabase fill:#3ECF8E
    style Stream fill:#005FFF
    style Firebase fill:#FFA000
```

---

## 🗃️ Database Schema (Simplifié MVP)

```mermaid
erDiagram
    PROFILES ||--o{ CONVERSATIONS : member_of
    PROFILES ||--o{ MESSAGES : sends
    PROFILES ||--o{ CALL_LOGS : participates
    PROFILES ||--o{ DEVICES : owns
    
    CONVERSATIONS ||--o{ MESSAGES : contains
    CONVERSATIONS ||--o{ CONVERSATION_MEMBERS : has
    
    MESSAGES ||--o{ MESSAGE_REACTIONS : receives
    
    PROFILES {
        uuid id PK
        string email UK
        string display_name
        string avatar_url
        string bio
        string status_emoji
        timestamp created_at
    }
    
    CONVERSATIONS {
        uuid id PK
        string type
        string name
        timestamp last_message_at
        timestamp created_at
    }
    
    CONVERSATION_MEMBERS {
        uuid id PK
        uuid conversation_id FK
        uuid user_id FK
        timestamp last_read_at
        int unread_count
    }
    
    MESSAGES {
        uuid id PK
        uuid conversation_id FK
        uuid sender_id FK
        string content
        string type
        string media_url
        boolean edited
        boolean deleted
        timestamp created_at
    }
    
    MESSAGE_REACTIONS {
        uuid id PK
        uuid message_id FK
        uuid user_id FK
        string emoji
        timestamp created_at
    }
    
    CALL_LOGS {
        uuid id PK
        uuid caller_id FK
        uuid callee_id FK
        string type
        int duration_seconds
        timestamp start_time
        timestamp end_time
    }
    
    DEVICES {
        uuid id PK
        uuid user_id FK
        string fcm_token
        string platform
        timestamp last_active
    }
```

---

## 🔄 User Journey - Première Utilisation

```mermaid
journey
    title Première Expérience ImuChat (New User)
    section Découverte
      Télécharge app: 5: User
      Voit onboarding (3 slides): 4: User
      Comprend value prop: 5: User
    section Inscription
      Clique "Sign Up": 5: User
      Entre email + password: 4: User
      Vérifie email: 3: User
      Confirme compte: 5: User
    section Configuration
      Upload avatar: 4: User
      Choisit display name: 5: User
      Personnalise thème: 4: User
      Autorise notifications: 3: User
    section Premier Chat
      Cherche contact: 4: User
      Envoie premier message: 5: User
      Reçoit réponse: 5: User
      💜 Réagit avec emoji: 5: User
    section Engagement
      Explore features: 4: User
      Fait premier appel: 5: User
      Invite amis: 4: User
      Devient daily user: 5: User
```

---

## 📊 Timeline Features - 12 Semaines

```mermaid
gantt
    title MVP ImuChat - Roadmap 12 Semaines
    dateFormat YYYY-MM-DD
    section Setup
    Infrastructure & Design System :s1, 2026-02-16, 7d
    
    section Auth & Profiles
    Authentication System :s2a, after s1, 7d
    User Profiles :s2b, after s1, 7d
    
    section Messaging Base
    Conversations List :s3a, after s2a, 7d
    Chat Room (Text) :s3b, after s2a, 7d
    Media Messages :s3c, after s3b, 7d
    
    section Messaging Advanced
    Voice Messages :s4a, after s3c, 7d
    Edit/Delete Messages :s4b, after s3c, 7d
    Reactions :s4c, after s3c, 7d
    GIFs & Emojis :s4d, after s3c, 7d
    
    section Calls
    Audio Calls :s5, after s4a, 7d
    Video Calls :s6a, after s5, 7d
    Screen Sharing :s6b, after s5, 7d
    
    section UX Polish
    Push Notifications :s7a, after s6a, 7d
    Themes :s7b, after s6a, 7d
    Search :s7c, after s6a, 7d
    Offline Mode :s7d, after s6a, 7d
    Onboarding :s7e, after s6a, 7d
    
    section Beta Testing
    Beta Testing & Feedback :s8, after s7a, 7d
    
    section Desktop
    Desktop Base :s9, after s8, 7d
    Desktop Video & Native :s10, after s9, 7d
    
    section Launch Prep
    Polish Multi-Platform :s11, after s10, 7d
    Launch Preparation :crit, s12, after s11, 7d
```

---

## 🔀 Message Flow - Temps Réel

```mermaid
sequenceDiagram
    participant Alice as 📱 Alice (Mobile)
    participant SupaRealtime as 🔄 Supabase Realtime
    participant DB as 🗄️ PostgreSQL
    participant Push as 🔔 Firebase Push
    participant Bob as 📱 Bob (Mobile)
    
    Alice->>SupaRealtime: Envoie "Hello Bob!" 💬
    SupaRealtime->>DB: INSERT message
    DB-->>SupaRealtime: message_id: abc123
    
    SupaRealtime->>Bob: Broadcast new_message
    Bob->>Bob: Affiche message 💬
    
    Note over Alice,Bob: Si Bob offline...
    
    SupaRealtime->>Push: Trigger notification
    Push->>Bob: Push "Alice: Hello Bob!"
    Bob->>Bob: Notif s'affiche 🔔
    
    Bob->>SupaRealtime: Marque comme lu ✅
    SupaRealtime->>DB: UPDATE message.read_at
    SupaRealtime->>Alice: Broadcast message_read
    Alice->>Alice: Double check bleu ✅✅
```

---

## 📞 Call Flow - WebRTC

```mermaid
sequenceDiagram
    participant Alice as 📱 Alice
    participant StreamClient as 📹 Stream Client
    participant StreamServer as 🌐 Stream Backend
    participant Bob as 📱 Bob
    
    Alice->>StreamClient: Clique "Video Call" 📹
    StreamClient->>StreamServer: Create call session
    StreamServer-->>StreamClient: call_id + SDP offer
    
    StreamClient->>Bob: Envoie invitation ⏰
    Bob->>Bob: Sonne 🔔
    
    Bob->>StreamClient: Accept call ✅
    StreamClient->>StreamServer: Join call + SDP answer
    
    StreamServer->>Alice: Établit WebRTC P2P
    StreamServer->>Bob: Établit WebRTC P2P
    
    Note over Alice,Bob: 🎥 Call actif
    
    Alice->>Alice: Toggle mute 🔇
    Alice->>Bob: Update mute state
    
    Bob->>Bob: Active screen share 🖥️
    Bob->>Alice: Stream screen
    
    Alice->>StreamClient: Hang up ❌
    StreamClient->>StreamServer: End call
    StreamServer->>Bob: Call ended
    
    StreamServer->>StreamServer: Log call_log (duration, participants)
```

---

## 🔐 Auth Flow - Supabase

```mermaid
flowchart TD
    Start([User ouvre app]) --> HasSession{Session<br/>valide ?}
    
    HasSession -->|Oui| LoadProfile[Charge profil]
    HasSession -->|Non| ShowWelcome[Écran Welcome]
    
    LoadProfile --> MainApp[🏠 App principale]
    
    ShowWelcome --> Login{Action}
    Login -->|Login| LoginForm[Formulaire Login]
    Login -->|Signup| SignupForm[Formulaire Signup]
    
    LoginForm --> SupaAuth{Supabase Auth}
    SignupForm --> SupaAuth
    
    SupaAuth -->|Success| CreateProfile[Crée profil]
    SupaAuth -->|Error| ShowError[Affiche erreur]
    
    CreateProfile --> SetupProfile[Setup avatar + name]
    SetupProfile --> MainApp
    
    ShowError --> Login
    
    MainApp --> UseApp{User action}
    UseApp -->|Logout| ClearSession[Clear session]
    UseApp -->|Continue| UseApp
    
    ClearSession --> ShowWelcome
    
    style MainApp fill:#7C3AED
    style SupaAuth fill:#3ECF8E
    style ShowError fill:#EF4444
```

---

## 🎨 Component Hierarchy - Mobile

```mermaid
graph TD
    App[App Root] --> NavContainer[Navigation Container]
    
    NavContainer --> AuthStack[Auth Stack]
    NavContainer --> TabsLayout[Tabs Layout]
    
    AuthStack --> Welcome[Welcome Screen]
    AuthStack --> Login[Login Screen]
    AuthStack --> Signup[Signup Screen]
    
    TabsLayout --> ChatsTab[📬 Chats Tab]
    TabsLayout --> CallsTab[📞 Calls Tab]
    TabsLayout --> ProfileTab[👤 Profile Tab]
    
    ChatsTab --> ConversationsList[Conversations List]
    ConversationsList --> ConversationItem[Conversation Item]
    ConversationItem --> Avatar
    ConversationItem --> LastMessage
    ConversationItem --> UnreadBadge
    
    ConversationItem -->|Navigate| ChatScreen[Chat Screen]
    
    ChatScreen --> ChatHeader[Chat Header]
    ChatScreen --> MessagesList[Messages List]
    ChatScreen --> MessageInput[Message Input]
    
    MessagesList --> MessageBubble[Message Bubble]
    MessageBubble --> TextContent
    MessageBubble --> MediaContent
    MessageBubble --> Reactions
    
    MessageInput --> InputField
    MessageInput --> MediaPicker
    MessageInput --> SendButton
    
    CallsTab --> CallsList[Calls History]
    CallsList --> CallItem[Call Item]
    
    CallItem -->|Navigate| CallScreen[Active Call Screen]
    
    CallScreen --> VideoRenderer
    CallScreen --> CallControls
    
    ProfileTab --> ProfileHeader[Profile Header]
    ProfileTab --> SettingsList[Settings List]
    
    style App fill:#7C3AED
    style ChatScreen fill:#2563EB
    style CallScreen fill:#DC2626
```

---

## 🔄 State Management - Stores

```mermaid
graph LR
    subgraph "Zustand Stores"
        AuthStore[🔐 Auth Store<br/>user, session, login, logout]
        ChatsStore[💬 Chats Store<br/>conversations, messages, send]
        CallsStore[📞 Calls Store<br/>active_call, call_state, actions]
        SettingsStore[⚙️ Settings Store<br/>theme, notifications, language]
    end
    
    subgraph "React Query Cache"
        ProfilesCache[👤 Profiles Cache]
        MessagesCache[💬 Messages Cache]
        MediaCache[🖼️ Media Cache]
    end
    
    subgraph "Components"
        ChatScreen[Chat Screen]
        CallScreen[Call Screen]
        ProfileScreen[Profile Screen]
    end
    
    ChatScreen --> ChatsStore
    ChatScreen --> MessagesCache
    
    CallScreen --> CallsStore
    
    ProfileScreen --> AuthStore
    ProfileScreen --> SettingsStore
    ProfileScreen --> ProfilesCache
    
    AuthStore --> SupabaseClient
    ChatsStore --> SupabaseClient
    CallsStore --> StreamClient
    
    SupabaseClient[Supabase Client]
    StreamClient[Stream Client]
    
    style AuthStore fill:#3ECF8E
    style ChatsStore fill:#2563EB
    style CallsStore fill:#DC2626
    style SettingsStore fill:#6366F1
```

---

## 📦 Feature Modules - Architecture

```mermaid
graph TB
    subgraph "Core Modules (Non-removable)"
        ChatEngine[💬 Chat Engine]
        AuthModule[🔐 Auth & User Management]
        ContactsModule[👥 Contacts & Presence]
        NotifModule[🔔 Notifications System]
        ThemeModule[🎨 Theme Engine]
        StoreModule[📦 Store Core]
        MediaModule[🖼️ Media Handler]
    end
    
    subgraph "Feature Modules (MVP)"
        VoiceModule[🎤 Voice Messages]
        CallsModule[📞 Audio/Video Calls]
        ReactionsModule[❤️ Reactions & Emojis]
        SearchModule[🔍 Search]
    end
    
    subgraph "Platform Adapters"
        MobileAdapter[📱 Mobile]
        WebAdapter[🌐 Web]
        DesktopAdapter[🖥️ Desktop]
    end
    
    ChatEngine --> StoreModule
    ChatEngine --> MediaModule
    AuthModule --> StoreModule
    ContactsModule --> StoreModule
    NotifModule --> StoreModule
    ThemeModule --> StoreModule
    
    VoiceModule --> MediaModule
    CallsModule --> ContactsModule
    ReactionsModule --> ChatEngine
    SearchModule --> ChatEngine
    
    MobileAdapter --> ChatEngine
    MobileAdapter --> CallsModule
    WebAdapter --> ChatEngine
    WebAdapter --> CallsModule
    DesktopAdapter --> ChatEngine
    DesktopAdapter --> CallsModule
    
    style ChatEngine fill:#7C3AED
    style AuthModule fill:#3ECF8E
    style CallsModule fill:#DC2626
```

---

## 🚀 Deployment Pipeline

```mermaid
flowchart LR
    Dev[👨‍💻 Developer] -->|Push code| GitHub[GitHub Repo]
    
    GitHub -->|Webhook| CI[🔄 GitHub Actions]
    
    CI --> Tests{Run Tests}
    Tests -->|Pass| Build[Build Apps]
    Tests -->|Fail| Notify[❌ Notify Dev]
    
    Build --> BuildMobile[📱 Mobile<br/>EAS Build]
    Build --> BuildWeb[🌐 Web<br/>Vercel]
    Build --> BuildDesktop[🖥️ Desktop<br/>Electron Builder]
    
    BuildMobile --> TestFlight[TestFlight Beta]
    BuildMobile --> PlayInternal[Play Store Beta]
    
    BuildWeb --> VercelPreview[Vercel Preview]
    BuildWeb --> Production[🌐 imuchat.app]
    
    BuildDesktop --> S3[AWS S3]
    
    TestFlight --> BetaTesters[Beta Testers]
    PlayInternal --> BetaTesters
    VercelPreview --> BetaTesters
    
    BetaTesters -->|Feedback| Sentry[🐛 Sentry]
    BetaTesters -->|Analytics| Posthog[📊 Posthog]
    
    Sentry --> Dev
    Posthog --> ProductTeam[Product Team]
    
    Production --> Users[👥 Users]
    
    style CI fill:#2563EB
    style Production fill:#059669
    style Sentry fill:#EA384D
```

---

## 📊 Metrics Dashboard - KPIs

```mermaid
graph TD
    subgraph "User Metrics"
        DAU[Daily Active Users<br/>Goal: 200+ Semaine 12]
        MAU[Monthly Active Users<br/>Goal: 1000+ Mois 1]
        Retention[D7 Retention<br/>Goal: >30%]
    end
    
    subgraph "Engagement Metrics"
        MessagesSent[Messages Sent<br/>Goal: 10k+ Semaine 12]
        CallsDuration[Calls Duration<br/>Goal: 500h+ Semaine 12]
        SessionLength[Avg Session Length<br/>Goal: >5min]
    end
    
    subgraph "Technical Metrics"
        CrashRate[Crash Rate<br/>Goal: <1%]
        MessageLatency[Message Latency<br/>Goal: <500ms P90]
        CallQuality[Call Quality MOS<br/>Goal: >4.0]
    end
    
    subgraph "Business Metrics"
        NPS[Net Promoter Score<br/>Goal: >30]
        AppStoreRating[App Store Rating<br/>Goal: >4.0]
        CostPerUser[Cost Per User<br/>Goal: <€0.50/month]
    end
    
    Users[👥 Users] --> DAU
    Users --> MAU
    Users --> Retention
    
    DAU --> MessagesSent
    DAU --> CallsDuration
    DAU --> SessionLength
    
    MessagesSent --> MessageLatency
    CallsDuration --> CallQuality
    Users --> CrashRate
    
    Retention --> NPS
    Users --> AppStoreRating
    MessagesSent --> CostPerUser
    
    style DAU fill:#7C3AED
    style MessagesSent fill:#2563EB
    style CrashRate fill:#DC2626
    style NPS fill:#059669
```

---

## 🔒 Security Architecture

```mermaid
graph TB
    subgraph "Client Side"
        MobileApp[📱 Mobile App]
        WebApp[🌐 Web App]
    end
    
    subgraph "Transport Layer"
        TLS[🔒 TLS 1.3 Encryption]
    end
    
    subgraph "Backend Security"
        RLS[🛡️ Row-Level Security<br/>Supabase PostgreSQL]
        JWT[🔑 JWT Tokens<br/>Supabase Auth]
        Storage[📦 Signed URLs<br/>Supabase Storage]
    end
    
    subgraph "Data Encryption"
        E2E[🔐 E2E Encryption<br/>Signal Protocol<br/>(Future v1.1)]
        AtRest[💾 Encryption at Rest<br/>AES-256<br/>PostgreSQL]
    end
    
    MobileApp -->|HTTPS| TLS
    WebApp -->|HTTPS| TLS
    
    TLS --> JWT
    JWT --> RLS
    
    RLS --> AtRest
    Storage --> AtRest
    
    MobileApp -.->|Future| E2E
    WebApp -.->|Future| E2E
    
    style TLS fill:#059669
    style RLS fill:#2563EB
    style JWT fill:#7C3AED
    style E2E fill:#DC2626
```

---

## 🎯 Conclusion Visuelle

### Priorités Architecture

1. **🔐 Security First** : TLS, RLS, JWT dès le début
2. **⚡ Real-time** : Supabase Realtime pour messages instantanés
3. **📹 High Quality Calls** : Stream SDK avec SFU architecture
4. **📱 Mobile-First** : Optimisation performance mobile prioritaire
5. **🌐 Multi-Platform** : Code sharing maximal (types, utils, components)

### Tech Choices Rationale

| Choix | Pourquoi |
|-------|----------|
| **Supabase** | Backend-as-a-Service complet, auth + DB + storage + realtime inclus |
| **Stream SDK** | Solution éprouvée pour calls, scalable, infrastructure gérée |
| **Expo** | Développement mobile rapide, hot reload, OTA updates |
| **Next.js** | SSR pour SEO, performance web, architecture moderne |
| **Electron** | Desktop cross-platform, partage code avec web |
| **TypeScript** | Type-safety, meilleure DX, moins de bugs runtime |

---

**Document créé** : 12 février 2026  
**Version** : 1.0  
**Format** : Mermaid diagrams (rendered in GitHub/VS Code)

---

*🎨 Une image vaut mille mots. Ces diagrammes sont la référence architecture.*
