# Student Chat System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    MTSU Connect Mobile App                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Study Hub   │  │   Students   │  │    Chats     │      │
│  │    Screen    │  │    Screen    │  │    Screen    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │               │
│         │                  │                  │               │
│  ┌──────▼──────────────────▼──────────────────▼───────┐     │
│  │                 Services Layer                      │     │
│  │                                                      │     │
│  │  ┌─────────────────┐    ┌─────────────────┐       │     │
│  │  │ Student Service │    │  Chat Service   │       │     │
│  │  │                 │    │                 │       │     │
│  │  │ - getAllStudents│    │ - getConversations│    │     │
│  │  │ - searchStudents│    │ - getMessages   │       │     │
│  │  │ - getProfile    │    │ - sendMessage   │       │     │
│  │  │                 │    │ - createOrGetDM │       │     │
│  │  └─────────────────┘    └─────────────────┘       │     │
│  └──────────────────────────────────────────────────┘      │
│                          │                                   │
└──────────────────────────┼───────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │         Supabase Backend             │
        ├──────────────────────────────────────┤
        │                                       │
        │  ┌──────────────────────────────┐   │
        │  │   PostgreSQL Database        │   │
        │  │                               │   │
        │  │  ┌────────────────────────┐  │   │
        │  │  │    profiles            │  │   │
        │  │  │  - id                  │  │   │
        │  │  │  - full_name           │  │   │
        │  │  │  - major               │  │   │
        │  │  │  - gpa                 │  │   │
        │  │  │  - avatar_url          │  │   │
        │  │  └────────────────────────┘  │   │
        │  │                               │   │
        │  │  ┌────────────────────────┐  │   │
        │  │  │  chat_conversations    │  │   │
        │  │  │  - id                  │  │   │
        │  │  │  - name                │  │   │
        │  │  │  - is_study_room       │  │   │
        │  │  │    (false = DM)        │  │   │
        │  │  │  - subject             │  │   │
        │  │  │  - created_by          │  │   │
        │  │  └────────────────────────┘  │   │
        │  │                               │   │
        │  │  ┌────────────────────────┐  │   │
        │  │  │  chat_participants     │  │   │
        │  │  │  - id                  │  │   │
        │  │  │  - conversation_id     │  │   │
        │  │  │  - user_id             │  │   │
        │  │  │  - is_online           │  │   │
        │  │  │  - last_seen           │  │   │
        │  │  └────────────────────────┘  │   │
        │  │                               │   │
        │  │  ┌────────────────────────┐  │   │
        │  │  │   chat_messages        │  │   │
        │  │  │  - id                  │  │   │
        │  │  │  - conversation_id     │  │   │
        │  │  │  - sender_id           │  │   │
        │  │  │  - content             │  │   │
        │  │  │  - created_at          │  │   │
        │  │  └────────────────────────┘  │   │
        │  │                               │   │
        │  └───────────────────────────────┘   │
        │                                       │
        │  ┌───────────────────────────────┐   │
        │  │   Realtime Subscriptions      │   │
        │  │  - Message updates            │   │
        │  │  - Online status changes      │   │
        │  │  - New conversations          │   │
        │  └───────────────────────────────┘   │
        │                                       │
        │  ┌───────────────────────────────┐   │
        │  │   Row Level Security (RLS)    │   │
        │  │  - Profiles: viewable by all  │   │
        │  │  - Conversations: by members  │   │
        │  │  - Messages: by participants  │   │
        │  └───────────────────────────────┘   │
        │                                       │
        └───────────────────────────────────────┘
```

## Data Flow Diagrams

### Direct Message Creation Flow

```
Student A                    App                      Supabase
    │                         │                          │
    │ 1. Tap chat icon        │                          │
    │────────────────────────>│                          │
    │                         │                          │
    │                         │ 2. createOrGetDirectMessage()
    │                         │─────────────────────────>│
    │                         │                          │
    │                         │   3. Check existing DMs  │
    │                         │<─────────────────────────│
    │                         │                          │
    │                         │   4a. If exists: return  │
    │                         │   4b. If new: create     │
    │                         │      - conversation      │
    │                         │      - 2 participants    │
    │                         │<─────────────────────────│
    │                         │                          │
    │ 5. Navigate to chat     │                          │
    │<────────────────────────│                          │
    │                         │                          │
    │ 6. Real-time connection │   7. Subscribe to msgs   │
    │                         │─────────────────────────>│
    │                         │                          │
```

### Message Sending Flow

```
Student A                    App                      Supabase                Student B
    │                         │                          │                        │
    │ 1. Type & send msg      │                          │                        │
    │────────────────────────>│                          │                        │
    │                         │                          │                        │
    │                         │ 2. sendMessage()         │                        │
    │                         │─────────────────────────>│                        │
    │                         │                          │                        │
    │                         │   3. Insert message      │                        │
    │                         │      + Update timestamp  │                        │
    │                         │                          │                        │
    │                         │   4. Realtime broadcast  │                        │
    │                         │<─────────────────────────│───────────────────────>│
    │                         │                          │                        │
    │ 5. See own message      │                          │    6. Receive message  │
    │<────────────────────────│                          │                        │
    │                         │                          │                        │
```

### Student Discovery Flow

```
Student                      App                      Supabase
    │                         │                          │
    │ 1. Navigate to Students │                          │
    │────────────────────────>│                          │
    │                         │                          │
    │                         │ 2. getAllStudents()      │
    │                         │─────────────────────────>│
    │                         │                          │
    │                         │   3. Query profiles      │
    │                         │      WHERE id != current │
    │                         │      ORDER BY full_name  │
    │                         │<─────────────────────────│
    │                         │                          │
    │ 4. Display list         │                          │
    │<────────────────────────│                          │
    │                         │                          │
    │ 5. Search "Computer"    │                          │
    │────────────────────────>│                          │
    │                         │                          │
    │                         │ 6. searchStudents()      │
    │                         │─────────────────────────>│
    │                         │                          │
    │                         │   7. Filter by name/major│
    │                         │<─────────────────────────│
    │                         │                          │
    │ 8. Show filtered results│                          │
    │<────────────────────────│                          │
```

## File Structure

```
MTSU_Connect/
├── Backend/
│   ├── STUDENT_CHAT_GUIDE.md          ← Full implementation guide
│   ├── SETUP_GUIDE.md                 ← General setup
│   └── supabase/
│       ├── config.toml
│       └── migrations/
│           ├── 20260131_chat_system.sql      ← Base chat schema
│           ├── 20260201_direct_messages.sql  ← DM enhancements
│           └── COMPLETE_SETUP.sql            ← All-in-one setup
│
├── MobileApp/
│   ├── .env                           ← Supabase credentials
│   ├── app/
│   │   ├── (tabs)/
│   │   │   └── (study)/
│   │   │       ├── index.tsx          ← Study Hub (entry)
│   │   │       ├── students.tsx       ← NEW: Student list
│   │   │       ├── chats.tsx          ← UPDATED: DM + groups
│   │   │       └── _layout.tsx        ← Navigation setup
│   │   └── chat/
│   │       └── [chatId].tsx           ← Chat conversation
│   │
│   ├── components/
│   │   ├── ChatBubble.tsx
│   │   └── CreateChatModal.tsx
│   │
│   └── services/
│       ├── student.service.ts         ← NEW: Student queries
│       ├── chat.service.ts            ← UPDATED: DM creation
│       └── auth.service.ts
│
└── QUICK_START_CHAT.md                ← THIS FILE
```

## Key Concepts

### Direct Messages vs Study Groups

| Feature            | Direct Message         | Study Group            |
|--------------------|------------------------|------------------------|
| `is_study_room`    | `false`                | `true`                 |
| Participants       | Exactly 2              | 2 or more              |
| Discovery          | Private                | Public (discoverable)  |
| Subject            | N/A                    | Optional subject field |
| Icon               | 💬 MessageCircle       | 👥 Users               |
| Creation           | Auto on first chat     | Manual via modal       |

### Database Relationships

```
profiles (1) ──────┐
                   │
                   ├── (user creates)
                   │
                   ▼
         chat_conversations (1)
                   │
                   ├── (has many)
                   │
                   ▼
         chat_participants (N)
                   │
                   └── (links back to)
                   │
                   ▼
                profiles (N)

         chat_conversations (1)
                   │
                   ├── (has many)
                   │
                   ▼
            chat_messages (N)
                   │
                   └── (sent by)
                   │
                   ▼
                profiles (1)
```

## Security Model (RLS Policies)

### Profiles Table
```sql
✅ SELECT: Anyone (for discovery)
✅ INSERT: Own profile only
✅ UPDATE: Own profile only
```

### Chat Conversations
```sql
✅ SELECT: If participant OR if study_room=true
✅ INSERT: If created_by = current_user
```

### Chat Participants
```sql
✅ SELECT: If in same conversation
✅ INSERT: If user_id = current_user
✅ UPDATE: Own record only
```

### Chat Messages
```sql
✅ SELECT: If participant in conversation
✅ INSERT: If participant AND sender_id = current_user
```

## Performance Optimizations

### Indexes Created
- `idx_chat_participants_conversation` - Fast participant lookups
- `idx_chat_participants_user` - Fast user conversation queries
- `idx_chat_messages_conversation` - Fast message retrieval
- `idx_chat_messages_created` - Chronological sorting
- `idx_chat_conversations_study_room` - Filter DMs vs groups
- `idx_profiles_full_name` - Student search
- `idx_profiles_major` - Major-based search

### Views Created
- `user_direct_messages` - Easy DM queries with participant info

### Functions Created
- `get_dm_other_user(uuid)` - Get other participant in DM
- `handle_new_user()` - Auto-create profile on signup
- `update_conversation_timestamp()` - Update on new message

## Real-Time Features

### Subscriptions Active
1. **New Messages** - Listen to `chat_messages` inserts
2. **Online Status** - Listen to `chat_participants` updates
3. **New Conversations** - Possible future enhancement

### Update Frequency
- Manual refresh: Pull-to-refresh gesture
- Auto-refresh: Every 5 seconds (chats list)
- Real-time: Instant (messages, online status)

---

**Last Updated:** February 1, 2026  
**Architecture Version:** 1.0
