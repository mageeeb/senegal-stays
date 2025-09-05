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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          check_in: string
          check_out: string
          created_at: string
          guest_id: string
          guests_count: number
          has_insurance: boolean | null
          id: string
          insurance_amount: number | null
          is_monthly: boolean | null
          monthly_unit_price: number | null
          months_count: number | null
          payment_method: string | null
          payment_status: string
          property_id: string
          special_requests: string | null
          status: string
          total_price: number
          updated_at: string
        }
        Insert: {
          check_in: string
          check_out: string
          created_at?: string
          guest_id: string
          guests_count?: number
          has_insurance?: boolean | null
          id?: string
          insurance_amount?: number | null
          is_monthly?: boolean | null
          monthly_unit_price?: number | null
          months_count?: number | null
          payment_method?: string | null
          payment_status?: string
          property_id: string
          special_requests?: string | null
          status?: string
          total_price: number
          updated_at?: string
        }
        Update: {
          check_in?: string
          check_out?: string
          created_at?: string
          guest_id?: string
          guests_count?: number
          has_insurance?: boolean | null
          id?: string
          insurance_amount?: number | null
          is_monthly?: boolean | null
          monthly_unit_price?: number | null
          months_count?: number | null
          payment_method?: string | null
          payment_status?: string
          property_id?: string
          special_requests?: string | null
          status?: string
          total_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          identity_verified: boolean | null
          is_host: boolean | null
          last_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          identity_verified?: boolean | null
          is_host?: boolean | null
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          identity_verified?: boolean | null
          is_host?: boolean | null
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          amenities: string[] | null
          available_from: string | null
          bathrooms: number | null
          bedrooms: number | null
          check_in_time: string | null
          check_out_time: string | null
          city: string
          country: string | null
          created_at: string
          deposit_amount: number | null
          description: string | null
          furnished: boolean | null
          host_id: string
          house_rules: string | null
          id: string
          is_active: boolean | null
          latitude: number | null
          long_term_enabled: boolean
          longitude: number | null
          max_guests: number
          max_months: number | null
          min_months: number | null
          monthly_price: number | null
          notice_period_days: number | null
          price_per_night: number
          property_type: string
          region: string | null
          rejection_reason: string | null
          title: string
          updated_at: string
          utilities_included: boolean | null
          utilities_notes: string | null
          validated_at: string | null
          validated_by: string | null
          validation_status: string | null
        }
        Insert: {
          address: string
          amenities?: string[] | null
          available_from?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          check_in_time?: string | null
          check_out_time?: string | null
          city: string
          country?: string | null
          created_at?: string
          deposit_amount?: number | null
          description?: string | null
          furnished?: boolean | null
          host_id: string
          house_rules?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          long_term_enabled?: boolean
          longitude?: number | null
          max_guests?: number
          max_months?: number | null
          min_months?: number | null
          monthly_price?: number | null
          notice_period_days?: number | null
          price_per_night: number
          property_type: string
          region?: string | null
          rejection_reason?: string | null
          title: string
          updated_at?: string
          utilities_included?: boolean | null
          utilities_notes?: string | null
          validated_at?: string | null
          validated_by?: string | null
          validation_status?: string | null
        }
        Update: {
          address?: string
          amenities?: string[] | null
          available_from?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          check_in_time?: string | null
          check_out_time?: string | null
          city?: string
          country?: string | null
          created_at?: string
          deposit_amount?: number | null
          description?: string | null
          furnished?: boolean | null
          host_id?: string
          house_rules?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          long_term_enabled?: boolean
          longitude?: number | null
          max_guests?: number
          max_months?: number | null
          min_months?: number | null
          monthly_price?: number | null
          notice_period_days?: number | null
          price_per_night?: number
          property_type?: string
          region?: string | null
          rejection_reason?: string | null
          title?: string
          updated_at?: string
          utilities_included?: boolean | null
          utilities_notes?: string | null
          validated_at?: string | null
          validated_by?: string | null
          validation_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      property_availability: {
        Row: {
          created_at: string
          date: string
          id: string
          is_available: boolean | null
          price_override: number | null
          property_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          is_available?: boolean | null
          price_override?: number | null
          property_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          is_available?: boolean | null
          price_override?: number | null
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_availability_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_evaluations: {
        Row: {
          comments: string | null
          created_at: string
          criteria_id: string
          evaluator_id: string
          id: string
          property_id: string
          score: number
        }
        Insert: {
          comments?: string | null
          created_at?: string
          criteria_id: string
          evaluator_id: string
          id?: string
          property_id: string
          score: number
        }
        Update: {
          comments?: string | null
          created_at?: string
          criteria_id?: string
          evaluator_id?: string
          id?: string
          property_id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "property_evaluations_criteria_id_fkey"
            columns: ["criteria_id"]
            isOneToOne: false
            referencedRelation: "validation_criteria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_evaluations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          image_url: string
          is_cover: boolean | null
          latitude: number | null
          property_id: string
          sort_order: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_cover?: boolean | null
          latitude?: number | null
          property_id: string
          sort_order?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_cover?: boolean | null
          latitude?: number | null
          property_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          id: string
          property_id: string
          rating: number
          reviewer_id: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          id?: string
          property_id: string
          rating: number
          reviewer_id: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          property_id?: string
          rating?: number
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      validation_criteria: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      vehicle_bookings: {
        Row: {
          additional_drivers: number | null
          created_at: string
          driver_license_number: string | null
          id: string
          insurance_type: string | null
          pickup_date: string
          pickup_location: string
          return_date: string
          return_location: string
          special_requests: string | null
          status: string
          total_days: number
          total_price: number
          updated_at: string
          user_id: string
          vehicle_id: string
        }
        Insert: {
          additional_drivers?: number | null
          created_at?: string
          driver_license_number?: string | null
          id?: string
          insurance_type?: string | null
          pickup_date: string
          pickup_location: string
          return_date: string
          return_location: string
          special_requests?: string | null
          status?: string
          total_days: number
          total_price: number
          updated_at?: string
          user_id: string
          vehicle_id: string
        }
        Update: {
          additional_drivers?: number | null
          created_at?: string
          driver_license_number?: string | null
          id?: string
          insurance_type?: string | null
          pickup_date?: string
          pickup_location?: string
          return_date?: string
          return_location?: string
          special_requests?: string | null
          status?: string
          total_days?: number
          total_price?: number
          updated_at?: string
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          image_url: string
          is_cover: boolean | null
          sort_order: number | null
          storage_path: string
          vehicle_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_cover?: boolean | null
          sort_order?: number | null
          storage_path: string
          vehicle_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_cover?: boolean | null
          sort_order?: number | null
          storage_path?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_images_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          brand: string
          category: string
          created_at: string
          description: string | null
          doors: number
          features: string[] | null
          fuel_type: string
          id: string
          image_url: string | null
          is_available: boolean
          location: string
          model: string
          name: string
          owner_id: string | null
          price_per_day: number
          seats: number
          transmission: string
          updated_at: string
          year: number
        }
        Insert: {
          brand: string
          category: string
          created_at?: string
          description?: string | null
          doors?: number
          features?: string[] | null
          fuel_type?: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          location: string
          model: string
          name: string
          owner_id?: string | null
          price_per_day: number
          seats?: number
          transmission?: string
          updated_at?: string
          year: number
        }
        Update: {
          brand?: string
          category?: string
          created_at?: string
          description?: string | null
          doors?: number
          features?: string[] | null
          fuel_type?: string
          id?: string
          image_url?: string | null
          is_available?: boolean
          location?: string
          model?: string
          name?: string
          owner_id?: string | null
          price_per_day?: number
          seats?: number
          transmission?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      popular_long_stay_cities_senegal: {
        Row: {
          bookings_count: number | null
          city: string | null
        }
        Relationships: []
      }
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
      app_role: "user" | "host" | "super_admin"
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
      app_role: ["user", "host", "super_admin"],
    },
  },
} as const
