/**
 * Run this script locally to create the `pdfs` storage bucket in your Supabase
 * project. It requires the SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment
 * variables (service role key). This must NOT be run from the client.
 *
 * Usage:
 * SUPABASE_URL=https://xyz.supabase.co SUPABASE_SERVICE_ROLE_KEY=your_key node create_supabase_bucket.js
 */

const { createClient } = require("@supabase/supabase-js");

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error(
      "Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment",
    );
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false },
  });

  const bucketId = "pdfs";
  try {
    // Check if bucket exists
    const { data: list } = await supabase.storage.listBuckets();
    const exists = (list || []).some((b) => b.name === bucketId);
    if (exists) {
      console.log(`Bucket '${bucketId}' already exists`);
      process.exit(0);
    }

    const { data, error } = await supabase.storage.createBucket(bucketId, {
      public: false,
    });
    if (error) throw error;
    console.log("Created bucket:", data);

    console.log(`Done. Remember to add object-level policies (RLS) if needed.`);
  } catch (err) {
    console.error("Failed to create bucket:", err.message || err);
    process.exit(1);
  }
}

main();
