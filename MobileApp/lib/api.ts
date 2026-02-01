import { supabase } from "./supabase";

export type ExtractResumeTextInput = {
  resumePdfPath: string;
  jobDescription?: string;
  formData?: any;
};

export type GenerateResumeHtmlInput = {
  resumeText: string;
  formData: any;
  jobDescription: string;
};

type ResumeInput = {
  resumeText: string;
  formData: any;
  jobDescription: string;
};

export async function extractResumeText(input: ExtractResumeTextInput): Promise<string> {
  const res = await supabase.functions.invoke("resume-extract-text", {
    body: input,
  });

  if (res.error) {
    console.error("Edge function error:", res.error);
    console.error("Edge function data:", res.data);
    throw new Error(
      res.error.message || "Edge Function returned a non-2xx status code",
    );
  }

  const text = (res.data as any)?.text;
  if (!text || typeof text !== "string") {
    console.error("Unexpected function response:", res.data);
    throw new Error("No text returned from extraction function");
  }

  return text;
}

// export async function generateResumeHtml(input: GenerateResumeHtmlInput): Promise<string> {

//   const res = await supabase.functions.invoke("resume-generate-html", {
//     body: input,
//   });

//   if (res.error) {
//     console.error("Resume HTML edge function error:", res.error);
//     console.error("Resume HTML edge function data:", res.data);
//     throw new Error(res.error.message || "Edge Function returned a non-2xx status code");
//   }
//   const html = (res.data as any)?.html;
//   if (!html) throw new Error("No html returned");
//   return html;
// }

export async function generateResumeJson(input: ResumeInput): Promise<any> {
  const { data, error } = await supabase.functions.invoke("resume-generate-html", {
    body: input,
  });

  if (error) {
    console.error("Resume JSON edge function error:", error);
    console.error("Resume JSON edge function data:", data);
    throw new Error(`resume-generate-json failed: ${(error as any)?.message ?? "Edge function failed"}`);
  }

  const resume = (data as any)?.resume;
  if (!resume) throw new Error("No resume returned");
  return resume;
}
