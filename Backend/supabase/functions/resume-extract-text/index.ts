// Supabase Edge Functions run on Deno and resolve the `std/server` alias at runtime.
/* eslint-disable import/no-unresolved */
// @ts-ignore: Deno std import resolved at runtime in Supabase functions
import { serve } from "std/server";
// @ts-ignore: Remote ESM import for Deno runtime
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.35.0?target=deno";

declare const Deno: any;

interface RequestBody {
  resumePdfPath: string;
  jobDescription?: string;
  formData?: Record<string, any>;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

serve(async (req: any) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  try {
    const body: RequestBody = await req.json().catch(() => ({}));
    const { resumePdfPath } = body;

    console.log("[resume-extract-text] Received request", {
      resumePdfPath,
      hasJobDescription: !!body.jobDescription,
      hasFormData: !!body.formData,
    });

    if (!resumePdfPath) {
      console.error("[resume-extract-text] Missing resumePdfPath");
      return jsonResponse(
        { error: "Missing resumePdfPath" },
        400
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[resume-extract-text] Missing Supabase configuration");
      return jsonResponse(
        { error: "Missing Supabase configuration" },
        500
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download PDF from storage
    console.log(`[resume-extract-text] Downloading PDF from: ${resumePdfPath}`);
    const { data: pdfBuffer, error: downloadError } = await supabase.storage
      .from("resumes-original")
      .download(resumePdfPath);

    if (downloadError) {
      console.error("[resume-extract-text] Download error:", downloadError);
      return jsonResponse(
        { error: `Failed to download PDF: ${downloadError.message}` },
        500
      );
    }

    if (!pdfBuffer) {
      console.error("[resume-extract-text] No PDF data received");
      return jsonResponse(
        { error: "No PDF data received" },
        500
      );
    }

    // Convert Blob to ArrayBuffer
    const arrayBuffer = await pdfBuffer.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    console.log(`[resume-extract-text] PDF downloaded successfully, size: ${uint8Array.length} bytes`);

    // For now, return a placeholder success response
    // In production, you would:
    // 1. Use a PDF parsing library (like pdfjs) to extract text
    // 2. Optionally use OpenAI to refine the extraction
    // 3. Tailor the resume based on job description if provided

    // Placeholder: extract text would happen here
    const extractedText = `Resume text extracted from ${resumePdfPath}. Job description: ${body.jobDescription || "Not provided"}`;

    console.log("[resume-extract-text] Returning success response");
    return jsonResponse(
      {
        text: extractedText,
        success: true,
      },
      200
    );

  } catch (err) {
    console.error("[resume-extract-text] Error:", String(err));
    return jsonResponse(
      { error: String(err) },
      500
    );
  }
});
