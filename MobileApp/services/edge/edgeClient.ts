import { supabase } from "@/lib/supabase";

function safePreview(obj: any) {
  try {
    const clone = JSON.parse(JSON.stringify(obj ?? {}));
    // redact common secret fields
    for (const k of [
      "apiKey",
      "apikey",
      "token",
      "access_token",
      "authorization",
      "Authorization",
    ]) {
      if (k in clone) clone[k] = "[redacted]";
    }
    // trim huge text fields
    if (typeof clone.text === "string" && clone.text.length > 200) {
      clone.text = clone.text.slice(0, 200) + `… (${clone.text.length} chars)`;
    }
    return clone;
  } catch {
    return { note: "unable to preview payload" };
  }
}

/**
 * Call a Supabase Edge Function with consistent error handling.
 */
export async function callEdgeFunction<TResponse>(
  functionName: string,
  body?: Record<string, any>,
): Promise<TResponse> {
  const payload = body ?? {};

  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload,
  });

  if (error) {
    const ctx = (error as any).context;

    const status = ctx?.status ?? ctx?.response?._status;
    const requestId =
      ctx?.headers?.["sb-request-id"] ||
      ctx?.headers?.map?.["sb-request-id"] ||
      ctx?.["sb-request-id"] ||
      ctx?.request_id;

    // Try to get the actual error message from the response
    let errorBody: string | null = null;

    // Method 1: Check if ctx has a text() method (Response object)
    if (ctx && typeof ctx.text === "function") {
      try {
        errorBody = await ctx.text();
      } catch {}
    }

    // Method 2: Check _bodyBlob or _bodyInit (React Native fetch response)
    if (!errorBody && ctx?._bodyBlob?._data) {
      // The blob data is available but needs to be read
      // Try to access via the response object if available
    }

    // Method 3: Check if error itself has response with text
    if (!errorBody && (error as any).response) {
      try {
        const resp = (error as any).response;
        if (typeof resp.text === "function") {
          errorBody = await resp.text();
        }
      } catch {}
    }

    // Method 4: raw body string
    const raw = ctx?.body ?? ctx;
    if (!errorBody && typeof raw === "string" && raw.length > 0) {
      errorBody = raw;
    }

    let parsed: any = errorBody ?? raw;
    if (typeof parsed === "string") {
      try {
        parsed = JSON.parse(parsed);
      } catch {
        // keep as string if not JSON
      }
    }

    console.error(`[Edge:${functionName}] message:`, error.message);
    console.error(`[Edge:${functionName}] status:`, status);
    console.error(`[Edge:${functionName}] requestId:`, requestId);
    console.error(`[Edge:${functionName}] errorBody:`, errorBody);
    console.error(`[Edge:${functionName}] parsed:`, parsed);
    console.error(
      `[Edge:${functionName}] sent payload preview:`,
      safePreview(payload),
    );

    const baseMessage =
      errorBody && errorBody.length > 0
        ? errorBody
        : typeof raw === "string" && raw.length > 0
          ? raw
          : (error.message ?? "Edge function call failed");

    const extra = [] as string[];
    if (status) extra.push(`status=${status}`);
    if (requestId) extra.push(`request=${requestId}`);

    const finalMessage = `${functionName} edge call failed: ${baseMessage}${
      extra.length ? ` (${extra.join(", ")})` : ""
    }`;

    if (status === 404) {
      throw new Error(
        `${finalMessage} — the edge function '${functionName}' returned 404 (not found). ` +
          `Ensure the function is deployed and the name matches.`,
      );
    }

    throw new Error(finalMessage);
  }

  return data as TResponse;
}
