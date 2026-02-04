import * as FileSystem from "expo-file-system/legacy";
import { supabase } from "./supabase";

export async function uploadResumePdfToStorage(resumeFile: {
  uri: string;
  name: string;
  mimeType: string;
}) {
  const base64 = await FileSystem.readAsStringAsync(resumeFile.uri, {
    encoding: "base64" as any,
  });

  const raw = atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);

  const path = `users/${Date.now()}-${resumeFile.name}`;

  const { data, error } = await supabase.storage
    .from("resumes-original")
    .upload(path, bytes, {
      contentType: resumeFile.mimeType || "application/pdf",
      upsert: false,
    });

  if (error) throw error;
  return data.path;
}

// Default export to satisfy expo-router. This module is a helper, not a page.
import React from "react";
export default function _StorageLibRoute(): null {
  return null;
}
