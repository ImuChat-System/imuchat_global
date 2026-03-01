/**
 * Tests for services/calls-safe.ts
 * Safe wrapper for Stream Video SDK with Expo Go detection
 */

// Mock expo-constants
jest.mock('expo-constants', () => ({
    __esModule: true,
    default: { appOwnership: 'standalone' },
}));

// Mock the calls module
const mockCallsModule = {
    initializeStreamClient: jest.fn().mockResolvedValue({ id: 'client-1' }),
    createCall: jest.fn().mockResolvedValue({ id: 'call-1' }),
    joinCall: jest.fn().mockResolvedValue(undefined),
    leaveCall: jest.fn().mockResolvedValue(undefined),
    endCall: jest.fn().mockResolvedValue(undefined),
    toggleMicrophone: jest.fn().mockResolvedValue(undefined),
    toggleCamera: jest.fn().mockResolvedValue(undefined),
    flipCamera: jest.fn().mockResolvedValue(undefined),
    getCall: jest.fn().mockResolvedValue({ id: 'call-1' }),
    disconnectStreamClient: jest.fn().mockResolvedValue(undefined),
    getStreamClient: jest.fn().mockReturnValue(null),
    generateCallId: jest.fn().mockReturnValue('call-abc123'),
};

// We need to control the dynamic import
jest.mock('../calls', () => mockCallsModule);

// Mock stream-token
jest.mock('../stream-token', () => ({
    generateStreamToken: jest.fn().mockResolvedValue({ token: 'test-token' }),
}));

describe('calls-safe service', () => {
    // We need to re-import after each test because of module-level caches
    let callsSafe: typeof import('../calls-safe');

    beforeEach(() => {
        jest.clearAllMocks();
        // Reset module cache to clear sdkAvailable/sdkCheckPromise/callsModule/loadingPromise
        jest.resetModules();

        // Re-setup mocks after resetModules
        jest.mock('expo-constants', () => ({
            __esModule: true,
            default: { appOwnership: 'standalone' },
        }));
        jest.mock('../calls', () => mockCallsModule);
        jest.mock('../stream-token', () => ({
            generateStreamToken: jest.fn().mockResolvedValue({ token: 'test-token' }),
        }));
    });

    describe('isCallsAvailable', () => {
        it('returns true for standalone (dev build) apps', async () => {
            callsSafe = require('../calls-safe');
            const available = await callsSafe.isCallsAvailable();
            expect(available).toBe(true);
        });

        it('returns false for Expo Go', async () => {
            jest.mock('expo-constants', () => ({
                __esModule: true,
                default: { appOwnership: 'expo' },
            }));
            callsSafe = require('../calls-safe');
            const available = await callsSafe.isCallsAvailable();
            expect(available).toBe(false);
        });

        it('caches the result on subsequent calls', async () => {
            callsSafe = require('../calls-safe');
            const first = await callsSafe.isCallsAvailable();
            const second = await callsSafe.isCallsAvailable();
            expect(first).toBe(second);
        });

        it('returns false if Constants throws', async () => {
            jest.mock('expo-constants', () => ({
                __esModule: true,
                get default() {
                    throw new Error('fail');
                },
            }));
            callsSafe = require('../calls-safe');
            const available = await callsSafe.isCallsAvailable();
            expect(available).toBe(false);
        });
    });

    describe('safe wrappers (SDK available)', () => {
        beforeEach(async () => {
            callsSafe = require('../calls-safe');
            // Prime the availability check
            await callsSafe.isCallsAvailable();
        });

        it('safeInitializeStreamClient calls module method', async () => {
            const result = await callsSafe.safeInitializeStreamClient(
                { id: 'user-1', name: 'Test' },
                'token-123'
            );
            expect(result).toEqual({ id: 'client-1' });
            expect(mockCallsModule.initializeStreamClient).toHaveBeenCalledWith(
                { id: 'user-1', name: 'Test' },
                'token-123'
            );
        });

        it('safeCreateCall calls module method with defaults', async () => {
            const result = await callsSafe.safeCreateCall('call-1');
            expect(result).toEqual({ id: 'call-1' });
            expect(mockCallsModule.createCall).toHaveBeenCalledWith('call-1', 'default', []);
        });

        it('safeCreateCall passes callType and members', async () => {
            await callsSafe.safeCreateCall('call-2', 'audio', ['user-a', 'user-b']);
            expect(mockCallsModule.createCall).toHaveBeenCalledWith('call-2', 'audio', ['user-a', 'user-b']);
        });

        it('safeJoinCall calls module method', async () => {
            const mockCall = { id: 'call-1' };
            await callsSafe.safeJoinCall(mockCall, { videoEnabled: true });
            expect(mockCallsModule.joinCall).toHaveBeenCalledWith(mockCall, { videoEnabled: true });
        });

        it('safeLeaveCall calls module method', async () => {
            const mockCall = { id: 'call-1' };
            await callsSafe.safeLeaveCall(mockCall);
            expect(mockCallsModule.leaveCall).toHaveBeenCalledWith(mockCall);
        });

        it('safeLeaveCall is no-op when call is null', async () => {
            await callsSafe.safeLeaveCall(null);
            expect(mockCallsModule.leaveCall).not.toHaveBeenCalled();
        });

        it('safeEndCall calls module method', async () => {
            const mockCall = { id: 'call-1' };
            await callsSafe.safeEndCall(mockCall);
            expect(mockCallsModule.endCall).toHaveBeenCalledWith(mockCall);
        });

        it('safeEndCall is no-op when call is null', async () => {
            await callsSafe.safeEndCall(null);
            expect(mockCallsModule.endCall).not.toHaveBeenCalled();
        });

        it('safeToggleMicrophone calls module method', async () => {
            const mockCall = { id: 'call-1' };
            await callsSafe.safeToggleMicrophone(mockCall);
            expect(mockCallsModule.toggleMicrophone).toHaveBeenCalledWith(mockCall);
        });

        it('safeToggleCamera calls module method', async () => {
            const mockCall = { id: 'call-1' };
            await callsSafe.safeToggleCamera(mockCall);
            expect(mockCallsModule.toggleCamera).toHaveBeenCalledWith(mockCall);
        });

        it('safeFlipCamera calls module method', async () => {
            const mockCall = { id: 'call-1' };
            await callsSafe.safeFlipCamera(mockCall);
            expect(mockCallsModule.flipCamera).toHaveBeenCalledWith(mockCall);
        });

        it('safeGetCall returns call object', async () => {
            const result = await callsSafe.safeGetCall('call-1');
            expect(result).toEqual({ id: 'call-1' });
            expect(mockCallsModule.getCall).toHaveBeenCalledWith('call-1', 'default');
        });

        it('safeGetCall passes callType param', async () => {
            await callsSafe.safeGetCall('call-1', 'audio');
            expect(mockCallsModule.getCall).toHaveBeenCalledWith('call-1', 'audio');
        });

        it('safeDisconnectStreamClient calls module method', async () => {
            await callsSafe.safeDisconnectStreamClient();
            expect(mockCallsModule.disconnectStreamClient).toHaveBeenCalled();
        });

        it('safeGetStreamClient returns client', async () => {
            mockCallsModule.getStreamClient.mockReturnValue({ id: 'client-1' });
            const result = await callsSafe.safeGetStreamClient();
            expect(result).toEqual({ id: 'client-1' });
        });

        it('safeGenerateCallId returns module-generated id', async () => {
            const id = await callsSafe.safeGenerateCallId();
            expect(id).toBe('call-abc123');
        });
    });

    describe('safe wrappers (SDK NOT available — Expo Go)', () => {
        beforeEach(async () => {
            jest.mock('expo-constants', () => ({
                __esModule: true,
                default: { appOwnership: 'expo' },
            }));
            callsSafe = require('../calls-safe');
            await callsSafe.isCallsAvailable();
        });

        it('safeInitializeStreamClient returns null', async () => {
            const result = await callsSafe.safeInitializeStreamClient({ id: 'u' }, 't');
            expect(result).toBeNull();
        });

        it('safeCreateCall returns null', async () => {
            const result = await callsSafe.safeCreateCall('c');
            expect(result).toBeNull();
        });

        it('safeJoinCall is no-op', async () => {
            await callsSafe.safeJoinCall({ id: 'c' });
            expect(mockCallsModule.joinCall).not.toHaveBeenCalled();
        });

        it('safeGetCall returns null', async () => {
            const result = await callsSafe.safeGetCall('c');
            expect(result).toBeNull();
        });

        it('safeDisconnectStreamClient is no-op', async () => {
            await callsSafe.safeDisconnectStreamClient();
            expect(mockCallsModule.disconnectStreamClient).not.toHaveBeenCalled();
        });

        it('safeGenerateCallId returns a fallback id', async () => {
            const id = await callsSafe.safeGenerateCallId();
            expect(id).toMatch(/^call-\d+-[a-z0-9]+$/);
        });
    });

    describe('safeEnsureStreamClient', () => {
        it('returns existing client if already initialized', async () => {
            mockCallsModule.getStreamClient.mockReturnValue({ id: 'existing' });
            callsSafe = require('../calls-safe');
            const result = await callsSafe.safeEnsureStreamClient({ id: 'user-1' });
            expect(result).toEqual({ id: 'existing' });
            expect(mockCallsModule.initializeStreamClient).not.toHaveBeenCalled();
        });

        it('initializes with token when no client exists', async () => {
            mockCallsModule.getStreamClient.mockReturnValue(null);
            mockCallsModule.initializeStreamClient.mockResolvedValue({ id: 'new-client' });
            callsSafe = require('../calls-safe');
            const result = await callsSafe.safeEnsureStreamClient({ id: 'user-1', name: 'Test' });
            expect(result).toEqual({ id: 'new-client' });
            expect(mockCallsModule.initializeStreamClient).toHaveBeenCalled();
        });

        it('returns null when SDK not available', async () => {
            jest.mock('expo-constants', () => ({
                __esModule: true,
                default: { appOwnership: 'expo' },
            }));
            callsSafe = require('../calls-safe');
            const result = await callsSafe.safeEnsureStreamClient({ id: 'user-1' });
            expect(result).toBeNull();
        });
    });
});
