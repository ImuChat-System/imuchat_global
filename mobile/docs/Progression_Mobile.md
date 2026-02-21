# Progression Mobile vs MVP Roadmap

> **Dernière mise à jour** : 21 février 2026

## 2. Progression Mobile vs MVP Roadmap

### Semaine 1 — Fondations & Setup

| Feature MVP                    | Mobile                    | Web                     |
| ------------------------------ | ------------------------- | ----------------------- |
| Supabase (DB + Auth + Storage) | ✅                        | ✅                      |
| Stream Video SDK               | ⚠️ Token placeholder      | ✅                      |
| Firebase Push                  | ✅ Expo Notifications     | ✅ FCM                  |
| Schema DB déployé              | ✅                        | ✅                      |
| Design System / composants UI  | ✅ ThemeProvider + ui-kit | ✅ shadcn/ui + 8 thèmes |
| Navigation structure           | ✅ 10 tabs expo-router    | ✅ Next.js App Router   |

### Semaine 2 — Auth & Profils

| Feature MVP                | Mobile                     | Web               |
| -------------------------- | -------------------------- | ----------------- |
| Login email/password       | ✅                         | ✅                |
| Signup                     | ✅                         | ✅                |
| Forgot password            | ✅                         | ✅                |
| OAuth (Google/Discord)     | ❌                         | ✅                |
| Session persistence        | ✅ AsyncStorage            | ✅ Cookies SSR    |
| Middleware auth protection | ✅ Segment-based           | ✅ SSR middleware |
| Profil view/edit           | ✅                         | ✅                |
| Avatar upload              | ✅                         | ✅                |
| Écran Welcome/Onboarding   | ⚠️ UI créée, non connectée | ❌                |

### Semaine 3 — Messagerie Base

| Feature MVP                    | Mobile                       | Web                    |
| ------------------------------ | ---------------------------- | ---------------------- |
| Liste conversations (réelle)   | ✅ Supabase                  | ✅ API + fallback mock |
| Chat room texte temps réel     | ✅ Supabase Realtime         | ✅ Socket.IO           |
| Envoi/réception messages       | ✅                           | ✅                     |
| Infinite scroll / pagination   | ✅                           | ✅                     |
| Typing indicator               | ✅ Broadcast                 | ✅ Supabase Realtime   |
| Pull-to-refresh                | ❌                           | N/A                    |
| Swipe actions (archive/delete) | ✅ SwipeableConversationItem | N/A                    |
| FAB "New Chat"                 | ✅ Session 21/02             | ✅                     |
| Image upload (caméra/galerie)  | ✅                           | ✅ Drag & drop         |
| Video upload                   | ✅                           | ✅                     |
| Lightbox/preview               | ✅ Fullscreen + pinch-zoom   | ✅ Zoom/pan/download   |

### Semaine 4 — Messagerie Avancée

| Feature MVP                    | Mobile                             | Web                            |
| ------------------------------ | ---------------------------------- | ------------------------------ |
| Voice messages (record + play) | ✅ Hold-to-record, waveform, speed | ✅ MediaRecorder, waveform     |
| Edit messages                  | ✅ Session 21/02                   | ✅ API + socket + UI optimiste |
| Delete messages                | ✅ Session 21/02                   | ✅ Soft delete                 |
| Reactions emoji                | ✅ Long-press + count + reactors   | ✅ Supabase Realtime           |
| Emoji picker                   | ✅ rn-emoji-keyboard               | ✅ 1083 lignes, skin-tone      |
| GIF picker (GIPHY)             | ✅ GifPicker.tsx                   | ✅ Intégration GIPHY           |
| Reply to message               | ✅ MessageContextMenu              | ✅                             |
| Forward message                | ✅ MessageContextMenu              | ✅                             |
| Message context menu           | ✅ Long-press → actions complètes  | ✅ Right-click menu complet    |
| Read receipts                  | ✅ Session 21/02                   | ⚠️                             |
| Rich text / Markdown           | ❌                                 | ✅ Toolbar + renderer          |

### Semaine 5-6 — Appels Audio/Vidéo

| Feature MVP                       | Mobile                                     | Web            |
| --------------------------------- | ------------------------------------------ | -------------- |
| Bouton appel audio                | ✅                                         | ✅             |
| Bouton appel vidéo                | ✅                                         | ✅             |
| Stream Video intégration          | ⚠️ Token placeholder, Expo Go incompatible | ✅ Fonctionnel |
| Call signaling                    | ✅ Supabase Realtime                       | ✅ Stream SDK  |
| Incoming call modal               | ✅                                         | ✅             |
| Call controls (mute/cam/hang)     | ✅                                         | ✅             |
| Call history                      | ✅ Supabase `call_events`                  | ✅             |
| Screen sharing                    | ❌                                         | ✅             |
| CallKit (iOS) / ConnectionService | ❌                                         | N/A            |

### Semaine 7 — UX Polish

| Feature MVP         | Mobile                | Web                   |
| ------------------- | --------------------- | --------------------- |
| Push notifications  | ✅ Expo Notifications | ✅ FCM + Desktop      |
| Thèmes (dark/light) | ✅ Toggle             | ✅ 8 thèmes + density |
| Search              | ❌                    | ⚠️ Chat only          |
| Offline mode        | ✅ AsyncStorage queue | ✅ IndexedDB queue    |
| Onboarding          | ⚠️ UI créée           | ❌                    |
| i18n (fr/en/ja)     | ✅ i18n-js            | ✅ next-intl          |

### Features secondaires (Social, Store, Watch)

| Feature       | Mobile          | Web                                      |
| ------------- | --------------- | ---------------------------------------- |
| Social feed   | 🔲 UI mock 100% | ⚠️ UI + queries Supabase → fallback mock |
| Store         | 🔲 UI mock 100% | ⚠️ Module registry + mock                |
| Watch parties | 🔲 UI mock 100% | ⚠️ UI + queries Supabase → fallback mock |

---

## 3. Comparatif synthétique Mobile vs Web

| Domaine            | Mobile                                           | Web                                  | Écart                  |
| ------------------ | ------------------------------------------------ | ------------------------------------ | ---------------------- |
| **Auth**           | ✅ (email)                                       | ✅ (email + OAuth)                   | Web +2 providers OAuth |
| **Chat core**      | ✅                                               | ✅                                   | Parité                 |
| **Chat avancé**    | ✅ Edit/Delete/Reply/Forward/GIF/Emoji/Reactions | ✅                                   | **Parité**             |
| **Read receipts**  | ✅                                               | ⚠️                                   | **Mobile > Web**       |
| **Media**          | ✅                                               | ✅                                   | Parité                 |
| **Appels**         | ⚠️ Token manquant                                | ✅                                   | Web > Mobile           |
| **Contacts**       | ✅                                               | ✅                                   | Parité                 |
| **Notifications**  | ✅                                               | ✅                                   | Parité                 |
| **Settings**       | ✅ (1004 lignes)                                 | ✅                                   | Parité                 |
| **Profil**         | ✅                                               | ✅                                   | Parité                 |
| **i18n**           | ✅ (320 clés)                                    | ✅ (2300 clés)                       | Web >> Mobile (volume) |
| **Thèmes**         | ✅ Dark/Light                                    | ✅ 8 thèmes + density                | Web >> Mobile          |
| **Offline**        | ✅                                               | ✅                                   | Parité                 |
| **Search**         | ❌                                               | ⚠️ Chat scope                        | Web > Mobile           |
| **Tests**          | ⚠️ 24 fichiers                                   | ⚠️ Couverture similaire              | Parité                 |
| **Zustand Stores** | ❌ Vide                                          | ✅ Notifications store               | Web > Mobile           |
| **Modules/Scale**  | ~15 écrans                                       | 37 modules, 120 pages, 1086 fichiers | Web >>> Mobile         |

---

## 4. Priorités restantes pour le mobile

Les **lacunes** du mobile par rapport au MVP et à la web-app :

1. ~~**Edit/Delete messages**~~ ✅ Implémenté (session 21/02)
2. ~~**Emoji picker**~~ ✅ Existant (rn-emoji-keyboard)
3. ~~**Reply/Forward**~~ ✅ Existant (MessageContextMenu)
4. **Stream Video token** — Placeholder bloque les appels réels
5. **OAuth (Google/Apple)** — Absent sur mobile
6. ~~**Offline queue**~~ ✅ Implémenté (AsyncStorage)
7. **Search** — Aucune recherche sur mobile
8. **Pull-to-refresh** — Non implémenté
9. **Logger unifié** — Absent
