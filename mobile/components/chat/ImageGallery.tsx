/**
 * ImageGallery Component - Mobile
 * Affiche images en grille dans le chat avec vue fullscreen
 * Zoom pinch-to-zoom et swipe entre images
 */

import { useColors } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import React, { useCallback, useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  FadeIn,
  SlideInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const PRIMARY_COLOR = "#8B5CF6";

export interface GalleryMedia {
  id: string;
  uri: string;
  type: "image" | "video";
  width?: number;
  height?: number;
  thumbnail?: string;
}

export interface ImageGalleryProps {
  /** Liste des médias à afficher */
  media: GalleryMedia[];
  /** Nombre de colonnes en mode grille */
  columns?: number;
  /** Espacement entre items */
  spacing?: number;
  /** Afficher en grille (false = liste horizontale) */
  gridMode?: boolean;
  /** Callback tap sur item */
  onItemPress?: (media: GalleryMedia, index: number) => void;
  /** Index initial si ouvert en lightbox */
  initialIndex?: number;
  /** Couleur principale */
  primaryColor?: string;
}

/**
 * Item de grille
 */
function GridItem({
  media,
  onPress,
  size,
}: {
  media: GalleryMedia;
  onPress: () => void;
  size: number;
}) {
  const colors = useColors();
  const isVideo = media.type === "video";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.gridItem, { width: size, height: size }]}
      accessibilityLabel={`Voir ${isVideo ? "vidéo" : "image"}`}
      accessibilityRole="button"
    >
      <Image
        source={{ uri: media.thumbnail || media.uri }}
        style={[styles.gridImage, { width: size, height: size }]}
        resizeMode="cover"
      />
      {isVideo && (
        <View style={styles.videoIndicator}>
          <Ionicons name="play-circle" size={32} color="#FFFFFF" />
        </View>
      )}
    </TouchableOpacity>
  );
}

/**
 * Vue fullscreen avec zoom
 */
function FullscreenViewer({
  media,
  visible,
  onClose,
  initialIndex = 0,
  primaryColor = PRIMARY_COLOR,
}: {
  media: GalleryMedia[];
  visible: boolean;
  onClose: () => void;
  initialIndex?: number;
  primaryColor?: string;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Animated values for zoom/pan
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const resetTransform = useCallback(() => {
    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, []);

  const handleClose = useCallback(() => {
    resetTransform();
    onClose();
  }, [onClose, resetTransform]);

  const handleIndexChange = useCallback(
    (info: { viewableItems: ViewToken[] }) => {
      if (info.viewableItems[0]) {
        setCurrentIndex(info.viewableItems[0].index || 0);
        resetTransform();
      }
    },
    [resetTransform],
  );

  // Pinch gesture for zoom
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = Math.max(1, Math.min(savedScale.value * event.scale, 5));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value < 1.1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
    });

  // Pan gesture for moving
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + event.translationX;
        translateY.value = savedTranslateY.value + event.translationY;
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // Double tap to zoom
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = withSpring(1);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedScale.value = 1;
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        scale.value = withSpring(2);
        savedScale.value = 2;
      }
    });

  const composedGesture = Gesture.Simultaneous(
    pinchGesture,
    panGesture,
    doubleTapGesture,
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const renderItem = useCallback(
    ({ item, index }: { item: GalleryMedia; index: number }) => {
      const isVideo = item.type === "video";
      const isCurrentItem = index === currentIndex;

      return (
        <View style={styles.fullscreenItem}>
          {isCurrentItem ? (
            <GestureDetector gesture={composedGesture}>
              <Animated.View
                style={[styles.fullscreenImageContainer, animatedStyle]}
              >
                {isVideo ? (
                  <Video
                    source={{ uri: item.uri }}
                    style={styles.fullscreenMedia}
                    resizeMode={ResizeMode.CONTAIN}
                    useNativeControls
                    shouldPlay={isCurrentItem}
                  />
                ) : (
                  <Image
                    source={{ uri: item.uri }}
                    style={styles.fullscreenMedia}
                    resizeMode="contain"
                  />
                )}
              </Animated.View>
            </GestureDetector>
          ) : (
            <Image
              source={{ uri: item.thumbnail || item.uri }}
              style={styles.fullscreenMedia}
              resizeMode="contain"
            />
          )}
        </View>
      );
    },
    [currentIndex, composedGesture, animatedStyle],
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <GestureHandlerRootView style={styles.fullscreenContainer}>
        <View
          style={[styles.fullscreenBackground, { backgroundColor: "#000000" }]}
        >
          {/* Header */}
          <Animated.View
            entering={SlideInUp}
            style={[styles.fullscreenHeader, { paddingTop: insets.top + 8 }]}
          >
            <TouchableOpacity
              onPress={handleClose}
              style={styles.fullscreenCloseButton}
              accessibilityLabel="Fermer"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            <Text style={styles.fullscreenCounter}>
              {currentIndex + 1} / {media.length}
            </Text>

            <View style={{ width: 36 }} />
          </Animated.View>

          {/* Images */}
          <FlatList
            data={media}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={initialIndex}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            onViewableItemsChanged={handleIndexChange}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          />

          {/* Footer indicators */}
          {media.length > 1 && (
            <Animated.View
              entering={FadeIn}
              style={[
                styles.pageIndicator,
                { paddingBottom: insets.bottom + 16 },
              ]}
            >
              {media.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.pageDot,
                    {
                      backgroundColor:
                        index === currentIndex
                          ? primaryColor
                          : "rgba(255,255,255,0.4)",
                    },
                  ]}
                />
              ))}
            </Animated.View>
          )}
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

/**
 * ImageGallery - Affiche images en grille avec vue fullscreen
 */
export function ImageGallery({
  media,
  columns = 3,
  spacing = 4,
  gridMode = true,
  onItemPress,
  initialIndex,
  primaryColor = PRIMARY_COLOR,
}: ImageGalleryProps) {
  const colors = useColors();
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const itemSize = useMemo(() => {
    const totalSpacing = spacing * (columns + 1);
    return (SCREEN_WIDTH - totalSpacing) / columns;
  }, [columns, spacing]);

  const handleItemPress = useCallback(
    (item: GalleryMedia, index: number) => {
      if (onItemPress) {
        onItemPress(item, index);
      } else {
        setLightboxIndex(index);
        setLightboxVisible(true);
      }
    },
    [onItemPress],
  );

  const closeLightbox = useCallback(() => {
    setLightboxVisible(false);
  }, []);

  if (!media.length) return null;

  // Layout pour 1, 2, 3 ou 4+ images
  const renderLayout = () => {
    const count = media.length;

    if (count === 1) {
      const item = media[0];
      const aspectRatio =
        item.width && item.height ? item.width / item.height : 1;
      const maxWidth = SCREEN_WIDTH * 0.7;
      const maxHeight = SCREEN_HEIGHT * 0.4;
      let width = maxWidth;
      let height = width / aspectRatio;
      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }

      return (
        <TouchableOpacity
          onPress={() => handleItemPress(item, 0)}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: item.thumbnail || item.uri }}
            style={[styles.singleImage, { width, height }]}
            resizeMode="cover"
          />
          {item.type === "video" && (
            <View style={[styles.videoIndicator, styles.videoIndicatorLarge]}>
              <Ionicons name="play-circle" size={48} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>
      );
    }

    if (count === 2) {
      return (
        <View style={[styles.twoImageLayout, { gap: spacing }]}>
          {media.map((item, index) => (
            <GridItem
              key={item.id}
              media={item}
              onPress={() => handleItemPress(item, index)}
              size={(SCREEN_WIDTH * 0.7 - spacing) / 2}
            />
          ))}
        </View>
      );
    }

    // 3+ images in grid
    return (
      <View style={[styles.gridLayout, { gap: spacing }]}>
        {media.slice(0, gridMode ? media.length : 4).map((item, index) => (
          <View key={item.id}>
            <GridItem
              media={item}
              onPress={() => handleItemPress(item, index)}
              size={itemSize}
            />
            {!gridMode && index === 3 && media.length > 4 && (
              <View style={styles.moreOverlay}>
                <Text style={styles.moreText}>+{media.length - 4}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderLayout()}

      <FullscreenViewer
        media={media}
        visible={lightboxVisible}
        onClose={closeLightbox}
        initialIndex={lightboxIndex}
        primaryColor={primaryColor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
  },
  gridLayout: {
    flexDirection: "row",
    flexWrap: "wrap",
    maxWidth: SCREEN_WIDTH * 0.7,
  },
  twoImageLayout: {
    flexDirection: "row",
  },
  gridItem: {
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#1F2937",
  },
  gridImage: {
    borderRadius: 8,
  },
  singleImage: {
    borderRadius: 12,
    backgroundColor: "#1F2937",
  },
  videoIndicator: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  videoIndicatorLarge: {
    borderRadius: 12,
  },
  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  moreText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
  // Fullscreen styles
  fullscreenContainer: {
    flex: 1,
  },
  fullscreenBackground: {
    flex: 1,
  },
  fullscreenHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  fullscreenCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenCounter: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  fullscreenItem: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenImageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenMedia: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
  },
  pageIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  pageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export type { GalleryMedia, ImageGalleryProps };
