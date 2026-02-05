import { Href, Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";

import { useTheme } from "@/providers/ThemeProvider";
import { supabase } from "@/services/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) Alert.alert("Error", error.message);
    setLoading(false);
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
        <Button title="Sign in" disabled={loading} onPress={signInWithEmail} />
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
