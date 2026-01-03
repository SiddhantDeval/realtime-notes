
# Realtime Collaborative Notes — Frontend

This document explains the **frontend architecture, flows, and responsibilities** of the Realtime Collaborative Notes application. It is written to be understandable by **developers, reviewers, and interviewers**.

---

## 1. Purpose of the Frontend

The frontend is responsible for:

* Rendering notes and editor UI
* Observing user edits in real time
* Converting user actions into **operations (ops)**
* Sending ops to the backend via **WebSockets**
* Applying remote edits instantly
* Managing optimistic UI, conflicts, and reconnection
* Enforcing permissions at UI level (read-only vs editable)

The frontend is **state-driven**, **realtime-first**, and **backend-agnostic** (backend is source of truth).

---

## 2. Tech Stack

* **React + TypeScript**
* **Socket.IO client** (realtime communication)
* **REST APIs** (note metadata, auth, history, sharing)
* **State management**:

  * React Query → server state (notes, metadata)
  * Local state / Zustand → editor & realtime state
* **Editor**:

  * Plain textarea initially (can upgrade to Slate / CodeMirror / TipTap)

---

## 3. High-Level Frontend Architecture

```
App
 ├── AuthProvider
 ├── ApiClient
 ├── SocketProvider
 ├── Routes
 │    ├── Login / Register
 │    ├── Dashboard (Notes List)
 │    ├── NoteEditor (Realtime)
 │    ├── ShareModal
 │    └── HistoryPanel
 └── ErrorBoundary
```

### Key Principles

* Backend owns canonical data
* Frontend applies **optimistic updates**
* Realtime communication is **event-driven**
* UI never blocks user typing

---

## 4. Authentication Flow (Frontend)

1. User logs in via `POST /api/auth/login` OR clicks "Continue with Google"
2. Google Login redirects to `/auth/callback?token=...`
3. Access token stored in memory/session
4. Refresh token stored securely (httpOnly cookie)
5. `ApiClient` auto-refreshes token on `401`
6. Socket connection starts only after auth success

```ts
socket = io(API_URL, {
  auth: { token: accessToken }
})
```

---

## 5. Dashboard (Notes List)

### Responsibilities

* Fetch user notes
* Create new notes
* Navigate to editor

### APIs Used

* `GET /api/notes`
* `POST /api/notes`
* `DELETE /api/notes/:id`

### UX Rules

* Notes list updates optimistically
* Deleted notes disappear immediately
* Errors show non-blocking toast messages

---

## 6. Note Editor — Core Realtime Logic

### Responsibilities

* Display note content
* Observe user edits
* Generate edit operations (ops)
* Send ops to backend
* Apply remote ops
* Handle conflicts & reconnections

---

## 7. Observing Edits & Creating Ops

### What the frontend tracks

* `content` (current editor text)
* `prevContent` (last acknowledged text)
* `clientVersion` (from backend)

### How ops are generated

1. Compare `prevContent` vs `newContent`
2. Calculate minimal difference
3. Convert difference into an operation:

```json
{ "op": "insert", "pos": 12, "text": "Hello" }
```

### Ops are batched

* Batching window: **150–300 ms**
* Each batch has a unique `opId`

```json
{
  "noteId": "note-123",
  "opId": "uuid",
  "clientVersion": 5,
  "ops": [ ... ]
}
```

---

## 8. Sending Ops (WebSocket)

* Event: `edit`
* Sent after batching window
* Optimistically applied locally

```ts
socket.emit('edit', editPacket)
```

---

## 9. Receiving Realtime Updates

### Events handled

* `remote_edit`
* `op_ack`
* `op_rejected`
* `presence_update`

### Behavior

* Apply `remote_edit` ops immediately
* Update local `clientVersion`
* Mark ops as acknowledged

If `op_rejected`:

* Replace editor content with canonical server version
* Rebase local pending ops (or discard)

---

## 10. Cursor & Presence

### Cursor Updates

* Emitted on selection change
* Throttled (~200 ms)

```json
{ "noteId": "note-123", "position": 42 }
```

### Presence Display

* Avatars for active collaborators
* Live cursor indicators

---

## 11. Conflict Handling Strategy

* Backend enforces version ordering
* Frontend assumes conflicts are rare

### On conflict

1. Backend sends `op_rejected`
2. Frontend resets to server snapshot
3. Pending local edits are rebased or dropped

This guarantees **eventual consistency**.

---

## 12. Offline & Reconnection Handling

### Offline

* Ops are queued in IndexedDB
* UI stays editable

### Reconnect

1. Socket reconnects
2. Frontend re-joins note room
3. Fetches canonical content
4. Replays queued ops

---

## 13. Sharing & Permissions (UI)

### UI Rules

* VIEWER → read-only editor
* COMMENTER → comments only (optional)
* EDITOR / OWNER → full editing

### APIs

* `POST /api/notes/:id/share`
* `POST /api/notes/:id/share/link`

Permissions are also validated server-side.

---

## 14. History & Restore

### UI

* Timeline of versions
* Restore confirmation dialog

### APIs

* `GET /api/notes/:id/history`
* `POST /api/notes/:id/restore`

After restore:

* Editor updates instantly via `remote_edit`

---

## 15. Error Handling

* API errors → toast notifications
* Socket disconnect → banner + auto-retry
* Critical failures → modal + reload option

Frontend never blocks typing due to errors.

---

## 16. Performance Optimizations

* Batched ops (reduces network traffic)
* Throttled cursor events
* Minimal diffs instead of full content sends
* React memoization for editor rendering

---

## 17. Security Considerations

* Tokens never stored in localStorage
* All socket events authenticated
* UI enforces permissions defensively
* No HTML rendering without sanitization

---

## 18. Folder Structure (Suggested)

```
frontend/
 ├── src/
 │   ├── api/
 │   ├── auth/
 │   ├── editor/
 │   │    ├── Editor.tsx
 │   │    ├── ops.ts
 │   │    ├── socketHandlers.ts
 │   ├── pages/
 │   ├── providers/
 │   └── utils/
 └── README.md
```

---

## 19. What This Frontend Demonstrates

* Realtime collaboration patterns
* Optimistic UI design
* WebSocket-based architecture
* Conflict handling & recovery
* Scalable frontend-backend integration

This frontend mirrors real-world collaborative tools like Google Docs and Notion, at a smaller and understandable scale.

---

## 20. Future Enhancements

* Rich-text editor (Slate / TipTap)
* CRDT-based syncing (Yjs)
* Comment threads
* Offline-first mode
* Mobile UI

---

## Final Note

This frontend is intentionally designed to be:

* **Simple to reason about**
* **Easy to extend**
* **Strong for interviews & real products**

If needed, this README can be shortened or adapted for portfolio or hiring managers.
