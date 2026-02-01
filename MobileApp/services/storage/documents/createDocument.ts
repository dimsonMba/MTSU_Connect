import { supabase } from "@/lib/supabase";

export async function createDocument(
  title: string,
): Promise<{ id: string; user_id: string }> {
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  const user = userRes?.user;
  if (!user || !user.id) throw new Error("Not authenticated");
  const userId = user.id;
  try {
    console.log(
      "createDocument: inserting document for user",
      userId,
      "title",
      title,
    );
    const { data, error } = await supabase
      .from("documents")
      .insert({
        user_id: userId,
        title,
        storage_bucket: "pdfs",
        storage_path: "pending", // update after upload
      })
      .select("id, user_id")
      .single();

    if (error) {
      console.error("createDocument: insert error", error);
      throw error;
    }
    return data as { id: string; user_id: string };
  } catch (err) {
    console.error("createDocument: unexpected error", err);
    throw err;
  }
}

export async function updateDocumentStorage(
  documentId: string,
  bucket: string,
  path: string,
): Promise<void> {
  try {
    console.log(
      "updateDocumentStorage: updating document",
      documentId,
      "bucket",
      bucket,
      "path",
      path,
    );
    const { data, error } = await supabase
      .from("documents")
      .update({ storage_bucket: bucket, storage_path: path })
      .eq("id", documentId)
      .select("id, user_id")
      .single();

    if (error) {
      console.error("updateDocumentStorage: update error", error);
      throw error;
    }
    if (!data) throw new Error("Failed to update document storage");
  } catch (err) {
    console.error("updateDocumentStorage: unexpected error", err);
    throw err;
  }
}
