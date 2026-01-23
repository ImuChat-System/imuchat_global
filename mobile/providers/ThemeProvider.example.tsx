/**
 * Example: Using ThemeProvider in a component
 */

import { useColors, useSpacing, useTheme } from '@/providers/ThemeProvider';
import { StyleSheet, Text, View } from 'react-native';

export default function ExampleScreen() {
  const { theme } = useTheme();
  const colors = useColors();
  const spacing = useSpacing();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Using Theme Tokens
      </Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        Colors, spacing, and typography from ui-kit
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
  },
});
