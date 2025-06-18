import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../contexts/ThemeContext';
import { RootStackParamList, WorkoutTemplate, WorkoutPlan } from '../../types';
import { database } from '../../services/database';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const difficultyLevels = ['beginner', 'intermediate', 'advanced'] as const;
const categories = ['strength', 'bodybuilding', 'powerlifting', 'calisthenics'] as const;

interface TemplateCardProps {
  template: WorkoutTemplate;
  onSelect: (template: WorkoutTemplate) => void;
  theme: any;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect, theme }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#F44336';
      default: return theme.colors.accent;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.templateCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }
      ]}
      onPress={() => onSelect(template)}
      activeOpacity={0.7}
    >
      <View style={styles.templateHeader}>
        <View style={styles.templateTitleContainer}>
          <Text style={[styles.templateTitle, { color: theme.colors.text }]}>
            {template.name}
          </Text>
          {template.isFeatured && (
            <View style={[styles.featuredBadge, { backgroundColor: theme.colors.accent }]}>
              <Text style={styles.featuredText}>⭐ FEATURED</Text>
            </View>
          )}
        </View>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(template.difficulty) }]}>
          <Text style={styles.difficultyText}>
            {template.difficulty.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={[styles.templateDescription, { color: theme.colors.textSecondary }]}>
        {template.description}
      </Text>

      <View style={styles.templateMeta}>
        <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
          📅 {template.daysPerWeek} days/week
        </Text>
        <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
          🏷️ {template.category}
        </Text>
      </View>

      <View style={styles.exercisePreview}>
        <Text style={[styles.previewTitle, { color: theme.colors.text }]}>
          Preview:
        </Text>
        {template.templateData.days.slice(0, 2).map((day, index) => (
          <View key={index} style={styles.dayPreview}>
            <Text style={[styles.dayPreviewName, { color: theme.colors.text }]}>
              {day.name}
            </Text>
            <Text style={[styles.exerciseList, { color: theme.colors.textSecondary }]}>
              {day.exercises.slice(0, 3).map(ex => ex.name).join(', ')}
              {day.exercises.length > 3 && ` +${day.exercises.length - 3} more`}
            </Text>
          </View>
        ))}
        {template.templateData.days.length > 2 && (
          <Text style={[styles.moreDays, { color: theme.colors.textSecondary }]}>
            +{template.templateData.days.length - 2} more days
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function OnboardingTemplateSelectionScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [featuredTemplates, setFeaturedTemplates] = useState<WorkoutTemplate[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [selectedDifficulty, selectedCategory]);

  const loadTemplates = async () => {
    try {
      const [allTemplates, featured] = await Promise.all([
        database.getWorkoutTemplates(),
        database.getFeaturedTemplates()
      ]);
      
      setTemplates(allTemplates);
      setFeaturedTemplates(featured);
    } catch (error) {
      console.error('Error loading templates:', error);
      Alert.alert('Error', 'Failed to load workout templates. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterTemplates = async () => {
    try {
      const filtered = await database.getWorkoutTemplates(
        selectedCategory || undefined,
        selectedDifficulty || undefined
      );
      setTemplates(filtered);
    } catch (error) {
      console.error('Error filtering templates:', error);
    }
  };

  const handleTemplateSelect = async (template: WorkoutTemplate) => {
    setIsLoading(true);
    
    try {
      // Create a workout plan from the template
      const planId = `plan_${Date.now()}`;
      const workoutPlan: Omit<WorkoutPlan, 'createdAt' | 'updatedAt'> = {
        id: planId,
        name: template.name,
        description: template.description || `Based on ${template.name} template`,
        isActive: true
      };
      
      await database.createWorkoutPlan(workoutPlan);
      await database.setLastSelectedPlan(planId);
      await database.setOnboardingCompleted(true);
      
      // Navigate to completion screen (still within onboarding flow)
      navigation.navigate('OnboardingCompletion', { planId });
    } catch (error) {
      console.error('Error creating plan from template:', error);
      Alert.alert('Error', 'Failed to create workout plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const displayedTemplates = templates.filter(template => 
    (!selectedDifficulty || template.difficulty === selectedDifficulty) &&
    (!selectedCategory || template.category === selectedCategory)
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading templates...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Choose a Template
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Pick from professionally designed workout routines
          </Text>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          {/* Difficulty Filter */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterTitle, { color: theme.colors.text }]}>
              Difficulty Level:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  !selectedDifficulty && styles.activeFilterChip,
                  { 
                    backgroundColor: !selectedDifficulty ? theme.colors.primary : theme.colors.surface,
                    borderColor: theme.colors.border 
                  }
                ]}
                onPress={() => setSelectedDifficulty(null)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.filterChipText,
                  { color: !selectedDifficulty ? 'white' : theme.colors.text }
                ]}>
                  All
                </Text>
              </TouchableOpacity>
              {difficultyLevels.map((difficulty) => (
                <TouchableOpacity
                  key={difficulty}
                  style={[
                    styles.filterChip,
                    selectedDifficulty === difficulty && styles.activeFilterChip,
                    { 
                      backgroundColor: selectedDifficulty === difficulty ? theme.colors.primary : theme.colors.surface,
                      borderColor: theme.colors.border 
                    }
                  ]}
                  onPress={() => setSelectedDifficulty(difficulty)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.filterChipText,
                    { color: selectedDifficulty === difficulty ? 'white' : theme.colors.text }
                  ]}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Category Filter */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterTitle, { color: theme.colors.text }]}>
              Category:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  !selectedCategory && styles.activeFilterChip,
                  { 
                    backgroundColor: !selectedCategory ? theme.colors.primary : theme.colors.surface,
                    borderColor: theme.colors.border 
                  }
                ]}
                onPress={() => setSelectedCategory(null)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.filterChipText,
                  { color: !selectedCategory ? 'white' : theme.colors.text }
                ]}>
                  All
                </Text>
              </TouchableOpacity>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterChip,
                    selectedCategory === category && styles.activeFilterChip,
                    { 
                      backgroundColor: selectedCategory === category ? theme.colors.primary : theme.colors.surface,
                      borderColor: theme.colors.border 
                    }
                  ]}
                  onPress={() => setSelectedCategory(category)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.filterChipText,
                    { color: selectedCategory === category ? 'white' : theme.colors.text }
                  ]}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Featured Templates */}
        {!selectedDifficulty && !selectedCategory && featuredTemplates.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              ⭐ Featured Templates
            </Text>
            {featuredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={handleTemplateSelect}
                theme={theme}
              />
            ))}
          </View>
        )}

        {/* All Templates */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {selectedDifficulty || selectedCategory ? 'Filtered Templates' : 'All Templates'}
          </Text>
          {displayedTemplates.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                No templates found with the selected filters.
              </Text>
            </View>
          ) : (
            displayedTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={handleTemplateSelect}
                theme={theme}
              />
            ))
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
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
  filtersContainer: {
    marginBottom: 24,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  activeFilterChip: {
    // Styling is handled inline based on selection
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  templateCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  templateTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  templateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  featuredText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  templateDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  templateMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaText: {
    fontSize: 14,
  },
  exercisePreview: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 12,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  dayPreview: {
    marginBottom: 6,
  },
  dayPreviewName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  exerciseList: {
    fontSize: 13,
    lineHeight: 18,
  },
  moreDays: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});