import { client } from './client'
import { AuthSession } from '@/types'

export class Auth {
    static readonly LOCAL_STORAGE_AUTH_KEY = client.LOCAL_STORAGE_AUTH_KEY
    static readonly REFRESH_THRESHOLD_MS = 60 * 1000 // 1 minute before expiry

    static login(payload: { email: string; password: string }) {
        return client.login(payload)
    }

    static register(payload: {
        email: string
        password: string
        name: string
    }) {
        return client.register(payload)
    }

    static logout() {
        this.clearSession()
        return client.logout()
    }

    static getCurrentUser() {
        return client.me()
    }

    static refreshToken() {
        return client.refreshToken()
    }

    // --- Session Management ---

    static setSession(session: AuthSession) {
        if (typeof window === 'undefined') return
        localStorage.setItem(
            Auth.LOCAL_STORAGE_AUTH_KEY,
            JSON.stringify(session)
        )
    }

    static getSession(): AuthSession | null {
        if (typeof window === 'undefined') return null
        const json = localStorage.getItem(Auth.LOCAL_STORAGE_AUTH_KEY)
        const session = this.safeParse<AuthSession>(json)
        return session
    }

    static clearSession() {
        if (typeof window === 'undefined') return
        localStorage.removeItem(Auth.LOCAL_STORAGE_AUTH_KEY)
    }

    // --- Helpers ---

    static getJwtExp(token: string): number | null {
        try {
            const [, payload] = token.split('.')
            if (!payload) return null
            const decoded = JSON.parse(
                atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
            )
            return typeof decoded.exp === 'number' ? decoded.exp * 1000 : null
        } catch {
            return null
        }
    }

    static isTokenExpired(token: string): boolean {
        const exp = this.getJwtExp(token)
        if (!exp) return true // Treat invalid/no exp as expired
        return Date.now() >= exp
    }

    static shouldRefreshToken(token: string): boolean {
        const exp = this.getJwtExp(token)
        if (!exp) return false
        return exp - Date.now() <= Auth.REFRESH_THRESHOLD_MS
    }

    static getTimeUntilRefresh(token: string): number {
        const exp = this.getJwtExp(token)
        if (!exp) return 0
        return Math.max(0, exp - Date.now() - Auth.REFRESH_THRESHOLD_MS)
    }

    static safeParse<T>(json: string | null): T | null {
        if (!json) return null
        try {
            return JSON.parse(json)
        } catch {
            return null
        }
    }
}
