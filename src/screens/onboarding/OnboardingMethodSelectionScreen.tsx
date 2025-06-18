import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../contexts/ThemeContext';
import { RootStackParamList, OnboardingMethod } from '../../types';
import { database } from '../../services/database';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface MethodOption {
  id: OnboardingMethod;
  title: string;
  subtitle: string;
  emoji: string;
  description: string;
  screenName: keyof RootStackParamList;
}

const methodOptions: MethodOption[] = [
  {
    id: 'text_import',
    title: 'Import from Text',
    subtitle: 'Paste workout plan from ChatGPT, app, or notes',
    emoji: '🧠',
    description: 'Smart AI parsing of workout text',
    screenName: 'OnboardingTextImport'
  },
  {
    id: 'template',
    title: 'Choose Template',
    subtitle: 'Pick from professionally designed routines',
    emoji: '📋',
    description: 'Push/Pull/Legs, Full Body, and more',
    screenName: 'OnboardingTemplateSelection'
  },
  {
    id: 'exercise_builder',
    title: 'Build from Exercises',
    subtitle: 'Browse exercise database and create plan',
    emoji: '🏗️',
    description: 'Search 200+ exercises by muscle group',
    screenName: 'OnboardingExerciseBuilder'
  },
  {
    id: 'manual',
    title: 'Create Manually',
    subtitle: 'Step-by-step guided plan creation',
    emoji: '✍️',
    description: 'Perfect for custom routines',
    screenName: 'OnboardingManualCreation'
  }
];

export default function OnboardingMethodSelectionScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const handleMethodSelect = (method: MethodOption) => {
    navigation.navigate(method.screenName as any);
  };

  const handleSkip = async () => {
    try {
      // Mark onboarding as completed when skipping
      await database.setOnboardingCompleted(true);
      
      // Replace the entire stack to prevent going back to onboarding
      navigation.reset({
        index: 0,
        routes: [{ name: 'WorkoutPlans' }],
      });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Fallback to regular navigation
      navigation.navigate('WorkoutPlans');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            How would you like to get started?
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Choose the method that works best for you. You can always change this later.
          </Text>
        </View>

        {/* Method Options */}
        <View style={styles.optionsContainer}>
          {methodOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                }
              ]}
              onPress={() => handleMethodSelect(option)}
              activeOpacity={0.7}
            >
              <View style={styles.optionHeader}>
                <Text style={styles.optionEmoji}>{option.emoji}</Text>
                <View style={styles.optionTitleContainer}>
                  <Text style={[styles.optionTitle, { color: theme.colors.text }]}>
                    {option.title}
                  </Text>
                  <Text style={[styles.optionSubtitle, { color: theme.colors.textSecondary }]}>
                    {option.subtitle}
                  </Text>
                </View>
              </View>
              <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
                {option.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Skip Option */}
        <View style={styles.skipContainer}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={[styles.skipText, { color: theme.colors.textSecondary }]}>
              Skip for now, I'll create a plan later
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  optionEmoji: {
    fontSize: 32,
    marginRight: 16,
    marginTop: -2,
  },
  optionTitleContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 22,
  },
  optionSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 18,
    marginLeft: 48,
  },
  skipContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  skipText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});