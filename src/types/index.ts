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
  date: Date;
  title?: string;
  sets: WorkoutSet[];
  duration?: number;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  name?: string;
  currentStreak: number;
  longestStreak: number;
  totalWorkouts: number;
  createdAt: Date;
  isPro: boolean;
}

export interface AppTheme {
  isDark: boolean;
  colors: {
    primary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
  };
}

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  WorkoutInput: { sessionId?: string };
  Settings: undefined;
};

export type MainTabParamList = {
  Workouts: undefined;
  Progress: undefined;
  Profile: undefined;
};