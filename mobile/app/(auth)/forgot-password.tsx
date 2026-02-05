import { Stack } from "expo-router";
import { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";

import { useTheme } from "@/providers/ThemeProvider";
import { supabase } from "@/services/supabase";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  async function sendResetEmail() {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "imuchat://reset-password", // Deep link to handle reset
    });

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Check your email", "We sent you a password reset link.");
    }
    setLoading(false);
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
        <Button
          title="Send Reset Link"
          disabled={loading}
          onPress={sendResetEmail}
        />
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
