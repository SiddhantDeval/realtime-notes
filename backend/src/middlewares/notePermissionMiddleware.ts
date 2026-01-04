import { $Enums } from 'prisma/client'
import { Request, Response, NextFunction } from 'express'
import { ResponseHelper } from '@/helpers'
import PermissionService from '@/services/permissionService'
import prisma from '@/models/client'
import type { NoteRole } from 'prisma/client'

/**
 * Middleware to check if user has permission to access a note
 * Requires authMiddleware to run first to populate req.user
 */
export const checkNotePermission = (
    requiredRole: NoteRole = $Enums.NoteRole.VIEWER
) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.id
            if (!userId) {
                return ResponseHelper.unauthorized(
                    res,
                    'User not authenticated'
                )
            }

            const noteId = req.params.id || req.params.noteId
            if (!noteId) {
                return ResponseHelper.badRequest(res, 'Note ID is required')
            }

            // Fetch note
            const note = await prisma.note.findUnique({
                where: { id: noteId },
                include: {
                    permissions: {
                        where: { userId },
                    },
                },
            })

            if (!note) {
                return ResponseHelper.notFound(res, 'Note not found')
            }

            // Check if note is deleted
            if (note.isDeleted) {
                return ResponseHelper.notFound(res, 'Note not found')
            }

            // Check if user is owner
            if (note.ownerId === userId) {
                // Owner has all permissions
                req.userRole = $Enums.NoteRole.OWNER
                req.note = note
                return next()
            }

            // Check explicit permissions
            const permission = note.permissions[0]
            const userRole = permission?.role || null

            // Check if note is public and no specific permission required
            if (
                note.visibility === $Enums.NoteVisibility.PUBLIC &&
                requiredRole === $Enums.NoteRole.VIEWER
            ) {
                req.userRole = $Enums.NoteRole.VIEWER
                req.note = note
                return next()
            }

            // Check if user has required permission
            if (!PermissionService.hasPermission(userRole, requiredRole)) {
                return ResponseHelper.forbidden(
                    res,
                    'You do not have permission to perform this action'
                )
            }

            // Attach user role and note to request
            req.userRole = userRole
            req.note = note

            next()
        } catch (error) {
            return ResponseHelper.error(res, error)
        }
    }
}

/**
 * Middleware to check if user can view a note
 */
export const canViewNote = checkNotePermission($Enums.NoteRole.VIEWER)

/**
 * Middleware to check if user can edit a note
 */
export const canEditNote = checkNotePermission($Enums.NoteRole.EDITOR)

/**
 * Middleware to check if user is note owner
 */
export const isNoteOwner = checkNotePermission($Enums.NoteRole.OWNER)
