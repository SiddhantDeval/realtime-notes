
# Realtime Collaborative Notes — Backend

This document explains the **backend architecture, data flow, and realtime editing logic** for the Realtime Collaborative Notes application. It is written in **simple, clear language**, suitable for developers, reviewers, and interview discussions.

---

## 1. Purpose of the Backend

The backend is the **single source of truth** for:

* Notes data and versions
* Realtime synchronization
* Conflict resolution
* Permissions and access control
* Authentication and session management

It supports **both REST APIs and WebSockets**, allowing reliable CRUD operations and low-latency realtime collaboration.

---

## 2. Tech Stack

* **Node.js + TypeScript**
* **Express.js** (REST APIs)
* **Socket.IO** (Realtime communication)
* **PostgreSQL** (Persistent storage)
* **Prisma ORM** (Schema & DB access)
* **Redis** (Pub/Sub for multi-instance scaling)
* **JWT** (Authentication)
* **Docker** (Containerization for Dev & Prod)

---

## 3. Docker Setup

### Development
1. Ensure Docker and Docker Compose are installed.
2. Run `docker-compose up --build`.
   - Starts Backend on port 4000.
   - Starts PostgreSQL on port 5432.
   - Hot-reloading enabled via volume mount.

### Production
1. Build the image:
   ```bash
   docker build --target production -t realtime-notes-backend .
   ```
2. Run the container:
   ```bash
   docker run -p 4000:4000 -e DATABASE_URL=... -e JWT_SECRET=... realtime-notes-backend
   ```

---

## 4. Authentication & Sessions

### Google Authentication Setup
To enable Google Login:

1. Create a project in **Google Cloud Console**.
2. Setup **OAuth 2.0 Client ID**.
3. Configure **Authorized JavaScript Origins**:
   - `http://localhost:3000` (Frontend URL)
4. Configure **Authorized Redirect URIs**:
   - `http://localhost:4001/api/v1/auth/google/callback` (Backend URL + /api/v1/auth/google/callback)
   - *Note: If API_VERSION is changed from 'v1', update the URI accordingly.*
5. Set environment variables in `.env`:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

### Flow

1. User logs in via `POST /api/auth/login` (Email/Password) OR `GET /api/v1/auth/google` (Google)
2. Backend validates credentials
3. Issues:

   * **Access Token** (short-lived)
   * **Refresh Token** (stored hashed in DB)
4. Refresh token stored securely (httpOnly cookie)
5. Access token required for all APIs and socket connections

### Tables Used

* `User`
* `Session`

---

## 5. Authorization (Permissions Model)

Every note action is validated using **NotePermission**.

### Permission Roles

* **OWNER** → Full access
* **EDITOR** → Edit + view
* **COMMENTER** → Comment only (optional)
* **VIEWER** → Read-only

### Enforcement

* REST APIs: Express middleware
* WebSockets: Socket.IO middleware

If permission check fails → request rejected immediately.

---

## 6. Notes Lifecycle (End-to-End)

### 6.1 Create Note

**API:** `POST /api/notes`

Backend actions:

* Insert row into `Note`
* Insert OWNER row into `NotePermission`

Tables affected:

* `Note`
* `NotePermission`

---

### 6.2 Open Note

**API:** `GET /api/notes/:id`

Backend actions:

* Validate permission
* Return `latestContent` and `version`

Tables read:

* `Note`
* `NotePermission`

---

## 7. Realtime Editor — Core Backend Logic

This is the most critical part of the backend.

### 7.1 Join Note (Socket)

**Event:** `join_note`

Backend steps:

1. Authenticate socket user
2. Validate note permission
3. Join socket room `note:<noteId>`
4. Send canonical content + version
5. Broadcast presence update

---

### 7.2 Edit Note (Socket `edit` event)

This handles **every realtime edit**.

#### Input from client

```json
{
  "noteId": "note-123",
  "opId": "uuid",
  "clientVersion": 5,
  "ops": [ ... ]
}
```

#### Backend processing steps

1. Validate permission (EDITOR / OWNER)
2. Idempotency check using `(noteId, opId)`
3. Start DB transaction
4. Lock note row (`SELECT ... FOR UPDATE`)
5. Compare `clientVersion` with `Note.version`

* If versions match:

  * Apply ops to content
  * Increment version
  * Save to DB
  * Insert `NoteOperation` with `APPLIED`
  * Broadcast `remote_edit`

* If versions mismatch:

  * Insert `NoteOperation` with `REJECTED`
  * Respond with `op_rejected`

---

### 7.3 Apply Operation

* Operations are **small diffs**, not full content
* Backend applies ops deterministically
* Backend always produces the **canonical state**

Tables written:

* `Note`
* `NoteOperation`

---

### 7.4 Broadcast Update

* Broadcast to Socket.IO room
* Redis adapter ensures delivery across instances

```json
{
  "type": "remote_edit",
  "noteId": "note-123",
  "serverVersion": 6,
  "ops": [ ... ]
}
```

---

## 8. NoteOperation — Why it Exists

### Purpose

* Idempotency (safe retries)
* Conflict detection
* Audit trail
* Debugging and analytics

### Characteristics

* Append-only
* Unique `(noteId, opId)`
* Can be compacted later

---

## 9. NoteVersion — History & Restore

### Purpose

* Fast access to historical states
* Restore previous versions without replaying ops

### Creation

* Created periodically (every N ops or minutes)
* Created manually on restore

### Restore Flow

1. Load snapshot
2. Replace `Note.latestContent`
3. Increment version
4. Broadcast restore to collaborators

Tables affected:

* `NoteVersion`
* `Note`
* `NoteOperation`

---

## 10. Conflict Handling Strategy

* Backend enforces strict version ordering
* Only one operation applies per version
* Conflicts are rejected, not merged

### Why

* Simple
* Deterministic
* Easy to debug

(OT / CRDT can be added later)

---

## 11. Offline & Reconnect Support

Backend supports reconnect by:

* Always serving canonical content on join
* Allowing idempotent op retries
* Rejecting outdated ops with re-sync instructions

Client decides how to rebase or resend.

---

## 12. Sharing & Collaboration

### APIs

* `POST /api/notes/:id/share`
* `POST /api/notes/:id/share/link`

### Tables

* `NotePermission`
* `ShareLink`

Sharing rules enforced identically for REST and sockets.

---

## 13. Scaling Strategy

### Horizontal scaling

* Multiple Node.js instances
* Redis Pub/Sub for Socket.IO

### Database

* Row-level locking per note
* Safe for moderate concurrency

### Optimization

* Batch ops
* Periodic compaction
* Snapshot pruning

---

## 14. Error Handling

* Auth errors → 401 / socket disconnect
* Permission errors → 403
* Version conflicts → `op_rejected`
* DB failures → retry or fail fast

Errors are logged with context for debugging.

---

## 15. Security Considerations

* JWT verification for all requests
* Permission checks everywhere
* Input validation for ops
* Rate limiting on edit events
* Sanitization for rendered content

---

## 16. Folder Structure (Suggested)

```
backend/
 ├── src/
 │   ├── api/
 │   ├── auth/
 │   ├── sockets/
 │   ├── services/
 │   ├── middlewares/
 │   ├── prisma/
 │   └── utils/
 └── README.md
```

---

## 17. What This Backend Demonstrates

* Realtime system design
* Conflict-safe collaboration
* Event-driven architecture
* Scalable permission model
* Production-grade data consistency

---

## 18. Future Enhancements

* CRDT-based syncing (Yjs / Automerge)
* Background compaction workers
* Fine-grained block-based editing
* Webhooks & integrations
* Analytics on collaboration patterns

---

## Final Notes

This backend is intentionally designed to be:

* **Correct before clever**
* **Scalable without complexity**
* **Easy to explain in interviews**

It mirrors real-world collaborative systems while remaining practical to build and maintain.
