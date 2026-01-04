export interface User {
    id: string
    email: string
    name: string
    avatarUrl?: string
    createdAt: string
    updatedAt: string
}

export interface AuthSession {
    token?: string | null
    user?: User | null
}
