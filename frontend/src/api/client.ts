import { User } from '@/types'
import { Api } from '.'

interface ResponseData<T> {
    data: T
    status: number
}

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1'

export class ApiClient {
    private readonly api: Api
    readonly LOCAL_STORAGE_AUTH_KEY = 'auth_session'

    constructor() {
        this.api = new Api(API_URL, this.LOCAL_STORAGE_AUTH_KEY)
    }

    // --- Auth Endpoints ---

    login(payload: { email: string; password: string }) {
        return this.api.login(payload)
    }

    register(payload: { email: string; password: string; name: string }) {
        return this.api.register(payload)
    }

    logout() {
        return this.api.logout()
    }

    me() {
        return this.api.me<ResponseData<User>>()
    }

    refreshToken() {
        return this.api.refreshToken()
    }

    // --- Note Endpoints ---

    getNotes() {
        return this.api.getNotes()
    }

    getNote(id: string) {
        return this.api.getNote(id)
    }

    createNote(payload: { title: string; content?: string }) {
        return this.api.createNote(payload)
    }

    updateNote(id: string, payload: { title?: string; content?: string }) {
        return this.api.updateNote(id, payload)
    }

    deleteNote(id: string) {
        return this.api.deleteNote(id)
    }
}

export const client = new ApiClient()
