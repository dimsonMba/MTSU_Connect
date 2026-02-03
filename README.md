# MTSU Connect

> A mobile-first campus companion for MTSU students that blends chat, study tools, parking utilities, and AI-powered learning workflows on top of a Supabase backend.

## Feature Highlights

- **Study Hub** – Upload PDFs, automatically extract text, ask document-specific questions, and turn notes into swipeable flashcards.
- **Student Discovery & Chats** – Browse classmates, spin up direct messages instantly, and collaborate inside study group channels with realtime Supabase updates.
- **Parking & Campus Utilities** – Check permit availability and campus info cards through customizable Bento tiles.
- **AI Assistants** – Edge functions (Deno) handle PDF ingestion, OpenAI embeddings, flashcard generation, and question-answering so the mobile app stays lightweight.
- **Responsive Expo App** – Built with Expo Router, NativeWind, and React Query for a modern TypeScript developer experience across iOS, Android, and web.

## Tech Stack

| Layer          | Technologies                                                                                        |
| -------------- | --------------------------------------------------------------------------------------------------- |
| Mobile         | Expo 54, React Native 0.81, Expo Router 6, React Query 5, NativeWind/Tailwind, Lucide icons         |
| Backend        | Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions), OpenAI `text-embedding-3-small`     |
| Edge Functions | `ingest_text`, `generate_flash`, `ask`, `resume-extract-text` (Deno runtime with `supabase-js` ESM) |
| Tooling        | npm, TypeScript 5.9, ESLint 9, Supabase CLI                                                         |

## Repository Layout

| Path                  | Description                                                             |
| --------------------- | ----------------------------------------------------------------------- |
| `MobileApp/`          | Expo project with all screens, components, services, hooks, and assets. |
| `Backend/`            | Supabase migrations, config, and Edge Function sources.                 |
| `ARCHITECTURE.md`     | Deep dive into chat/data architecture and flows.                        |
| `QUICK_START_CHAT.md` | Fast path checklist to spin up the chat experience.                     |
| `TESTING_GUIDE.md`    | Manual and automated test plan.                                         |
| `MESSENGER_SETUP.md`  | Supplemental instructions for the messaging subsystem.                  |

## Prerequisites

- Node.js 20+ and npm 10+
- Expo CLI (`npx expo`) and an iOS/Android simulator or Expo Go
- Supabase project (URL, anon key, service key) with a `pdfs` storage bucket
- Supabase CLI (`brew install supabase/tap/supabase`) for running migrations/functions
- OpenAI API key for embeddings and completion workloads used in Edge Functions

## Environment Variables

### Mobile app (`MobileApp/.env`)

```env
EXPO_PUBLIC_SUPABASE_URL=your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=ey...
```

These values hydrate the in-app Supabase client (`@/lib/supabase`).

### Edge Functions / Supabase project

Create a secrets file consumed by `supabase functions serve|deploy`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=service-role-key
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
```

- `SUPABASE_SERVICE_ROLE_KEY` is required so `ingest_text` can write to protected tables.
- Edge functions also assume a `pdfs` bucket already exists.

## Getting Started

### 1. Backend preparation

1. **Run the schema**
   - Fast path: execute `Backend/supabase/migrations/COMPLETE_SETUP.sql` in the Supabase SQL editor.
   - Alternatively run the individual migrations in order (chat system, direct messages, document/flashcard tables, parking, etc.).
2. **Create storage buckets** – `pdfs` for study uploads plus any additional buckets referenced in `uploadPdfToStorage`.
3. **Deploy Edge Functions** (from `Backend/`):
   ```bash
   cd Backend
   supabase functions deploy ingest_text
   supabase functions deploy generate_flash
   supabase functions deploy ask
   supabase functions deploy resume-extract-text
   ```
4. **Verify RLS** – Policies in the migrations restrict access to only the owning student; confirm Realtime is enabled for the chat tables if you want instant updates.

### 2. Mobile app setup

```bash
cd MobileApp
cp .env.example .env   # or edit the provided file with your Supabase creds
npm install
npx expo start --clear
```

Use the Expo Dev Tools output to launch iOS Simulator, Android Emulator, or Expo Go.

## Core Workflows

### Study Hub AI pipeline

1. **Upload** – `handleUploadPdf` in `app/(tabs)/(study)/index.tsx` creates a `documents` row, uploads the PDF via `uploadPdfToStorage`, and shows progress through `AIProgressOverlay`.
2. **Ingestion** – `services/rag/ingestPdf.ts` calls the `ingest_text` Edge Function which downloads the PDF from Supabase storage, extracts raw text, estimates page count, generates OpenAI embeddings, and upserts rows into `document_chunks`.
3. **Flashcards** – `generateFlashcards` triggers the `generate_flash` function to build spaced-repetition cards stored in the `flashcards` table; `app/flashcards/[documentId].tsx` renders a stacked swipe + flip experience via `components/FlashCard`.
4. **Ask AI** – `askDocument` hits the `ask` Edge Function which performs vector search over `document_chunks` and streams an answer back to the `/ask/[documentId]` screen.
5. **Resume preview** – `resume-extract-text` can parse resume uploads for quick summaries if needed.

### Student discovery & messaging

- `app/(tabs)/(study)/students.tsx` lists classmates (powered by `profileService`).
- Tapping the 💬 icon calls `chatService.createOrGetDirectMessage`, ensuring duplicate conversations are never created.
- `app/(tabs)/(study)/chats.tsx` merges direct messages and study rooms, refreshing every few seconds plus listening to Supabase Realtime streams for inserts.
- `app/chat/[chatId].tsx` streams the conversation; `components/ChatBubble` and `CreateChatModal` provide UI polish.

### Parking & campus utilities

- `app/(tabs)/(parking)/index.tsx` surfaces permit availability, parking lot info, and CTA buttons.
- `components/BentoCard`, `ParkingBottomSheet`, and `StudyPartnerCard` supply the interactive cards used throughout the dashboard/home tabs.

## Scripts & Testing

| Command                         | Where        | Description                                                                     |
| ------------------------------- | ------------ | ------------------------------------------------------------------------------- |
| `npm run lint`                  | `MobileApp/` | Runs Expo's ESLint config to keep JSX/TS clean.                                 |
| `npx expo start --clear`        | `MobileApp/` | Starts Metro with cache reset (recommended after dependency or native changes). |
| `supabase functions serve <fn>` | `Backend/`   | Local edge function emulation reading from your `.env`.                         |

Manual and exploratory test scenarios (upload PDFs, generate flashcards, student chat flows, parking cards) are documented in `TESTING_GUIDE.md`.

## Troubleshooting

| Symptom                                                                                        | Likely Cause                                              | Fix                                                                                                                  |
| ---------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `duplicate key value violates unique constraint "document_chunks_document_id_chunk_index_key"` | A previous ingest left stale chunks and a retry collided. | Latest `ingest_text` version deletes existing rows and uses `upsert`; redeploy the function and retry.               |
| Ask AI responds "not part of the document"                                                     | The document never finished ingesting or has zero chunks. | Confirm the `documents` record has `page_count` set and check `document_chunks` for rows; rerun `generate` if empty. |
| Empty student list                                                                             | Profiles werent auto-created for new Supabase users.      | Ensure the trigger/function from the migrations ran or manually insert into `profiles`.                              |
| Realtime chat delays                                                                           | Supabase Realtime not enabled for chat tables.            | Dashboard → Database → Replication → enable for `chat_messages` & `chat_participants`.                               |

## Reference Docs

- `ARCHITECTURE.md` – Visual diagrams and RLS breakdown for the messaging stack.
- `STUDENT_CHAT_GUIDE.md` – Long-form implementation notes for direct messages and groups.
- `QUICK_START_CHAT.md` – Checklist for validating the chat UX end-to-end.
- `MESSENGER_SETUP.md` – Supplemental messenger configuration steps.

Need a workflow diagram, data definition, or troubleshooting help that isnt in this README? Start with the docs above or open an issue/PR so we can extend the playbook.
