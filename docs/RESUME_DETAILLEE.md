Résumé détaillé & exhaustif — ImuChat (mobile)

Stack cible : React Native + Expo (TypeScript) — app mobile première, partage maximal de design system / logique avec le web.
Ce document synthétise la vision produit, l’architecture UI et backend, l’ensemble des modules / mini-apps, les décisions techniques clés, les modèles de données essentiels, la sécurité, l’expérience hors-ligne, la monétisation et une roadmap priorisée (phases & livrables). Tu peux l’utiliser comme cahier de bord pour l’équipe produit / design / dev.

1. Vision produit (one-liner)
ImuChat = un hub social immersif, thématisable (inspiré mangas/animes), modulable via un Store d’apps/thèmes, combinant chat instantané, communautés riches, multimédia (Watch/Party), mini-apps utiles (SmartHome, Mobility, Office) et une IA contextuelle pour aider, résumer et automatiser.

2. Valeurs & principes UX

* Immersion & personnalisation : thèmes, fonds animés, ambiances sonores, éditeur de thèmes.
* Modularité : mini-apps installables/uninstallables (Store).
* Social first : Stories, Mémos, Watch Parties, guildes.
* Performance & offline : UX fluide sur appareils milieu de gamme, file d’envoi locale.
* Sécurité & confidentialité : E2EE optionnel, contrôles granularisés, consentements IA.
* Accessibilité & internationalisation : respect Reduce Motion, VoiceOver/TalkBack, i18n.

1. Expérience & Flux principaux (mobile)
Bottom tabs (Expo Router) :Home (hub) — Chats (snapview) — Social (réseaux sociaux) — Watch (VOD/Party) — Store — Profile (wallet, settings).
Principaux écrans & interactions : Home hub réordonnable; Snapview (fil fullscreen + rail stories); Conversations list; Chat thread (virtualisé); Composer (texte, emoji, pièces jointes, voice memo UI); Drawer informations (membres, pins, médias); Lightbox media; Watch Party room (video + chat + sync).

2. Modules / Mini-apps (catalogue)
Core (par défaut) : Chats, Appels (audio/video), Contacts, Communautés (Comms), Store (apps+contenus), Profil/Wallet.Social & média : Feed vidéo, News, Podcasts, Watch Party, Clips.Vie quotidienne : Smart Home, Mobility (covoiturage, EV management), Style & Beauté, Office suite (Docs/Sheets/Slides/PDF).Créatif : Design editor (canva-like), Media editor, Thèmes creator.Productivité : Tasks, Events/Agenda, Files/Drive.IA : Assistant conversationnel, agents/personas, tools (summaries, actions).Toutes ces briques sont modulaires (Store) mais peuvent être proposées par défaut en MVP réduit.

3. Design System & Thèmes (implémentation)

* Tokens globaux (fournis) : couleurs, typo, radius, spacing, elevation, fxLevel.
* Themes : Day/Night + palettes officielles (Imu Neo Violet, Sakura Pink, Lofi Dark, Cyber Neon, Zen Green).
* ThemeProvider + useTheme() (Context) pour consommer tokens.
* Layout Editor pour personnaliser disposition & densité par utilisateur.
* Ambiances sonores : player global, playlists thématiques, crossfade & mute automatique sur événement (appel/vocal).
(Tu as déjà un tokens.ts prêt à l’emploi.)

1. UI — Structure détaillée / composants centraux
Sections principales d’un écran Chat (desktop & mobile adapted) :
1. LeftSidebar (Conversations list / quick create / stories rail)
1. Header (titre, présence, actions)
1. Canvas central (MessageList virtualisée — bulles, date separators, effects overlay)
1. Footer / Composer (textarea, emoji, attachments, voice recorder)
1. RightPanel (Sidekick) (Details / Members / Pins / Media / AI actions)
Composants clés (à implémenter en Storybook) : ConversationsList, ChatHeader, MessageList, MessageBubble, Composer, AttachmentPicker, VoiceRecorderUI, ReactionBar, SidekickTabs, Lightbox, QuickCreateModal, ViewModeSwitcher.

1. Data models (essentiel) — résumé Mongoose/TS

* User: id, username, avatars, profiles (public/private), settings, devices.
* Conversation: id, kind (dm|group), members[], settings (muted, ephemeralTTL, e2eeFlag), lastMessageRef.
* Message: id, conversationId, authorId, type (text,image,video,audio,file,sticker,poll,payment,invite), content (typed), reactions[], replyTo, createdAt, editedAt, deliveryStatus.
* Thread (AI conversations / subthreads): agentId, messages[], status.
* Server: id, name, banner, channels[], roles[], rules.
* StoreItem: id, kind (app/content/service/bundle), metadata, pricing, assets.
* Wallet / Transaction: userId, balance(ImuCoin), history entries (type, amount, status).
* Theme: id, owner, tokens, assets, price.
* Preferences: userId, deviceId, chat layout prefs (we produced API /model).
(Des modèles Mongoose TS ont été proposés antérieurement pour AI — à réutiliser.)

1. API & synchronisation temps-réel

* REST / GraphQL pour CRUD, store, assets.
* Realtime : WebSocket / Socket.IO (events: message.created, message.updated, typing, read, reaction, conversation.updated).
* Media : upload → pre-signed S3, transcode server side (thumbs), CDN.
* Calls / video : WebRTC signalling + SFU (Janus / mediasoup / Jitsi / Twilio with selective forwarding).
* AI endpoints : /api/ai/invoke, /api/ai/tools/* (OpenAPI spec ready earlier).
* Pref API : /api/chat/prefs (we included Next.js App Router example).

1. Backend & Infra (haut niveau)

* API backend : Node.js with Next.js (App Router) or Express/NestJS.
* DB : MongoDB (Mongoose) for primary data; use PostgreSQL for relational needs if needed.
* Vector DB / embeddings : Pinecone / pgvector for semantic search & memories.
* Storage : S3 + CDN.
* Realtime : Socket.IO on Node / managed service (Ably/Pusher) for scale.
* Media servers : Janus / mediasoup for group calls, or use commercial (Twilio, Agora).
* Auth : JWT + refresh tokens, 2FA, optional SSO (Apple/Google).
* Monitoring : Sentry, Prometheus/Grafana, APM.
* CI/CD : GitHub Actions → EAS for Expo builds, codepush/EAS updates.
* Compliance : GDPR, data residency options.

1. Security, privacy & compliance

* Auth & sessions: secure token storage, refresh, session listing.
* Encryption: TLS everywhere; optional E2EE for private conversations (Signal protocol libs).
* PII handling: PII minimization, opt-in data collection, KYC only if finance flows enabled.
* Audit logging: actions admin, finance operations.
* Consent & IA: explicit consent for memory storage & tools; privacy center to view/delete memories.
* Content moderation: human + IA filters, report flows, trust & safety workflows.

1. Offline / sync strategy

* Local cache (SQLite / MMKV) of recent conversations, messages, attachments metadata.
* Outbox queue for sends while offline; optimistic UI updates.
* Sync strategy: incremental pulls with updatedAt cursors; conflict resolution: last writer wins + server hints.
* Media offline: users can mark media for offline use (downloaded assets).

1. IA & Agents

* Assistant global (dock bottom sheet) : résumé de conversation, extractions TODO, planification, traduction.
* Agents/tools : storeable skills (store.install, store.query).
* Prompts system : personas (Imu Assistant, Store Concierge, Home Butler...).
* Memory: scoping user/org/project, TTL, optional vector embeddings.
* Safety: tool audit logs, human in the loop for risky actions.

1. Calls & Media (UX + tech)

* Modes : audio-only (compact/mid/full), video (PiP & full).
* Group calls: lightweight voice channels + scheduled rooms.
* Watch Party: synchronized video (YouTube/embed) with chat & reaction overlay; leader controls (play/pause/seek).
* Transcoding + adaptive streaming.

1. Monetisation & economy

* Wallet (ImuBank) : balances (ImuCoin, fiat), purchase/withdraw flows.
* ImuInvest / GroupFunds / ImuCrypto (longer term).
* Store monetization : paid themes, packs, mini-apps, subscriptions.
* Freemium : premium subscription tiers unlocking features (higher upload limits, premium themes, ad-free, advanced AI).
* Payments : Stripe/ApplePay/GooglePay + web alternatives.

1. Testing, QA & observability

* Component tests : Jest + React Native Testing Library.
* E2E : Detox / Playwright for app flows.
* Visual regressions : Storybook + Chromatic.
* Load tests : k6 for API & signaling.
* Monitoring : Sentry (crashes), analytics events standardised (mixpanel/Amplitude).

1. Privacy & legal considerations

* Data retention policies, user data download & deletion.
* Terms for Store purchases & refunds.
* Age restrictions for Dating & certain content.
* Third-party content licensing (music / streaming / themes).

1. Roadmap priorisé (phases & livrables — sans durée)
Phase MVP (S1) — Shell + Chats de base (mobile)

* Bottom Tabs, Home minimal, Conversations list, Snapview Chat (message list), Composer (text/attachments UI), VoiceRecorder UI, Theme tokens & ThemeProvider, local cache/offline outbox, Storybook + basic tests, push notifications basic.
Phase Core (S2)
* Media viewer, Lightbox, Threads & reactions, Drawer sidekick (details, members, pins), Search in-thread, Prefs layout, Store hub UI (non-monetized), Watch Party lite.
Phase Growth (S3)
* Push polish (IA chips, assistant lite), Calls (audio/video), Stories & Memos, Store monetization (purchases), Wallet basics, moderation tools, advanced offline sync.
Phase Expansion (S4+)
* Guild/Comms advanced, Office mini-apps, SmartHome & Mobility integrations, full AI agents & tools, crypto/economy features, multi-tenant enterprise features.

1. Metrics de succès (KPIs)

* Crash free users %, TTI, cold start, FPS scroll (target 60 on mid devices), message send latency (UI), push open rate, retention D1/D7/D30, conversion « Store ».

1. Dossier technique / recommandations rapides

* Routing: Expo Router (app/(tabs)/...) — structure fournie.
* Listes lourdes: FlashList (Shopify) ou RecyclerListView pour perf.
* State: React Query (server state) + Zustand/Redux Toolkit (local UI state).
* WebRTC / SFU: mediasoup/Janus or third-party (Agora/Twilio) selon budget.
* CI / Releases: GitHub Actions -> EAS build/submit -> staged rollouts.
* Feature flags: LaunchDarkly / simple remote config.

1. Artefacts livrables (ce que te recommande d’avoir dès le départ)

* tokens.ts + ThemeProvider + few example components (Button, Card, ChatBubble).
* Storybook with all core components & states (empty/loading/error/long).
* Expo starter with tabs structure (app/(tabs)/) + mock data.
* API spec (OpenAPI) for core endpoints (chat, prefs, store, auth).
* DB schemas Mongoose / TypeScript interfaces for basic entities.
* Implementation checklist (P0/P1/P2) + test plan.

1. Prochaines étapes conseillées (actionables)
1. Installer Design Tokens + ThemeProvider + Storybook.
1. Créer starter Expo repo avec app/(tabs) skeleton, mock data and ConversationsList + ChatSnapview screens.
1. Build minimal backend mock (or local JSON) + local offline queue.
1. Implement push notifications dev flow (FCM/APNs).
1. Add WebSocket simple echo server to iterate real-time UI.
1. Add Storybook visual tests then start mobile user testing.

TL;DR
ImuChat mobile = un produit ambitieux mais modulaire : commence par des fondations solides (design tokens, themes, offline, real-time pipe) → MVP chat/voice/ui → enrichis par Store & IA → élargis au reste des mini-apps. L’approche recommandée : développer par modules, storybook-drive, feature flags, et itérations rapides avec des mocks côté serveur.
