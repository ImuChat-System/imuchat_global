/**
 * FlashListCompat — Couche de compatibilité FlashList / FlatList
 *
 * Fournit un wrapper qui utilise @shopify/flash-list si disponible,
 * sinon fallback sur FlatList standard.
 * Permet de préparer la migration progressive vers FlashList.
 *
 * Sprint S14A — FlashList Migration
 */

import React from "react";
import { FlatList, type FlatListProps } from "react-native";

export interface FlashListCompatProps<T> extends FlatListProps<T> {
  /** Taille estimée d'un item (requis par FlashList, ignoré par FlatList) */
  estimatedItemSize?: number;
  /** Nombre d'items à rendre hors écran */
  drawDistance?: number;
}

/**
 * FlashListCompat — FlatList optimisé
 *
 * Applique des optimisations de performances sur FlatList :
 * - windowSize et maxToRenderPerBatch optimisés
 * - removeClippedSubviews activé
 * - initialNumToRender contrôlé
 *
 * Quand @shopify/flash-list sera installé, ce composant
 * pourra être migré pour l'utiliser sous le capot.
 */
function FlashListCompatInner<T>(
  props: FlashListCompatProps<T>,
  ref: React.Ref<FlatList<T>>,
) {
  const {
    estimatedItemSize: _estimatedItemSize,
    drawDistance: _drawDistance,
    ...flatListProps
  } = props;

  return (
    <FlatList<T>
      ref={ref}
      windowSize={5}
      maxToRenderPerBatch={10}
      initialNumToRender={8}
      removeClippedSubviews={true}
      updateCellsBatchingPeriod={50}
      {...flatListProps}
    />
  );
}

// ForwardRef avec générique
export const FlashListCompat = React.forwardRef(FlashListCompatInner) as <T>(
  props: FlashListCompatProps<T> & { ref?: React.Ref<FlatList<T>> },
) => React.ReactElement;

export default FlashListCompat;
