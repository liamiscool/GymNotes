import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

export default function SettingsScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Settings
          </Text>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Appearance
          </Text>
          <View style={[styles.settingCard, { backgroundColor: theme.colors.surface }]}>
            <ThemeToggle />
          </View>
        </View>

        {/* Coming Soon Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Coming Soon
          </Text>
          <View style={[styles.settingCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.comingSoonText, { color: theme.colors.textSecondary }]}>
              • Notifications & Reminders
            </Text>
            <Text style={[styles.comingSoonText, { color: theme.colors.textSecondary }]}>
              • Data Export & Backup
            </Text>
            <Text style={[styles.comingSoonText, { color: theme.colors.textSecondary }]}>
              • Apple Health Integration
            </Text>
            <Text style={[styles.comingSoonText, { color: theme.colors.textSecondary }]}>
              • Pro Features & Billing
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 4,
  },
});