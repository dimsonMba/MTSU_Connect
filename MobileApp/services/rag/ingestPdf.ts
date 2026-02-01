import { callEdgeFunction } from "@/services/edge/edgeClient";
import type { IngestPdfResponse } from "./types";

export async function ingestPdf(documentId: string) {
  return callEdgeFunction<IngestPdfResponse>("ingest_text", {
    document_id: documentId,
  });
}
