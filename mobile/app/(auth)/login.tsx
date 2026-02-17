import { Href, Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { theme } = useTheme();
  const { signIn, loading, user } = useAuth();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (user) {
      router.replace("/(tabs)" as Href);
    }
  }, [user]);

  async function signInWithEmail() {
    try {
      await signIn(email, password);
      // La redirection se fera automatiquement via useEffect
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Login failed",
      );
    }
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Stack.Screen options={{ title: "Login", headerShown: false }} />
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
            title="Sign in"
            disabled={loading}
            onPress={signInWithEmail}
          />
        )}
      </View>
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
            Don't have an account? Sign up
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
            Forgot Password?
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
