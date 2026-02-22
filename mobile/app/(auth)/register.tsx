import { Stack, useRouter } from "expo-router";
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

import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons";
import { useAuth } from "@/hooks/useAuthV2";
import { useI18n } from "@/providers/I18nProvider";
import { useTheme } from "@/providers/ThemeProvider";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useI18n();
  const { signUp, loading } = useAuth();

  async function signUpWithEmail() {
    try {
      await signUp(email, password, {
        displayName: email.split("@")[0], // Utilise la partie email comme nom par défaut
      });

      Alert.alert(
        t("auth.registrationSuccessTitle"),
        t("auth.registrationSuccessMessage"),
        [
          {
            text: t("common.ok"),
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        t("auth.error"),
        error instanceof Error ? error.message : t("auth.registrationFailed"),
      );
    }
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Stack.Screen
        options={{ title: t("auth.createAccountTitle"), headerShown: true }}
      />

      <View style={styles.verticallySpaced}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {t("auth.signUp")}
        </Text>
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TextInput
          testID="signup-email-input"
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
      <View style={styles.verticallySpaced}>
        <TextInput
          testID="signup-password-input"
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder={t("auth.passwordPlaceholder")}
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
            testID="signup-loading"
            size="large"
            color={theme.colors.primary}
          />
        ) : (
          <Button
            testID="signup-submit-button"
            title={t("auth.createAccount")}
            disabled={loading}
            onPress={signUpWithEmail}
          />
        )}
      </View>

      {/* Social Login (Google / Apple) */}
      <SocialLoginButtons disabled={loading} />

      <View style={styles.verticallySpaced}>
        <Text
          style={[styles.link, { color: theme.colors.primary }]}
          onPress={() => router.back()}
        >
          {t("auth.hasAccountSignIn")}
        </Text>
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
    marginBottom: 20,
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
  link: {
    textAlign: "center",
    marginTop: 10,
  },
});
