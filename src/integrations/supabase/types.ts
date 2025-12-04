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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      community_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          comments_count: number
          created_at: string
          crop_type: string | null
          description: string
          id: string
          image_url: string
          issue_detected: string | null
          likes_count: number
          moderation_note: string | null
          solutions: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comments_count?: number
          created_at?: string
          crop_type?: string | null
          description: string
          id?: string
          image_url: string
          issue_detected?: string | null
          likes_count?: number
          moderation_note?: string | null
          solutions?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comments_count?: number
          created_at?: string
          crop_type?: string | null
          description?: string
          id?: string
          image_url?: string
          issue_detected?: string | null
          likes_count?: number
          moderation_note?: string | null
          solutions?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      detection_history: {
        Row: {
          created_at: string
          detection_result: Json
          id: string
          image_url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          detection_result: Json
          id?: string
          image_url: string
          user_id: string
        }
        Update: {
          created_at?: string
          detection_result?: Json
          id?: string
          image_url?: string
          user_id?: string
        }
        Relationships: []
      }
      lesson_cache_metadata: {
        Row: {
          cached_at: string | null
          id: string
          lesson_id: string | null
          sync_status: string | null
          user_id: string | null
        }
        Insert: {
          cached_at?: string | null
          id?: string
          lesson_id?: string | null
          sync_status?: string | null
          user_id?: string | null
        }
        Update: {
          cached_at?: string | null
          id?: string
          lesson_id?: string | null
          sync_status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_cache_metadata_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          audio_url: string | null
          content: string
          content_hi: string | null
          content_kn: string | null
          created_at: string
          crop_type: string | null
          difficulty_level: string | null
          duration_seconds: number | null
          id: string
          lesson_type: string
          region: string | null
          slides: Json | null
          tags: string[] | null
          title: string
          title_hi: string | null
          title_kn: string | null
          updated_at: string
        }
        Insert: {
          audio_url?: string | null
          content: string
          content_hi?: string | null
          content_kn?: string | null
          created_at?: string
          crop_type?: string | null
          difficulty_level?: string | null
          duration_seconds?: number | null
          id?: string
          lesson_type?: string
          region?: string | null
          slides?: Json | null
          tags?: string[] | null
          title: string
          title_hi?: string | null
          title_kn?: string | null
          updated_at?: string
        }
        Update: {
          audio_url?: string | null
          content?: string
          content_hi?: string | null
          content_kn?: string | null
          created_at?: string
          crop_type?: string | null
          difficulty_level?: string | null
          duration_seconds?: number | null
          id?: string
          lesson_type?: string
          region?: string | null
          slides?: Json | null
          tags?: string[] | null
          title?: string
          title_hi?: string | null
          title_kn?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      qa_history: {
        Row: {
          answer: string
          answer_hi: string | null
          answer_kn: string | null
          created_at: string
          crop_type: string | null
          id: string
          question: string
          question_hi: string | null
          question_kn: string | null
          source_type: string | null
          user_id: string | null
        }
        Insert: {
          answer: string
          answer_hi?: string | null
          answer_kn?: string | null
          created_at?: string
          crop_type?: string | null
          id?: string
          question: string
          question_hi?: string | null
          question_kn?: string | null
          source_type?: string | null
          user_id?: string | null
        }
        Update: {
          answer?: string
          answer_hi?: string | null
          answer_kn?: string | null
          created_at?: string
          crop_type?: string | null
          id?: string
          question?: string
          question_hi?: string | null
          question_kn?: string | null
          source_type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_learning_progress: {
        Row: {
          completed: boolean | null
          created_at: string
          id: string
          last_accessed_at: string | null
          lesson_id: string | null
          score: number | null
          time_spent_seconds: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          id?: string
          last_accessed_at?: string | null
          lesson_id?: string | null
          score?: number | null
          time_spent_seconds?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          id?: string
          last_accessed_at?: string | null
          lesson_id?: string | null
          score?: number | null
          time_spent_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_learning_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_old_detection_history: { Args: never; Returns: undefined }
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
