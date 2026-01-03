import { NoteRole } from '@prisma/client'

/**
 * Checks if a user has the required role for a note.
 * Hierarchy: OWNER > EDITOR > VIEWER
 */
export default class PermissionService {
    static hasPermission(
        userRole: NoteRole | null,
        requiredRole: NoteRole
    ): boolean {
        if (!userRole) return false

        if (requiredRole === NoteRole.VIEWER) {
            return (
                userRole === NoteRole.VIEWER ||
                userRole === NoteRole.EDITOR ||
                userRole === NoteRole.OWNER
            )
        }

        if (requiredRole === NoteRole.EDITOR) {
            return userRole === NoteRole.EDITOR || userRole === NoteRole.OWNER
        }

        if (requiredRole === NoteRole.OWNER) {
            return userRole === NoteRole.OWNER
        }

        return false
    }

    static canEdit(role: NoteRole | null): boolean {
        return PermissionService.hasPermission(role, NoteRole.EDITOR)
    }

    static canView(role: NoteRole | null): boolean {
        return PermissionService.hasPermission(role, NoteRole.VIEWER)
    }
}
