import prisma from './client'
import { type User } from 'prisma/client'

class UserModel {
    static async findByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } })
    }

    static async findById(id: string) {
        return prisma.user.findUnique({ where: { id } })
    }

    static async findAll() {
        return prisma.user.findMany()
    }

    static async create(
        data: Omit<
            User,
            'id' | 'createdAt' | 'updatedAt' | 'isActive' | 'avatarUrl'
        >
    ) {
        return prisma.user.create({ data })
    }

    static async update(id: string, data: Partial<User>) {
        return prisma.user.update({ where: { id }, data })
    }

    static async delete(id: string) {
        return prisma.user.delete({ where: { id } })
    }
}

export default UserModel
