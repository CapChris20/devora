# Firestore Schema: Student Networking Platform (Devora)

## Overview

Use **top-level collections** for data you query across many users (profiles, conversations). Use **subcollections** for data that belongs to one user or one conversation and grows over time (projects, messages, notifications).

---

## 1. Collections You Need

| Collection | Level | Purpose |
|---|---|---|
| `users` | Top-level | Profiles and browse/filter data |
| `users/{userId}/projects` | Subcollection | A user's portfolio projects |
| `conversations` | Top-level | Chat threads between users |
| `conversations/{conversationId}/messages` | Subcollection | Messages inside a thread |
| `users/{userId}/notifications` | Subcollection | Per-user alerts |
| `users/{userId}/notificationSettings` | Subcollection (optional) | Notification preferences |

**Optional (later):** `reports`, `blocks`, `connectionRequests`

---

## 2. `users` (Top-Level)

**Document ID:** Firebase Auth UID (same as `userId`)

**One document per registered user.**

### Fields

| Field | Type | Notes |
|---|---|---|
| `email` | string | From auth; may be private |
| `displayName` | string | Full name |
| `photoURL` | string | Profile photo |
| `major` | string | Filterable |
| `school` | string | Filterable |
| `graduationYear` | number | Filterable |
| `bio` | string | Short intro |
| `skills` | array of strings | Filter with `array-contains` / `array-contains-any` |
| `interests` | array of strings | Optional extra filters |
| `links` | map | e.g. `github`, `linkedin`, `portfolio` |
| `isPublic` | boolean | Only public profiles appear in browse |
| `lastActiveAt` | timestamp | Sort by activity |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

### Example Document

- **Path:** `users/abc123`
- **Contains:** display name, major, skills (`["React", "Python"]`), public profile flag, etc.

---

## 3. `users/{userId}/projects` (Subcollection)

**Document ID:** Auto-generated or custom project ID

**One document per project on a user's profile.**

### Fields

| Field | Type | Notes |
|---|---|---|
| `title` | string | |
| `description` | string | |
| `technologies` | array of strings | Optional filter/display |
| `url` | string | Live demo or repo |
| `imageURL` | string | Thumbnail |
| `startDate` | timestamp | |
| `endDate` | timestamp | Nullable if ongoing |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

### Why Subcollection?

Projects belong to one user, can grow without bloating the profile doc, and are easy to list with `users/{userId}/projects`.

---

## 4. `conversations` (Top-Level)

**Document ID:** Stable ID for the thread (e.g. sorted pair of user IDs: `userA_userB`)

**One document per 1:1 chat (extend later for groups).**

### Fields

| Field | Type | Notes |
|---|---|---|
| `participantIds` | array of strings | Exactly 2 user IDs for DMs |
| `participants` | map | Denormalized preview data per user: `displayName`, `photoURL` |
| `lastMessage` | map | `{ text, senderId, createdAt }` for inbox preview |
| `lastMessageAt` | timestamp | Sort inbox by recency |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

### Example Document

- **Path:** `conversations/abc123_xyz789`
- **Contains:** both users, last message preview, timestamp for sorting

---

## 5. `conversations/{conversationId}/messages` (Subcollection)

**Document ID:** Auto-generated message ID

**One document per message.**

### Fields

| Field | Type | Notes |
|---|---|---|
| `senderId` | string | Who sent it |
| `text` | string | Message body |
| `type` | string | e.g. `text`, `image` |
| `readBy` | map | `{ userId: readTimestamp }` per participant |
| `createdAt` | timestamp | Order messages |

### Why Subcollection?

Messages grow quickly; subcollections keep conversation metadata separate and support real-time listeners on one thread.

---

## 6. `users/{userId}/notifications` (Subcollection)

**Document ID:** Auto-generated notification ID

**One document per notification for that user.**

### Fields

| Field | Type | Notes |
|---|---|---|
| `type` | string | e.g. `new_message`, `profile_view` |
| `title` | string | Short headline |
| `body` | string | Detail text |
| `data` | map | Related IDs: `conversationId`, `senderId`, etc. |
| `read` | boolean | Unread badge count |
| `createdAt` | timestamp | Sort newest first |

### Why Subcollection?

Each user only reads their own notifications; security rules are simple (`userId` in path).

---

## 7. Optional: `users/{userId}/notificationSettings`

**One doc** (fixed ID like `preferences`) if you want granular control.

### Fields

| Field | Type |
|---|---|
| `emailEnabled` | boolean |
| `pushEnabled` | boolean |
| `messageAlerts` | boolean |
| `updatedAt` | timestamp |

---

## 8. Relationships Between Collections

```
users (profile)
  │
  ├── projects (1 user → many projects)
  │
  └── notifications (1 user → many notifications)

conversations (thread)
  │
  ├── participantIds → references users
  │
  └── messages (1 conversation → many messages)
        └── senderId → references users
```

### How They Connect

| From | To | Relationship |
|---|---|---|
| `users` | `projects` | Parent → child subcollection |
| `users` | `notifications` | Parent → child subcollection |
| `conversations.participantIds` | `users` | Many-to-many (2 users per DM) |
| `messages.senderId` | `users` | Many-to-one |
| `notifications.data.senderId` | `users` | Optional reference |
| `notifications.data.conversationId` | `conversations` | Optional reference |

**Denormalization:** Store `displayName` and `photoURL` on `conversations.participants` and `lastMessage` so the inbox loads without extra user reads.

---

## 9. Top-Level vs Subcollection Decisions

| Data | Choice | Reason |
|---|---|---|
| User profiles | **Top-level `users`** | Browse/filter across all users |
| Projects | **Subcollection** | Owned by one user; unbounded growth |
| Conversations | **Top-level** | Both participants need access; query "my conversations" |
| Messages | **Subcollection** | High volume; scoped to one thread |
| Notifications | **Subcollection under user** | Private; easy security rules |

---

## 10. Query Patterns

| Feature | Query |
|---|---|
| Browse profiles | `users` where `isPublic == true`, filter `major`, `school`, `graduationYear`, `skills` |
| View one profile | `users/{userId}` + `users/{userId}/projects` |
| Inbox | `conversations` where `participantIds` `array-contains` currentUserId, order by `lastMessageAt` |
| Chat thread | `conversations/{id}/messages` order by `createdAt` |
| Notifications | `users/{userId}/notifications` where `read == false` or order by `createdAt` |

You'll need **composite indexes** for combinations like `isPublic + major + lastActiveAt` or `participantIds + lastMessageAt`.

---

## 11. Privacy Split (Recommended)

Keep sensitive fields only on `users` and never expose them in browse queries:

- **Private:** `email`, notification prefs
- **Public (browse):** `displayName`, `photoURL`, `major`, `school`, `skills`, `bio`, projects summary

If browse queries get heavy, add a slim top-level `publicProfiles/{userId}` mirroring only filter/display fields — optional until scale demands it.
