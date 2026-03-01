/**
 * Toast Provider
 *
 * Fournit un système de toast global pour l'application.
 * Utilise react-native-reanimated pour les animations.
 *
 * Usage:
 *   const { showToast } = useToast();
 *   showToast('Message envoyé', 'success');
 */

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { SlideInUp, SlideOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: () => void;
}

// ═══════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  hideToast: () => {},
});

export const useToast = () => useContext(ToastContext);

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const DEFAULT_DURATION = 3000;

const ICON_MAP: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

const COLOR_MAP: Record<
  ToastType,
  { bg: string; border: string; text: string }
> = {
  success: { bg: "#ECFDF5", border: "#10B981", text: "#065F46" },
  error: { bg: "#FEF2F2", border: "#EF4444", text: "#991B1B" },
  warning: { bg: "#FFFBEB", border: "#F59E0B", text: "#92400E" },
  info: { bg: "#EFF6FF", border: "#3B82F6", text: "#1E40AF" },
};

// ═══════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const hideToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = "info",
      duration: number = DEFAULT_DURATION,
    ) => {
      // Clear any existing toast
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const id = Date.now().toString();
      setToast({ id, message, type, duration });

      // Auto-dismiss
      timeoutRef.current = setTimeout(() => {
        setToast(null);
        timeoutRef.current = null;
      }, duration);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <ToastView
          key={toast.id}
          toast={toast}
          topInset={insets.top}
          onDismiss={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TOAST VIEW COMPONENT
// ═══════════════════════════════════════════════════════════════════

function ToastView({
  toast,
  topInset,
  onDismiss,
}: {
  toast: ToastMessage;
  topInset: number;
  onDismiss: () => void;
}) {
  const colorScheme = COLOR_MAP[toast.type];
  const icon = ICON_MAP[toast.type];

  return (
    <Animated.View
      entering={SlideInUp.duration(300).springify()}
      exiting={SlideOutUp.duration(200)}
      style={[
        styles.container,
        {
          top: topInset + (Platform.OS === "android" ? 8 : 4),
        },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onDismiss}
        style={[
          styles.toast,
          {
            backgroundColor: colorScheme.bg,
            borderLeftColor: colorScheme.border,
          },
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: colorScheme.border },
          ]}
        >
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <Text
          style={[styles.message, { color: colorScheme.text }]}
          numberOfLines={2}
        >
          {toast.message}
        </Text>
        <TouchableOpacity onPress={onDismiss} hitSlop={8}>
          <Text style={[styles.close, { color: colorScheme.text }]}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 9999,
    alignItems: "center",
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    maxWidth: 500,
    width: "100%",
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  icon: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  close: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
    opacity: 0.6,
  },
});
