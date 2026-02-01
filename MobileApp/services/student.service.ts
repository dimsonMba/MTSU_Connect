import { supabase } from "@/lib/supabase";

export interface Student {
  id: string;
  full_name: string;
  avatar_url?: string;
  major?: string;
  gpa?: number;
  email?: string;
  is_online?: boolean;
  last_seen?: string;
}

class StudentService {
  // Get all students (profiles) except the current user
  async getAllStudents(): Promise<{ data: Student[] | null; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, major, gpa, is_online, last_seen")
      .neq("id", user.id) // Exclude current user
      .order("full_name", { ascending: true });

    if (error) return { data: null, error };

    return { data: data || [], error: null };
  }

  // Search students by name or major
  async searchStudents(query: string): Promise<{ data: Student[] | null; error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: "Not authenticated" };

    const searchQuery = `%${query.toLowerCase()}%`;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, major, gpa, is_online, last_seen")
      .neq("id", user.id)
      .or(`full_name.ilike.${searchQuery},major.ilike.${searchQuery}`)
      .order("full_name", { ascending: true });

    if (error) return { data: null, error };

    return { data: data || [], error: null };
  }

  // Get a specific student profile
  async getStudentProfile(studentId: string): Promise<{ data: Student | null; error: any }> {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, major, gpa, is_online, last_seen")
      .eq("id", studentId)
      .single();

    if (error) return { data: null, error };

    return { data, error: null };
  }

  // Update current user's global presence
  async updatePresence(isOnline: boolean): Promise<{ error: any }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("profiles")
      .update({
        is_online: isOnline,
        last_seen: new Date().toISOString(),
      })
      .eq("id", user.id);

    return { error };
  }
}

export const studentService = new StudentService();
