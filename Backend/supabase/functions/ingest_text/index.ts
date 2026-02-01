/* eslint-disable import/no-unresolved */
// @ts-ignore: Deno std import resolved at runtime in Supabase functions
// Use a Deno-compatible ESM build of supabase-js. The runtime resolves remote
// imports; using an npm: specifier can cause editor/ts errors locally.
/* eslint-disable import/no-unresolved */
// @ts-ignore: Deno std import resolved at runtime in Supabase functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// ts-ignore the remote ESM import so local TS/ESLint won't complain in editors.
// @ts-ignore: Remote ESM import for Deno runtime
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.35.0?target=deno";

// Provide Deno global typing for local editors (supabase edge runtime provides Deno).
declare const Deno: any;

const EMBED_MODEL = "text-embedding-3-small";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function chunkText(text: string, maxChars = 1600, overlap = 200) {
  const clean = text.replace(/\s+/g, " ").trim();
  const chunks: string[] = [];
  let i = 0;

  while (i < clean.length) {
    const end = Math.min(clean.length, i + maxChars);
    chunks.push(clean.slice(i, end));
    if (end === clean.length) break;
    i = Math.max(0, end - overlap);
  }
  return chunks;
}

async function embedBatch(openaiKey: string, inputs: string[]) {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: EMBED_MODEL, input: inputs }),
  });

  if (!res.ok)
    throw new Error(
      `OpenAI embeddings failed: ${res.status} ${await res.text()}`,
    );
  const json = await res.json();
  return json.data.map((d: any) => d.embedding as number[]);
}

/**
 * Simple PDF text extraction.
 * This extracts visible text from text-based PDFs by looking for text streams.
 * For scanned/image PDFs, you'd need OCR which requires external services.
 */
function extractTextFromPdf(bytes: Uint8Array): string {
  // Convert to string to search for text content
  const decoder = new TextDecoder("latin1");
  const content = decoder.decode(bytes);

  const textParts: string[] = [];

  // Method 1: Extract text between BT (begin text) and ET (end text) markers
  const btEtRegex = /BT\s*([\s\S]*?)\s*ET/g;
  let match;
  while ((match = btEtRegex.exec(content)) !== null) {
    const block = match[1];
    // Extract text from Tj and TJ operators
    const tjMatches = block.match(/\(([^)]*)\)\s*Tj/g) || [];
    for (const tj of tjMatches) {
      const textMatch = tj.match(/\(([^)]*)\)/);
      if (textMatch) {
        textParts.push(decodeEscaped(textMatch[1]));
      }
    }
    // TJ arrays: [(...) ... (...)] TJ
    const tjArrayMatches = block.match(/\[(.*?)\]\s*TJ/g) || [];
    for (const tjArr of tjArrayMatches) {
      const innerMatches = tjArr.match(/\(([^)]*)\)/g) || [];
      for (const inner of innerMatches) {
        const txt = inner.slice(1, -1);
        textParts.push(decodeEscaped(txt));
      }
    }
  }

  // Method 2: Look for stream content that might contain readable text
  if (textParts.length === 0) {
    // Fallback: extract any readable ASCII sequences
    const readableRegex = /[\x20-\x7E]{20,}/g;
    const readable = content.match(readableRegex) || [];
    for (const r of readable) {
      // Filter out binary-looking strings
      if (!/^[%\/<>\[\]{}]+$/.test(r) && !/^\d+\s+\d+\s+obj/.test(r)) {
        textParts.push(r);
      }
    }
  }

  // Clean and join
  let result = textParts.join(" ");
  // Remove excessive whitespace
  result = result.replace(/\s+/g, " ").trim();
  // Remove control characters
  result = result.replace(/[\x00-\x1F\x7F]/g, "");

  return result;
}

function estimatePdfPageCount(bytes: Uint8Array): number {
  const decoder = new TextDecoder("latin1");
  const content = decoder.decode(bytes);
  const matches = content.match(/\/Type\s*\/Page\b/g);
  if (!matches) return 0;
  // Some PDFs contain template pages counted multiple times; clamp to sensible bounds.
  return Math.max(1, matches.length);
}

// Helper to decode PDF escape sequences
function decodeEscaped(str: string): string {
  return str
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\");
}

/**
 * Normalize any request into:
 * { document_id, text?, file?, filename?, contentType?, meta }
 */
async function parseAny(req: Request) {
  const url = new URL(req.url);
  const contentType = req.headers.get("content-type") ?? "";

  // default document_id may come from query string
  let document_id = url.searchParams.get("document_id");
  let text: string | null = null;

  // file support
  let fileBytes: Uint8Array | null = null;
  let filename: string | null = null;
  let fileMime: string | null = null;

  // meta
  const meta: Record<string, any> = {
    received_content_type: contentType,
  };

  if (contentType.includes("application/json")) {
    const body = await req.json();
    document_id = document_id ?? body?.document_id ?? body?.documentId ?? null;
    text = body?.text ?? null;
    meta.source = body?.source ?? "json";
    meta.extra = body?.meta ?? null;
    return { document_id, text, fileBytes, filename, fileMime, meta };
  }

  if (contentType.includes("multipart/form-data")) {
    const form = (await req.formData()) as any;

    document_id = document_id ?? (form.get("document_id") as string | null);
    const textField = form.get("text");
    if (typeof textField === "string") text = textField;

    const file = form.get("file");
    if (file instanceof File) {
      filename = file.name;
      fileMime = file.type || "application/octet-stream";
      const ab = await file.arrayBuffer();
      fileBytes = new Uint8Array(ab);
      meta.source = "multipart";
      meta.filename = filename;
      meta.fileMime = fileMime;
      meta.size = fileBytes.byteLength;
    } else {
      meta.source = "multipart";
    }

    return { document_id, text, fileBytes, filename, fileMime, meta };
  }

  // fallback: treat as raw text
  text = await req.text();
  meta.source = "text";
  return { document_id, text, fileBytes, filename, fileMime, meta };
}

serve(async (req: Request) => {
  try {
    // Read env vars from Deno.env
    const SUPABASE_URL =
      Deno.env.get("SUPABASE_URL") || Deno.env.get("NEXT_PUBLIC_SUPABASE_URL");
    const SUPABASE_KEY =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ||
      Deno.env.get("SUPABASE_ANON_KEY");
    const OPENAI_API_KEY =
      Deno.env.get("OPENAI_API_KEY") || Deno.env.get("OPENAI_KEY");

    if (!SUPABASE_URL || !SUPABASE_KEY || !OPENAI_API_KEY) {
      return jsonResponse({ error: "Missing env vars" }, 500);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    const parsed = await parseAny(req);
    const { document_id, fileBytes, filename, fileMime, meta } = parsed as any;
    let { text } = parsed as any;

    if (!document_id) {
      return jsonResponse(
        {
          error: "Missing document_id",
          hint: "Send document_id in JSON, form-data field, or query string",
        },
        400,
      );
    }

    // If file was provided but no text, choose a strategy:
    // Strategy A: Upload file to Storage and extract text elsewhere (recommended).
    // Strategy B: Extract in this function (possible, but heavier).
    if (!text && fileBytes) {
      // ---- Strategy A: upload file (recommended) ----
      const safeName = filename ?? `upload-${crypto.randomUUID()}`;
      const path = `${document_id}/${safeName}`;

      const { error: upErr } = await supabase.storage
        .from("pdfs")
        .upload(path, fileBytes, {
          contentType: fileMime ?? "application/octet-stream",
          upsert: true,
        });

      if (upErr)
        return jsonResponse(
          { error: "Storage upload failed", details: upErr },
          500,
        );

      return jsonResponse({
        ok: true,
        stage: "uploaded",
        document_id,
        storage_path: path,
        next: "Extract text from the file, then call this function again with { document_id, text }",
        meta,
      });
    }

    // If no text provided, try to fetch from storage and extract
    if (!text || text.trim().length === 0) {
      // Look up the document to find its storage_path
      const { data: doc, error: docErr } = await supabase
        .from("documents")
        .select("storage_path, title")
        .eq("id", document_id)
        .single();

      if (docErr || !doc?.storage_path) {
        return jsonResponse(
          {
            error: "No text provided and document has no storage_path",
            hint: "Send JSON {document_id, text} or ensure the document has a storage_path in the database",
            document_id,
            docErr: docErr?.message,
          },
          400,
        );
      }

      // Download the file from storage
      const { data: fileData, error: downloadErr } = await supabase.storage
        .from("pdfs")
        .download(doc.storage_path);

      if (downloadErr || !fileData) {
        return jsonResponse(
          {
            error: "Failed to download PDF from storage",
            storage_path: doc.storage_path,
            details: downloadErr?.message,
          },
          500,
        );
      }

      // Extract text from PDF bytes
      // For PDFs, we'll do a simple extraction (this works for text-based PDFs)
      const arrayBuffer = await fileData.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Count the number of /Type /Page markers to estimate page count.
      const estimatedPages = estimatePdfPageCount(bytes);
      if (estimatedPages > 0) {
        try {
          await supabase
            .from("documents")
            .update({ page_count: estimatedPages })
            .eq("id", document_id);
          meta.page_count = estimatedPages;
        } catch (pageErr) {
          console.warn("ingest_text: failed to update page_count", pageErr);
        }
      }

      // Simple PDF text extraction - look for text streams
      // This is a basic approach; for complex PDFs you'd need a full parser
      text = extractTextFromPdf(bytes);

      if (!text || text.trim().length === 0) {
        // Fallback: use the filename/title as minimal text
        text = `Document: ${doc.title || doc.storage_path}`;
        console.warn("Could not extract text from PDF, using fallback:", text);
      }

      meta.source = "storage_pdf";
      meta.storage_path = doc.storage_path;
      meta.extracted_length = text.length;
    }

    // Chunk + embed + insert
    const chunks = chunkText(text);

    // When re-ingesting (manual regenerate, retries, etc.) the document may already
    // have chunks stored. Remove them so new chunk_index values don't collide with
    // the unique (document_id, chunk_index) constraint.
    const { error: deleteErr } = await supabase
      .from("document_chunks")
      .delete()
      .eq("document_id", document_id);

    if (deleteErr) {
      console.error("ingest_text: failed to clear existing chunks", deleteErr);
      return jsonResponse(
        {
          error: "Failed to reset previous document chunks",
          details: deleteErr,
          document_id,
        },
        500,
      );
    }
    const BATCH = 64;
    const rows: any[] = [];

    for (let start = 0; start < chunks.length; start += BATCH) {
      const slice = chunks.slice(start, start + BATCH);
      const embeddings = await embedBatch(OPENAI_API_KEY, slice);

      for (let i = 0; i < slice.length; i++) {
        rows.push({
          document_id,
          chunk_index: start + i,
          content: slice[i],
          embedding: embeddings[i],
          meta: { ...meta, ingest: "ingest_text" },
        });
      }
    }

    // Insert batches (avoid large payload limits)
    const INSERT_BATCH = 200;
    for (let start = 0; start < rows.length; start += INSERT_BATCH) {
      const slice = rows.slice(start, start + INSERT_BATCH);
      const { error } = await supabase.from("document_chunks").insert(slice);
      if (error)
        return jsonResponse({ error: "DB insert failed", details: error }, 500);
    }

    return jsonResponse({ ok: true, document_id, chunks: chunks.length });
  } catch (e) {
    return jsonResponse({ error: "Unhandled error", details: String(e) }, 500);
  }
});
