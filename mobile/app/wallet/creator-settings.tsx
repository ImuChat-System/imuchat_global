/**
 * CreatorSettingsScreen — DEV-033
 *
 * Paramètres créateur : mode de paiement, identifiant fiscal,
 * seuil d'auto-virement, devise préférée.
 * Route: /wallet/creator-settings
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useWalletStore } from "@/stores/wallet-store";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import type { CreatorPayoutSettings } from "@/types/wallet";

type PayoutMethod = CreatorPayoutSettings["payoutMethod"];

const PAYOUT_METHODS: { value: PayoutMethod; label: string; icon: string }[] = [
  {
    value: "bank_transfer",
    label: "Virement bancaire",
    icon: "business-outline",
  },
  { value: "paypal", label: "PayPal", icon: "logo-paypal" },
  { value: "crypto", label: "Crypto (USDC)", icon: "logo-bitcoin" },
];

const CURRENCIES = ["EUR", "USD", "JPY", "GBP"];

export default function CreatorSettingsScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();

  const {
    creatorSettings,
    walletLoading,
    loadCreatorSettings,
    updateCreatorSettings,
  } = useWalletStore();

  const [payoutMethod, setPayoutMethod] =
    useState<PayoutMethod>("bank_transfer");
  const [iban, setIban] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [autoPayout, setAutoPayout] = useState(false);
  const [autoPayoutThreshold, setAutoPayoutThreshold] = useState("50");
  const [currency, setCurrency] = useState("EUR");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    loadCreatorSettings();
  }, [loadCreatorSettings]);

  useEffect(() => {
    if (creatorSettings) {
      setPayoutMethod(creatorSettings.payoutMethod);
      setIban(creatorSettings.iban || "");
      setPaypalEmail(creatorSettings.paypalEmail || "");
      setCryptoAddress(creatorSettings.cryptoAddress || "");
      setTaxId(creatorSettings.taxId || "");
      setAutoPayout(creatorSettings.autoPayout);
      setAutoPayoutThreshold(String(creatorSettings.autoPayoutThreshold));
      setCurrency(creatorSettings.preferredCurrency);
    }
  }, [creatorSettings]);

  const markDirty = useCallback(() => setDirty(true), []);

  const handleSave = useCallback(async () => {
    const payload: Partial<CreatorPayoutSettings> = {
      payoutMethod,
      iban: payoutMethod === "bank_transfer" ? iban : undefined,
      paypalEmail: payoutMethod === "paypal" ? paypalEmail : undefined,
      cryptoAddress: payoutMethod === "crypto" ? cryptoAddress : undefined,
      taxId: taxId || undefined,
      autoPayout,
      autoPayoutThreshold: parseInt(autoPayoutThreshold, 10) || 50,
      preferredCurrency: currency as any,
    };
    await updateCreatorSettings(payload);
    setDirty(false);
    Alert.alert(
      t("wallet.creatorSaved") || "Enregistré ✅",
      t("wallet.creatorSavedMsg") ||
        "Vos paramètres créateur ont été mis à jour.",
    );
  }, [
    payoutMethod,
    iban,
    paypalEmail,
    cryptoAddress,
    taxId,
    autoPayout,
    autoPayoutThreshold,
    currency,
    updateCreatorSettings,
    t,
  ]);

  return (
    <ScrollView
      testID="creator-settings-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: 50 }}
    >
      {walletLoading && !creatorSettings && (
        <ActivityIndicator
          size="small"
          color={colors.primary}
          style={{ marginVertical: 20 }}
        />
      )}

      {/* Header summary */}
      <View
        style={[styles.headerCard, { backgroundColor: colors.primary + "10" }]}
      >
        <Ionicons name="settings-outline" size={28} color={colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t("wallet.creatorSettingsTitle") || "Paramètres créateur"}
          </Text>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>
            {t("wallet.creatorSettingsDesc") ||
              "Configurez vos préférences de paiement et vos informations fiscales."}
          </Text>
        </View>
      </View>

      {/* Payout method */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("wallet.payoutMethod") || "Méthode de versement"}
      </Text>
      {PAYOUT_METHODS.map((m) => {
        const isActive = m.value === payoutMethod;
        return (
          <TouchableOpacity
            key={m.value}
            testID={`payout-${m.value}`}
            onPress={() => {
              setPayoutMethod(m.value);
              markDirty();
            }}
            style={[
              styles.optionRow,
              {
                backgroundColor: isActive
                  ? colors.primary + "10"
                  : colors.surface,
                borderColor: isActive ? colors.primary : colors.border,
                borderWidth: isActive ? 2 : 1,
              },
            ]}
          >
            <Ionicons
              name={m.icon as any}
              size={22}
              color={isActive ? colors.primary : colors.textMuted}
            />
            <Text style={[styles.optionLabel, { color: colors.text }]}>
              {m.label}
            </Text>
            {isActive && (
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.primary}
              />
            )}
          </TouchableOpacity>
        );
      })}

      {/* Method-specific fields */}
      {payoutMethod === "bank_transfer" && (
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
            IBAN
          </Text>
          <TextInput
            testID="input-iban"
            value={iban}
            onChangeText={(v) => {
              setIban(v);
              markDirty();
            }}
            placeholder="FR76 1234 5678 9012 3456 7890 123"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            autoCapitalize="characters"
          />
        </View>
      )}
      {payoutMethod === "paypal" && (
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
            {t("wallet.paypalEmail") || "Email PayPal"}
          </Text>
          <TextInput
            testID="input-paypal"
            value={paypalEmail}
            onChangeText={(v) => {
              setPaypalEmail(v);
              markDirty();
            }}
            placeholder="creator@email.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          />
        </View>
      )}
      {payoutMethod === "crypto" && (
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
            {t("wallet.cryptoAddress") || "Adresse wallet (ERC-20)"}
          </Text>
          <TextInput
            testID="input-crypto"
            value={cryptoAddress}
            onChangeText={(v) => {
              setCryptoAddress(v);
              markDirty();
            }}
            placeholder="0x..."
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          />
        </View>
      )}

      {/* Tax ID */}
      <Text
        style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}
      >
        {t("wallet.taxInfo") || "Informations fiscales"}
      </Text>
      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
          {t("wallet.taxId") || "Numéro de TVA / Tax ID"}
        </Text>
        <TextInput
          testID="input-taxid"
          value={taxId}
          onChangeText={(v) => {
            setTaxId(v);
            markDirty();
          }}
          placeholder="FR 12345678901"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        />
      </View>

      {/* Auto-payout */}
      <Text
        style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}
      >
        {t("wallet.autoPayout") || "Versement automatique"}
      </Text>
      <View
        style={[
          styles.switchRow,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.switchLabel, { color: colors.text }]}>
            {t("wallet.autoPayoutEnabled") ||
              "Activer le versement automatique"}
          </Text>
          <Text style={[styles.switchSub, { color: colors.textMuted }]}>
            {t("wallet.autoPayoutDesc") ||
              "Virement dès que le seuil est atteint"}
          </Text>
        </View>
        <Switch
          testID="switch-autoPayout"
          value={autoPayout}
          onValueChange={(v) => {
            setAutoPayout(v);
            markDirty();
          }}
          trackColor={{ true: colors.primary }}
        />
      </View>

      {autoPayout && (
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
            {t("wallet.autoPayoutThreshold") || "Seuil (en devise)"}
          </Text>
          <TextInput
            testID="input-threshold"
            value={autoPayoutThreshold}
            onChangeText={(v) => {
              setAutoPayoutThreshold(v);
              markDirty();
            }}
            keyboardType="numeric"
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          />
        </View>
      )}

      {/* Preferred currency */}
      <Text
        style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}
      >
        {t("wallet.preferredCurrency") || "Devise préférée"}
      </Text>
      <View style={styles.currencyRow}>
        {CURRENCIES.map((c) => {
          const isActive = c === currency;
          return (
            <TouchableOpacity
              key={c}
              testID={`currency-${c}`}
              onPress={() => {
                setCurrency(c);
                markDirty();
              }}
              style={[
                styles.currencyChip,
                {
                  backgroundColor: isActive ? colors.primary : colors.surface,
                  borderColor: isActive ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.currencyText,
                  { color: isActive ? "#fff" : colors.text },
                ]}
              >
                {c}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Save button */}
      <TouchableOpacity
        testID="save-settings"
        onPress={handleSave}
        disabled={!dirty || walletLoading}
        style={[
          styles.saveBtn,
          {
            backgroundColor:
              dirty && !walletLoading ? colors.primary : colors.border,
            marginTop: 30,
          },
        ]}
      >
        {walletLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.saveBtnText}>
            {t("wallet.saveSettings") || "Enregistrer les modifications"}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    borderRadius: 14,
    marginBottom: 24,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  headerSub: { fontSize: 13, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  optionLabel: { flex: 1, fontSize: 14, fontWeight: "600" },
  fieldGroup: { marginTop: 14, marginBottom: 6 },
  fieldLabel: { fontSize: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  switchLabel: { fontSize: 14, fontWeight: "600" },
  switchSub: { fontSize: 12, marginTop: 2 },
  currencyRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  currencyChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  currencyText: { fontSize: 14, fontWeight: "700" },
  saveBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
  },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
