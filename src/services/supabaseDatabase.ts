import { supabase } from './supabase';
import { SupabaseSetupService } from './supabaseSetup';
import { Database } from '../types/supabase';

type WorkoutSession = Database['public']['Tables']['workout_sessions']['Row'];
type WorkoutSet = Database['public']['Tables']['workout_sets']['Row'];

type InsertWorkoutSession = Database['public']['Tables']['workout_sessions']['Insert'];
type InsertWorkoutSet = Database['public']['Tables']['workout_sets']['Insert'];

export class SupabaseDatabaseService {
  private static initialized = false;
  
  // Export supabase client for direct access when needed
  static supabase = supabase;

  static async initialize() {
    if (this.initialized) return true;

    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('👤 User not authenticated, skipping database initialization');
        return false;
      }

      console.log('🔧 Initializing database for user:', user.id);

      // Initialize database schema
      await SupabaseSetupService.initializeDatabase();
      
      // Don't automatically create profile here - let the profile setup screen handle it
      console.log('📊 Database schema initialized');
      
      this.initialized = true;
      console.log('✅ Supabase database service initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Supabase database service:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return false;
    }
  }

  // Authentication methods
  static async signUpWithEmail(email: string, password: string) {
    try {
      console.log('Attempting signup with email:', email);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // Will use default confirmation URL
        }
      });

      console.log('Signup result:', { data, error });

      if (error) {
        console.error('Supabase signup error:', error.message, error);
        throw error;
      }

      console.log('Signup successful:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Sign up error:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return { success: false, error: error instanceof Error ? error.message : 'Sign up failed' };
    }
  }

  static async signInWithEmail(email: string, password: string) {
    try {
      console.log('Attempting signin with email:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('Signin result:', { data, error });

      if (error) {
        console.error('Supabase signin error:', error.message, error);
        throw error;
      }

      // Initialize database after successful login
      await this.initialize();

      console.log('Signin successful and database initialized');
      return { success: true, data };
    } catch (error) {
      console.error('Sign in error:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return { success: false, error: error instanceof Error ? error.message : 'Sign in failed' };
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      this.initialized = false;
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Sign out failed' };
    }
  }

  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  static async getUserProfile() {
    try {
      const user = await this.getCurrentUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Workout session methods
  static async createWorkoutSession(session: Omit<InsertWorkoutSession, 'user_id'>): Promise<WorkoutSession | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('workout_sessions')
        .insert({
          ...session,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating workout session:', error);
      return null;
    }
  }

  static async getWorkoutSessions(limit = 50): Promise<WorkoutSession[]> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting workout sessions:', error);
      return [];
    }
  }

  static async getWorkoutSession(sessionId: string): Promise<WorkoutSession | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting workout session:', error);
      return null;
    }
  }

  static async updateWorkoutSession(sessionId: string, updates: Partial<WorkoutSession>): Promise<WorkoutSession | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('workout_sessions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating workout session:', error);
      return null;
    }
  }

  // Workout set methods
  static async addWorkoutSet(set: Omit<InsertWorkoutSet, 'user_id'>): Promise<WorkoutSet | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('workout_sets')
        .insert({
          ...set,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding workout set:', error);
      return null;
    }
  }

  static async getWorkoutSets(sessionId: string): Promise<WorkoutSet[]> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('workout_sets')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting workout sets:', error);
      return [];
    }
  }

  static async updateWorkoutSet(setId: string, updates: Partial<WorkoutSet>): Promise<WorkoutSet | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('workout_sets')
        .update(updates)
        .eq('id', setId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating workout set:', error);
      return null;
    }
  }

  static async deleteWorkoutSet(setId: string): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return false;

      const { error } = await supabase
        .from('workout_sets')
        .delete()
        .eq('id', setId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting workout set:', error);
      return false;
    }
  }

  // Exercise history methods
  static async getExerciseHistory(exerciseName: string, limit = 10): Promise<WorkoutSet[]> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('workout_sets')
        .select('*')
        .eq('user_id', user.id)
        .eq('exercise_name', exerciseName)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting exercise history:', error);
      return [];
    }
  }

  static async getRecentExercises(limit = 20): Promise<string[]> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('workout_sets')
        .select('exercise_name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      // Return unique exercise names
      const uniqueExercises = [...new Set(data?.map(item => item.exercise_name) || [])];
      return uniqueExercises;
    } catch (error) {
      console.error('Error getting recent exercises:', error);
      return [];
    }
  }

  // Stats methods
  static async getWorkoutStats(days = 30) {
    try {
      const user = await this.getCurrentUser();
      if (!user) return null;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: sessions, error: sessionError } = await supabase
        .from('workout_sessions')
        .select('id, date, is_completed')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0]);

      if (sessionError) throw sessionError;

      const { data: sets, error: setError } = await supabase
        .from('workout_sets')
        .select('exercise_name, sets, reps, weight')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString());

      if (setError) throw setError;

      const totalSessions = sessions?.length || 0;
      const completedSessions = sessions?.filter(s => s.is_completed).length || 0;
      const totalSets = sets?.reduce((sum, set) => sum + set.sets, 0) || 0;
      const totalReps = sets?.reduce((sum, set) => sum + (set.sets * set.reps), 0) || 0;
      const totalVolume = sets?.reduce((sum, set) => sum + (set.sets * set.reps * (set.weight || 0)), 0) || 0;

      return {
        totalSessions,
        completedSessions,
        totalSets,
        totalReps,
        totalVolume,
        uniqueExercises: [...new Set(sets?.map(s => s.exercise_name) || [])].length
      };
    } catch (error) {
      console.error('Error getting workout stats:', error);
      return null;
    }
  }

  // Real-time subscriptions
  static subscribeToWorkoutSets(sessionId: string, callback: (sets: WorkoutSet[]) => void) {
    return supabase
      .channel(`workout_sets_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workout_sets',
          filter: `session_id=eq.${sessionId}`
        },
        () => {
          // Refresh data when changes occur
          this.getWorkoutSets(sessionId).then(callback);
        }
      )
      .subscribe();
  }

  static subscribeToAuthChanges(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
      
      if (event === 'SIGNED_IN') {
        this.initialize();
      } else if (event === 'SIGNED_OUT') {
        this.initialized = false;
      }
    });
  }
}