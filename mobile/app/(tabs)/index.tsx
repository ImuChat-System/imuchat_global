import { useColors, useSpacing } from '@/providers/ThemeProvider';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const colors = useColors();
  const spacing = useSpacing();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.content, { padding: spacing.lg }]}>
        <Text style={[styles.title, { color: colors.text }]}>🏠 Accueil</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Bienvenue sur ImuChat</Text>
        
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { 
            backgroundColor: colors.primary + '10',
            borderColor: colors.primary + '20'
          }]}>
            <Text style={[styles.statNumber, { color: colors.text }]}>12</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Messages</Text>
          </View>
          <View style={[styles.statCard, {
            backgroundColor: colors.primary + '10',
            borderColor: colors.primary + '20'
          }]}>
            <Text style={[styles.statNumber, { color: colors.text }]}>5</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Serveurs</Text>
          </View>
        </View>
        
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Activité récente</Text>
        <View style={[styles.activityCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.activityText, { color: colors.text }]}>
            🎉 Nouveau message de <Text style={[styles.highlight, { color: colors.primary }]}>Alice</Text>
          </Text>
          <Text style={[styles.activityTime, { color: colors.textSubtle }]}>Il y a 2 minutes</Text>
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
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  activityCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  activityText: {
    fontSize: 14,
    marginBottom: 8,
  },
  highlight: {
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 12,
  },
});
