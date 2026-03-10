export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      families: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          family_id: string | null;
          display_name: string;
          avatar_url: string | null;
          role: string;
          color: string;
          relationship: string;
          relationship_label: string | null;
          managed_by: string | null;
        };
        Insert: {
          id?: string;
          family_id?: string | null;
          display_name: string;
          avatar_url?: string | null;
          role?: string;
          color?: string;
          relationship?: string;
          relationship_label?: string | null;
          managed_by?: string | null;
        };
        Update: {
          id?: string;
          family_id?: string | null;
          display_name?: string;
          avatar_url?: string | null;
          role?: string;
          color?: string;
          relationship?: string;
          relationship_label?: string | null;
          managed_by?: string | null;
        };
      };
      events: {
        Row: {
          id: string;
          family_id: string;
          created_by: string;
          title: string;
          category: string;
          start_at: string;
          end_at: string;
          all_day: boolean;
          notes: string | null;
          reminder: boolean;
          reminder_minutes: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          created_by: string;
          title: string;
          category?: string;
          start_at: string;
          end_at: string;
          all_day?: boolean;
          notes?: string | null;
          reminder?: boolean;
          reminder_minutes?: number | null;
        };
        Update: {
          id?: string;
          family_id?: string;
          created_by?: string;
          title?: string;
          category?: string;
          start_at?: string;
          end_at?: string;
          all_day?: boolean;
          notes?: string | null;
          reminder?: boolean;
          reminder_minutes?: number | null;
        };
      };
      diary_entries: {
        Row: {
          id: string;
          family_id: string;
          created_by: string;
          entry_date: string;
          title: string;
          body: string | null;
          mood: string | null;
          location: string | null;
          tags: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          created_by: string;
          entry_date: string;
          title: string;
          body?: string | null;
          mood?: string | null;
          location?: string | null;
          tags?: string[] | null;
        };
        Update: {
          id?: string;
          family_id?: string;
          created_by?: string;
          entry_date?: string;
          title?: string;
          body?: string | null;
          mood?: string | null;
          location?: string | null;
          tags?: string[] | null;
        };
      };
      diary_media: {
        Row: {
          id: string;
          diary_id: string;
          storage_path: string;
          media_type: string;
        };
        Insert: {
          id?: string;
          diary_id: string;
          storage_path: string;
          media_type: string;
        };
        Update: {
          id?: string;
          diary_id?: string;
          storage_path?: string;
          media_type?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          family_id: string;
          created_by: string;
          note_type: string;
          title: string;
          body: Json | null;
          is_locked: boolean;
          shared_with: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          created_by: string;
          note_type: string;
          title: string;
          body?: Json | null;
          is_locked?: boolean;
          shared_with?: string[] | null;
        };
        Update: {
          id?: string;
          family_id?: string;
          created_by?: string;
          note_type?: string;
          title?: string;
          body?: Json | null;
          is_locked?: boolean;
          shared_with?: string[] | null;
        };
      };
      emergency_contacts: {
        Row: {
          id: string;
          family_id: string;
          name: string;
          relationship: string;
          phone: string;
          is_priority: boolean;
        };
        Insert: {
          id?: string;
          family_id: string;
          name: string;
          relationship: string;
          phone: string;
          is_priority?: boolean;
        };
        Update: {
          id?: string;
          family_id?: string;
          name?: string;
          relationship?: string;
          phone?: string;
          is_priority?: boolean;
        };
      };
    };
    Functions: {
      get_user_family_id: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
  };
}
