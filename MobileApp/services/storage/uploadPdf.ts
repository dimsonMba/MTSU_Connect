import * as FileSystem from "expo-file-system/legacy";
import { decode as base64ToArrayBuffer } from "base64-arraybuffer";
import { supabase } from "@/lib/supabase";

export async function uploadPdfToStorage(params: {
  fileUri: string; // from DocumentPicker
  documentId: string; // row in documents table
  userId: string;
}) {
  const { fileUri, documentId, userId } = params;
  const logPrefix = `[uploadPdfToStorage ${documentId}]`;
  const { uri } = { uri: fileUri } as any;
  console.log(logPrefix, "reading file uri:", uri);

  // Read file as base64 from the local uri
  let base64: string;
  try {
    base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: "base64",
    });
  } catch (readErr) {
    console.error(logPrefix, "failed to read file as base64", readErr);
    throw readErr;
  }

  // Convert base64 to ArrayBuffer -> Uint8Array for upload
  const arrayBuffer = base64ToArrayBuffer(base64);
  const uint8 = new Uint8Array(arrayBuffer);

  const path = `${userId}/${documentId}.pdf`;

  // Upload using a Uint8Array which supabase-js supports in Node/React Native
  const { error: uploadErr } = await supabase.storage
    .from("pdfs")
    .upload(path, uint8, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadErr) {
    // Provide a clearer error message to help debugging
    const err = new Error(
      `Upload failed: ${uploadErr.message || JSON.stringify(uploadErr)}`,
    );
    throw err;
  }

  // Optionally create a signed URL for immediate access (1 hour)
  const { data: signedData, error: signedErr } = await supabase.storage
    .from("pdfs")
    .createSignedUrl(path, 60 * 60);

  if (signedErr) {
    // Not fatal - upload succeeded but signed URL could not be created
    console.warn("Warning: signed URL creation failed", signedErr);
  }

  return { bucket: "pdfs", path, signedUrl: signedData?.signedUrl };
}
