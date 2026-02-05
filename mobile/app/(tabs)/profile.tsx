import Avatar from "@/components/Avatar";
import { useTheme } from "@/providers/ThemeProvider";
import { supabase } from "@/services/supabase";
import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [session, setSession] = useState<Session | null>(null);

  const { theme } = useTheme();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const { data, error, status } = await supabase
        .from("profiles")
        .select(`username, website, avatar_url, full_name`)
        .eq("id", session?.user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
        setFullName(data.full_name);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile({
    username,
    website,
    avatar_url,
    full_name,
  }: {
    username: string;
    website: string;
    avatar_url: string;
    full_name: string;
  }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        id: session?.user.id,
        username,
        website,
        avatar_url,
        full_name,
        updated_at: new Date(),
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) {
        throw error;
      }

      Alert.alert("Success", "Profile updated!");
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.verticallySpaced}>
        {session && (
          <Avatar
            size={200}
            url={avatarUrl}
            onUpload={(url: string) => {
              setAvatarUrl(url);
              updateProfile({
                username,
                website,
                avatar_url: url,
                full_name: fullName,
              });
            }}
            showEditButton
          />
        )}
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Email</Text>
        <TextInput
          editable={false}
          value={session?.user?.email}
          style={[
            styles.input,
            {
              color: theme.colors.textMuted,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
            },
          ]}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Full Name
        </Text>
        <TextInput
          onChangeText={(text) => setFullName(text)}
          value={fullName}
          placeholder="John Doe"
          style={[
            styles.input,
            { color: theme.colors.text, borderColor: theme.colors.border },
          ]}
          placeholderTextColor={theme.colors.secondary}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Username
        </Text>
        <TextInput
          onChangeText={(text) => setUsername(text)}
          value={username}
          placeholder="johndoe"
          style={[
            styles.input,
            { color: theme.colors.text, borderColor: theme.colors.border },
          ]}
          placeholderTextColor={theme.colors.secondary}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Website
        </Text>
        <TextInput
          onChangeText={(text) => setWebsite(text)}
          value={website}
          placeholder="https://example.com"
          autoCapitalize="none"
          style={[
            styles.input,
            { color: theme.colors.text, borderColor: theme.colors.border },
          ]}
          placeholderTextColor={theme.colors.secondary}
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title={loading ? "Loading ..." : "Update"}
          onPress={() =>
            updateProfile({
              username,
              website,
              avatar_url: avatarUrl,
              full_name: fullName,
            })
          }
          disabled={loading}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Button
          title="Sign Out"
          onPress={() => supabase.auth.signOut()}
          color={theme.colors.error}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    flex: 1,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  label: {
    marginBottom: 5,
    fontWeight: "600",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
});
