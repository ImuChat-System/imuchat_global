/**
 * Emergency Store (Zustand)
 *
 * Gère l'état global des numéros d'urgence géolocalisés :
 *  - Pays courant (détecté ou sélectionné manuellement)
 *  - Géolocalisation
 *  - Favoris / pays récents
 *  - Filtre par catégorie
 *  - Recherche
 *
 * Persistance via AsyncStorage (pays courant + favoris).
 *
 * Phase 3 — Groupe 7 Services utilitaires (Feature 7.3)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { detectUserCountry } from '@/services/emergency-api';
import { createLogger } from '@/services/logger';
import type { EmergencyStoreState, FavoriteCountry } from '@/types/emergency';
import { EmergencyCategory } from '@/types/emergency';

const logger = createLogger('EmergencyStore');

// ============================================================================
// STORE
// ============================================================================

export const useEmergencyStore = create<EmergencyStoreState>()(
    persist(
        (set, get) => ({
            // ==== State ====
            currentCountryCode: null,
            geoLocation: null,
            favorites: [],
            selectedCategory: null,
            searchQuery: '',
            isLocating: false,
            error: null,

            // ==== Actions ====

            detectCountry: async () => {
                set({ isLocating: true, error: null });
                try {
                    const result = await detectUserCountry();
                    logger.info('Country detected:', result.countryCode);

                    set({
                        geoLocation: result,
                        currentCountryCode: result.countryCode ?? get().currentCountryCode,
                        isLocating: false,
                    });

                    // Record access for the detected country
                    if (result.countryCode) {
                        get().recordAccess(result.countryCode);
                    }
                } catch (err) {
                    const message = err instanceof Error ? err.message : 'Unknown error';
                    logger.error('detectCountry failed:', message);
                    set({ isLocating: false, error: message });
                }
            },

            selectCountry: (countryCode: string) => {
                const upper = countryCode.toUpperCase();
                logger.info('Country selected manually:', upper);
                set({ currentCountryCode: upper, selectedCategory: null });
                get().recordAccess(upper);
            },

            setCategory: (category: EmergencyCategory | null) => {
                set({ selectedCategory: category });
            },

            setSearchQuery: (query: string) => {
                set({ searchQuery: query });
            },

            toggleFavorite: (countryCode: string) => {
                const upper = countryCode.toUpperCase();
                const existing = get().favorites;
                const idx = existing.findIndex((f) => f.countryCode === upper);

                if (idx >= 0) {
                    // Toggle the isFavorite flag
                    const updated = [...existing];
                    updated[idx] = {
                        ...updated[idx],
                        isFavorite: !updated[idx].isFavorite,
                    };
                    set({ favorites: updated });
                } else {
                    // Add as new favorite
                    const newFav: FavoriteCountry = {
                        countryCode: upper,
                        lastAccessed: new Date().toISOString(),
                        isFavorite: true,
                    };
                    set({ favorites: [...existing, newFav] });
                }
            },

            recordAccess: (countryCode: string) => {
                const upper = countryCode.toUpperCase();
                const existing = get().favorites;
                const idx = existing.findIndex((f) => f.countryCode === upper);

                if (idx >= 0) {
                    const updated = [...existing];
                    updated[idx] = {
                        ...updated[idx],
                        lastAccessed: new Date().toISOString(),
                    };
                    set({ favorites: updated });
                } else {
                    const newEntry: FavoriteCountry = {
                        countryCode: upper,
                        lastAccessed: new Date().toISOString(),
                        isFavorite: false,
                    };
                    set({ favorites: [...existing, newEntry] });
                }
            },

            reset: () => {
                set({
                    currentCountryCode: null,
                    geoLocation: null,
                    favorites: [],
                    selectedCategory: null,
                    searchQuery: '',
                    isLocating: false,
                    error: null,
                });
            },
        }),
        {
            name: 'imuchat-emergency-store',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                currentCountryCode: state.currentCountryCode,
                favorites: state.favorites,
            }),
        }
    )
);
