/**
 * Tests for services/calls.ts
 * Stream Video SDK mocking
 */

// --- Mocks ---
jest.mock("@stream-io/video-react-native-sdk", () => {
    const mockCall = {
        create: jest.fn().mockResolvedValue(undefined),
        join: jest.fn().mockResolvedValue(undefined),
        leave: jest.fn().mockResolvedValue(undefined),
        endCall: jest.fn().mockResolvedValue(undefined),
        startRecording: jest.fn().mockResolvedValue(undefined),
        stopRecording: jest.fn().mockResolvedValue(undefined),
        microphone: { toggle: jest.fn().mockResolvedValue(undefined) },
        camera: {
            toggle: jest.fn().mockResolvedValue(undefined),
            flip: jest.fn().mockResolvedValue(undefined),
        },
        state: {
            callingState: "joined",
            participants: [
                { userId: "user-1", name: "Alice", audioLevel: 5 },
                { userId: "user-2", name: "Bob", audioLevel: 0 },
            ],
            startedAt: new Date(Date.now() - 30000),
            recording: false,
        },
    };

    return {
        CallingState: {
            JOINED: "joined",
            LEFT: "left",
            IDLE: "idle",
        },
        StreamVideoClient: jest.fn().mockImplementation(() => ({
            call: jest.fn().mockReturnValue(mockCall),
            disconnectUser: jest.fn().mockResolvedValue(undefined),
        })),
        __mockCall: mockCall,
    };
});

import {
    createCall,
    disconnectStreamClient,
    endCall,
    flipCamera,
    generateCallId,
    getCall,
    getCallStats,
    getParticipants,
    getStreamClient,
    initializeStreamClient,
    isCallActive,
    isConnected,
    joinCall,
    leaveCall,
    startRecording,
    stopRecording,
    toggleCamera,
    toggleMicrophone,
} from "../calls";

// Get mock call
const { __mockCall: mockCall } = require("@stream-io/video-react-native-sdk");

beforeEach(() => jest.clearAllMocks());

describe("calls", () => {
    // ── Client lifecycle ──
    describe("initializeStreamClient", () => {
        it("initializes and returns client", async () => {
            const client = await initializeStreamClient(
                { id: "user-1", name: "Alice" },
                "token-123"
            );
            expect(client).toBeTruthy();
        });

        it("returns same client on second call", async () => {
            const client1 = await initializeStreamClient(
                { id: "user-1" },
                "token-123"
            );
            const client2 = await initializeStreamClient(
                { id: "user-1" },
                "token-123"
            );
            expect(client1).toBe(client2);
        });
    });

    describe("getStreamClient", () => {
        it("returns the initialized client", async () => {
            await initializeStreamClient({ id: "user-1" }, "token");
            expect(getStreamClient()).toBeTruthy();
        });
    });

    describe("disconnectStreamClient", () => {
        it("disconnects and nullifies client", async () => {
            await initializeStreamClient({ id: "user-1" }, "token");
            await disconnectStreamClient();
            expect(getStreamClient()).toBeNull();
        });

        it("does nothing when not initialized", async () => {
            await disconnectStreamClient();
            // No error thrown
        });
    });

    // ── Call management ──
    describe("createCall", () => {
        it("creates a call with members", async () => {
            await initializeStreamClient({ id: "user-1" }, "token");
            const call = await createCall("call-1", "default", ["user-1", "user-2"]);
            expect(call).toBeTruthy();
            expect(mockCall.create).toHaveBeenCalled();
        });

        it("returns null when client not initialized", async () => {
            await disconnectStreamClient();
            const call = await createCall("call-1");
            expect(call).toBeNull();
        });
    });

    describe("joinCall", () => {
        it("joins with options", async () => {
            await joinCall(mockCall);
            expect(mockCall.join).toHaveBeenCalledWith({ create: false });
        });
    });

    describe("leaveCall", () => {
        it("leaves the call", async () => {
            await leaveCall(mockCall);
            expect(mockCall.leave).toHaveBeenCalled();
        });
    });

    describe("endCall", () => {
        it("ends the call", async () => {
            await endCall(mockCall);
            expect(mockCall.endCall).toHaveBeenCalled();
        });
    });

    // ── Media controls ──
    describe("toggleMicrophone", () => {
        it("toggles microphone", async () => {
            await toggleMicrophone(mockCall);
            expect(mockCall.microphone.toggle).toHaveBeenCalled();
        });
    });

    describe("toggleCamera", () => {
        it("toggles camera", async () => {
            await toggleCamera(mockCall);
            expect(mockCall.camera.toggle).toHaveBeenCalled();
        });
    });

    describe("flipCamera", () => {
        it("flips camera", async () => {
            await flipCamera(mockCall);
            expect(mockCall.camera.flip).toHaveBeenCalled();
        });
    });

    // ── Participants ──
    describe("getParticipants", () => {
        it("returns mapped participants", () => {
            const participants = getParticipants(mockCall);
            expect(participants).toHaveLength(2);
            expect(participants[0].userId).toBe("user-1");
            expect(participants[0].isAudioEnabled).toBe(true);
            expect(participants[1].isAudioEnabled).toBe(false);
        });
    });

    // ── Stats ──
    describe("getCallStats", () => {
        it("returns call statistics", () => {
            const stats = getCallStats(mockCall);
            expect(stats).toBeTruthy();
            expect(stats!.participantCount).toBe(2);
            expect(stats!.isRecording).toBe(false);
            expect(stats!.duration).toBeGreaterThan(0);
        });
    });

    // ── Recording ──
    describe("startRecording", () => {
        it("starts recording", async () => {
            await startRecording(mockCall);
            expect(mockCall.startRecording).toHaveBeenCalled();
        });
    });

    describe("stopRecording", () => {
        it("stops recording", async () => {
            await stopRecording(mockCall);
            expect(mockCall.stopRecording).toHaveBeenCalled();
        });
    });

    // ── Utilities ──
    describe("isCallActive", () => {
        it("returns true when joined", () => {
            expect(isCallActive(mockCall)).toBe(true);
        });
    });

    describe("isConnected", () => {
        it("returns true when not idle or left", () => {
            expect(isConnected(mockCall)).toBe(true);
        });
    });

    describe("generateCallId", () => {
        it("generates unique ID starting with call_", () => {
            const id = generateCallId();
            expect(id).toMatch(/^call_\d+_/);
        });

        it("generates different IDs each time", () => {
            const id1 = generateCallId();
            const id2 = generateCallId();
            expect(id1).not.toBe(id2);
        });
    });

    // ── getCall ──
    describe("getCall", () => {
        it("returns call when client initialized", async () => {
            await initializeStreamClient({ id: "user-1" }, "token");
            const call = getCall("call-1");
            expect(call).toBeTruthy();
        });

        it("returns null when client not initialized", async () => {
            await disconnectStreamClient();
            const call = getCall("call-1");
            expect(call).toBeNull();
        });
    });
});
