import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../contexts/ThemeContext';
import { RootStackParamList } from '../../types';
import { database } from '../../services/database';

type NavigationProp = StackNavigationProp<RootStackParamList>;
type RouteProp_ = RouteProp<RootStackParamList, 'OnboardingCompletion'>;

export default function OnboardingCompletionScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp_>();
  const { planId } = route.params;

  const handleStartWorkout = async () => {
    try {
      // Get the workout plan details
      const plan = await database.getWorkoutPlan(planId);
      
      if (plan) {
        // Simple navigation - let the normal flow work
        navigation.reset({
          index: 0,
          routes: [{ name: 'WorkoutPlans' }],
        });
        
        // Then navigate to the workout input
        setTimeout(() => {
          navigation.navigate('Workouts', { planId: plan.id, planName: plan.name });
          setTimeout(() => {
            navigation.navigate('WorkoutInput', { planId: plan.id });
          }, 100);
        }, 100);
      } else {
        // Fallback if plan doesn't exist
        navigation.reset({
          index: 0,
          routes: [{ name: 'WorkoutPlans' }],
        });
      }
    } catch (error) {
      console.error('Error starting workout:', error);
      // Fallback to workout plans
      navigation.reset({
        index: 0,
        routes: [{ name: 'WorkoutPlans' }],
      });
    }
  };

  const handleViewPlans = () => {
    // Replace the entire stack to prevent going back to onboarding
    navigation.reset({
      index: 0,
      routes: [{ name: 'WorkoutPlans' }],
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
        {/* Success Animation/Icon */}
        <View style={styles.successContainer}>
          <View style={[styles.successCircle, { backgroundColor: theme.colors.success }]}>
            <Text style={styles.successIcon}>🎉</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            You're All Set!
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Your workout plan has been created and you're ready to start your fitness journey with GymNotes.
          </Text>

          {/* Features List */}
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureEmoji}>💪</Text>
              <Text style={[styles.featureText, { color: theme.colors.text }]}>
                Track your workouts with natural language input
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureEmoji}>📊</Text>
              <Text style={[styles.featureText, { color: theme.colors.text }]}>
                Monitor your progress and build streaks
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureEmoji}>⚡</Text>
              <Text style={[styles.featureText, { color: theme.colors.text }]}>
                Fast, distraction-free workout logging
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureEmoji}>🌙</Text>
              <Text style={[styles.featureText, { color: theme.colors.text }]}>
                Beautiful dark and light modes
              </Text>
            </View>
          </View>

          {/* Tips Section */}
          <View style={[styles.tipsContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.tipsTitle, { color: theme.colors.text }]}>
              💡 Quick Tips
            </Text>
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
              • Type exercises like "3x10 bench press @60kg"
            </Text>
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
              • Add notes like "felt easy" or "RPE 8"
            </Text>
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
              • Your workouts auto-save as you type
            </Text>
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
              • View history by tapping on workout plans
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleStartWorkout}
            activeOpacity={0.7}
          >
            <Text style={styles.primaryButtonText}>
              🚀 Start First Workout
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
            onPress={handleViewPlans}
            activeOpacity={0.7}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
              View All Plans
            </Text>
          </TouchableOpacity>
        </View>

        {/* Welcome Message */}
        <View style={styles.welcomeContainer}>
          <Text style={[styles.welcomeText, { color: theme.colors.textSecondary }]}>
            Welcome to the GymNotes community! 🏋️‍♂️
          </Text>
          <Text style={[styles.welcomeSubtext, { color: theme.colors.textSecondary }]}>
            Simple. Fast. Effective workout tracking.
          </Text>
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
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 40,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  featuresList: {
    width: '100%',
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  featureEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    flex: 1,
    lineHeight: 22,
  },
  tipsContainer: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  actionButtons: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  welcomeText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});