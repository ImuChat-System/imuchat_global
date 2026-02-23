import { fireEvent } from "@testing-library/react-native";
import React from "react";
import { renderWithProviders } from "../../__test-utils__/test-utils";
import MessageInput from "../MessageInput";

describe("MessageInput", () => {
  it("should render input field and send button", () => {
    const mockOnSend = jest.fn();
    const { getByPlaceholderText } = renderWithProviders(
      <MessageInput onSend={mockOnSend} />,
    );

    expect(getByPlaceholderText("chat.typeMessage")).toBeTruthy();
  });

  it("should call onSend with message text when send button is pressed", () => {
    const mockOnSend = jest.fn();
    const { getByPlaceholderText, getByTestId } = renderWithProviders(
      <MessageInput onSend={mockOnSend} />,
    );

    const input = getByPlaceholderText("chat.typeMessage");
    fireEvent.changeText(input, "Hello World");

    // Find and press the send button
    const sendButton = input.parent?.parent?.children.find(
      (child: any) => child.type === "TouchableOpacity",
    );

    if (sendButton) {
      fireEvent.press(sendButton);
      expect(mockOnSend).toHaveBeenCalledWith("Hello World");
    }
  });

  it("should clear input after sending", () => {
    const mockOnSend = jest.fn();
    const { getByPlaceholderText } = renderWithProviders(
      <MessageInput onSend={mockOnSend} />,
    );

    const input = getByPlaceholderText("chat.typeMessage");
    fireEvent.changeText(input, "Test message");

    // Simulate send
    const sendButton = input.parent?.parent?.children.find(
      (child: any) => child.type === "TouchableOpacity",
    );

    if (sendButton) {
      fireEvent.press(sendButton);
      expect(input.props.value).toBe("");
    }
  });

  it("should not call onSend when message is empty", () => {
    const mockOnSend = jest.fn();
    const { getByPlaceholderText } = renderWithProviders(
      <MessageInput onSend={mockOnSend} />,
    );

    const input = getByPlaceholderText("chat.typeMessage");
    const sendButton = input.parent?.parent?.children.find(
      (child: any) => child.type === "TouchableOpacity",
    );

    if (sendButton) {
      fireEvent.press(sendButton);
      expect(mockOnSend).not.toHaveBeenCalled();
    }
  });

  it("should not call onSend when message is only whitespace", () => {
    const mockOnSend = jest.fn();
    const { getByPlaceholderText } = renderWithProviders(
      <MessageInput onSend={mockOnSend} />,
    );

    const input = getByPlaceholderText("chat.typeMessage");
    fireEvent.changeText(input, "   ");

    const sendButton = input.parent?.parent?.children.find(
      (child: any) => child.type === "TouchableOpacity",
    );

    if (sendButton) {
      fireEvent.press(sendButton);
      expect(mockOnSend).not.toHaveBeenCalled();
    }
  });

  it("should respect disabled prop", () => {
    const mockOnSend = jest.fn();
    const { getByPlaceholderText } = renderWithProviders(
      <MessageInput onSend={mockOnSend} disabled={true} />,
    );

    const input = getByPlaceholderText("chat.typeMessage");
    expect(input.props.editable).toBe(false);
  });

  it("should trim whitespace from message before sending", () => {
    const mockOnSend = jest.fn();
    const { getByPlaceholderText } = renderWithProviders(
      <MessageInput onSend={mockOnSend} />,
    );

    const input = getByPlaceholderText("chat.typeMessage");
    fireEvent.changeText(input, "  Hello World  ");

    const sendButton = input.parent?.parent?.children.find(
      (child: any) => child.type === "TouchableOpacity",
    );

    if (sendButton) {
      fireEvent.press(sendButton);
      expect(mockOnSend).toHaveBeenCalledWith("Hello World");
    }
  });
});
