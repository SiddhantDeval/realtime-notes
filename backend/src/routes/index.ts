import express from 'express'
import authRoutes from '@/routes/authRoute'
import usersRoutes from '@/routes/usersRoute'
import { ResponseHelper } from '@/helpers'


const router = express.Router()
router.use('/auth', authRoutes)
router.use('/users', usersRoutes)
router.use((req, res) => ResponseHelper.notFound(res))

export default router
