import express from 'express'
import authRoutes from '@/routes/authRoute'
import usersRoutes from '@/routes/usersRoute'

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/users', usersRoutes)


export default router
