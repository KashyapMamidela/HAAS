// Hand-written to match supabase/migrations/*.sql exactly, in the shape
// `supabase gen types typescript` produces. Once a local (`supabase start`)
// or linked hosted project is available, regenerate with:
//
//   npx supabase gen types typescript --local > src/lib/database.types.ts
//   npx supabase gen types typescript --linked > src/lib/database.types.ts
//
// and diff against this file — it should be a no-op if the schema matches.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: Database["public"]["Enums"]["user_role"];
          full_name: string | null;
          phone: string | null;
          dob: string | null;
          gender: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: Database["public"]["Enums"]["user_role"];
          full_name?: string | null;
          phone?: string | null;
          dob?: string | null;
          gender?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: Database["public"]["Enums"]["user_role"];
          full_name?: string | null;
          phone?: string | null;
          dob?: string | null;
          gender?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      departments: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          icon?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      doctors: {
        Row: {
          id: string;
          profile_id: string;
          department_id: string;
          specialization: string | null;
          qualification: string | null;
          fee: number;
          bio: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          department_id: string;
          specialization?: string | null;
          qualification?: string | null;
          fee?: number;
          bio?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          department_id?: string;
          specialization?: string | null;
          qualification?: string | null;
          fee?: number;
          bio?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "doctors_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "doctors_department_id_fkey";
            columns: ["department_id"];
            isOneToOne: false;
            referencedRelation: "departments";
            referencedColumns: ["id"];
          },
        ];
      };
      doctor_schedules: {
        Row: {
          id: string;
          doctor_id: string;
          weekday: number;
          start_time: string;
          end_time: string;
          slot_minutes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          doctor_id: string;
          weekday: number;
          start_time: string;
          end_time: string;
          slot_minutes?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          doctor_id?: string;
          weekday?: number;
          start_time?: string;
          end_time?: string;
          slot_minutes?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "doctor_schedules_doctor_id_fkey";
            columns: ["doctor_id"];
            isOneToOne: false;
            referencedRelation: "doctors";
            referencedColumns: ["id"];
          },
        ];
      };
      doctor_leaves: {
        Row: {
          id: string;
          doctor_id: string;
          date: string;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          doctor_id: string;
          date: string;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          doctor_id?: string;
          date?: string;
          reason?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "doctor_leaves_doctor_id_fkey";
            columns: ["doctor_id"];
            isOneToOne: false;
            referencedRelation: "doctors";
            referencedColumns: ["id"];
          },
        ];
      };
      appointments: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string;
          start_at: string;
          end_at: string;
          status: Database["public"]["Enums"]["appointment_status"];
          reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          doctor_id: string;
          start_at: string;
          end_at: string;
          status?: Database["public"]["Enums"]["appointment_status"];
          reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          doctor_id?: string;
          start_at?: string;
          end_at?: string;
          status?: Database["public"]["Enums"]["appointment_status"];
          reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "appointments_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey";
            columns: ["doctor_id"];
            isOneToOne: false;
            referencedRelation: "doctors";
            referencedColumns: ["id"];
          },
        ];
      };
      consultations: {
        Row: {
          id: string;
          appointment_id: string;
          notes: string | null;
          diagnosis: string | null;
          vitals: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          appointment_id: string;
          notes?: string | null;
          diagnosis?: string | null;
          vitals?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          appointment_id?: string;
          notes?: string | null;
          diagnosis?: string | null;
          vitals?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "consultations_appointment_id_fkey";
            columns: ["appointment_id"];
            isOneToOne: true;
            referencedRelation: "appointments";
            referencedColumns: ["id"];
          },
        ];
      };
      prescriptions: {
        Row: {
          id: string;
          consultation_id: string;
          medicines: Json;
          instructions: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          consultation_id: string;
          medicines?: Json;
          instructions?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          consultation_id?: string;
          medicines?: Json;
          instructions?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prescriptions_consultation_id_fkey";
            columns: ["consultation_id"];
            isOneToOne: false;
            referencedRelation: "consultations";
            referencedColumns: ["id"];
          },
        ];
      };
      medical_records: {
        Row: {
          id: string;
          patient_id: string;
          file_path: string;
          type: string | null;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          file_path: string;
          type?: string | null;
          uploaded_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          file_path?: string;
          type?: string | null;
          uploaded_by?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "medical_records_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "medical_records_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string | null;
          link: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          body?: string | null;
          link?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          body?: string | null;
          link?: string | null;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity: string;
          entity_id: string | null;
          meta: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity: string;
          entity_id?: string | null;
          meta?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          entity?: string;
          entity_id?: string | null;
          meta?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      auth_role: {
        Args: Record<PropertyKey, never>;
        Returns: Database["public"]["Enums"]["user_role"];
      };
      current_doctor_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      log_audit: {
        Args: {
          p_action: string;
          p_entity: string;
          p_entity_id?: string | null;
          p_meta?: Json | null;
        };
        Returns: undefined;
      };
      book_appointment: {
        Args: {
          p_doctor_id: string;
          p_start_at: string;
          p_reason?: string | null;
        };
        Returns: Database["public"]["Tables"]["appointments"]["Row"];
      };
      get_available_slots: {
        Args: {
          p_doctor_id: string;
          p_date: string;
        };
        Returns: { slot_start: string; slot_end: string }[];
      };
    };
    Enums: {
      user_role: "patient" | "doctor" | "admin";
      appointment_status:
        | "pending"
        | "confirmed"
        | "checked_in"
        | "in_consultation"
        | "completed"
        | "cancelled"
        | "no_show";
    };
    CompositeTypes: Record<string, never>;
  };
};
