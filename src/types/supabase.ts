export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      workout_sessions: {
        Row: {
          id: string
          user_id: string
          name: string | null
          notes: string | null
          date: string
          started_at: string
          completed_at: string | null
          is_completed: boolean
          plan_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string | null
          notes?: string | null
          date?: string
          started_at?: string
          completed_at?: string | null
          is_completed?: boolean
          plan_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string | null
          notes?: string | null
          date?: string
          started_at?: string
          completed_at?: string | null
          is_completed?: boolean
          plan_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workout_sets: {
        Row: {
          id: string
          session_id: string
          user_id: string
          exercise_name: string
          sets: number
          reps: number
          weight: number | null
          unit: string
          rpe: number | null
          notes: string | null
          order_index: number
          completed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          exercise_name: string
          sets: number
          reps: number
          weight?: number | null
          unit?: string
          rpe?: number | null
          notes?: string | null
          order_index?: number
          completed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          exercise_name?: string
          sets?: number
          reps?: number
          weight?: number | null
          unit?: string
          rpe?: number | null
          notes?: string | null
          order_index?: number
          completed_at?: string
          created_at?: string
        }
      }
      workout_templates: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          exercises: Json
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          exercises?: Json
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          exercises?: Json
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      exec_sql: {
        Args: {
          sql: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}