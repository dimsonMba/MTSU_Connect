// Supabase Edge Functions run on Deno and resolve the `std/server` alias at runtime.
// Add the following comments to quiet local TypeScript/ESLint which may not
// understand Deno's resolver during local editing.
/* eslint-disable import/no-unresolved */
// @ts-ignore: Deno std import resolved at runtime in Supabase functions
import { serve } from "std/server";

// deno-lint-ignore-file no-explicit-any
serve(async (req: any) => {
  try {
    const body = await req.json().catch(() => ({}));
    const documentId = body?.document_id;
    const count = body?.count ?? 12;

    if (!documentId) {
      return new Response(
        JSON.stringify({ ok: false, message: "missing document_id" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Placeholder implementation:
    // In your production function, replace this with actual ingestion and
    // flashcard generation logic (call to model, embeddings, DB writes).
    console.log("generate_flashcards called", { documentId, count });

    return new Response(JSON.stringify({ ok: true, created: 0 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate_flashcards error", err);
    return new Response(JSON.stringify({ ok: false, message: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
