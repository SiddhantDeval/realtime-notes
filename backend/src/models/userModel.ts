import prisma from './client'
import { type User } from '@prisma-client/prisma'

class UserModel {
    static async findByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } })
    }

    static async findById(id: number) {
        return prisma.user.findUnique({ where: { id } })
    }

    static async findAll() {
        return prisma.user.findMany()
    }

    static async create(data: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
        return prisma.user.create({ data })
    }

    static async update(id: number, data: Partial<User>) {
        return prisma.user.update({ where: { id }, data })
    }

    static async delete(id: number) {
        return prisma.user.delete({ where: { id } })
    }
}

export default UserModel
