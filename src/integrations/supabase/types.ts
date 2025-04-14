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
      facilities: {
        Row: {
          created_at: string | null
          id: string
          location: string
          name: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          location: string
          name: string
          type?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          location?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      grid_mappings: {
        Row: {
          created_at: string | null
          destination: string
          destination_type: string
          grid_number: string
          id: string
          source: string
          source_type: string
        }
        Insert: {
          created_at?: string | null
          destination: string
          destination_type: string
          grid_number: string
          id?: string
          source: string
          source_type: string
        }
        Update: {
          created_at?: string | null
          destination?: string
          destination_type?: string
          grid_number?: string
          id?: string
          source?: string
          source_type?: string
        }
        Relationships: []
      }
      grids: {
        Row: {
          created_at: string | null
          destination: string
          grid_number: string
          id: string
          status: string
          tote_id: string | null
        }
        Insert: {
          created_at?: string | null
          destination: string
          grid_number: string
          id?: string
          status?: string
          tote_id?: string | null
        }
        Update: {
          created_at?: string | null
          destination?: string
          grid_number?: string
          id?: string
          status?: string
          tote_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grids_tote_id_fkey"
            columns: ["tote_id"]
            isOneToOne: false
            referencedRelation: "totes"
            referencedColumns: ["id"]
          },
        ]
      }
      totes: {
        Row: {
          created_at: string | null
          facility_id: string | null
          id: string
          scanned_at: string | null
          scanned_by: string | null
          status: string
          tote_number: string
        }
        Insert: {
          created_at?: string | null
          facility_id?: string | null
          id?: string
          scanned_at?: string | null
          scanned_by?: string | null
          status?: string
          tote_number: string
        }
        Update: {
          created_at?: string | null
          facility_id?: string | null
          id?: string
          scanned_at?: string | null
          scanned_by?: string | null
          status?: string
          tote_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "totes_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "totes_scanned_by_fkey"
            columns: ["scanned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          facility: string
          id: string
          password: string
          role: string
          username: string
        }
        Insert: {
          created_at?: string | null
          facility: string
          id?: string
          password: string
          role?: string
          username: string
        }
        Update: {
          created_at?: string | null
          facility?: string
          id?: string
          password?: string
          role?: string
          username?: string
        }
        Relationships: []
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
