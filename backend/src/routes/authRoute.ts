import { Router } from 'express'
import { AuthController } from '@/controllers'
import { authMiddleware } from '@/middlewares'
import passport from 'passport'

const router = Router()

router.post('/login', AuthController.login)
router.post('/logout', AuthController.logout)
router.post('/register', AuthController.register)
router.post('/refresh-token', AuthController.refreshToken)
router.get('/me', authMiddleware, AuthController.me)

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    AuthController.googleCallback
)

export default router
