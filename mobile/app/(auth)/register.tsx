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

import { useAuth } from "@/hooks/useAuthV2";
import { useTheme } from "@/providers/ThemeProvider";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { theme } = useTheme();
  const { signUp, loading } = useAuth();

  async function signUpWithEmail() {
    try {
      await signUp(email, password, {
        displayName: email.split("@")[0], // Utilise la partie email comme nom par défaut
      });

      Alert.alert(
        "Registration successful!",
        "Please check your inbox for verification.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Registration failed",
      );
    }
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Stack.Screen options={{ title: "Create Account", headerShown: true }} />

      <View style={styles.verticallySpaced}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Sign Up
        </Text>
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
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
      <View style={styles.verticallySpaced}>
        <TextInput
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
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
            title="Create account"
            disabled={loading}
            onPress={signUpWithEmail}
          />
        )}
      </View>

      <View style={styles.verticallySpaced}>
        <Text
          style={[styles.link, { color: theme.colors.primary }]}
          onPress={() => router.back()}
        >
          Already have an account? Sign in
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
