import { useColors, useSpacing } from '@/providers/ThemeProvider';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ChatsScreen() {
  const colors = useColors();
  const spacing = useSpacing();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.content, { padding: spacing.lg }]}>
        <Text style={[styles.title, { color: colors.text }]}>💬 Messages</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Vos conversations</Text>
        
        <View style={styles.placeholder}>
          <Text style={styles.placeholderEmoji}>💬</Text>
          <Text style={[styles.placeholderText, { color: colors.textMuted }]}>
            Liste des conversations à venir
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    // padding applied dynamically
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  placeholder: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  placeholderEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
