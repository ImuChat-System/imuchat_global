import { useI18n } from "@/providers/I18nProvider";
import { useColors } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated";

// GIPHY API key - in production, move to environment variables
const GIPHY_API_KEY =
  process.env.EXPO_PUBLIC_GIPHY_API_KEY || "YOUR_GIPHY_API_KEY";
const GIPHY_URL = "https://api.giphy.com/v1/gifs";

interface GifImage {
  id: string;
  url: string;
  previewUrl: string;
  width: number;
  height: number;
  title: string;
}

interface GifPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (gif: { url: string; title: string }) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const NUM_COLUMNS = 2;
const GIF_SIZE = (SCREEN_WIDTH - 48) / NUM_COLUMNS;

export function GifPicker({ visible, onClose, onSelect }: GifPickerProps) {
  const colors = useColors();
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [gifs, setGifs] = useState<GifImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch trending GIFs on mount
  const fetchTrending = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${GIPHY_URL}/trending?api_key=${GIPHY_API_KEY}&limit=24&rating=g`,
      );
      const data = await response.json();

      if (data.data) {
        setGifs(parseGifResponse(data.data));
      }
    } catch (err) {
      console.error("Error fetching trending GIFs:", err);
      setError(t("common.genericError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Search GIFs
  const searchGifs = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        fetchTrending();
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${GIPHY_URL}/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=24&rating=g`,
        );
        const data = await response.json();

        if (data.data) {
          setGifs(parseGifResponse(data.data));
        }
      } catch (err) {
        console.error("Error searching GIFs:", err);
        setError(t("common.genericError"));
      } finally {
        setLoading(false);
      }
    },
    [fetchTrending, t],
  );

  // Parse GIPHY response into our format
  const parseGifResponse = (data: any[]): GifImage[] => {
    return data.map((gif) => ({
      id: gif.id,
      url: gif.images.original.url,
      previewUrl:
        gif.images.fixed_width_small.url || gif.images.preview_gif.url,
      width: parseInt(gif.images.fixed_width_small.width, 10),
      height: parseInt(gif.images.fixed_width_small.height, 10),
      title: gif.title || "GIF",
    }));
  };

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchGifs(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchGifs]);

  // Fetch trending on open
  useEffect(() => {
    if (visible) {
      fetchTrending();
    } else {
      // Reset state when closing
      setSearchQuery("");
      setGifs([]);
      setError(null);
    }
  }, [visible, fetchTrending]);

  const handleSelect = (gif: GifImage) => {
    onSelect({ url: gif.url, title: gif.title });
    onClose();
  };

  const renderItem = ({ item }: { item: GifImage }) => (
    <TouchableOpacity
      style={[styles.gifContainer, { backgroundColor: colors.surface }]}
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.previewUrl }}
        style={styles.gifImage}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          entering={SlideInDown.springify().damping(20)}
          exiting={SlideOutDown.springify().damping(20)}
          style={[styles.container, { backgroundColor: colors.background }]}
          onStartShouldSetResponder={() => true}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {t("chat.selectGif", { defaultValue: "Select GIF" })}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Search input */}
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name="search"
              size={20}
              color={colors.textMuted}
              style={styles.searchIcon}
            />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={t("common.search", { defaultValue: "Search" })}
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* GIF Grid */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: colors.error }]}>
                {error}
              </Text>
              <TouchableOpacity
                style={[
                  styles.retryButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={() => searchGifs(searchQuery)}
              >
                <Text style={styles.retryText}>
                  {t("common.retry", { defaultValue: "Retry" })}
                </Text>
              </TouchableOpacity>
            </View>
          ) : gifs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="images-outline"
                size={48}
                color={colors.textMuted}
              />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                {t("chat.noGifsFound", { defaultValue: "No GIFs found" })}
              </Text>
            </View>
          ) : (
            <FlatList
              data={gifs}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              numColumns={NUM_COLUMNS}
              contentContainerStyle={styles.gridContainer}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* GIPHY Attribution */}
          <View style={styles.attribution}>
            <Text style={[styles.attributionText, { color: colors.textMuted }]}>
              Powered by GIPHY
            </Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

interface GifButtonProps {
  onPress: () => void;
  color?: string;
  size?: number;
}

export function GifButton({ onPress, color, size = 24 }: GifButtonProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      testID="gif-button"
      style={styles.gifButton}
      onPress={onPress}
    >
      <Text
        style={[
          styles.gifButtonText,
          { color: color || colors.textMuted, fontSize: size * 0.6 },
        ]}
      >
        GIF
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    maxHeight: "80%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  gridContainer: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  gifContainer: {
    width: GIF_SIZE,
    height: GIF_SIZE,
    margin: 6,
    borderRadius: 8,
    overflow: "hidden",
  },
  gifImage: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    flex: 1,
    minHeight: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    minHeight: 200,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    minHeight: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  attribution: {
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(128, 128, 128, 0.2)",
  },
  attributionText: {
    fontSize: 12,
  },
  gifButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  gifButtonText: {
    fontWeight: "700",
    letterSpacing: -0.5,
  },
});
