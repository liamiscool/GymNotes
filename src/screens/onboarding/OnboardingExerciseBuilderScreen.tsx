import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../contexts/ThemeContext';
import { RootStackParamList } from '../../types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function OnboardingExerciseBuilderScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleComingSoon = () => {
    // For now, navigate back to method selection
    navigation.navigate('OnboardingMethodSelection');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🏗️</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Exercise Builder
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          This feature is coming soon! You'll be able to browse our exercise database and build custom workout plans.
        </Text>
        
        <View style={styles.featureList}>
          <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
            • Search 200+ exercises by muscle group
          </Text>
          <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
            • Filter by equipment and difficulty
          </Text>
          <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
            • Drag and drop to organize workout days
          </Text>
          <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
            • Set recommendations based on goals
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={handleComingSoon}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>
            Choose Another Method
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  featureList: {
    alignSelf: 'stretch',
    marginBottom: 32,
  },
  featureText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});