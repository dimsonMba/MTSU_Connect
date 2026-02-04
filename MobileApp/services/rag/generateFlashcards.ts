import { callEdgeFunction } from "@/services/edge/edgeClient";
import type { GenerateFlashcardsResponse } from "./types";

export async function generateFlashcards(documentId: string, count = 12) {
  return callEdgeFunction<GenerateFlashcardsResponse>("generate_flash", {
    document_id: documentId,
    count,
  });
}
