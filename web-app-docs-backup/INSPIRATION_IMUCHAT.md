# 🎨 Inspiration depuis ImuChat (projet existant)

> Analyse du projet ImuChat (`/Users/nathanimogo/Documents/GitHub/ImuChat`) pour identifier les patterns et composants à réutiliser dans la nouvelle web-app.

---

## 📂 Architecture du projet ImuChat

### Structure globale

```
ImuChat/
├── src/
│   ├── app/[locale]/          # Routes avec i18n
│   ├── components/            # Composants organisés par domaine
│   │   ├── layout/           # Layout components
│   │   ├── ui/               # UI primitives (shadcn-like)
│   │   ├── chat/             # Chat features
│   │   ├── calls/            # Audio/Video calls
│   │   ├── notifications/    # Notifications system
│   │   ├── profile/          # Profile components
│   │   ├── settings/         # Settings pages
│   │   ├── watch/            # Watch/Video features
│   │   ├── store/            # Store/Marketplace
│   │   └── ... (30+ domaines)
│   ├── contexts/             # React contexts (12+)
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Utilities
│   ├── modules/              # Module system
│   └── services/             # API services
├── messages/                 # i18n (next-intl)
└── public/
```

---

## ✅ Éléments à réutiliser immédiatement

### 1. 🏗️ Sidebar avancé (`src/components/ui/sidebar.tsx`)

**Fonctionnalités** :

- ✅ **Redimensionnable** avec drag & drop
- ✅ **Snap points** : 64px (collapsed), 240px (normal), 320px (expanded)
- ✅ **Collapse/Expand** avec animation
- ✅ **Persistence** : localStorage + server (user settings)
- ✅ **Mobile support** : Sheet component
- ✅ **Keyboard shortcut** : `b` pour toggle
- ✅ **Context API** : `SidebarProvider` + `useSidebar()` hook

**Composants associés** :

- `Sidebar` (container)
- `SidebarContent` (scrollable content)
- `SidebarMenu` / `SidebarMenuItem` / `SidebarMenuButton`
- `SidebarGroup` / `SidebarGroupLabel`
- `SidebarSeparator`
- `SidebarRail` (resize handle)
- `SidebarHeader` / `SidebarFooter`

**Code clé** :

```tsx
// Snap points pour resize
const SNAP_POINTS = [64, 240, 320];
const MIN_WIDTH = 64;
const MAX_WIDTH = 400;

// Context pour state global
type SidebarContext = {
  state: "expanded" | "collapsed"
  width: number
  saveWidth: (width: number) => void
  isDragging: boolean
  open: boolean
  toggleSidebar: () => void
}
```

**À adapter pour web-app** :

- [x] ✅ Déjà créé un sidebar basique
- [ ] 🔄 Ajouter resize avec rail
- [ ] 🔄 Ajouter snap points
- [ ] 🔄 Implémenter SidebarContext
- [ ] 🔄 Ajouter keyboard shortcut

---

### 2. 📊 App Layout (`src/components/layout/app-layout.tsx`)

**Architecture** :

```tsx
<SidebarProvider>
  <Sidebar>
    <SidebarHeader /> {/* Logo, workspace selector */}
    <SidebarContent>
      {/* Main navigation */}
      {/* Content modules */}
      {/* Lifestyle modules */}
      {/* Tools */}
    </SidebarContent>
    <SidebarFooter /> {/* Settings, user menu */}
  </Sidebar>
  
  <main>
    <Header /> {/* Search, notifications, profile */}
    {children}
    <Footer />
  </main>
  
  <RightSidebar /> {/* Contextual panels */}
</SidebarProvider>
```

**Fonctionnalités** :

- ✅ **Drag & Drop** : Réorganiser items sidebar (dnd-kit)
- ✅ **Favoris system** : Star items pour quick access
- ✅ **Mobile Bottom Nav** : 5 tabs configurables
- ✅ **Mini Hub mode** : Cache sidebar + right panel (zen mode)
- ✅ **Detached mode** : Ouvrir pages en fenêtres séparées
- ✅ **Layout persistence** : Sauvegarde ordre/visibility items

**À réutiliser** :

- [ ] 🎯 Drag & Drop pour sidebar items
- [ ] 🎯 Favoris system
- [ ] 🎯 Mobile Bottom Nav
- [ ] 🎯 Mini Hub / Zen mode
- [ ] 🎯 Detached windows

---

### 3. 🔝 Header avancé (`src/components/layout/header.tsx`)

**Fonctionnalités** :

```tsx
<header>
  {/* Navigation arrows */}
  <Button variant="ghost" onClick={router.back}>
    <ArrowLeft />
  </Button>
  <Button variant="ghost" onClick={router.forward}>
    <ArrowRight />
  </Button>
  
  {/* Dynamic title (via PageHeaderContext) */}
  <h1>{title}</h1>
  
  {/* Expandable search */}
  <Input 
    placeholder="Search" 
    className={isExpanded ? 'w-64' : 'w-0'}
  />
  
  {/* Actions */}
  <ThemeToggle />
  <NotificationBadge count={unreadCount} />
  <Avatar dropdown>
    {/* Profile menu */}
  </Avatar>
</header>
```

**Patterns clés** :

- ✅ **PageHeaderContext** : Titre et actions dynamiques par page
- ✅ **Search expand/collapse** : S'agrandit au focus
- ✅ **Status dropdown** : Online, Idle, DND, Invisible
- ✅ **View Mode Switcher** : Pour chat (nimbus, snapview, stream, panels)
- ✅ **Full screen toggle** : Cache sidebar + right panel

**À adapter** :

- [x] ✅ Search bar avec badge déjà créé
- [ ] 🔄 Ajouter navigation arrows
- [ ] 🔄 PageHeaderContext pour titres dynamiques
- [ ] 🔄 Status dropdown
- [ ] 🎯 View mode switcher (pour chat)

---

### 4. 📱 Right Sidebar (`src/components/layout/right-sidebar.tsx`)

**Architecture** :

```tsx
<RightSidebar width={rightSidebarWidth}>
  <Tabs>
    <TabsList>
      <TabsTrigger value="friends">Friends</TabsTrigger>
      <TabsTrigger value="activity">Activity</TabsTrigger>
      <TabsTrigger value="notifications">Notifications</TabsTrigger>
      <TabsTrigger value="events">Events</TabsTrigger>
      <TabsTrigger value="ai">AI Assistant</TabsTrigger>
    </TabsList>
    
    <TabsContent value="friends">
      <FriendsListSidebar />
    </TabsContent>
    <TabsContent value="activity">
      <ActivityFeedSidebar />
    </TabsContent>
    {/* ... */}
  </Tabs>
  
  <RightSidebarRail /> {/* Resize handle */}
</RightSidebar>
```

**Fonctionnalités** :

- ✅ **Redimensionnable** : min 280px, max 500px
- ✅ **Tabs multiples** : Friends, Activity, Notifications, Events, Quick Actions, Reminders, AI
- ✅ **Panels contextuels** :
  - Friends list avec status
  - Activity feed
  - Notifications center
  - Upcoming events
  - Quick actions
  - Reminders/Tasks
  - AI Assistant chat
  - World preview
  - Music mini player

**À créer** :

- [x] ✅ RightPanel basique déjà créé
- [ ] 🎯 Ajouter resize handle
- [ ] 🎯 Tabs system
- [ ] 🎯 Panels spécifiques

---

### 5. 🔔 Notifications System

**Components** :

```tsx
// NotificationBadge.tsx
<NotificationBadge 
  className="..." 
  showZero={false} 
  max={99} 
/>

// NotificationPanel.tsx (right sidebar)
<NotificationPanel>
  <NotificationFilters />
  {notifications.map(notif => (
    <NotificationItem 
      key={notif.id}
      notification={notif}
      onRead={handleRead}
      onDelete={handleDelete}
    />
  ))}
</NotificationPanel>
```

**Store** :

```typescript
// modules/notifications/store.ts
export const useNotificationsStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notif) => { /* ... */ },
  markAsRead: (id) => { /* ... */ },
  deleteNotification: (id) => { /* ... */ },
}))
```

**À réutiliser** :

- [ ] 🎯 NotificationBadge component
- [ ] 🎯 NotificationPanel avec filters
- [ ] 🎯 Zustand store pour notifications
- [ ] 🎯 Real-time updates (via socket)

---

### 6. 🎨 Contexts utilisés

**Layout Context** (`contexts/layout-context.tsx`) :

```typescript
interface LayoutContextType {
  isMiniHubVisible: boolean
  isDetached: boolean
  isRightSidebarOpen: boolean
  rightSidebarWidth: number
  chatLayout: 'nimbus' | 'snapview' | 'stream' | 'panels'
  showStoriesRail: boolean
  // + setters
}
```

**Page Header Context** (`contexts/page-header-context.tsx`) :

```typescript
interface PageHeaderContextType {
  title: string
  setTitle: (title: string) => void
  actions: React.ReactNode
  setActions: (actions: React.ReactNode) => void
}
```

**Search Context** (`contexts/search-context.tsx`) :

```typescript
interface SearchContextType {
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchResults: SearchResult[]
  isSearching: boolean
}
```

**Module Context** (`contexts/ModulesContext.tsx`) :

```typescript
interface ModulesContextType {
  modules: Module[]
  toggleModule: (moduleId: string) => void
  isModuleActive: (moduleId: string) => boolean
}
```

**À créer** :

- [ ] 🎯 LayoutContext (layout states)
- [ ] 🎯 PageHeaderContext (titres dynamiques)
- [ ] 🎯 SearchContext (recherche globale)
- [ ] 🎯 ModulesContext (features toggleables)

---

### 7. 📲 Mobile Bottom Nav

**Component** (`layout/mobile-bottom-nav.tsx`) :

```tsx
<motion.div 
  className="fixed bottom-0 left-0 right-0 h-16 md:hidden"
>
  {activeTabs.map(tab => (
    <Link 
      href={tab.href}
      className={isActive ? "text-primary" : "text-muted-foreground"}
    >
      <Icon />
      <span>{tab.label}</span>
    </Link>
  ))}
</motion.div>
```

**Features** :

- ✅ Configuration customizable (via localStorage)
- ✅ 5 tabs par défaut : Home, Worlds, Chat, Games, Profile
- ✅ Animation framer-motion
- ✅ Active state highlighting
- ✅ Module-aware (cache si module désactivé)

**À créer** :

- [ ] 🎯 MobileBottomNav component
- [ ] 🎯 Tab configuration system
- [ ] 🎯 Animations framer-motion

---

### 8. 🛠️ Hooks utiles

**`use-mobile.tsx`** :

```typescript
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  return isMobile
}
```

**`use-auth.tsx`** :

```typescript
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
      setLoading(false)
    })
    return unsubscribe
  }, [])
  
  return { user, loading }
}
```

**`use-toast.ts`** :

```typescript
export function useToast() {
  return {
    toast: (message: string, options?: ToastOptions) => {
      // Show toast notification
    },
    success: (message: string) => { /* ... */ },
    error: (message: string) => { /* ... */ },
    info: (message: string) => { /* ... */ },
  }
}
```

**À créer** :

- [x] ✅ useIsMobile (probablement déjà existe)
- [ ] 🎯 useAuth
- [ ] 🎯 useToast

---

### 9. 📄 Pages exemples

**Dashboard/Home** (`app/[locale]/hometab/page.tsx`) :

```tsx
export default function HomeTabPage() {
  return (
    <AppLayout>
      <div className="container mx-auto p-8 space-y-8">
        <HeroCarousel />
        
        <div className="grid grid-cols-3 gap-8">
          <FeaturedWorldCard />
          <FeaturedContestCard />
          <FriendsCard />
        </div>
        
        <YourFeedPlaceholder />
        <ExplorerGrid />
        <PodcastWidget />
      </div>
    </AppLayout>
  )
}
```

**Pattern** :

- Layout customizable (ordre sections sauvegardé)
- Skeleton loading states
- Grid responsive
- Lazy loading sections

**À adapter** :

- [x] ✅ Dashboard déjà créé
- [ ] 🔄 Ajouter layout customization
- [ ] 🔄 Skeleton loading states
- [ ] 🎯 Lazy loading sections

---

## 🎯 Plan d'intégration

### Phase 1 : Améliorer les fondations (Semaine 2-3)

1. **Sidebar amélioré**
   - [ ] Ajouter SidebarProvider context
   - [ ] Implémenter resize avec rail
   - [ ] Snap points (64, 240, 320px)
   - [ ] Keyboard shortcut (b)
   - [ ] Persistence (localStorage)

2. **Header enrichi**
   - [ ] Navigation arrows (back/forward)
   - [ ] PageHeaderContext
   - [ ] Search expand/collapse
   - [ ] Status dropdown

3. **RightPanel upgradé**
   - [ ] Resize handle
   - [ ] Tabs system
   - [ ] Notifications panel
   - [ ] Friends list panel

### Phase 2 : Contexts & State (Semaine 3-4)

1. **Créer contexts**
   - [ ] LayoutContext
   - [ ] PageHeaderContext
   - [ ] SearchContext
   - [ ] ModulesContext (optionnel)

2. **Hooks**
   - [ ] useIsMobile
   - [ ] useAuth
   - [ ] useToast
   - [ ] useKeyboardShortcut

### Phase 3 : Features avancées (Semaine 5+)

1. **Drag & Drop**
   - [ ] Install @dnd-kit
   - [ ] Sidebar items reorder
   - [ ] Favoris system

2. **Mobile**
   - [ ] MobileBottomNav
   - [ ] Sheet pour sidebar mobile
   - [ ] Responsive optimizations

3. **Advanced**
   - [ ] Mini Hub / Zen mode
   - [ ] Detached windows
   - [ ] View mode switcher (chat)

---

## 📦 Packages utilisés dans ImuChat

```json
{
  "dependencies": {
    "next": "15.x",
    "react": "19.x",
    "next-intl": "^3.x",
    "framer-motion": "^11.x",
    "@dnd-kit/core": "^6.x",
    "@dnd-kit/sortable": "^8.x",
    "@radix-ui/react-*": "latest",
    "class-variance-authority": "^0.7.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x",
    "lucide-react": "latest",
    "zustand": "^4.x"
  }
}
```

**Déjà installés dans web-app** :

- [x] Next.js 15
- [x] React 19
- [x] Tailwind CSS
- [x] lucide-react
- [x] class-variance-authority
- [x] clsx + tailwind-merge (via cn utility)

**À installer** :

- [ ] framer-motion (animations)
- [ ] @dnd-kit/* (drag & drop)
- [ ] @radix-ui/react-tabs (tabs)
- [ ] @radix-ui/react-hover-card (hover cards)
- [ ] zustand (state management)
- [ ] next-intl (i18n)

---

## 🔑 Patterns clés à retenir

### 1. **Composition over Configuration**

```tsx
// ❌ Mauvais : props drilling
<Sidebar items={items} onReorder={handleReorder} favorites={favorites} />

// ✅ Bon : composition
<Sidebar>
  <SidebarHeader>
    <Logo />
    <WorkspaceSelector />
  </SidebarHeader>
  <SidebarContent>
    <SidebarGroup label="Main">
      {mainItems.map(item => (
        <SidebarMenuItem key={item.id} {...item} />
      ))}
    </SidebarGroup>
  </SidebarContent>
  <SidebarFooter>
    <UserMenu />
  </SidebarFooter>
</Sidebar>
```

### 2. **Context pour state partagé**

```tsx
// Layout state accessible partout
const { isRightSidebarOpen, setIsRightSidebarOpen } = useLayout()

// Page header dynamique
const { setTitle, setActions } = usePageHeader()
useEffect(() => {
  setTitle("Dashboard")
  setActions(<Button>Action</Button>)
}, [])
```

### 3. **Responsive avec useIsMobile**

```tsx
const isMobile = useIsMobile()

return isMobile ? (
  <Sheet>
    <SidebarContent />
  </Sheet>
) : (
  <Sidebar>
    <SidebarContent />
  </Sidebar>
)
```

### 4. **Persistence avec localStorage + server**

```tsx
// Save locally + in DB
const saveWidth = (width: number) => {
  localStorage.setItem('sidebar_width', String(width))
  saveUserLayoutSettings({ sidebar_width: width })
}

// Load on mount
useEffect(() => {
  const settings = await getUserLayoutSettings()
  setWidth(settings.sidebar_width || 240)
}, [])
```

### 5. **Animations avec framer-motion**

```tsx
<motion.div
  initial={{ x: -100, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  exit={{ x: -100, opacity: 0 }}
  transition={{ type: 'spring', stiffness: 300 }}
>
  {content}
</motion.div>
```

---

## 📝 Composants à copier/adapter

### Priorité HAUTE (Semaine 2-3)

1. `src/components/ui/sidebar.tsx` (936 lignes) → Adapter pour resize + context
2. `src/components/layout/app-layout.tsx` (488 lignes) → Copier architecture
3. `src/components/layout/header.tsx` (251 lignes) → Enrichir notre TopBar
4. `src/components/layout/right-sidebar.tsx` (145 lignes) → Upgrade RightPanel
5. `src/contexts/layout-context.tsx` (120 lignes) → Créer contexts

### Priorité MOYENNE (Semaine 4-5)

1. `src/components/layout/mobile-bottom-nav.tsx` → Mobile nav
2. `src/components/notifications/NotificationBadge.tsx` → Badge
3. `src/components/layout/notification-panel.tsx` → Notifications center
4. `src/hooks/use-mobile.tsx` → Responsive hook
5. `src/hooks/use-toast.ts` → Toast notifications

### Priorité BASSE (Semaine 6+)

1. Drag & Drop setup (@dnd-kit)
2. Favoris system
3. Mini Hub / Zen mode
4. Detached windows
5. i18n setup (next-intl)

---

## 🚀 Actions immédiates (cette semaine)

### 1. Enrichir TopBar

```tsx
// web-app/src/components/layout/TopBar.tsx
import { ArrowLeft, ArrowRight } from 'lucide-react'

export function TopBar() {
  return (
    <header className="...">
      {/* NEW: Navigation arrows */}
      <div className="flex gap-1">
        <Button size="icon" variant="ghost" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => router.forward()}>
          <ArrowRight />
        </Button>
      </div>
      
      {/* NEW: Dynamic title (via context) */}
      <h1 className="font-semibold">{title}</h1>
      
      {/* EXISTING: Search, notifications, profile */}
      {/* ... */}
    </header>
  )
}
```

### 2. Créer LayoutContext

```tsx
// web-app/src/contexts/layout-context.tsx
'use client'

import { createContext, useContext, useState } from 'react'

interface LayoutContextType {
  isRightPanelOpen: boolean
  setIsRightPanelOpen: (open: boolean) => void
  rightPanelWidth: number
  setRightPanelWidth: (width: number) => void
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true)
  const [rightPanelWidth, setRightPanelWidth] = useState(320)
  
  return (
    <LayoutContext.Provider value={{
      isRightPanelOpen,
      setIsRightPanelOpen,
      rightPanelWidth,
      setRightPanelWidth,
    }}>
      {children}
    </LayoutContext.Provider>
  )
}

export function useLayout() {
  const context = useContext(LayoutContext)
  if (!context) throw new Error('useLayout must be used within LayoutProvider')
  return context
}
```

### 3. Upgrader RightPanel avec resize

```tsx
// web-app/src/components/layout/RightPanel.tsx
export function RightPanel() {
  const { rightPanelWidth, setRightPanelWidth } = useLayout()
  const [isDragging, setIsDragging] = useState(false)
  
  const handleMouseDown = () => setIsDragging(true)
  
  useEffect(() => {
    if (!isDragging) return
    
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX
      setRightPanelWidth(Math.max(280, Math.min(500, newWidth)))
    }
    
    const handleMouseUp = () => setIsDragging(false)
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])
  
  return (
    <aside style={{ width: rightPanelWidth }}>
      {/* Resize handle */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 hover:bg-primary cursor-ew-resize"
        onMouseDown={handleMouseDown}
      />
      
      {/* Content */}
      {/* ... */}
    </aside>
  )
}
```

---

## 📊 Comparaison avec notre implémentation actuelle

**Dernière mise à jour** : 18 février 2026 - Fin Semaine 1

| Feature | ImuChat | Notre web-app (Semaine 1) | Statut | Action |
|---------|---------|---------------------------|--------|--------|
| **Sidebar** | Redimensionnable, snap points, context | ✅ Basique créé, collapse fonctionnel | 🟡 Partiel | 🔄 S2: Resize + Context |
| **TopBar** | Nav arrows, dynamic title, expandable search | ✅ Search, notif badge, profile | 🟡 Partiel | 🔄 S2: Nav arrows + PageContext |
| **RightPanel** | Tabs, redimensionnable, 8+ panels | ✅ Basique créé, pas de tabs | 🟡 Partiel | 🔄 S2: Resize + Tabs |
| **Dashboard** | Complexe avec widgets | ✅ Stats + Conversations + QuickActions | 🟢 OK | ✅ Fait |
| **Routes** | i18n [locale]/page | ✅ Structure (app)/ créée | 🟢 OK | ✅ Fait |
| **Mobile Nav** | Bottom nav customizable | ❌ Pas encore | 🔴 Manquant | ⏳ S4 |
| **Contexts** | Layout, PageHeader, Search, Modules | ❌ Aucun | 🔴 Manquant | ⏳ S2 |
| **Animations** | Framer Motion partout | ❌ Hover states seulement | 🔴 Manquant | ⏳ S3 |
| **Drag & Drop** | Sidebar items reorder | ❌ Pas encore | 🔴 Manquant | ⏳ P2 |
| **i18n** | next-intl complet | ❌ Pas encore | 🔴 Manquant | ⏳ P2 |
| **Themes** | Light/Dark + 7 custom | ✅ Light/Dark basique | 🟢 OK | ✅ Fait |
| **Notifications** | Store Zustand + real-time | ✅ Badge mock + dropdown basic | 🟡 Partiel | 🔄 S2: NotificationCenter |

**Légende** :
- 🟢 OK = Complété
- 🟡 Partiel = Commencé mais à améliorer
- 🔴 Manquant = Pas encore commencé

---

## 🎯 Verdict & Recommandations

### ✅ Ce qu'on a accompli (Semaine 1)

1. ✅ **Structure de base AppShell** : 3 colonnes responsive (Sidebar 240px/64px, Main flex-1, RightPanel 320px)
2. ✅ **Composants UI** : Button (6 variants), Badge (4 variants), Avatar, Separator
3. ✅ **Routes organisées** : Toutes sous `(app)/` avec layout wrapper
4. ✅ **Dashboard enrichi** : StatsCards, RecentConversations, QuickActions
5. ✅ **Navigation complète** : 8 pages (dashboard, chats, calls, social, watch, store, profile, settings)
6. ✅ **Dark mode support** : Basique fonctionnel
7. ✅ **Responsive** : Sidebar collapse < 1024px

### 🔄 Ce qu'on doit améliorer (Semaine 2-3)

1. **Sidebar** : Ajouter resize, context, persistence
2. **TopBar** : Navigation arrows, dynamic title context
3. **RightPanel** : Resize handle, tabs system
4. **Contexts** : Layout, PageHeader, Search
5. **Mobile** : Bottom nav, Sheet pour sidebar

### 🎯 Ce qu'on peut différer (Semaine 4+)

1. Drag & Drop sidebar items
2. Favoris system
3. Mini Hub / Zen mode
4. Detached windows
5. i18n next-intl
6. Framer Motion animations partout

---

## 📚 Ressources

- **ImuChat project** : `/Users/nathanimogo/Documents/GitHub/ImuChat`
- **Composants clés** :
  - Sidebar : `ImuChat/src/components/ui/sidebar.tsx`
  - AppLayout : `ImuChat/src/components/layout/app-layout.tsx`
  - Header : `ImuChat/src/components/layout/header.tsx`
  - RightSidebar : `ImuChat/src/components/layout/right-sidebar.tsx`
- **Contexts** : `ImuChat/src/contexts/`
- **Hooks** : `ImuChat/src/hooks/`

---

**Dernière mise à jour** : 18 février 2026 - Fin Semaine 1  
**Statut global** : ✅ Semaine 1 COMPLÉTÉE (100%)  
**Prochaine action** : Semaine 2 - LayoutContext + NotificationCenter + Keyboard Shortcuts
