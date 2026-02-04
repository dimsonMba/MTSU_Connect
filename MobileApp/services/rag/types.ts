export interface AskResponse {
  answer: string;
  in_scope: boolean;
  top_similarity?: number;
  sources?: { chunk_index: number; similarity: number }[];
}

export interface IngestPdfResponse {
  ok: boolean;
  document_id: string;
  chunks?: number;
  message?: string;
}

export interface GenerateFlashcardsResponse {
  ok: boolean;
  created: number;
}

export interface Flashcard {
  id: string;
  document_id: string;
  question: string;
  answer: string;
  created_at?: string;
}
