import * as SQLite from 'expo-sqlite';
import { WorkoutSession, WorkoutSet, UserProfile } from '../types';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initialize() {
    if (this.db) return;
    
    this.db = await SQLite.openDatabaseAsync('gymnotes.db');
    await this.createTables();
  }

  private async createTables() {
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

  async createWorkoutSession(session: Omit<WorkoutSession, 'sets'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.runAsync(
      `INSERT INTO workout_sessions (id, date, title, duration, is_completed, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        session.id,
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

  async getWorkoutSessions(limit = 50): Promise<WorkoutSession[]> {
    if (!this.db) throw new Error('Database not initialized');

    const sessions = await this.db.getAllAsync(
      'SELECT * FROM workout_sessions ORDER BY date DESC LIMIT ?',
      [limit]
    ) as any[];

    const sessionsWithSets = await Promise.all(
      sessions.map(async (session) => {
        const sets = await this.db!.getAllAsync(
          'SELECT * FROM workout_sets WHERE session_id = ? ORDER BY timestamp ASC',
          [session.id]
        ) as any[];

        return {
          id: session.id,
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
        return value;
      });

    await this.db.runAsync(
      `UPDATE user_profile SET ${setClause} WHERE id = ?`,
      [...values, 'default']
    );
  }
}

export const database = new DatabaseService();