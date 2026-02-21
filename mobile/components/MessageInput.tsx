import { useMediaUpload } from "@/hooks/useMediaUpload";
import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import { UploadResult } from "@/services/media-upload";
import { Message } from "@/services/messaging";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { EmojiPickerButton } from "./chat/EmojiPickerButton";
import { GifButton, GifPicker } from "./chat/GifPicker";
import { ReplyPreview } from "./chat/ReplyPreview";
import { MediaPreview, UploadProgress } from "./MediaComponents";

interface MessageInputProps {
  onSend: (message: string, mediaUrl?: string, mediaType?: string) => void;
  onTyping?: () => void;
  disabled?: boolean;
  /** Message being replied to */
  replyToMessage?: Message | null;
  /** Cancel reply callback */
  onCancelReply?: () => void;
  /** Current user ID for reply preview */
  currentUserId?: string | null;
}

export default function MessageInput({
  onSend,
  onTyping,
  disabled = false,
  replyToMessage,
  onCancelReply,
  currentUserId,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [gifPickerVisible, setGifPickerVisible] = useState(false);
  const colors = useColors();
  const { t } = useI18n();
  const inputRef = useRef<TextInput>(null);

  const {
    isUploading,
    uploadProgress,
    selectedMedia,
    showMediaOptions,
    uploadSelected,
    clear: clearMedia,
  } = useMediaUpload();

  const handleSend = async () => {
    const hasMessage = message.trim().length > 0;
    const hasMedia = !!selectedMedia;

    if (!hasMessage && !hasMedia) return;
    if (disabled || isUploading) return;

    let mediaResult: UploadResult | null = null;

    // Upload media if selected
    if (selectedMedia) {
      mediaResult = await uploadSelected(selectedMedia);
      if (!mediaResult) {
        // Upload failed, don't send
        return;
      }
    }

    // Send message with optional media
    onSend(message.trim() || "", mediaResult?.url, mediaResult?.mimeType);

    setMessage("");
    clearMedia();
  };

  const handleChangeText = (text: string) => {
    setMessage(text);
    // Trigger typing indicator
    if (text.length > 0 && onTyping) {
      onTyping();
    }
  };

  const handleEmojiSelected = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    // Focus the input after selecting an emoji
    inputRef.current?.focus();
  };

  const handleGifSelected = (gif: { url: string; title: string }) => {
    // Send GIF as a media attachment
    onSend("", gif.url, "image/gif");
  };

  const canSend = (message.trim().length > 0 || selectedMedia) && !isUploading;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        borderTopWidth: 1,
      }}
    >
      {/* Reply preview */}
      {replyToMessage && onCancelReply && (
        <ReplyPreview
          message={replyToMessage}
          onCancel={onCancelReply}
          currentUserId={currentUserId}
        />
      )}

      {/* Selected media preview */}
      {selectedMedia && (
        <View style={styles.previewContainer}>
          <MediaPreview
            uri={selectedMedia.uri}
            type={selectedMedia.type}
            thumbnailSize={80}
            showRemove={!isUploading}
            onRemove={clearMedia}
          />
        </View>
      )}

      {/* Upload progress */}
      {isUploading && (
        <View style={styles.progressContainer}>
          <UploadProgress progress={uploadProgress} />
        </View>
      )}

      {/* Input row */}
      <View style={styles.inputRow}>
        {/* Attach button */}
        <TouchableOpacity
          testID="attach-button"
          style={styles.attachButton}
          onPress={showMediaOptions}
          disabled={disabled || isUploading}
        >
          <Ionicons
            name="attach"
            size={24}
            color={isUploading ? colors.textMuted : colors.primary}
          />
        </TouchableOpacity>

        {/* Emoji picker button */}
        <EmojiPickerButton
          onEmojiSelected={handleEmojiSelected}
          size={24}
          color={colors.textMuted}
        />

        {/* GIF picker button */}
        <GifButton
          onPress={() => setGifPickerVisible(true)}
          color={colors.textMuted}
          size={24}
        />

        <TextInput
          ref={inputRef}
          testID="message-input"
          style={[
            styles.input,
            { color: colors.text, backgroundColor: colors.background },
          ]}
          placeholder={t("chat.typeMessage")}
          placeholderTextColor={colors.textMuted}
          value={message}
          onChangeText={handleChangeText}
          multiline
          maxLength={1000}
          editable={!disabled && !isUploading}
        />

        <TouchableOpacity
          testID="send-button"
          style={[
            styles.sendButton,
            { backgroundColor: canSend ? colors.primary : colors.border },
          ]}
          onPress={handleSend}
          disabled={!canSend}
        >
          <Ionicons
            name="send"
            size={20}
            color={canSend ? "#FFFFFF" : colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      {/* GIF Picker Modal */}
      <GifPicker
        visible={gifPickerVisible}
        onClose={() => setGifPickerVisible(false)}
        onSelect={handleGifSelected}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  previewContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  attachButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
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
