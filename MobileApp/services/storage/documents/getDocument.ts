import { supabase } from "@/lib/supabase";

export async function getDocument(documentId: string) {
  const { data, error } = await supabase
    .from("documents")
    .select("id, title, storage_bucket, storage_path, page_count")
    .eq("id", documentId)
    .single();

  if (error) throw error;
  return data as {
    id: string;
    title: string;
    storage_bucket?: string;
    storage_path?: string;
    page_count?: number;
  };
}
