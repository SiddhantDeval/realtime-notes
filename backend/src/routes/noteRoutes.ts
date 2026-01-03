import { Router } from 'express'
import NoteController from '@/controllers/noteController'
import { authMiddleware } from '@/middlewares/authMiddleware'

const router = Router()

// All note routes require authentication
router.use(authMiddleware)

router.post('/', NoteController.createNote)
router.get('/', NoteController.getMyNotes)
router.get('/:id', NoteController.getNote)
router.put('/:id', NoteController.updateNote)
router.delete('/:id', NoteController.deleteNote)

export default router
