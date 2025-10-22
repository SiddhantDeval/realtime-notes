import express from 'express'
import authRoutes from '@/routes/authRoute'
import { ResponseHelper } from '@/helpers/responseHelper'

const router = express.Router()
router.use('/auth', authRoutes)
router.use((req, res) => ResponseHelper.notFound(res))

export default router
