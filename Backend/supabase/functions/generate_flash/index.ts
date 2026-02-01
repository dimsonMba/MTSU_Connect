/* eslint-disable import/no-unresolved */
// @ts-ignore: Deno std import resolved at runtime in Supabase functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore: Remote ESM import for Deno runtime
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.35.0?target=deno";

// Provide Deno global typing for local editors
declare const Deno: any;

// Simple placeholder for the `generate_flash` edge function.
// Replace with your real flashcard generation logic before production.
// deno-lint-ignore-file no-explicit-any
serve(async (req: any) => {
  try {
    // Robust JSON parsing and debug logging
    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      try {
        const txt = await req.text();
        if (txt) {
          try {
            body = JSON.parse(txt);
          } catch (e2) {
            console.warn("generate_flash: request body not JSON", txt);
            body = {};
          }
        }
      } catch (tErr) {
        console.warn("generate_flash: failed to read body text", tErr);
        body = {};
      }
    }

    const documentId = body?.document_id;
    const count = body?.count ?? 12;

    if (!documentId) {
      console.warn("generate_flash: missing document_id", {
        headers: req.headers,
        body,
      });
      return new Response(
        JSON.stringify({ ok: false, message: "missing document_id" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    console.log("generate_flash called", { documentId, count });

    return new Response(JSON.stringify({ ok: true, created: 0 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate_flash error", err);
    return new Response(JSON.stringify({ ok: false, message: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
