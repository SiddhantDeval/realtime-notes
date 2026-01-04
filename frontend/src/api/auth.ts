import { httpClient } from './httpClient'
import { AuthSession, User } from '@/types'

export interface AuthResponse {
    user: User
    token: string
}

export class AuthService {
    static readonly REFRESH_THRESHOLD_MS = 60 * 1000

    static login(payload: { email: string; password: string }) {
        return httpClient.post<{ data: AuthResponse }>('/auth/login', payload)
    }

    static register(payload: { email: string; password: string; name: string }) {
        return httpClient.post<{ data: AuthResponse }>('/auth/register', payload)
    }

    static logout() {
        AuthService.clearSession()
        return httpClient.post('/auth/logout')
    }

    static getCurrentUser() {
        return httpClient.get<{ data: User }>('/auth/me')
    }

    static refreshToken() {
        return httpClient.post<{ data: { token: string } }>('/auth/refresh-token')
    }

    static setToken(token: string | null) {
        httpClient.setToken(token)
    }

    static setSession(session: AuthSession) {
        if (typeof window === 'undefined') return
        localStorage.setItem('auth_session', JSON.stringify(session))
    }

    static getSession(): AuthSession | null {
        if (typeof window === 'undefined') return null
        const json = localStorage.getItem('auth_session')
        try {
            return json ? JSON.parse(json) : null
        } catch {
            return null
        }
    }

    static clearSession() {
        if (typeof window === 'undefined') return
        localStorage.removeItem('auth_session')
        AuthService.setToken(null)
    }

    static getJwtExp(token: string): number | null {
        try {
            const [, payload] = token.split('.')
            if (!payload) return null
            const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
            return typeof decoded.exp === 'number' ? decoded.exp * 1000 : null
        } catch {
            return null
        }
    }

    static isTokenExpired(token: string): boolean {
        const exp = this.getJwtExp(token)
        return exp ? Date.now() >= exp : true
    }

    static getTimeUntilRefresh(token: string): number {
        const exp = this.getJwtExp(token)
        if (!exp) return 0
        return Math.max(0, exp - Date.now() - AuthService.REFRESH_THRESHOLD_MS)
    }
}
