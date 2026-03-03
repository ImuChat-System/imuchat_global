/**
 * InvoicesScreen — DEV-033
 *
 * Factures & reçus : liste des factures avec filtres et téléchargement PDF.
 * Route: /wallet/invoices
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useWalletStore } from "@/stores/wallet-store";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import type { Invoice, InvoiceType } from "@/types/wallet";

const INVOICE_ICONS: Record<InvoiceType, string> = {
  topup: "💳",
  subscription: "⭐",
  purchase: "🛒",
  withdrawal: "🏦",
};

const FILTER_TABS: { key: "all" | InvoiceType; label: string }[] = [
  { key: "all", label: "wallet.invoicesAll" },
  { key: "subscription", label: "wallet.invoicesSub" },
  { key: "topup", label: "wallet.invoicesTopup" },
  { key: "purchase", label: "wallet.invoicesPurchase" },
];

export default function InvoicesScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();

  const { invoices, loadInvoices } = useWalletStore();

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | InvoiceType>("all");

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadInvoices();
    setRefreshing(false);
  }, [loadInvoices]);

  const filteredInvoices =
    filter === "all" ? invoices : invoices.filter((inv) => inv.type === filter);

  const handleDownload = useCallback(
    (invoice: Invoice) => {
      if (invoice.pdfUrl) {
        Linking.openURL(invoice.pdfUrl);
      } else {
        Alert.alert(
          t("wallet.invoiceNoPdf") || "PDF non disponible",
          t("wallet.invoiceNoPdfMsg") ||
            "Le reçu PDF n'est pas encore disponible pour cette facture.",
        );
      }
    },
    [t],
  );

  const renderInvoice = useCallback(
    ({ item: inv }: { item: Invoice }) => (
      <View
        testID={`invoice-${inv.id}`}
        style={[
          styles.invoiceCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.invoiceHeader}>
          <Text style={styles.invoiceIcon}>
            {INVOICE_ICONS[inv.type] || "📄"}
          </Text>
          <View style={styles.invoiceInfo}>
            <Text
              style={[styles.invoiceDesc, { color: colors.text }]}
              numberOfLines={1}
            >
              {inv.description}
            </Text>
            <Text style={[styles.invoiceDate, { color: colors.textMuted }]}>
              {new Date(inv.issuedAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </View>
          <View style={styles.invoiceRight}>
            <Text style={[styles.invoiceTotal, { color: colors.text }]}>
              {inv.total.toFixed(2)} €
            </Text>
            <View
              style={[
                styles.invoiceStatusBadge,
                {
                  backgroundColor:
                    inv.status === "paid"
                      ? "#22c55e20"
                      : inv.status === "refunded"
                        ? "#f59e0b20"
                        : "#3b82f620",
                },
              ]}
            >
              <Text
                style={[
                  styles.invoiceStatusText,
                  {
                    color:
                      inv.status === "paid"
                        ? "#22c55e"
                        : inv.status === "refunded"
                          ? "#f59e0b"
                          : "#3b82f6",
                  },
                ]}
              >
                {t(`wallet.invoiceStatus_${inv.status}`) || inv.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Details row */}
        <View style={[styles.detailsRow, { borderTopColor: colors.border }]}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
              {t("wallet.invoiceSubtotal") || "HT"}
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {inv.amount.toFixed(2)} €
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
              {t("wallet.invoiceTax") || "TVA"}
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {inv.tax.toFixed(2)} €
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
              {t("wallet.invoiceRef") || "Réf."}
            </Text>
            <Text
              style={[styles.detailValue, { color: colors.textMuted }]}
              numberOfLines={1}
            >
              #{inv.id}
            </Text>
          </View>
          <TouchableOpacity
            testID={`download-${inv.id}`}
            onPress={() => handleDownload(inv)}
            style={[
              styles.downloadBtn,
              { backgroundColor: colors.primary + "15" },
            ]}
          >
            <Ionicons
              name="download-outline"
              size={16}
              color={colors.primary}
            />
            <Text style={[styles.downloadText, { color: colors.primary }]}>
              PDF
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [colors, handleDownload, t],
  );

  return (
    <View
      testID="invoices-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Filter tabs */}
      <View style={[styles.filterRow, { padding: spacing.md }]}>
        {FILTER_TABS.map((tab) => {
          const active = filter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              testID={`filter-${tab.key}`}
              onPress={() => setFilter(tab.key)}
              style={[
                styles.filterTab,
                {
                  backgroundColor: active ? colors.primary : colors.surface,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterTabText,
                  { color: active ? "#fff" : colors.textMuted },
                ]}
              >
                {t(tab.label) || tab.key}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        testID="invoices-list"
        data={filteredInvoices}
        keyExtractor={(item) => item.id}
        renderItem={renderInvoice}
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
            <Ionicons
              name="receipt-outline"
              size={48}
              color={colors.textMuted}
            />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              {t("wallet.noInvoices") || "Aucune facture"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterTabText: { fontSize: 13, fontWeight: "500" },
  invoiceCard: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    overflow: "hidden",
  },
  invoiceHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  invoiceIcon: { fontSize: 24 },
  invoiceInfo: { flex: 1 },
  invoiceDesc: { fontSize: 14, fontWeight: "600" },
  invoiceDate: { fontSize: 12, marginTop: 2 },
  invoiceRight: { alignItems: "flex-end" },
  invoiceTotal: { fontSize: 16, fontWeight: "700" },
  invoiceStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  invoiceStatusText: { fontSize: 10, fontWeight: "600" },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 14,
  },
  detailItem: { alignItems: "center" },
  detailLabel: { fontSize: 10, marginBottom: 2 },
  detailValue: { fontSize: 12, fontWeight: "500" },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: "auto",
  },
  downloadText: { fontSize: 12, fontWeight: "600" },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    gap: 12,
  },
  emptyText: { fontSize: 14 },
});
