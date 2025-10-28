export default class CustomError extends Error {
    public readonly timestamp: Date
    public readonly status: number
    public readonly details?: unknown

    constructor(message: string, status: number = 500, details?: unknown) {
        super(message)
        this.name = this.constructor.name
        this.timestamp = new Date()
        this.status = status
        this.details = details
        Error.captureStackTrace(this, this.constructor)
    }
    static throwError(message: string, status: number = 500, details?: unknown): never {
        throw new CustomError(message, status, details)
    }
}
