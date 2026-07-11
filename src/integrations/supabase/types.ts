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
      curriculum_weeks: {
        Row: {
          adult_search_notes: string | null
          adult_source: string | null
          adult_video_title: string | null
          block_number: number
          block_theme: string
          created_at: string
          id: string
          kids_activity_type: string | null
          kids_format: string | null
          kids_theme_notes: string | null
          kids_title: string | null
          pdf_reference: string | null
          teen_search_notes: string | null
          teen_source: string | null
          teen_video_title: string | null
          updated_at: string
          week_number: number
          weekly_theme: string
        }
        Insert: {
          adult_search_notes?: string | null
          adult_source?: string | null
          adult_video_title?: string | null
          block_number: number
          block_theme?: string
          created_at?: string
          id?: string
          kids_activity_type?: string | null
          kids_format?: string | null
          kids_theme_notes?: string | null
          kids_title?: string | null
          pdf_reference?: string | null
          teen_search_notes?: string | null
          teen_source?: string | null
          teen_video_title?: string | null
          updated_at?: string
          week_number: number
          weekly_theme?: string
        }
        Update: {
          adult_search_notes?: string | null
          adult_source?: string | null
          adult_video_title?: string | null
          block_number?: number
          block_theme?: string
          created_at?: string
          id?: string
          kids_activity_type?: string | null
          kids_format?: string | null
          kids_theme_notes?: string | null
          kids_title?: string | null
          pdf_reference?: string | null
          teen_search_notes?: string | null
          teen_source?: string | null
          teen_video_title?: string | null
          updated_at?: string
          week_number?: number
          weekly_theme?: string
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
      mindcast_live_sessions: {
        Row: {
          ancient_wisdom_reframe: string | null
          audience: string
          core_affirmation: string | null
          core_concept: string | null
          created_at: string
          experiential_exercise: string | null
          facilitator_notes: string | null
          film_script_2min: string | null
          guided_reflection: string | null
          id: string
          journaling_prompt: string | null
          opening_hook: string | null
          phase: number
          phase_name: string
          session_title: string | null
          signal_metaphor: string | null
          teaching_points: string | null
          theme_title: string
          updated_at: string
          video_backup_description: string | null
          video_description: string | null
          video_link: string | null
          week_number: number
          weekly_practice_mon: string | null
          weekly_practice_sun: string | null
          weekly_practice_wed: string | null
        }
        Insert: {
          ancient_wisdom_reframe?: string | null
          audience: string
          core_affirmation?: string | null
          core_concept?: string | null
          created_at?: string
          experiential_exercise?: string | null
          facilitator_notes?: string | null
          film_script_2min?: string | null
          guided_reflection?: string | null
          id?: string
          journaling_prompt?: string | null
          opening_hook?: string | null
          phase: number
          phase_name?: string
          session_title?: string | null
          signal_metaphor?: string | null
          teaching_points?: string | null
          theme_title?: string
          updated_at?: string
          video_backup_description?: string | null
          video_description?: string | null
          video_link?: string | null
          week_number: number
          weekly_practice_mon?: string | null
          weekly_practice_sun?: string | null
          weekly_practice_wed?: string | null
        }
        Update: {
          ancient_wisdom_reframe?: string | null
          audience?: string
          core_affirmation?: string | null
          core_concept?: string | null
          created_at?: string
          experiential_exercise?: string | null
          facilitator_notes?: string | null
          film_script_2min?: string | null
          guided_reflection?: string | null
          id?: string
          journaling_prompt?: string | null
          opening_hook?: string | null
          phase?: number
          phase_name?: string
          session_title?: string | null
          signal_metaphor?: string | null
          teaching_points?: string | null
          theme_title?: string
          updated_at?: string
          video_backup_description?: string | null
          video_description?: string | null
          video_link?: string | null
          week_number?: number
          weekly_practice_mon?: string | null
          weekly_practice_sun?: string | null
          weekly_practice_wed?: string | null
        }
        Relationships: []
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
          display_name: string
          email: string | null
          id: string
          is_active: boolean
          is_admin: boolean | null
          membership_status: string
          name: string
          nfc_id: string | null
          notify_practice_email: boolean
          notify_practice_push: boolean
          onboarding_complete: boolean | null
          opt_in_public_goals: boolean | null
          show_attendance_on_screen: boolean | null
          stripe_customer_id: string | null
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
          membership_status?: string
          name?: string
          nfc_id?: string | null
          notify_practice_email?: boolean
          notify_practice_push?: boolean
          onboarding_complete?: boolean | null
          opt_in_public_goals?: boolean | null
          show_attendance_on_screen?: boolean | null
          stripe_customer_id?: string | null
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
          membership_status?: string
          name?: string
          nfc_id?: string | null
          notify_practice_email?: boolean
          notify_practice_push?: boolean
          onboarding_complete?: boolean | null
          opt_in_public_goals?: boolean | null
          show_attendance_on_screen?: boolean | null
          stripe_customer_id?: string | null
          updated_at?: string
          user_id?: string
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
          display_name: string
          hidden: boolean
          id: string
          is_public: boolean
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
          display_name?: string
          hidden?: boolean
          id?: string
          is_public?: boolean
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
          display_name?: string
          hidden?: boolean
          id?: string
          is_public?: boolean
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
      unlocked_lessons: {
        Row: {
          facilitator_id: string | null
          id: string
          unlocked_at: string
          week_number: number
        }
        Insert: {
          facilitator_id?: string | null
          id?: string
          unlocked_at?: string
          week_number: number
        }
        Update: {
          facilitator_id?: string | null
          id?: string
          unlocked_at?: string
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
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
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
          created_at: string
          id: string
          pdf_url: string | null
          price_nzd: number | null
          render_id: string | null
          render_status: string | null
          video_mp4_url: string | null
          video_url: string | null
          week_number: number
        }
        Insert: {
          audience_type?: string
          created_at?: string
          id?: string
          pdf_url?: string | null
          price_nzd?: number | null
          render_id?: string | null
          render_status?: string | null
          video_mp4_url?: string | null
          video_url?: string | null
          week_number: number
        }
        Update: {
          audience_type?: string
          created_at?: string
          id?: string
          pdf_url?: string | null
          price_nzd?: number | null
          render_id?: string | null
          render_status?: string | null
          video_mp4_url?: string | null
          video_url?: string | null
          week_number?: number
        }
        Relationships: []
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
      app_role: "member" | "facilitator" | "admin"
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
      app_role: ["member", "facilitator", "admin"],
    },
  },
} as const
