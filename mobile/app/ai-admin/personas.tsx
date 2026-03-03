/**
 * PersonasScreen — AI Persona Management (DEV-035)
 *
 * CRUD for AI personas:
 *  - List built-in + custom personas
 *  - Create new persona
 *  - Toggle active/inactive
 *  - Delete custom personas
 *
 * Spec §6.2: Création & gestion personas IA
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { useAIAdminStore } from "@/stores/ai-admin-store";
import type { AIPersona, AIPersonaFormData } from "@/types/ai-admin";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Constants ────────────────────────────────────────────────

const PERSONA_COLORS = [
  "#8B5CF6",
  "#EF4444",
  "#3B82F6",
  "#EC4899",
  "#F59E0B",
  "#10B981",
  "#6366F1",
  "#F97316",
];

const PERSONA_ICONS = [
  "sparkles",
  "heart",
  "school",
  "shirt",
  "briefcase",
  "code-slash",
  "color-palette",
  "rocket",
  "leaf",
  "musical-notes",
  "game-controller",
  "globe",
];

// ─── Persona Card ─────────────────────────────────────────────

interface PersonaCardProps {
  persona: AIPersona;
  onToggle: (active: boolean) => void;
  onDelete: () => void;
  colors: ReturnType<typeof useColors>;
  t: (key: string) => string;
}

function PersonaCard({
  persona,
  onToggle,
  onDelete,
  colors,
  t,
}: PersonaCardProps) {
  return (
    <View style={[styles.personaCard, { backgroundColor: colors.surface }]}>
      <View
        style={[styles.personaIcon, { backgroundColor: persona.color + "20" }]}
      >
        <Ionicons name={persona.icon as any} size={24} color={persona.color} />
      </View>
      <View style={styles.personaInfo}>
        <View style={styles.personaHeader}>
          <Text style={[styles.personaName, { color: colors.text }]}>
            {persona.name}
          </Text>
          {persona.isBuiltIn && (
            <View
              style={[
                styles.builtInBadge,
                { backgroundColor: colors.primary + "20" },
              ]}
            >
              <Text style={[styles.builtInText, { color: colors.primary }]}>
                {t("aiAdmin.builtIn")}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.personaDesc, { color: colors.textMuted }]}>
          {persona.description}
        </Text>
        <Text style={[styles.personaTemp, { color: colors.textMuted }]}>
          T° {persona.temperature}
        </Text>
      </View>
      <View style={styles.personaActions}>
        <Switch
          value={persona.isActive}
          onValueChange={onToggle}
          trackColor={{ true: persona.color, false: colors.border }}
        />
        {!persona.isBuiltIn && (
          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────

export default function PersonasScreen() {
  const colors = useColors();
  const spacing = useSpacing();
  const { t } = useI18n();

  const { personas, addPersona, togglePersona, deletePersona } =
    useAIAdminStore();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<AIPersonaFormData>({
    name: "",
    description: "",
    icon: "sparkles",
    color: "#8B5CF6",
    systemPrompt: "",
    temperature: 0.7,
  });

  const handleAdd = useCallback(() => {
    if (!form.name.trim()) {
      Alert.alert(t("aiAdmin.error"), t("aiAdmin.nameRequired"));
      return;
    }
    addPersona(form);
    setForm({
      name: "",
      description: "",
      icon: "sparkles",
      color: "#8B5CF6",
      systemPrompt: "",
      temperature: 0.7,
    });
    setShowModal(false);
  }, [form, addPersona, t]);

  const handleDelete = useCallback(
    (id: string, name: string) => {
      Alert.alert(
        t("aiAdmin.deleteConfirm"),
        t("aiAdmin.deleteConfirmMsg", { name }),
        [
          { text: t("aiAdmin.cancel"), style: "cancel" },
          {
            text: t("aiAdmin.delete"),
            style: "destructive",
            onPress: () => deletePersona(id),
          },
        ],
      );
    },
    [deletePersona, t],
  );

  const renderPersona = useCallback(
    ({ item }: { item: AIPersona }) => (
      <PersonaCard
        persona={item}
        onToggle={(active) => togglePersona(item.id, active)}
        onDelete={() => handleDelete(item.id, item.name)}
        colors={colors}
        t={t}
      />
    ),
    [colors, t, togglePersona, handleDelete],
  );

  return (
    <View
      testID="personas-screen"
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <FlatList
        data={personas}
        keyExtractor={(p) => p.id}
        renderItem={renderPersona}
        contentContainerStyle={[styles.list, { padding: spacing.md }]}
        ListHeaderComponent={
          <Text style={[styles.headerText, { color: colors.textMuted }]}>
            {t("aiAdmin.personasDescription")}
          </Text>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        testID="add-persona-btn"
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Create Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t("aiAdmin.newPersona")}
            </Text>

            <ScrollView style={styles.modalScroll}>
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
                {t("aiAdmin.personaName")}
              </Text>
              <TextInput
                testID="persona-name-input"
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border },
                ]}
                value={form.name}
                onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
                placeholder={t("aiAdmin.personaNamePlaceholder")}
                placeholderTextColor={colors.textMuted}
              />

              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
                {t("aiAdmin.personaDescription")}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { color: colors.text, borderColor: colors.border },
                ]}
                value={form.description}
                onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
                placeholder={t("aiAdmin.personaDescPlaceholder")}
                placeholderTextColor={colors.textMuted}
              />

              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
                {t("aiAdmin.systemPrompt")}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { color: colors.text, borderColor: colors.border },
                ]}
                value={form.systemPrompt}
                onChangeText={(v) =>
                  setForm((f) => ({ ...f, systemPrompt: v }))
                }
                multiline
                numberOfLines={4}
                placeholder={t("aiAdmin.systemPromptPlaceholder")}
                placeholderTextColor={colors.textMuted}
              />

              {/* Color picker */}
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
                {t("aiAdmin.color")}
              </Text>
              <View style={styles.colorRow}>
                {PERSONA_COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.colorDot,
                      { backgroundColor: c },
                      form.color === c && styles.colorDotSelected,
                    ]}
                    onPress={() => setForm((f) => ({ ...f, color: c }))}
                  />
                ))}
              </View>

              {/* Icon picker */}
              <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
                {t("aiAdmin.icon")}
              </Text>
              <View style={styles.iconRow}>
                {PERSONA_ICONS.map((ic) => (
                  <TouchableOpacity
                    key={ic}
                    style={[
                      styles.iconBtn,
                      {
                        borderColor:
                          form.icon === ic ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setForm((f) => ({ ...f, icon: ic }))}
                  >
                    <Ionicons
                      name={ic as any}
                      size={20}
                      color={
                        form.icon === ic ? colors.primary : colors.textMuted
                      }
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.border }]}
                onPress={() => setShowModal(false)}
              >
                <Text style={{ color: colors.text }}>
                  {t("aiAdmin.cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="save-persona-btn"
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                onPress={handleAdd}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  {t("aiAdmin.save")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { gap: 10, paddingBottom: 80 },
  headerText: { fontSize: 13, marginBottom: 8 },
  personaCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  personaIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  personaInfo: { flex: 1 },
  personaHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  personaName: { fontSize: 15, fontWeight: "600" },
  builtInBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 },
  builtInText: { fontSize: 10, fontWeight: "600" },
  personaDesc: { fontSize: 12, marginTop: 2 },
  personaTemp: { fontSize: 11, marginTop: 2 },
  personaActions: { alignItems: "center", gap: 8 },
  deleteBtn: { padding: 4 },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "85%",
  },
  modalScroll: { maxHeight: 400 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  textArea: { height: 80, textAlignVertical: "top" },
  colorRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorDotSelected: { borderWidth: 3, borderColor: "#fff" },
  iconRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  iconBtn: { borderWidth: 1.5, borderRadius: 8, padding: 6 },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    justifyContent: "flex-end",
  },
  modalBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});
