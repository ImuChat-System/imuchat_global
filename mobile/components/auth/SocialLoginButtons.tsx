import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import { supabase } from "@/services/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as AppleAuthentication from "expo-apple-authentication";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

WebBrowser.maybeCompleteAuthSession();

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "";
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || "";
const GOOGLE_ANDROID_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || "";

// Validate that at least one Google client ID is configured
const isGoogleConfigured = !!(
  GOOGLE_CLIENT_ID ||
  GOOGLE_IOS_CLIENT_ID ||
  GOOGLE_ANDROID_CLIENT_ID
);

if (__DEV__ && !isGoogleConfigured) {
  console.warn(
    "[SocialLoginButtons] Google OAuth not configured — set EXPO_PUBLIC_GOOGLE_CLIENT_ID in .env",
  );
}

interface SocialLoginButtonsProps {
  onLoginStart?: () => void;
  onLoginEnd?: () => void;
  disabled?: boolean;
}

export function SocialLoginButtons({
  onLoginStart,
  onLoginEnd,
  disabled = false,
}: SocialLoginButtonsProps) {
  const colors = useColors();
  const { t } = useI18n();
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingApple, setLoadingApple] = useState(false);
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);

  // Check Apple authentication availability
  useEffect(() => {
    if (Platform.OS === "ios") {
      AppleAuthentication.isAvailableAsync().then(setAppleAuthAvailable);
    }
  }, []);

  // Google OAuth discovery
  const discovery = AuthSession.useAutoDiscovery("https://accounts.google.com");

  // Get the appropriate client ID based on platform
  const getGoogleClientId = () => {
    if (Platform.OS === "ios") return GOOGLE_IOS_CLIENT_ID || GOOGLE_CLIENT_ID;
    if (Platform.OS === "android")
      return GOOGLE_ANDROID_CLIENT_ID || GOOGLE_CLIENT_ID;
    return GOOGLE_CLIENT_ID;
  };

  // Google Auth request
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "imuchat",
    path: "auth/callback",
  });

  if (__DEV__) {
    console.log("[SocialLoginButtons] Google OAuth redirect URI:", redirectUri);
    console.log(
      "[SocialLoginButtons] Google Client ID:",
      getGoogleClientId() ? "configured" : "MISSING",
    );
  }

  const [googleRequest, googleResponse, googlePromptAsync] =
    AuthSession.useAuthRequest(
      {
        clientId: getGoogleClientId(),
        scopes: ["openid", "profile", "email"],
        redirectUri,
      },
      discovery,
    );

  // Handle Google OAuth response
  useEffect(() => {
    if (googleResponse?.type === "success") {
      const { id_token } = googleResponse.params;
      handleGoogleSignIn(id_token);
    } else if (googleResponse?.type === "error") {
      setLoadingGoogle(false);
      onLoginEnd?.();
      Alert.alert(
        t("auth.error"),
        t("auth.socialLoginFailed", { defaultValue: "Social login failed" }),
      );
    }
  }, [googleResponse]);

  const handleGoogleSignIn = async (idToken: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });

      if (error) throw error;

      // Success - AuthProvider will handle navigation
    } catch (error) {
      console.error("Google sign in error:", error);
      Alert.alert(
        t("auth.error"),
        error instanceof Error ? error.message : t("auth.loginFailed"),
      );
    } finally {
      setLoadingGoogle(false);
      onLoginEnd?.();
    }
  };

  const handleGooglePress = useCallback(async () => {
    if (!isGoogleConfigured) {
      Alert.alert(
        t("auth.error"),
        "Google Sign-In is not configured. Please set up Google OAuth credentials.",
      );
      return;
    }

    if (!googleRequest) {
      Alert.alert(
        t("auth.error"),
        t("auth.googleNotConfigured", {
          defaultValue: "Google login not configured",
        }),
      );
      return;
    }

    setLoadingGoogle(true);
    onLoginStart?.();

    try {
      await googlePromptAsync();
    } catch (error) {
      console.error("Google prompt error:", error);
      setLoadingGoogle(false);
      onLoginEnd?.();
    }
  }, [googleRequest, googlePromptAsync, onLoginStart, onLoginEnd, t]);

  const handleApplePress = useCallback(async () => {
    setLoadingApple(true);
    onLoginStart?.();

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "apple",
          token: credential.identityToken,
        });

        if (error) throw error;

        // Success - AuthProvider will handle navigation
      }
    } catch (error: any) {
      if (error.code === "ERR_REQUEST_CANCELED") {
        // User cancelled, don't show error
      } else {
        console.error("Apple sign in error:", error);
        Alert.alert(
          t("auth.error"),
          error instanceof Error ? error.message : t("auth.loginFailed"),
        );
      }
    } finally {
      setLoadingApple(false);
      onLoginEnd?.();
    }
  }, [onLoginStart, onLoginEnd, t]);

  const isLoading = loadingGoogle || loadingApple;
  const isDisabled = disabled || isLoading;

  return (
    <View style={styles.container}>
      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Text style={[styles.dividerText, { color: colors.textMuted }]}>
          {t("auth.orContinueWith", { defaultValue: "or continue with" })}
        </Text>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
      </View>

      {/* Social buttons */}
      <View style={styles.buttonsContainer}>
        {/* Google button */}
        <TouchableOpacity
          testID="google-login-button"
          style={[
            styles.socialButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: isDisabled ? 0.6 : 1,
            },
          ]}
          onPress={handleGooglePress}
          disabled={isDisabled}
        >
          {loadingGoogle ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <GoogleIcon />
              <Text style={[styles.buttonText, { color: colors.text }]}>
                Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Apple button (iOS only) */}
        {Platform.OS === "ios" && appleAuthAvailable && (
          <TouchableOpacity
            testID="apple-login-button"
            style={[
              styles.socialButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: isDisabled ? 0.6 : 1,
              },
            ]}
            onPress={handleApplePress}
            disabled={isDisabled}
          >
            {loadingApple ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Ionicons name="logo-apple" size={20} color={colors.text} />
                <Text style={[styles.buttonText, { color: colors.text }]}>
                  Apple
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// Simple Google icon using a "G" letter as placeholder
// In production, use a proper SVG or image
function GoogleIcon() {
  return (
    <View style={styles.googleIcon}>
      <Text style={styles.googleIconText}>G</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 16,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 120,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4285F4",
    alignItems: "center",
    justifyContent: "center",
  },
  googleIconText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
