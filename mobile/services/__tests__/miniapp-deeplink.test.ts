/**
 * Tests for services/miniapp-deeplink.ts
 * Pure utility functions — no Supabase
 */

jest.mock("@/services/logger", () => ({
    createLogger: () => ({
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    }),
}));

jest.mock("expo-linking", () => ({
    parse: jest.fn(),
}));

jest.mock("expo-router", () => ({
    router: { push: jest.fn() },
}));

import * as Linking from "expo-linking";
import { router } from "expo-router";
import {
    getMiniAppDeepLink,
    getMiniAppUniversalLink,
    handleDeepLink,
    openMiniApp,
    parseMiniAppUrl,
} from "../miniapp-deeplink";

describe("miniapp-deeplink", () => {
    beforeEach(() => jest.clearAllMocks());

    // ── getMiniAppDeepLink ──
    describe("getMiniAppDeepLink", () => {
        it("returns imuchat:// scheme URL", () => {
            expect(getMiniAppDeepLink("imu-music")).toBe(
                "imuchat://miniapp/imu-music"
            );
        });

        it("handles ids with special chars", () => {
            expect(getMiniAppDeepLink("my-app-123")).toBe(
                "imuchat://miniapp/my-app-123"
            );
        });
    });

    // ── getMiniAppUniversalLink ──
    describe("getMiniAppUniversalLink", () => {
        it("returns https universal link", () => {
            expect(getMiniAppUniversalLink("imu-music")).toBe(
                "https://imuchat.app/miniapp/imu-music"
            );
        });
    });

    // ── openMiniApp ──
    describe("openMiniApp", () => {
        it("calls router.push with correct params", () => {
            openMiniApp("test-app");
            expect(router.push).toHaveBeenCalledWith({
                pathname: "/miniapp/[id]",
                params: { id: "test-app" },
            });
        });
    });

    // ── parseMiniAppUrl ──
    describe("parseMiniAppUrl", () => {
        it("parses custom scheme URL (imuchat://miniapp/id)", () => {
            (Linking.parse as jest.Mock).mockReturnValue({
                hostname: "miniapp",
                path: "imu-music",
                queryParams: {},
            });

            expect(parseMiniAppUrl("imuchat://miniapp/imu-music")).toBe(
                "imu-music"
            );
        });

        it("parses universal link (https://imuchat.app/miniapp/id)", () => {
            (Linking.parse as jest.Mock).mockReturnValue({
                hostname: "imuchat.app",
                path: "miniapp/imu-music",
                queryParams: {},
            });

            expect(parseMiniAppUrl("https://imuchat.app/miniapp/imu-music")).toBe(
                "imu-music"
            );
        });

        it("returns null for non-miniapp URL", () => {
            (Linking.parse as jest.Mock).mockReturnValue({
                hostname: "imuchat.app",
                path: "profile/123",
                queryParams: {},
            });

            expect(parseMiniAppUrl("https://imuchat.app/profile/123")).toBeNull();
        });

        it("returns null on parse error", () => {
            (Linking.parse as jest.Mock).mockImplementation(() => {
                throw new Error("Bad URL");
            });

            expect(parseMiniAppUrl("bad://url")).toBeNull();
        });
    });

    // ── handleDeepLink ──
    describe("handleDeepLink", () => {
        it("opens miniapp and returns true for miniapp URL", async () => {
            (Linking.parse as jest.Mock).mockReturnValue({
                hostname: "miniapp",
                path: "imu-music",
                queryParams: {},
            });

            const result = await handleDeepLink("imuchat://miniapp/imu-music");

            expect(result).toBe(true);
            expect(router.push).toHaveBeenCalled();
        });

        it("returns false for non-miniapp URL", async () => {
            (Linking.parse as jest.Mock).mockReturnValue({
                hostname: "imuchat.app",
                path: "settings",
                queryParams: {},
            });

            const result = await handleDeepLink("https://imuchat.app/settings");

            expect(result).toBe(false);
            expect(router.push).not.toHaveBeenCalled();
        });
    });
});
