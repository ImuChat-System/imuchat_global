# 💳 Budget Perso — Document d'Implémentation Complet

> **Version** : 1.0  
> **Date** : 11 mars 2026  
> **Statut** : 📐 Spécification — prêt pour développement  
> **Priorité** : 🟠 P1 — Rétention forte, usage quotidien/mensuel  
> **Dépendances** : `wallet` (ImuCoin + transactions), `notifications`, `ai-assistant` (optionnel)

---

## Table des matières

1. [Vision & Positionnement](#1-vision--positionnement)
2. [Architecture générale](#2-architecture-générale)
3. [Schéma de base de données](#3-schéma-de-base-de-données)
4. [API & Routes](#4-api--routes)
5. [Mapping des écrans](#5-mapping-des-écrans)
6. [Composants UI & Graphiques](#6-composants-ui--graphiques)
7. [Logique métier](#7-logique-métier)
8. [Intégration Wallet ImuCoin](#8-intégration-wallet-imucoin)
9. [Plan d'implémentation](#9-plan-dimplémentation)

---

## 1. Vision & Positionnement

Budget Perso est un **gestionnaire de finances personnelles** intégré à ImuChat. L'utilisateur suit ses revenus et dépenses, visualise ses habitudes de consommation, fixe des budgets par catégorie, et reçoit des alertes intelligentes.

**Différenciateur vs apps bancaires :**
- Intégration native avec le Wallet ImuCoin
- Partage possible avec la famille (mode "foyer")
- Conseils IA via ImuCoach Finance (Léa)
- Interface dans une super-app déjà utilisée quotidiennement

**Scope MVP :**
- Saisie manuelle des dépenses/revenus
- Catégories personnalisables
- Budgets mensuels par catégorie
- Graphiques de synthèse
- Alertes de dépassement
- Import automatique des transactions ImuCoin/Wallet

---

## 2. Architecture générale

```
Budget Perso
│
├── Core Layer
│   ├── BudgetContext (React)
│   ├── useBudget hook
│   └── budget-store (Zustand)
│
├── Services
│   ├── budget-api.ts          — CRUD transactions, budgets, catégories
│   ├── budget-analytics.ts    — Calculs agrégats, tendances
│   └── budget-importer.ts     — Import depuis Wallet ImuCoin
│
├── Routes (Next.js)
│   ├── /budget/               — Dashboard principal
│   ├── /budget/transactions   — Liste & saisie transactions
│   ├── /budget/budgets        — Gestion budgets par catégorie
│   ├── /budget/reports        — Rapports mensuels / annuels
│   └── /budget/settings       — Catégories, devises, alertes
│
└── Notifications (Supabase Realtime + pg_cron)
    ├── budget-alert-trigger   — Dépassement budget
    └── monthly-report-cron    — Rapport mensuel auto
```

---

## 3. Schéma de base de données

```sql
-- ================================================================
-- BUDGET PERSO — SCHÉMA SUPABASE
-- ================================================================

-- 1. Catégories de dépenses/revenus
CREATE TABLE IF NOT EXISTS public.budget_categories (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL = catégorie système
  name        TEXT NOT NULL,
  emoji       TEXT NOT NULL DEFAULT '💳',
  color       TEXT NOT NULL DEFAULT '#6366f1', -- hex color
  type        TEXT NOT NULL CHECK (type IN ('expense', 'income', 'both')),
  is_system   BOOLEAN NOT NULL DEFAULT false, -- catégories système non supprimables
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Catégories système par défaut
INSERT INTO public.budget_categories (name, emoji, color, type, is_system, sort_order) VALUES
  ('Alimentation',      '🛒', '#22c55e', 'expense', true, 1),
  ('Logement',          '🏠', '#3b82f6', 'expense', true, 2),
  ('Transport',         '🚗', '#f59e0b', 'expense', true, 3),
  ('Santé',             '💊', '#ef4444', 'expense', true, 4),
  ('Loisirs',           '🎭', '#8b5cf6', 'expense', true, 5),
  ('Vêtements',         '👗', '#ec4899', 'expense', true, 6),
  ('Restaurants',       '🍽️', '#f97316', 'expense', true, 7),
  ('Abonnements',       '📱', '#06b6d4', 'expense', true, 8),
  ('Épargne',           '🏦', '#10b981', 'expense', true, 9),
  ('Autre',             '📦', '#94a3b8', 'expense', true, 10),
  ('Salaire',           '💼', '#22c55e', 'income',  true, 11),
  ('Freelance',         '💻', '#3b82f6', 'income',  true, 12),
  ('Investissements',   '📈', '#f59e0b', 'income',  true, 13),
  ('Aides & CAF',       '🏛️', '#8b5cf6', 'income',  true, 14),
  ('Autre revenu',      '➕', '#94a3b8', 'income',  true, 15);

-- 2. Comptes financiers de l'utilisateur
CREATE TABLE IF NOT EXISTS public.budget_accounts (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'checking' CHECK (type IN (
    'checking', 'savings', 'cash', 'investment', 'imucoin'
  )),
  balance_cents INTEGER NOT NULL DEFAULT 0,
  currency    TEXT NOT NULL DEFAULT 'EUR',
  is_default  BOOLEAN NOT NULL DEFAULT false,
  color       TEXT DEFAULT '#6366f1',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 3. Transactions
CREATE TABLE IF NOT EXISTS public.budget_transactions (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_id      UUID NOT NULL REFERENCES public.budget_accounts(id) ON DELETE CASCADE,
  category_id     UUID REFERENCES public.budget_categories(id),
  type            TEXT NOT NULL CHECK (type IN ('expense', 'income', 'transfer')),
  amount_cents    INTEGER NOT NULL CHECK (amount_cents > 0),
  currency        TEXT NOT NULL DEFAULT 'EUR',
  title           TEXT NOT NULL,
  note            TEXT,
  tags            TEXT[] DEFAULT '{}',
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_recurring    BOOLEAN NOT NULL DEFAULT false,
  recurrence_rule TEXT, -- 'monthly', 'weekly', 'yearly'
  source          TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'imucoin', 'import')),
  external_ref    TEXT, -- référence transaction wallet ImuCoin si source='imucoin'
  receipt_url     TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_budget_tx_user_date ON public.budget_transactions(user_id, transaction_date DESC);
CREATE INDEX idx_budget_tx_category  ON public.budget_transactions(category_id);

-- 4. Budgets par catégorie (mensuel)
CREATE TABLE IF NOT EXISTS public.budget_limits (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id     UUID NOT NULL REFERENCES public.budget_categories(id),
  monthly_limit_cents INTEGER NOT NULL CHECK (monthly_limit_cents > 0),
  alert_at_percent INTEGER NOT NULL DEFAULT 80 CHECK (alert_at_percent BETWEEN 10 AND 100),
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, category_id)
);

-- 5. Objectifs d'épargne
CREATE TABLE IF NOT EXISTS public.budget_savings_goals (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  emoji           TEXT DEFAULT '🎯',
  target_cents    INTEGER NOT NULL CHECK (target_cents > 0),
  current_cents   INTEGER NOT NULL DEFAULT 0,
  target_date     DATE,
  color           TEXT DEFAULT '#22c55e',
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ================================================================
-- VUES & FONCTIONS ANALYTIQUES
-- ================================================================

-- Vue : dépenses par catégorie pour le mois courant
CREATE OR REPLACE VIEW public.budget_monthly_summary AS
SELECT
  t.user_id,
  t.category_id,
  c.name AS category_name,
  c.emoji,
  c.color,
  t.type,
  DATE_TRUNC('month', t.transaction_date) AS month,
  SUM(t.amount_cents) AS total_cents,
  COUNT(*) AS transaction_count
FROM public.budget_transactions t
JOIN public.budget_categories c ON c.id = t.category_id
GROUP BY t.user_id, t.category_id, c.name, c.emoji, c.color, t.type, DATE_TRUNC('month', t.transaction_date);

-- Fonction : vérifier les dépassements de budget
CREATE OR REPLACE FUNCTION public.check_budget_alerts(p_user_id UUID)
RETURNS TABLE (
  category_id UUID,
  category_name TEXT,
  monthly_limit_cents INTEGER,
  current_spent_cents INTEGER,
  percent_used INTEGER,
  alert_threshold INTEGER
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    bl.category_id,
    bc.name,
    bl.monthly_limit_cents,
    COALESCE(SUM(bt.amount_cents), 0)::INTEGER AS current_spent,
    CASE 
      WHEN bl.monthly_limit_cents > 0 
      THEN (COALESCE(SUM(bt.amount_cents), 0) * 100 / bl.monthly_limit_cents)::INTEGER
      ELSE 0
    END AS pct,
    bl.alert_at_percent
  FROM public.budget_limits bl
  JOIN public.budget_categories bc ON bc.id = bl.category_id
  LEFT JOIN public.budget_transactions bt ON bt.category_id = bl.category_id
    AND bt.user_id = p_user_id
    AND bt.transaction_date >= DATE_TRUNC('month', CURRENT_DATE)
    AND bt.type = 'expense'
  WHERE bl.user_id = p_user_id AND bl.is_active = true
  GROUP BY bl.category_id, bc.name, bl.monthly_limit_cents, bl.alert_at_percent
  HAVING COALESCE(SUM(bt.amount_cents), 0) * 100 / NULLIF(bl.monthly_limit_cents, 0) >= bl.alert_at_percent;
END;
$$;

-- RLS
ALTER TABLE public.budget_transactions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_accounts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_limits         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_savings_goals  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_budget_data" ON public.budget_transactions  USING (user_id = auth.uid());
CREATE POLICY "users_own_accounts"    ON public.budget_accounts       USING (user_id = auth.uid());
CREATE POLICY "users_own_limits"      ON public.budget_limits         USING (user_id = auth.uid());
CREATE POLICY "users_own_savings"     ON public.budget_savings_goals  USING (user_id = auth.uid());
```

---

## 4. API & Routes

### 4.1 Routes Next.js API

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/budget/transactions` | Liste transactions (filtrable par mois, catégorie, type) |
| `POST` | `/api/budget/transactions` | Ajouter une transaction |
| `PATCH` | `/api/budget/transactions/[id]` | Modifier |
| `DELETE` | `/api/budget/transactions/[id]` | Supprimer |
| `GET` | `/api/budget/accounts` | Mes comptes |
| `POST` | `/api/budget/accounts` | Créer un compte |
| `GET` | `/api/budget/summary` | Résumé mensuel (revenus - dépenses + par catégorie) |
| `GET` | `/api/budget/limits` | Budgets par catégorie |
| `POST` | `/api/budget/limits` | Définir un budget |
| `GET` | `/api/budget/alerts` | Alertes de dépassement actives |
| `GET` | `/api/budget/categories` | Catégories (système + perso) |
| `POST` | `/api/budget/categories` | Créer catégorie perso |
| `GET` | `/api/budget/savings` | Objectifs d'épargne |
| `POST` | `/api/budget/savings` | Créer un objectif |
| `PATCH` | `/api/budget/savings/[id]` | Mettre à jour progression |
| `GET` | `/api/budget/reports/[year]/[month]` | Rapport mensuel complet |
| `POST` | `/api/budget/import/imucoin` | Import transactions ImuCoin |

### 4.2 Service TypeScript

```typescript
// services/budget-api.ts

export type BudgetSummary = {
  month: string;
  total_income_cents: number;
  total_expense_cents: number;
  balance_cents: number;
  by_category: {
    category_id: string;
    category_name: string;
    emoji: string;
    color: string;
    total_cents: number;
    percent_of_expenses: number;
    budget_limit?: number;
    budget_used_percent?: number;
  }[];
};

export async function fetchMonthlySummary(year: number, month: number): Promise<BudgetSummary> {
  const { data } = await supabase
    .from('budget_monthly_summary')
    .select('*')
    .eq('user_id', currentUser.id)
    .eq('month', `${year}-${String(month).padStart(2, '0')}-01`);

  return computeSummary(data ?? []);
}

export async function importImuCoinTransactions(): Promise<number> {
  // Récupérer les transactions ImuCoin pas encore importées
  const { data: imuTxs } = await supabase
    .from('imucoin_transactions')
    .select('*')
    .eq('user_id', currentUser.id)
    .not('id', 'in', await getAlreadyImportedRefs());

  // Mapper vers les catégories budget
  const mapped = imuTxs?.map(tx => ({
    user_id: currentUser.id,
    account_id: await getImuCoinAccountId(),
    category_id: mapImuCoinTypeToCategory(tx.type),
    type: tx.type === 'purchase' || tx.type === 'module_buy' ? 'expense' : 'income',
    amount_cents: tx.amount * 10, // 1 IC = 10 centimes
    title: tx.description ?? `ImuCoin — ${tx.type}`,
    source: 'imucoin',
    external_ref: tx.id,
    transaction_date: tx.created_at.split('T')[0],
  })) ?? [];

  if (mapped.length > 0) {
    await supabase.from('budget_transactions').insert(mapped);
  }

  return mapped.length;
}
```

---

## 5. Mapping des écrans

| Route | Composant | Description |
|-------|-----------|-------------|
| `/budget` | `BudgetDashboard` | Balance du mois + graphique catégories + alertes |
| `/budget/transactions` | `TransactionList` | Liste avec filtres + bouton ajouter |
| `/budget/transactions/new` | `AddTransaction` | Formulaire ajout (montant, catégorie, date, note) |
| `/budget/budgets` | `BudgetLimits` | Budgets par catégorie + progression |
| `/budget/savings` | `SavingsGoals` | Objectifs d'épargne + contributions |
| `/budget/reports` | `BudgetReports` | Rapports mensuels / annuels avec graphiques |
| `/budget/settings` | `BudgetSettings` | Catégories, comptes, alertes, import |

---

## 6. Composants UI & Graphiques

```
components/budget/
├── BudgetDashboardHeader.tsx    — Solde du mois (revenus - dépenses)
├── CategoryDonutChart.tsx       — Donut chart répartition dépenses (Recharts)
├── MonthlyBarChart.tsx          — Revenus vs dépenses sur 6 mois
├── TransactionItem.tsx          — Item transaction avec catégorie + montant
├── AddTransactionForm.tsx       — Formulaire ajout rapide
├── CategoryBudgetBar.tsx        — Barre de progression budget/catégorie
├── BudgetAlertBanner.tsx        — Bannière alerte dépassement
├── SavingsGoalCard.tsx          — Card objectif épargne avec progression
├── MonthPicker.tsx              — Navigateur de mois
├── CategoryPicker.tsx           — Sélecteur catégorie avec couleur/emoji
├── RecurringTransactionBadge.tsx — Badge "récurrent"
└── BudgetImportModal.tsx        — Import depuis ImuCoin Wallet
```

**Exemple : `CategoryDonutChart.tsx`**

```tsx
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CategoryDonutChartProps {
  data: { category_name: string; total_cents: number; color: string; emoji: string }[];
}

export function CategoryDonutChart({ data }: CategoryDonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.total_cents, 0);

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            dataKey="total_cents"
            nameKey="category_name"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`${(value / 100).toFixed(2)} €`, '']}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Total au centre */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <p className="text-2xl font-bold">{(total / 100).toFixed(0)} €</p>
          <p className="text-xs text-muted-foreground">ce mois</p>
        </div>
      </div>
    </div>
  );
}
```

---

## 7. Logique métier

### 7.1 Règle 50/30/20 (intégrée au onboarding)

Au premier lancement, si l'utilisateur saisit son revenu mensuel, Budget Perso propose automatiquement des budgets pré-configurés selon la règle 50/30/20 :

```typescript
function suggestBudgets(monthlyIncomeCents: number): SuggestedBudget[] {
  const needs = monthlyIncomeCents * 0.50;   // Essentiels (logement, alimentaire, transport)
  const wants = monthlyIncomeCents * 0.30;   // Loisirs, restaurants, shopping
  const savings = monthlyIncomeCents * 0.20; // Épargne

  return [
    { category: 'Logement',      limit: needs * 0.60,  group: 'needs' },
    { category: 'Alimentation',  limit: needs * 0.25,  group: 'needs' },
    { category: 'Transport',     limit: needs * 0.15,  group: 'needs' },
    { category: 'Loisirs',       limit: wants * 0.40,  group: 'wants' },
    { category: 'Restaurants',   limit: wants * 0.30,  group: 'wants' },
    { category: 'Vêtements',     limit: wants * 0.30,  group: 'wants' },
    { category: 'Épargne',       limit: savings,       group: 'savings' },
  ];
}
```

### 7.2 Transactions récurrentes

Les transactions récurrentes (loyer, abonnements) sont automatiquement proposées à l'utilisateur chaque mois :

```sql
-- pg_cron : 1er de chaque mois
SELECT cron.schedule('generate-recurring-transactions', '0 8 1 * *',
  $$ SELECT public.generate_recurring_transactions() $$
);

CREATE OR REPLACE FUNCTION public.generate_recurring_transactions()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.budget_transactions
    (user_id, account_id, category_id, type, amount_cents, title, transaction_date, source, is_recurring)
  SELECT
    user_id, account_id, category_id, type, amount_cents,
    title, CURRENT_DATE, 'auto_recurring', true
  FROM public.budget_transactions
  WHERE is_recurring = true
    AND recurrence_rule = 'monthly'
    AND transaction_date = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month');
END;
$$;
```

---

## 8. Intégration Wallet ImuCoin

Les transactions ImuCoin sont automatiquement détectables et importables :

| Transaction ImuCoin | Catégorie Budget | Type |
|--------------------|-----------------|------|
| `purchase` (top-up) | Autre revenu | income |
| `module_buy` | Abonnements | expense |
| `subscription` | Abonnements | expense |
| `reward` | Autre revenu | income |
| `transfer` (envoyé) | Autre | expense |
| `transfer` (reçu) | Autre revenu | income |

---

## 9. Plan d'implémentation

| Sprint | Tâches | Durée |
|--------|--------|-------|
| **S1** | Schéma SQL + catégories système + RLS | 3 jours |
| **S2** | `budget-api.ts` + CRUD transactions + comptes | 4 jours |
| **S3** | BudgetDashboard + CategoryDonutChart + MonthlyBarChart | 4 jours |
| **S4** | TransactionList + AddTransactionForm | 3 jours |
| **S5** | BudgetLimits + alertes dépassement | 3 jours |
| **S6** | SavingsGoals + progression | 2 jours |
| **S7** | Import ImuCoin + transactions récurrentes (CRON) | 3 jours |
| **S8** | BudgetReports + onboarding 50/30/20 + tests | 3 jours |

**Durée totale estimée : ~4.5 semaines**

---

*Fichier généré le 11 mars 2026 — ImuChat Implementation Docs*
