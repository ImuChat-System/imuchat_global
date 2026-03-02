/**
 * Tests for services/emergency-api.ts — Numéros d'urgence géolocalisés
 *
 * CRITICAL: NO TypeScript syntax in test files.
 * No `: Type`, `as const`, `as any`, `!` (non-null assertion).
 * Use `var` for reassigned variables.
 */

// --- Mocks ---
jest.mock("@/services/logger", function () {
    return {
        createLogger: jest.fn().mockReturnValue({
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        }),
    };
});

var mockRequestPermissions = jest.fn();
var mockGetCurrentPosition = jest.fn();
var mockReverseGeocode = jest.fn();

jest.mock("expo-location", function () {
    return {
        requestForegroundPermissionsAsync: function () {
            return mockRequestPermissions();
        },
        getCurrentPositionAsync: function (opts) {
            return mockGetCurrentPosition(opts);
        },
        reverseGeocodeAsync: function (coords) {
            return mockReverseGeocode(coords);
        },
        Accuracy: {
            Balanced: 3,
        },
    };
});

var mockCanOpenURL = jest.fn();
var mockOpenURL = jest.fn();

jest.mock("react-native", function () {
    return {
        Platform: { OS: "ios" },
        Linking: {
            canOpenURL: function (url) { return mockCanOpenURL(url); },
            openURL: function (url) { return mockOpenURL(url); },
        },
    };
});

// Import after mocks
var api = require("@/services/emergency-api");
var getAllCountries = api.getAllCountries;
var getCountryByCode = api.getCountryByCode;
var searchCountries = api.searchCountries;
var getCountriesByContinent = api.getCountriesByContinent;
var getNumbersByCategory = api.getNumbersByCategory;
var getAvailableCategories = api.getAvailableCategories;
var detectUserCountry = api.detectUserCountry;
var callEmergencyNumber = api.callEmergencyNumber;
var getCategoryIcon = api.getCategoryIcon;
var getCategoryI18nKey = api.getCategoryI18nKey;
var getTotalCountries = api.getTotalCountries;
var getAvailableContinents = api.getAvailableContinents;

beforeEach(function () {
    jest.clearAllMocks();
});

// ============================================================================
// DATABASE QUERIES
// ============================================================================

describe("getAllCountries", function () {
    it("returns a non-empty array of countries", function () {
        var countries = getAllCountries();
        expect(countries.length).toBeGreaterThan(20);
    });

    it("each country has required fields", function () {
        var countries = getAllCountries();
        countries.forEach(function (c) {
            expect(c.countryCode).toBeTruthy();
            expect(c.countryName).toBeTruthy();
            expect(c.flag).toBeTruthy();
            expect(c.generalNumber).toBeTruthy();
            expect(c.numbers.length).toBeGreaterThan(0);
        });
    });
});

describe("getCountryByCode", function () {
    it("returns France for FR", function () {
        var country = getCountryByCode("FR");
        expect(country).not.toBeNull();
        expect(country.countryName).toBe("France");
        expect(country.generalNumber).toBe("112");
    });

    it("returns US for us (case-insensitive)", function () {
        var country = getCountryByCode("us");
        expect(country).not.toBeNull();
        expect(country.countryName).toBe("United States");
    });

    it("returns null for unknown code", function () {
        var country = getCountryByCode("XX");
        expect(country).toBeNull();
    });
});

describe("searchCountries", function () {
    it("finds France by name", function () {
        var results = searchCountries("France");
        expect(results.length).toBe(1);
        expect(results[0].countryCode).toBe("FR");
    });

    it("finds Japan by partial name", function () {
        var results = searchCountries("jap");
        expect(results.length).toBe(1);
        expect(results[0].countryCode).toBe("JP");
    });

    it("finds by country code", function () {
        var results = searchCountries("DE");
        expect(results.length).toBeGreaterThanOrEqual(1);
        expect(results[0].countryCode).toBe("DE");
    });

    it("returns all countries for empty query", function () {
        var results = searchCountries("");
        var all = getAllCountries();
        expect(results.length).toBe(all.length);
    });

    it("returns empty for non-matching query", function () {
        var results = searchCountries("xyznonexistent");
        expect(results.length).toBe(0);
    });
});

describe("getCountriesByContinent", function () {
    it("returns European countries", function () {
        var results = getCountriesByContinent("europe");
        expect(results.length).toBeGreaterThan(5);
        results.forEach(function (c) {
            expect(c.continent).toBe("europe");
        });
    });

    it("returns Asian countries", function () {
        var results = getCountriesByContinent("asia");
        expect(results.length).toBeGreaterThan(2);
    });
});

describe("getNumbersByCategory", function () {
    it("returns police numbers for France", function () {
        var numbers = getNumbersByCategory("FR", "police");
        expect(numbers.length).toBeGreaterThanOrEqual(1);
        numbers.forEach(function (n) {
            expect(n.category).toBe("police");
        });
    });

    it("returns empty for unknown country", function () {
        var numbers = getNumbersByCategory("XX", "police");
        expect(numbers.length).toBe(0);
    });
});

describe("getAvailableCategories", function () {
    it("returns categories for France", function () {
        var cats = getAvailableCategories("FR");
        expect(cats).toContain("police");
        expect(cats).toContain("fire");
        expect(cats).toContain("medical");
        expect(cats).toContain("general");
    });

    it("returns empty for unknown country", function () {
        var cats = getAvailableCategories("XX");
        expect(cats.length).toBe(0);
    });
});

describe("getTotalCountries", function () {
    it("returns correct count", function () {
        var total = getTotalCountries();
        var all = getAllCountries();
        expect(total).toBe(all.length);
    });
});

describe("getAvailableContinents", function () {
    it("returns all continents present", function () {
        var continents = getAvailableContinents();
        expect(continents).toContain("europe");
        expect(continents).toContain("north_america");
        expect(continents).toContain("asia");
        expect(continents).toContain("africa");
        expect(continents).toContain("oceania");
    });
});

// ============================================================================
// ICONS & I18N KEYS
// ============================================================================

describe("getCategoryIcon", function () {
    it("returns police icon", function () {
        expect(getCategoryIcon("police")).toBe("🚔");
    });

    it("returns fire icon", function () {
        expect(getCategoryIcon("fire")).toBe("🚒");
    });

    it("returns medical icon", function () {
        expect(getCategoryIcon("medical")).toBe("🚑");
    });

    it("returns general icon", function () {
        expect(getCategoryIcon("general")).toBe("🆘");
    });

    it("returns fallback for unknown", function () {
        expect(getCategoryIcon("unknown_category")).toBe("📞");
    });
});

describe("getCategoryI18nKey", function () {
    it("returns correct i18n key for police", function () {
        expect(getCategoryI18nKey("police")).toBe("emergency.categories.police");
    });
});

// ============================================================================
// GEOLOCATION
// ============================================================================

describe("detectUserCountry", function () {
    it("detects country via GPS successfully", function () {
        mockRequestPermissions.mockResolvedValue({ status: "granted" });
        mockGetCurrentPosition.mockResolvedValue({
            coords: { latitude: 48.8566, longitude: 2.3522, accuracy: 10 },
        });
        mockReverseGeocode.mockResolvedValue([
            { isoCountryCode: "FR" },
        ]);

        return detectUserCountry().then(function (result) {
            expect(result.countryCode).toBe("FR");
            expect(result.latitude).toBe(48.8566);
            expect(result.longitude).toBe(2.3522);
            expect(result.source).toBe("gps");
        });
    });

    it("returns default when permission denied", function () {
        mockRequestPermissions.mockResolvedValue({ status: "denied" });

        return detectUserCountry().then(function (result) {
            expect(result.countryCode).toBeNull();
            expect(result.source).toBe("default");
        });
    });

    it("returns default when getCurrentPosition throws", function () {
        mockRequestPermissions.mockResolvedValue({ status: "granted" });
        mockGetCurrentPosition.mockRejectedValue(new Error("GPS failed"));

        return detectUserCountry().then(function (result) {
            expect(result.countryCode).toBeNull();
            expect(result.source).toBe("default");
        });
    });

    it("handles reverseGeocode failure gracefully", function () {
        mockRequestPermissions.mockResolvedValue({ status: "granted" });
        mockGetCurrentPosition.mockResolvedValue({
            coords: { latitude: 35.6762, longitude: 139.6503, accuracy: 50 },
        });
        mockReverseGeocode.mockRejectedValue(new Error("Geocode failed"));

        return detectUserCountry().then(function (result) {
            // countryCode should be null (reverseGeocode failed)
            expect(result.countryCode).toBeNull();
            expect(result.latitude).toBe(35.6762);
            expect(result.source).toBe("gps");
        });
    });

    it("handles empty reverseGeocode results", function () {
        mockRequestPermissions.mockResolvedValue({ status: "granted" });
        mockGetCurrentPosition.mockResolvedValue({
            coords: { latitude: 0, longitude: 0, accuracy: 1000 },
        });
        mockReverseGeocode.mockResolvedValue([]);

        return detectUserCountry().then(function (result) {
            expect(result.countryCode).toBeNull();
            expect(result.source).toBe("gps");
        });
    });
});

// ============================================================================
// CALL EMERGENCY NUMBER
// ============================================================================

describe("callEmergencyNumber", function () {
    it("opens phone URL for a valid number", function () {
        mockCanOpenURL.mockResolvedValue(true);
        mockOpenURL.mockResolvedValue(undefined);

        return callEmergencyNumber("112").then(function (result) {
            expect(result).toBe(true);
            expect(mockCanOpenURL).toHaveBeenCalledWith("telprompt:112");
            expect(mockOpenURL).toHaveBeenCalledWith("telprompt:112");
        });
    });

    it("strips spaces from number", function () {
        mockCanOpenURL.mockResolvedValue(true);
        mockOpenURL.mockResolvedValue(undefined);

        return callEmergencyNumber("01 40 05 48 48").then(function (result) {
            expect(result).toBe(true);
            expect(mockCanOpenURL).toHaveBeenCalledWith("telprompt:0140054848");
        });
    });

    it("returns false when URL cannot be opened", function () {
        mockCanOpenURL.mockResolvedValue(false);

        return callEmergencyNumber("112").then(function (result) {
            expect(result).toBe(false);
            expect(mockOpenURL).not.toHaveBeenCalled();
        });
    });

    it("returns false on error", function () {
        mockCanOpenURL.mockRejectedValue(new Error("Link error"));

        return callEmergencyNumber("112").then(function (result) {
            expect(result).toBe(false);
        });
    });
});

// ============================================================================
// DATA INTEGRITY
// ============================================================================

describe("Emergency data integrity", function () {
    it("all numbers have valid category", function () {
        var validCategories = [
            "police", "fire", "medical", "general", "child",
            "domestic_violence", "poison", "mental_health",
            "roadside", "coast_guard", "mountain_rescue", "disaster",
        ];
        var countries = getAllCountries();
        countries.forEach(function (c) {
            c.numbers.forEach(function (n) {
                expect(validCategories).toContain(n.category);
            });
        });
    });

    it("all numbers have non-empty number field", function () {
        var countries = getAllCountries();
        countries.forEach(function (c) {
            c.numbers.forEach(function (n) {
                expect(n.number.length).toBeGreaterThan(0);
            });
        });
    });

    it("all country codes are unique", function () {
        var countries = getAllCountries();
        var codes = countries.map(function (c) { return c.countryCode; });
        var unique = new Set(codes);
        expect(unique.size).toBe(codes.length);
    });

    it("France has SAMU (15)", function () {
        var country = getCountryByCode("FR");
        var samu = country.numbers.find(function (n) {
            return n.number === "15" && n.category === "medical";
        });
        expect(samu).toBeTruthy();
        expect(samu.label).toContain("SAMU");
    });

    it("Japan has police (110) and fire/ambulance (119)", function () {
        var country = getCountryByCode("JP");
        var police = country.numbers.find(function (n) {
            return n.number === "110" && n.category === "police";
        });
        var fire = country.numbers.find(function (n) {
            return n.number === "119" && n.category === "fire";
        });
        expect(police).toBeTruthy();
        expect(fire).toBeTruthy();
    });

    it("US has 911 as general number", function () {
        var country = getCountryByCode("US");
        expect(country.generalNumber).toBe("911");
    });

    it("all countries have at least 1 general or police number", function () {
        var countries = getAllCountries();
        countries.forEach(function (c) {
            var hasEssential = c.numbers.some(function (n) {
                return n.category === "general" || n.category === "police";
            });
            expect(hasEssential).toBe(true);
        });
    });
});
