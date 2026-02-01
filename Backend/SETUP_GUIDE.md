# Supabase Backend Setup Guide

## What I've Built

✅ **Backend Structure**: Complete folder organization with Supabase config  
✅ **Database Schema**: SQL migration file ready to run  
✅ **Mobile Integration**: Supabase client configured  
✅ **Authentication**: Login & Signup pages connected to Supabase  
✅ **Service Layer**: Auth, Profile, Study, and Chat services  

## Next Steps to Get Running

### 1. Create Supabase Project
1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Choose your organization and set project name (e.g., "mtsu-connect")
4. Set a strong database password (save it!)
5. Select a region close to you
6. Wait for project to be provisioned (~2 minutes)

### 2. Set Up Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Open the file: `Backend/supabase/migrations/001_initial_schema.sql`
3. Copy all the SQL code
4. Paste it into the Supabase SQL Editor
5. Click **Run** to create all tables, policies, and functions

This creates:
- **profiles** - User information
- **study_partners** - Study partner listings
- **documents** - PDF uploads
- **flashcards** - Study flashcards
- **parking_permits** - Parking information
- **chat_conversations** & **chat_messages** - Messaging system

### 3. Configure Storage (for PDF uploads)
1. Go to **Storage** in Supabase dashboard
2. Click **New Bucket**
3. Name it: `documents`
4. Set it to **Public** (for easy access)
5. Click **Create**

### 4. Get Your API Keys
1. Go to **Settings** → **API** in Supabase
2. Copy your **Project URL** (looks like: `https://xxxxx.supabase.co`)
3. Copy your **anon public** key (long string starting with `eyJ...`)

### 5. Configure Mobile App
1. Open `MobileApp/.env` file
2. Add your credentials:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 6. Configure Authentication Providers (Optional)
For Google/Apple sign-in:
1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Google** and/or **Apple**
3. Follow their setup guides to get OAuth credentials
4. Add redirect URL: `your-app-scheme://`

### 7. Test Your Setup
```bash
cd MobileApp
npm start
```

Then:
1. Open the app in Expo Go
2. Try signing up with an @mtmail.mtsu.edu email
3. Check Supabase **Authentication** tab to see the new user
4. Check **Table Editor** → **profiles** to see the profile created

## File Structure

```
Backend/
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql    # Run this in Supabase SQL Editor
│   └── config.toml                    # Reference config
└── README.md

MobileApp/
├── lib/
│   └── supabase.ts                    # Supabase client setup
├── services/
│   ├── auth.service.ts                # Login, signup, logout
│   ├── profile.service.ts             # User profiles
│   └── (more services available)
├── .env                               # Add your API keys here
└── .env.example                       # Example template
```

## Available Services

### AuthService (`services/auth.service.ts`)
- `signUp()` - Create new account
- `signIn()` - Login with email/password
- `signOut()` - Logout
- `resetPassword()` - Send password reset email
- `getCurrentUser()` - Get logged-in user

### ProfileService (`services/profile.service.ts`)
- `getProfile()` - Get user profile
- `updateProfile()` - Update profile info
- `getAllProfiles()` - Get all users (for study partners)

## Security Features

✅ **Row Level Security (RLS)**: Users can only access their own data  
✅ **Auth Policies**: Automatic profile creation on signup  
✅ **Secure Storage**: Files stored in Supabase Storage  
✅ **Email Validation**: MTSU email required for signup  

## Troubleshooting

**"Supabase URL not found" error:**
- Make sure `.env` file exists and has your credentials
- Restart the Expo dev server after adding credentials

**"Invalid API key" error:**
- Double-check you copied the **anon** key, not the service key
- Make sure there are no extra spaces in the `.env` file

**Authentication not working:**
- Verify the SQL schema was run successfully
- Check Supabase **Authentication** settings are enabled

## What's Next?

Your app is now ready to:
1. ✅ Sign up users with MTSU email
2. ✅ Login with email/password
3. ✅ Auto-create user profiles
4. 🔄 Upload PDFs (add UI)
5. 🔄 Create flashcards (add UI)
6. 🔄 Find study partners (add UI)
7. 🔄 Chat with other students (add UI)

The backend infrastructure is complete - you just need to build the UI screens that use these services!
