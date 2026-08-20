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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      attendance: {
        Row: {
          attendee_id: string
          created_at: string
          entitlement: string
          id: string
          recorded_by: string | null
          session_credit_id: string | null
          session_date: string
          track: string
          week: number
        }
        Insert: {
          attendee_id: string
          created_at?: string
          entitlement: string
          id?: string
          recorded_by?: string | null
          session_credit_id?: string | null
          session_date: string
          track: string
          week: number
        }
        Update: {
          attendee_id?: string
          created_at?: string
          entitlement?: string
          id?: string
          recorded_by?: string | null
          session_credit_id?: string | null
          session_date?: string
          track?: string
          week?: number
        }
        Relationships: [
          {
            foreignKeyName: "attendance_attendee_id_fkey"
            columns: ["attendee_id"]
            isOneToOne: false
            referencedRelation: "attendees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_session_credit_id_fkey"
            columns: ["session_credit_id"]
            isOneToOne: false
            referencedRelation: "session_credits"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_notifications: {
        Row: {
          body: string
          channel: string
          created_at: string
          destination: string | null
          error: string | null
          event: string
          guardian_profile_id: string
          id: string
          session_date: string
          status: string
          subject_profile_id: string
        }
        Insert: {
          body: string
          channel?: string
          created_at?: string
          destination?: string | null
          error?: string | null
          event: string
          guardian_profile_id: string
          id?: string
          session_date?: string
          status?: string
          subject_profile_id: string
        }
        Update: {
          body?: string
          channel?: string
          created_at?: string
          destination?: string | null
          error?: string | null
          event?: string
          guardian_profile_id?: string
          id?: string
          session_date?: string
          status?: string
          subject_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_notifications_guardian_profile_id_fkey"
            columns: ["guardian_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_notifications_subject_profile_id_fkey"
            columns: ["subject_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attendees: {
        Row: {
          created_at: string
          display_name: string
          household_id: string | null
          id: string
          profile_id: string | null
          track: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          household_id?: string | null
          id?: string
          profile_id?: string | null
          track?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          household_id?: string | null
          id?: string
          profile_id?: string | null
          track?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendees_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendees_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      authorised_collectors: {
        Row: {
          added_by: string
          child_profile_id: string
          created_at: string
          id: string
          name: string
          phone: string | null
          revoked_at: string | null
        }
        Insert: {
          added_by: string
          child_profile_id: string
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          revoked_at?: string | null
        }
        Update: {
          added_by?: string
          child_profile_id?: string
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "authorised_collectors_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "authorised_collectors_child_profile_id_fkey"
            columns: ["child_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
          goal_status: string
          goal_update: string | null
          id: string
          is_anonymous: boolean | null
          left_early_at: string | null
          left_early_by: string | null
          profile_id: string | null
          scheduled_session_id: string | null
          session_id: string | null
          share_goal_publicly: boolean | null
          source: string
          track: string | null
          wall_hidden: boolean
          welcome_note: string | null
        }
        Insert: {
          checked_in_at?: string | null
          display_name: string
          goal_status?: string
          goal_update?: string | null
          id?: string
          is_anonymous?: boolean | null
          left_early_at?: string | null
          left_early_by?: string | null
          profile_id?: string | null
          scheduled_session_id?: string | null
          session_id?: string | null
          share_goal_publicly?: boolean | null
          source?: string
          track?: string | null
          wall_hidden?: boolean
          welcome_note?: string | null
        }
        Update: {
          checked_in_at?: string | null
          display_name?: string
          goal_status?: string
          goal_update?: string | null
          id?: string
          is_anonymous?: boolean | null
          left_early_at?: string | null
          left_early_by?: string | null
          profile_id?: string | null
          scheduled_session_id?: string | null
          session_id?: string | null
          share_goal_publicly?: boolean | null
          source?: string
          track?: string | null
          wall_hidden?: boolean
          welcome_note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_left_early_by_fkey"
            columns: ["left_early_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_ins_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_ins_scheduled_session_id_fkey"
            columns: ["scheduled_session_id"]
            isOneToOne: false
            referencedRelation: "scheduled_sessions"
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
      concession_requests: {
        Row: {
          decided_at: string | null
          decided_by: string | null
          id: string
          requested_at: string
          status: string
          user_id: string
        }
        Insert: {
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          requested_at?: string
          status?: string
          user_id: string
        }
        Update: {
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          requested_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      curriculum_weeks: {
        Row: {
          activity_options: string | null
          activity_type: string
          adult_search_notes: string | null
          adult_source: string | null
          adult_video_title: string | null
          block_number: number
          block_theme: string
          core_learning: string | null
          created_at: string
          id: string
          inner_wisdom_alignment: string | null
          interactive_activity: string | null
          kids_activity_type: string | null
          kids_colouring_prompt: string | null
          kids_format: string | null
          kids_game: string | null
          kids_game_equipment: string | null
          kids_game_under5: string | null
          kids_nz_alternative: string | null
          kids_nz_alternative_author: string | null
          kids_nz_alternative_note: string | null
          kids_nz_alternative_verified: boolean | null
          kids_parent_handout: string | null
          kids_picture_book: string | null
          kids_picture_book_author: string | null
          kids_picture_book_note: string | null
          kids_picture_book_question: string | null
          kids_read_aloud_source_check: string | null
          kids_signal_metaphor: string | null
          kids_source: string | null
          kids_theme_notes: string | null
          kids_title: string | null
          movement_theme: string | null
          opening_question: string | null
          pdf_reference: string | null
          reflective_question: string | null
          revisits_weeks: string | null
          signal_metaphor: string | null
          spiral_depth: string | null
          spiral_thread: string | null
          teen_search_notes: string | null
          teen_signal_metaphor: string | null
          teen_source: string | null
          teen_video_title: string | null
          the_territory: string | null
          thought_provoking_question: string | null
          updated_at: string
          video_position: string
          week_number: number
          week_type: string | null
          weekly_theme: string
          workbook_activity: string | null
          youtube_runtime: string | null
          youtube_title: string | null
          youtube_url: string | null
        }
        Insert: {
          activity_options?: string | null
          activity_type?: string
          adult_search_notes?: string | null
          adult_source?: string | null
          adult_video_title?: string | null
          block_number: number
          block_theme?: string
          core_learning?: string | null
          created_at?: string
          id?: string
          inner_wisdom_alignment?: string | null
          interactive_activity?: string | null
          kids_activity_type?: string | null
          kids_colouring_prompt?: string | null
          kids_format?: string | null
          kids_game?: string | null
          kids_game_equipment?: string | null
          kids_game_under5?: string | null
          kids_nz_alternative?: string | null
          kids_nz_alternative_author?: string | null
          kids_nz_alternative_note?: string | null
          kids_nz_alternative_verified?: boolean | null
          kids_parent_handout?: string | null
          kids_picture_book?: string | null
          kids_picture_book_author?: string | null
          kids_picture_book_note?: string | null
          kids_picture_book_question?: string | null
          kids_read_aloud_source_check?: string | null
          kids_signal_metaphor?: string | null
          kids_source?: string | null
          kids_theme_notes?: string | null
          kids_title?: string | null
          movement_theme?: string | null
          opening_question?: string | null
          pdf_reference?: string | null
          reflective_question?: string | null
          revisits_weeks?: string | null
          signal_metaphor?: string | null
          spiral_depth?: string | null
          spiral_thread?: string | null
          teen_search_notes?: string | null
          teen_signal_metaphor?: string | null
          teen_source?: string | null
          teen_video_title?: string | null
          the_territory?: string | null
          thought_provoking_question?: string | null
          updated_at?: string
          video_position?: string
          week_number: number
          week_type?: string | null
          weekly_theme?: string
          workbook_activity?: string | null
          youtube_runtime?: string | null
          youtube_title?: string | null
          youtube_url?: string | null
        }
        Update: {
          activity_options?: string | null
          activity_type?: string
          adult_search_notes?: string | null
          adult_source?: string | null
          adult_video_title?: string | null
          block_number?: number
          block_theme?: string
          core_learning?: string | null
          created_at?: string
          id?: string
          inner_wisdom_alignment?: string | null
          interactive_activity?: string | null
          kids_activity_type?: string | null
          kids_colouring_prompt?: string | null
          kids_format?: string | null
          kids_game?: string | null
          kids_game_equipment?: string | null
          kids_game_under5?: string | null
          kids_nz_alternative?: string | null
          kids_nz_alternative_author?: string | null
          kids_nz_alternative_note?: string | null
          kids_nz_alternative_verified?: boolean | null
          kids_parent_handout?: string | null
          kids_picture_book?: string | null
          kids_picture_book_author?: string | null
          kids_picture_book_note?: string | null
          kids_picture_book_question?: string | null
          kids_read_aloud_source_check?: string | null
          kids_signal_metaphor?: string | null
          kids_source?: string | null
          kids_theme_notes?: string | null
          kids_title?: string | null
          movement_theme?: string | null
          opening_question?: string | null
          pdf_reference?: string | null
          reflective_question?: string | null
          revisits_weeks?: string | null
          signal_metaphor?: string | null
          spiral_depth?: string | null
          spiral_thread?: string | null
          teen_search_notes?: string | null
          teen_signal_metaphor?: string | null
          teen_source?: string | null
          teen_video_title?: string | null
          the_territory?: string | null
          thought_provoking_question?: string | null
          updated_at?: string
          video_position?: string
          week_number?: number
          week_type?: string | null
          weekly_theme?: string
          workbook_activity?: string | null
          youtube_runtime?: string | null
          youtube_title?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      curriculum_weeks_archive_v2: {
        Row: {
          activity_options: string | null
          activity_type: string | null
          adult_search_notes: string | null
          adult_source: string | null
          adult_video_title: string | null
          block_number: number | null
          block_theme: string | null
          core_learning: string | null
          created_at: string | null
          id: string | null
          inner_wisdom_alignment: string | null
          interactive_activity: string | null
          kids_activity_type: string | null
          kids_colouring_prompt: string | null
          kids_format: string | null
          kids_game: string | null
          kids_picture_book: string | null
          kids_picture_book_note: string | null
          kids_signal_metaphor: string | null
          kids_source: string | null
          kids_theme_notes: string | null
          kids_title: string | null
          pdf_reference: string | null
          reflective_question: string | null
          signal_metaphor: string | null
          teen_search_notes: string | null
          teen_signal_metaphor: string | null
          teen_source: string | null
          teen_video_title: string | null
          updated_at: string | null
          video_position: string | null
          week_number: number | null
          weekly_theme: string | null
          workbook_activity: string | null
          youtube_runtime: string | null
          youtube_title: string | null
          youtube_url: string | null
        }
        Insert: {
          activity_options?: string | null
          activity_type?: string | null
          adult_search_notes?: string | null
          adult_source?: string | null
          adult_video_title?: string | null
          block_number?: number | null
          block_theme?: string | null
          core_learning?: string | null
          created_at?: string | null
          id?: string | null
          inner_wisdom_alignment?: string | null
          interactive_activity?: string | null
          kids_activity_type?: string | null
          kids_colouring_prompt?: string | null
          kids_format?: string | null
          kids_game?: string | null
          kids_picture_book?: string | null
          kids_picture_book_note?: string | null
          kids_signal_metaphor?: string | null
          kids_source?: string | null
          kids_theme_notes?: string | null
          kids_title?: string | null
          pdf_reference?: string | null
          reflective_question?: string | null
          signal_metaphor?: string | null
          teen_search_notes?: string | null
          teen_signal_metaphor?: string | null
          teen_source?: string | null
          teen_video_title?: string | null
          updated_at?: string | null
          video_position?: string | null
          week_number?: number | null
          weekly_theme?: string | null
          workbook_activity?: string | null
          youtube_runtime?: string | null
          youtube_title?: string | null
          youtube_url?: string | null
        }
        Update: {
          activity_options?: string | null
          activity_type?: string | null
          adult_search_notes?: string | null
          adult_source?: string | null
          adult_video_title?: string | null
          block_number?: number | null
          block_theme?: string | null
          core_learning?: string | null
          created_at?: string | null
          id?: string | null
          inner_wisdom_alignment?: string | null
          interactive_activity?: string | null
          kids_activity_type?: string | null
          kids_colouring_prompt?: string | null
          kids_format?: string | null
          kids_game?: string | null
          kids_picture_book?: string | null
          kids_picture_book_note?: string | null
          kids_signal_metaphor?: string | null
          kids_source?: string | null
          kids_theme_notes?: string | null
          kids_title?: string | null
          pdf_reference?: string | null
          reflective_question?: string | null
          signal_metaphor?: string | null
          teen_search_notes?: string | null
          teen_signal_metaphor?: string | null
          teen_source?: string | null
          teen_video_title?: string | null
          updated_at?: string | null
          video_position?: string | null
          week_number?: number | null
          weekly_theme?: string | null
          workbook_activity?: string | null
          youtube_runtime?: string | null
          youtube_title?: string | null
          youtube_url?: string | null
        }
        Relationships: []
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
      email_reminders: {
        Row: {
          cohort_id: string | null
          id: string
          recipient_count: number | null
          sent_at: string | null
          status: string | null
          week_number: number
        }
        Insert: {
          cohort_id?: string | null
          id?: string
          recipient_count?: number | null
          sent_at?: string | null
          status?: string | null
          week_number: number
        }
        Update: {
          cohort_id?: string | null
          id?: string
          recipient_count?: number | null
          sent_at?: string | null
          status?: string | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "email_reminders_cohort_id_fkey"
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
      featured_callbacks: {
        Row: {
          audience_type: string
          display_name: string
          id: string
          next_week_number: number
          prompt_type: string | null
          response_id: string | null
          response_text: string
          selected_at: string
          source_week_number: number
          used_at: string | null
        }
        Insert: {
          audience_type: string
          display_name: string
          id?: string
          next_week_number: number
          prompt_type?: string | null
          response_id?: string | null
          response_text: string
          selected_at?: string
          source_week_number: number
          used_at?: string | null
        }
        Update: {
          audience_type?: string
          display_name?: string
          id?: string
          next_week_number?: number
          prompt_type?: string | null
          response_id?: string | null
          response_text?: string
          selected_at?: string
          source_week_number?: number
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "featured_callbacks_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "session_responses"
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
      free_trials: {
        Row: {
          attendee_id: string
          created_at: string
          id: string
          session_date: string | null
          used_at: string | null
        }
        Insert: {
          attendee_id: string
          created_at?: string
          id?: string
          session_date?: string | null
          used_at?: string | null
        }
        Update: {
          attendee_id?: string
          created_at?: string
          id?: string
          session_date?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "free_trials_attendee_id_fkey"
            columns: ["attendee_id"]
            isOneToOne: true
            referencedRelation: "attendees"
            referencedColumns: ["id"]
          },
        ]
      }
      guardian_consents: {
        Row: {
          consent_type: string
          consented_at: string
          guardian_email: string | null
          guardian_name: string
          guardian_phone: string | null
          id: string
          recorded_by: string | null
          revoked_at: string | null
          subject_profile_id: string
        }
        Insert: {
          consent_type: string
          consented_at?: string
          guardian_email?: string | null
          guardian_name: string
          guardian_phone?: string | null
          id?: string
          recorded_by?: string | null
          revoked_at?: string | null
          subject_profile_id: string
        }
        Update: {
          consent_type?: string
          consented_at?: string
          guardian_email?: string | null
          guardian_name?: string
          guardian_phone?: string | null
          id?: string
          recorded_by?: string | null
          revoked_at?: string | null
          subject_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guardian_consents_subject_profile_id_fkey"
            columns: ["subject_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      household_members: {
        Row: {
          created_at: string
          household_id: string
          id: string
          profile_id: string
          role_in_household: string
          teen_self_signout: boolean
        }
        Insert: {
          created_at?: string
          household_id: string
          id?: string
          profile_id: string
          role_in_household?: string
          teen_self_signout?: boolean
        }
        Update: {
          created_at?: string
          household_id?: string
          id?: string
          profile_id?: string
          role_in_household?: string
          teen_self_signout?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          concession_granted: boolean
          concession_granted_at: string | null
          concession_granted_by: string | null
          created_at: string
          id: string
          name: string
          payer_profile_id: string | null
          stripe_customer_id: string | null
          updated_at: string
        }
        Insert: {
          concession_granted?: boolean
          concession_granted_at?: string | null
          concession_granted_by?: string | null
          created_at?: string
          id?: string
          name?: string
          payer_profile_id?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Update: {
          concession_granted?: boolean
          concession_granted_at?: string | null
          concession_granted_by?: string | null
          created_at?: string
          id?: string
          name?: string
          payer_profile_id?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "households_payer_profile_id_fkey"
            columns: ["payer_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      kids_workbook_entries: {
        Row: {
          arriving_word: string | null
          character_brave_kind: string | null
          character_felt: string | null
          completed_at: string | null
          created_at: string
          drawing_description: string | null
          favorite_part_drawing_url: string | null
          id: string
          if_i_were_character: string | null
          little_minds_drawing_url: string | null
          little_minds_question: string | null
          mood_emoji: string | null
          parent_conversation_notes: string | null
          parent_initials: string | null
          profile_id: string | null
          question_1: string | null
          question_1_answer: string | null
          question_1_drawing_url: string | null
          question_2: string | null
          question_2_answer: string | null
          session_id: string | null
          something_to_remember: string | null
          updated_at: string
          weekly_goal: string | null
        }
        Insert: {
          arriving_word?: string | null
          character_brave_kind?: string | null
          character_felt?: string | null
          completed_at?: string | null
          created_at?: string
          drawing_description?: string | null
          favorite_part_drawing_url?: string | null
          id?: string
          if_i_were_character?: string | null
          little_minds_drawing_url?: string | null
          little_minds_question?: string | null
          mood_emoji?: string | null
          parent_conversation_notes?: string | null
          parent_initials?: string | null
          profile_id?: string | null
          question_1?: string | null
          question_1_answer?: string | null
          question_1_drawing_url?: string | null
          question_2?: string | null
          question_2_answer?: string | null
          session_id?: string | null
          something_to_remember?: string | null
          updated_at?: string
          weekly_goal?: string | null
        }
        Update: {
          arriving_word?: string | null
          character_brave_kind?: string | null
          character_felt?: string | null
          completed_at?: string | null
          created_at?: string
          drawing_description?: string | null
          favorite_part_drawing_url?: string | null
          id?: string
          if_i_were_character?: string | null
          little_minds_drawing_url?: string | null
          little_minds_question?: string | null
          mood_emoji?: string | null
          parent_conversation_notes?: string | null
          parent_initials?: string | null
          profile_id?: string | null
          question_1?: string | null
          question_1_answer?: string | null
          question_1_drawing_url?: string | null
          question_2?: string | null
          question_2_answer?: string | null
          session_id?: string | null
          something_to_remember?: string | null
          updated_at?: string
          weekly_goal?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kids_workbook_entries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kids_workbook_entries_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_completions: {
        Row: {
          audience_type: string
          completed_at: string
          id: string
          user_id: string
          week_number: number
        }
        Insert: {
          audience_type?: string
          completed_at?: string
          id?: string
          user_id: string
          week_number: number
        }
        Update: {
          audience_type?: string
          completed_at?: string
          id?: string
          user_id?: string
          week_number?: number
        }
        Relationships: []
      }
      lesson_journal: {
        Row: {
          activity_response: string | null
          created_at: string
          id: string
          intention_outcome: string | null
          intention_reflection: string | null
          life_group_notes: string | null
          personal_notes: string | null
          profile_id: string
          reflection_answer: string | null
          track: string
          updated_at: string
          video_question_1_response: string | null
          video_question_2_response: string | null
          week_number: number
          weekly_intention: string | null
        }
        Insert: {
          activity_response?: string | null
          created_at?: string
          id?: string
          intention_outcome?: string | null
          intention_reflection?: string | null
          life_group_notes?: string | null
          personal_notes?: string | null
          profile_id: string
          reflection_answer?: string | null
          track?: string
          updated_at?: string
          video_question_1_response?: string | null
          video_question_2_response?: string | null
          week_number: number
          weekly_intention?: string | null
        }
        Update: {
          activity_response?: string | null
          created_at?: string
          id?: string
          intention_outcome?: string | null
          intention_reflection?: string | null
          life_group_notes?: string | null
          personal_notes?: string | null
          profile_id?: string
          reflection_answer?: string | null
          track?: string
          updated_at?: string
          video_question_1_response?: string | null
          video_question_2_response?: string | null
          week_number?: number
          weekly_intention?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_journal_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_slides: {
        Row: {
          applies_to_tracks: string[]
          beat: string
          component_key: string
          default_duration_seconds: number
          id: string
          is_active: boolean
          position: number
          slide_key: string
          title: string
        }
        Insert: {
          applies_to_tracks?: string[]
          beat: string
          component_key: string
          default_duration_seconds?: number
          id?: string
          is_active?: boolean
          position: number
          slide_key: string
          title: string
        }
        Update: {
          applies_to_tracks?: string[]
          beat?: string
          component_key?: string
          default_duration_seconds?: number
          id?: string
          is_active?: boolean
          position?: number
          slide_key?: string
          title?: string
        }
        Relationships: []
      }
      life_group_members: {
        Row: {
          id: string
          joined_at: string
          life_group_id: string
          profile_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          life_group_id: string
          profile_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          life_group_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "life_group_members_life_group_id_fkey"
            columns: ["life_group_id"]
            isOneToOne: false
            referencedRelation: "life_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "life_group_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      life_groups: {
        Row: {
          age_max: number | null
          age_min: number | null
          capacity: number
          created_at: string
          day_of_week: string
          end_time: string
          id: string
          is_active: boolean
          meeting_space: string | null
          name: string
          start_time: string
          target_female_count: number | null
          target_male_count: number | null
          updated_at: string
        }
        Insert: {
          age_max?: number | null
          age_min?: number | null
          capacity?: number
          created_at?: string
          day_of_week?: string
          end_time?: string
          id?: string
          is_active?: boolean
          meeting_space?: string | null
          name: string
          start_time?: string
          target_female_count?: number | null
          target_male_count?: number | null
          updated_at?: string
        }
        Update: {
          age_max?: number | null
          age_min?: number | null
          capacity?: number
          created_at?: string
          day_of_week?: string
          end_time?: string
          id?: string
          is_active?: boolean
          meeting_space?: string | null
          name?: string
          start_time?: string
          target_female_count?: number | null
          target_male_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      live_session_state: {
        Row: {
          audience: string | null
          closed_at: string | null
          current_slide: number
          is_live: boolean
          opened_at: string
          prompt_text: string | null
          prompt_type: string
          session_code: string
          title: string | null
          updated_at: string
          updated_by: string | null
          week_number: number | null
        }
        Insert: {
          audience?: string | null
          closed_at?: string | null
          current_slide?: number
          is_live?: boolean
          opened_at?: string
          prompt_text?: string | null
          prompt_type?: string
          session_code: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
          week_number?: number | null
        }
        Update: {
          audience?: string | null
          closed_at?: string | null
          current_slide?: number
          is_live?: boolean
          opened_at?: string
          prompt_text?: string | null
          prompt_type?: string
          session_code?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
          week_number?: number | null
        }
        Relationships: []
      }
      mindcast_live_sessions: {
        Row: {
          ancient_wisdom_approval: string | null
          ancient_wisdom_captions_url: string | null
          ancient_wisdom_hash: string | null
          ancient_wisdom_reframe: string | null
          ancient_wisdom_video_url: string | null
          ancient_wisdom_vo_script: string | null
          audience: string
          closing_quote: string | null
          closing_quote_attribution: string | null
          coloring_approval: string
          coloring_page_url: string | null
          coloring_pdf_url: string | null
          coloring_prompt: string | null
          core_affirmation: string | null
          core_concept: string | null
          created_at: string
          experiential_exercise: string | null
          facilitator_notes: string | null
          facilitator_prep_notes: string | null
          film_script_2min: string | null
          first_time_note: string | null
          guided_reflection: string | null
          heavy_week_flag: boolean | null
          id: string
          intention_prompt: string | null
          journaling_prompt: string | null
          opening_hook: string | null
          phase: number
          phase_name: string
          practice_fri: string | null
          practice_midweek: string | null
          practice_sun_today: string | null
          previous_week_callback: string | null
          private_write_prompt: string | null
          s5_source_core_concept: string | null
          s5_source_opening_hook: string | null
          session_title: string | null
          signal_metaphor: string | null
          teaching_points: string | null
          theme_title: string
          thought_provoking_question: string | null
          todays_theme: string | null
          todays_world_approval: string | null
          todays_world_captions_url: string | null
          todays_world_hash: string | null
          todays_world_video_url: string | null
          todays_world_vo_script: string | null
          updated_at: string
          video_backup_description: string | null
          video_description: string | null
          video_link: string | null
          video_local_url: string | null
          video_question_1: string | null
          video_question_2: string | null
          video_transcript: string | null
          watch_for: string | null
          week_number: number
          weekly_practice_fri: string | null
          weekly_practice_mon: string | null
          weekly_practice_sun: string | null
          weekly_practice_wed: string | null
          worksheet_prompt: string | null
        }
        Insert: {
          ancient_wisdom_approval?: string | null
          ancient_wisdom_captions_url?: string | null
          ancient_wisdom_hash?: string | null
          ancient_wisdom_reframe?: string | null
          ancient_wisdom_video_url?: string | null
          ancient_wisdom_vo_script?: string | null
          audience: string
          closing_quote?: string | null
          closing_quote_attribution?: string | null
          coloring_approval?: string
          coloring_page_url?: string | null
          coloring_pdf_url?: string | null
          coloring_prompt?: string | null
          core_affirmation?: string | null
          core_concept?: string | null
          created_at?: string
          experiential_exercise?: string | null
          facilitator_notes?: string | null
          facilitator_prep_notes?: string | null
          film_script_2min?: string | null
          first_time_note?: string | null
          guided_reflection?: string | null
          heavy_week_flag?: boolean | null
          id?: string
          intention_prompt?: string | null
          journaling_prompt?: string | null
          opening_hook?: string | null
          phase: number
          phase_name?: string
          practice_fri?: string | null
          practice_midweek?: string | null
          practice_sun_today?: string | null
          previous_week_callback?: string | null
          private_write_prompt?: string | null
          s5_source_core_concept?: string | null
          s5_source_opening_hook?: string | null
          session_title?: string | null
          signal_metaphor?: string | null
          teaching_points?: string | null
          theme_title?: string
          thought_provoking_question?: string | null
          todays_theme?: string | null
          todays_world_approval?: string | null
          todays_world_captions_url?: string | null
          todays_world_hash?: string | null
          todays_world_video_url?: string | null
          todays_world_vo_script?: string | null
          updated_at?: string
          video_backup_description?: string | null
          video_description?: string | null
          video_link?: string | null
          video_local_url?: string | null
          video_question_1?: string | null
          video_question_2?: string | null
          video_transcript?: string | null
          watch_for?: string | null
          week_number: number
          weekly_practice_fri?: string | null
          weekly_practice_mon?: string | null
          weekly_practice_sun?: string | null
          weekly_practice_wed?: string | null
          worksheet_prompt?: string | null
        }
        Update: {
          ancient_wisdom_approval?: string | null
          ancient_wisdom_captions_url?: string | null
          ancient_wisdom_hash?: string | null
          ancient_wisdom_reframe?: string | null
          ancient_wisdom_video_url?: string | null
          ancient_wisdom_vo_script?: string | null
          audience?: string
          closing_quote?: string | null
          closing_quote_attribution?: string | null
          coloring_approval?: string
          coloring_page_url?: string | null
          coloring_pdf_url?: string | null
          coloring_prompt?: string | null
          core_affirmation?: string | null
          core_concept?: string | null
          created_at?: string
          experiential_exercise?: string | null
          facilitator_notes?: string | null
          facilitator_prep_notes?: string | null
          film_script_2min?: string | null
          first_time_note?: string | null
          guided_reflection?: string | null
          heavy_week_flag?: boolean | null
          id?: string
          intention_prompt?: string | null
          journaling_prompt?: string | null
          opening_hook?: string | null
          phase?: number
          phase_name?: string
          practice_fri?: string | null
          practice_midweek?: string | null
          practice_sun_today?: string | null
          previous_week_callback?: string | null
          private_write_prompt?: string | null
          s5_source_core_concept?: string | null
          s5_source_opening_hook?: string | null
          session_title?: string | null
          signal_metaphor?: string | null
          teaching_points?: string | null
          theme_title?: string
          thought_provoking_question?: string | null
          todays_theme?: string | null
          todays_world_approval?: string | null
          todays_world_captions_url?: string | null
          todays_world_hash?: string | null
          todays_world_video_url?: string | null
          todays_world_vo_script?: string | null
          updated_at?: string
          video_backup_description?: string | null
          video_description?: string | null
          video_link?: string | null
          video_local_url?: string | null
          video_question_1?: string | null
          video_question_2?: string | null
          video_transcript?: string | null
          watch_for?: string | null
          week_number?: number
          weekly_practice_fri?: string | null
          weekly_practice_mon?: string | null
          weekly_practice_sun?: string | null
          weekly_practice_wed?: string | null
          worksheet_prompt?: string | null
        }
        Relationships: []
      }
      notification_outbox: {
        Row: {
          channel: string | null
          client_event_id: string | null
          destination: string | null
          error: string | null
          event: string
          id: string
          occurred_at: string
          payload: Json
          queued_at: string
          recipient_profile_id: string
          sent_at: string | null
          status: string
        }
        Insert: {
          channel?: string | null
          client_event_id?: string | null
          destination?: string | null
          error?: string | null
          event: string
          id?: string
          occurred_at?: string
          payload?: Json
          queued_at?: string
          recipient_profile_id: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          channel?: string | null
          client_event_id?: string | null
          destination?: string | null
          error?: string | null
          event?: string
          id?: string
          occurred_at?: string
          payload?: Json
          queued_at?: string
          recipient_profile_id?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_outbox_recipient_profile_id_fkey"
            columns: ["recipient_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pilot_applications: {
        Row: {
          age_range: string | null
          agreed_terms: boolean | null
          application_status: string
          cohort: string | null
          confirmed_attendance: boolean | null
          created_at: string
          current_obstacles: string | null
          current_work: string | null
          email: string
          full_name: string
          hoped_outcome: string | null
          id: string
          paid_at: string | null
          past_achievement: string | null
          phone: string | null
          stripe_customer_id: string | null
          stripe_session_id: string | null
          what_led_you_here: string | null
        }
        Insert: {
          age_range?: string | null
          agreed_terms?: boolean | null
          application_status?: string
          cohort?: string | null
          confirmed_attendance?: boolean | null
          created_at?: string
          current_obstacles?: string | null
          current_work?: string | null
          email: string
          full_name: string
          hoped_outcome?: string | null
          id?: string
          paid_at?: string | null
          past_achievement?: string | null
          phone?: string | null
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          what_led_you_here?: string | null
        }
        Update: {
          age_range?: string | null
          agreed_terms?: boolean | null
          application_status?: string
          cohort?: string | null
          confirmed_attendance?: boolean | null
          created_at?: string
          current_obstacles?: string | null
          current_work?: string | null
          email?: string
          full_name?: string
          hoped_outcome?: string | null
          id?: string
          paid_at?: string | null
          past_achievement?: string | null
          phone?: string | null
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          what_led_you_here?: string | null
        }
        Relationships: []
      }
      pilot_registrations: {
        Row: {
          can_attend_tuesdays: boolean
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          payment_status: string
          phone: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          can_attend_tuesdays?: boolean
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          payment_status?: string
          phone?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          can_attend_tuesdays?: boolean
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          payment_status?: string
          phone?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pilot_waitlist: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
        }
        Relationships: []
      }
      practice_reminder_log: {
        Row: {
          day: string
          email_sent: number
          id: string
          push_failed: number
          push_sent: number
          ran_at: string
          sent_for_date: string
        }
        Insert: {
          day: string
          email_sent?: number
          id?: string
          push_failed?: number
          push_sent?: number
          ran_at?: string
          sent_for_date: string
        }
        Update: {
          day?: string
          email_sent?: number
          id?: string
          push_failed?: number
          push_sent?: number
          ran_at?: string
          sent_for_date?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_group: string | null
          avatar_url: string | null
          cohort: string | null
          created_at: string
          date_of_birth: string | null
          display_name: string
          email: string | null
          family_discount: boolean
          first_name: string | null
          gender: string | null
          id: string
          is_active: boolean
          is_admin: boolean | null
          is_safeguarding_lead: boolean | null
          kids_addon: boolean
          last_name: string | null
          live_display_mode: string | null
          membership_bundle: Json | null
          membership_status: string
          membership_tier: string
          name: string
          nfc_id: string | null
          notify_attendance_absent: boolean
          notify_attendance_present: boolean
          notify_channel: string
          notify_practice_email: boolean
          notify_practice_push: boolean
          notify_sms: boolean
          onboarding_complete: boolean | null
          opt_in_public_goals: boolean | null
          phone: string | null
          show_attendance_on_screen: boolean | null
          stripe_customer_id: string | null
          updated_at: string
          user_id: string
          wall_opt_out: boolean
        }
        Insert: {
          age_group?: string | null
          avatar_url?: string | null
          cohort?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string
          email?: string | null
          family_discount?: boolean
          first_name?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean
          is_admin?: boolean | null
          is_safeguarding_lead?: boolean | null
          kids_addon?: boolean
          last_name?: string | null
          live_display_mode?: string | null
          membership_bundle?: Json | null
          membership_status?: string
          membership_tier?: string
          name?: string
          nfc_id?: string | null
          notify_attendance_absent?: boolean
          notify_attendance_present?: boolean
          notify_channel?: string
          notify_practice_email?: boolean
          notify_practice_push?: boolean
          notify_sms?: boolean
          onboarding_complete?: boolean | null
          opt_in_public_goals?: boolean | null
          phone?: string | null
          show_attendance_on_screen?: boolean | null
          stripe_customer_id?: string | null
          updated_at?: string
          user_id: string
          wall_opt_out?: boolean
        }
        Update: {
          age_group?: string | null
          avatar_url?: string | null
          cohort?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string
          email?: string | null
          family_discount?: boolean
          first_name?: string | null
          gender?: string | null
          id?: string
          is_active?: boolean
          is_admin?: boolean | null
          is_safeguarding_lead?: boolean | null
          kids_addon?: boolean
          last_name?: string | null
          live_display_mode?: string | null
          membership_bundle?: Json | null
          membership_status?: string
          membership_tier?: string
          name?: string
          nfc_id?: string | null
          notify_attendance_absent?: boolean
          notify_attendance_present?: boolean
          notify_channel?: string
          notify_practice_email?: boolean
          notify_practice_push?: boolean
          notify_sms?: boolean
          onboarding_complete?: boolean | null
          opt_in_public_goals?: boolean | null
          phone?: string | null
          show_attendance_on_screen?: boolean | null
          stripe_customer_id?: string | null
          updated_at?: string
          user_id?: string
          wall_opt_out?: boolean
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          last_used_at: string | null
          p256dh: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          last_used_at?: string | null
          p256dh: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          last_used_at?: string | null
          p256dh?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          count: number
          key: string
          window_start: string
        }
        Insert: {
          count?: number
          key: string
          window_start?: string
        }
        Update: {
          count?: number
          key?: string
          window_start?: string
        }
        Relationships: []
      }
      roll_events: {
        Row: {
          actor_user_id: string
          client_event_id: string | null
          collected_by_collector_id: string | null
          collected_by_profile_id: string | null
          departure_reason: string | null
          destination_room: string | null
          event: string
          id: string
          note: string | null
          occurred_at: string
          recorded_at: string
          ref_event_id: string | null
          room: string
          session_date: string
          subject_profile_id: string | null
        }
        Insert: {
          actor_user_id?: string
          client_event_id?: string | null
          collected_by_collector_id?: string | null
          collected_by_profile_id?: string | null
          departure_reason?: string | null
          destination_room?: string | null
          event: string
          id?: string
          note?: string | null
          occurred_at?: string
          recorded_at?: string
          ref_event_id?: string | null
          room: string
          session_date?: string
          subject_profile_id?: string | null
        }
        Update: {
          actor_user_id?: string
          client_event_id?: string | null
          collected_by_collector_id?: string | null
          collected_by_profile_id?: string | null
          departure_reason?: string | null
          destination_room?: string | null
          event?: string
          id?: string
          note?: string | null
          occurred_at?: string
          recorded_at?: string
          ref_event_id?: string | null
          room?: string
          session_date?: string
          subject_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roll_events_collected_by_collector_id_fkey"
            columns: ["collected_by_collector_id"]
            isOneToOne: false
            referencedRelation: "authorised_collectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roll_events_collected_by_profile_id_fkey"
            columns: ["collected_by_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roll_events_ref_event_id_fkey"
            columns: ["ref_event_id"]
            isOneToOne: false
            referencedRelation: "roll_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roll_events_subject_profile_id_fkey"
            columns: ["subject_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      room_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          body: string
          created_at: string
          id: string
          kind: string
          session_date: string
          source_room: string
          subject_name: string
          target_room: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          body: string
          created_at?: string
          id?: string
          kind: string
          session_date?: string
          source_room: string
          subject_name: string
          target_room: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          body?: string
          created_at?: string
          id?: string
          kind?: string
          session_date?: string
          source_room?: string
          subject_name?: string
          target_room?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_alerts_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      room_roster: {
        Row: {
          created_at: string
          duty: string
          id: string
          profile_id: string
          room: string
          session_date: string
        }
        Insert: {
          created_at?: string
          duty?: string
          id?: string
          profile_id: string
          room: string
          session_date?: string
        }
        Update: {
          created_at?: string
          duty?: string
          id?: string
          profile_id?: string
          room?: string
          session_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_roster_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      room_staffing: {
        Row: {
          capacity: number
          created_at: string
          id: string
          room: string
          session_date: string
          staffed_adults: number
        }
        Insert: {
          capacity?: number
          created_at?: string
          id?: string
          room: string
          session_date?: string
          staffed_adults?: number
        }
        Update: {
          capacity?: number
          created_at?: string
          id?: string
          room?: string
          session_date?: string
          staffed_adults?: number
        }
        Relationships: []
      }
      scheduled_sessions: {
        Row: {
          created_at: string
          id: string
          room: string | null
          session_code: string | null
          session_date: string
          starts_at: string | null
          status: string
          track: string
          updated_at: string
          week_number: number
        }
        Insert: {
          created_at?: string
          id?: string
          room?: string | null
          session_code?: string | null
          session_date: string
          starts_at?: string | null
          status?: string
          track: string
          updated_at?: string
          week_number: number
        }
        Update: {
          created_at?: string
          id?: string
          room?: string | null
          session_code?: string | null
          session_date?: string
          starts_at?: string | null
          status?: string
          track?: string
          updated_at?: string
          week_number?: number
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
      session_credits: {
        Row: {
          attendee_id: string | null
          created_at: string
          household_id: string
          id: string
          kind: string
          phase: number | null
          purchased_at: string
          stripe_payment_intent_id: string | null
          track: string
          trips_total: number
          trips_used: number
        }
        Insert: {
          attendee_id?: string | null
          created_at?: string
          household_id: string
          id?: string
          kind: string
          phase?: number | null
          purchased_at?: string
          stripe_payment_intent_id?: string | null
          track: string
          trips_total: number
          trips_used?: number
        }
        Update: {
          attendee_id?: string | null
          created_at?: string
          household_id?: string
          id?: string
          kind?: string
          phase?: number | null
          purchased_at?: string
          stripe_payment_intent_id?: string | null
          track?: string
          trips_total?: number
          trips_used?: number
        }
        Relationships: [
          {
            foreignKeyName: "session_credits_attendee_id_fkey"
            columns: ["attendee_id"]
            isOneToOne: false
            referencedRelation: "attendees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_credits_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      session_evaluations: {
        Row: {
          content_flags: string | null
          facilitator_id: string
          follow_up_needed: boolean | null
          follow_up_notes: string | null
          id: string
          room_energy: number | null
          safeguarding_flag: boolean | null
          session_id: string | null
          submitted_at: string
          timing_notes: string | null
          track: string
          what_didnt: string | null
          what_worked: string | null
        }
        Insert: {
          content_flags?: string | null
          facilitator_id: string
          follow_up_needed?: boolean | null
          follow_up_notes?: string | null
          id?: string
          room_energy?: number | null
          safeguarding_flag?: boolean | null
          session_id?: string | null
          submitted_at?: string
          timing_notes?: string | null
          track: string
          what_didnt?: string | null
          what_worked?: string | null
        }
        Update: {
          content_flags?: string | null
          facilitator_id?: string
          follow_up_needed?: boolean | null
          follow_up_notes?: string | null
          id?: string
          room_energy?: number | null
          safeguarding_flag?: boolean | null
          session_id?: string | null
          submitted_at?: string
          timing_notes?: string | null
          track?: string
          what_didnt?: string | null
          what_worked?: string | null
        }
        Relationships: []
      }
      session_pause_points: {
        Row: {
          context_start_seconds: number
          created_at: string | null
          id: string
          position: number
          question_text: string
          session_id: string | null
          timestamp_seconds: number
        }
        Insert: {
          context_start_seconds: number
          created_at?: string | null
          id?: string
          position: number
          question_text: string
          session_id?: string | null
          timestamp_seconds: number
        }
        Update: {
          context_start_seconds?: number
          created_at?: string | null
          id?: string
          position?: number
          question_text?: string
          session_id?: string | null
          timestamp_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "session_pause_points_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_responses: {
        Row: {
          audience_type: string
          created_at: string
          denial_reason: string | null
          display_name: string
          hidden: boolean
          id: string
          is_public: boolean
          moderation_status: string | null
          prompt_type: string
          response_text: string
          session_code: string
          show_name: boolean
          user_id: string | null
          week_number: number
        }
        Insert: {
          audience_type?: string
          created_at?: string
          denial_reason?: string | null
          display_name?: string
          hidden?: boolean
          id?: string
          is_public?: boolean
          moderation_status?: string | null
          prompt_type?: string
          response_text: string
          session_code: string
          show_name?: boolean
          user_id?: string | null
          week_number: number
        }
        Update: {
          audience_type?: string
          created_at?: string
          denial_reason?: string | null
          display_name?: string
          hidden?: boolean
          id?: string
          is_public?: boolean
          moderation_status?: string | null
          prompt_type?: string
          response_text?: string
          session_code?: string
          show_name?: boolean
          user_id?: string | null
          week_number?: number
        }
        Relationships: []
      }
      sessions: {
        Row: {
          active_slide: number | null
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
          session_code: string | null
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
          active_slide?: number | null
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
          session_code?: string | null
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
          active_slide?: number | null
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
          session_code?: string | null
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
      shop_audit_log: {
        Row: {
          action: string
          actor: string | null
          actor_name: string | null
          after: Json | null
          before: Json | null
          created_at: string
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor?: string | null
          actor_name?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor?: string | null
          actor_name?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_audit_log_actor_fkey"
            columns: ["actor"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_customers: {
        Row: {
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          profile_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          profile_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          profile_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_customers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_discount_redemptions: {
        Row: {
          created_at: string
          discount_id: string
          id: string
          order_id: string
        }
        Insert: {
          created_at?: string
          discount_id: string
          id?: string
          order_id: string
        }
        Update: {
          created_at?: string
          discount_id?: string
          id?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_discount_redemptions_discount_id_fkey"
            columns: ["discount_id"]
            isOneToOne: false
            referencedRelation: "shop_discounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_discount_redemptions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "shop_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_discounts: {
        Row: {
          code: string
          created_at: string
          ends_at: string | null
          id: string
          is_active: boolean
          kind: string
          note: string | null
          product_ids: string[]
          scope: string
          starts_at: string | null
          times_used: number
          updated_at: string
          usage_limit: number | null
          value_cents: number
          value_percent: number | null
        }
        Insert: {
          code: string
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          kind: string
          note?: string | null
          product_ids?: string[]
          scope?: string
          starts_at?: string | null
          times_used?: number
          updated_at?: string
          usage_limit?: number | null
          value_cents?: number
          value_percent?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          ends_at?: string | null
          id?: string
          is_active?: boolean
          kind?: string
          note?: string | null
          product_ids?: string[]
          scope?: string
          starts_at?: string | null
          times_used?: number
          updated_at?: string
          usage_limit?: number | null
          value_cents?: number
          value_percent?: number | null
        }
        Relationships: []
      }
      shop_fulfillment_items: {
        Row: {
          fulfillment_id: string
          id: string
          order_item_id: string
          quantity: number
        }
        Insert: {
          fulfillment_id: string
          id?: string
          order_item_id: string
          quantity: number
        }
        Update: {
          fulfillment_id?: string
          id?: string
          order_item_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "shop_fulfillment_items_fulfillment_id_fkey"
            columns: ["fulfillment_id"]
            isOneToOne: false
            referencedRelation: "shop_fulfillments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_fulfillment_items_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "shop_order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_fulfillments: {
        Row: {
          carrier: string | null
          created_at: string
          created_by: string | null
          delivered_at: string | null
          id: string
          order_id: string
          shipped_at: string | null
          status: string
          tracking_number: string | null
          tracking_url: string | null
        }
        Insert: {
          carrier?: string | null
          created_at?: string
          created_by?: string | null
          delivered_at?: string | null
          id?: string
          order_id: string
          shipped_at?: string | null
          status?: string
          tracking_number?: string | null
          tracking_url?: string | null
        }
        Update: {
          carrier?: string | null
          created_at?: string
          created_by?: string | null
          delivered_at?: string | null
          id?: string
          order_id?: string
          shipped_at?: string | null
          status?: string
          tracking_number?: string | null
          tracking_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_fulfillments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_fulfillments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "shop_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_inventory_movements: {
        Row: {
          actor: string | null
          created_at: string
          id: string
          note: string | null
          order_id: string | null
          quantity_change: number
          reason: string | null
          type: string
          variant_id: string
        }
        Insert: {
          actor?: string | null
          created_at?: string
          id?: string
          note?: string | null
          order_id?: string | null
          quantity_change: number
          reason?: string | null
          type: string
          variant_id: string
        }
        Update: {
          actor?: string | null
          created_at?: string
          id?: string
          note?: string | null
          order_id?: string | null
          quantity_change?: number
          reason?: string | null
          type?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_inventory_movements_actor_fkey"
            columns: ["actor"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_inventory_movements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "shop_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_inventory_movements_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "shop_product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_inventory_reservations: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          quantity: number
          session_key: string
          state: string
          variant_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          quantity: number
          session_key: string
          state?: string
          variant_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          quantity?: number
          session_key?: string
          state?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_inventory_reservations_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "shop_product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_notification_log: {
        Row: {
          created_at: string
          error: string | null
          id: string
          order_id: string | null
          provider_message_id: string | null
          recipient: string
          status: string
          type: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          order_id?: string | null
          provider_message_id?: string | null
          recipient: string
          status: string
          type: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          order_id?: string | null
          provider_message_id?: string | null
          recipient?: string
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_notification_log_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "shop_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_order_events: {
        Row: {
          actor: string | null
          actor_name: string | null
          created_at: string
          id: string
          metadata: Json
          note: string | null
          order_id: string
          type: string
        }
        Insert: {
          actor?: string | null
          actor_name?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          note?: string | null
          order_id: string
          type: string
        }
        Update: {
          actor?: string | null
          actor_name?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          note?: string | null
          order_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_order_events_actor_fkey"
            columns: ["actor"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "shop_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_order_items: {
        Row: {
          created_at: string
          gst_cents: number
          id: string
          line_total_cents: number
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          sku: string | null
          slug: string
          unit_price_cents: number
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          gst_cents?: number
          id?: string
          line_total_cents: number
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          sku?: string | null
          slug?: string
          unit_price_cents: number
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          gst_cents?: number
          id?: string
          line_total_cents?: number
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          sku?: string | null
          slug?: string
          unit_price_cents?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "shop_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "shop_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "shop_product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_orders: {
        Row: {
          amount_total_cents: number
          bill_city: string | null
          bill_country: string | null
          bill_line1: string | null
          bill_line2: string | null
          bill_name: string | null
          bill_postcode: string | null
          collected_at: string | null
          collected_by: string | null
          confirmation_email_sent_at: string | null
          created_at: string
          currency: string
          customer_email: string | null
          customer_first_name: string | null
          customer_id: string | null
          customer_last_name: string | null
          customer_phone: string | null
          discount_cents: number
          discount_code: string | null
          fulfilment: string
          fulfilment_status: string
          gst_cents: number
          id: string
          note: string | null
          order_number: string | null
          partner_name: string | null
          payment_status: string
          pickup_code: string
          product_id: string | null
          product_name: string
          profile_id: string | null
          quantity: number
          refunded_cents: number
          scheduled_session_id: string | null
          ship_city: string | null
          ship_country: string | null
          ship_line1: string | null
          ship_line2: string | null
          ship_name: string | null
          ship_postcode: string | null
          shipped_at: string | null
          shipped_email_sent_at: string | null
          shipping_cents: number
          status: string
          stripe_payment_intent: string | null
          stripe_session_id: string | null
          tracking_number: string | null
          tracking_url: string | null
          unit_price_cents: number
          updated_at: string
        }
        Insert: {
          amount_total_cents: number
          bill_city?: string | null
          bill_country?: string | null
          bill_line1?: string | null
          bill_line2?: string | null
          bill_name?: string | null
          bill_postcode?: string | null
          collected_at?: string | null
          collected_by?: string | null
          confirmation_email_sent_at?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_first_name?: string | null
          customer_id?: string | null
          customer_last_name?: string | null
          customer_phone?: string | null
          discount_cents?: number
          discount_code?: string | null
          fulfilment?: string
          fulfilment_status?: string
          gst_cents?: number
          id?: string
          note?: string | null
          order_number?: string | null
          partner_name?: string | null
          payment_status?: string
          pickup_code?: string
          product_id?: string | null
          product_name: string
          profile_id?: string | null
          quantity?: number
          refunded_cents?: number
          scheduled_session_id?: string | null
          ship_city?: string | null
          ship_country?: string | null
          ship_line1?: string | null
          ship_line2?: string | null
          ship_name?: string | null
          ship_postcode?: string | null
          shipped_at?: string | null
          shipped_email_sent_at?: string | null
          shipping_cents?: number
          status?: string
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          unit_price_cents: number
          updated_at?: string
        }
        Update: {
          amount_total_cents?: number
          bill_city?: string | null
          bill_country?: string | null
          bill_line1?: string | null
          bill_line2?: string | null
          bill_name?: string | null
          bill_postcode?: string | null
          collected_at?: string | null
          collected_by?: string | null
          confirmation_email_sent_at?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_first_name?: string | null
          customer_id?: string | null
          customer_last_name?: string | null
          customer_phone?: string | null
          discount_cents?: number
          discount_code?: string | null
          fulfilment?: string
          fulfilment_status?: string
          gst_cents?: number
          id?: string
          note?: string | null
          order_number?: string | null
          partner_name?: string | null
          payment_status?: string
          pickup_code?: string
          product_id?: string | null
          product_name?: string
          profile_id?: string | null
          quantity?: number
          refunded_cents?: number
          scheduled_session_id?: string | null
          ship_city?: string | null
          ship_country?: string | null
          ship_line1?: string | null
          ship_line2?: string | null
          ship_name?: string | null
          ship_postcode?: string | null
          shipped_at?: string | null
          shipped_email_sent_at?: string | null
          shipping_cents?: number
          status?: string
          stripe_payment_intent?: string | null
          stripe_session_id?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          unit_price_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_orders_collected_by_fkey"
            columns: ["collected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "shop_customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "shop_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_orders_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_orders_scheduled_session_id_fkey"
            columns: ["scheduled_session_id"]
            isOneToOne: false
            referencedRelation: "scheduled_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_payments: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          id: string
          kind: string
          order_id: string
          status: string
          stripe_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          id?: string
          kind: string
          order_id: string
          status?: string
          stripe_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          kind?: string
          order_id?: string
          status?: string
          stripe_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "shop_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_product_variants: {
        Row: {
          allow_backorder: boolean
          cost_price_cents: number | null
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          option_values: string | null
          price_override_cents: number | null
          product_id: string
          sku: string | null
          sort_order: number
          stock_available: number
          updated_at: string
          weight_g: number | null
        }
        Insert: {
          allow_backorder?: boolean
          cost_price_cents?: number | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          option_values?: string | null
          price_override_cents?: number | null
          product_id: string
          sku?: string | null
          sort_order?: number
          stock_available?: number
          updated_at?: string
          weight_g?: number | null
        }
        Update: {
          allow_backorder?: boolean
          cost_price_cents?: number | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          option_values?: string | null
          price_override_cents?: number | null
          product_id?: string
          sku?: string | null
          sort_order?: number
          stock_available?: number
          updated_at?: string
          weight_g?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "shop_products"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_products: {
        Row: {
          allow_backorder: boolean
          barcode: string | null
          bundle_slugs: string[]
          category: string | null
          compare_at_price_cents: number | null
          cost_price_cents: number | null
          created_at: string
          currency: string
          description: string | null
          dimensions_mm: string | null
          featured: boolean
          fulfilment: string
          gallery_urls: string[]
          gst_treatment: string
          id: string
          image_alt: string | null
          image_url: string | null
          is_active: boolean
          long_description: string
          low_stock_threshold: number
          materials: string | null
          name: string
          partner_name: string | null
          price_cents: number
          sku: string | null
          slug: string
          sort_order: number
          status: string
          stripe_price_id: string | null
          tagline: string
          tags: string[]
          track_stock: boolean
          updated_at: string
          weight_g: number | null
        }
        Insert: {
          allow_backorder?: boolean
          barcode?: string | null
          bundle_slugs?: string[]
          category?: string | null
          compare_at_price_cents?: number | null
          cost_price_cents?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          dimensions_mm?: string | null
          featured?: boolean
          fulfilment?: string
          gallery_urls?: string[]
          gst_treatment?: string
          id?: string
          image_alt?: string | null
          image_url?: string | null
          is_active?: boolean
          long_description?: string
          low_stock_threshold?: number
          materials?: string | null
          name: string
          partner_name?: string | null
          price_cents: number
          sku?: string | null
          slug: string
          sort_order?: number
          status?: string
          stripe_price_id?: string | null
          tagline?: string
          tags?: string[]
          track_stock?: boolean
          updated_at?: string
          weight_g?: number | null
        }
        Update: {
          allow_backorder?: boolean
          barcode?: string | null
          bundle_slugs?: string[]
          category?: string | null
          compare_at_price_cents?: number | null
          cost_price_cents?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          dimensions_mm?: string | null
          featured?: boolean
          fulfilment?: string
          gallery_urls?: string[]
          gst_treatment?: string
          id?: string
          image_alt?: string | null
          image_url?: string | null
          is_active?: boolean
          long_description?: string
          low_stock_threshold?: number
          materials?: string | null
          name?: string
          partner_name?: string | null
          price_cents?: number
          sku?: string | null
          slug?: string
          sort_order?: number
          status?: string
          stripe_price_id?: string | null
          tagline?: string
          tags?: string[]
          track_stock?: boolean
          updated_at?: string
          weight_g?: number | null
        }
        Relationships: []
      }
      shop_refunds: {
        Row: {
          actor: string | null
          amount_cents: number
          created_at: string
          id: string
          items: Json
          order_id: string
          reason: string | null
          restock: boolean
          shipping_cents: number
          status: string
          stripe_refund_id: string | null
        }
        Insert: {
          actor?: string | null
          amount_cents: number
          created_at?: string
          id?: string
          items?: Json
          order_id: string
          reason?: string | null
          restock?: boolean
          shipping_cents?: number
          status?: string
          stripe_refund_id?: string | null
        }
        Update: {
          actor?: string | null
          amount_cents?: number
          created_at?: string
          id?: string
          items?: Json
          order_id?: string
          reason?: string | null
          restock?: boolean
          shipping_cents?: number
          status?: string
          stripe_refund_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_refunds_actor_fkey"
            columns: ["actor"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "shop_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      staff_compliance_records: {
        Row: {
          category: string
          created_at: string
          detail: string
          id: string
          recorded_by: string | null
          status: string
          user_id: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          category: string
          created_at?: string
          detail?: string
          id?: string
          recorded_by?: string | null
          status?: string
          user_id: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          detail?: string
          id?: string
          recorded_by?: string | null
          status?: string
          user_id?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      staff_document_signatures: {
        Row: {
          declaration: string
          document_id: string
          document_version: string
          id: string
          signed_at: string
          user_id: string
        }
        Insert: {
          declaration: string
          document_id: string
          document_version: string
          id?: string
          signed_at?: string
          user_id: string
        }
        Update: {
          declaration?: string
          document_id?: string
          document_version?: string
          id?: string
          signed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_document_signatures_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "staff_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_document_versions: {
        Row: {
          body_md: string | null
          captured_at: string
          document_id: string
          id: string
          version: string
        }
        Insert: {
          body_md?: string | null
          captured_at?: string
          document_id: string
          id?: string
          version: string
        }
        Update: {
          body_md?: string | null
          captured_at?: string
          document_id?: string
          id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "staff_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_documents: {
        Row: {
          access: string
          body_md: string | null
          category: string
          code: string
          effective_date: string | null
          id: string
          issued_date: string | null
          notion_page_id: string | null
          source: string
          status: string
          storage_path: string | null
          summary: string
          sync_flag: string | null
          synced_at: string | null
          title: string
          version: string
        }
        Insert: {
          access?: string
          body_md?: string | null
          category?: string
          code: string
          effective_date?: string | null
          id?: string
          issued_date?: string | null
          notion_page_id?: string | null
          source?: string
          status?: string
          storage_path?: string | null
          summary?: string
          sync_flag?: string | null
          synced_at?: string | null
          title: string
          version?: string
        }
        Update: {
          access?: string
          body_md?: string | null
          category?: string
          code?: string
          effective_date?: string | null
          id?: string
          issued_date?: string | null
          notion_page_id?: string | null
          source?: string
          status?: string
          storage_path?: string | null
          summary?: string
          sync_flag?: string | null
          synced_at?: string | null
          title?: string
          version?: string
        }
        Relationships: []
      }
      staff_incident_training_records: {
        Row: {
          created_at: string
          due_at: string | null
          id: string
          module_id: string | null
          recorded_by: string | null
          reference_code: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_at?: string | null
          id?: string
          module_id?: string | null
          recorded_by?: string | null
          reference_code: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          due_at?: string | null
          id?: string
          module_id?: string | null
          recorded_by?: string | null
          reference_code?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_incident_training_records_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "staff_training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_policy_acknowledgements: {
        Row: {
          acknowledged_at: string
          declaration: string
          evidence_progress_id: string | null
          id: string
          policy_code: string
          policy_version: string
          title: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string
          declaration?: string
          evidence_progress_id?: string | null
          id?: string
          policy_code: string
          policy_version: string
          title: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string
          declaration?: string
          evidence_progress_id?: string | null
          id?: string
          policy_code?: string
          policy_version?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_policy_acknowledgements_evidence_progress_id_fkey"
            columns: ["evidence_progress_id"]
            isOneToOne: false
            referencedRelation: "staff_training_progress"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_training_checkpoints: {
        Row: {
          correct: Json | null
          id: string
          kind: string
          lesson_id: string | null
          module_id: string | null
          options: Json
          policy_code: string | null
          policy_version: string | null
          position: number
          prompt: string
          required: boolean
          scoreable: boolean
        }
        Insert: {
          correct?: Json | null
          id?: string
          kind: string
          lesson_id?: string | null
          module_id?: string | null
          options?: Json
          policy_code?: string | null
          policy_version?: string | null
          position: number
          prompt: string
          required?: boolean
          scoreable?: boolean
        }
        Update: {
          correct?: Json | null
          id?: string
          kind?: string
          lesson_id?: string | null
          module_id?: string | null
          options?: Json
          policy_code?: string | null
          policy_version?: string | null
          position?: number
          prompt?: string
          required?: boolean
          scoreable?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "staff_training_checkpoints_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "staff_training_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_training_checkpoints_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "staff_training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_training_lessons: {
        Row: {
          body: string
          id: string
          media_url: string | null
          module_id: string
          position: number
          title: string
        }
        Insert: {
          body?: string
          id?: string
          media_url?: string | null
          module_id: string
          position: number
          title: string
        }
        Update: {
          body?: string
          id?: string
          media_url?: string | null
          module_id?: string
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_training_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "staff_training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_training_modules: {
        Row: {
          ack_required: boolean
          code: string
          created_at: string
          effective_date: string
          est_minutes: number
          gate: string
          id: string
          pass_mark: number | null
          position: number
          summary: string
          title: string
          version: number
        }
        Insert: {
          ack_required?: boolean
          code: string
          created_at?: string
          effective_date?: string
          est_minutes?: number
          gate: string
          id?: string
          pass_mark?: number | null
          position: number
          summary?: string
          title: string
          version?: number
        }
        Update: {
          ack_required?: boolean
          code?: string
          created_at?: string
          effective_date?: string
          est_minutes?: number
          gate?: string
          id?: string
          pass_mark?: number | null
          position?: number
          summary?: string
          title?: string
          version?: number
        }
        Relationships: []
      }
      staff_training_progress: {
        Row: {
          attempts: number
          completed_at: string | null
          due_at: string | null
          expires_at: string | null
          id: string
          module_code: string
          module_id: string
          module_version: number
          score: number | null
          started_at: string
          status: string
          superseded: boolean
          user_id: string
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          due_at?: string | null
          expires_at?: string | null
          id?: string
          module_code: string
          module_id: string
          module_version: number
          score?: number | null
          started_at?: string
          status?: string
          superseded?: boolean
          user_id: string
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          due_at?: string | null
          expires_at?: string | null
          id?: string
          module_code?: string
          module_id?: string
          module_version?: number
          score?: number | null
          started_at?: string
          status?: string
          superseded?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_training_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "staff_training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_training_requirements: {
        Row: {
          id: string
          module_id: string
          required: boolean
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          id?: string
          module_id: string
          required?: boolean
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          id?: string
          module_id?: string
          required?: boolean
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "staff_training_requirements_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "staff_training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_training_responses: {
        Row: {
          attempt: number
          checkpoint_id: string
          id: string
          is_correct: boolean | null
          progress_id: string
          response: Json
          saved_at: string
        }
        Insert: {
          attempt?: number
          checkpoint_id: string
          id?: string
          is_correct?: boolean | null
          progress_id: string
          response?: Json
          saved_at?: string
        }
        Update: {
          attempt?: number
          checkpoint_id?: string
          id?: string
          is_correct?: boolean | null
          progress_id?: string
          response?: Json
          saved_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_training_responses_checkpoint_id_fkey"
            columns: ["checkpoint_id"]
            isOneToOne: false
            referencedRelation: "staff_training_checkpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_training_responses_progress_id_fkey"
            columns: ["progress_id"]
            isOneToOne: false
            referencedRelation: "staff_training_progress"
            referencedColumns: ["id"]
          },
        ]
      }
      story_submissions: {
        Row: {
          ai_flag_reason: string | null
          ai_flagged: boolean | null
          approved_at: string | null
          created_at: string | null
          display_name: string
          id: string
          last_week_goal: string | null
          profile_id: string | null
          session_id: string | null
          show_name: boolean | null
          status: string | null
          success_story: string
        }
        Insert: {
          ai_flag_reason?: string | null
          ai_flagged?: boolean | null
          approved_at?: string | null
          created_at?: string | null
          display_name: string
          id?: string
          last_week_goal?: string | null
          profile_id?: string | null
          session_id?: string | null
          show_name?: boolean | null
          status?: string | null
          success_story: string
        }
        Update: {
          ai_flag_reason?: string | null
          ai_flagged?: boolean | null
          approved_at?: string | null
          created_at?: string | null
          display_name?: string
          id?: string
          last_week_goal?: string | null
          profile_id?: string | null
          session_id?: string | null
          show_name?: boolean | null
          status?: string | null
          success_story?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_submissions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_submissions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          bundle_adults: number
          bundle_children: number
          bundle_teens: number
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          family_discount: boolean
          household_id: string | null
          id: string
          plan: string | null
          price_id: string | null
          profile_id: string | null
          quantity: number
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          tier: string | null
          updated_at: string
        }
        Insert: {
          bundle_adults?: number
          bundle_children?: number
          bundle_teens?: number
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          family_discount?: boolean
          household_id?: string | null
          id?: string
          plan?: string | null
          price_id?: string | null
          profile_id?: string | null
          quantity?: number
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          tier?: string | null
          updated_at?: string
        }
        Update: {
          bundle_adults?: number
          bundle_children?: number
          bundle_teens?: number
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          family_discount?: boolean
          household_id?: string | null
          id?: string
          plan?: string | null
          price_id?: string | null
          profile_id?: string | null
          quantity?: number
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          tier?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teen_workbook_entries: {
        Row: {
          big_idea_text: string | null
          block_name: string | null
          challenge_prompt: string | null
          challenge_response: string | null
          completed_at: string | null
          created_at: string
          first_step: string | null
          id: string
          last_week_goal_review: string | null
          personal_reflection: string | null
          personal_reflection_prompt: string | null
          profile_id: string | null
          question_1: string | null
          question_1_answer: string | null
          question_2: string | null
          question_2_answer: string | null
          session_id: string | null
          updated_at: string
          video_title: string | null
          week_theme: string | null
          weekly_goal: string | null
          what_caught_attention: string | null
        }
        Insert: {
          big_idea_text?: string | null
          block_name?: string | null
          challenge_prompt?: string | null
          challenge_response?: string | null
          completed_at?: string | null
          created_at?: string
          first_step?: string | null
          id?: string
          last_week_goal_review?: string | null
          personal_reflection?: string | null
          personal_reflection_prompt?: string | null
          profile_id?: string | null
          question_1?: string | null
          question_1_answer?: string | null
          question_2?: string | null
          question_2_answer?: string | null
          session_id?: string | null
          updated_at?: string
          video_title?: string | null
          week_theme?: string | null
          weekly_goal?: string | null
          what_caught_attention?: string | null
        }
        Update: {
          big_idea_text?: string | null
          block_name?: string | null
          challenge_prompt?: string | null
          challenge_response?: string | null
          completed_at?: string | null
          created_at?: string
          first_step?: string | null
          id?: string
          last_week_goal_review?: string | null
          personal_reflection?: string | null
          personal_reflection_prompt?: string | null
          profile_id?: string | null
          question_1?: string | null
          question_1_answer?: string | null
          question_2?: string | null
          question_2_answer?: string | null
          session_id?: string | null
          updated_at?: string
          video_title?: string | null
          week_theme?: string | null
          weekly_goal?: string | null
          what_caught_attention?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teen_workbook_entries_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teen_workbook_entries_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      trial_tickets: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          follow_up_sent_at: string | null
          full_name: string
          guardian_consent_at: string | null
          guardian_name: string | null
          guests: Json
          id: string
          intended_date: string | null
          marketing_opt_out: boolean
          phone: string | null
          redeemed_at: string | null
          redeemed_by: string | null
          token: string
          track: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          follow_up_sent_at?: string | null
          full_name: string
          guardian_consent_at?: string | null
          guardian_name?: string | null
          guests?: Json
          id?: string
          intended_date?: string | null
          marketing_opt_out?: boolean
          phone?: string | null
          redeemed_at?: string | null
          redeemed_by?: string | null
          token: string
          track?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          follow_up_sent_at?: string | null
          full_name?: string
          guardian_consent_at?: string | null
          guardian_name?: string | null
          guests?: Json
          id?: string
          intended_date?: string | null
          marketing_opt_out?: boolean
          phone?: string | null
          redeemed_at?: string | null
          redeemed_by?: string | null
          token?: string
          track?: string
        }
        Relationships: []
      }
      unlocked_lessons: {
        Row: {
          facilitator_id: string | null
          id: string
          unlocked_at: string
          user_id: string | null
          week_number: number
        }
        Insert: {
          facilitator_id?: string | null
          id?: string
          unlocked_at?: string
          user_id?: string | null
          week_number: number
        }
        Update: {
          facilitator_id?: string | null
          id?: string
          unlocked_at?: string
          user_id?: string | null
          week_number?: number
        }
        Relationships: []
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
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          source?: string | null
        }
        Relationships: []
      }
      word_submissions: {
        Row: {
          created_at: string | null
          id: string
          profile_id: string | null
          session_id: string | null
          word: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          profile_id?: string | null
          session_id?: string | null
          word: string
        }
        Update: {
          created_at?: string | null
          id?: string
          profile_id?: string | null
          session_id?: string | null
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "word_submissions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "word_submissions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      workbook_entries: {
        Row: {
          accountability_person: string | null
          action_step: string | null
          arriving_word: string | null
          completed_at: string | null
          created_at: string | null
          first_impression: string | null
          free_notes: string | null
          goal_update_from_last_week: string | null
          id: string
          key_idea: string | null
          leaving_word: string | null
          leaving_word_status: string
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
          success_story: string | null
          weekly_goal: string | null
        }
        Insert: {
          accountability_person?: string | null
          action_step?: string | null
          arriving_word?: string | null
          completed_at?: string | null
          created_at?: string | null
          first_impression?: string | null
          free_notes?: string | null
          goal_update_from_last_week?: string | null
          id?: string
          key_idea?: string | null
          leaving_word?: string | null
          leaving_word_status?: string
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
          success_story?: string | null
          weekly_goal?: string | null
        }
        Update: {
          accountability_person?: string | null
          action_step?: string | null
          arriving_word?: string | null
          completed_at?: string | null
          created_at?: string | null
          first_impression?: string | null
          free_notes?: string | null
          goal_update_from_last_week?: string | null
          id?: string
          key_idea?: string | null
          leaving_word?: string | null
          leaving_word_status?: string
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
          success_story?: string | null
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
      worksheets: {
        Row: {
          audience_type: string
          coloring_pdf_url: string | null
          created_at: string
          id: string
          pdf_url: string | null
          price_nzd: number | null
          render_id: string | null
          render_status: string | null
          video_mp4_url: string | null
          video_url: string | null
          week_number: number
          worksheet_pdf_url: string | null
        }
        Insert: {
          audience_type?: string
          coloring_pdf_url?: string | null
          created_at?: string
          id?: string
          pdf_url?: string | null
          price_nzd?: number | null
          render_id?: string | null
          render_status?: string | null
          video_mp4_url?: string | null
          video_url?: string | null
          week_number: number
          worksheet_pdf_url?: string | null
        }
        Update: {
          audience_type?: string
          coloring_pdf_url?: string | null
          created_at?: string
          id?: string
          pdf_url?: string | null
          price_nzd?: number | null
          render_id?: string | null
          render_status?: string | null
          video_mp4_url?: string | null
          video_url?: string | null
          week_number?: number
          worksheet_pdf_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      mindcast_live_sessions_public: {
        Row: {
          ancient_wisdom_reframe: string | null
          audience: string | null
          core_affirmation: string | null
          core_concept: string | null
          created_at: string | null
          experiential_exercise: string | null
          guided_reflection: string | null
          id: string | null
          journaling_prompt: string | null
          opening_hook: string | null
          phase: number | null
          phase_name: string | null
          session_title: string | null
          signal_metaphor: string | null
          theme_title: string | null
          updated_at: string | null
          video_description: string | null
          video_link: string | null
          video_question_1: string | null
          video_question_2: string | null
          week_number: number | null
          weekly_practice_mon: string | null
          weekly_practice_sun: string | null
          weekly_practice_wed: string | null
        }
        Insert: {
          ancient_wisdom_reframe?: string | null
          audience?: string | null
          core_affirmation?: string | null
          core_concept?: string | null
          created_at?: string | null
          experiential_exercise?: string | null
          guided_reflection?: string | null
          id?: string | null
          journaling_prompt?: string | null
          opening_hook?: string | null
          phase?: number | null
          phase_name?: string | null
          session_title?: string | null
          signal_metaphor?: string | null
          theme_title?: string | null
          updated_at?: string | null
          video_description?: string | null
          video_link?: string | null
          video_question_1?: string | null
          video_question_2?: string | null
          week_number?: number | null
          weekly_practice_mon?: string | null
          weekly_practice_sun?: string | null
          weekly_practice_wed?: string | null
        }
        Update: {
          ancient_wisdom_reframe?: string | null
          audience?: string | null
          core_affirmation?: string | null
          core_concept?: string | null
          created_at?: string | null
          experiential_exercise?: string | null
          guided_reflection?: string | null
          id?: string | null
          journaling_prompt?: string | null
          opening_hook?: string | null
          phase?: number | null
          phase_name?: string | null
          session_title?: string | null
          signal_metaphor?: string | null
          theme_title?: string | null
          updated_at?: string | null
          video_description?: string | null
          video_link?: string | null
          video_question_1?: string | null
          video_question_2?: string | null
          week_number?: number | null
          weekly_practice_mon?: string | null
          weekly_practice_sun?: string | null
          weekly_practice_wed?: string | null
        }
        Relationships: []
      }
      session_evaluations_safe: {
        Row: {
          content_flags: string | null
          facilitator_id: string | null
          follow_up_needed: boolean | null
          id: string | null
          room_energy: number | null
          session_id: string | null
          submitted_at: string | null
          timing_notes: string | null
          track: string | null
          what_didnt: string | null
          what_worked: string | null
        }
        Insert: {
          content_flags?: string | null
          facilitator_id?: string | null
          follow_up_needed?: boolean | null
          id?: string | null
          room_energy?: number | null
          session_id?: string | null
          submitted_at?: string | null
          timing_notes?: string | null
          track?: string | null
          what_didnt?: string | null
          what_worked?: string | null
        }
        Update: {
          content_flags?: string | null
          facilitator_id?: string | null
          follow_up_needed?: boolean | null
          id?: string | null
          room_energy?: number | null
          session_id?: string | null
          submitted_at?: string | null
          timing_notes?: string | null
          track?: string | null
          what_didnt?: string | null
          what_worked?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_insights_stats: { Args: never; Returns: Json }
      admin_progress_stats: { Args: never; Returns: Json }
      annual_report_counters: {
        Args: { p_from?: string; p_to?: string }
        Returns: Json
      }
      can_access_room_roll: {
        Args: { p_date: string; p_room: string }
        Returns: boolean
      }
      can_access_track: { Args: { p_audience: string }; Returns: boolean }
      close_room: {
        Args: { p_date: string; p_room: string }
        Returns: undefined
      }
      collection_options: {
        Args: { p_child: string; p_date: string; p_room: string }
        Returns: {
          id: string
          kind: string
          name: string
        }[]
      }
      current_profile_id: { Args: never; Returns: string }
      curriculum_for_track: {
        Args: { p_audience: string; p_week?: number }
        Returns: Json[]
      }
      curriculum_public: {
        Args: { p_week?: number }
        Returns: {
          adult_video_title: string
          block_number: number
          block_theme: string
          core_learning: string
          kids_title: string
          teen_video_title: string
          week_number: number
          weekly_theme: string
        }[]
      }
      door_roster_for_token: {
        Args: { p_token: string }
        Returns: {
          checked_in_today: boolean
          display_name: string
          is_scanned_person: boolean
          kids_addon: boolean
          membership_status: string
          profile_id: string
          role_in_household: string
          track: string
        }[]
      }
      generate_pickup_code: { Args: never; Returns: string }
      guardians_to_notify: {
        Args: { target_profile: string }
        Returns: {
          email: string
          guardian_profile_id: string
          notify_absent: boolean
          notify_present: boolean
          notify_sms: boolean
          phone: string
        }[]
      }
      has_any_commerce_role: { Args: { _user_id: string }; Returns: boolean }
      has_commerce_admin: { Args: { _user_id: string }; Returns: boolean }
      has_fulfilment_role: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_support_role: { Args: { _user_id: string }; Returns: boolean }
      household_children_for: {
        Args: never
        Returns: {
          display_name: string
          profile_id: string
          role_in_household: string
          teen_self_signout: boolean
        }[]
      }
      is_active_member: { Args: never; Returns: boolean }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_guardian_of_profile: {
        Args: { target_profile: string }
        Returns: boolean
      }
      is_household_member: { Args: { h: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      lesson_unlocked: { Args: { week_number: number }; Returns: boolean }
      my_intention_for_week: {
        Args: { p_track?: string; p_week: number }
        Returns: {
          intention_outcome: string
          week_number: number
          weekly_intention: string
        }[]
      }
      my_intention_history: {
        Args: { p_track?: string }
        Returns: {
          intention_outcome: string
          week_number: number
          weekly_intention: string
        }[]
      }
      queue_notification: {
        Args: {
          p_client_event_id?: string
          p_event: string
          p_occurred_at?: string
          p_payload?: Json
          p_recipient: string
        }
        Returns: string
      }
      raise_room_alert: {
        Args: {
          p_body: string
          p_kind: string
          p_session_date?: string
          p_source_room: string
          p_subject_name: string
          p_target_room: string
        }
        Returns: string
      }
      rate_limit_check: {
        Args: { p_key: string; p_max: number; p_window_seconds: number }
        Returns: undefined
      }
      record_departure: {
        Args: {
          p_child: string
          p_client_event_id?: string
          p_collected_by_collector?: string
          p_collected_by_profile?: string
          p_date: string
          p_destination?: string
          p_occurred_at?: string
          p_reason: string
          p_room: string
        }
        Returns: string
      }
      redeem_trial_ticket: {
        Args: { p_staff: string; p_token: string }
        Returns: {
          full_name: string
          guests: Json
          ok: boolean
          reason: string
          track: string
        }[]
      }
      refresh_membership_entitlements: {
        Args: { p_household?: string; p_profile?: string }
        Returns: undefined
      }
      room_roll: {
        Args: { p_date: string; p_room: string }
        Returns: {
          departure_reason: string
          display_name: string
          guardian_name: string
          guardian_phone: string
          last_event: string
          occurred_at: string
          profile_id: string
          state: string
        }[]
      }
      room_roll_latest_events: {
        Args: { p_date: string }
        Returns: {
          departure_reason: string
          display_name: string
          event: string
          occurred_at: string
          room: string
          subject_profile_id: string
        }[]
      }
      set_intention_outcome: {
        Args: { p_outcome: string; p_track: string; p_week: number }
        Returns: undefined
      }
      set_teen_self_signout: {
        Args: { p_enabled: boolean; p_teen_profile: string }
        Returns: undefined
      }
      shop_adjust_stock: {
        Args: {
          p_actor?: string
          p_delta: number
          p_note?: string
          p_order_id?: string
          p_reason?: string
          p_type: string
          p_variant_id: string
        }
        Returns: undefined
      }
      shop_convert_reservation: {
        Args: { p_order_id: string; p_session_key: string }
        Returns: undefined
      }
      shop_increment_discount: {
        Args: { p_discount_id: string }
        Returns: undefined
      }
      shop_release_reservation: {
        Args: { p_session_key: string }
        Returns: undefined
      }
      shop_reserve_stock: {
        Args: {
          p_minutes?: number
          p_quantity: number
          p_session_key: string
          p_variant_id: string
        }
        Returns: undefined
      }
      wall_display_allowed: { Args: { p_profile: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "member"
        | "facilitator"
        | "admin"
        | "commerce_admin"
        | "fulfilment"
        | "support"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: [
        "member",
        "facilitator",
        "admin",
        "commerce_admin",
        "fulfilment",
        "support",
      ],
    },
  },
} as const
