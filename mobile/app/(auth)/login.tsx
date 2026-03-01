import { Href, Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
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
import { useToast } from "@/providers/ToastProvider";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { theme } = useTheme();
  const { t } = useI18n();
  const { showToast } = useToast();
  const { signIn, loading } = useAuth();
  const [socialLoading, setSocialLoading] = useState(false);

  // Rediriger si déjà connecté — _layout.tsx gère la redirection
  // (vers /(tabs) si profil complet, ou /(onboarding)/profile-setup sinon)
  // On ne redirige plus depuis ici pour éviter un conflit de navigation

  async function signInWithEmail() {
    try {
      await signIn(email, password);
      // La redirection se fera automatiquement via useEffect
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : t("auth.loginFailed"),
        "error",
      );
    }
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Stack.Screen options={{ title: t("auth.login"), headerShown: false }} />
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TextInput
          testID="login-email-input"
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
          testID="login-password-input"
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
        {loading || socialLoading ? (
          <ActivityIndicator
            testID="login-loading"
            size="large"
            color={theme.colors.primary}
          />
        ) : (
          <Button
            testID="login-submit-button"
            title={t("auth.signIn")}
            disabled={loading || socialLoading}
            onPress={signInWithEmail}
          />
        )}
      </View>

      {/* Social login buttons */}
      <SocialLoginButtons
        onLoginStart={() => setSocialLoading(true)}
        onLoginEnd={() => setSocialLoading(false)}
        disabled={loading}
      />

      <View style={styles.verticallySpaced}>
        <View style={styles.verticallySpaced}>
          <Text
            style={{
              color: theme.colors.primary,
              textAlign: "center",
              marginTop: 10,
            }}
            onPress={() => router.push("/register" as Href)}
          >
            {t("auth.noAccountSignUp")}
          </Text>
          <Text
            style={{
              color: theme.colors.secondary,
              textAlign: "center",
              marginTop: 10,
              fontSize: 12,
            }}
            onPress={() => router.push("/(auth)/forgot-password" as Href)}
          >
            {t("auth.forgotPassword")}
          </Text>
        </View>
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
