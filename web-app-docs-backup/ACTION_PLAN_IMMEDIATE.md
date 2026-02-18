# 🎯 Plan d'Action Immédiat - Web-App

> **Contexte** : La web-app est en retard par rapport au mobile. Ce document liste les actions à prendre MAINTENANT pour rattraper le retard.

---

## 📊 Progression Globale

**Dernière mise à jour** : 18 février 2026

| Semaine | Statut | Progression | Livrables |
|---------|--------|-------------|-----------|
| **Semaine 1** | ✅ COMPLÉTÉE | 100% | AppShell, Sidebar, TopBar, RightPanel, Dashboard, 7 pages |
| **Semaine 2** | 🔜 À VENIR | 0% | Notifications Center, Keyboard Shortcuts, Dashboard enrichi |
| **Semaine 3** | ⏳ PLANIFIÉE | 0% | Command Palette (Cmd+K), Global Search |
| **Semaine 4** | ⏳ PLANIFIÉE | 0% | Profile & Settings complets |

**Accomplissements Semaine 1** :
- ✅ 18 fichiers créés (4 layout, 4 UI, 7 pages, 3 utils)
- ✅ Architecture 3 colonnes responsive
- ✅ Navigation complète entre 8 pages
- ✅ Dashboard avec stats, conversations, quick actions
- ✅ Dev server opérationnel

---

## 🚨 État actuel vs. Objectif

### Ce qui existe ✅

- Authentication (login/signup)
- Chat basique (liste conversations, messages)
- Appels (incoming/outgoing/active)
- Features MVP : réactions, médias, vocal, historique appels
- **✅ NOUVEAU : App Shell complet** (sidebar/topbar/right panel)
- **✅ NOUVEAU : Navigation principale** (menu avec 8 pages)
- **✅ NOUVEAU : Dashboard enrichi** (stats, conversations récentes, actions rapides)
- **✅ NOUVEAU : Pages placeholder** (Social, Watch, Store, Profile, Settings)
- **✅ NOUVEAU : Composants UI** (Button, Badge, Avatar, Separator)
- **✅ NOUVEAU : Layout responsive** (collapse sidebar < 1024px)

### Ce qui manque ❌

- **Pages principales** : Social, Profile, Watch, Store, Settings (⚠️ structure créée, à implémenter)
- **Features desktop** : keyboard shortcuts, command palette, multi-panel resize
- **UX moderne** : drag & drop, rich text editor, notifications center fonctionnel

---

## 📋 Action Plan - 4 Premières Semaines

### ✅ Semaine 1 : App Shell (COMPLÉTÉE)

> **Statut** : ✅ TERMINÉE le 18 février 2026

**Jour 1-2 : Layout System**

```bash
# Créer structure layout
mkdir -p src/components/layout
touch src/components/layout/AppShell.tsx
touch src/components/layout/Sidebar.tsx
touch src/components/layout/TopBar.tsx
touch src/components/layout/RightPanel.tsx
```

**Composants à créer** :

1. **AppShell.tsx** - Container 3 colonnes

```tsx
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <TopBar />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
      <RightPanel />
    </div>
  )
}
```

1. **Sidebar.tsx** - Navigation principale
   - Logo + workspace
   - Menu items : Dashboard, Chats, Calls, Social, Watch, Store, Profile
   - Settings en bas

2. **TopBar.tsx** - Barre du haut
   - Search bar
   - Notifications bell (badge)
   - Profile dropdown

**Jour 3-4 : Intégration**

- [x] ✅ Modifier `src/app/layout.tsx` pour wrapper avec AppShell
- [x] ✅ Créer route `/dashboard` (nouveau home)
- [x] ✅ Migrer routes existantes sous `(app)/`
- [x] ✅ Tester navigation entre pages

**Jour 5 : Polish**

- [x] ✅ Responsive (collapse sidebar < 1024px)
- [x] ✅ Dark mode support (déjà existant)
- [x] ✅ Transitions animations (hover states)
- [x] ✅ Dev server lancé et testé

**✅ Livrable Semaine 1** : App avec navigation fonctionnelle - **COMPLÉTÉE**

**Réalisations** :
- 18 fichiers créés (4 layout components, 4 UI components, 7 pages, 3 fichiers utils)
- Architecture 3 colonnes responsive (Sidebar 240px/64px, Main flex-1, RightPanel 320px)
- Navigation complète entre 8 pages (dashboard, chats, calls, social, watch, store, profile, settings)
- Dashboard enrichi avec StatsCards, RecentConversations, QuickActions

---

### ⚡ Semaine 2 : Dashboard & Quick Wins

**Jour 1-2 : Dashboard**

```tsx
// src/app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1>Bonjour {user.name} 👋</h1>
      
      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <StatsCard title="Messages" value={24} />
        <StatsCard title="Appels" value={3} />
        <StatsCard title="Notifications" value={12} />
      </div>
      
      {/* Recent conversations */}
      <RecentConversations limit={5} />
      
      {/* Quick actions */}
      <QuickActions />
    </div>
  )
}
```

**Jour 3 : Notifications Center**

- [ ] Créer `NotificationCenter.tsx` (dropdown TopBar)
- [ ] Badge count
- [ ] Liste notifications (mock data)
- [ ] Mark as read/delete

**Jour 4-5 : Navigation shortcuts**

- [ ] Implémenter `useKeyboardShortcuts` hook
- [ ] Shortcuts basiques : Cmd+1-7 (navigation)
- [ ] Cmd+/ (shortcuts help modal)

**Livrable Semaine 2** : Dashboard + Notifications + Shortcuts ✅

---

### ⚡ Semaine 3 : Command Palette & Search

**Jour 1-3 : Command Palette**

```bash
pnpm add cmdk
```

```tsx
// src/components/command/CommandPalette.tsx
import { Command } from 'cmdk'

export function CommandPalette() {
  return (
    <Command.Dialog>
      <Command.Input placeholder="Rechercher..." />
      <Command.List>
        <Command.Group heading="Actions">
          <Command.Item>Nouvelle conversation</Command.Item>
          <Command.Item>Nouvel appel</Command.Item>
        </Command.Group>
        <Command.Group heading="Navigation">
          <Command.Item>Dashboard</Command.Item>
          <Command.Item>Messages</Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  )
}
```

**Jour 4-5 : Global Search**

- [ ] Search bar dans TopBar fonctionnelle
- [ ] Recherche conversations
- [ ] Recherche contacts
- [ ] Recherche messages (basic)

**Livrable Semaine 3** : Command Palette + Search ✅

---

### ⚡ Semaine 4 : Profile & Settings (MVP)

**Jour 1-2 : Profile Page**

```bash
mkdir -p src/app/profile
touch src/app/profile/page.tsx
```

- [ ] Profile header (avatar, name, bio)
- [ ] Edit profile button → modal
- [ ] Tabs : Posts (vide), Media (vide), About (infos)

**Jour 3-4 : Settings Pages**

```bash
mkdir -p src/app/settings/{account,privacy,notifications,appearance}
touch src/app/settings/layout.tsx
touch src/app/settings/account/page.tsx
touch src/app/settings/privacy/page.tsx
touch src/app/settings/notifications/page.tsx
touch src/app/settings/appearance/page.tsx
```

**Layout 2-colonnes** :

```tsx
// src/app/settings/layout.tsx
export default function SettingsLayout({ children }) {
  return (
    <div className="flex">
      <SettingsSidebar />
      <div className="flex-1">{children}</div>
    </div>
  )
}
```

**Jour 5 : Theme Picker**

- [ ] Light/Dark/Auto toggle
- [ ] Tailwind dark mode setup
- [ ] Persistance localStorage

**Livrable Semaine 4** : Profile + Settings basiques ✅

---

## 🎯 Checklist Quick Wins (Semaine 1 - COMPLÉTÉE)

### Infrastructure

- [x] ✅ Créer `src/components/layout/` folder
- [x] ✅ Créer `src/components/ui/` folder
- [x] ✅ Installer packages nécessaires (lucide-react, cmdk, class-variance-authority, date-fns)
- [x] ✅ Créer `src/lib/cn.ts` utility

### Routing

- [x] ✅ Restructurer sous `app/(app)/`
- [x] ✅ Créer `/dashboard` comme nouveau home
- [x] ✅ Créer routes vides :
  - [x] ✅ `/social`
  - [x] ✅ `/watch`
  - [x] ✅ `/store`
  - [x] ✅ `/profile`
  - [x] ✅ `/settings`
- [x] ✅ Migrer `/chats` et `/calls` sous `(app)/`

### Components prioritaires

- [x] ✅ AppShell
- [x] ✅ Sidebar
- [x] ✅ TopBar
- [x] ✅ RightPanel
- [x] ✅ Button (6 variants)
- [x] ✅ Badge (4 variants)
- [x] ✅ Avatar (avec fallback)
- [x] ✅ Separator

### Hooks prioritaires (Semaine 2)

- [ ] useKeyboardShortcuts
- [ ] useNotifications
- [ ] useSearch
- [ ] useLayout (Context)

---

## 📦 Packages à installer

```bash
# UI Components
npx shadcn-ui@latest init

# Command palette
pnpm add cmdk

# Icons
pnpm add lucide-react

# Keyboard shortcuts
pnpm add react-hotkeys-hook

# Utilities
pnpm add clsx tailwind-merge
pnpm add class-variance-authority

# Date formatting
pnpm add date-fns
```

---

## 🎨 Design Tokens à définir

```css
/* src/styles/globals.css */

:root {
  /* Sidebar */
  --sidebar-width: 240px;
  --sidebar-collapsed-width: 64px;
  
  /* TopBar */
  --topbar-height: 64px;
  
  /* Right Panel */
  --right-panel-width: 320px;
  
  /* Colors */
  --primary: #3B82F6;
  --secondary: #8B5CF6;
  --success: #10B981;
  --warning: #F59E0B;
  --danger: #EF4444;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
}
```

---

## 🧪 Tests prioritaires

```typescript
// __tests__/layout/AppShell.test.tsx
describe('AppShell', () => {
  it('renders sidebar, topbar, and content', () => {
    render(<AppShell><div>Content</div></AppShell>)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })
})

// __tests__/navigation/Sidebar.test.tsx
describe('Sidebar', () => {
  it('navigates to dashboard on click', async () => {
    render(<Sidebar />)
    await userEvent.click(screen.getByText('Dashboard'))
    expect(window.location.pathname).toBe('/dashboard')
  })
})
```

---

## 📊 Success Metrics - 4 Semaines

### Objectifs quantitatifs

- [ ] **8 pages** créées (dashboard, chats, calls, social, watch, store, profile, settings)
- [ ] **15 composants** layout/UI créés
- [ ] **5 hooks** utilitaires créés
- [ ] **30+ tests** écrits

### Objectifs qualitatifs

- [ ] Navigation fluide entre toutes les pages
- [ ] Keyboard shortcuts fonctionnels
- [ ] Responsive mobile/tablet/desktop
- [ ] Dark mode support
- [ ] Performance : Lighthouse > 80

---

## 🚀 Commandes de démarrage

```bash
# Naviguer vers web-app
cd web-app

# Installer dépendances
pnpm install

# Setup shadcn
npx shadcn-ui@latest init

# Lancer dev
pnpm dev

# Créer première branche
git checkout -b feature/app-shell-layout

# Premier commit
git add .
git commit -m "feat: create app shell layout structure"
```

---

## 📝 Template de PR

```markdown
## 🎯 Objectif
Implémentation de l'App Shell avec navigation complète

## ✅ Checklist
- [ ] AppShell component créé
- [ ] Sidebar avec navigation
- [ ] TopBar avec search/notifications
- [ ] Routes restructurées
- [ ] Tests ajoutés
- [ ] Documentation mise à jour

## 📸 Screenshots
[Images avant/après]

## 🧪 Tests
- Unit tests : 15 passés
- E2E tests : 3 passés

## 📊 Performance
- Bundle size : +50kb
- Lighthouse : 92/100
```

---

## 🎯 Focus Semaine 1 - Actions AUJOURD'HUI

### Matin (4h)

1. ✅ Lire roadmap complète
2. ⚡ Installer shadcn-ui
3. ⚡ Créer structure `components/layout/`
4. ⚡ Créer AppShell.tsx basique

### Après-midi (4h)

5. ⚡ Créer Sidebar.tsx
2. ⚡ Créer TopBar.tsx
3. ⚡ Intégrer dans layout.tsx
4. ⚡ Tester navigation

### Soir (optionnel, 2h)

9. 🎨 Styling & polish
2. ✅ Premier commit

---

**Let's ship! 🚀**
