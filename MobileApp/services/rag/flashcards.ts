import { generateFlashcards as generateFlashcardsFn } from "./generateFlashcards";
import type { GenerateFlashcardsResponse } from "./types";

export async function generateFlashcards(
  documentId: string,
  count = 12,
): Promise<GenerateFlashcardsResponse> {
  return generateFlashcardsFn(documentId, count);
}
