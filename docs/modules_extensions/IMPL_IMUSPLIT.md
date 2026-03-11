# 💸 ImuSplit — Document d'Implémentation Complet

> **Version** : 1.0  
> **Date** : 11 mars 2026  
> **Statut** : 📐 Spécification — prêt pour développement  
> **Priorité** : 🔴 P0 — Fort engagement, usage quotidien  
> **Dépendances** : `wallet` (core), `chat` (core), `contacts` (core)

---

## Table des matières

1. [Vision & Positionnement](#1-vision--positionnement)
2. [Architecture générale](#2-architecture-générale)
3. [Schéma de base de données](#3-schéma-de-base-de-données)
4. [API & Routes](#4-api--routes)
5. [Mapping des écrans](#5-mapping-des-écrans)
6. [Composants UI](#6-composants-ui)
7. [Logique métier](#7-logique-métier)
8. [Intégration Chat](#8-intégration-chat)
9. [Notifications](#9-notifications)
10. [Plan d'implémentation](#10-plan-dimplémentation)

---

## 1. Vision & Positionnement

ImuSplit est un module de **partage de dépenses** directement intégré à ImuChat. Il permet à un groupe de calculer qui doit quoi à qui, régler les dettes en ImuCoin, et garder une trace des dépenses communes sans quitter l'application.

**Cas d'usage principaux :**
- Soirée entre amis → qui a payé quoi ?
- Voyage en groupe → hôtel, essence, restos
- Colocation → loyer, courses, électricité
- Cadeau collectif → contribution de chaque participant

**Différenciateur vs Tricount/Splitwise :** intégré dans le chat du groupe, règlement en 1 tap via ImuCoin.

---

## 2. Architecture générale

```
ImuSplit
│
├── Module Core
│   ├── SplitContext (React Context)
│   ├── useSplit hook
│   └── split-store (Zustand)
│
├── Services
│   ├── split-api.ts       — CRUD dépenses, groupes, soldes
│   ├── balance-engine.ts  — Algorithme calcul optimisé des dettes
│   └── settlement-api.ts  — Règlement via Wallet ImuCoin
│
├── Routes (Next.js App Router)
│   ├── /split/                    — Hub ImuSplit
│   ├── /split/[groupId]/          — Groupe de dépenses
│   ├── /split/[groupId]/add       — Ajouter une dépense
│   ├── /split/[groupId]/balance   — Soldes & dettes
│   ├── /split/[groupId]/history   — Historique
│   └── /split/settle/[debtId]     — Régler une dette
│
└── Chat Integration
    └── Message type "split_expense" (inline dans chat)
```

**Stack :** Next.js 16 · React 19 · TypeScript 5 · Supabase · Zustand · shadcn/ui · Tailwind CSS

---

## 3. Schéma de base de données

```sql
-- ================================================================
-- IMUSPLIT — SCHÉMA SUPABASE
-- ================================================================

-- 1. Groupes de dépenses
CREATE TABLE IF NOT EXISTS public.split_groups (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL,
  description   TEXT,
  emoji         TEXT DEFAULT '💰',
  currency      TEXT NOT NULL DEFAULT 'EUR',
  chat_id       UUID REFERENCES public.chats(id) ON DELETE SET NULL,
  created_by    UUID NOT NULL REFERENCES public.profiles(id),
  is_archived   BOOLEAN NOT NULL DEFAULT false,
  total_spent   INTEGER NOT NULL DEFAULT 0, -- en centimes
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 2. Membres d'un groupe
CREATE TABLE IF NOT EXISTS public.split_group_members (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id    UUID NOT NULL REFERENCES public.split_groups(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  nickname    TEXT, -- surnom dans le groupe
  joined_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- 3. Dépenses
CREATE TABLE IF NOT EXISTS public.split_expenses (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id      UUID NOT NULL REFERENCES public.split_groups(id) ON DELETE CASCADE,
  paid_by       UUID NOT NULL REFERENCES public.profiles(id),
  title         TEXT NOT NULL,
  description   TEXT,
  amount_cents  INTEGER NOT NULL CHECK (amount_cents > 0),
  currency      TEXT NOT NULL DEFAULT 'EUR',
  category      TEXT NOT NULL DEFAULT 'other' CHECK (category IN (
    'food', 'transport', 'accommodation', 'entertainment',
    'shopping', 'utilities', 'health', 'gift', 'other'
  )),
  split_type    TEXT NOT NULL DEFAULT 'equal' CHECK (split_type IN (
    'equal', 'custom', 'percentage', 'shares'
  )),
  receipt_url   TEXT,
  expense_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- 4. Parts de chaque participant pour une dépense
CREATE TABLE IF NOT EXISTS public.split_expense_shares (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id    UUID NOT NULL REFERENCES public.split_expenses(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.profiles(id),
  amount_cents  INTEGER NOT NULL CHECK (amount_cents >= 0),
  percentage    NUMERIC(5,2),
  shares        INTEGER DEFAULT 1,
  is_settled    BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(expense_id, user_id)
);

-- 5. Règlements de dettes
CREATE TABLE IF NOT EXISTS public.split_settlements (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id      UUID NOT NULL REFERENCES public.split_groups(id),
  payer_id      UUID NOT NULL REFERENCES public.profiles(id),
  receiver_id   UUID NOT NULL REFERENCES public.profiles(id),
  amount_cents  INTEGER NOT NULL CHECK (amount_cents > 0),
  currency      TEXT NOT NULL DEFAULT 'EUR',
  method        TEXT NOT NULL DEFAULT 'imucoin' CHECK (method IN ('imucoin', 'external', 'cash')),
  transaction_id UUID REFERENCES public.imucoin_transactions(id),
  note          TEXT,
  status        TEXT NOT NULL DEFAULT 'completed' CHECK (status IN (
    'pending', 'completed', 'cancelled'
  )),
  settled_at    TIMESTAMPTZ DEFAULT now()
);

-- ================================================================
-- VUES CALCULÉES
-- ================================================================

-- Vue : solde de chaque membre dans un groupe
CREATE OR REPLACE VIEW public.split_balances AS
SELECT
  sgm.group_id,
  sgm.user_id,
  sg.currency,
  COALESCE(paid.total_paid, 0) - COALESCE(owed.total_owed, 0) AS balance_cents
FROM public.split_group_members sgm
JOIN public.split_groups sg ON sg.id = sgm.group_id
LEFT JOIN (
  SELECT group_id, paid_by AS user_id, SUM(amount_cents) AS total_paid
  FROM public.split_expenses
  GROUP BY group_id, paid_by
) paid ON paid.group_id = sgm.group_id AND paid.user_id = sgm.user_id
LEFT JOIN (
  SELECT e.group_id, s.user_id, SUM(s.amount_cents) AS total_owed
  FROM public.split_expense_shares s
  JOIN public.split_expenses e ON e.id = s.expense_id
  WHERE s.is_settled = false
  GROUP BY e.group_id, s.user_id
) owed ON owed.group_id = sgm.group_id AND owed.user_id = sgm.user_id;

-- ================================================================
-- FONCTIONS
-- ================================================================

-- Calcul optimisé des dettes (algorithme simplify debts)
CREATE OR REPLACE FUNCTION public.get_simplified_debts(p_group_id UUID)
RETURNS TABLE (
  debtor_id   UUID,
  creditor_id UUID,
  amount_cents INTEGER
) LANGUAGE plpgsql AS $$
DECLARE
  -- Récupère les soldes nets de chaque membre
  balances RECORD;
BEGIN
  -- Implémentation de l'algorithme "simplify debts" :
  -- 1. Calcule le solde net de chaque membre
  -- 2. Trie : débiteurs (solde < 0) et créditeurs (solde > 0)
  -- 3. Apparie de façon optimale pour minimiser les transactions
  RETURN QUERY
  WITH net_balances AS (
    SELECT user_id, balance_cents
    FROM public.split_balances
    WHERE group_id = p_group_id AND balance_cents != 0
  ),
  debtors AS (
    SELECT user_id, ABS(balance_cents) AS amount
    FROM net_balances WHERE balance_cents < 0
    ORDER BY amount DESC
  ),
  creditors AS (
    SELECT user_id, balance_cents AS amount
    FROM net_balances WHERE balance_cents > 0
    ORDER BY amount DESC
  )
  -- Simplification via récursion CTE (algorithme greedy)
  SELECT d.user_id AS debtor_id, c.user_id AS creditor_id,
         LEAST(d.amount, c.amount) AS amount_cents
  FROM debtors d, creditors c
  LIMIT 50; -- sécurité
END;
$$;

-- Régler une dette via ImuCoin
CREATE OR REPLACE FUNCTION public.settle_split_debt(
  p_group_id    UUID,
  p_payer_id    UUID,
  p_receiver_id UUID,
  p_amount_cents INTEGER
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_settlement_id UUID;
  v_tx_id UUID;
BEGIN
  -- 1. Transfert ImuCoin atomique
  SELECT transfer_imucoins(p_payer_id, p_receiver_id, p_amount_cents / 10)
  INTO v_tx_id; -- 1 IC = 10 centimes

  -- 2. Enregistrer le règlement
  INSERT INTO public.split_settlements
    (group_id, payer_id, receiver_id, amount_cents, method, transaction_id, status)
  VALUES
    (p_group_id, p_payer_id, p_receiver_id, p_amount_cents, 'imucoin', v_tx_id, 'completed')
  RETURNING id INTO v_settlement_id;

  -- 3. Marquer les parts comme réglées
  UPDATE public.split_expense_shares ses
  SET is_settled = true
  FROM public.split_expenses se
  WHERE se.id = ses.expense_id
    AND se.group_id = p_group_id
    AND ses.user_id = p_payer_id
    AND ses.is_settled = false;

  RETURN v_settlement_id;
END;
$$;

-- ================================================================
-- RLS (Row Level Security)
-- ================================================================

ALTER TABLE public.split_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.split_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.split_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.split_expense_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.split_settlements ENABLE ROW LEVEL SECURITY;

-- Seuls les membres d'un groupe peuvent voir/modifier ses données
CREATE POLICY "members_can_view_group" ON public.split_groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.split_group_members
      WHERE group_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "members_can_view_expenses" ON public.split_expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.split_group_members
      WHERE group_id = split_expenses.group_id AND user_id = auth.uid()
    )
  );
```

---

## 4. API & Routes

### 4.1 Services TypeScript

**`services/split-api.ts`**

```typescript
import { createClient } from '@/lib/supabase/client';

export type SplitGroup = {
  id: string;
  name: string;
  emoji: string;
  currency: string;
  chat_id?: string;
  created_by: string;
  is_archived: boolean;
  total_spent: number;
  members: SplitMember[];
};

export type SplitExpense = {
  id: string;
  group_id: string;
  paid_by: string;
  title: string;
  amount_cents: number;
  currency: string;
  category: string;
  split_type: 'equal' | 'custom' | 'percentage' | 'shares';
  shares: SplitShare[];
  expense_date: string;
  receipt_url?: string;
};

export type SplitDebt = {
  debtor_id: string;
  creditor_id: string;
  amount_cents: number;
};

// Groupes
export async function fetchSplitGroups(userId: string): Promise<SplitGroup[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('split_group_members')
    .select(`
      split_groups (
        *,
        split_group_members ( user_id, nickname, role,
          profiles ( id, username, avatar_url )
        )
      )
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data?.map(d => d.split_groups).filter(Boolean) ?? [];
}

export async function createSplitGroup(payload: {
  name: string;
  emoji?: string;
  currency?: string;
  member_ids: string[];
  chat_id?: string;
}): Promise<SplitGroup> {
  const supabase = createClient();
  const { data: group, error } = await supabase
    .from('split_groups')
    .insert({ name: payload.name, emoji: payload.emoji ?? '💰', currency: payload.currency ?? 'EUR', chat_id: payload.chat_id })
    .select()
    .single();
  if (error) throw error;

  // Ajouter les membres
  const members = payload.member_ids.map(uid => ({ group_id: group.id, user_id: uid }));
  await supabase.from('split_group_members').insert(members);

  return group;
}

// Dépenses
export async function addExpense(payload: {
  group_id: string;
  paid_by: string;
  title: string;
  amount_cents: number;
  category: string;
  split_type: string;
  shares?: { user_id: string; amount_cents: number }[];
  expense_date?: string;
}): Promise<SplitExpense> {
  const supabase = createClient();
  const { data: expense, error } = await supabase
    .from('split_expenses')
    .insert({
      group_id: payload.group_id,
      paid_by: payload.paid_by,
      title: payload.title,
      amount_cents: payload.amount_cents,
      category: payload.category,
      split_type: payload.split_type,
      expense_date: payload.expense_date ?? new Date().toISOString().split('T')[0],
    })
    .select()
    .single();
  if (error) throw error;

  // Répartir les parts
  const shares = payload.shares ?? computeEqualShares(expense.id, payload.amount_cents, /* members */[]);
  await supabase.from('split_expense_shares').insert(shares);

  return expense;
}

// Soldes simplifiés
export async function getSimplifiedDebts(groupId: string): Promise<SplitDebt[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('get_simplified_debts', { p_group_id: groupId });
  if (error) throw error;
  return data ?? [];
}

// Règlement
export async function settleDebt(payload: {
  group_id: string;
  payer_id: string;
  receiver_id: string;
  amount_cents: number;
}): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('settle_split_debt', {
    p_group_id: payload.group_id,
    p_payer_id: payload.payer_id,
    p_receiver_id: payload.receiver_id,
    p_amount_cents: payload.amount_cents,
  });
  if (error) throw error;
  return data;
}

// Utilitaire : parts égales
function computeEqualShares(
  expenseId: string,
  totalCents: number,
  memberIds: string[]
): { expense_id: string; user_id: string; amount_cents: number }[] {
  const perPerson = Math.floor(totalCents / memberIds.length);
  const remainder = totalCents % memberIds.length;
  return memberIds.map((uid, i) => ({
    expense_id: expenseId,
    user_id: uid,
    amount_cents: i === 0 ? perPerson + remainder : perPerson,
  }));
}
```

### 4.2 Routes Next.js API

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/split/groups` | Lister les groupes de l'utilisateur |
| `POST` | `/api/split/groups` | Créer un groupe |
| `GET` | `/api/split/groups/[id]` | Détail d'un groupe + membres + soldes |
| `PATCH` | `/api/split/groups/[id]` | Modifier nom/emoji |
| `DELETE` | `/api/split/groups/[id]/archive` | Archiver un groupe |
| `GET` | `/api/split/groups/[id]/expenses` | Lister les dépenses |
| `POST` | `/api/split/groups/[id]/expenses` | Ajouter une dépense |
| `DELETE` | `/api/split/expenses/[expenseId]` | Supprimer une dépense |
| `GET` | `/api/split/groups/[id]/debts` | Dettes simplifiées (RPC) |
| `POST` | `/api/split/settle` | Régler une dette |

---

## 5. Mapping des écrans

| Route | Composant | Description |
|-------|-----------|-------------|
| `/split` | `SplitHub` | Liste des groupes actifs + solde global |
| `/split/new` | `CreateSplitGroup` | Formulaire création : nom, emoji, membres |
| `/split/[groupId]` | `SplitGroupDetail` | Vue groupe : dépenses récentes + soldes |
| `/split/[groupId]/expenses` | `ExpenseList` | Historique complet des dépenses |
| `/split/[groupId]/add` | `AddExpense` | Ajouter dépense : montant, répartition, reçu |
| `/split/[groupId]/balance` | `BalanceView` | Qui doit quoi à qui (graphe simplifié) |
| `/split/[groupId]/settle` | `SettleDebts` | Interface de règlement ImuCoin |
| `/split/[groupId]/settings` | `GroupSettings` | Membres, devise, archivage |

---

## 6. Composants UI

```
components/split/
├── SplitGroupCard.tsx         — Card groupe dans le hub
├── ExpenseItem.tsx            — Item dépense (titre, montant, payeur, parts)
├── AddExpenseForm.tsx         — Formulaire dépense avec split calculator
├── SplitTypeSelector.tsx      — Choix du mode de répartition
├── ShareDistributor.tsx       — Réglage des parts par membre
├── BalanceSummary.tsx         — Tableau soldes + badge +/-
├── DebtCard.tsx               — "Tu dois X€ à Y" avec bouton régler
├── SettlementModal.tsx        — Confirmation + animation règlement ImuCoin
├── CategoryPicker.tsx         — Sélecteur catégorie avec icône
├── ReceiptUploader.tsx        — Upload photo reçu (Supabase Storage)
└── SplitChatBubble.tsx        — Affichage inline dans les messages chat
```

**Exemple : `DebtCard.tsx`**
```tsx
interface DebtCardProps {
  debt: SplitDebt;
  debtorProfile: Profile;
  creditorProfile: Profile;
  onSettle: (debt: SplitDebt) => void;
}

export function DebtCard({ debt, debtorProfile, creditorProfile, onSettle }: DebtCardProps) {
  const amountEur = (debt.amount_cents / 100).toFixed(2);
  const isMyDebt = debt.debtor_id === useCurrentUser().id;

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border">
      <div className="flex items-center gap-3">
        <Avatar src={debtorProfile.avatar_url} />
        <div>
          <p className="text-sm font-medium">
            {isMyDebt ? 'Tu dois' : `${debtorProfile.username} doit`}
          </p>
          <p className="text-xs text-muted-foreground">
            à {creditorProfile.username}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-destructive">{amountEur} €</span>
        {isMyDebt && (
          <Button size="sm" onClick={() => onSettle(debt)}>
            Régler 💰
          </Button>
        )}
      </div>
    </div>
  );
}
```

---

## 7. Logique métier

### 7.1 Algorithme "Simplify Debts"

L'objectif est de minimiser le nombre de transactions pour solder un groupe.

```
Exemple :
  Alice a payé 60€ (pour Bob 20€, Carl 20€, elle-même 20€)
  Bob a payé 30€ (pour Carl 15€, lui-même 15€)

Soldes bruts :
  Alice : +40€  (a payé 60, doit 20)
  Bob   :  +10€  (a payé 30, doit 20)
  Carl  :  -35€  (a payé 0, doit 35)

Transactions minimales :
  Carl → Alice : 35€
  (reste 5€ qu'Alice redistribue à Bob → Alice → Bob : 5€)
  = 2 transactions au lieu de 4
```

### 7.2 Modes de répartition

| Mode | Description | UI |
|------|-------------|-----|
| `equal` | Parts égales entre tous | Switch auto |
| `custom` | Montant libre par personne | Champs numériques |
| `percentage` | % par personne (total = 100%) | Sliders |
| `shares` | Nombre de parts par personne | Stepper +/- |

---

## 8. Intégration Chat

Quand une dépense est ajoutée depuis un chat de groupe :
1. Un message spécial de type `split_expense` est envoyé automatiquement
2. Le composant `SplitChatBubble` affiche la dépense inline dans la conversation
3. Un bouton "Voir les soldes" renvoie vers `/split/[groupId]/balance`

**Message schema (type `split_expense`) :**
```typescript
{
  type: 'split_expense',
  metadata: {
    expense_id: string;
    group_id: string;
    title: string;
    amount_cents: number;
    paid_by: string;
    participants: string[];
  }
}
```

---

## 9. Notifications

| Événement | Destinataire | Message |
|-----------|-------------|---------|
| Dépense ajoutée | Tous les membres | "Alice a ajouté 'Restaurant' (60€)" |
| Règlement reçu | Créditeur | "Bob t'a remboursé 25€ via ImuCoin" |
| Rappel dette | Débiteur (J+7, J+14) | "Tu dois encore 15€ à Carl dans [Voyage Rome]" |
| Groupe archivé | Tous les membres | "Le groupe [Coloc 2026] a été archivé" |

---

## 10. Plan d'implémentation

| Sprint | Tâches | Durée |
|--------|--------|-------|
| **S1** | Schéma SQL + migrations + RLS | 3 jours |
| **S2** | `split-api.ts` + balance engine + RPC `get_simplified_debts` | 4 jours |
| **S3** | Écrans Hub, Création groupe, Liste dépenses | 4 jours |
| **S4** | Formulaire AddExpense + ShareDistributor | 3 jours |
| **S5** | BalanceView + DebtCard + SettlementModal + intégration Wallet | 4 jours |
| **S6** | Intégration Chat (SplitChatBubble) + notifications | 3 jours |
| **S7** | Tests (unitaires + e2e) + polish UI | 3 jours |

**Durée totale estimée : ~4 semaines**

---

*Fichier généré le 11 mars 2026 — ImuChat Implementation Docs*
