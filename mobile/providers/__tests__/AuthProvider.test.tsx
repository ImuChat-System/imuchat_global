/**
 * Tests for AuthProvider
 * Covers context values, session loading, auth state changes
 */

import { render, waitFor } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";

// Supabase is globally mocked via jest.setup.js
import { supabase } from "@/services/supabase";
const mockGetSession = supabase.auth.getSession as jest.Mock;
const mockOnAuthStateChange = supabase.auth.onAuthStateChange as jest.Mock;

import { AuthProvider, useAuth } from "../AuthProvider";

// Test consumer component
function AuthConsumer() {
  const { session, user, loading } = useAuth();
  return (
    <>
      <Text testID="loading">{String(loading)}</Text>
      <Text testID="user">{user ? user.id : "null"}</Text>
      <Text testID="session">{session ? "has-session" : "no-session"}</Text>
    </>
  );
}

let capturedAuthCallback: Function;

beforeEach(() => {
  jest.clearAllMocks();

  // Default: no session
  mockGetSession.mockResolvedValue({
    data: { session: null },
  });

  // Capture the auth state change callback
  mockOnAuthStateChange.mockImplementation((callback: Function) => {
    capturedAuthCallback = callback;
    return {
      data: { subscription: { unsubscribe: jest.fn() } },
    };
  });
});

describe("AuthProvider", () => {
  test("provides initial loading=true state", () => {
    // Make getSession never resolve to keep loading
    mockGetSession.mockReturnValue(new Promise(() => {}));

    const { getByTestId } = render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    expect(getByTestId("loading").children[0]).toBe("true");
    expect(getByTestId("user").children[0]).toBe("null");
    expect(getByTestId("session").children[0]).toBe("no-session");
  });

  test("sets session and user when getSession resolves with session", async () => {
    const mockSession = {
      user: { id: "user-1", email: "test@test.com" },
      access_token: "token-123",
    };
    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
    });

    const { getByTestId } = render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(getByTestId("loading").children[0]).toBe("false");
    });

    expect(getByTestId("user").children[0]).toBe("user-1");
    expect(getByTestId("session").children[0]).toBe("has-session");
  });

  test("sets user=null when getSession returns no session", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
    });

    const { getByTestId } = render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(getByTestId("loading").children[0]).toBe("false");
    });

    expect(getByTestId("user").children[0]).toBe("null");
    expect(getByTestId("session").children[0]).toBe("no-session");
  });

  test("updates user on SIGNED_IN auth state change", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
    });

    const { getByTestId } = render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(getByTestId("loading").children[0]).toBe("false");
    });

    // Simulate SIGNED_IN event
    const newSession = {
      user: { id: "user-2", email: "new@test.com" },
      access_token: "token-new",
    };

    await waitFor(() => {
      capturedAuthCallback("SIGNED_IN", newSession);
    });

    await waitFor(() => {
      expect(getByTestId("user").children[0]).toBe("user-2");
      expect(getByTestId("session").children[0]).toBe("has-session");
    });
  });

  test("clears user on SIGNED_OUT auth state change", async () => {
    const mockSession = {
      user: { id: "user-1", email: "test@test.com" },
      access_token: "token-123",
    };
    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
    });

    const { getByTestId } = render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(getByTestId("user").children[0]).toBe("user-1");
    });

    // Simulate SIGNED_OUT
    await waitFor(() => {
      capturedAuthCallback("SIGNED_OUT", null);
    });

    await waitFor(() => {
      expect(getByTestId("user").children[0]).toBe("null");
      expect(getByTestId("session").children[0]).toBe("no-session");
    });
  });

  test("unsubscribes on unmount", async () => {
    const unsubscribe = jest.fn();
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe } },
    });

    mockGetSession.mockResolvedValue({
      data: { session: null },
    });

    const { unmount } = render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {});

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  test("useAuth returns default values outside provider", () => {
    // useAuth outside AuthProvider should return context defaults
    const { getByTestId } = render(<AuthConsumer />);

    expect(getByTestId("loading").children[0]).toBe("true");
    expect(getByTestId("user").children[0]).toBe("null");
    expect(getByTestId("session").children[0]).toBe("no-session");
  });
});
