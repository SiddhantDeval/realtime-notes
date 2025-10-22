import { Response } from 'express'

export class ErrorHelper {
    static handleError(res: Response, error: unknown) {
        if (error instanceof Error) {
            // eslint-disable-next-line no-console
            console.error(error)
            return res.status(500).json({ error: error.message })
        } else {
            return res.status(500).json({ error: 'An unknown error occurred' })
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static handlePrismaError(res: Response, error: any) {
        if (error.code) {
            switch (error.code) {
                case 'P2002':
                    return res.status(409).json({ error: `Unique constraint failed on the field: ${error.meta?.target}` })
                case 'P2025':
                    return res.status(404).json({ error: `Record not found: ${error.meta?.cause}` })
                default:
                    return res.status(400).json({ error: `Prisma error (${error.code}): ${error.message}` })
            }
        }
        return this.handleError(res, error)
    }

    static handleValidationError(res: Response, message: string) {
        return res.status(400).json({ error: message })
    }

    static handleAuthenticationError(res: Response, message: string) {
        return res.status(401).json({ error: message })
    }

    static handleAuthorizationError(res: Response, message: string) {
        return res.status(403).json({ error: message })
    }

    static handleNotFound(res: Response, message: string) {
        return res.status(404).json({ error: message })
    }
}
