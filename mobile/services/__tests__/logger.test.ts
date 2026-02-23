/**
 * Tests for services/logger.ts
 *
 * The logger relies on __DEV__ global, set in jest.setup.js.
 */

import { clearLogBuffer, createLogger, getRecentLogs } from "../logger";

// Spy on console methods
let consoleSpy: Record<string, jest.SpyInstance>;

beforeEach(() => {
    clearLogBuffer();
    consoleSpy = {
        log: jest.spyOn(console, "log").mockImplementation(),
        info: jest.spyOn(console, "info").mockImplementation(),
        warn: jest.spyOn(console, "warn").mockImplementation(),
        error: jest.spyOn(console, "error").mockImplementation(),
    };
});

afterEach(() => {
    Object.values(consoleSpy).forEach((spy) => spy.mockRestore());
});

describe("createLogger", () => {
    it("creates a logger with debug, info, warn, error methods", () => {
        const log = createLogger("TestModule");
        expect(log).toHaveProperty("debug");
        expect(log).toHaveProperty("info");
        expect(log).toHaveProperty("warn");
        expect(log).toHaveProperty("error");
    });

    it("logs debug messages with correct prefix format", () => {
        const log = createLogger("Chat");
        log.debug("test message");

        expect(consoleSpy.log).toHaveBeenCalledTimes(1);
        const call = consoleSpy.log.mock.calls[0][0];
        expect(call).toContain("[DEBUG]");
        expect(call).toContain("[Chat]");
        expect(call).toContain("test message");
    });

    it("logs info messages via console.info", () => {
        const log = createLogger("Auth");
        log.info("user logged in");
        expect(consoleSpy.info).toHaveBeenCalledTimes(1);
    });

    it("logs warn messages via console.warn", () => {
        const log = createLogger("Net");
        log.warn("connection slow");
        expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
    });

    it("logs error messages via console.error", () => {
        const log = createLogger("DB");
        log.error("query failed");
        expect(consoleSpy.error).toHaveBeenCalledTimes(1);
    });

    it("includes extra data when provided", () => {
        const log = createLogger("Test");
        const data = { userId: "123" };
        log.info("message", data);

        expect(consoleSpy.info).toHaveBeenCalledWith(
            expect.stringContaining("[Test]"),
            data,
        );
    });
});

describe("getRecentLogs", () => {
    it("returns empty array initially", () => {
        expect(getRecentLogs()).toEqual([]);
    });

    it("captures logged entries in the buffer", () => {
        const log = createLogger("Mod");
        log.info("first");
        log.warn("second");

        const logs = getRecentLogs();
        expect(logs).toHaveLength(2);
        expect(logs[0].message).toBe("first");
        expect(logs[0].level).toBe("info");
        expect(logs[0].module).toBe("Mod");
        expect(logs[1].message).toBe("second");
        expect(logs[1].level).toBe("warn");
    });

    it("includes timestamps in ISO format", () => {
        const log = createLogger("T");
        log.debug("ts test");

        const logs = getRecentLogs();
        expect(logs[0].timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it("returns a copy (not the internal buffer)", () => {
        const log = createLogger("T");
        log.info("msg");

        const a = getRecentLogs();
        const b = getRecentLogs();
        expect(a).not.toBe(b);
        expect(a).toEqual(b);
    });
});

describe("clearLogBuffer", () => {
    it("empties the log buffer", () => {
        const log = createLogger("T");
        log.info("a");
        log.info("b");
        expect(getRecentLogs()).toHaveLength(2);

        clearLogBuffer();
        expect(getRecentLogs()).toEqual([]);
    });
});

describe("log buffer overflow", () => {
    it("keeps at most 100 entries (circular buffer)", () => {
        const log = createLogger("Flood");
        for (let i = 0; i < 120; i++) {
            log.info(`msg-${i}`);
        }

        const logs = getRecentLogs();
        expect(logs).toHaveLength(100);
        // Oldest should be msg-20 (first 20 pushed out)
        expect(logs[0].message).toBe("msg-20");
        expect(logs[99].message).toBe("msg-119");
    });
});
