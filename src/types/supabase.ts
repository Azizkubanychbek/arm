export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          role: 'teacher' | 'student'
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          role: 'teacher' | 'student'
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: 'teacher' | 'student'
          created_at?: string
        }
      }
      tests: {
        Row: {
          id: string
          title: string
          description: string
          topic: string
          difficulty: 'easy' | 'medium' | 'hard'
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          topic: string
          difficulty: 'easy' | 'medium' | 'hard'
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          topic?: string
          difficulty?: 'easy' | 'medium' | 'hard'
          created_by?: string
          created_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          test_id: string
          text: string
          options: string[]
          correct_option: number
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          test_id: string
          text: string
          options: string[]
          correct_option: number
          order: number
          created_at?: string
        }
        Update: {
          id?: string
          test_id?: string
          text?: string
          options?: string[]
          correct_option?: number
          order?: number
          created_at?: string
        }
      }
      test_results: {
        Row: {
          id: string
          test_id: string
          user_id: string
          score: number
          max_score: number
          answers: Json
          completed_at: string
          method: 'online' | 'offline'
        }
        Insert: {
          id?: string
          test_id: string
          user_id: string
          score: number
          max_score: number
          answers: Json
          completed_at?: string
          method: 'online' | 'offline'
        }
        Update: {
          id?: string
          test_id?: string
          user_id?: string
          score?: number
          max_score?: number
          answers?: Json
          completed_at?: string
          method?: 'online' | 'offline'
        }
      }
    }
  }
}