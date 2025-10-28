import { Router } from 'express'
import prisma from '@/models/client'
import { ResponseHelper, ErrorHelper } from '@/helpers'
import { authMiddleware } from '@/middlewares/authMiddleware'


const router = Router()

router.post('/', async (req, res) => {
    try {
        const user = await prisma.user.create({
            data: req.body,
        })
        ResponseHelper.success(res, user, 201)
    } catch (error) {
        ResponseHelper.error(res, error)
    }
})

router.get('/', authMiddleware, async (req, res) => {
    try {
        const users = await prisma.user.findMany()
        ResponseHelper.success(res, users)
    } catch (error) {
        ResponseHelper.error(res, error)
    }
})

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const user = await prisma.user.findUnique({
            where: { id: Number(id) },
        })

        if (!user) {
            return ResponseHelper.notFound(res, 'User not found')
        }

        ResponseHelper.success(res, user)
    } catch (error) {
        ResponseHelper.error(res, error)
    }
})

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params
        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: req.body,
        })
        ResponseHelper.success(res, user)
    } catch (error) {
        ResponseHelper.error(res, error)
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params
        await prisma.user.delete({
            where: { id: Number(id) },
        })
        ResponseHelper.success(res, { message: 'User deleted successfully' }, 204)
    } catch (error) {
        ResponseHelper.error(res, error)
    }
})

export default router
