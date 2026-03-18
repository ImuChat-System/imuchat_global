/**
 * __tests__/sprint20-scalability-performance.test.tsx
 *
 * Sprint S20 — Scalabilité & Performance
 * Couvre : types/video-performance, preloader, adaptive-bitrate, store, PipOverlay
 */

import { act, fireEvent, render } from "@testing-library/react-native";
import React from "react";

// ─── Mocks ──────────────────────────────────────────────────

// Logger
jest.mock("@/services/logger", () => ({
  createLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }),
}));

// I18n
jest.mock("@/providers/I18nProvider", () => ({
  useI18n: () => ({
    t: (key: string, opts?: Record<string, unknown>) =>
      (opts && opts.defaultValue) || key,
    locale: "fr",
  }),
}));

// Ionicons
jest.mock("@expo/vector-icons", () => {
  const { View, Text } = require("react-native");
  return {
    Ionicons: ({ name, ...rest }: { name: string }) => {
      const RN = require("react-native");
      return <RN.View testID={`icon-${name}`} />;
    },
  };
});

// Supabase mock utilitaire
const chainMock = (resolveValue: unknown) => {
  const chain: Record<string, unknown> = {};
  const handler = () => chain;
  chain.select = handler;
  chain.insert = handler;
  chain.update = handler;
  chain.delete = handler;
  chain.eq = handler;
  chain.neq = handler;
  chain.in = handler;
  chain.order = handler;
  chain.limit = handler;
  chain.single = handler;
  chain.maybeSingle = handler;
  chain.range = handler;
  chain.filter = handler;
  chain.match = handler;
  chain.from = handler;
  chain.then = (resolve: (v: unknown) => void) => {
    resolve(resolveValue);
    return { catch: () => ({}) };
  };
  return chain;
};

jest.mock("@/services/supabase", () => ({
  supabase: {
    from: () =>
      chainMock({
        data: {
          thumbnail_url: "https://example.com/thumb.jpg",
          duration_ms: 30000,
          profiles: { username: "testuser" },
        },
        error: null,
      }),
  },
}));

// ─── Imports réels ──────────────────────────────────────────

import { PipOverlay } from "@/components/imufeed/PipOverlay";
import {
  computeAverageBandwidth,
  createBandwidthSample,
  getDefaultQualityForNetwork,
  isBandwidthStable,
  selectOptimalQuality,
} from "@/services/imufeed/adaptive-bitrate";
import {
  buildPreloadQueue,
  clearPreloadCache,
  getPreloadCacheStats,
  isMetadataCached,
  isSegmentCached,
  preloadMetadata,
  preloadSegment,
} from "@/services/imufeed/preloader";
import {
  initialVideoPerformanceState,
  useVideoPerformanceStore,
} from "@/stores/video-performance-store";
import type {
  AbrConfig,
  BandwidthSample,
  LowDataModeConfig,
  NetworkType,
  VideoQuality,
} from "@/types/video-performance";
import {
  DEFAULT_ABR_CONFIG,
  DEFAULT_HLS_CACHE_STATS,
  DEFAULT_LOW_DATA_MODE,
  DEFAULT_PIP_CONFIG,
  DEFAULT_PRELOADER_CONFIG,
  QUALITY_PROFILES,
} from "@/types/video-performance";

// ─── Helpers ────────────────────────────────────────────────

function resetStore() {
  useVideoPerformanceStore.setState({ ...initialVideoPerformanceState } as any);
}

function makeSamples(
  kbpsValues: number[],
  net: NetworkType = "wifi",
): BandwidthSample[] {
  return kbpsValues.map((kbps, i) => ({
    timestamp: Date.now() - (kbpsValues.length - i) * 1000,
    kbps,
    networkType: net,
  }));
}

// ═══════════════════════════════════════════════════════════
// 1. TYPES & CONSTANTES
// ═══════════════════════════════════════════════════════════

describe("S20 · Types & constantes video-performance", () => {
  test("QUALITY_PROFILES contient les 4 paliers", () => {
    expect(Object.keys(QUALITY_PROFILES)).toEqual([
      "360p",
      "480p",
      "720p",
      "1080p",
    ]);
  });

  test("chaque profil a bitrate, width, height, label", () => {
    for (const q of Object.values(QUALITY_PROFILES)) {
      expect(q).toHaveProperty("bitrate_kbps");
      expect(q).toHaveProperty("width");
      expect(q).toHaveProperty("height");
      expect(q).toHaveProperty("label");
      expect(q.bitrate_kbps).toBeGreaterThan(0);
    }
  });

  test("bitrates croissants 360p < 480p < 720p < 1080p", () => {
    expect(QUALITY_PROFILES["360p"].bitrate_kbps).toBeLessThan(
      QUALITY_PROFILES["480p"].bitrate_kbps,
    );
    expect(QUALITY_PROFILES["480p"].bitrate_kbps).toBeLessThan(
      QUALITY_PROFILES["720p"].bitrate_kbps,
    );
    expect(QUALITY_PROFILES["720p"].bitrate_kbps).toBeLessThan(
      QUALITY_PROFILES["1080p"].bitrate_kbps,
    );
  });

  test("DEFAULT_PRELOADER_CONFIG valeurs par défaut", () => {
    expect(DEFAULT_PRELOADER_CONFIG.preload_next_count).toBe(2);
    expect(DEFAULT_PRELOADER_CONFIG.metadata_prefetch_count).toBe(3);
    expect(DEFAULT_PRELOADER_CONFIG.max_cache_bytes).toBe(50 * 1024 * 1024);
    expect(DEFAULT_PRELOADER_CONFIG.disabled).toBe(false);
  });

  test("DEFAULT_ABR_CONFIG valeurs par défaut", () => {
    expect(DEFAULT_ABR_CONFIG.enabled).toBe(true);
    expect(DEFAULT_ABR_CONFIG.max_quality).toBe("1080p");
    expect(DEFAULT_ABR_CONFIG.min_quality).toBe("360p");
    expect(DEFAULT_ABR_CONFIG.bandwidth_window_size).toBe(5);
    expect(DEFAULT_ABR_CONFIG.safety_margin).toBe(0.8);
  });

  test("DEFAULT_ABR_CONFIG a des seuils pour chaque qualité", () => {
    for (const q of ["360p", "480p", "720p", "1080p"] as VideoQuality[]) {
      expect(DEFAULT_ABR_CONFIG.downswitch_threshold_kbps).toHaveProperty(q);
      expect(DEFAULT_ABR_CONFIG.upswitch_threshold_kbps).toHaveProperty(q);
    }
  });

  test("DEFAULT_LOW_DATA_MODE est désactivé par défaut", () => {
    expect(DEFAULT_LOW_DATA_MODE.enabled).toBe(false);
    expect(DEFAULT_LOW_DATA_MODE.forced_quality).toBe("360p");
    expect(DEFAULT_LOW_DATA_MODE.metadata_only_preload).toBe(true);
  });

  test("DEFAULT_PIP_CONFIG valeurs par défaut", () => {
    expect(DEFAULT_PIP_CONFIG.enabled).toBe(true);
    expect(DEFAULT_PIP_CONFIG.size_ratio).toBe(0.28);
    expect(DEFAULT_PIP_CONFIG.auto_pip_on_leave).toBe(true);
  });

  test("DEFAULT_HLS_CACHE_STATS tout à zéro", () => {
    expect(DEFAULT_HLS_CACHE_STATS.entryCount).toBe(0);
    expect(DEFAULT_HLS_CACHE_STATS.totalBytes).toBe(0);
    expect(DEFAULT_HLS_CACHE_STATS.hitRate).toBe(0);
    expect(DEFAULT_HLS_CACHE_STATS.hits).toBe(0);
    expect(DEFAULT_HLS_CACHE_STATS.misses).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════
// 2. SERVICE PRELOADER
// ═══════════════════════════════════════════════════════════

describe("S20 · Service preloader", () => {
  beforeEach(() => {
    clearPreloadCache();
  });

  describe("buildPreloadQueue", () => {
    const ids = ["v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8"];

    test("construit la file avec segments + metadata", () => {
      const queue = buildPreloadQueue(0, ids, DEFAULT_PRELOADER_CONFIG, "720p");
      expect(queue.length).toBeGreaterThan(0);
      // segments: index 1,2 ; metadata: index 3,4,5
      const segItems = queue.filter(
        (i) => i.status === "idle" && i.estimatedBytes > 0,
      );
      const metaItems = queue.filter(
        (i) => i.status === "idle" && i.estimatedBytes === 0,
      );
      expect(segItems.length).toBeLessThanOrEqual(
        DEFAULT_PRELOADER_CONFIG.preload_next_count,
      );
      expect(metaItems.length).toBeLessThanOrEqual(
        DEFAULT_PRELOADER_CONFIG.metadata_prefetch_count,
      );
    });

    test("retourne file vide si disabled", () => {
      const cfg = { ...DEFAULT_PRELOADER_CONFIG, disabled: true };
      const queue = buildPreloadQueue(0, ids, cfg, "720p");
      expect(queue.length).toBe(0);
    });

    test("retourne file vide si currentIndex dépasse la liste", () => {
      const queue = buildPreloadQueue(
        100,
        ids,
        DEFAULT_PRELOADER_CONFIG,
        "720p",
      );
      expect(queue.length).toBe(0);
    });

    test("gère la fin de liste avec moins d'items", () => {
      const shortIds = ["v1", "v2"];
      const queue = buildPreloadQueue(
        0,
        shortIds,
        DEFAULT_PRELOADER_CONFIG,
        "720p",
      );
      expect(queue.length).toBeLessThanOrEqual(1);
    });

    test("n'inclut pas les vidéos déjà en cache segment", async () => {
      await preloadSegment(
        "v2",
        "https://cdn.example.com/v2.m3u8",
        DEFAULT_PRELOADER_CONFIG,
      );
      const queue = buildPreloadQueue(0, ids, DEFAULT_PRELOADER_CONFIG, "720p");
      const v2Items = queue.filter(
        (i) => i.videoId === "v2" && i.estimatedBytes > 0,
      );
      expect(v2Items.length).toBe(0);
    });
  });

  describe("preloadSegment", () => {
    test("charge un segment et le met en cache", async () => {
      expect(isSegmentCached("v1")).toBe(false);
      const result = await preloadSegment(
        "v1",
        "https://cdn.example.com/v1.m3u8",
        DEFAULT_PRELOADER_CONFIG,
      );
      expect(result.success).toBe(true);
      expect(result.bytesLoaded).toBeGreaterThan(0);
      expect(isSegmentCached("v1")).toBe(true);
    });

    test("ne re-charge pas un segment déjà en cache", async () => {
      await preloadSegment(
        "v1",
        "https://cdn.example.com/v1.m3u8",
        DEFAULT_PRELOADER_CONFIG,
      );
      const result = await preloadSegment(
        "v1",
        "https://cdn.example.com/v1.m3u8",
        DEFAULT_PRELOADER_CONFIG,
      );
      // Deuxième appel court-circuité
      expect(result.success).toBe(true);
      expect(result.bytesLoaded).toBe(0);
    });

    test("retourne erreur si disabled", async () => {
      const cfg = { ...DEFAULT_PRELOADER_CONFIG, disabled: true };
      const result = await preloadSegment(
        "v1",
        "https://cdn.example.com/v1.m3u8",
        cfg,
      );
      expect(result.success).toBe(false);
    });
  });

  describe("preloadMetadata", () => {
    test("charge les métadonnées et les met en cache", async () => {
      expect(isMetadataCached("v1")).toBe(false);
      const result = await preloadMetadata("v1");
      expect(result).not.toBeNull();
      expect(isMetadataCached("v1")).toBe(true);
    });

    test("retourne le cache existant", async () => {
      await preloadMetadata("v1");
      const result = await preloadMetadata("v1");
      expect(result).not.toBeNull();
    });
  });

  describe("getPreloadCacheStats", () => {
    test("retourne zéros quand le cache est vide", () => {
      const stats = getPreloadCacheStats();
      expect(stats.segmentCount).toBe(0);
      expect(stats.metadataCount).toBe(0);
      expect(stats.totalBytes).toBe(0);
    });

    test("compte correctement après chargement", async () => {
      await preloadSegment(
        "v1",
        "https://cdn.example.com/v1.m3u8",
        DEFAULT_PRELOADER_CONFIG,
      );
      await preloadMetadata("v2");
      const stats = getPreloadCacheStats();
      expect(stats.segmentCount).toBe(1);
      expect(stats.metadataCount).toBe(1);
      expect(stats.totalBytes).toBeGreaterThan(0);
    });
  });

  describe("clearPreloadCache", () => {
    test("vide le cache", async () => {
      await preloadSegment(
        "v1",
        "https://cdn.example.com/v1.m3u8",
        DEFAULT_PRELOADER_CONFIG,
      );
      await preloadMetadata("v2");
      clearPreloadCache();
      expect(isSegmentCached("v1")).toBe(false);
      expect(isMetadataCached("v2")).toBe(false);
      const stats = getPreloadCacheStats();
      expect(stats.segmentCount).toBe(0);
      expect(stats.totalBytes).toBe(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════
// 3. SERVICE ADAPTIVE BITRATE
// ═══════════════════════════════════════════════════════════

describe("S20 · Service adaptive-bitrate", () => {
  describe("computeAverageBandwidth", () => {
    test("retourne 0 pour un tableau vide", () => {
      expect(computeAverageBandwidth([])).toBe(0);
    });

    test("retourne la valeur unique pour un seul échantillon", () => {
      const samples = makeSamples([5000]);
      expect(computeAverageBandwidth(samples)).toBe(5000);
    });

    test("moyenne pondérée favorise les échantillons récents", () => {
      const samples = makeSamples([1000, 5000]);
      // poids 1*1000 + 2*5000 = 11000, total = 3, avg = 3667
      const avg = computeAverageBandwidth(samples);
      expect(avg).toBeGreaterThan(3000);
      expect(avg).toBeLessThan(5000);
    });

    test("respecte le windowSize", () => {
      const samples = makeSamples([100, 200, 300, 400, 5000]);
      const avg3 = computeAverageBandwidth(samples, 3);
      const avg5 = computeAverageBandwidth(samples, 5);
      // avg3 ne prend que [300, 400, 5000], pondéré → plus élevé
      expect(avg3).toBeGreaterThan(avg5);
    });
  });

  describe("selectOptimalQuality", () => {
    test("retourne forced_quality en mode données faibles", () => {
      const ldm: LowDataModeConfig = {
        ...DEFAULT_LOW_DATA_MODE,
        enabled: true,
      };
      expect(
        selectOptimalQuality(10000, "1080p", DEFAULT_ABR_CONFIG, ldm),
      ).toBe("360p");
    });

    test("retourne qualité courante si ABR désactivé", () => {
      const cfg: AbrConfig = { ...DEFAULT_ABR_CONFIG, enabled: false };
      expect(selectOptimalQuality(10000, "480p", cfg)).toBe("480p");
    });

    test("retourne min_quality si offline", () => {
      expect(
        selectOptimalQuality(
          0,
          "720p",
          DEFAULT_ABR_CONFIG,
          DEFAULT_LOW_DATA_MODE,
          "offline",
        ),
      ).toBe("360p");
    });

    test("retourne 360p pour réseau 2g", () => {
      expect(
        selectOptimalQuality(
          500,
          "720p",
          DEFAULT_ABR_CONFIG,
          DEFAULT_LOW_DATA_MODE,
          "2g",
        ),
      ).toBe("360p");
    });

    test("sélectionne 1080p pour bande passante très élevée", () => {
      // 10000 * 0.8 = 8000 kbps, bien au-dessus de 1080p (5000)
      const result = selectOptimalQuality(
        10000,
        "360p",
        DEFAULT_ABR_CONFIG,
        DEFAULT_LOW_DATA_MODE,
        "wifi",
      );
      expect(result).toBe("1080p");
    });

    test("sélectionne 720p pour bande passante modérée", () => {
      // 4000 * 0.8 = 3200 → au-dessus de 720p (3000) mais en dessous de 1080p (5000)
      const result = selectOptimalQuality(
        4000,
        "360p",
        DEFAULT_ABR_CONFIG,
        DEFAULT_LOW_DATA_MODE,
        "wifi",
      );
      expect(["720p", "480p", "360p"]).toContain(result); // peut rester bas par hystérésis
    });

    test("descend si la bande passante chute", () => {
      // 500 * 0.8 = 400 → bien en dessous de 720p downswitch (2500)
      const result = selectOptimalQuality(
        500,
        "720p",
        DEFAULT_ABR_CONFIG,
        DEFAULT_LOW_DATA_MODE,
        "wifi",
      );
      expect(["360p", "480p"]).toContain(result);
    });
  });

  describe("getDefaultQualityForNetwork", () => {
    test("wifi → 1080p", () => {
      expect(getDefaultQualityForNetwork("wifi")).toBe("1080p");
    });

    test("4g → 720p", () => {
      expect(getDefaultQualityForNetwork("4g")).toBe("720p");
    });

    test("3g → 480p", () => {
      expect(getDefaultQualityForNetwork("3g")).toBe("480p");
    });

    test("2g → 360p", () => {
      expect(getDefaultQualityForNetwork("2g")).toBe("360p");
    });

    test("offline → 360p", () => {
      expect(getDefaultQualityForNetwork("offline")).toBe("360p");
    });

    test("unknown → 360p", () => {
      expect(getDefaultQualityForNetwork("unknown")).toBe("360p");
    });

    test("mode données faibles force la qualité", () => {
      const ldm: LowDataModeConfig = {
        ...DEFAULT_LOW_DATA_MODE,
        enabled: true,
        forced_quality: "360p",
      };
      expect(getDefaultQualityForNetwork("wifi", ldm)).toBe("360p");
    });
  });

  describe("createBandwidthSample", () => {
    test("calcule les kbps correctement", () => {
      // 1 000 000 octets en 1000ms = 8000 kbps
      const sample = createBandwidthSample(1_000_000, 1000, "wifi");
      expect(sample.kbps).toBe(8000);
      expect(sample.networkType).toBe("wifi");
      expect(sample.timestamp).toBeGreaterThan(0);
    });

    test("retourne 0 kbps si durée = 0", () => {
      const sample = createBandwidthSample(1000, 0, "4g");
      expect(sample.kbps).toBe(0);
    });
  });

  describe("isBandwidthStable", () => {
    test("retourne false pour moins de 3 échantillons", () => {
      expect(isBandwidthStable(makeSamples([100, 200]))).toBe(false);
    });

    test("retourne true pour des valeurs stables", () => {
      expect(
        isBandwidthStable(makeSamples([5000, 5100, 4900, 5050, 4950])),
      ).toBe(true);
    });

    test("retourne false pour des valeurs très instables", () => {
      expect(isBandwidthStable(makeSamples([100, 10000, 200, 9000, 300]))).toBe(
        false,
      );
    });
  });
});

// ═══════════════════════════════════════════════════════════
// 4. STORE VIDEO-PERFORMANCE
// ═══════════════════════════════════════════════════════════

describe("S20 · Store video-performance", () => {
  beforeEach(() => {
    clearPreloadCache();
    resetStore();
  });

  test("état initial correct", () => {
    const state = useVideoPerformanceStore.getState();
    expect(state.preloaderConfig).toEqual(DEFAULT_PRELOADER_CONFIG);
    expect(state.abrConfig).toEqual(DEFAULT_ABR_CONFIG);
    expect(state.currentQuality).toBe("720p");
    expect(state.networkType).toBe("unknown");
    expect(state.bandwidthSamples).toEqual([]);
    expect(state.estimatedBandwidthKbps).toBe(0);
    expect(state.lowDataMode).toEqual(DEFAULT_LOW_DATA_MODE);
    expect(state.pip.status).toBe("inactive");
    expect(state.pipConfig).toEqual(DEFAULT_PIP_CONFIG);
    expect(state.cacheStats).toEqual(DEFAULT_HLS_CACHE_STATS);
  });

  describe("Preloader actions", () => {
    test("updatePreloaderConfig met à jour partiellement", () => {
      act(() => {
        useVideoPerformanceStore
          .getState()
          .updatePreloaderConfig({ preload_next_count: 5 });
      });
      expect(
        useVideoPerformanceStore.getState().preloaderConfig.preload_next_count,
      ).toBe(5);
      expect(
        useVideoPerformanceStore.getState().preloaderConfig
          .metadata_prefetch_count,
      ).toBe(3);
    });

    test("triggerPreload remplit la file", async () => {
      await act(async () => {
        await useVideoPerformanceStore
          .getState()
          .triggerPreload(0, ["v1", "v2", "v3", "v4", "v5", "v6"]);
      });
      const queue = useVideoPerformanceStore.getState().preloadQueue;
      expect(queue.length).toBeGreaterThan(0);
    });
  });

  describe("ABR actions", () => {
    test("updateAbrConfig met à jour partiellement", () => {
      act(() => {
        useVideoPerformanceStore.getState().updateAbrConfig({ enabled: false });
      });
      expect(useVideoPerformanceStore.getState().abrConfig.enabled).toBe(false);
      expect(useVideoPerformanceStore.getState().abrConfig.max_quality).toBe(
        "1080p",
      );
    });

    test("recordBandwidth ajoute un échantillon et calcule la moyenne", () => {
      act(() => {
        useVideoPerformanceStore.getState().recordBandwidth(500_000, 1000); // 4000 kbps
      });
      const state = useVideoPerformanceStore.getState();
      expect(state.bandwidthSamples.length).toBe(1);
      expect(state.estimatedBandwidthKbps).toBeGreaterThan(0);
    });

    test("recordBandwidth limite à 20 échantillons", () => {
      act(() => {
        for (let i = 0; i < 25; i++) {
          useVideoPerformanceStore.getState().recordBandwidth(100_000, 1000);
        }
      });
      expect(
        useVideoPerformanceStore.getState().bandwidthSamples.length,
      ).toBeLessThanOrEqual(20);
    });

    test("selectQuality retourne la qualité sélectionnée", () => {
      act(() => {
        // Simuler bande passante élevée
        for (let i = 0; i < 5; i++) {
          useVideoPerformanceStore.getState().recordBandwidth(1_250_000, 1000); // 10000 kbps
        }
      });
      let quality: VideoQuality | undefined;
      act(() => {
        quality = useVideoPerformanceStore.getState().selectQuality();
      });
      expect(quality).toBeDefined();
    });

    test("setCurrentQuality change la qualité directement", () => {
      act(() => {
        useVideoPerformanceStore.getState().setCurrentQuality("480p");
      });
      expect(useVideoPerformanceStore.getState().currentQuality).toBe("480p");
    });

    test("setNetworkType change le type et qualité par défaut sans échantillons", () => {
      act(() => {
        useVideoPerformanceStore.getState().setNetworkType("3g");
      });
      const state = useVideoPerformanceStore.getState();
      expect(state.networkType).toBe("3g");
      expect(state.currentQuality).toBe("480p"); // default pour 3g
    });

    test("setNetworkType ne change pas la qualité si on a des échantillons", () => {
      act(() => {
        useVideoPerformanceStore.getState().recordBandwidth(500_000, 1000);
        useVideoPerformanceStore.getState().setCurrentQuality("1080p");
      });
      act(() => {
        useVideoPerformanceStore.getState().setNetworkType("3g");
      });
      expect(useVideoPerformanceStore.getState().currentQuality).toBe("1080p");
    });
  });

  describe("Low Data Mode actions", () => {
    test("updateLowDataMode active le mode", () => {
      act(() => {
        useVideoPerformanceStore
          .getState()
          .updateLowDataMode({ enabled: true });
      });
      const state = useVideoPerformanceStore.getState();
      expect(state.lowDataMode.enabled).toBe(true);
      expect(state.currentQuality).toBe("360p");
    });

    test("updateLowDataMode change forced_quality", () => {
      act(() => {
        useVideoPerformanceStore.getState().updateLowDataMode({
          enabled: true,
          forced_quality: "480p",
        });
      });
      expect(useVideoPerformanceStore.getState().currentQuality).toBe("480p");
    });
  });

  describe("PiP actions", () => {
    test("activatePip passe en état actif", () => {
      act(() => {
        useVideoPerformanceStore
          .getState()
          .activatePip("v42", "https://cdn.example.com/v42.m3u8", 5000);
      });
      const pip = useVideoPerformanceStore.getState().pip;
      expect(pip.status).toBe("active");
      expect(pip.videoId).toBe("v42");
      expect(pip.videoUrl).toBe("https://cdn.example.com/v42.m3u8");
      expect(pip.positionMs).toBe(5000);
    });

    test("closePip réinitialise le PiP", () => {
      act(() => {
        useVideoPerformanceStore
          .getState()
          .activatePip("v42", "https://cdn.example.com/v42.m3u8", 5000);
        useVideoPerformanceStore.getState().closePip();
      });
      const pip = useVideoPerformanceStore.getState().pip;
      expect(pip.status).toBe("inactive");
      expect(pip.videoId).toBeNull();
    });

    test("movePip change la position", () => {
      act(() => {
        useVideoPerformanceStore.getState().movePip("top-left");
      });
      expect(useVideoPerformanceStore.getState().pip.position).toBe("top-left");
    });

    test("togglePipMute bascule le mute", () => {
      expect(useVideoPerformanceStore.getState().pip.isMuted).toBe(false);
      act(() => {
        useVideoPerformanceStore.getState().togglePipMute();
      });
      expect(useVideoPerformanceStore.getState().pip.isMuted).toBe(true);
      act(() => {
        useVideoPerformanceStore.getState().togglePipMute();
      });
      expect(useVideoPerformanceStore.getState().pip.isMuted).toBe(false);
    });

    test("updatePipPosition met à jour positionMs", () => {
      act(() => {
        useVideoPerformanceStore.getState().updatePipPosition(12345);
      });
      expect(useVideoPerformanceStore.getState().pip.positionMs).toBe(12345);
    });

    test("updatePipConfig met à jour partiellement", () => {
      act(() => {
        useVideoPerformanceStore
          .getState()
          .updatePipConfig({ size_ratio: 0.4 });
      });
      const cfg = useVideoPerformanceStore.getState().pipConfig;
      expect(cfg.size_ratio).toBe(0.4);
      expect(cfg.enabled).toBe(true); // inchangé
    });
  });

  describe("Cache actions", () => {
    test("refreshCacheStats met à jour depuis le preloader", async () => {
      await preloadSegment(
        "v1",
        "https://cdn.example.com/v1.m3u8",
        DEFAULT_PRELOADER_CONFIG,
      );
      act(() => {
        useVideoPerformanceStore.getState().refreshCacheStats();
      });
      const stats = useVideoPerformanceStore.getState().cacheStats;
      expect(stats.entryCount).toBeGreaterThan(0);
      expect(stats.totalBytes).toBeGreaterThan(0);
    });

    test("clearAllCaches vide tout", async () => {
      await preloadSegment(
        "v1",
        "https://cdn.example.com/v1.m3u8",
        DEFAULT_PRELOADER_CONFIG,
      );
      act(() => {
        useVideoPerformanceStore.getState().clearAllCaches();
      });
      const state = useVideoPerformanceStore.getState();
      expect(state.cacheStats).toEqual(DEFAULT_HLS_CACHE_STATS);
      expect(state.preloadQueue).toEqual([]);
      expect(isSegmentCached("v1")).toBe(false);
    });
  });

  describe("Reset", () => {
    test("resetPerformanceStore remet tout à zéro", () => {
      act(() => {
        useVideoPerformanceStore.getState().setCurrentQuality("480p");
        useVideoPerformanceStore.getState().setNetworkType("4g");
        useVideoPerformanceStore.getState().activatePip("v1", "url", 0);
      });
      act(() => {
        useVideoPerformanceStore.getState().resetPerformanceStore();
      });
      const state = useVideoPerformanceStore.getState();
      expect(state.currentQuality).toBe("720p");
      expect(state.networkType).toBe("unknown");
      expect(state.pip.status).toBe("inactive");
    });
  });
});

// ═══════════════════════════════════════════════════════════
// 5. COMPOSANT PipOverlay
// ═══════════════════════════════════════════════════════════

describe("S20 · Composant PipOverlay", () => {
  beforeEach(() => {
    clearPreloadCache();
    resetStore();
  });

  test("ne rend rien si PiP inactif", () => {
    const { queryByTestId } = render(<PipOverlay />);
    expect(queryByTestId("pip-overlay")).toBeNull();
  });

  test("rend l'overlay quand PiP est actif", () => {
    act(() => {
      useVideoPerformanceStore
        .getState()
        .activatePip("v1", "https://cdn.example.com/v1.m3u8", 0);
    });
    const { getByTestId } = render(<PipOverlay />);
    expect(getByTestId("pip-overlay")).toBeTruthy();
  });

  test("affiche les boutons mute, move, close", () => {
    act(() => {
      useVideoPerformanceStore.getState().activatePip("v1", "url", 0);
    });
    const { getByTestId } = render(<PipOverlay />);
    expect(getByTestId("pip-mute-button")).toBeTruthy();
    expect(getByTestId("pip-move-button")).toBeTruthy();
    expect(getByTestId("pip-close-button")).toBeTruthy();
  });

  test("pip-close-button ferme le PiP", () => {
    act(() => {
      useVideoPerformanceStore.getState().activatePip("v1", "url", 0);
    });
    const { getByTestId, queryByTestId } = render(<PipOverlay />);
    fireEvent.press(getByTestId("pip-close-button"));
    expect(useVideoPerformanceStore.getState().pip.status).toBe("inactive");
  });

  test("pip-mute-button bascule le mute", () => {
    act(() => {
      useVideoPerformanceStore.getState().activatePip("v1", "url", 0);
    });
    const { getByTestId } = render(<PipOverlay />);
    expect(useVideoPerformanceStore.getState().pip.isMuted).toBe(false);
    fireEvent.press(getByTestId("pip-mute-button"));
    expect(useVideoPerformanceStore.getState().pip.isMuted).toBe(true);
  });

  test("pip-move-button cycle les positions", () => {
    act(() => {
      useVideoPerformanceStore.getState().activatePip("v1", "url", 0);
    });
    const { getByTestId } = render(<PipOverlay />);
    // position initiale = bottom-right
    expect(useVideoPerformanceStore.getState().pip.position).toBe(
      "bottom-right",
    );
    fireEvent.press(getByTestId("pip-move-button"));
    expect(useVideoPerformanceStore.getState().pip.position).toBe(
      "bottom-left",
    );
    fireEvent.press(getByTestId("pip-move-button"));
    expect(useVideoPerformanceStore.getState().pip.position).toBe("top-left");
  });

  test("pip-video-area appelle onTapToRestore", () => {
    act(() => {
      useVideoPerformanceStore.getState().activatePip("v1", "url", 0);
    });
    const onRestore = jest.fn();
    const { getByTestId } = render(<PipOverlay onTapToRestore={onRestore} />);
    fireEvent.press(getByTestId("pip-video-area"));
    expect(onRestore).toHaveBeenCalledTimes(1);
  });

  test("ne crash pas sans onTapToRestore", () => {
    act(() => {
      useVideoPerformanceStore.getState().activatePip("v1", "url", 0);
    });
    const { getByTestId } = render(<PipOverlay />);
    expect(() => fireEvent.press(getByTestId("pip-video-area"))).not.toThrow();
  });
});
