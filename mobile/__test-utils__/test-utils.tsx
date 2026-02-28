import { ThemeProvider } from "@/providers/ThemeProvider";
import { render, RenderOptions } from "@testing-library/react-native";
import React, { ReactElement } from "react";

// Custom render function with providers
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <ThemeProvider>{children}</ThemeProvider>;
  }

  return render(ui as any, { wrapper: Wrapper, ...options });
}

// Mock data factories
export const createMockMessage = (overrides = {}) => ({
  id: "msg-123",
  conversation_id: "conv-123",
  sender_id: "user-123",
  content: "Test message",
  media_url: null,
  media_type: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  deleted_at: null,
  is_edited: false,
  reply_to_id: null,
  replied_message: null,
  sender: {
    id: "user-123",
    username: "testuser",
    avatar_url: "",
    display_name: "Test User",
  },
  ...overrides,
});

export const createMockConversation = (overrides = {}) => ({
  id: "conv-123",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_message_at: new Date().toISOString(),
  is_group: false,
  group_name: null,
  group_avatar_url: null,
  participants: [
    {
      id: "part-123",
      conversation_id: "conv-123",
      user_id: "user-123",
      joined_at: new Date().toISOString(),
      last_read_at: null,
      profile: {
        id: "user-123",
        username: "testuser",
        avatar_url: "",
        full_name: "Test User",
      },
    },
  ],
  last_message: createMockMessage(),
  ...overrides,
});

// Re-export everything from testing library
export * from "@testing-library/react-native";
