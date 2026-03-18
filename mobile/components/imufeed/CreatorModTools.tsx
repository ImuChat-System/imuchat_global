/**
 * S18 — CreatorModTools
 *
 * Outils de modération créateur : filtre mots-clés,
 * gestion des utilisateurs bloqués, mode de commentaires,
 * toggle filtre IA.
 */

import { useI18n } from "@/providers/I18nProvider";
import { useContentModerationStore } from "@/stores/content-moderation-store";
import type { CommentMode } from "@/types/content-moderation";
import React, { useState } from "react";
import {
  FlatList,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Constants ──────────────────────────────────────────────────────────────

const COMMENT_MODES: { key: CommentMode; labelKey: string }[] = [
  { key: "all", labelKey: "creator_mod.mode_all" },
  { key: "subscribers_only", labelKey: "creator_mod.mode_subscribers" },
  { key: "disabled", labelKey: "creator_mod.mode_disabled" },
];

// ─── Component ──────────────────────────────────────────────────────────────

export function CreatorModTools() {
  const { t } = useI18n();
  const {
    creatorSettings,
    updateBlockedKeywords,
    removeBlockedUser,
    setCommentMode,
    toggleAutoFilter,
    saveCreatorSettings,
  } = useContentModerationStore();

  const [keywordInput, setKeywordInput] = useState("");
  const [saving, setSaving] = useState(false);

  // ── Handlers ────────────────────────────────────────────────

  const handleAddKeyword = () => {
    const word = keywordInput.trim().toLowerCase();
    if (!word || creatorSettings.blocked_keywords.includes(word)) return;
    updateBlockedKeywords([...creatorSettings.blocked_keywords, word]);
    setKeywordInput("");
  };

  const handleRemoveKeyword = (word: string) => {
    updateBlockedKeywords(
      creatorSettings.blocked_keywords.filter((w) => w !== word),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    await saveCreatorSettings();
    setSaving(false);
  };

  // ── Render ──────────────────────────────────────────────────
  return (
    <View testID="creator-mod-tools" style={{ flex: 1, padding: 16 }}>
      {/* ── Comment mode ──────────────────────────────────── */}
      <Text
        style={{
          color: "#fff",
          fontSize: 16,
          fontWeight: "700",
          marginBottom: 8,
        }}
      >
        {t("creator_mod.comment_mode", {
          defaultValue: "Mode de commentaires",
        })}
      </Text>
      <View style={{ flexDirection: "row", marginBottom: 16 }}>
        {COMMENT_MODES.map((m) => (
          <TouchableOpacity
            key={m.key}
            testID={`mode-${m.key}`}
            onPress={() => setCommentMode(m.key)}
            style={{
              flex: 1,
              paddingVertical: 10,
              marginHorizontal: 4,
              borderRadius: 8,
              backgroundColor:
                creatorSettings.comment_mode === m.key ? "#a855f7" : "#2a2a4a",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 13 }}>
              {t(m.labelKey, { defaultValue: m.key })}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Auto filter toggle ────────────────────────────── */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          paddingVertical: 8,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 15 }}>
          {t("creator_mod.auto_filter", {
            defaultValue: "Filtre IA automatique",
          })}
        </Text>
        <Switch
          testID="auto-filter-switch"
          value={creatorSettings.auto_filter_enabled}
          onValueChange={toggleAutoFilter}
          trackColor={{ false: "#555", true: "#a855f7" }}
        />
      </View>

      {/* ── Keyword filter ────────────────────────────────── */}
      <Text
        style={{
          color: "#fff",
          fontSize: 16,
          fontWeight: "700",
          marginBottom: 8,
        }}
      >
        {t("creator_mod.blocked_keywords", {
          defaultValue: "Mots-clés bloqués",
        })}
      </Text>

      <View style={{ flexDirection: "row", marginBottom: 8 }}>
        <TextInput
          testID="keyword-input"
          value={keywordInput}
          onChangeText={setKeywordInput}
          placeholder={t("creator_mod.keyword_placeholder", {
            defaultValue: "Ajouter un mot-clé...",
          })}
          placeholderTextColor="#666"
          style={{
            flex: 1,
            backgroundColor: "#16162a",
            color: "#fff",
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        />
        <TouchableOpacity
          testID="add-keyword-btn"
          onPress={handleAddKeyword}
          style={{
            marginLeft: 8,
            backgroundColor: "#a855f7",
            borderRadius: 8,
            paddingHorizontal: 16,
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>+</Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        {creatorSettings.blocked_keywords.map((word) => (
          <TouchableOpacity
            key={word}
            testID={`keyword-${word}`}
            onPress={() => handleRemoveKeyword(word)}
            style={{
              backgroundColor: "#2a2a4a",
              borderRadius: 16,
              paddingHorizontal: 12,
              paddingVertical: 6,
              marginRight: 6,
              marginBottom: 6,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 13 }}>{word}</Text>
            <Text style={{ color: "#f87171", marginLeft: 6 }}>✕</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Blocked users ─────────────────────────────────── */}
      <Text
        style={{
          color: "#fff",
          fontSize: 16,
          fontWeight: "700",
          marginBottom: 8,
        }}
      >
        {t("creator_mod.blocked_users", {
          defaultValue: "Utilisateurs bloqués",
        })}{" "}
        ({creatorSettings.blocked_users.length})
      </Text>

      <FlatList
        data={creatorSettings.blocked_users}
        keyExtractor={(item) => item}
        style={{ maxHeight: 150, marginBottom: 16 }}
        renderItem={({ item }) => (
          <View
            testID={`blocked-user-${item}`}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 8,
              paddingHorizontal: 12,
              backgroundColor: "#1a1a2e",
              borderRadius: 8,
              marginBottom: 4,
            }}
          >
            <Text style={{ color: "#ccc" }}>{item}</Text>
            <TouchableOpacity
              testID={`unblock-${item}`}
              onPress={() => removeBlockedUser(item)}
            >
              <Text style={{ color: "#f87171", fontSize: 13 }}>
                {t("creator_mod.unblock", { defaultValue: "Débloquer" })}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: "#666", fontStyle: "italic" }}>
            {t("creator_mod.no_blocked", {
              defaultValue: "Aucun utilisateur bloqué",
            })}
          </Text>
        }
      />

      {/* ── Save button ───────────────────────────────────── */}
      <TouchableOpacity
        testID="save-settings-btn"
        onPress={handleSave}
        disabled={saving}
        style={{
          backgroundColor: saving ? "#555" : "#a855f7",
          paddingVertical: 14,
          borderRadius: 8,
          alignItems: "center",
          marginTop: 8,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
          {saving
            ? t("common.saving", { defaultValue: "Enregistrement..." })
            : t("common.save", { defaultValue: "Enregistrer" })}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
