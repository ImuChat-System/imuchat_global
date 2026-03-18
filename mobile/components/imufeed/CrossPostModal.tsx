/**
 * CrossPostModal — Modal de cross-post d'une vidéo ImuFeed vers guildes/communautés
 * Sprint S22 — Watch Party & Social Cross-Post
 *
 * Sélection multiple de guildes, confirmation, feedback résultat.
 */

import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useWatchPartySocialStore } from "@/stores/watch-party-social-store";
import type { CrossPostTarget } from "@/types/watch-party-social";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface CrossPostModalProps {
  visible: boolean;
  videoId: string;
  onClose: () => void;
  onComplete?: (count: number) => void;
}

export default function CrossPostModal({
  visible,
  videoId,
  onClose,
  onComplete,
}: CrossPostModalProps) {
  const colors = useColors();
  const spacing = useSpacing();
  const {
    crossPostTargets,
    isLoadingTargets,
    loadCrossPostTargets,
    crossPost,
  } = useWatchPartySocialStore();

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    if (visible) {
      loadCrossPostTargets();
      setSelected(new Set());
      setSearch("");
    }
  }, [visible, loadCrossPostTargets]);

  const filteredTargets = useMemo(
    () =>
      crossPostTargets.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [crossPostTargets, search],
  );

  const toggleTarget = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    if (selected.size === 0) return;
    setIsPosting(true);
    const targets = crossPostTargets.filter((t) => selected.has(t.id));
    const results = await crossPost(videoId, targets);
    setIsPosting(false);
    const successCount = results.filter((r) => r.success).length;
    onComplete?.(successCount);
    onClose();
  }, [selected, crossPostTargets, crossPost, videoId, onComplete, onClose]);

  const renderTarget = useCallback(
    ({ item }: { item: CrossPostTarget }) => {
      const isSelected = selected.has(item.id);
      return (
        <TouchableOpacity
          testID={`crosspost-target-${item.id}`}
          style={[styles.row, { backgroundColor: colors.card }]}
          onPress={() => toggleTarget(item.id)}
          activeOpacity={0.7}
        >
          {item.iconUrl ? (
            <Image source={{ uri: item.iconUrl }} style={styles.icon} />
          ) : (
            <View style={[styles.icon, styles.iconPlaceholder]}>
              <Ionicons name="people" size={18} color={colors.textSecondary} />
            </View>
          )}
          <View style={[styles.info, { marginLeft: spacing.sm }]}>
            <Text style={[styles.name, { color: colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.members, { color: colors.textSecondary }]}>
              {item.memberCount} membres
            </Text>
          </View>
          <Ionicons
            name={isSelected ? "checkbox" : "square-outline"}
            size={22}
            color={isSelected ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>
      );
    },
    [selected, colors, spacing, toggleTarget],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      testID="crosspost-modal"
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { paddingHorizontal: spacing.md }]}>
            <Text style={[styles.title, { color: colors.text }]}>
              Publier dans une communauté
            </Text>
            <TouchableOpacity testID="crosspost-close" onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={[styles.searchRow, { marginHorizontal: spacing.md }]}>
            <Ionicons name="search" size={18} color={colors.textSecondary} />
            <TextInput
              testID="crosspost-search"
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Rechercher..."
              placeholderTextColor={colors.textSecondary}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* List */}
          {isLoadingTargets ? (
            <View testID="crosspost-loading" style={styles.center}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              data={filteredTargets}
              keyExtractor={(item) => item.id}
              renderItem={renderTarget}
              ListEmptyComponent={
                <Text
                  testID="crosspost-empty"
                  style={[styles.empty, { color: colors.textSecondary }]}
                >
                  Aucune communauté trouvée
                </Text>
              }
              style={styles.list}
            />
          )}

          {/* Confirm */}
          <TouchableOpacity
            testID="crosspost-confirm"
            style={[
              styles.confirmBtn,
              {
                backgroundColor:
                  selected.size > 0 ? colors.primary : colors.card,
              },
              { marginHorizontal: spacing.md, marginBottom: spacing.md },
            ]}
            onPress={handleConfirm}
            disabled={selected.size === 0 || isPosting}
          >
            {isPosting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.confirmText}>
                Publier{selected.size > 0 ? ` (${selected.size})` : ""}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  title: { fontSize: 17, fontWeight: "700" },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    backgroundColor: "rgba(128,128,128,0.1)",
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },
  list: { maxHeight: 340 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 12,
    marginBottom: 4,
  },
  icon: { width: 36, height: 36, borderRadius: 18 },
  iconPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(128,128,128,0.15)",
  },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: "600" },
  members: { fontSize: 11, marginTop: 2 },
  center: { alignItems: "center", justifyContent: "center", padding: 32 },
  empty: { textAlign: "center", paddingVertical: 24, fontSize: 13 },
  confirmBtn: {
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  confirmText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
