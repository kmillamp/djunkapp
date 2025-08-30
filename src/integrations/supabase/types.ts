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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      action_plans: {
        Row: {
          created_at: string | null
          deadline: string | null
          id: string
          progress: number | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deadline?: string | null
          id?: string
          progress?: number | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deadline?: string | null
          id?: string
          progress?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      branding_configs: {
        Row: {
          brand_colors: Json | null
          communication_traits: Json | null
          core_values: string | null
          created_at: string | null
          id: string
          logo_url: string | null
          mission: string | null
          personality_traits: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          brand_colors?: Json | null
          communication_traits?: Json | null
          core_values?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          mission?: string | null
          personality_traits?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          brand_colors?: Json | null
          communication_traits?: Json | null
          core_values?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          mission?: string | null
          personality_traits?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      djs: {
        Row: {
          artist_name: string | null
          auth_user_id: string | null
          bio: string | null
          birth_date: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          instagram_url: string | null
          is_admin: boolean | null
          location: string | null
          password: string
          phone: string | null
          pix_key: string | null
          portfolio_url: string | null
          presskit_url: string | null
          updated_at: string | null
          youtube_url: string | null
         soundcloud_url:  string | null

        }
        Insert: {
          artist_name?: string | null
          auth_user_id?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          instagram_url?: string | null
          is_admin?: boolean | null
          location?: string | null
          password: string
          phone?: string | null
          pix_key?: string | null
          portfolio_url?: string | null
          presskit_url?: string | null
          updated_at?: string | null
          youtube_url?: string | null
          soundcloud_url:  string | null

        }
        Update: {
          artist_name?: string | null
          auth_user_id?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          instagram_url?: string | null
          is_admin?: boolean | null
          location?: string | null
          password?: string
          phone?: string | null
          pix_key?: string | null
          portfolio_url?: string | null
          presskit_url?: string | null
          updated_at?: string | null
          youtube_url?: string | null
          soundcloud_url:  string | null
        }
        Relationships: []
      }
      event_shares: {
        Row: {
          created_at: string
          created_by: string | null
          event_id: string | null
          id: string
          shared_with_user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          event_id?: string | null
          id?: string
          shared_with_user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          event_id?: string | null
          id?: string
          shared_with_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_shares_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          cache: number | null
          created_at: string | null
          description: string | null
          event_date: string
          event_name: string
          event_time: string | null
          id: string
          location: string | null
          payment_proof_url: string | null
          payment_status: string | null
          producer_contact: string | null
          producer_name: string | null
          shared_with_admin: boolean | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cache?: number | null
          created_at?: string | null
          description?: string | null
          event_date: string
          event_name: string
          event_time?: string | null
          id?: string
          location?: string | null
          payment_proof_url?: string | null
          payment_status?: string | null
          producer_contact?: string | null
          producer_name?: string | null
          shared_with_admin?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cache?: number | null
          created_at?: string | null
          description?: string | null
          event_date?: string
          event_name?: string
          event_time?: string | null
          id?: string
          location?: string | null
          payment_proof_url?: string | null
          payment_status?: string | null
          producer_contact?: string | null
          producer_name?: string | null
          shared_with_admin?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      financial_goals: {
        Row: {
          category: string | null
          created_at: string | null
          current_amount: number | null
          deadline: string | null
          id: string
          target_amount: number
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          current_amount?: number | null
          deadline?: string | null
          id?: string
          target_amount: number
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          current_amount?: number | null
          deadline?: string | null
          id?: string
          target_amount?: number
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      gratitude_entries: {
        Row: {
          created_at: string | null
          date: string
          id: string
          text: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          id?: string
          text: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          text?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      inspirational_quotes: {
        Row: {
          author: string | null
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          quote: string
          updated_at: string | null
        }
        Insert: {
          author?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          quote: string
          updated_at?: string | null
        }
        Update: {
          author?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          quote?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      mood_entries: {
        Row: {
          activities: string[] | null
          created_at: string | null
          date: string
          id: string
          mood: number
          note: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activities?: string[] | null
          created_at?: string | null
          date?: string
          id?: string
          mood: number
          note?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activities?: string[] | null
          created_at?: string | null
          date?: string
          id?: string
          mood?: number
          note?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          artist_name: string | null
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          instagram_url: string | null
          is_admin: boolean | null
          location: string | null
          phone: string | null
          pix_key: string | null
          portfolio_url: string | null
          presskit_url: string | null
          soundcloud_url: string | null
          updated_at: string | null
          youtube_url: string | null
        }
        Insert: {
          artist_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          instagram_url?: string | null
          is_admin?: boolean | null
          location?: string | null
          phone?: string | null
          pix_key?: string | null
          portfolio_url?: string | null
          presskit_url?: string | null
          soundcloud_url?: string | null
          updated_at?: string | null
          youtube_url?: string | null
        }
        Update: {
          artist_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          instagram_url?: string | null
          is_admin?: boolean | null
          location?: string | null
          phone?: string | null
          pix_key?: string | null
          portfolio_url?: string | null
          presskit_url?: string | null
          soundcloud_url?: string | null
          updated_at?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          content: string | null
          created_at: string | null
          current_progress: number | null
          deadline: string | null
          description: string | null
          id: string
          image_url: string | null
          post_type: string | null
          priority: string | null
          status: string | null
          target_value: number | null
          title: string
          type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          current_progress?: number | null
          deadline?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          post_type?: string | null
          priority?: string | null
          status?: string | null
          target_value?: number | null
          title: string
          type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          current_progress?: number | null
          deadline?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          post_type?: string | null
          priority?: string | null
          status?: string | null
          target_value?: number | null
          title?: string
          type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      prospeccoes: {
        Row: {
          contato: string
          created_at: string | null
          data: string | null
          email: string | null
          evento: string | null
          id: string
          nome: string
          observacao: string | null
          orcamento: string | null
          status: string | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          contato: string
          created_at?: string | null
          data?: string | null
          email?: string | null
          evento?: string | null
          id?: string
          nome: string
          observacao?: string | null
          orcamento?: string | null
          status?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          contato?: string
          created_at?: string | null
          data?: string | null
          email?: string | null
          evento?: string | null
          id?: string
          nome?: string
          observacao?: string | null
          orcamento?: string | null
          status?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recurring_bills: {
        Row: {
          amount: number
          category: string
          created_at: string
          due_day: number
          id: string
          is_active: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          due_day: number
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          due_day?: number
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      self_care_activities: {
        Row: {
          completed: boolean | null
          created_at: string | null
          date: string
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          date?: string
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          date?: string
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      self_care_habits: {
        Row: {
          category: string
          completed: boolean | null
          created_at: string | null
          date: string
          icon: string | null
          id: string
          name: string
          streak: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string
          completed?: boolean | null
          created_at?: string | null
          date?: string
          icon?: string | null
          id?: string
          name: string
          streak?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          completed?: boolean | null
          created_at?: string | null
          date?: string
          icon?: string | null
          id?: string
          name?: string
          streak?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      self_care_metrics: {
        Row: {
          created_at: string | null
          date: string
          id: string
          nutrition_score: number | null
          sleep_hours: number | null
          updated_at: string | null
          user_id: string
          water_intake: number | null
        }
        Insert: {
          created_at?: string | null
          date?: string
          id?: string
          nutrition_score?: number | null
          sleep_hours?: number | null
          updated_at?: string | null
          user_id: string
          water_intake?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          nutrition_score?: number | null
          sleep_hours?: number | null
          updated_at?: string | null
          user_id?: string
          water_intake?: number | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          date: string
          description: string
          gig_id: string | null
          id: string
          is_recurring: boolean | null
          month: number | null
          type: string
          user_id: string
          year: number | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          date: string
          description: string
          gig_id?: string | null
          id?: string
          is_recurring?: boolean | null
          month?: number | null
          type: string
          user_id: string
          year?: number | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          date?: string
          description?: string
          gig_id?: string | null
          id?: string
          is_recurring?: boolean | null
          month?: number | null
          type?: string
          user_id?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_random_quote: {
        Args: Record<PropertyKey, never>
        Returns: {
          author: string
          category: string
          id: string
          quote: string
        }[]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
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
