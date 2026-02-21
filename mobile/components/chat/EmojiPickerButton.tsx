/**
 * EmojiPickerButton Component - Mobile
 * A button that opens a full emoji keyboard for chat input
 */

import { useColors } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import EmojiPicker, { type EmojiType } from "rn-emoji-keyboard";

interface EmojiPickerButtonProps {
  /** Called when an emoji is selected */
  onEmojiSelected: (emoji: string) => void;
  /** Optional custom size */
  size?: number;
  /** Optional custom color */
  color?: string;
}

export function EmojiPickerButton({
  onEmojiSelected,
  size = 24,
  color,
}: EmojiPickerButtonProps) {
  const colors = useColors();
  const [isOpen, setIsOpen] = useState(false);

  const handlePick = (emoji: EmojiType) => {
    onEmojiSelected(emoji.emoji);
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name="happy-outline"
          size={size}
          color={color || colors.textMuted}
        />
      </TouchableOpacity>

      <EmojiPicker
        onEmojiSelected={handlePick}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        theme={{
          container: colors.surface,
          header: colors.text,
          skinTonesContainer: colors.background,
          category: {
            icon: colors.primary,
            iconActive: colors.primary,
            container: colors.surface,
            containerActive: colors.surfaceActive,
          },
          search: {
            background: colors.background,
            text: colors.text,
            placeholder: colors.textMuted,
          },
          emoji: {
            selected: colors.surfaceActive,
          },
          backdrop: "rgba(0,0,0,0.5)",
          knob: colors.border,
        }}
        enableSearchBar
        enableRecentlyUsed
        categoryPosition="top"
        enableCategoryChangeAnimation
        enableCategoryChangeGesture
      />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 4,
  },
});

export default EmojiPickerButton;
