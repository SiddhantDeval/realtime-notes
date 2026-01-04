import { $Enums } from 'prisma/client'
import PermissionService from '@/services/permissionService'
import prisma from '@/models/client'
import type { NoteVisibility } from 'prisma/client'

export default class NoteService {
    static async createNote(
        userId: string,
        data: { title: string; visibility?: NoteVisibility; content?: string }
    ) {
        const note = await prisma.note.create({
            data: {
                title: data.title,
                latestContent: data.content || '',
                visibility: data.visibility || $Enums.NoteVisibility.PRIVATE,
                ownerId: userId,
                permissions: {
                    create: {
                        userId: userId,
                        role: $Enums.NoteRole.OWNER,
                    },
                },
            },
        })
        return note
    }

    static async getNote(noteId: string, userId: string) {
        const note = await prisma.note.findUnique({
            where: { id: noteId },
        })

        if (!note) return null

        // Check permission
        const permission = await prisma.notePermission.findUnique({
            where: {
                noteId_userId: {
                    noteId,
                    userId,
                },
            },
        })

        const role = permission?.role ?? null

        if (note.visibility === $Enums.NoteVisibility.PRIVATE && !role) {
            return null // No access
        }

        // If public/link sharing implemented later, logic goes here.
        // For now, strict check:
        if (
            !PermissionService.canView(role) &&
            note.visibility !== $Enums.NoteVisibility.PUBLIC
        ) {
            // Also check if owner (implicit in permission usually, but good to be safe)
            if (note.ownerId !== userId) return null
        }

        return {
            ...note,
            role:
                role ||
                (note.ownerId === userId ? $Enums.NoteRole.OWNER : null),
        }
    }

    static async getUserNotes(userId: string) {
        // Get notes where user is owner or has permission
        const notes = await prisma.note.findMany({
            where: {
                OR: [
                    { ownerId: userId },
                    {
                        permissions: {
                            some: { userId: userId },
                        },
                    },
                ],
                isDeleted: false,
            },
            orderBy: { updatedAt: 'desc' },
            include: {
                owner: {
                    select: { name: true, email: true },
                },
            },
        })
        return notes
    }

    static async updateNote(
        noteId: string,
        userId: string,
        data: { title?: string; visibility?: NoteVisibility; content?: string }
    ) {
        // Check if user has write access
        const note = await prisma.note.findUnique({ where: { id: noteId } })
        if (!note) return null

        const permission = await prisma.notePermission.findUnique({
            where: { noteId_userId: { noteId, userId } },
        })

        // Allow if owner or has appropriate role (e.g. EDITOR/OWNER)
        // For simplicity, checking if owner or permission exists (and not READ_ONLY)
        // You might need more granular permission checks
        const canEdit =
            note.ownerId === userId ||
            (permission && permission.role !== 'VIEWER') // Assuming VIEWER exists or similar

        if (!canEdit) return null

        const updatedNote = await prisma.note.update({
            where: { id: noteId },
            data: {
                title: data.title,
                visibility: data.visibility,
                latestContent: data.content,
            },
        })
        return updatedNote
    }

    static async deleteNote(noteId: string, userId: string) {
        const note = await prisma.note.findUnique({ where: { id: noteId } })
        if (!note) return false

        if (note.ownerId !== userId) return false // Only owner can delete

        // Soft delete
        await prisma.note.update({
            where: { id: noteId },
            data: { isDeleted: true },
        })
        return true
    }
}
