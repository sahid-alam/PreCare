export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
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
      medication_reminders: {
        Row: {
          active: boolean
          created_at: string
          dose: string | null
          id: number
          name: string
          patient_id: string
          times: string[]
        }
        Insert: {
          active?: boolean
          created_at?: string
          dose?: string | null
          id?: number
          name: string
          patient_id: string
          times?: string[]
        }
        Update: {
          active?: boolean
          created_at?: string
          dose?: string | null
          id?: number
          name?: string
          patient_id?: string
          times?: string[]
        }
        Relationships: []
      }
      patient_profiles: {
        Row: {
          age: number | null
          blood_sugar: string | null
          created_at: string
          current_medications: string | null
          email: string | null
          gender: string | null
          id: string
          known_allergies: string | null
          known_conditions: string[] | null
          last_bp: string | null
          updated_at: string
        }
        Insert: {
          age?: number | null
          blood_sugar?: string | null
          created_at?: string
          current_medications?: string | null
          email?: string | null
          gender?: string | null
          id: string
          known_allergies?: string | null
          known_conditions?: string[] | null
          last_bp?: string | null
          updated_at?: string
        }
        Update: {
          age?: number | null
          blood_sugar?: string | null
          created_at?: string
          current_medications?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          known_allergies?: string | null
          known_conditions?: string[] | null
          last_bp?: string | null
          updated_at?: string
        }
        Relationships: []
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
          patient_id: string | null
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
          patient_id?: string | null
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
          patient_id?: string | null
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
