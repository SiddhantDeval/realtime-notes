export default class CustomError extends Error {
    public readonly errorCode: ErrorCode
    public readonly timestamp: Date
    public readonly status: number
    public readonly details?: Details

    constructor(errorCode: ErrorCode, status: number = 500, message: string, details?: Details) {
        super(message)
        this.name = this.constructor.name
        this.timestamp = new Date()
        this.status = status
        this.errorCode = errorCode
        this.details = details
        Error.captureStackTrace(this, this.constructor)
    }
    static throwError(errorCode: ErrorCode, status: number = 500, message: string, details?: Details): never {
        throw new CustomError(errorCode, status, message, details)
    }
}
interface Details {
    [key: string]: unknown
}

type Auth =
    | 'token_expired'
    | 'refresh_token_expired'
    | 'invalid_token'
    | 'failed_to_authenticate_token'
    | 'invalid_refresh_token'
    | 'invalid_credentials'
    | 'user_not_found'

type ErrorCode = Auth
