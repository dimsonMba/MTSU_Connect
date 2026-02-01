import { supabase } from "@/lib/supabase";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  major: string | null;
  year: string | null;
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

  // Update user profile
  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
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
