import { useColors } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

interface MessageInputProps {
  onSend: (message: string) => void;
  onTyping?: () => void;
  disabled?: boolean;
}

export default function MessageInput({
  onSend,
  onTyping,
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const colors = useColors();

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleChangeText = (text: string) => {
    setMessage(text);
    // Trigger typing indicator
    if (text.length > 0 && onTyping) {
      onTyping();
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderTopColor: colors.border },
      ]}
    >
      <TextInput
        style={[
          styles.input,
          { color: colors.text, backgroundColor: colors.background },
        ]}
        placeholder="Type a message..."
        placeholderTextColor={colors.textMuted}
        value={message}
        onChangeText={handleChangeText}
        multiline
        maxLength={1000}
        editable={!disabled}
      />

      <TouchableOpacity
        style={[
          styles.sendButton,
          { backgroundColor: message.trim() ? colors.primary : colors.border },
        ]}
        onPress={handleSend}
        disabled={!message.trim() || disabled}
      >
        <Ionicons
          name="send"
          size={20}
          color={message.trim() ? "#FFFFFF" : colors.textMuted}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
