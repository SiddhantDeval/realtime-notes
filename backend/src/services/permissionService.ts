import type { NoteRole } from 'prisma/client'
import { $Enums } from 'prisma/client'

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

        if (requiredRole === $Enums.NoteRole.VIEWER) {
            return (
                userRole === $Enums.NoteRole.VIEWER ||
                userRole === $Enums.NoteRole.EDITOR ||
                userRole === $Enums.NoteRole.OWNER
            )
        }

        if (requiredRole === $Enums.NoteRole.EDITOR) {
            return userRole === $Enums.NoteRole.EDITOR || userRole === $Enums.NoteRole.OWNER
        }

        if (requiredRole === $Enums.NoteRole.OWNER) {
            return userRole === $Enums.NoteRole.OWNER
        }

        return false
    }

    static canEdit(role: NoteRole | null): boolean {
        return PermissionService.hasPermission(role, $Enums.NoteRole.EDITOR)
    }

    static canView(role: NoteRole | null): boolean {
        return PermissionService.hasPermission(role, $Enums.NoteRole.VIEWER)
    }
}
