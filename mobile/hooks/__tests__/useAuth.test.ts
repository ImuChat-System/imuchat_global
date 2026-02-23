/**
 * Tests for hooks/useAuth.ts (simple version)
 * Uses renderHook from @testing-library/react-native
 */

import { supabase } from "@/services/supabase";
import { act, renderHook, waitFor } from "@testing-library/react-native";

// supabase is globally mocked in jest.setup.js
const mockGetSession = supabase.auth.getSession as jest.Mock;
const mockOnAuthStateChange = supabase.auth.onAuthStateChange as jest.Mock;
const mockSignUp = supabase.auth.signUp as jest.Mock;
const mockSignInWithPassword = supabase.auth.signInWithPassword as jest.Mock;
const mockSignOut = supabase.auth.signOut as jest.Mock;

import { useAuth } from "../useAuth";

const mockUser = {
    id: "user-1",
    email: "test@test.com",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: "2024-01-01",
};

describe("useAuth", () => {
    let authChangeCallback: Function;

    beforeEach(() => {
        jest.clearAllMocks();

        // Default: no session
        mockGetSession.mockResolvedValue({
            data: { session: null },
        });

        // Capture the auth state change callback
        mockOnAuthStateChange.mockImplementation((cb: Function) => {
            authChangeCallback = cb;
            return {
                data: { subscription: { unsubscribe: jest.fn() } },
            };
        });
    });

    it("should start with loading=true and user=null", () => {
        const { result } = renderHook(() => useAuth());

        expect(result.current.loading).toBe(true);
        expect(result.current.user).toBeNull();
    });

    it("should set user after session loads", async () => {
        mockGetSession.mockResolvedValue({
            data: { session: { user: mockUser } },
        });

        const { result } = renderHook(() => useAuth());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.user).toEqual(mockUser);
    });

    it("should set user to null when no session", async () => {
        mockGetSession.mockResolvedValue({
            data: { session: null },
        });

        const { result } = renderHook(() => useAuth());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.user).toBeNull();
    });

    it("should update user on auth state change", async () => {
        const { result } = renderHook(() => useAuth());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        act(() => {
            authChangeCallback("SIGNED_IN", { user: mockUser });
        });

        expect(result.current.user).toEqual(mockUser);
    });

    it("should clear user on sign out event", async () => {
        mockGetSession.mockResolvedValue({
            data: { session: { user: mockUser } },
        });

        const { result } = renderHook(() => useAuth());

        await waitFor(() => {
            expect(result.current.user).toEqual(mockUser);
        });

        act(() => {
            authChangeCallback("SIGNED_OUT", null);
        });

        expect(result.current.user).toBeNull();
    });

    describe("signUp", () => {
        it("should call supabase.auth.signUp", async () => {
            mockSignUp.mockResolvedValue({
                data: { user: mockUser, session: null },
                error: null,
            });

            const { result } = renderHook(() => useAuth());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            const response = await result.current.signUp("test@test.com", "password123");

            expect(mockSignUp).toHaveBeenCalledWith({
                email: "test@test.com",
                password: "password123",
            });
            expect(response.error).toBeNull();
        });

        it("should return error on failure", async () => {
            const authError = { message: "Email already registered" };
            mockSignUp.mockResolvedValue({
                data: { user: null, session: null },
                error: authError,
            });

            const { result } = renderHook(() => useAuth());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            const response = await result.current.signUp("test@test.com", "pw");
            expect(response.error).toEqual(authError);
        });
    });

    describe("signIn", () => {
        it("should call supabase.auth.signInWithPassword", async () => {
            mockSignInWithPassword.mockResolvedValue({
                data: { user: mockUser, session: { access_token: "token" } },
                error: null,
            });

            const { result } = renderHook(() => useAuth());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            const response = await result.current.signIn("test@test.com", "password123");

            expect(mockSignInWithPassword).toHaveBeenCalledWith({
                email: "test@test.com",
                password: "password123",
            });
            expect(response.error).toBeNull();
        });
    });

    describe("signOut", () => {
        it("should call supabase.auth.signOut", async () => {
            mockSignOut.mockResolvedValue({ error: null });

            const { result } = renderHook(() => useAuth());

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            const response = await result.current.signOut();

            expect(mockSignOut).toHaveBeenCalled();
            expect(response.error).toBeNull();
        });
    });

    it("should unsubscribe on unmount", async () => {
        const unsubscribe = jest.fn();
        mockOnAuthStateChange.mockReturnValue({
            data: { subscription: { unsubscribe } },
        });

        const { unmount } = renderHook(() => useAuth());

        await waitFor(() => { });

        unmount();

        expect(unsubscribe).toHaveBeenCalled();
    });
});
