/**
 * components/imufeed/ShareVideoModal.tsx — S21 · Modal de partage vidéo
 *
 * Permet de choisir une ou plusieurs conversations cibles,
 * puis d'envoyer la vidéo via le store.
 */

import { useI18n } from "@/providers/I18nProvider";
import { fetchShareTargets } from "@/services/imufeed/video-sharing";
import { useVideoSharingStore } from "@/stores/video-sharing-store";
import type { ShareTarget } from "@/types/video-sharing";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export interface ShareVideoModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ShareVideoModal({
  visible,
  onClose,
}: ShareVideoModalProps) {
  const { t } = useI18n();
  const shareStatus = useVideoSharingStore((s) => s.shareStatus);
  const selectedTargets = useVideoSharingStore((s) => s.selectedTargets);
  const toggleTarget = useVideoSharingStore((s) => s.toggleTarget);
  const clearTargets = useVideoSharingStore((s) => s.clearTargets);
  const confirmShare = useVideoSharingStore((s) => s.confirmShare);
  const cancelShare = useVideoSharingStore((s) => s.cancelShare);

  const [targets, setTargets] = useState<ShareTarget[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (visible) {
      loadTargets();
    } else {
      setSearch("");
      clearTargets();
    }
  }, [visible]);

  const loadTargets = async () => {
    setLoading(true);
    try {
      const data = await fetchShareTargets();
      setTargets(data);
    } catch {
      setTargets([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTargets = useMemo(() => {
    if (!search.trim()) return targets;
    const q = search.toLowerCase();
    return targets.filter((t) => t.displayName.toLowerCase().includes(q));
  }, [targets, search]);

  const isSelected = useCallback(
    (id: string) => selectedTargets.some((t) => t.conversationId === id),
    [selectedTargets],
  );

  const handleConfirm = async () => {
    await confirmShare();
    onClose();
  };

  const handleClose = () => {
    cancelShare();
    onClose();
  };

  const sharing = shareStatus === "sharing";

  const renderTarget = ({ item }: { item: ShareTarget }) => {
    const selected = isSelected(item.conversationId);
    return (
      <Pressable
        testID={`share-target-${item.conversationId}`}
        style={[styles.targetRow, selected && styles.targetRowSelected]}
        onPress={() => toggleTarget(item)}
      >
        <View style={styles.avatarCircle}>
          <Ionicons
            name={item.type === "group" ? "people" : "person"}
            size={18}
            color="#aaa"
          />
        </View>
        <Text style={styles.targetName} numberOfLines={1}>
          {item.displayName}
        </Text>
        {selected && (
          <Ionicons name="checkmark-circle" size={22} color="#6C63FF" />
        )}
      </Pressable>
    );
  };

  return (
    <Modal
      testID="share-video-modal"
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {t("videoSharing.shareTitle", {
                defaultValue: "Partager la vidéo",
              })}
            </Text>
            <Pressable onPress={handleClose} testID="share-modal-close">
              <Ionicons name="close" size={24} color="#fff" />
            </Pressable>
          </View>

          {/* Search */}
          <TextInput
            testID="share-search-input"
            style={styles.searchInput}
            placeholder={t("videoSharing.searchPlaceholder", {
              defaultValue: "Rechercher une conversation…",
            })}
            placeholderTextColor="#777"
            value={search}
            onChangeText={setSearch}
          />

          {/* Liste */}
          {loading ? (
            <ActivityIndicator
              testID="share-loading"
              style={styles.loader}
              color="#6C63FF"
            />
          ) : (
            <FlatList
              data={filteredTargets}
              keyExtractor={(item) => item.conversationId}
              renderItem={renderTarget}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {t("videoSharing.noConversations", {
                    defaultValue: "Aucune conversation",
                  })}
                </Text>
              }
              style={styles.list}
            />
          )}

          {/* Bouton Confirmer */}
          <Pressable
            testID="share-confirm-button"
            style={[
              styles.confirmButton,
              (selectedTargets.length === 0 || sharing) &&
                styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirm}
            disabled={selectedTargets.length === 0 || sharing}
          >
            {sharing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.confirmText}>
                {t("videoSharing.send", { defaultValue: "Envoyer" })}
                {selectedTargets.length > 0
                  ? ` (${selectedTargets.length})`
                  : ""}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#1a1a2e",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a4a",
  },
  title: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  searchInput: {
    backgroundColor: "#2a2a4a",
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    color: "#fff",
    fontSize: 14,
  },
  loader: {
    marginTop: 40,
  },
  list: {
    maxHeight: 340,
  },
  targetRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  targetRowSelected: {
    backgroundColor: "rgba(108,99,255,0.12)",
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2a2a4a",
    alignItems: "center",
    justifyContent: "center",
  },
  targetName: {
    color: "#fff",
    fontSize: 15,
    flex: 1,
  },
  emptyText: {
    color: "#777",
    textAlign: "center",
    marginTop: 30,
    fontSize: 14,
  },
  confirmButton: {
    backgroundColor: "#6C63FF",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    opacity: 0.4,
  },
  confirmText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
