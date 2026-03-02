/**
 * BotCommandSuggestions — Overlay d'autocomplétion de commandes bot
 *
 * S'affiche au-dessus du MessageInput quand l'utilisateur tape "/".
 * Montre les commandes disponibles dans le groupe actuel.
 *
 * Phase 3 — DEV-025 Bots de groupe
 */

import { useColors } from "@/providers/ThemeProvider";
import React, { useMemo } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CommandSuggestion {
  command: string;
  description: string;
  botName: string;
}

interface BotCommandSuggestionsProps {
  /** Texte actuellement tapé */
  inputText: string;
  /** Commandes disponibles (venant de useBots) */
  commands: CommandSuggestion[];
  /** Callback quand une commande est sélectionnée */
  onSelect: (command: string) => void;
  /** Visible seulement si le texte commence par / */
  visible: boolean;
}

export function BotCommandSuggestions({
  inputText,
  commands,
  onSelect,
  visible,
}: BotCommandSuggestionsProps) {
  const colors = useColors();

  // Filtrer les commandes selon le texte tapé
  const filteredCommands = useMemo(() => {
    if (!visible || commands.length === 0) return [];
    const query = inputText.slice(1).toLowerCase(); // Remove /
    if (!query) return commands.slice(0, 8); // Afficher les 8 premières si juste "/"
    return commands
      .filter(
        (c) =>
          c.command.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query),
      )
      .slice(0, 6);
  }, [inputText, commands, visible]);

  if (!visible || filteredCommands.length === 0) return null;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <FlatList
        data={filteredCommands}
        keyExtractor={(item) => item.command}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, { borderBottomColor: colors.border }]}
            onPress={() => onSelect(item.command + " ")}
            activeOpacity={0.6}
          >
            <View style={styles.itemLeft}>
              <Text style={[styles.command, { color: colors.primary }]}>
                {item.command}
              </Text>
              <Text
                style={[styles.description, { color: colors.textMuted }]}
                numberOfLines={1}
              >
                {item.description}
              </Text>
            </View>
            <Text style={[styles.botName, { color: colors.textMuted }]}>
              {item.botName}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 200,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemLeft: {
    flex: 1,
    gap: 2,
  },
  command: {
    fontSize: 14,
    fontWeight: "600",
  },
  description: {
    fontSize: 12,
  },
  botName: {
    fontSize: 11,
    marginLeft: 8,
  },
});
