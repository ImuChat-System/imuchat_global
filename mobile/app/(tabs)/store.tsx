import { useColors, useSpacing } from '@/providers/ThemeProvider';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function StoreScreen() {
  const colors = useColors();
  const spacing = useSpacing();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.content, { padding: spacing.lg }]}>
        <Text style={[styles.title, { color: colors.text }]}>🛍️ Store</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Apps, thèmes et contenus</Text>
        
        <View style={styles.placeholder}>
          <Text style={styles.placeholderEmoji}>🎨</Text>
          <Text style={[styles.placeholderText, { color: colors.textMuted }]}>
            Store d'applications et thèmes à venir
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0a1a',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
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
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
});
