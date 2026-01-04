import express from 'express'
import authRoutes from '@/routes/authRoute'
import usersRoutes from '@/routes/usersRoute'
import noteRoutes from '@/routes/noteRoutes'

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/users', usersRoutes)
router.use('/notes', noteRoutes)

export default router
