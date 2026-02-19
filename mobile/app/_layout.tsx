import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Href, Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef } from "react";
import "react-native-reanimated";

import { NotificationPrompt } from "@/components/NotificationPrompt";
import { useColorScheme } from "@/components/useColorScheme";
import { useCallManager } from "@/hooks/useCallManagerHook";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";

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
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const segmentsRef = useRef(segments);

  // Keep segments ref in sync without triggering effect re-runs
  segmentsRef.current = segments;

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = (segmentsRef.current[0] as string) === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/login" as Href);
    } else if (session && inAuthGroup) {
      router.replace("/(tabs)");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, loading]);

  if (loading) {
    return null; // Or a splash screen
  }

  return (
    <ThemeProvider>
      <NavigationThemeProvider
        value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
      >
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        </Stack>
        {/* Call manager must be inside ThemeProvider */}
        <CallManagerProvider />
        {/* Notification permission prompt */}
        <NotificationPromptManager />
      </NavigationThemeProvider>
    </ThemeProvider>
  );
}

/**
 * Separate component for call manager to ensure it's within ThemeProvider context
 */
function CallManagerProvider() {
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
  const { IncomingCallModal } = useCallManager();
  return <IncomingCallModal />;
}
