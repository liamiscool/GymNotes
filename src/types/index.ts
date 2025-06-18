export interface WorkoutSet {
  id: string;
  exercise: string;
  sets: number;
  reps: number;
  weight?: number;
  notes?: string;
  rpe?: number;
  timestamp: Date;
}

export interface WorkoutSession {
  id: string;
  planId: string;
  date: Date;
  title?: string;
  sets: WorkoutSet[];
  duration?: number;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  name?: string;
  currentStreak: number;
  longestStreak: number;
  totalWorkouts: number;
  lastSelectedPlanId?: string;
  onboardingCompleted?: boolean;
  createdAt: Date;
  isPro: boolean;
}

export interface AppTheme {
  isDark: boolean;
  mode: 'system' | 'light' | 'dark';
  colors: {
    // Core colors
    primary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
    
    // Semantic colors
    success: string;
    warning: string;
    error: string;
    info: string;
    
    // Interactive colors
    buttonBackground: string;
    buttonText: string;
    inputBackground: string;
    placeholderText: string;
    
    // Workout-specific colors
    exerciseBackground: string;
    setCompleted: string;
    setPending: string;
    restBackground: string;
    streakActive: string;
  };
}

export interface ThemeContextValue {
  theme: AppTheme;
  themeMode: 'system' | 'light' | 'dark';
  setThemeMode: (mode: 'system' | 'light' | 'dark') => void;
  toggleTheme: () => void;
  isSystemDark: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroups: string[];
  equipment?: string;
  instructions?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  daysPerWeek: number;
  templateData: {
    days: Array<{
      name: string;
      exercises: Array<{
        name: string;
        sets: number;
        reps: number;
        weight?: number;
      }>;
    }>;
  };
  isFeatured: boolean;
  createdAt: Date;
}

export interface ParsedWorkoutPlan {
  name: string;
  description?: string;
  days: Array<{
    name: string;
    exercises: Array<{
      name: string;
      sets: number;
      reps: number;
      weight?: number;
      notes?: string;
    }>;
  }>;
  estimatedDifficulty: 'beginner' | 'intermediate' | 'advanced';
}

export type OnboardingMethod = 'text_import' | 'template' | 'exercise_builder' | 'manual';

export type RootStackParamList = {
  Onboarding: undefined;
  OnboardingMethodSelection: undefined;
  OnboardingTextImport: undefined;
  OnboardingTemplateSelection: undefined;
  OnboardingExerciseBuilder: undefined;
  OnboardingManualCreation: undefined;
  OnboardingCompletion: { planId: string };
  WorkoutPlans: undefined;
  Workouts: { planId: string; planName: string };
  WorkoutInput: { sessionId?: string; planId?: string };
  Profile: undefined;
  Settings: undefined;
};