# Progression Mobile vs MVP Roadmap

## 2. Progression Mobile vs MVP Roadmap

### Semaine 1 — Fondations & Setup

| Feature MVP | Mobile | Web |
|-------------|--------|-----|
| Supabase (DB + Auth + Storage) | ✅ | ✅ |
| Stream Video SDK | ⚠️ Token placeholder | ✅ |
| Firebase Push | ✅ Expo Notifications | ✅ FCM |
| Schema DB déployé | ✅ | ✅ |
| Design System / composants UI | ✅ ThemeProvider + ui-kit | ✅ shadcn/ui + 8 thèmes |
| Navigation structure | ✅ 10 tabs expo-router | ✅ Next.js App Router |

### Semaine 2 — Auth & Profils

| Feature MVP | Mobile | Web |
|-------------|--------|-----|
| Login email/password | ✅ | ✅ |
| Signup | ✅ | ✅ |
| Forgot password | ✅ | ✅ |
| OAuth (Google/Discord) | ❌ | ✅ |
| Session persistence | ✅ AsyncStorage | ✅ Cookies SSR |
| Middleware auth protection | ✅ Segment-based | ✅ SSR middleware |
| Profil view/edit | ✅ | ✅ |
| Avatar upload | ✅ | ✅ |
| Écran Welcome/Onboarding | ❌ | ❌ |

### Semaine 3 — Messagerie Base

| Feature MVP | Mobile | Web |
|-------------|--------|-----|
| Liste conversations (réelle) | ✅ Supabase | ✅ API + fallback mock |
| Chat room texte temps réel | ✅ Supabase Realtime | ✅ Socket.IO |
| Envoi/réception messages | ✅ | ✅ |
| Infinite scroll / pagination | ✅ | ✅ |
| Typing indicator | ✅ Broadcast | ✅ Supabase Realtime |
| Pull-to-refresh | ❌ | N/A |
| Swipe actions (archive/delete) | ❌ | N/A |
| FAB "New Chat" | ❌ | ✅ |
| Image upload (caméra/galerie) | ✅ | ✅ Drag & drop |
| Video upload | ✅ | ✅ |
| Lightbox/preview | ✅ Fullscreen + pinch-zoom | ✅ Zoom/pan/download |

### Semaine 4 — Messagerie Avancée

| Feature MVP | Mobile | Web |
|-------------|--------|-----|
| Voice messages (record + play) | ✅ Hold-to-record, waveform, speed | ✅ MediaRecorder, waveform |
| Edit messages | ❌ Pas d'UI | ✅ API + socket + UI optimiste |
| Delete messages | ❌ Pas d'UI | ✅ Soft delete |
| Reactions emoji | ✅ Long-press + count + reactors | ✅ Supabase Realtime |
| Emoji picker | ❌ | ✅ 1083 lignes, skin-tone |
| GIF picker (GIPHY) | ❌ | ✅ Intégration GIPHY |
| Reply to message | ❌ | ✅ |
| Forward message | ❌ | ✅ |
| Message context menu | ❌ (long-press → reactions only) | ✅ Right-click menu complet |
| Rich text / Markdown | ❌ | ✅ Toolbar + renderer |

### Semaine 5-6 — Appels Audio/Vidéo

| Feature MVP | Mobile | Web |
|-------------|--------|-----|
| Bouton appel audio | ✅ | ✅ |
| Bouton appel vidéo | ✅ | ✅ |
| Stream Video intégration | ⚠️ Token placeholder, Expo Go incompatible | ✅ Fonctionnel |
| Call signaling | ✅ Supabase Realtime | ✅ Stream SDK |
| Incoming call modal | ✅ | ✅ |
| Call controls (mute/cam/hang) | ✅ | ✅ |
| Call history | ✅ Supabase `call_events` | ✅ |
| Screen sharing | ❌ | ✅ |
| CallKit (iOS) / ConnectionService | ❌ | N/A |

### Semaine 7 — UX Polish

| Feature MVP | Mobile | Web |
|-------------|--------|-----|
| Push notifications | ✅ Expo Notifications | ✅ FCM + Desktop |
| Thèmes (dark/light) | ✅ Toggle | ✅ 8 thèmes + density |
| Search | ❌ | ⚠️ Chat only |
| Offline mode | ❌ | ✅ IndexedDB queue |
| Onboarding | ❌ | ❌ |
| i18n (fr/en/ja) | ✅ i18n-js | ✅ next-intl |

### Features secondaires (Social, Store, Watch)

| Feature | Mobile | Web |
|---------|--------|-----|
| Social feed | 🔲 UI mock 100% | ⚠️ UI + queries Supabase → fallback mock |
| Store | 🔲 UI mock 100% | ⚠️ Module registry + mock |
| Watch parties | 🔲 UI mock 100% | ⚠️ UI + queries Supabase → fallback mock |

---

## 3. Comparatif synthétique Mobile vs Web

| Domaine | Mobile | Web | Écart |
|---------|--------|-----|-------|
| **Auth** | ✅ (email) | ✅ (email + OAuth) | Web +2 providers OAuth |
| **Chat core** | ✅ | ✅ | Parité |
| **Chat avancé** | ⚠️ Reactions seul | ✅ Edit/Delete/Reply/Forward/GIF/Emoji/Rich text | **Web >> Mobile** |
| **Media** | ✅ | ✅ | Parité |
| **Appels** | ⚠️ Token manquant | ✅ | Web > Mobile |
| **Contacts** | ✅ | ✅ | Parité |
| **Notifications** | ⚠️ Fallback mock | ✅ | Web > Mobile |
| **Settings** | ✅ (1004 lignes) | ✅ | Parité |
| **Profil** | ✅ | ✅ | Parité |
| **i18n** | ✅ (320 clés) | ✅ (2300 clés) | Web >> Mobile (volume) |
| **Thèmes** | ✅ Dark/Light | ✅ 8 thèmes + density | Web >> Mobile |
| **Offline** | ❌ | ✅ | Web > Mobile |
| **Search** | ❌ | ⚠️ Chat scope | Web > Mobile |
| **Tests** | ⚠️ 24 fichiers | ⚠️ Couverture similaire | Parité |
| **Stores Zustand** | ❌ Vide | ✅ Notifications store | Web > Mobile |
| **Modules/Scale** | ~15 écrans | 37 modules, 120 pages, 1086 fichiers | Web >>> Mobile |

---

## 4. Priorités pour rattraper le mobile

Les **lacunes critiques** du mobile par rapport au MVP et à la web-app :

1. **Edit/Delete messages** — Non implémenté côté mobile (backend déjà prêt via API REST)
2. **Emoji picker** — Absent sur mobile
3. **Reply/Forward** — Absent sur mobile
4. **Stream Video token** — Placeholder bloque les appels réels
5. **OAuth (Google/Apple)** — Absent sur mobile
6. **Offline queue** — Absent sur mobile
7. **Search** — Aucune recherche sur mobile
8. **Notifications écran** — Fallback mock, connecter à l'API réellement
