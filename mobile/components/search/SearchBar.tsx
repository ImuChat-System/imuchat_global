/**
 * SearchBar Component
 * Reusable search input with clear button and loading indicator
 */

import { useColors, useSpacing } from "@/providers/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  autoFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmit?: () => void;
  style?: ViewStyle;
}

export interface SearchBarRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
}

export const SearchBar = forwardRef<SearchBarRef, SearchBarProps>(
  (
    {
      value,
      onChangeText,
      placeholder = "Rechercher...",
      isLoading = false,
      autoFocus = false,
      onFocus,
      onBlur,
      onSubmit,
      style,
    },
    ref,
  ) => {
    const colors = useColors();
    const spacing = useSpacing();
    const inputRef = useRef<TextInput>(null);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      clear: () => {
        onChangeText("");
        inputRef.current?.focus();
      },
    }));

    const handleClear = () => {
      onChangeText("");
      inputRef.current?.focus();
    };

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.surfaceActive,
            borderRadius: spacing.md,
            paddingHorizontal: spacing.md,
          },
          style,
        ]}
      >
        <Ionicons
          name="search"
          size={20}
          color={colors.textMuted}
          style={styles.searchIcon}
        />
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              color: colors.text,
              flex: 1,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onFocus={onFocus}
          onBlur={onBlur}
          onSubmitEditing={onSubmit}
        />
        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={styles.rightIcon}
          />
        ) : value.length > 0 ? (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.rightIcon}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  },
);

SearchBar.displayName = "SearchBar";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    fontSize: 16,
    paddingVertical: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});

export default SearchBar;
