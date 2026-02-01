# Supabase storage & DB setup for PDFs

1. Create the `pdfs` bucket (recommended: private)

Using the service role key (DO NOT expose this key in client code):

```bash
SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key \
  node ./scripts/create_supabase_bucket.js
```

2. Run the SQL migrations

- Open `Backend/migrations/001_create_documents_table.sql` and `002_create_flashcards_table.sql` in the Supabase SQL editor and run them.

3. Storage access from client

For uploads from the client app (the mobile app), continue using the anon key in `MobileApp/lib/supabase` and call `supabase.storage.from('pdfs').upload(path, file)` as shown in the app services. Keep the bucket private; store the path in the `documents.storage_path` column and use signed URLs for downloads when rendering PDFs in the app.

Example to get a public/signed URL for a file (client-side):

```js
// give the client a time-limited URL for download/viewing
const { data } = await supabase.storage.from("pdfs").createSignedUrl(path, 60);
// data.signedURL
```

4. Policies

If you enable Row Level Security on the `documents` table, create policies so that authenticated users can only read/write their own rows. See the commented example in the migration.
