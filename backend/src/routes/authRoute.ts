import { Router } from 'express'
import AuthController from '@/controllers/authController'
import { authMiddleware } from '@/middlewares/authMiddleware'
const router = Router()

router.get('/login', AuthController.login)
router.post('/register', AuthController.register)
router.get('/me', authMiddleware, AuthController.me)

export default router
