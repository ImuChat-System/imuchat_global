/**
 * Create Story Screen
 *
 * Allows creating stories with:
 * - Camera capture (photo/video)
 * - Gallery selection
 * - Text with colored backgrounds
 *
 * DEV-011: Stories Réelles
 */

import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import { useToast } from "@/providers/ToastProvider";
import {
  pickImage,
  pickVideo,
  takePhoto,
  takeVideo,
} from "@/services/media-upload";
import {
  STORY_BACKGROUNDS,
  type StoryFontStyle,
  type StoryVisibility,
} from "@/services/stories-api";
import { useStoriesStore } from "@/stores/stories-store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type StoryMode = "text" | "image" | "video";
type CreationStep = "select" | "compose" | "preview";

const FONT_STYLES: { id: StoryFontStyle; name: string; sample: string }[] = [
  { id: "default", name: "Default", sample: "Aa" },
  { id: "serif", name: "Serif", sample: "Aa" },
  { id: "mono", name: "Mono", sample: "Aa" },
  { id: "handwritten", name: "Script", sample: "Aa" },
];

const VISIBILITY_OPTIONS: {
  id: StoryVisibility;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}[] = [
  { id: "public", icon: "globe", label: "Public" },
  { id: "friends", icon: "people", label: "Friends" },
  { id: "private", icon: "lock-closed", label: "Only me" },
];

export default function CreateStoryScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const { showToast } = useToast();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { createStory, isCreating } = useStoriesStore();

  // State
  const [step, setStep] = useState<CreationStep>("select");
  const [mode, setMode] = useState<StoryMode>("text");
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [textContent, setTextContent] = useState("");
  const [selectedBgIndex, setSelectedBgIndex] = useState(0);
  const [fontStyle, setFontStyle] = useState<StoryFontStyle>("default");
  const [visibility, setVisibility] = useState<StoryVisibility>("friends");
  const [allowReplies, setAllowReplies] = useState(true);

  const selectedBg = STORY_BACKGROUNDS[selectedBgIndex];

  // ─── Media Selection ────────────────────────────────────────
  const handlePickImage = useCallback(async () => {
    try {
      const result = await pickImage();
      if (result) {
        setMediaUri(result.uri);
        setMode("image");
        setStep("compose");
      }
    } catch (error) {
      showToast(
        t("stories.mediaPickError", { defaultValue: "Failed to select image" }),
        "error",
      );
    }
  }, [t]);

  const handlePickVideo = useCallback(async () => {
    try {
      const result = await pickVideo();
      if (result) {
        setMediaUri(result.uri);
        setMode("video");
        setStep("compose");
      }
    } catch (error) {
      showToast(
        t("stories.mediaPickError", { defaultValue: "Failed to select video" }),
        "error",
      );
    }
  }, [t]);

  const handleTakePhoto = useCallback(async () => {
    try {
      const result = await takePhoto();
      if (result) {
        setMediaUri(result.uri);
        setMode("image");
        setStep("compose");
      }
    } catch (error) {
      showToast(
        t("stories.cameraError", { defaultValue: "Failed to capture photo" }),
        "error",
      );
    }
  }, [t]);

  const handleTakeVideo = useCallback(async () => {
    try {
      const result = await takeVideo();
      if (result) {
        setMediaUri(result.uri);
        setMode("video");
        setStep("compose");
      }
    } catch (error) {
      showToast(
        t("stories.cameraError", { defaultValue: "Failed to capture video" }),
        "error",
      );
    }
  }, [t]);

  const handleTextMode = useCallback(() => {
    setMode("text");
    setStep("compose");
  }, []);

  // ─── Create Story ───────────────────────────────────────────
  const handleCreate = useCallback(async () => {
    if (mode === "text" && !textContent.trim()) {
      showToast(
        t("stories.emptyTextError", { defaultValue: "Please enter some text" }),
        "warning",
      );
      return;
    }

    const result = await createStory({
      type: mode,
      media_uri: mediaUri || undefined,
      text_content: textContent || undefined,
      background_color: mode === "text" ? selectedBg.color : undefined,
      text_color: mode === "text" ? selectedBg.textColor : undefined,
      font_style: fontStyle,
      visibility,
      allow_replies: allowReplies,
    });

    if (result) {
      router.back();
    } else {
      showToast(
        t("stories.createError", { defaultValue: "Failed to create story" }),
        "error",
      );
    }
  }, [
    mode,
    mediaUri,
    textContent,
    selectedBg,
    fontStyle,
    visibility,
    allowReplies,
    createStory,
    router,
    t,
  ]);

  // ─── Back handler ───────────────────────────────────────────
  const handleBack = useCallback(() => {
    if (step === "select") {
      router.back();
    } else {
      setStep("select");
      setMediaUri(null);
      setTextContent("");
    }
  }, [step, router]);

  // ═══════════════════════════════════════════════════════════
  // RENDER: Selection Step
  // ═══════════════════════════════════════════════════════════

  const renderSelectionStep = () => (
    <View style={styles.selectionContainer}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {t("stories.createTitle", { defaultValue: "Create Story" })}
      </Text>
      <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
        {t("stories.createSubtitle", {
          defaultValue: "Share a moment with your friends",
        })}
      </Text>

      <View style={styles.modeGrid}>
        {/* Camera */}
        <TouchableOpacity
          style={[
            styles.modeCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={handleTakePhoto}
        >
          <View
            style={[
              styles.modeIconCircle,
              { backgroundColor: colors.primary + "20" },
            ]}
          >
            <Ionicons name="camera" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.modeLabel, { color: colors.text }]}>
            {t("stories.takePhoto", { defaultValue: "Take Photo" })}
          </Text>
        </TouchableOpacity>

        {/* Video */}
        <TouchableOpacity
          style={[
            styles.modeCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={handleTakeVideo}
        >
          <View
            style={[
              styles.modeIconCircle,
              { backgroundColor: colors.secondary + "20" },
            ]}
          >
            <Ionicons name="videocam" size={32} color={colors.secondary} />
          </View>
          <Text style={[styles.modeLabel, { color: colors.text }]}>
            {t("stories.recordVideo", { defaultValue: "Record Video" })}
          </Text>
        </TouchableOpacity>

        {/* Gallery */}
        <TouchableOpacity
          style={[
            styles.modeCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={handlePickImage}
        >
          <View
            style={[
              styles.modeIconCircle,
              { backgroundColor: colors.info + "20" },
            ]}
          >
            <Ionicons name="images" size={32} color={colors.info} />
          </View>
          <Text style={[styles.modeLabel, { color: colors.text }]}>
            {t("stories.fromGallery", { defaultValue: "From Gallery" })}
          </Text>
        </TouchableOpacity>

        {/* Text */}
        <TouchableOpacity
          style={[
            styles.modeCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          onPress={handleTextMode}
        >
          <View
            style={[
              styles.modeIconCircle,
              { backgroundColor: colors.warning + "20" },
            ]}
          >
            <Ionicons name="text" size={32} color={colors.warning} />
          </View>
          <Text style={[styles.modeLabel, { color: colors.text }]}>
            {t("stories.textStory", { defaultValue: "Text Story" })}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ═══════════════════════════════════════════════════════════
  // RENDER: Compose Step
  // ═══════════════════════════════════════════════════════════

  const renderComposeStep = () => (
    <KeyboardAvoidingView
      style={styles.composeContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Preview area */}
      <View style={styles.previewArea}>
        {mode === "text" ? (
          <View
            style={[styles.textPreview, { backgroundColor: selectedBg.color }]}
          >
            <TextInput
              style={[
                styles.textInput,
                {
                  color: selectedBg.textColor,
                  fontFamily:
                    fontStyle === "serif"
                      ? "serif"
                      : fontStyle === "mono"
                        ? "monospace"
                        : undefined,
                },
              ]}
              placeholder={t("stories.textPlaceholder", {
                defaultValue: "Type your story...",
              })}
              placeholderTextColor={selectedBg.textColor + "80"}
              value={textContent}
              onChangeText={setTextContent}
              multiline
              textAlign="center"
              maxLength={500}
            />
          </View>
        ) : mediaUri ? (
          <View style={styles.mediaPreview}>
            <Image
              source={{ uri: mediaUri }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            {/* Optional caption input at bottom */}
            <View style={styles.captionInputContainer}>
              <TextInput
                style={styles.captionInput}
                placeholder={t("stories.addCaption", {
                  defaultValue: "Add a caption...",
                })}
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={textContent}
                onChangeText={setTextContent}
                maxLength={200}
              />
            </View>
          </View>
        ) : null}
      </View>

      {/* Tools */}
      <ScrollView
        style={styles.toolsContainer}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Background colors (text mode only) */}
        {mode === "text" && (
          <View style={styles.toolSection}>
            <Text style={[styles.toolLabel, { color: colors.text }]}>
              {t("stories.background", { defaultValue: "Background" })}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.bgColorRow}>
                {STORY_BACKGROUNDS.map((bg, index) => (
                  <TouchableOpacity
                    key={bg.id}
                    style={[
                      styles.bgColorItem,
                      {
                        backgroundColor: bg.color.startsWith("linear")
                          ? "#6366f1"
                          : bg.color,
                      },
                      selectedBgIndex === index && styles.bgColorSelected,
                    ]}
                    onPress={() => setSelectedBgIndex(index)}
                  >
                    {selectedBgIndex === index && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={bg.textColor}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Font style (text mode only) */}
        {mode === "text" && (
          <View style={styles.toolSection}>
            <Text style={[styles.toolLabel, { color: colors.text }]}>
              {t("stories.fontStyle", { defaultValue: "Font Style" })}
            </Text>
            <View style={styles.fontStyleRow}>
              {FONT_STYLES.map((font) => (
                <TouchableOpacity
                  key={font.id}
                  style={[
                    styles.fontStyleItem,
                    {
                      backgroundColor:
                        fontStyle === font.id ? colors.primary : colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setFontStyle(font.id)}
                >
                  <Text
                    style={[
                      styles.fontStyleSample,
                      {
                        color: fontStyle === font.id ? "#fff" : colors.text,
                        fontFamily:
                          font.id === "serif"
                            ? "serif"
                            : font.id === "mono"
                              ? "monospace"
                              : undefined,
                      },
                    ]}
                  >
                    {font.sample}
                  </Text>
                  <Text
                    style={[
                      styles.fontStyleName,
                      {
                        color:
                          fontStyle === font.id ? "#fff" : colors.textMuted,
                      },
                    ]}
                  >
                    {font.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Visibility */}
        <View style={styles.toolSection}>
          <Text style={[styles.toolLabel, { color: colors.text }]}>
            {t("stories.visibility", { defaultValue: "Who can see this?" })}
          </Text>
          <View style={styles.visibilityRow}>
            {VISIBILITY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.visibilityItem,
                  {
                    backgroundColor:
                      visibility === option.id
                        ? colors.primary
                        : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setVisibility(option.id)}
              >
                <Ionicons
                  name={option.icon}
                  size={18}
                  color={visibility === option.id ? "#fff" : colors.textMuted}
                />
                <Text
                  style={[
                    styles.visibilityLabel,
                    { color: visibility === option.id ? "#fff" : colors.text },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Allow replies toggle */}
        <View style={styles.toolSection}>
          <TouchableOpacity
            style={[
              styles.toggleRow,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => setAllowReplies(!allowReplies)}
          >
            <View style={styles.toggleLeft}>
              <Ionicons
                name="chatbubble-outline"
                size={20}
                color={colors.text}
              />
              <Text style={[styles.toggleLabel, { color: colors.text }]}>
                {t("stories.allowReplies", { defaultValue: "Allow replies" })}
              </Text>
            </View>
            <View
              style={[
                styles.toggleSwitch,
                {
                  backgroundColor: allowReplies
                    ? colors.primary
                    : colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.toggleKnob,
                  { transform: [{ translateX: allowReplies ? 18 : 2 }] },
                ]}
              />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // ═══════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {step === "select"
            ? t("stories.createTitle", { defaultValue: "Create Story" })
            : mode === "text"
              ? t("stories.textStory", { defaultValue: "Text Story" })
              : mode === "video"
                ? t("stories.videoStory", { defaultValue: "Video Story" })
                : t("stories.photoStory", { defaultValue: "Photo Story" })}
        </Text>

        {step === "compose" && (
          <TouchableOpacity
            onPress={handleCreate}
            style={[styles.postButton, { backgroundColor: colors.primary }]}
            disabled={isCreating}
          >
            {isCreating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.postButtonText}>
                {t("stories.post", { defaultValue: "Post" })}
              </Text>
            )}
          </TouchableOpacity>
        )}

        {step === "select" && <View style={{ width: 60 }} />}
      </View>

      {/* Content */}
      {step === "select" && renderSelectionStep()}
      {step === "compose" && renderComposeStep()}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerButton: {
    padding: 4,
    width: 60,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  postButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: "center",
  },
  postButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  // Selection step
  selectionContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  modeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  modeCard: {
    width: (SCREEN_WIDTH - 56) / 2,
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  modeIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  modeLabel: {
    fontSize: 15,
    fontWeight: "600",
  },

  // Compose step
  composeContainer: {
    flex: 1,
  },
  previewArea: {
    height: SCREEN_HEIGHT * 0.45,
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  textPreview: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  textInput: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    width: "100%",
  },
  mediaPreview: {
    flex: 1,
    backgroundColor: "#000",
  },
  captionInputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  captionInput: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 15,
  },

  // Tools
  toolsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  toolSection: {
    marginBottom: 20,
  },
  toolLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },

  // Background colors
  bgColorRow: {
    flexDirection: "row",
    gap: 10,
  },
  bgColorItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  bgColorSelected: {
    borderWidth: 3,
    borderColor: "#fff",
  },

  // Font styles
  fontStyleRow: {
    flexDirection: "row",
    gap: 10,
  },
  fontStyleItem: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  fontStyleSample: {
    fontSize: 18,
    fontWeight: "600",
  },
  fontStyleName: {
    fontSize: 11,
    marginTop: 4,
  },

  // Visibility
  visibilityRow: {
    flexDirection: "row",
    gap: 10,
  },
  visibilityItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  visibilityLabel: {
    fontSize: 13,
    fontWeight: "500",
  },

  // Toggle
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  toggleLabel: {
    fontSize: 15,
  },
  toggleSwitch: {
    width: 44,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#fff",
  },
});
