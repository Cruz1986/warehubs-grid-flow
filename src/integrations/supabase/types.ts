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
      consignment_log: {
        Row: {
          completed_by: string | null
          completed_time: string | null
          consignment_id: string
          created_at: string | null
          created_by: string | null
          destination_facility: string
          id: string
          notes: string | null
          received_by: string | null
          received_count: number | null
          received_time: string | null
          source_facility: string
          status: string
          tote_count: number
        }
        Insert: {
          completed_by?: string | null
          completed_time?: string | null
          consignment_id: string
          created_at?: string | null
          created_by?: string | null
          destination_facility: string
          id?: string
          notes?: string | null
          received_by?: string | null
          received_count?: number | null
          received_time?: string | null
          source_facility: string
          status?: string
          tote_count?: number
        }
        Update: {
          completed_by?: string | null
          completed_time?: string | null
          consignment_id?: string
          created_at?: string | null
          created_by?: string | null
          destination_facility?: string
          id?: string
          notes?: string | null
          received_by?: string | null
          received_count?: number | null
          received_time?: string | null
          source_facility?: string
          status?: string
          tote_count?: number
        }
        Relationships: []
      }
      facility_master: {
        Row: {
          created_at: string | null
          id: string
          location: string | null
          name: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          location?: string | null
          name: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          location?: string | null
          name?: string
          type?: string
        }
        Relationships: []
      }
      grid_master: {
        Row: {
          created_at: string | null
          destination_name: string
          grid_no: string
          id: string
          source_name: string
        }
        Insert: {
          created_at?: string | null
          destination_name: string
          grid_no: string
          id?: string
          source_name: string
        }
        Update: {
          created_at?: string | null
          destination_name?: string
          grid_no?: string
          id?: string
          source_name?: string
        }
        Relationships: []
      }
      scan_error_logs: {
        Row: {
          error_message: string | null
          id: string
          operation_type: string | null
          operator: string | null
          resolved: boolean | null
          scan_data: Json | null
          timestamp: string | null
          tote_id: string | null
        }
        Insert: {
          error_message?: string | null
          id?: string
          operation_type?: string | null
          operator?: string | null
          resolved?: boolean | null
          scan_data?: Json | null
          timestamp?: string | null
          tote_id?: string | null
        }
        Update: {
          error_message?: string | null
          id?: string
          operation_type?: string | null
          operator?: string | null
          resolved?: boolean | null
          scan_data?: Json | null
          timestamp?: string | null
          tote_id?: string | null
        }
        Relationships: []
      }
      tote_inbound: {
        Row: {
          current_facility: string | null
          id: string
          operator_name: string
          source: string
          status: string
          timestamp_in: string | null
          tote_id: string
        }
        Insert: {
          current_facility?: string | null
          id?: string
          operator_name: string
          source: string
          status?: string
          timestamp_in?: string | null
          tote_id: string
        }
        Update: {
          current_facility?: string | null
          id?: string
          operator_name?: string
          source?: string
          status?: string
          timestamp_in?: string | null
          tote_id?: string
        }
        Relationships: []
      }
      tote_outbound: {
        Row: {
          completed_by: string | null
          completed_time: string | null
          consignment_id: string | null
          destination: string
          id: string
          operator_name: string
          status: string
          timestamp_out: string | null
          tote_id: string
        }
        Insert: {
          completed_by?: string | null
          completed_time?: string | null
          consignment_id?: string | null
          destination: string
          id?: string
          operator_name: string
          status?: string
          timestamp_out?: string | null
          tote_id: string
        }
        Update: {
          completed_by?: string | null
          completed_time?: string | null
          consignment_id?: string | null
          destination?: string
          id?: string
          operator_name?: string
          status?: string
          timestamp_out?: string | null
          tote_id?: string
        }
        Relationships: []
      }
      tote_register: {
        Row: {
          activity: string | null
          consignment_no: string | null
          created_at: string | null
          current_facility: string | null
          current_status: string | null
          destination: string | null
          grid_no: string | null
          ib_timestamp: string | null
          ob_timestamp: string | null
          outbound_by: string | null
          received_by: string | null
          source_facility: string | null
          staged_by: string | null
          staged_destination: string | null
          stagged_timestamp: string | null
          tote_id: string
          updated_at: string | null
        }
        Insert: {
          activity?: string | null
          consignment_no?: string | null
          created_at?: string | null
          current_facility?: string | null
          current_status?: string | null
          destination?: string | null
          grid_no?: string | null
          ib_timestamp?: string | null
          ob_timestamp?: string | null
          outbound_by?: string | null
          received_by?: string | null
          source_facility?: string | null
          staged_by?: string | null
          staged_destination?: string | null
          stagged_timestamp?: string | null
          tote_id: string
          updated_at?: string | null
        }
        Update: {
          activity?: string | null
          consignment_no?: string | null
          created_at?: string | null
          current_facility?: string | null
          current_status?: string | null
          destination?: string | null
          grid_no?: string | null
          ib_timestamp?: string | null
          ob_timestamp?: string | null
          outbound_by?: string | null
          received_by?: string | null
          source_facility?: string | null
          staged_by?: string | null
          staged_destination?: string | null
          stagged_timestamp?: string | null
          tote_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tote_staging: {
        Row: {
          destination: string
          grid_no: string
          grid_timestamp: string | null
          id: string
          operator_name: string
          staging_facility: string | null
          staging_time: string | null
          staging_user: string | null
          status: string
          tote_id: string
        }
        Insert: {
          destination: string
          grid_no: string
          grid_timestamp?: string | null
          id?: string
          operator_name: string
          staging_facility?: string | null
          staging_time?: string | null
          staging_user?: string | null
          status?: string
          tote_id: string
        }
        Update: {
          destination?: string
          grid_no?: string
          grid_timestamp?: string | null
          id?: string
          operator_name?: string
          staging_facility?: string | null
          staging_time?: string | null
          staging_user?: string | null
          status?: string
          tote_id?: string
        }
        Relationships: []
      }
      users_log: {
        Row: {
          created_at: string | null
          facility: string | null
          failed_attempts: number | null
          last_login: string | null
          password: string
          role: string
          status: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string | null
          facility?: string | null
          failed_attempts?: number | null
          last_login?: string | null
          password: string
          role?: string
          status?: string
          user_id?: string
          username: string
        }
        Update: {
          created_at?: string | null
          facility?: string | null
          failed_attempts?: number | null
          last_login?: string | null
          password?: string
          role?: string
          status?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_user: {
        Args: {
          p_username: string
          p_password: string
          p_role: string
          p_facility: string
        }
        Returns: Json
      }
      check_is_admin: {
        Args: { user_uid: string } | { username: string }
        Returns: boolean
      }
      create_admin_user: {
        Args: { admin_username: string; admin_password: string }
        Returns: Json
      }
      delete_user: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      register_inbound_tote: {
        Args: {
          p_tote_id: string
          p_source_facility: string
          p_inbound_operator: string
          p_current_facility: string
        }
        Returns: Json
      }
      reset_user_password: {
        Args: { p_user_id: string; p_new_password: string }
        Returns: boolean
      }
      update_last_login: {
        Args: { p_user_id: string; p_login_time?: string }
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
