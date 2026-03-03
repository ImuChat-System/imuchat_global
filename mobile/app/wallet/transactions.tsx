/**
 * TransactionsScreen — DEV-033
 *
 * Full transaction history with filters (type, status, search).
 * Route: /wallet/transactions
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useWalletStore } from "@/stores/wallet-store";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import type { Transaction, TransactionFilterType } from "@/types/wallet";

const FILTER_TYPES: { key: TransactionFilterType; icon: string }[] = [
  { key: "all", icon: "📋" },
  { key: "earn", icon: "🏆" },
  { key: "spend", icon: "🛒" },
  { key: "send", icon: "↗️" },
  { key: "receive", icon: "↙️" },
  { key: "topup", icon: "💳" },
  { key: "cashout", icon: "🏦" },
  { key: "refund", icon: "↩️" },
];

export default function TransactionsScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();

  const {
    transactions,
    isLoading,
    loadTransactions,
    getTransactionIcon,
    formatAmount,
    setTransactionFilter,
    getFilteredTransactions,
    transactionFilter,
  } = useWalletStore();

  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  }, [loadTransactions]);

  const handleFilterType = useCallback(
    (type: TransactionFilterType) => {
      setTransactionFilter({ type });
    },
    [setTransactionFilter],
  );

  const handleSearch = useCallback(
    (text: string) => {
      setSearch(text);
      setTransactionFilter({ search: text || undefined });
    },
    [setTransactionFilter],
  );

  const filtered = useMemo(
    () => getFilteredTransactions(),
    [transactions, transactionFilter, getFilteredTransactions],
  );

  const renderTransaction = useCallback(
    ({ item: tx }: { item: Transaction }) => {
      const isPositive = tx.amount >= 0;
      return (
        <View
          testID={`tx-${tx.id}`}
          style={[
            styles.txRow,
            {
              borderBottomColor: colors.border,
              backgroundColor: colors.surface,
            },
          ]}
        >
          <Text style={styles.txIcon}>{getTransactionIcon(tx.type)}</Text>
          <View style={styles.txInfo}>
            <Text
              style={[styles.txDesc, { color: colors.text }]}
              numberOfLines={1}
            >
              {tx.description}
            </Text>
            <Text style={[styles.txDate, { color: colors.textMuted }]}>
              {new Date(tx.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              {tx.counterpartyName ? ` · ${tx.counterpartyName}` : ""}
            </Text>
          </View>
          <View style={styles.txRight}>
            <Text
              style={[
                styles.txAmount,
                { color: isPositive ? "#22c55e" : "#ef4444" },
              ]}
            >
              {formatAmount(tx.amount)}
            </Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    tx.status === "completed"
                      ? "#22c55e20"
                      : tx.status === "pending"
                        ? "#f59e0b20"
                        : "#ef444420",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      tx.status === "completed"
                        ? "#22c55e"
                        : tx.status === "pending"
                          ? "#f59e0b"
                          : "#ef4444",
                  },
                ]}
              >
                {t(`wallet.status_${tx.status}`) || tx.status}
              </Text>
            </View>
          </View>
        </View>
      );
    },
    [colors, getTransactionIcon, formatAmount, t],
  );

  return (
    <View
      testID="transactions-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Search bar */}
      <View style={[styles.searchBar, { padding: spacing.md }]}>
        <View
          style={[
            styles.searchInput,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            testID="search-input"
            style={[styles.searchText, { color: colors.text }]}
            placeholder={t("wallet.searchTransactions") || "Rechercher..."}
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={handleSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter chips */}
      <View style={[styles.filterRow, { paddingHorizontal: spacing.md }]}>
        {FILTER_TYPES.map((f) => {
          const active = transactionFilter.type === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              testID={`filter-${f.key}`}
              onPress={() => handleFilterType(f.key)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: active ? colors.primary : colors.surface,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={styles.filterIcon}>{f.icon}</Text>
              <Text
                style={[
                  styles.filterLabel,
                  { color: active ? "#fff" : colors.textMuted },
                ]}
              >
                {t(`wallet.filter_${f.key}`) || f.key}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Count */}
      <Text
        style={[
          styles.countText,
          { color: colors.textMuted, paddingHorizontal: spacing.md },
        ]}
      >
        {filtered.length} {t("wallet.transactionsCount") || "transaction(s)"}
      </Text>

      {/* List */}
      <FlatList
        testID="transactions-list"
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={{
          paddingHorizontal: spacing.md,
          paddingBottom: 40,
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {t("wallet.noTransactions") || "Aucune transaction"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: {},
  searchInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchText: { flex: 1, fontSize: 14 },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  filterIcon: { fontSize: 12 },
  filterLabel: { fontSize: 12, fontWeight: "500" },
  countText: { fontSize: 12, marginBottom: 8 },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    marginBottom: 4,
  },
  txIcon: { fontSize: 22, marginRight: 12 },
  txInfo: { flex: 1 },
  txDesc: { fontSize: 14, fontWeight: "500" },
  txDate: { fontSize: 12, marginTop: 2 },
  txRight: { alignItems: "flex-end" },
  txAmount: { fontSize: 14, fontWeight: "700", fontVariant: ["tabular-nums"] },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  statusText: { fontSize: 10, fontWeight: "600" },
  emptyContainer: { padding: 40, alignItems: "center" },
  emptyText: { fontSize: 14, textAlign: "center" },
});
