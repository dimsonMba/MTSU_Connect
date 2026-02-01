# MTSU Connect Backend

This backend uses Supabase for authentication, database, and storage.

## Setup

1. Create a Supabase project at https://supabase.com
2. Copy your project URL and anon key
3. Set up the database schema using the migrations in `/supabase/migrations`
4. Configure environment variables in the mobile app

## Project Structure

```
Backend/
├── supabase/
│   ├── migrations/          # Database migrations
│   ├── functions/           # Edge functions (if needed)
│   └── config.toml          # Supabase configuration
├── schemas/                 # Database schema definitions
└── README.md
```

## Database Schema

- **profiles** - User profile information
- **study_sessions** - Study session data
- **flashcards** - Flashcard data
- **documents** - PDF documents for study
- **parking_permits** - User parking permits
- **chat_messages** - Chat messages between users
- **study_partners** - Study partner connections

## Authentication

Using Supabase Auth with:
- Email/Password authentication
- OAuth providers (Google, Apple)
- Row Level Security (RLS) for data protection

## Environment Variables

Required in mobile app:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
