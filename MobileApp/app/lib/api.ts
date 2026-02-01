import { supabase } from "./supabase";

export type ExtractResumeTextInput = {
  resumePdfPath: string;
  jobDescription?: string;
  formData?: any;
};

export async function extractResumeText(input: ExtractResumeTextInput): Promise<string> {
  const res = await supabase.functions.invoke("resume-extract-text", {
    body: input,
  });

  
  if (res.error) {
    console.error("Edge function error:", res.error);
    console.error("Edge function data:", res.data);
    throw new Error(res.error.message || "Edge Function returned a non-2xx status code");
  }

  const text = (res.data as any)?.text;
  if (!text || typeof text !== "string") {
    console.error("Unexpected function response:", res.data);
    throw new Error("No text returned from extraction function");
  }

  return text;
}
