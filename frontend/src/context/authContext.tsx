'use client'

import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    useRef,
} from 'react'
import { toast } from 'sonner'
import { useRouter, usePathname } from 'next/navigation'
import { AuthService } from '@/api/auth'
import { AuthSession, User } from '@/types'

export interface AuthContextType {
    user?: User | null
    token?: string | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<boolean>
    loginWithGoogle: (token: string) => Promise<boolean>
    logout: () => Promise<void>
    register: (data: any) => Promise<boolean>
    updateCurrentUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<AuthSession | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    // Refresh timer ref
    const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // 1. Initialize from LocalStorage using Auth class
    useEffect(() => {
        const initAuth = async () => {
            const stored = AuthService.getSession()
            if (stored && stored.token) {
                // Check validity
                if (!AuthService.isTokenExpired(stored.token)) {
                    AuthService.setToken(stored.token)
                    setSession(stored)
                } else {
                    AuthService.clearSession()
                    AuthService.setToken(null)
                }
            }
            setIsLoading(false)
        }
        initAuth()
    }, [])

    // 2. Persist Session & Schedule Refresh
    useEffect(() => {
        if (!session) {
            AuthService.clearSession()
            AuthService.setToken(null)
            if (refreshTimeoutRef.current)
                clearTimeout(refreshTimeoutRef.current)
            return
        }

        AuthService.setSession(session)
        AuthService.setToken(session.token || null)

        if (!session.token) return

        // Schedule Refresh
        const msUntilRefresh = AuthService.getTimeUntilRefresh(session.token)
        const exp = AuthService.getJwtExp(session.token)

        if (!exp) return

        if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current)

        if (msUntilRefresh <= 0) {
            // Refresh now
            handleRefreshToken()
        } else {
            refreshTimeoutRef.current = setTimeout(() => {
                handleRefreshToken()
            }, msUntilRefresh)
        }

        return () => {
            if (refreshTimeoutRef.current)
                clearTimeout(refreshTimeoutRef.current)
        }
    }, [session])

    const handleRefreshToken = async () => {
        try {
            const res = await AuthService.refreshToken()
            if (res && res.data && res.data.token) {
                setSession((prev) =>
                    prev ? { ...prev, token: res.data.token } : null
                )
            }
        } catch (error) {
            console.error('Token refresh failed', error)
            logout()
        }
    }

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const res = await AuthService.login({ email, password })
            const data = res.data || res

            if (res && res.data && res.data.token) {
                AuthService.setToken(res.data.token)
                setSession({
                    token: res.data.token,
                    user: res.data.user,
                })

                const redirectUrl = sessionStorage.getItem('redirectAfterLogin')
                if (redirectUrl) {
                    sessionStorage.removeItem('redirectAfterLogin')
                    router.push(redirectUrl)
                }

                return true
            }
            return false
        } catch (error: any) {
            const msg = error.message || error.error || 'Login failed'
            toast.error(msg)
            throw error
        }
    }

    const loginWithGoogle = async (token: string): Promise<boolean> => {
        try {
            AuthService.setSession({
                token,
                user: null,
            })
            const res = await AuthService.getCurrentUser()

            if (res && res.data) {
                AuthService.setToken(token)
                setSession({
                    token,
                    user: res.data,
                })

                const redirectUrl = sessionStorage.getItem('redirectAfterLogin')
                if (redirectUrl) {
                    sessionStorage.removeItem('redirectAfterLogin')
                    router.push(redirectUrl)
                }

                return true
            }
            return false
        } catch (error: any) {
            const msg = error.message || error.error || 'Login failed'
            toast.error(msg)
            throw error
        }
    }

    const register = async (payload: any): Promise<boolean> => {
        try {
            await AuthService.register(payload)
            return true
        } catch (error: any) {
            toast.error(error.message || 'Registration failed')
            throw error
        }
    }

    const logout = async () => {
        try {
            await AuthService.logout()
        } catch (e) {
            // ignore
        }
        setSession(null)
        AuthService.clearSession()
        AuthService.setToken(null)
        router.push('/login')
        toast.info('Logged out')
    }

    const updateCurrentUser = async () => {
        try {
            const res = await AuthService.getCurrentUser()
            if (res && res.data) {
                setSession((prev) => ({
                    ...prev,
                    user: res.data,
                }))
            }
        } catch (error) {
            console.error('Failed to fetch current user', error)
        }
    }

    const value = useMemo(
        () => ({
            user: session?.user || null,
            token: session?.token || null,
            isAuthenticated: !!session,
            isLoading,
            login,
            loginWithGoogle,
            logout,
            register,
            updateCurrentUser,
        }),
        [session, isLoading]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
