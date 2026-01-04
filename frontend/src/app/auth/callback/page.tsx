'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/context/authContext'

export default function AuthCallback() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const auth = useAuth()

    useEffect(() => {
        const token = searchParams.get('token')
        if (token) {
            auth.loginWithGoogle(token)
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
