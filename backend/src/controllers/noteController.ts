import { Request, Response, NextFunction } from 'express'
import NoteService from '@/services/noteService'
import { NoteVisibility } from '@prisma/client'

// Middleware adds user to req.user (assuming standard auth middleware)
// We need to extend Request type or use (req as any).user
// For now, I'll assume req["user"] exists if auth middleware passed.

export default class NoteController {
    static createNote = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user?.id
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' })
                return
            }

            const { title, visibility, content } = req.body

            // Basic validation
            if (!title) {
                res.status(400).json({ error: 'Title is required' })
                return
            }

            const note = await NoteService.createNote(userId, {
                title,
                visibility: visibility as NoteVisibility,
                content,
            })

            res.status(201).json(note)
        } catch (error) {
            next(error)
        }
    }

    static getNote = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user?.id
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' })
                return
            }

            const { id } = req.params
            const note = await NoteService.getNote(id, userId)

            if (!note) {
                res.status(404).json({ error: 'Note not found or access denied' })
                return
            }

            res.json(note)
        } catch (error) {
            next(error)
        }
    }

    static getMyNotes = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user?.id
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' })
                return
            }

            const notes = await NoteService.getUserNotes(userId)
            res.json(notes)
        } catch (error) {
            next(error)
        }
    }
}
