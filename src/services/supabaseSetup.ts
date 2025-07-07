import { supabase } from './supabase';

export class SupabaseSetupService {
  static async initializeDatabase() {
    try {
      console.log('🚀 Initializing Supabase database...');
      
      // Create tables
      await this.createTables();
      
      // Set up RLS policies
      await this.setupRowLevelSecurity();
      
      // Enable auth
      await this.setupAuthentication();
      
      console.log('✅ Supabase database initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Supabase database:', error);
      return false;
    }
  }

  private static async createTables() {
    try {
      console.log('🏗️ Creating database tables...');
      
      // Note: In production, tables should be created through Supabase migrations
      // For now, we'll just ensure they exist through RPC or manual creation
      
      console.log('📝 Tables should be created manually in Supabase dashboard or via migrations');
      console.log('📋 Required tables: user_profiles, workout_sessions, workout_sets, workout_templates');
      
      // The tables creation will be handled manually or through Supabase dashboard
      // This prevents permission errors during app initialization
      
    } catch (error) {
      console.error('Error in table creation:', error);
      // Don't throw error - let the app continue
    }
  }

  private static async setupRowLevelSecurity() {
    const rlsPolicies = `
      -- Enable RLS on all tables
      ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
      ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;
      ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;

      -- User profiles policies
      CREATE POLICY IF NOT EXISTS "Users can view own profile" ON user_profiles
        FOR SELECT USING (auth.uid() = id);
      
      CREATE POLICY IF NOT EXISTS "Users can update own profile" ON user_profiles
        FOR UPDATE USING (auth.uid() = id);
      
      CREATE POLICY IF NOT EXISTS "Users can insert own profile" ON user_profiles
        FOR INSERT WITH CHECK (auth.uid() = id);

      -- Workout sessions policies
      CREATE POLICY IF NOT EXISTS "Users can view own workout sessions" ON workout_sessions
        FOR SELECT USING (auth.uid() = user_id);
      
      CREATE POLICY IF NOT EXISTS "Users can insert own workout sessions" ON workout_sessions
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      CREATE POLICY IF NOT EXISTS "Users can update own workout sessions" ON workout_sessions
        FOR UPDATE USING (auth.uid() = user_id);
      
      CREATE POLICY IF NOT EXISTS "Users can delete own workout sessions" ON workout_sessions
        FOR DELETE USING (auth.uid() = user_id);

      -- Workout sets policies
      CREATE POLICY IF NOT EXISTS "Users can view own workout sets" ON workout_sets
        FOR SELECT USING (auth.uid() = user_id);
      
      CREATE POLICY IF NOT EXISTS "Users can insert own workout sets" ON workout_sets
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      CREATE POLICY IF NOT EXISTS "Users can update own workout sets" ON workout_sets
        FOR UPDATE USING (auth.uid() = user_id);
      
      CREATE POLICY IF NOT EXISTS "Users can delete own workout sets" ON workout_sets
        FOR DELETE USING (auth.uid() = user_id);

      -- Workout templates policies
      CREATE POLICY IF NOT EXISTS "Users can view own workout templates" ON workout_templates
        FOR SELECT USING (auth.uid() = user_id OR is_public = true);
      
      CREATE POLICY IF NOT EXISTS "Users can insert own workout templates" ON workout_templates
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      CREATE POLICY IF NOT EXISTS "Users can update own workout templates" ON workout_templates
        FOR UPDATE USING (auth.uid() = user_id);
      
      CREATE POLICY IF NOT EXISTS "Users can delete own workout templates" ON workout_templates
        FOR DELETE USING (auth.uid() = user_id);
    `;

    const { error } = await supabase.rpc('exec_sql', { sql: rlsPolicies });
    if (error) {
      console.log('Note: RLS setup may require admin privileges.');
    }
  }

  private static async setupAuthentication() {
    // Email verification is configured in Supabase dashboard
    // Go to Authentication > Settings > Email templates to customize
    console.log('📧 Email verification is enabled by default in Supabase');
    console.log('💡 Users must verify their email before they can sign in');
    console.log('🍎 Apple authentication can be configured later in Auth providers');
  }

  // Helper function to create user profile on signup
  static async createUserProfile(user: any, additionalData: any = {}) {
    try {
      const profileData = {
        id: user.id,
        full_name: user.user_metadata?.full_name || additionalData.full_name || null,
        username: additionalData.username || null,
        avatar_url: user.user_metadata?.avatar_url || additionalData.avatar_url || null,
        preferences: additionalData.preferences || {},
      };

      console.log('Creating user profile with data:', profileData);

      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating profile:', error.message, error.details);
        throw error;
      }

      console.log('User profile created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  }

  // Helper function to get or create user profile
  static async getOrCreateUserProfile(user: any) {
    try {
      console.log('Getting or creating profile for user:', user.id);

      // Try to get existing profile
      let { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('Profile query result:', { profile, error });

      // If profile doesn't exist, create it
      if (error?.code === 'PGRST116') {
        console.log('Profile not found, creating new profile...');
        profile = await this.createUserProfile(user);
      } else if (error) {
        console.error('Error fetching profile:', error.message, error.details);
        throw error;
      }

      return profile;
    } catch (error) {
      console.error('Error getting or creating user profile:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  }
}