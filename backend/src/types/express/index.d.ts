import type { NoteRole, Note } from '@prisma/client'

declare global {
    namespace Express {
        interface User {
            id: string
            email: string
            iat?: number
            exp?: number
        }

        interface Request {
            user?: User
            userRole?: NoteRole
            note?: Note & {
                permissions: Array<{
                    id: string
                    noteId: string
                    userId: string
                    role: NoteRole
                    invitedBy: string | null
                    invitedAt: Date
                    acceptedAt: Date | null
                }>
            }
        }
    }
}
