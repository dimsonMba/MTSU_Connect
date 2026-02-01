import { supabase } from "@/lib/supabase";

export async function getMyDocuments() {
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  const user = userRes?.user;
  if (!user || !user.id) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("documents")
    .select("id, title, storage_bucket, storage_path, created_at, page_count")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: String(row.id),
    title: row.title || "Untitled",
    uploadedAt: row.created_at ? new Date(row.created_at) : new Date(),
    pageCount:
      typeof row.page_count === "number" && row.page_count > 0
        ? row.page_count
        : 0,
    hasFlashcards: false, // has_flashcards column may not exist
  }));
}
