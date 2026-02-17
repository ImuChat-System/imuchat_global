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
import { useTheme } from "@/providers/ThemeProvider";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const { theme } = useTheme();
  const { sendPasswordReset, loading } = useAuth();

  async function sendResetEmail() {
    try {
      await sendPasswordReset(email);
      setSent(true);
      Alert.alert("Check your email", "We sent you a password reset link.");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to send reset email",
      );
    }
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Stack.Screen options={{ title: "Reset Password", headerShown: true }} />

      <View style={styles.verticallySpaced}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Reset Password
        </Text>
        <Text style={{ color: theme.colors.secondary, marginBottom: 20 }}>
          Enter your email to receive a reset link.
        </Text>
      </View>

      <View style={styles.verticallySpaced}>
        <TextInput
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
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
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : (
          <Button
            title="Send Reset Link"
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
