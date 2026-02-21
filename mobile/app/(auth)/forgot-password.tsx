import { Stack } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "@/hooks/useAuthV2";
import { useI18n } from "@/providers/I18nProvider";
import { useTheme } from "@/providers/ThemeProvider";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { theme } = useTheme();
  const { t } = useI18n();
  const { sendPasswordReset, loading } = useAuth();

  async function sendResetEmail() {
    try {
      await sendPasswordReset(email);
      setSent(true);
      Alert.alert(t("auth.checkEmailTitle"), t("auth.checkEmailMessage"));
    } catch (error) {
      Alert.alert(
        t("auth.error"),
        error instanceof Error ? error.message : t("auth.failedResetEmail"),
      );
    }
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Stack.Screen
        options={{ title: t("auth.resetPasswordTitle"), headerShown: true }}
      />

      <View style={styles.verticallySpaced}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {t("auth.resetPasswordTitle")}
        </Text>
        <Text style={{ color: theme.colors.secondary, marginBottom: 20 }}>
          {t("auth.resetPasswordDescription")}
        </Text>
      </View>

      <View style={styles.verticallySpaced}>
        <TextInput
          testID="forgot-password-email-input"
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder={t("auth.emailPlaceholder")}
          autoCapitalize={"none"}
          style={[
            styles.input,
            { color: theme.colors.text, borderColor: theme.colors.border },
          ]}
          placeholderTextColor={theme.colors.secondary}
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        {loading ? (
          <ActivityIndicator
            testID="forgot-password-loading"
            size="large"
            color={theme.colors.primary}
          />
        ) : (
          <Button
            testID="forgot-password-submit-button"
            title={t("auth.sendResetLink")}
            disabled={loading || sent}
            onPress={sendResetEmail}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  label: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  input: {
    height: 40,
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
  },
});
