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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      bookmark_responses: {
        Row: {
          bookmark_id: string
          cohort_id: string
          created_at: string
          id: string
          is_shared: boolean
          privacy: string
          response_text: string | null
          updated_at: string
          user_id: string
          voice_url: string | null
          week_number: number
        }
        Insert: {
          bookmark_id: string
          cohort_id: string
          created_at?: string
          id?: string
          is_shared?: boolean
          privacy?: string
          response_text?: string | null
          updated_at?: string
          user_id: string
          voice_url?: string | null
          week_number: number
        }
        Update: {
          bookmark_id?: string
          cohort_id?: string
          created_at?: string
          id?: string
          is_shared?: boolean
          privacy?: string
          response_text?: string | null
          updated_at?: string
          user_id?: string
          voice_url?: string | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "bookmark_responses_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      check_ins: {
        Row: {
          checked_in_at: string | null
          display_name: string
          goal_update: string | null
          id: string
          is_anonymous: boolean | null
          profile_id: string | null
          session_id: string | null
          share_goal_publicly: boolean | null
          welcome_note: string | null
        }
        Insert: {
          checked_in_at?: string | null
          display_name: string
          goal_update?: string | null
          id?: string
          is_anonymous?: boolean | null
          profile_id?: string | null
          session_id?: string | null
          share_goal_publicly?: boolean | null
          welcome_note?: string | null
        }
        Update: {
          checked_in_at?: string | null
          display_name?: string
          goal_update?: string | null
          id?: string
          is_anonymous?: boolean | null
          profile_id?: string | null
          session_id?: string | null
          share_goal_publicly?: boolean | null
          welcome_note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_ins_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      cohort_members: {
        Row: {
          cohort_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          cohort_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          cohort_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cohort_members_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      cohorts: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          start_date: string | null
          term: string
          theme: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          start_date?: string | null
          term: string
          theme: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          start_date?: string | null
          term?: string
          theme?: string
        }
        Relationships: []
      }
      commitments: {
        Row: {
          checkin_sentence: string | null
          cohort_id: string
          commitment_text: string | null
          created_at: string
          id: string
          is_locked: boolean
          measure_text: string | null
          obstacle_text: string | null
          updated_at: string
          user_id: string
          week_number: number
          why_text: string | null
        }
        Insert: {
          checkin_sentence?: string | null
          cohort_id: string
          commitment_text?: string | null
          created_at?: string
          id?: string
          is_locked?: boolean
          measure_text?: string | null
          obstacle_text?: string | null
          updated_at?: string
          user_id: string
          week_number: number
          why_text?: string | null
        }
        Update: {
          checkin_sentence?: string | null
          cohort_id?: string
          commitment_text?: string | null
          created_at?: string
          id?: string
          is_locked?: boolean
          measure_text?: string | null
          obstacle_text?: string | null
          updated_at?: string
          user_id?: string
          week_number?: number
          why_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commitments_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      domain_scores: {
        Row: {
          cohort_id: string
          created_at: string
          domain_name: string
          id: string
          score: number
          updated_at: string
          user_id: string
          week_number: number
        }
        Insert: {
          cohort_id: string
          created_at?: string
          domain_name: string
          id?: string
          score: number
          updated_at?: string
          user_id: string
          week_number: number
        }
        Update: {
          cohort_id?: string
          created_at?: string
          domain_name?: string
          id?: string
          score?: number
          updated_at?: string
          user_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "domain_scores_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      entries: {
        Row: {
          answer_text: string | null
          cohort_id: string
          created_at: string
          id: string
          is_locked: boolean
          is_shared: boolean
          photo_url: string | null
          question_key: string
          updated_at: string
          user_id: string
          week_number: number
        }
        Insert: {
          answer_text?: string | null
          cohort_id: string
          created_at?: string
          id?: string
          is_locked?: boolean
          is_shared?: boolean
          photo_url?: string | null
          question_key: string
          updated_at?: string
          user_id: string
          week_number: number
        }
        Update: {
          answer_text?: string | null
          cohort_id?: string
          created_at?: string
          id?: string
          is_locked?: boolean
          is_shared?: boolean
          photo_url?: string | null
          question_key?: string
          updated_at?: string
          user_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "entries_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      framework_steps: {
        Row: {
          created_at: string | null
          description: string | null
          duration: number
          id: string
          name: string
          step_order: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration?: number
          id?: string
          name?: string
          step_order: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration?: number
          id?: string
          name?: string
          step_order?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      implementation_checkins: {
        Row: {
          cohort_id: string
          created_at: string
          did_achieve: string | null
          id: string
          status: string
          updated_at: string
          user_id: string
          week_number: number
          what_happened: string | null
          what_learned: string | null
        }
        Insert: {
          cohort_id: string
          created_at?: string
          did_achieve?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id: string
          week_number: number
          what_happened?: string | null
          what_learned?: string | null
        }
        Update: {
          cohort_id?: string
          created_at?: string
          did_achieve?: string | null
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
          week_number?: number
          what_happened?: string | null
          what_learned?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "implementation_checkins_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      implementation_goals: {
        Row: {
          checkin_notes: string | null
          checkin_status: string | null
          created_at: string
          how_i_will_know: string | null
          id: string
          member_id: string
          session_id: string | null
          shared_with_group: boolean
          status: string
          updated_at: string
          what_i_will_implement: string | null
          why_it_matters: string | null
        }
        Insert: {
          checkin_notes?: string | null
          checkin_status?: string | null
          created_at?: string
          how_i_will_know?: string | null
          id?: string
          member_id: string
          session_id?: string | null
          shared_with_group?: boolean
          status?: string
          updated_at?: string
          what_i_will_implement?: string | null
          why_it_matters?: string | null
        }
        Update: {
          checkin_notes?: string | null
          checkin_status?: string | null
          created_at?: string
          how_i_will_know?: string | null
          id?: string
          member_id?: string
          session_id?: string | null
          shared_with_group?: boolean
          status?: string
          updated_at?: string
          what_i_will_implement?: string | null
          why_it_matters?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "implementation_goals_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      kids_sessions: {
        Row: {
          activity_description: string | null
          activity_type: string | null
          age_group: string
          created_at: string | null
          facilitator_notes: string | null
          id: string
          lesson_theme: string | null
          materials_needed: string | null
          parent_session_id: string | null
          video_title: string | null
          video_url: string | null
        }
        Insert: {
          activity_description?: string | null
          activity_type?: string | null
          age_group: string
          created_at?: string | null
          facilitator_notes?: string | null
          id?: string
          lesson_theme?: string | null
          materials_needed?: string | null
          parent_session_id?: string | null
          video_title?: string | null
          video_url?: string | null
        }
        Update: {
          activity_description?: string | null
          activity_type?: string | null
          age_group?: string
          created_at?: string | null
          facilitator_notes?: string | null
          id?: string
          lesson_theme?: string | null
          materials_needed?: string | null
          parent_session_id?: string | null
          video_title?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kids_sessions_parent_session_id_fkey"
            columns: ["parent_session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age_group: string | null
          avatar_url: string | null
          cohort: string | null
          created_at: string
          display_name: string
          email: string | null
          id: string
          is_active: boolean
          is_admin: boolean | null
          name: string
          nfc_id: string | null
          onboarding_complete: boolean | null
          opt_in_public_goals: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age_group?: string | null
          avatar_url?: string | null
          cohort?: string | null
          created_at?: string
          display_name?: string
          email?: string | null
          id?: string
          is_active?: boolean
          is_admin?: boolean | null
          name?: string
          nfc_id?: string | null
          onboarding_complete?: boolean | null
          opt_in_public_goals?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age_group?: string | null
          avatar_url?: string | null
          cohort?: string | null
          created_at?: string
          display_name?: string
          email?: string | null
          id?: string
          is_active?: boolean
          is_admin?: boolean | null
          name?: string
          nfc_id?: string | null
          onboarding_complete?: boolean | null
          opt_in_public_goals?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      session_bookmarks: {
        Row: {
          created_at: string
          id: string
          is_final_reflection: boolean
          label: string
          question: string
          session_id: string
          sort_order: number
          timestamp_label: string | null
          timestamp_seconds: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_final_reflection?: boolean
          label?: string
          question?: string
          session_id: string
          sort_order?: number
          timestamp_label?: string | null
          timestamp_seconds?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_final_reflection?: boolean
          label?: string
          question?: string
          session_id?: string
          sort_order?: number
          timestamp_label?: string | null
          timestamp_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "session_bookmarks_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          admin_notes: string | null
          age_group: string | null
          ai_questions: Json | null
          cohort_id: string | null
          created_at: string
          description: string | null
          id: string
          podcast_guest: string | null
          podcast_title: string | null
          podcast_url: string | null
          session_date: string | null
          session_number: number
          status: string
          theme: string | null
          title: string
          updated_at: string
          video_title: string | null
          video_transcript: string | null
          video_url: string | null
          youtube_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          age_group?: string | null
          ai_questions?: Json | null
          cohort_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          podcast_guest?: string | null
          podcast_title?: string | null
          podcast_url?: string | null
          session_date?: string | null
          session_number: number
          status?: string
          theme?: string | null
          title?: string
          updated_at?: string
          video_title?: string | null
          video_transcript?: string | null
          video_url?: string | null
          youtube_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          age_group?: string | null
          ai_questions?: Json | null
          cohort_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          podcast_guest?: string | null
          podcast_title?: string | null
          podcast_url?: string | null
          session_date?: string | null
          session_number?: number
          status?: string
          theme?: string | null
          title?: string
          updated_at?: string
          video_title?: string | null
          video_transcript?: string | null
          video_url?: string | null
          youtube_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workbook_entries: {
        Row: {
          accountability_person: string | null
          action_step: string | null
          arriving_word: string | null
          completed_at: string | null
          created_at: string | null
          first_impression: string | null
          goal_update_from_last_week: string | null
          id: string
          key_idea: string | null
          leaving_word: string | null
          personal_application: string | null
          profile_id: string | null
          question_1_response: string | null
          question_1_text: string | null
          question_2_response: string | null
          question_2_text: string | null
          question_3_response: string | null
          question_3_text: string | null
          session_id: string | null
          share_leaving_word: boolean | null
          weekly_goal: string | null
        }
        Insert: {
          accountability_person?: string | null
          action_step?: string | null
          arriving_word?: string | null
          completed_at?: string | null
          created_at?: string | null
          first_impression?: string | null
          goal_update_from_last_week?: string | null
          id?: string
          key_idea?: string | null
          leaving_word?: string | null
          personal_application?: string | null
          profile_id?: string | null
          question_1_response?: string | null
          question_1_text?: string | null
          question_2_response?: string | null
          question_2_text?: string | null
          question_3_response?: string | null
          question_3_text?: string | null
          session_id?: string | null
          share_leaving_word?: boolean | null
          weekly_goal?: string | null
        }
        Update: {
          accountability_person?: string | null
          action_step?: string | null
          arriving_word?: string | null
          completed_at?: string | null
          created_at?: string | null
          first_impression?: string | null
          goal_update_from_last_week?: string | null
          id?: string
          key_idea?: string | null
          leaving_word?: string | null
          personal_application?: string | null
          profile_id?: string | null
          question_1_response?: string | null
          question_1_text?: string | null
          question_2_response?: string | null
          question_2_text?: string | null
          question_3_response?: string | null
          question_3_text?: string | null
          session_id?: string | null
          share_leaving_word?: boolean | null
          weekly_goal?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workbook_entries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workbook_entries_session_id_fkey"
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "member" | "facilitator"
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
    Enums: {
      app_role: ["member", "facilitator"],
    },
  },
} as const
