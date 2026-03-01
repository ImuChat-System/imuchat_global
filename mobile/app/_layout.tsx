import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Href, Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useRef } from "react";
import "react-native-reanimated";

import { NotificationPrompt } from "@/components/NotificationPrompt";
import { useColorScheme } from "@/components/useColorScheme";
import { useCallManager } from "@/hooks/useCallManagerHook";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { I18nProvider } from "@/providers/I18nProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";

const ONBOARDING_COMPLETED_KEY = "onboarding_completed";
const PROFILE_SETUP_COMPLETED_KEY = "profile_setup_completed";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <I18nProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </I18nProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const segmentsRef = useRef(segments);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(
    null,
  );
  const [profileSetupComplete, setProfileSetupComplete] = useState<
    boolean | null
  >(null);

  // Keep segments ref in sync without triggering effect re-runs
  segmentsRef.current = segments;

  // Check onboarding + profile setup status on mount
  const checkOnboarding = useCallback(async () => {
    try {
      const [completed, profileDone] = await Promise.all([
        AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY),
        AsyncStorage.getItem(PROFILE_SETUP_COMPLETED_KEY),
      ]);
      setOnboardingComplete(completed === "true");
      setProfileSetupComplete(profileDone === "true");
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setOnboardingComplete(true);
      setProfileSetupComplete(true);
    }
  }, []);

  useEffect(() => {
    checkOnboarding();
  }, [checkOnboarding]);

  // Re-check profile setup when session changes (login/signup)
  useEffect(() => {
    if (session) {
      AsyncStorage.getItem(PROFILE_SETUP_COMPLETED_KEY).then((val) => {
        setProfileSetupComplete(val === "true");
      });
    }
  }, [session]);

  useEffect(() => {
    if (loading || onboardingComplete === null || profileSetupComplete === null)
      return;

    const inAuthGroup = (segmentsRef.current[0] as string) === "(auth)";
    const inOnboardingGroup =
      (segmentsRef.current[0] as string) === "(onboarding)";

    // First check: if onboarding slides not completed, redirect there
    if (!onboardingComplete && !inOnboardingGroup) {
      router.replace("/(onboarding)" as Href);
      return;
    }

    // Then normal auth flow
    if (!session && !inAuthGroup && onboardingComplete) {
      router.replace("/login" as Href);
    } else if (session && !profileSetupComplete && !inOnboardingGroup) {
      // Authenticated but profile not set up — redirect to profile setup
      router.replace("/(onboarding)/profile-setup" as Href);
    } else if (
      session &&
      profileSetupComplete &&
      (inAuthGroup || inOnboardingGroup)
    ) {
      router.replace("/(tabs)");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, loading, onboardingComplete, profileSetupComplete]);

  if (loading || onboardingComplete === null || profileSetupComplete === null) {
    return null; // Or a splash screen
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <NavigationThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen
              name="(onboarding)"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="(auth)/login"
              options={{ headerShown: false }}
            />
            <Stack.Screen name="modal" options={{ presentation: "modal" }} />
            <Stack.Screen name="alice" options={{ headerShown: false }} />
          </Stack>
          {/* Call manager must be inside ThemeProvider */}
          <CallManagerProvider />
          {/* Notification permission prompt */}
          <NotificationPromptManager />
        </NavigationThemeProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

/**
 * Manages notification permission prompt - shows once on first app launch
 */
function NotificationPromptManager() {
  const { session } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  const STORAGE_KEY = "notification-permission-prompted";

  useEffect(() => {
    // Only show when user is logged in and hasn't been prompted before
    const checkAndShowPrompt = async () => {
      if (!session) return;

      try {
        const hasBeenPrompted = await AsyncStorage.getItem(STORAGE_KEY);
        if (!hasBeenPrompted) {
          // Delay 3 seconds after login to let user settle
          setTimeout(() => {
            setShowPrompt(true);
          }, 3000);
        }
      } catch (error) {
        console.error("Error checking notification prompt status:", error);
      }
    };

    checkAndShowPrompt();
  }, [session]);

  const handleClose = async () => {
    setShowPrompt(false);
    // Mark as prompted so we don't show again
    try {
      await AsyncStorage.setItem(STORAGE_KEY, "true");
    } catch (error) {
      console.error("Error saving notification prompt status:", error);
    }
  };

  return <NotificationPrompt visible={showPrompt} onClose={handleClose} />;
}

/**
 * Separate component for call manager to ensure it's within ThemeProvider context
 */
function CallManagerProvider() {
  const { IncomingCallModal } = useCallManager();
  return <IncomingCallModal />;
}
