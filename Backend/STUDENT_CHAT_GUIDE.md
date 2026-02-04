# Student-to-Student Chat Implementation Guide

## Overview
This implementation adds comprehensive student-to-student messaging functionality to MTSU Connect. Students can now:
- **View all registered students** in the app
- **Send direct messages** to any student
- **See both direct messages and study groups** in the Chats screen
- **Search students** by name or major

## What Was Implemented

### 1. Student Service (`services/student.service.ts`)
New service that handles:
- Fetching all students (profiles) from the database
- Searching students by name or major
- Getting individual student profiles
- Automatically excludes the current user from results

### 2. Direct Message Support (`services/chat.service.ts`)
Enhanced chat service with new `createOrGetDirectMessage()` method that:
- Checks if a direct message conversation already exists between two users
- Creates a new DM conversation if none exists
- Automatically adds both users as participants
- Returns the conversation ID to navigate to

### 3. Students Screen (`app/(tabs)/(study)/students.tsx`)
New screen featuring:
- **List of all students** with their profiles
- **Search functionality** to find students by name or major
- **Profile information** showing major and GPA
- **Quick chat button** to instantly start a conversation
- **Real-time updates** with pull-to-refresh

### 4. Updated Study Hub (`app/(tabs)/(study)/index.tsx`)
Added:
- **"All Students" button** for easy navigation
- Reorganized action buttons for better UX

### 5. Enhanced Chats Screen (`app/(tabs)/(study)/chats.tsx`)
Updated to:
- **Differentiate between direct messages and study groups** with icons
- Show "💬 Direct Message" badge for DMs
- Show "📚 Subject" badge for study groups
- Display appropriate participant counts

### 6. Database Migration (`Backend/supabase/migrations/20260201_direct_messages.sql`)
Adds:
- Index optimizations for better performance
- Helper function `get_dm_other_user()` to identify DM participants
- View `user_direct_messages` for easier DM queries
- Comments and documentation

## Setup Instructions

### Step 1: Run the Database Migration
1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Run the migration file: `Backend/supabase/migrations/20260201_direct_messages.sql`
4. Verify successful execution (you should see success messages)

**Note:** The original chat system migration (`20260131_chat_system.sql`) must be run first if not already applied.

### Step 2: Test Student Profiles
Make sure you have student profiles in your database:

```sql
-- Check existing profiles
SELECT id, full_name, major, gpa FROM profiles;

-- If needed, you can manually add test profiles
INSERT INTO profiles (id, full_name, major, gpa)
VALUES 
  ('user-uuid-1', 'John Doe', 'Computer Science', 3.75),
  ('user-uuid-2', 'Jane Smith', 'Engineering', 3.92);
```

### Step 3: App Navigation Flow

#### To Chat With Any Student:
1. **From Study Hub** → Tap "All Students" button
2. **Browse or Search** → Find the student you want to chat with
3. **Tap Chat Icon** → Instantly creates/opens a direct message
4. **Start Chatting** → Messages are real-time via Supabase

#### To View All Chats:
1. **From Study Hub** → Tap "Study Chats" button
2. **See Combined List** → Both direct messages and study groups
3. **Direct Messages** → Marked with 💬 icon and "Direct Message" badge
4. **Study Groups** → Marked with 👥 icon and show member count

## Features

### Direct Messages
- ✅ **One-to-one conversations** between students
- ✅ **Automatic conversation creation** (no duplicate DMs)
- ✅ **Real-time messaging** with Supabase subscriptions
- ✅ **Online status indicators**
- ✅ **Message history** persisted in database

### Study Groups
- ✅ **Public discovery** - students can find and join groups
- ✅ **Subject-based** organization
- ✅ **Member and online counts**
- ✅ **Real-time updates**

### Student Discovery
- ✅ **View all registered students**
- ✅ **Search by name or major**
- ✅ **Profile information** (name, major, GPA)
- ✅ **Quick chat access** from any student profile

## Database Schema

### Key Tables:
- **`profiles`** - Student information (name, major, GPA, avatar)
- **`chat_conversations`** - Both DMs (`is_study_room = false`) and groups (`is_study_room = true`)
- **`chat_participants`** - Links users to conversations
- **`chat_messages`** - Message content and metadata

### Row Level Security (RLS):
- ✅ **Students can view all profiles** (for discovery)
- ✅ **Students can only see conversations they're part of**
- ✅ **Students can create conversations** and add themselves
- ✅ **Messages are scoped to conversation participants**

## Testing Checklist

### Test Direct Messaging:
- [ ] Login as Student A
- [ ] Navigate to "All Students"
- [ ] Find and chat with Student B
- [ ] Send a message
- [ ] Login as Student B
- [ ] See the new DM in Chats list
- [ ] Reply to the message
- [ ] Both users see real-time updates

### Test Student Discovery:
- [ ] View list shows all students except current user
- [ ] Search by name works
- [ ] Search by major works
- [ ] Profile information displays correctly
- [ ] Chat button creates conversation

### Test Study Groups:
- [ ] Can still create study groups
- [ ] Study groups show in Chats list
- [ ] Study groups marked differently than DMs
- [ ] Can join public study groups

## Troubleshooting

### Students Not Showing Up
**Problem:** The "All Students" list is empty.
**Solution:** 
- Ensure profiles are being created on signup (check the `handle_new_user()` trigger)
- Manually verify profiles exist: `SELECT * FROM profiles;`

### Can't Send Messages
**Problem:** Getting permission errors when sending messages.
**Solution:**
- Verify RLS policies are enabled
- Check that user is a participant: `SELECT * FROM chat_participants WHERE user_id = 'your-user-id';`

### Duplicate DM Conversations
**Problem:** Multiple DM conversations with the same person.
**Solution:**
- The `createOrGetDirectMessage()` method prevents this
- If duplicates exist, they were created before this update
- Clean up duplicates manually in the database

### Real-time Updates Not Working
**Problem:** Messages don't appear instantly.
**Solution:**
- Check Supabase Realtime is enabled for your tables
- Verify subscription code in `[chatId].tsx` is working
- Check browser console for WebSocket errors

## API Reference

### `studentService.getAllStudents()`
Returns all student profiles except the current user.
```typescript
const { data, error } = await studentService.getAllStudents();
// data: Student[] | null
```

### `studentService.searchStudents(query: string)`
Search students by name or major.
```typescript
const { data, error } = await studentService.searchStudents("Computer");
```

### `chatService.createOrGetDirectMessage(otherUserId: string)`
Create or retrieve existing DM with another student.
```typescript
const { data, error } = await chatService.createOrGetDirectMessage(studentId);
// data: { id: string, name: string }
```

## Next Steps / Future Enhancements

Potential improvements:
- [ ] **Typing indicators** - Show when someone is typing
- [ ] **Read receipts** - Mark messages as read
- [ ] **Message reactions** - Add emoji reactions
- [ ] **File sharing** - Send images/documents
- [ ] **Push notifications** - Alert for new messages
- [ ] **Block/Report** - User safety features
- [ ] **Video/Voice calls** - Integrate WebRTC
- [ ] **Student profiles** - Expanded profile pages
- [ ] **Common classes** - Show shared classes with other students

## Support

If you encounter issues:
1. Check the Supabase logs for errors
2. Verify all migrations have been run
3. Check RLS policies are correctly configured
4. Review the console logs in the app
5. Ensure your Supabase environment variables are correct in `.env`

---

**Version:** 1.0  
**Date:** February 1, 2026  
**Author:** GitHub Copilot
