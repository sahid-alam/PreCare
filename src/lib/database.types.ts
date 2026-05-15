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
      audit_log: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: number
          session_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: number
          session_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: number
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          chief_complaint: string | null
          created_at: string
          duration_seconds: number | null
          ended_at: string | null
          final_tier: string | null
          id: string
          language: string
          patient_age: number | null
          patient_gender: string | null
          reasoning: string | null
          recommended_actions: Json | null
          red_flag_categories: Json | null
          red_flag_triggered: boolean
          started_at: string
          status: string
          vapi_call_id: string | null
        }
        Insert: {
          chief_complaint?: string | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          final_tier?: string | null
          id?: string
          language?: string
          patient_age?: number | null
          patient_gender?: string | null
          reasoning?: string | null
          recommended_actions?: Json | null
          red_flag_categories?: Json | null
          red_flag_triggered?: boolean
          started_at?: string
          status?: string
          vapi_call_id?: string | null
        }
        Update: {
          chief_complaint?: string | null
          created_at?: string
          duration_seconds?: number | null
          ended_at?: string | null
          final_tier?: string | null
          id?: string
          language?: string
          patient_age?: number | null
          patient_gender?: string | null
          reasoning?: string | null
          recommended_actions?: Json | null
          red_flag_categories?: Json | null
          red_flag_triggered?: boolean
          started_at?: string
          status?: string
          vapi_call_id?: string | null
        }
        Relationships: []
      }
      symptoms: {
        Row: {
          created_at: string
          duration: string | null
          id: number
          name: string
          notes: string | null
          session_id: string
          severity: string | null
        }
        Insert: {
          created_at?: string
          duration?: string | null
          id?: number
          name: string
          notes?: string | null
          session_id: string
          severity?: string | null
        }
        Update: {
          created_at?: string
          duration?: string | null
          id?: number
          name?: string
          notes?: string | null
          session_id?: string
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "symptoms_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      transcripts: {
        Row: {
          content: string
          created_at: string
          id: number
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: number
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          role?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transcripts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
