export type UserRole = 'admin' | 'user'

export interface User {
    id: string
    email: string
    username: string
    firstName?: string
    lastName?: string
    role: UserRole
    avatarUrl?: string
    createdAt: string
    updatedAt: string
}

export interface AuthSession {
    token?: string | null
    user?: User | null
}
