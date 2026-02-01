import { callEdgeFunction } from "@/services/edge/edgeClient";
import type { AskResponse } from "./types";

export async function askDocument(
  question: string,
  documentId: string,
): Promise<AskResponse> {
  return callEdgeFunction<AskResponse>("ask", {
    question,
    document_id: documentId,
  });
}
