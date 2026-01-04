'use client'

import Link from 'next/link'
import { EyeClosedIcon, EyeIcon } from 'lucide-react'

import { useState } from 'react'

import { ControlledInput } from '@/components/Input'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/api/auth'

const signupSchema = z
    .object({
        fullName: z.string().min(1, 'Full name is required'),
        email: z.email('Invalid email address'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters long'),
        confirmPassword: z.string().min(1, 'Confirm Password is required'),
        isAgree: z
            .boolean()
            .refine(
                (val) => val === true,
                'You must agree to the terms and conditions'
            ),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })

export default function Register() {
    const [showPwd, setShowPwd] = useState(false)
    const [showCPwd, setSetshowCPwd] = useState(false)
    const router = useRouter()

    const form = useForm({
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
            isAgree: true,
        },
        validators: {
            onChange: signupSchema,
        },
        onSubmit: async ({ value }) => {
            try {
                const res = await AuthService.register({
                    name: value.fullName,
                    email: value.email,
                    password: value.password,
                })
                const data = res.data

                console.log('register user data:', data)
                toast.success('Account created successfully!')
                router.push('/login')
            } catch (error: any) {
                console.error(error)
                toast.error(
                    error.error || error.message || 'Registration failed'
                )
            }
        },
    })

    return (
        <div className="min-h-[calc(100dvh-121px-65px)] md:min-h-[calc(100dvh-65px-65px)] w-full flex items-center justify-center p-4 bg-surface-subtle">
            <div className="w-full max-w-md p-8 md:p-12 bg-surface rounded-3xl shadow-xl border border-border">
                {/* Logo / Icon */}
                <div className="flex flex-col items-center text-center gap-2">
                    <div className="mb-4 flex items-center justify-center rounded-full">
                        <Link
                            href="/"
                            className="fill-current text-xl font-semibold flex items-center gap-3 text-text-primary"
                        >
                            <img
                                src="/assets/logo.svg"
                                alt="SyncNotes"
                                className="h-10 w-10 fill-current"
                            />
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-brand-600 to-brand-400">SyncNotes</span>

                        </Link>
                    </div>
                    <h1 className="text-[32px] font-bold leading-tight tracking-tight text-text-primary">
                        Create an Account
                    </h1>
                    <h2 className="text-base text-text-secondary">
                        {' '}
                        Join SyncNotes to start collaborating
                    </h2>
                </div>

                <form
                    className="mt-8 space-y-6"
                    onSubmit={(e) => {
                        e.preventDefault()
                        form.handleSubmit()
                    }}
                >
                    {/* name */}
                    <form.Field name="fullName">
                        {(field) => (
                            <ControlledInput
                                label="Full Name"
                                type="text"
                                placeholder="Enter your full name"
                                field={field}
                            />
                        )}
                    </form.Field>

                    {/* Email */}
                    <form.Field name="email">
                        {(field) => (
                            <ControlledInput
                                label="Email"
                                type="email"
                                placeholder="Enter your email"
                                field={field}
                            />
                        )}
                    </form.Field>
                    {/* Password */}
                    <form.Field name="password">
                        {(field) => (
                            <ControlledInput
                                label="Password"
                                type={showPwd ? 'text' : 'password'}
                                autoComplete="new-password"
                                placeholder="Enter your password"
                                field={field}
                                endContent={
                                    <button
                                        type="button"
                                        onClick={() => setShowPwd((v) => !v)}
                                        className="p-2 cursor-pointer flex items-center text-text-secondary hover:text-text-primary transition-colors"
                                        aria-label={
                                            showPwd
                                                ? 'Hide password'
                                                : 'Show password'
                                        }
                                    >
                                        {showPwd ? (
                                            <EyeIcon className="h-5 w-5" />
                                        ) : (
                                            <EyeClosedIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                }
                            />
                        )}
                    </form.Field>
                    <form.Field name="confirmPassword">
                        {(field) => (
                            <ControlledInput
                                label="Confirm Password"
                                type={showCPwd ? 'text' : 'password'}
                                autoComplete="new-password"
                                placeholder="Confirm your password"
                                field={field}
                                endContent={
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSetshowCPwd((v) => !v)
                                        }
                                        className="p-2 cursor-pointer flex items-center text-text-secondary hover:text-text-primary transition-colors"
                                        aria-label={
                                            showCPwd
                                                ? 'Hide password'
                                                : 'Show password'
                                        }
                                    >
                                        {showCPwd ? (
                                            <EyeIcon className="h-5 w-5" />
                                        ) : (
                                            <EyeClosedIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                }
                            />
                        )}
                    </form.Field>
                    {/* Agree */}
                    <form.Field name="isAgree">
                        {(field) => (
                            <div className="ml-1 flex flex-col items-start gap-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id={field.name}
                                        name={field.name}
                                        checked={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) =>
                                            field.handleChange(e.target.checked)
                                        }
                                        className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                                    />
                                    <label
                                        htmlFor={field.name}
                                        className="text-sm text-text-secondary"
                                    >
                                        I agree to the{' '}
                                        <a
                                            href="#"
                                            className="text-brand-600 hover:underline"
                                        >
                                            terms and conditions
                                        </a>
                                    </label>
                                </div>
                                <div>
                                    {!field.state.meta.isValid &&
                                        (field.state.meta.isDirty ||
                                            field.state.meta.isTouched) && (
                                            <em
                                                role="alert"
                                                className="text-xs text-red-500 mt-3 ml-2 leading-0"
                                            >
                                                {
                                                    field.state.meta.errors[0]
                                                        ?.message
                                                }
                                            </em>
                                        )}
                                </div>
                            </div>
                        )}
                    </form.Field>
                    {/* Actions */}
                    <div className="pt-2 space-y-4">
                        <button
                            type="submit"
                            className="cursor-pointer w-full inline-flex items-center justify-center font-bold px-6 p-3 rounded-2xl btn-primary"
                        >
                            <span className="truncate">Register</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1'}/auth/google`
                            }}
                            className="cursor-pointer w-full inline-flex items-center justify-center font-bold px-6 p-3 rounded-2xl btn-ghost border border-border hover:bg-surface-subtle transition-colors"
                        >
                            <svg
                                className="h-6 w-6 mr-3"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                            >
                                <path
                                    d="M22.56 12.25C22.56 11.45 22.49 10.68 22.36 9.92H12V14.4H18.06C17.74 16.08 16.89 17.47 15.58 18.39V21.01H19.47C21.45 19.16 22.56 16.03 22.56 12.25Z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23C14.97 23 17.45 22.02 19.47 20.51L15.58 17.89C14.59 18.52 13.38 18.9 12 18.9C9.27 18.9 6.94 17.08 6.08 14.61H2.09V17.32C4.07 20.68 7.72 23 12 23Z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M6.08 14.61C5.83 13.88 5.68 13.08 5.68 12.25C5.68 11.42 5.83 10.62 6.08 9.89V7.18H2.09C1.22 8.87 0.75 10.74 0.75 12.75C0.75 14.76 1.22 16.63 2.09 18.32L6.08 14.61Z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.6C13.59 5.6 14.93 6.13 15.99 7.12L19.54 3.57C17.45 1.69 14.97 0.5 12 0.5C7.72 0.5 4.07 2.82 2.09 6.18L6.08 8.89C6.94 6.42 9.27 4.6 12 4.6V5.6Z"
                                    fill="#EA4335"
                                />
                            </svg>
                            <span className="truncate text-text-primary">
                                Continue with Google
                            </span>
                        </button>
                    </div>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-base text-text-secondary">
                        Already have an account?{'  '}
                        <Link
                            href="/login"
                            className="font-bold hover:underline text-brand-600 dark:text-brand-400"
                        >
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
