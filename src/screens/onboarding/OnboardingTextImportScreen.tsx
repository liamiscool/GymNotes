import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../contexts/ThemeContext';
import { RootStackParamList, ParsedWorkoutPlan, WorkoutPlan } from '../../types';
import { AIWorkoutParser } from '../../services/aiParser';
import { database } from '../../services/database';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const exampleText = `Push Pull Legs Program

Day 1: Push (Chest, Shoulders, Triceps)
3x8 Bench Press @60kg
3x10 Overhead Press @40kg
3x12 Push-ups
2x15 Tricep Dips

Day 2: Pull (Back, Biceps)
3x6 Pull-ups
3x8 Barbell Row @50kg
3x10 Bicep Curls @15kg

Day 3: Legs (Quads, Glutes, Hamstrings)
3x8 Squat @70kg
3x5 Deadlift @80kg
3x12 Leg Press @100kg`;

export default function OnboardingTextImportScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedPlan, setParsedPlan] = useState<ParsedWorkoutPlan | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleParseText = async () => {
    if (!inputText.trim()) {
      Alert.alert('No Text', 'Please paste your workout plan text to continue.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Parse multiple exercises from the workout plan
      const exercises = AIWorkoutParser.parseWorkoutPlan(inputText);
      
      if (exercises.length > 0) {
        // Convert to the expected format for preview
        const parsedPlan: ParsedWorkoutPlan = {
          name: 'My Workout Plan',
          description: 'Imported workout plan',
          estimatedDifficulty: 'medium',
          days: [{
            name: 'Day 1',
            exercises: exercises.map(ex => ({
              name: ex.exercise,
              sets: ex.sets,
              reps: ex.reps,
              weight: ex.weight,
              notes: ex.notes
            }))
          }]
        };
        
        setParsedPlan(parsedPlan);
        setShowPreview(true);
      } else {
        Alert.alert(
          'Could Not Parse Text',
          'Unable to parse your workout plan. Try these suggestions:\n\n• Add exercise details with sets and reps\n• Example: "3x10 Bench Press" or "Squat 3x8 @60kg"\n• Consider adding day headers like "Day 1" or "Push Day"\n• Format: "3x10 Exercise @60kg" or "Exercise 3x10"'
        );
      }
    } catch (error) {
      console.error('Error parsing text:', error);
      Alert.alert('Error', 'An error occurred while parsing your text. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPlan = () => {
    setShowPreview(false);
  };

  const handleCreatePlan = async () => {
    if (!parsedPlan) return;
    
    setIsLoading(true);
    
    try {
      // Create the workout plan in database
      const planId = `plan_${Date.now()}`;
      const workoutPlan: Omit<WorkoutPlan, 'createdAt' | 'updatedAt'> = {
        id: planId,
        name: parsedPlan.name,
        description: parsedPlan.description,
        isActive: true
      };
      
      await database.createWorkoutPlan(workoutPlan);
      await database.setLastSelectedPlan(planId);
      await database.setOnboardingCompleted(true);
      
      // Navigate to completion screen (still within onboarding flow)
      navigation.navigate('OnboardingCompletion', { planId });
    } catch (error) {
      console.error('Error creating plan:', error);
      Alert.alert('Error', 'Failed to create workout plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseExample = () => {
    setInputText(exampleText);
  };

  if (showPreview && parsedPlan) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Preview Your Plan
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Review the parsed workout plan and make any adjustments
            </Text>
          </View>

          {/* Plan Preview */}
          <View style={[styles.previewContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.planName, { color: theme.colors.text }]}>
              {parsedPlan.name}
            </Text>
            {parsedPlan.description && (
              <Text style={[styles.planDescription, { color: theme.colors.textSecondary }]}>
                {parsedPlan.description}
              </Text>
            )}
            
            <View style={[styles.difficultyBadge, { backgroundColor: theme.colors.accent }]}>
              <Text style={styles.difficultyText}>
                {parsedPlan.estimatedDifficulty.toUpperCase()}
              </Text>
            </View>

            {parsedPlan.days.map((day, dayIndex) => (
              <View key={dayIndex} style={styles.dayContainer}>
                <Text style={[styles.dayName, { color: theme.colors.text }]}>
                  {day.name}
                </Text>
                {day.exercises.map((exercise, exerciseIndex) => (
                  <View key={exerciseIndex} style={styles.exerciseRow}>
                    <Text style={[styles.exerciseName, { color: theme.colors.text }]}>
                      {exercise.name}
                    </Text>
                    <Text style={[styles.exerciseDetails, { color: theme.colors.textSecondary }]}>
                      {exercise.sets}×{exercise.reps}
                      {exercise.weight && ` @ ${exercise.weight}kg`}
                    </Text>
                    {exercise.notes && (
                      <Text style={[styles.exerciseNotes, { color: theme.colors.textSecondary }]}>
                        💭 {exercise.notes}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
              onPress={handleEditPlan}
              activeOpacity={0.7}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
                Edit Text
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleCreatePlan}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.primaryButtonText}>
                {isLoading ? 'Creating...' : 'Create Plan'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Import Workout Plan
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Paste your workout plan from ChatGPT, notes, or any fitness app
            </Text>
          </View>

          {/* Example Button */}
          <TouchableOpacity
            style={[styles.exampleButton, { borderColor: theme.colors.border }]}
            onPress={handleUseExample}
            activeOpacity={0.7}
          >
            <Text style={[styles.exampleButtonText, { color: theme.colors.primary }]}>
              📋 Use Example Text
            </Text>
          </TouchableOpacity>

          {/* Text Input */}
          <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <TextInput
              style={[styles.textInput, { color: theme.colors.text }]}
              multiline
              value={inputText}
              onChangeText={setInputText}
              placeholder="Paste your workout plan here...

Example formats:
• 3x10 Bench Press @60kg
• Day 1: Push Day
• Squat 3x8 70kg
• 3 sets of 10 reps Push-ups"
              placeholderTextColor={theme.colors.placeholderText}
              textAlignVertical="top"
            />
          </View>

          {/* Parse Button */}
          <TouchableOpacity
            style={[
              styles.parseButton,
              { 
                backgroundColor: inputText.trim() ? theme.colors.primary : theme.colors.border,
                opacity: inputText.trim() ? 1 : 0.5
              }
            ]}
            onPress={handleParseText}
            disabled={!inputText.trim() || isLoading}
            activeOpacity={0.7}
          >
            <Text style={styles.parseButtonText}>
              {isLoading ? 'Parsing...' : '🧠 Parse Workout Plan'}
            </Text>
          </TouchableOpacity>

          {/* Tips */}
          <View style={styles.tipsContainer}>
            <Text style={[styles.tipsTitle, { color: theme.colors.text }]}>
              Tips for better parsing:
            </Text>
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
              • Include exercise names, sets, and reps
            </Text>
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
              • Use day headers like "Day 1" or "Push Day"
            </Text>
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
              • Format: "3x10 Exercise @60kg" or "Exercise 3x10"
            </Text>
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
              • Add weights with kg or lbs
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  exampleButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  exampleButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 20,
    minHeight: 200,
  },
  textInput: {
    padding: 16,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 200,
  },
  parseButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  parseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsContainer: {
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  previewContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 16,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  dayContainer: {
    marginBottom: 16,
  },
  dayName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  exerciseRow: {
    marginBottom: 8,
    paddingLeft: 16,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  exerciseDetails: {
    fontSize: 14,
    marginBottom: 2,
  },
  exerciseNotes: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});