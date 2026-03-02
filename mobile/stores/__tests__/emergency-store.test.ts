/**
 * Tests for stores/emergency-store.ts — Numéros d'urgence géolocalisés
 *
 * CRITICAL: NO TypeScript syntax in test files.
 * No `: Type`, `as const`, `as any`, `!` (non-null assertion).
 * Use `var` for reassigned variables.
 */

// --- Mocks ---
jest.mock("@react-native-async-storage/async-storage", function () {
    return {
        __esModule: true,
        default: {
            getItem: jest.fn().mockResolvedValue(null),
            setItem: jest.fn().mockResolvedValue(undefined),
            removeItem: jest.fn().mockResolvedValue(undefined),
        },
    };
});

jest.mock("@/services/logger", function () {
    return {
        createLogger: jest.fn().mockReturnValue({
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        }),
    };
});

var mockDetectUserCountry = jest.fn();

jest.mock("@/services/emergency-api", function () {
    return {
        detectUserCountry: function () { return mockDetectUserCountry(); },
        getAllCountries: jest.fn().mockReturnValue([]),
        getCountryByCode: jest.fn(),
        searchCountries: jest.fn().mockReturnValue([]),
    };
});

// Import after mocks
var storeModule = require("@/stores/emergency-store");

function getStore() {
    return storeModule.useEmergencyStore.getState();
}

beforeEach(function () {
    jest.clearAllMocks();
    // Reset store state
    getStore().reset();
});

// ============================================================================
// INITIAL STATE
// ============================================================================

describe("Emergency Store — initial state", function () {
    it("starts with null currentCountryCode", function () {
        expect(getStore().currentCountryCode).toBeNull();
    });

    it("starts with null geoLocation", function () {
        expect(getStore().geoLocation).toBeNull();
    });

    it("starts with empty favorites", function () {
        expect(getStore().favorites).toEqual([]);
    });

    it("starts with null selectedCategory", function () {
        expect(getStore().selectedCategory).toBeNull();
    });

    it("starts with empty searchQuery", function () {
        expect(getStore().searchQuery).toBe("");
    });

    it("starts with isLocating false", function () {
        expect(getStore().isLocating).toBe(false);
    });

    it("starts with null error", function () {
        expect(getStore().error).toBeNull();
    });
});

// ============================================================================
// detectCountry
// ============================================================================

describe("Emergency Store — detectCountry", function () {
    it("sets isLocating during detection", function () {
        // Make detectUserCountry hang
        mockDetectUserCountry.mockReturnValue(new Promise(function () { }));

        getStore().detectCountry();

        expect(getStore().isLocating).toBe(true);
    });

    it("sets country on successful detection", function () {
        mockDetectUserCountry.mockResolvedValue({
            countryCode: "FR",
            latitude: 48.85,
            longitude: 2.35,
            accuracy: 10,
            timestamp: "2025-01-01T00:00:00.000Z",
            source: "gps",
        });

        return getStore().detectCountry().then(function () {
            expect(getStore().currentCountryCode).toBe("FR");
            expect(getStore().geoLocation).not.toBeNull();
            expect(getStore().geoLocation.countryCode).toBe("FR");
            expect(getStore().isLocating).toBe(false);
            expect(getStore().error).toBeNull();
        });
    });

    it("records access for detected country", function () {
        mockDetectUserCountry.mockResolvedValue({
            countryCode: "JP",
            latitude: 35.67,
            longitude: 139.65,
            accuracy: 50,
            timestamp: "2025-01-01T00:00:00.000Z",
            source: "gps",
        });

        return getStore().detectCountry().then(function () {
            var favs = getStore().favorites;
            expect(favs.length).toBe(1);
            expect(favs[0].countryCode).toBe("JP");
            expect(favs[0].isFavorite).toBe(false);
        });
    });

    it("keeps previous country when detection returns null", function () {
        getStore().selectCountry("US");

        mockDetectUserCountry.mockResolvedValue({
            countryCode: null,
            latitude: null,
            longitude: null,
            accuracy: null,
            timestamp: "2025-01-01T00:00:00.000Z",
            source: "default",
        });

        return getStore().detectCountry().then(function () {
            expect(getStore().currentCountryCode).toBe("US");
            expect(getStore().isLocating).toBe(false);
        });
    });

    it("sets error on failure", function () {
        mockDetectUserCountry.mockRejectedValue(new Error("Location failed"));

        return getStore().detectCountry().then(function () {
            expect(getStore().isLocating).toBe(false);
            expect(getStore().error).toBe("Location failed");
        });
    });
});

// ============================================================================
// selectCountry
// ============================================================================

describe("Emergency Store — selectCountry", function () {
    it("sets currentCountryCode", function () {
        getStore().selectCountry("DE");
        expect(getStore().currentCountryCode).toBe("DE");
    });

    it("uppercases the code", function () {
        getStore().selectCountry("fr");
        expect(getStore().currentCountryCode).toBe("FR");
    });

    it("resets selectedCategory", function () {
        getStore().setCategory("police");
        expect(getStore().selectedCategory).toBe("police"); l

        getStore().selectCountry("IT");
        expect(getStore().selectedCategory).toBeNull();
    });

    it("records access", function () {
        getStore().selectCountry("GB");
        var favs = getStore().favorites;
        expect(favs.length).toBe(1);
        expect(favs[0].countryCode).toBe("GB");
    });
});

// ============================================================================
// setCategory
// ============================================================================

describe("Emergency Store — setCategory", function () {
    it("sets selectedCategory", function () {
        getStore().setCategory("medical");
        expect(getStore().selectedCategory).toBe("medical");
    });

    it("clears category with null", function () {
        getStore().setCategory("fire");
        getStore().setCategory(null);
        expect(getStore().selectedCategory).toBeNull();
    });
});

// ============================================================================
// setSearchQuery
// ============================================================================

describe("Emergency Store — setSearchQuery", function () {
    it("sets search query", function () {
        getStore().setSearchQuery("Japan");
        expect(getStore().searchQuery).toBe("Japan");
    });

    it("can clear search query", function () {
        getStore().setSearchQuery("Japan");
        getStore().setSearchQuery("");
        expect(getStore().searchQuery).toBe("");
    });
});

// ============================================================================
// toggleFavorite
// ============================================================================

describe("Emergency Store — toggleFavorite", function () {
    it("adds new favorite", function () {
        getStore().toggleFavorite("FR");
        var favs = getStore().favorites;
        expect(favs.length).toBe(1);
        expect(favs[0].countryCode).toBe("FR");
        expect(favs[0].isFavorite).toBe(true);
    });

    it("toggles existing favorite off", function () {
        getStore().toggleFavorite("FR");
        expect(getStore().favorites[0].isFavorite).toBe(true);

        getStore().toggleFavorite("FR");
        expect(getStore().favorites[0].isFavorite).toBe(false);
    });

    it("toggles back on", function () {
        getStore().toggleFavorite("FR");
        getStore().toggleFavorite("FR");
        getStore().toggleFavorite("FR");
        expect(getStore().favorites[0].isFavorite).toBe(true);
    });

    it("uppercases country code", function () {
        getStore().toggleFavorite("jp");
        expect(getStore().favorites[0].countryCode).toBe("JP");
    });

    it("toggles recorded (non-fav) entry to fav", function () {
        getStore().recordAccess("US");
        expect(getStore().favorites[0].isFavorite).toBe(false);

        getStore().toggleFavorite("US");
        expect(getStore().favorites[0].isFavorite).toBe(true);
    });
});

// ============================================================================
// recordAccess
// ============================================================================

describe("Emergency Store — recordAccess", function () {
    it("adds new entry with isFavorite false", function () {
        getStore().recordAccess("BR");
        var favs = getStore().favorites;
        expect(favs.length).toBe(1);
        expect(favs[0].countryCode).toBe("BR");
        expect(favs[0].isFavorite).toBe(false);
        expect(favs[0].lastAccessed).toBeTruthy();
    });

    it("updates lastAccessed for existing entry", function () {
        getStore().recordAccess("BR");
        var first = getStore().favorites[0].lastAccessed;

        return new Promise(function (resolve) {
            setTimeout(function () {
                getStore().recordAccess("BR");
                var second = getStore().favorites[0].lastAccessed;
                expect(second).not.toBe(first);
                resolve(undefined);
            }, 10);
        });
    });

    it("does not change isFavorite when updating access", function () {
        getStore().toggleFavorite("AU");
        expect(getStore().favorites[0].isFavorite).toBe(true);

        getStore().recordAccess("AU");
        expect(getStore().favorites[0].isFavorite).toBe(true);
    });
});

// ============================================================================
// reset
// ============================================================================

describe("Emergency Store — reset", function () {
    it("resets all state", function () {
        getStore().selectCountry("FR");
        getStore().setCategory("police");
        getStore().setSearchQuery("test");
        getStore().toggleFavorite("FR");

        getStore().reset();

        expect(getStore().currentCountryCode).toBeNull();
        expect(getStore().geoLocation).toBeNull();
        expect(getStore().favorites).toEqual([]);
        expect(getStore().selectedCategory).toBeNull();
        expect(getStore().searchQuery).toBe("");
        expect(getStore().isLocating).toBe(false);
        expect(getStore().error).toBeNull();
    });
});
