import { Router } from 'express'
import NoteController from '@/controllers/noteController'
import { authMiddleware } from '@/middlewares/authMiddleware'
import {
    canViewNote,
    canEditNote,
    isNoteOwner,
} from '@/middlewares/notePermissionMiddleware'

const router = Router()

// All note routes require authentication
router.use(authMiddleware)

// Create note - only requires auth
router.post('/', NoteController.createNote)

// Get user's notes - only requires auth
router.get('/', NoteController.getMyNotes)

// Get specific note - requires view permission
router.get('/:id', canViewNote, NoteController.getNote)

// Update note - requires edit permission
router.put('/:id', canEditNote, NoteController.updateNote)

// Delete note - requires owner permission
router.delete('/:id', isNoteOwner, NoteController.deleteNote)

export default router
