import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import { useToast } from "@/providers/ToastProvider";
import { supabase } from "@/services/supabase";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface AvatarProps {
  size?: number;
  url: string | null;
  onUpload: (filePath: string) => void;
  showEditButton?: boolean;
}

export default function Avatar({
  url,
  size = 150,
  onUpload,
  showEditButton = false,
}: AvatarProps) {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const colors = useColors();
  const { t } = useI18n();
  const { showToast } = useToast();

  const avatarSize = { height: size, width: size };

  useEffect(() => {
    if (url) downloadImage(url);
  }, [url]);

  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabase.storage
        .from("avatars")
        .download(path);

      if (error) {
        throw error;
      }

      const fr = new FileReader();
      fr.readAsDataURL(data);
      fr.onload = () => {
        setAvatarUrl(fr.result as string);
      };
    } catch (error) {
      if (error instanceof Error) {
        console.log("Error downloading image: ", error.message);
      }
    }
  }

  async function uploadAvatar() {
    try {
      setUploading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        base64: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log("User cancelled image picker.");
        return;
      }

      const image = result.assets[0];

      if (!image.base64) {
        throw new Error(t("components.noImageData"));
      }

      const fileExt = image.uri.split(".").pop()?.toLowerCase() ?? "jpeg";
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, decode(image.base64), {
          contentType: image.mimeType ?? "image/jpeg",
        });

      if (uploadError) {
        throw uploadError;
      }

      onUpload(filePath);
    } catch (error) {
      if (error instanceof Error) {
        showToast(error.message, "error");
      } else {
        throw error;
      }
    } finally {
      setUploading(false);
    }
  }

  // Helper to decode base64 for Supabase upload in React Native
  function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  return (
    <View style={styles.container}>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          accessible={true}
          accessibilityLabel={t("components.avatar")}
          style={[avatarSize, styles.avatar, styles.image]}
        />
      ) : (
        <View
          style={[
            avatarSize,
            styles.avatar,
            { backgroundColor: colors.surface },
          ]}
        >
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      {showEditButton && (
        <View style={styles.uploadButtonContainer}>
          {uploading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <TouchableOpacity
              onPress={uploadAvatar}
              style={[styles.editButton, { backgroundColor: colors.primary }]}
            >
              <Text
                style={{ color: colors.text, fontSize: 12, fontWeight: "bold" }}
              >
                {t("components.edit")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatar: {
    borderRadius: 999, // High number for full circle
    overflow: "hidden",
    maxWidth: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    objectFit: "cover",
    paddingTop: 0,
  },
  uploadButtonContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
