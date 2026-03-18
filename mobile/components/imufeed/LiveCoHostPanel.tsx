/**
 * LiveCoHostPanel — Panneau de gestion co-hosts
 *
 * Permet au host d'inviter des co-hosts (1-3 max),
 * et gère les invitations en attente et les co-hosts actifs.
 *
 * Sprint S17 — Co-host, Replay, Modération, Sondages
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import type { CoHostRequest } from "@/types/live-streaming";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────

export interface CoHostCandidate {
  userId: string;
  userName: string;
  userAvatar: string | null;
}

export interface LiveCoHostPanelProps {
  activeCoHosts: string[];
  coHostRequests: CoHostRequest[];
  maxCoHosts: number;
  onInvite: (userId: string) => void;
  onRemoveCoHost: (userId: string) => void;
  onClose: () => void;
  /** Searchable candidates (e.g. followers) */
  candidates: CoHostCandidate[];
}

// ─── Request Status Badge ─────────────────────────────────────

function RequestBadge({
  status,
  t,
}: {
  status: CoHostRequest["status"];
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  const colorMap: Record<string, string> = {
    pending: "#FFA500",
    accepted: "#44BB44",
    declined: "#FF4444",
  };
  const labelMap: Record<string, string> = {
    pending: t("live.cohost.pending", { defaultValue: "En attente" }),
    accepted: t("live.cohost.accepted", { defaultValue: "Accepté" }),
    declined: t("live.cohost.declined", { defaultValue: "Refusé" }),
  };

  return (
    <View
      testID={`request-badge-${status}`}
      style={[
        styles.requestBadge,
        { backgroundColor: `${colorMap[status]}20` },
      ]}
    >
      <Text
        style={{ color: colorMap[status], fontSize: 11, fontWeight: "700" }}
      >
        {labelMap[status]}
      </Text>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────

export default function LiveCoHostPanel({
  activeCoHosts,
  coHostRequests,
  maxCoHosts,
  onInvite,
  onRemoveCoHost,
  onClose,
  candidates,
}: LiveCoHostPanelProps) {
  const colors = useColors();
  const { t } = useI18n();
  const [search, setSearch] = useState("");

  const slotsRemaining = maxCoHosts - activeCoHosts.length;
  const isFull = slotsRemaining <= 0;

  const filteredCandidates = candidates.filter((c) => {
    if (activeCoHosts.includes(c.userId)) return false;
    if (
      coHostRequests.some(
        (r) => r.toUserId === c.userId && r.status === "pending",
      )
    )
      return false;
    if (!search.trim()) return true;
    return c.userName.toLowerCase().includes(search.toLowerCase());
  });

  const handleInvite = useCallback(
    (userId: string) => {
      if (!isFull) {
        onInvite(userId);
      }
    },
    [isFull, onInvite],
  );

  return (
    <View
      testID="cohost-panel"
      style={[styles.container, { backgroundColor: colors.card }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="people" size={20} color="#FF8800" />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t("live.cohost.title", { defaultValue: "Co-hosts" })}
          </Text>
          <Text style={[styles.slotInfo, { color: colors.textSecondary }]}>
            {activeCoHosts.length}/{maxCoHosts}
          </Text>
        </View>
        <TouchableOpacity testID="cohost-close" onPress={onClose}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Active co-hosts */}
      {activeCoHosts.length > 0 && (
        <View testID="active-cohosts" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t("live.cohost.active", { defaultValue: "En direct" })}
          </Text>
          {activeCoHosts.map((userId) => {
            const candidate = candidates.find((c) => c.userId === userId);
            return (
              <View
                key={userId}
                testID={`active-cohost-${userId}`}
                style={styles.cohostRow}
              >
                <View style={styles.cohostInfo}>
                  <Ionicons name="person-circle" size={28} color="#FF8800" />
                  <Text style={[styles.cohostName, { color: colors.text }]}>
                    {candidate?.userName || userId}
                  </Text>
                </View>
                <TouchableOpacity
                  testID={`remove-cohost-${userId}`}
                  onPress={() => onRemoveCoHost(userId)}
                >
                  <Ionicons name="close-circle" size={22} color="#FF4444" />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}

      {/* Pending requests */}
      {coHostRequests.filter((r) => r.status === "pending").length > 0 && (
        <View testID="pending-requests" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t("live.cohost.invitations", { defaultValue: "Invitations" })}
          </Text>
          {coHostRequests
            .filter((r) => r.status === "pending")
            .map((req) => {
              const candidate = candidates.find(
                (c) => c.userId === req.toUserId,
              );
              return (
                <View
                  key={req.id}
                  testID={`request-${req.id}`}
                  style={styles.cohostRow}
                >
                  <View style={styles.cohostInfo}>
                    <Ionicons
                      name="person-circle"
                      size={28}
                      color={colors.textSecondary}
                    />
                    <Text style={[styles.cohostName, { color: colors.text }]}>
                      {candidate?.userName || req.toUserId}
                    </Text>
                  </View>
                  <RequestBadge status={req.status} t={t} />
                </View>
              );
            })}
        </View>
      )}

      {/* Invite search */}
      {!isFull && (
        <View testID="invite-section" style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            {t("live.cohost.invite", { defaultValue: "Inviter" })}
          </Text>
          <TextInput
            testID="cohost-search-input"
            style={[
              styles.searchInput,
              { color: colors.text, borderColor: colors.border },
            ]}
            value={search}
            onChangeText={setSearch}
            placeholder={t("live.cohost.searchPlaceholder", {
              defaultValue: "Rechercher un utilisateur...",
            })}
            placeholderTextColor={colors.textSecondary}
          />
          {filteredCandidates.slice(0, 10).map((candidate) => (
            <View
              key={candidate.userId}
              testID={`candidate-${candidate.userId}`}
              style={styles.cohostRow}
            >
              <View style={styles.cohostInfo}>
                <Ionicons
                  name="person-circle"
                  size={28}
                  color={colors.textSecondary}
                />
                <Text style={[styles.cohostName, { color: colors.text }]}>
                  {candidate.userName}
                </Text>
              </View>
              <TouchableOpacity
                testID={`invite-${candidate.userId}`}
                style={[
                  styles.inviteButton,
                  { backgroundColor: `${colors.primary}20` },
                ]}
                onPress={() => handleInvite(candidate.userId)}
              >
                <Ionicons name="add" size={16} color={colors.primary} />
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: 13,
                    fontWeight: "600",
                  }}
                >
                  {t("live.cohost.inviteBtn", { defaultValue: "Inviter" })}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
          {filteredCandidates.length === 0 && search.trim().length > 0 && (
            <Text
              testID="no-candidates"
              style={[styles.noResults, { color: colors.textSecondary }]}
            >
              {t("live.cohost.noResults", { defaultValue: "Aucun résultat" })}
            </Text>
          )}
        </View>
      )}

      {isFull && (
        <Text
          testID="cohost-full"
          style={[styles.fullMessage, { color: colors.textSecondary }]}
        >
          {t("live.cohost.full", {
            defaultValue: "Nombre maximum de co-hosts atteint",
          })}
        </Text>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    margin: 12,
    maxHeight: "70%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  slotInfo: {
    fontSize: 13,
    fontWeight: "600",
  },
  section: {
    marginBottom: 12,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cohostRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  cohostInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cohostName: {
    fontSize: 15,
    fontWeight: "600",
  },
  requestBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  inviteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  noResults: {
    textAlign: "center",
    fontSize: 13,
    paddingVertical: 8,
  },
  fullMessage: {
    textAlign: "center",
    fontSize: 14,
    paddingVertical: 12,
  },
});
