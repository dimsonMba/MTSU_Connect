# 🚀 Quick Setup & Testing Guide (No RLS)

## Step 1: Run Database Migration ✅

### Option A: Supabase Dashboard (Recommended)
1. Open [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `ewoebkkuyhpgvzxkaxpl`
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the entire contents of:
   ```
   Backend/supabase/migrations/SETUP_NO_RLS.sql
   ```
6. Click **Run** or press `Cmd + Enter`
7. You should see success messages in the results panel

### Option B: Supabase CLI (Alternative)
```bash
cd /Users/JordanPufon/MTSU_Connect/Backend
supabase db push
```

---

## Step 2: Start the App 🎯

Open a new terminal and run:

```bash
cd /Users/JordanPufon/MTSU_Connect/MobileApp
npx expo start
```

Then:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator  
- Scan QR code for Expo Go on physical device

---

## Step 3: Test the Flow 🧪

### Test 1: View All Students
1. **Login/Signup** to your app
2. Navigate to **Study Hub** tab (bottom navigation)
3. Tap the **"All Students"** button
4. You should see a list of all registered students
5. Try the **search bar** - type a name or major

### Test 2: Start a Direct Message
1. From the **Students list**, find any student
2. Tap the **💬 chat icon** on the right side
3. You should be instantly navigated to a chat screen
4. Type a message: "Hi, this is a test!"
5. Tap **Send** (paper plane icon)
6. Message should appear in the chat

### Test 3: View All Conversations
1. Navigate back to **Study Hub**
2. Tap **"Study Chats"** button
3. You should see your new direct message conversation
4. It should show:
   - 💬 icon (indicating it's a DM)
   - "Direct Message" badge
   - Your last message
   - Timestamp

### Test 4: Real-Time Chat (with 2 accounts)
**Account A:**
1. Login as first student
2. Send message to Account B

**Account B (on different device/browser):**
1. Login as second student
2. Go to Study Chats
3. Open the conversation from Account A
4. You should see the message appear
5. Reply back

**Both accounts:**
- Messages should appear instantly (real-time)
- You should see online status indicators

---

## Expected Results ✅

### Students Screen Should Show:
- List of all students (except yourself)
- Search functionality working
- Each student showing:
  - Name
  - Major (if available)
  - GPA (if available)
  - Chat icon

### Chats Screen Should Show:
- Both direct messages and study groups
- Different icons for each:
  - 💬 for Direct Messages
  - 👥 for Study Groups
- Last message preview
- Timestamps

### Chat Screen Should Have:
- Real-time message updates
- Send button
- Message history
- Participant count in header

---

## Troubleshooting 🔧

### Issue: Students list is empty
**Solution:**
```sql
-- Run in Supabase SQL Editor to check profiles
SELECT * FROM profiles;

-- If empty, profiles are created when users signup
-- Make sure you have multiple user accounts signed up
```

### Issue: Can't send messages
**Check in Supabase SQL Editor:**
```sql
-- Verify you're a participant
SELECT * FROM chat_participants 
WHERE user_id = 'your-user-id';

-- Check if conversation exists
SELECT * FROM chat_conversations;
```

### Issue: Messages not appearing real-time
**Check:**
1. Supabase Realtime is enabled:
   - Dashboard → Database → Replication
   - Enable for `chat_messages` table
2. Check app console for WebSocket errors

### Issue: App won't start
```bash
# Clear cache and reinstall
cd MobileApp
rm -rf node_modules
npm install
npx expo start --clear
```

---

## Quick Verification Commands

Run these in **Supabase SQL Editor** to check your setup:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'chat_conversations', 'chat_participants', 'chat_messages');

-- Check RLS is disabled (should all be false)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'chat_conversations', 'chat_participants', 'chat_messages');

-- Count your data
SELECT 
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM chat_conversations) as total_conversations,
  (SELECT COUNT(*) FROM chat_messages) as total_messages;
```

---

## Test Checklist

- [ ] Database migration ran successfully
- [ ] App starts without errors
- [ ] Can see Study Hub screen
- [ ] "All Students" button visible
- [ ] Students list loads
- [ ] Can search students
- [ ] Can tap chat icon
- [ ] Chat screen opens
- [ ] Can send message
- [ ] Message appears in chat
- [ ] "Study Chats" button works
- [ ] Can see conversations list
- [ ] Direct messages show 💬 icon
- [ ] Last message displays correctly

---

## What's Working

✅ **Student Discovery** - Browse all registered students  
✅ **Search** - Find by name or major  
✅ **Direct Messages** - One-on-one chats  
✅ **Study Groups** - Group conversations  
✅ **Real-Time** - Instant message delivery  
✅ **Auto-Create** - DM conversations created automatically  
✅ **No Duplicates** - Won't create multiple DMs with same person  

---

## Next Steps (After Testing)

Once everything works:
1. ✅ Test with multiple student accounts
2. ✅ Verify real-time messaging
3. ✅ Test search functionality
4. 🔐 Enable RLS for production (run different migration)
5. 📱 Test on physical devices
6. 🎨 Customize styling if needed

---

**Your Supabase Project:** `ewoebkkuyhpgvzxkaxpl`  
**Status:** Ready to test! 🚀
