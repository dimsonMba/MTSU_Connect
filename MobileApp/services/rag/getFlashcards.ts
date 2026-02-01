import { supabase } from "@/lib/supabase";
import type { Flashcard } from "./types";

export async function getFlashcards(documentId: string): Promise<Flashcard[]> {
  const { data, error } = await supabase
    .from("flashcards")
    .select("id, document_id, question, answer, created_at")
    .eq("document_id", documentId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []) as Flashcard[];
}
