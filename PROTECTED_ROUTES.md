# Protected Routes & Permission System

## Overview
This document describes the implementation of protected routes and permission-based access control for the realtime notes application.

## Frontend Protection

### 1. Protected Route Component
**Location**: `/frontend/src/components/ProtectedRoute.tsx`

A reusable component that wraps pages requiring authentication:
- Checks user authentication status
- Redirects unauthenticated users to `/login`
- Stores attempted URL for post-login redirect
- Shows loading state during auth check

**Usage**:
```tsx
<ProtectedRoute>
  <YourProtectedPage />
</ProtectedRoute>
```

### 2. Protected Pages
The following pages are now protected:
- `/notes` - Requires authentication to view notes list
- `/note/[id]` - Requires authentication to view/edit individual notes

### 3. Auth Context Enhancement
**Location**: `/frontend/src/context/authContext.tsx`

Enhanced login flow:
- Stores redirect URL in sessionStorage before redirecting to login
- Automatically redirects back to originally requested page after successful login
- Improves UX by maintaining user's navigation intent

## Backend Permission System

### 1. Permission Middleware
**Location**: `/backend/src/middlewares/notePermissionMiddleware.ts`

Three levels of access control:
- **`canViewNote`** - Requires VIEWER role or higher
- **`canEditNote`** - Requires EDITOR role or higher  
- **`isNoteOwner`** - Requires OWNER role

**Permission Hierarchy**:
```
OWNER > EDITOR > VIEWER
```

**Access Logic**:
1. Check if user is note owner (automatic OWNER role)
2. Check explicit permissions in `NotePermission` table
3. Check note visibility (PUBLIC notes allow VIEWER access)
4. Deny access if no permission found

### 2. Route Protection
**Location**: `/backend/src/routes/noteRoutes.ts`

All routes require authentication (`authMiddleware`):
- `POST /` - Create note (auth only)
- `GET /` - List user's notes (auth only)
- `GET /:id` - View note (requires `canViewNote`)
- `PUT /:id` - Update note (requires `canEditNote`)
- `DELETE /:id` - Delete note (requires `isNoteOwner`)

### 3. Permission Service
**Location**: `/backend/src/services/permissionService.ts`

Utility functions for permission checking:
- `hasPermission(userRole, requiredRole)` - Check if role meets requirement
- `canEdit(role)` - Check if role can edit
- `canView(role)` - Check if role can view

### 4. Database Schema
**Location**: `/backend/prisma/schema.prisma`

**Key Models**:
- `User` - User accounts
- `Session` - Authentication sessions
- `Note` - Notes with ownership and visibility
- `NotePermission` - Explicit user permissions per note
- `NoteRole` enum - OWNER, EDITOR, VIEWER
- `NoteVisibility` enum - PRIVATE, LINK, PUBLIC

**Permission Model**:
```prisma
model NotePermission {
  id        String   @id @default(uuid())
  noteId    String
  note      Note     @relation(...)
  userId    String
  user      User     @relation(...)
  role      NoteRole @default(VIEWER)
  
  @@unique([noteId, userId])
}
```

## Permission Flow

### Viewing a Note
1. User requests `/api/notes/:id`
2. `authMiddleware` validates JWT token
3. `canViewNote` middleware:
   - Fetches note from database
   - Checks if user is owner → Grant access
   - Checks `NotePermission` table for explicit permission
   - Checks if note is PUBLIC → Grant VIEWER access
   - Denies access if no permission found
4. Controller returns note data

### Editing a Note
1. User requests `PUT /api/notes/:id`
2. `authMiddleware` validates JWT token
3. `canEditNote` middleware:
   - Checks if user has EDITOR or OWNER role
   - Denies access if only VIEWER or no permission
4. Controller updates note

### Deleting a Note
1. User requests `DELETE /api/notes/:id`
2. `authMiddleware` validates JWT token
3. `isNoteOwner` middleware:
   - Checks if user is note owner
   - Denies access if not owner
4. Controller soft-deletes note

## Security Features

1. **JWT Authentication** - All API requests require valid token
2. **Role-Based Access Control (RBAC)** - Granular permissions per note
3. **Ownership Validation** - Automatic owner permissions
4. **Soft Deletes** - Notes marked as deleted, not removed
5. **Session Management** - Tracked sessions with expiration
6. **Frontend Route Guards** - Prevent unauthorized page access
7. **Backend Middleware** - Server-side permission enforcement

## Future Enhancements

1. **Share Links** - Generate public links with specific permissions
2. **Invitation System** - Invite users to collaborate
3. **Permission Expiry** - Time-limited access
4. **Audit Logging** - Track permission changes
5. **Team/Organization Support** - Group-based permissions
6. **Real-time Permission Updates** - Socket.io permission sync

## Testing

### Frontend
```bash
# Test protected routes
1. Navigate to /notes without login → Should redirect to /login
2. Login → Should redirect back to /notes
3. Navigate to /note/:id without login → Should redirect to /login
```

### Backend
```bash
# Test permission middleware
1. GET /api/notes/:id without auth → 401 Unauthorized
2. GET /api/notes/:id with auth but no permission → 403 Forbidden
3. PUT /api/notes/:id as VIEWER → 403 Forbidden
4. DELETE /api/notes/:id as EDITOR → 403 Forbidden
5. DELETE /api/notes/:id as OWNER → 204 Success
```
