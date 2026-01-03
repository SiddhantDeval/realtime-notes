import prisma from '@/models/client'
import { NoteRole, NoteVisibility } from '@prisma/client'
import PermissionService from '@/services/permissionService'

export default class NoteService {
    static async createNote(
        userId: string,
        data: { title: string; visibility?: NoteVisibility; content?: string }
    ) {
        const note = await prisma.note.create({
            data: {
                title: data.title,
                latestContent: data.content || '',
                visibility: data.visibility || NoteVisibility.PRIVATE,
                ownerId: userId,
                permissions: {
                    create: {
                        userId: userId,
                        role: NoteRole.OWNER,
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

        if (note.visibility === NoteVisibility.PRIVATE && !role) {
            return null // No access
        }

        // If public/link sharing implemented later, logic goes here.
        // For now, strict check:
        if (!PermissionService.canView(role) && note.visibility !== NoteVisibility.PUBLIC) {
             // Also check if owner (implicit in permission usually, but good to be safe)
             if (note.ownerId !== userId) return null
        }

        return {
            ...note,
            role: role || (note.ownerId === userId ? NoteRole.OWNER : null),
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
                isDeleted: false
            },
            orderBy: { updatedAt: 'desc' },
            include: {
                owner: {
                    select: { name: true, email: true }
                }
            }
        })
        return notes
    }
}
