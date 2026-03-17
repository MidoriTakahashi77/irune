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
          reminders: number[];
          color: string;
          recurrence: string | null;
          assigned_to: string[];
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
          reminders?: number[];
          color?: string;
          recurrence?: string | null;
          assigned_to?: string[];
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
          reminders?: number[];
          color?: string;
          recurrence?: string | null;
          assigned_to?: string[];
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
          subject_id: string | null;
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
          subject_id?: string | null;
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
          subject_id?: string | null;
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
          category: string;
          email: string | null;
          address: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          family_id: string;
          name: string;
          relationship: string;
          phone: string;
          is_priority?: boolean;
          category?: string;
          email?: string | null;
          address?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          family_id?: string;
          name?: string;
          relationship?: string;
          phone?: string;
          is_priority?: boolean;
          category?: string;
          email?: string | null;
          address?: string | null;
          notes?: string | null;
        };
      };
      notebook_pages: {
        Row: {
          id: string;
          note_id: string;
          title: string;
          content: string;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          note_id: string;
          title?: string;
          content?: string;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          note_id?: string;
          title?: string;
          content?: string;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      timeline_posts: {
        Row: {
          id: string;
          family_id: string;
          author_id: string;
          type: string;
          body: string | null;
          ref_id: string | null;
          ref_summary: string | null;
          reply_to_id: string | null;
          mentions: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          author_id: string;
          type?: string;
          body?: string | null;
          ref_id?: string | null;
          ref_summary?: string | null;
          reply_to_id?: string | null;
          mentions?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          family_id?: string;
          author_id?: string;
          type?: string;
          body?: string | null;
          ref_id?: string | null;
          ref_summary?: string | null;
          reply_to_id?: string | null;
          mentions?: string[];
          created_at?: string;
        };
      };
      timeline_comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          author_id?: string;
          body?: string;
          created_at?: string;
        };
      };
      timeline_reactions: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          emoji: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id: string;
          emoji: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          author_id?: string;
          emoji?: string;
          created_at?: string;
        };
      };
      timeline_reads: {
        Row: {
          user_id: string;
          family_id: string;
          last_read_at: string;
        };
        Insert: {
          user_id: string;
          family_id: string;
          last_read_at?: string;
        };
        Update: {
          user_id?: string;
          family_id?: string;
          last_read_at?: string;
        };
      };
      member_details: {
        Row: {
          id: string;
          profile_id: string;
          full_name: string | null;
          full_name_kana: string | null;
          birth_date: string | null;
          gender: string | null;
          blood_type: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          notes: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          full_name?: string | null;
          full_name_kana?: string | null;
          birth_date?: string | null;
          gender?: string | null;
          blood_type?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          profile_id?: string;
          full_name?: string | null;
          full_name_kana?: string | null;
          birth_date?: string | null;
          gender?: string | null;
          blood_type?: string | null;
          phone?: string | null;
          email?: string | null;
          address?: string | null;
          notes?: string | null;
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
