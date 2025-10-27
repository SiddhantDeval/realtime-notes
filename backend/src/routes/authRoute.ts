import { Router } from 'express'
import { AuthController } from '@/controllers'
import { authMiddleware } from '@/middlewares'
const router = Router()

router.post('/login', AuthController.login)
router.post('/register', AuthController.register)
router.get('/me', authMiddleware, AuthController.me)

export default router
