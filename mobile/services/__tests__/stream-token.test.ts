/**
 * Tests for services/stream-token.ts
 *
 * Focus on isStreamTokenValid (pure function) + clearStreamTokenCache.
 */

// Mock dependencies
jest.mock("../logger", () => ({
    createLogger: () => ({
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    }),
}));

jest.mock("../supabase", () => ({
    supabase: {
        auth: {
            getSession: jest.fn().mockResolvedValue({
                data: { session: { access_token: "test-token" } },
            }),
        },
    },
}));

import { clearStreamTokenCache, isStreamTokenValid } from "../stream-token";

describe("isStreamTokenValid", () => {
    it("returns true for a token expiring far in the future", () => {
        const futureTimestamp = Math.floor(Date.now() / 1000) + 3600; // 1h from now
        expect(isStreamTokenValid(futureTimestamp)).toBe(true);
    });

    it("returns false for an already expired token", () => {
        const pastTimestamp = Math.floor(Date.now() / 1000) - 100;
        expect(isStreamTokenValid(pastTimestamp)).toBe(false);
    });

    it("returns false for a token expiring within 5 minutes (margin)", () => {
        const now = Math.floor(Date.now() / 1000);
        const withinMargin = now + 4 * 60; // 4 minutes = within 5min margin
        expect(isStreamTokenValid(withinMargin)).toBe(false);
    });

    it("returns true for a token expiring in exactly 6 minutes", () => {
        const now = Math.floor(Date.now() / 1000);
        const sixMinutes = now + 6 * 60;
        expect(isStreamTokenValid(sixMinutes)).toBe(true);
    });

    it("returns false for timestamp 0 (epoch)", () => {
        expect(isStreamTokenValid(0)).toBe(false);
    });

    it("returns false for negative timestamp", () => {
        expect(isStreamTokenValid(-1000)).toBe(false);
    });

    it("boundary: returns false for exactly 5 minutes (margin edge)", () => {
        const now = Math.floor(Date.now() / 1000);
        const exactlyFiveMin = now + 5 * 60;
        // expiresAt - now = 300 seconds, marginSeconds = 300 → NOT > 300
        expect(isStreamTokenValid(exactlyFiveMin)).toBe(false);
    });

    it("boundary: returns true for 5 minutes + 1 second", () => {
        const now = Math.floor(Date.now() / 1000);
        const fiveMinPlusOne = now + 5 * 60 + 1;
        expect(isStreamTokenValid(fiveMinPlusOne)).toBe(true);
    });
});

describe("clearStreamTokenCache", () => {
    it("can be called without errors", () => {
        expect(() => clearStreamTokenCache()).not.toThrow();
    });

    it("can be called multiple times safely", () => {
        clearStreamTokenCache();
        clearStreamTokenCache();
        expect(true).toBe(true);
    });
});
