import { callEdgeFunction } from "@/services/edge/edgeClient";
import type { AskResponse } from "./types";

export async function askDocument(params: {
  documentId: string;
  question: string;
  matchCount?: number;
}) {
  const { documentId, question, matchCount = 8 } = params;

  return callEdgeFunction<AskResponse>("ask", {
    document_id: documentId,
    question,
    match_count: matchCount,
  });
}
