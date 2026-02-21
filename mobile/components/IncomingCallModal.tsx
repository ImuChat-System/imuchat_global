import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { CallEvent } from "@/services/call-signaling";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface IncomingCallModalProps {
  visible: boolean;
  call: CallEvent | null;
  onAccept: () => void;
  onReject: () => void;
}

export default function IncomingCallModal({
  visible,
  call,
  onAccept,
  onReject,
}: IncomingCallModalProps) {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();

  if (!call) return null;

  const callerName =
    call.caller?.full_name || call.caller?.username || t("common.unknown");
  const callTypeText =
    call.call_type === "video" ? t("calls.videoCall") : t("calls.audioCall");

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Caller Info */}
        <View style={styles.callerInfo}>
          {call.caller?.avatar_url ? (
            <Image
              source={{ uri: call.caller.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {callerName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <Text style={[styles.callerName, { color: colors.text }]}>
            {callerName}
          </Text>
          <Text style={[styles.callType, { color: colors.textMuted }]}>
            {t("calls.incomingCall", { type: callTypeText })}
          </Text>
        </View>

        {/* Call Actions */}
        <View style={styles.actions}>
          {/* Reject Button */}
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={onReject}
          >
            <Ionicons name="close" size={36} color="#FFFFFF" />
            <Text style={styles.actionText}>{t("calls.decline")}</Text>
          </TouchableOpacity>

          {/* Accept Button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.acceptButton,
              { backgroundColor: colors.primary },
            ]}
            onPress={onAccept}
          >
            <Ionicons name="call" size={36} color="#FFFFFF" />
            <Text style={styles.actionText}>{t("calls.acceptCall")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  callerInfo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 48,
    fontWeight: "bold",
  },
  callerName: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  callType: {
    fontSize: 18,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  actionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  rejectButton: {
    backgroundColor: "#EF4444",
  },
  acceptButton: {
    // backgroundColor set dynamically
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginTop: 8,
    fontWeight: "600",
  },
});
