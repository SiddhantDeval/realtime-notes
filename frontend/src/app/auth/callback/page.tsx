'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { localStorageAuthKey } from '@/context/authContext'

export default function AuthCallback() {
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const token = searchParams.get('token')
        if (token) {
            // We have a token.
            // We need to fetch the user details or just assume it's valid and set it.
            // Ideally, we replicate the session structure: { token, user: ... }
            // For now, let's fetch 'me' to get the user object using this token.

            // Temporarily set token so API client uses it
            const tempSession = {
                token,
                user: { id: '', email: '', full_name: '' },
            }
            localStorage.setItem(
                localStorageAuthKey,
                JSON.stringify(tempSession)
            )

            // Use standard fetch or our API client (which reads from localstorage)
            // Since we just set it, the API client should pick it up.
            // But we need to use 'import { Api } from "@/api"'

            // Let's do a quick fetch directly for simplicity or robust flow
            // Or trigger a window reload / useAuth hook?
            // Using `useAuth` hook logic might be cleaner but we are outside of the provider's initialized state potentially?
            // No, AuthProvider is wrapper.
            // The AuthProvider reads from localStorage on mount.
            // But we are already mounted.
            // We can force a reload to let AuthProvider pick it up, or manually update via window event.

            localStorage.setItem(
                localStorageAuthKey,
                JSON.stringify({
                    token,
                    user: {
                        id: 'loading...',
                        email: '...',
                        full_name: 'Loading...',
                    },
                })
            )

            // This event triggers AuthProvider to re-read
            window.dispatchEvent(
                new StorageEvent('storage', { key: localStorageAuthKey })
            )

            toast.success('Successfully logged in with Google')
            router.push('/notes')
        } else {
            const error = searchParams.get('error')
            if (error) {
                toast.error('Login failed: ' + error)
            }
            router.push('/login')
        }
    }, [searchParams, router])

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-text-secondary">Authenticating...</p>
            </div>
        </div>
    )
}
