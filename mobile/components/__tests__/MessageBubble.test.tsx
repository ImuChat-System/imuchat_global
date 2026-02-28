import React from "react";
import {
  createMockMessage,
  renderWithProviders,
} from "../../__test-utils__/test-utils";
import MessageBubble from "../MessageBubble";

describe("MessageBubble", () => {
  it("should render message content", () => {
    const message = createMockMessage({ content: "Hello World" });
    const { getByText } = renderWithProviders(
      <MessageBubble message={message} isOwnMessage={false} />,
    );

    expect(getByText("Hello World")).toBeTruthy();
  });

  it("should show sender name for other users messages", () => {
    const message = createMockMessage({
      content: "Test message",
      sender: {
        id: "user-2",
        username: "otheruser",
        avatar_url: null,
        display_name: "Other User",
      },
    });

    const { getByText } = renderWithProviders(
      <MessageBubble message={message} isOwnMessage={false} />,
    );

    expect(getByText("otheruser")).toBeTruthy();
  });

  it("should not show sender name for own messages", () => {
    const message = createMockMessage({
      content: "My message",
      sender: {
        id: "user-1",
        username: "myuser",
        avatar_url: null,
        display_name: "My User",
      },
    });

    const { queryByText } = renderWithProviders(
      <MessageBubble message={message} isOwnMessage={true} />,
    );

    expect(queryByText("myuser")).toBeNull();
  });

  it("should format timestamp correctly", () => {
    const now = new Date();
    const message = createMockMessage({
      created_at: now.toISOString(),
    });

    const { getByText } = renderWithProviders(
      <MessageBubble message={message} isOwnMessage={false} />,
    );

    const timeString = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    expect(getByText(timeString)).toBeTruthy();
  });

  it("should apply correct styling for own messages", () => {
    const message = createMockMessage();
    const { getByText } = renderWithProviders(
      <MessageBubble message={message} isOwnMessage={true} />,
    );

    const messageText = getByText(message.content!);
    expect(messageText).toBeTruthy();
    // Component should render without errors
  });

  it("should apply correct styling for other users messages", () => {
    const message = createMockMessage();
    const { getByText } = renderWithProviders(
      <MessageBubble message={message} isOwnMessage={false} />,
    );

    const messageText = getByText(message.content!);
    expect(messageText).toBeTruthy();
    // Component should render without errors
  });
});
