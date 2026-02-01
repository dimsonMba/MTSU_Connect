import { supabase } from "@/lib/supabase";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  major: string | null;
  gpa: number | null;
  year: string | null;
  permit_type?: "green" | "red" | "blue" | null;
  credits?: number | null;
  flashcard_sets?: number | null;
  is_online?: boolean | null;
  last_seen?: string | null;
  created_at: string;
  updated_at: string;
}

class ProfileService {
  // Get user profile
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    return { profile: data as Profile | null, error };
  }

  // Update user profile (creates if doesn't exist)
  async updateProfile(userId: string, updates: Partial<Profile>) {
    // First try to get the profile
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    // If profile doesn't exist, create it with upsert
    const { data, error } = await supabase
      .from("profiles")
      .upsert({ id: userId, ...updates }, { onConflict: "id" })
      .select()
      .single();

    return { profile: data as Profile | null, error };
  }

  // Create user profile
  async createProfile(userId: string, profileData: Partial<Profile>) {
    const { data, error } = await supabase
      .from("profiles")
      .insert({ id: userId, ...profileData })
      .select()
      .single();

    return { profile: data as Profile | null, error };
  }

  // Get all profiles (for finding study partners)
  async getAllProfiles() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    return { profiles: data as Profile[] | null, error };
  }
}

export const profileService = new ProfileService();
