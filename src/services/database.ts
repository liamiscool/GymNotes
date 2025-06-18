import * as SQLite from 'expo-sqlite';
import { WorkoutSession, WorkoutSet, UserProfile, WorkoutPlan, Exercise, WorkoutTemplate } from '../types';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initialize() {
    if (this.db) return;
    
    this.db = await SQLite.openDatabaseAsync('gymnotes.db');
    await this.runMigrations();
  }

  private async runMigrations() {
    if (!this.db) return;

    // Create schema_version table to track migrations
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS schema_version (
        version INTEGER PRIMARY KEY
      );
    `);

    // Get current schema version
    const result = await this.db.getFirstAsync('SELECT version FROM schema_version') as any;
    const currentVersion = result?.version || 0;

    if (currentVersion < 1) {
      await this.migration1_initial();
    }

    if (currentVersion < 2) {
      await this.migration2_add_workout_plans();
    }

    if (currentVersion < 3) {
      await this.migration3_add_last_selected_plan();
    }

    if (currentVersion < 4) {
      await this.migration4_add_exercises_and_templates();
    }

    // Update schema version
    await this.db.runAsync(
      'INSERT OR REPLACE INTO schema_version (version) VALUES (?)',
      [4]
    );
  }

  private async migration1_initial() {
    if (!this.db) return;

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_profile (
        id TEXT PRIMARY KEY,
        name TEXT,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        total_workouts INTEGER DEFAULT 0,
        is_pro BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS workout_sessions (
        id TEXT PRIMARY KEY,
        date DATE NOT NULL,
        title TEXT,
        duration INTEGER,
        is_completed BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS workout_sets (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        exercise TEXT NOT NULL,
        sets INTEGER NOT NULL,
        reps INTEGER NOT NULL,
        weight REAL,
        notes TEXT,
        rpe INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES workout_sessions (id)
      );
    `);

    // Create default user profile if it doesn't exist
    await this.db.runAsync(
      'INSERT OR IGNORE INTO user_profile (id) VALUES (?)',
      ['default']
    );
  }

  private async migration2_add_workout_plans() {
    if (!this.db) return;

    // Create workout_plans table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS workout_plans (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add plan_id column to workout_sessions
    try {
      await this.db.execAsync(`
        ALTER TABLE workout_sessions ADD COLUMN plan_id TEXT;
      `);
    } catch (error) {
      // Column might already exist, that's ok
      console.log('plan_id column already exists');
    }

    // Create default workout plan
    await this.db.runAsync(
      'INSERT OR IGNORE INTO workout_plans (id, name, description) VALUES (?, ?, ?)',
      ['default', 'My Workouts', 'Default workout plan']
    );

    // Update existing sessions to use default plan
    await this.db.runAsync(
      'UPDATE workout_sessions SET plan_id = ? WHERE plan_id IS NULL',
      ['default']
    );

    // Create index for better query performance
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_workout_sessions_plan_id ON workout_sessions (plan_id);
    `);
  }

  private async migration3_add_last_selected_plan() {
    if (!this.db) return;

    // Add last_selected_plan_id column to user_profile
    try {
      await this.db.execAsync(`
        ALTER TABLE user_profile ADD COLUMN last_selected_plan_id TEXT;
      `);
    } catch (error) {
      // Column might already exist, that's ok
      console.log('last_selected_plan_id column already exists');
    }
  }

  private async migration4_add_exercises_and_templates() {
    if (!this.db) return;

    // Create exercises table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS exercises (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        muscle_groups TEXT NOT NULL,
        equipment TEXT,
        instructions TEXT,
        difficulty TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create workout templates table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS workout_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        days_per_week INTEGER,
        template_data TEXT NOT NULL,
        is_featured BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add onboarding_completed column to user_profile
    try {
      await this.db.execAsync(`
        ALTER TABLE user_profile ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
      `);
    } catch (error) {
      console.log('onboarding_completed column already exists');
    }

    // Create indexes for better performance
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises (category);
    `);
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_workout_templates_category ON workout_templates (category);
    `);
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_workout_templates_difficulty ON workout_templates (difficulty);
    `);

    // Seed initial exercise data
    await this.seedInitialExercises();
    
    // Seed initial workout templates
    await this.seedInitialTemplates();
  }


  async createWorkoutSession(session: Omit<WorkoutSession, 'sets'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.runAsync(
      `INSERT INTO workout_sessions (id, plan_id, date, title, duration, is_completed, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        session.id,
        session.planId,
        session.date.toISOString(),
        session.title || null,
        session.duration || null,
        session.isCompleted ? 1 : 0,
        session.createdAt.toISOString(),
        session.updatedAt.toISOString(),
      ]
    );

    return session.id;
  }

  async addWorkoutSet(set: WorkoutSet, sessionId: string): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      `INSERT INTO workout_sets (id, session_id, exercise, sets, reps, weight, notes, rpe, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        set.id,
        sessionId,
        set.exercise,
        set.sets,
        set.reps,
        set.weight || null,
        set.notes || null,
        set.rpe || null,
        set.timestamp.toISOString(),
      ]
    );

    return set.id;
  }

  async getWorkoutSessions(planId?: string, limit = 50): Promise<WorkoutSession[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = planId 
      ? 'SELECT * FROM workout_sessions WHERE plan_id = ? ORDER BY date DESC LIMIT ?'
      : 'SELECT * FROM workout_sessions ORDER BY date DESC LIMIT ?';
    
    const params = planId ? [planId, limit] : [limit];
    
    const sessions = await this.db.getAllAsync(query, params) as any[];

    const sessionsWithSets = await Promise.all(
      sessions.map(async (session) => {
        const sets = await this.db!.getAllAsync(
          'SELECT * FROM workout_sets WHERE session_id = ? ORDER BY timestamp ASC',
          [session.id]
        ) as any[];

        return {
          id: session.id,
          planId: session.plan_id,
          date: new Date(session.date),
          title: session.title,
          duration: session.duration,
          isCompleted: session.is_completed === 1,
          createdAt: new Date(session.created_at),
          updatedAt: new Date(session.updated_at),
          sets: sets.map(set => ({
            id: set.id,
            exercise: set.exercise,
            sets: set.sets,
            reps: set.reps,
            weight: set.weight,
            notes: set.notes,
            rpe: set.rpe,
            timestamp: new Date(set.timestamp),
          })),
        };
      })
    );

    return sessionsWithSets;
  }

  async getUserProfile(): Promise<UserProfile> {
    if (!this.db) throw new Error('Database not initialized');

    const profile = await this.db.getFirstAsync(
      'SELECT * FROM user_profile WHERE id = ?',
      ['default']
    ) as any;

    return {
      id: profile.id,
      name: profile.name,
      currentStreak: profile.current_streak,
      longestStreak: profile.longest_streak,
      totalWorkouts: profile.total_workouts,
      lastSelectedPlanId: profile.last_selected_plan_id,
      isPro: profile.is_pro === 1,
      createdAt: new Date(profile.created_at),
    };
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const setClause = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'createdAt')
      .map(key => {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        return `${dbKey} = ?`;
      })
      .join(', ');

    const values = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'createdAt')
      .map(key => {
        const value = updates[key as keyof UserProfile];
        if (typeof value === 'boolean') return value ? 1 : 0;
        if (value instanceof Date) return value.toISOString();
        return value;
      })
      .filter(value => value !== undefined) as (string | number)[];

    await this.db.runAsync(
      `UPDATE user_profile SET ${setClause} WHERE id = ?`,
      [...values, 'default']
    );
  }

  // Workout Plans methods
  async getWorkoutPlans(): Promise<WorkoutPlan[]> {
    if (!this.db) throw new Error('Database not initialized');

    const plans = await this.db.getAllAsync(
      'SELECT * FROM workout_plans WHERE is_active = 1 ORDER BY created_at ASC'
    ) as any[];

    return plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      isActive: plan.is_active === 1,
      createdAt: new Date(plan.created_at),
      updatedAt: new Date(plan.updated_at),
    }));
  }

  async createWorkoutPlan(plan: Omit<WorkoutPlan, 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    
    await this.db.runAsync(
      `INSERT INTO workout_plans (id, name, description, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        plan.id,
        plan.name,
        plan.description || null,
        plan.isActive ? 1 : 0,
        now,
        now,
      ]
    );

    return plan.id;
  }

  async updateWorkoutPlan(id: string, updates: Partial<Pick<WorkoutPlan, 'name' | 'description' | 'isActive'>>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const setClause = Object.keys(updates)
      .map(key => {
        const dbKey = key === 'isActive' ? 'is_active' : key;
        return `${dbKey} = ?`;
      })
      .join(', ');

    const values = Object.keys(updates).map(key => {
      const value = updates[key as keyof typeof updates];
      if (typeof value === 'boolean') return value ? 1 : 0;
      return value;
    }).filter(value => value !== undefined);

    await this.db.runAsync(
      `UPDATE workout_plans SET ${setClause}, updated_at = ? WHERE id = ?`,
      [...values, new Date().toISOString(), id]
    );
  }

  async deleteWorkoutPlan(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Don't allow deletion of default plan
    if (id === 'default') {
      throw new Error('Cannot delete default workout plan');
    }

    // Move all sessions from this plan to default plan
    await this.db.runAsync(
      'UPDATE workout_sessions SET plan_id = ? WHERE plan_id = ?',
      ['default', id]
    );

    // Mark plan as inactive instead of deleting
    await this.db.runAsync(
      'UPDATE workout_plans SET is_active = 0, updated_at = ? WHERE id = ?',
      [new Date().toISOString(), id]
    );
  }

  async getWorkoutPlan(id: string): Promise<WorkoutPlan | null> {
    if (!this.db) throw new Error('Database not initialized');

    const plan = await this.db.getFirstAsync(
      'SELECT * FROM workout_plans WHERE id = ? AND is_active = 1',
      [id]
    ) as any;

    if (!plan) return null;

    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      isActive: plan.is_active === 1,
      createdAt: new Date(plan.created_at),
      updatedAt: new Date(plan.updated_at),
    };
  }

  async setLastSelectedPlan(planId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      'UPDATE user_profile SET last_selected_plan_id = ? WHERE id = ?',
      [planId, 'default']
    );
  }

  async getLastSelectedPlan(): Promise<string | null> {
    if (!this.db) throw new Error('Database not initialized');

    const profile = await this.getUserProfile();
    return profile.lastSelectedPlanId || null;
  }

  // Onboarding methods
  async isOnboardingCompleted(): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    const profile = await this.getUserProfile();
    return profile.onboardingCompleted || false;
  }

  async setOnboardingCompleted(completed: boolean = true): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.updateUserProfile({ onboardingCompleted: completed });
  }

  // Exercise database methods
  async getExercises(category?: string): Promise<Exercise[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = category 
      ? 'SELECT * FROM exercises WHERE category = ? ORDER BY name ASC'
      : 'SELECT * FROM exercises ORDER BY name ASC';
    
    const params = category ? [category] : [];
    const exercises = await this.db.getAllAsync(query, params) as any[];

    return exercises.map(exercise => ({
      id: exercise.id,
      name: exercise.name,
      category: exercise.category,
      muscleGroups: JSON.parse(exercise.muscle_groups),
      equipment: exercise.equipment,
      instructions: exercise.instructions,
      difficulty: exercise.difficulty as 'beginner' | 'intermediate' | 'advanced',
      createdAt: new Date(exercise.created_at),
    }));
  }

  async searchExercises(query: string, limit = 10): Promise<Exercise[]> {
    if (!this.db) throw new Error('Database not initialized');

    const exercises = await this.db.getAllAsync(
      'SELECT * FROM exercises WHERE name LIKE ? ORDER BY name ASC LIMIT ?',
      [`%${query}%`, limit]
    ) as any[];

    return exercises.map(exercise => ({
      id: exercise.id,
      name: exercise.name,
      category: exercise.category,
      muscleGroups: JSON.parse(exercise.muscle_groups),
      equipment: exercise.equipment,
      instructions: exercise.instructions,
      difficulty: exercise.difficulty as 'beginner' | 'intermediate' | 'advanced',
      createdAt: new Date(exercise.created_at),
    }));
  }

  // Workout template methods
  async getWorkoutTemplates(category?: string, difficulty?: string): Promise<WorkoutTemplate[]> {
    if (!this.db) throw new Error('Database not initialized');

    let query = 'SELECT * FROM workout_templates WHERE 1=1';
    const params: any[] = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (difficulty) {
      query += ' AND difficulty = ?';
      params.push(difficulty);
    }

    query += ' ORDER BY is_featured DESC, name ASC';

    const templates = await this.db.getAllAsync(query, params) as any[];

    return templates.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      difficulty: template.difficulty as 'beginner' | 'intermediate' | 'advanced',
      daysPerWeek: template.days_per_week,
      templateData: JSON.parse(template.template_data),
      isFeatured: template.is_featured === 1,
      createdAt: new Date(template.created_at),
    }));
  }

  async getFeaturedTemplates(): Promise<WorkoutTemplate[]> {
    if (!this.db) throw new Error('Database not initialized');

    const templates = await this.db.getAllAsync(
      'SELECT * FROM workout_templates WHERE is_featured = 1 ORDER BY name ASC'
    ) as any[];

    return templates.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      difficulty: template.difficulty as 'beginner' | 'intermediate' | 'advanced',
      daysPerWeek: template.days_per_week,
      templateData: JSON.parse(template.template_data),
      isFeatured: template.is_featured === 1,
      createdAt: new Date(template.created_at),
    }));
  }

  // Seed methods
  private async seedInitialExercises() {
    if (!this.db) return;

    const exercises = [
      {
        id: 'bench_press',
        name: 'Bench Press',
        category: 'chest',
        muscleGroups: ['chest', 'triceps', 'shoulders'],
        equipment: 'barbell',
        instructions: 'Lie on bench, grip bar slightly wider than shoulders, lower to chest, press up',
        difficulty: 'intermediate'
      },
      {
        id: 'squat',
        name: 'Squat',
        category: 'legs',
        muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
        equipment: 'barbell',
        instructions: 'Stand with bar on shoulders, feet shoulder-width apart, squat down, return to standing',
        difficulty: 'intermediate'
      },
      {
        id: 'deadlift',
        name: 'Deadlift',
        category: 'legs',
        muscleGroups: ['hamstrings', 'glutes', 'back'],
        equipment: 'barbell',
        instructions: 'Stand with bar over feet, bend at hips and knees, lift bar by extending hips and knees',
        difficulty: 'advanced'
      },
      {
        id: 'overhead_press',
        name: 'Overhead Press',
        category: 'shoulders',
        muscleGroups: ['shoulders', 'triceps', 'core'],
        equipment: 'barbell',
        instructions: 'Stand with bar at shoulders, press bar overhead, lower with control',
        difficulty: 'intermediate'
      },
      {
        id: 'pull_ups',
        name: 'Pull-ups',
        category: 'back',
        muscleGroups: ['back', 'biceps'],
        equipment: 'bodyweight',
        instructions: 'Hang from bar, pull body up until chin over bar, lower with control',
        difficulty: 'intermediate'
      },
      {
        id: 'push_ups',
        name: 'Push-ups',
        category: 'chest',
        muscleGroups: ['chest', 'triceps', 'shoulders'],
        equipment: 'bodyweight',
        instructions: 'Start in plank position, lower body to ground, push back up',
        difficulty: 'beginner'
      }
    ];

    for (const exercise of exercises) {
      await this.db.runAsync(
        `INSERT OR IGNORE INTO exercises (id, name, category, muscle_groups, equipment, instructions, difficulty)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          exercise.id,
          exercise.name,
          exercise.category,
          JSON.stringify(exercise.muscleGroups),
          exercise.equipment,
          exercise.instructions,
          exercise.difficulty
        ]
      );
    }
  }

  private async seedInitialTemplates() {
    if (!this.db) return;

    const templates = [
      {
        id: 'ppl_beginner',
        name: 'Push Pull Legs (Beginner)',
        description: 'Classic 3-day split focusing on compound movements',
        category: 'strength',
        difficulty: 'beginner',
        daysPerWeek: 3,
        isFeatured: true,
        templateData: {
          days: [
            {
              name: 'Push Day',
              exercises: [
                { name: 'Bench Press', sets: 3, reps: 8 },
                { name: 'Overhead Press', sets: 3, reps: 10 },
                { name: 'Push-ups', sets: 2, reps: 12 }
              ]
            },
            {
              name: 'Pull Day',
              exercises: [
                { name: 'Pull-ups', sets: 3, reps: 6 },
                { name: 'Barbell Row', sets: 3, reps: 8 }
              ]
            },
            {
              name: 'Leg Day',
              exercises: [
                { name: 'Squat', sets: 3, reps: 8 },
                { name: 'Deadlift', sets: 3, reps: 5 }
              ]
            }
          ]
        }
      },
      {
        id: 'full_body_beginner',
        name: 'Full Body Beginner',
        description: 'Simple full body routine perfect for beginners',
        category: 'strength',
        difficulty: 'beginner',
        daysPerWeek: 3,
        isFeatured: true,
        templateData: {
          days: [
            {
              name: 'Full Body',
              exercises: [
                { name: 'Squat', sets: 3, reps: 10 },
                { name: 'Bench Press', sets: 3, reps: 8 },
                { name: 'Barbell Row', sets: 3, reps: 8 },
                { name: 'Overhead Press', sets: 2, reps: 10 },
                { name: 'Push-ups', sets: 2, reps: 12 }
              ]
            }
          ]
        }
      }
    ];

    for (const template of templates) {
      await this.db.runAsync(
        `INSERT OR IGNORE INTO workout_templates (id, name, description, category, difficulty, days_per_week, template_data, is_featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          template.id,
          template.name,
          template.description,
          template.category,
          template.difficulty,
          template.daysPerWeek,
          JSON.stringify(template.templateData),
          template.isFeatured ? 1 : 0
        ]
      );
    }
  }
}

export const database = new DatabaseService();