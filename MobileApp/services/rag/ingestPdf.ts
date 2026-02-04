import { callEdgeFunction } from "@/services/edge/edgeClient";
import type { IngestPdfResponse } from "./types";

export async function ingestPdf(documentId: string, retries = 2) {
  let lastError: any = null;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[ingestPdf] Attempt ${attempt}/${retries} for document ${documentId}`);
      const response = await callEdgeFunction<IngestPdfResponse>("ingest_text", {
        document_id: documentId,
      });
      console.log(`[ingestPdf] Success on attempt ${attempt}`, response);
      return response;
    } catch (error) {
      lastError = error;
      console.warn(`[ingestPdf] Attempt ${attempt} failed:`, error);
      
      if (attempt < retries) {
        // Wait before retrying (exponential backoff: 1s, 2s, 4s...)
        const delayMs = 1000 * Math.pow(2, attempt - 1);
        console.log(`[ingestPdf] Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  // All retries exhausted
  throw new Error(
    `Failed to ingest PDF after ${retries} attempts: ${
      lastError?.message || JSON.stringify(lastError)
    }`
  );
}
