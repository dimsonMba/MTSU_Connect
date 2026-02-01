import { supabase } from "@/lib/supabase";

export async function getMyDocuments() {
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  const user = userRes?.user;
  if (!user || !user.id) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("documents")
    // don't select columns that might not exist in every deployment (eg: has_flashcards)
    .select("id, title, storage_bucket, storage_path, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: String(row.id),
    title: row.title || "Untitled",
    uploadedAt: row.created_at ? new Date(row.created_at) : new Date(),
    pageCount: 0, // page_count column may not exist
    hasFlashcards: false, // has_flashcards column may not exist
  }));
}
