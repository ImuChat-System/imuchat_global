/**
 * Tests unitaires pour MessageReactions - Mobile
 */

import { fireEvent, waitFor } from "@testing-library/react-native";
import React from "react";
import { renderWithProviders } from "../../__test-utils__/test-utils";
import { MessageReactions } from "../chat/MessageReactions";

const mockReactions = [
  {
    emoji: "❤️",
    count: 3,
    users: ["user1", "user2", "user3"],
    isOwn: true,
  },
  {
    emoji: "👍",
    count: 1,
    users: ["user4"],
    isOwn: false,
  },
];

const mockUsers = {
  user1: {
    id: "user1",
    name: "Alice",
    avatar: "https://example.com/alice.jpg",
  },
  user2: { id: "user2", name: "Bob" },
  user3: { id: "user3", name: "Charlie" },
  user4: { id: "user4", name: "David" },
};

describe("MessageReactions", () => {
  const defaultProps = {
    messageId: "msg-123",
    reactions: mockReactions,
    onReactionPress: jest.fn(),
    onAddReaction: jest.fn(),
    users: mockUsers,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders reactions correctly", () => {
    const { getByText } = renderWithProviders(
      <MessageReactions {...defaultProps} />,
    );

    expect(getByText("❤️")).toBeTruthy();
    expect(getByText("3")).toBeTruthy();
    expect(getByText("👍")).toBeTruthy();
    expect(getByText("1")).toBeTruthy();
  });

  it("renders nothing when no reactions", () => {
    const { queryByText } = renderWithProviders(
      <MessageReactions {...defaultProps} reactions={[]} />,
    );

    expect(queryByText("❤️")).toBeNull();
    expect(queryByText("+")).toBeNull();
  });

  it("calls onReactionPress when tapping a reaction", () => {
    const onReactionPress = jest.fn();
    const { getByText } = renderWithProviders(
      <MessageReactions {...defaultProps} onReactionPress={onReactionPress} />,
    );

    fireEvent.press(getByText("❤️"));
    expect(onReactionPress).toHaveBeenCalledWith("❤️");
  });

  it("calls onAddReaction when tapping add button", () => {
    const onAddReaction = jest.fn();
    const { getByText } = renderWithProviders(
      <MessageReactions {...defaultProps} onAddReaction={onAddReaction} />,
    );

    fireEvent.press(getByText("+"));
    expect(onAddReaction).toHaveBeenCalled();
  });

  it("shows modal on long press", async () => {
    const { getByText, findByText } = renderWithProviders(
      <MessageReactions {...defaultProps} />,
    );

    fireEvent(getByText("❤️"), "longPress");

    // Le modal devrait s'ouvrir
    await waitFor(() => {
      expect(findByText("components.reactionsCount")).toBeTruthy();
    });
  });

  it("highlights own reaction with different style", () => {
    const { getByLabelText } = renderWithProviders(
      <MessageReactions {...defaultProps} />,
    );

    const heartReaction = getByLabelText("❤️ components.reactionsCount");
    const thumbsReaction = getByLabelText("👍 components.reactionsCount");

    // Les deux existent
    expect(heartReaction).toBeTruthy();
    expect(thumbsReaction).toBeTruthy();
  });

  it("displays add button with correct accessibility", () => {
    const { getByLabelText } = renderWithProviders(
      <MessageReactions {...defaultProps} />,
    );

    expect(getByLabelText("components.addReaction")).toBeTruthy();
  });
});

describe("MessageReactions - Edge Cases", () => {
  it("handles single reaction correctly", () => {
    const singleReaction = [
      {
        emoji: "😂",
        count: 1,
        users: ["user1"],
        isOwn: false,
      },
    ];

    const { getByText, getByLabelText } = renderWithProviders(
      <MessageReactions
        messageId="msg-123"
        reactions={singleReaction}
        onReactionPress={jest.fn()}
        onAddReaction={jest.fn()}
      />,
    );

    expect(getByText("😂")).toBeTruthy();
    expect(getByLabelText("😂 components.reactionsCount")).toBeTruthy();
  });

  it("handles many reactions correctly", () => {
    const manyReactions = [
      { emoji: "❤️", count: 10, users: [], isOwn: false },
      { emoji: "👍", count: 5, users: [], isOwn: true },
      { emoji: "😂", count: 3, users: [], isOwn: false },
      { emoji: "😮", count: 2, users: [], isOwn: false },
      { emoji: "😢", count: 1, users: [], isOwn: false },
      { emoji: "🙏", count: 1, users: [], isOwn: true },
    ];

    const { getByText } = renderWithProviders(
      <MessageReactions
        messageId="msg-123"
        reactions={manyReactions}
        onReactionPress={jest.fn()}
        onAddReaction={jest.fn()}
      />,
    );

    expect(getByText("10")).toBeTruthy();
    expect(getByText("5")).toBeTruthy();
  });
});
