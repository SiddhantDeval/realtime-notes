'use client'

import { useState, useEffect, useRef } from 'react'
import {
    Home,
    Menu,
    StickyNote,
    X,
    Sun,
    Moon,
    LogOut,
    User as UserIcon,
    ChevronDown,
    Settings,
} from 'lucide-react'
import { useAuth } from '@/context/authContext'
import { useTheme } from '@/context/themeContext'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User } from '@/types'

export default function Header() {
    const { isAuthenticated, user, logout } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const pathname = usePathname()
    const profileRef = useRef<HTMLDivElement>(null)

    // Close dropdowns on route change
    useEffect(() => {
        setIsMobileOpen(false)
        setIsProfileOpen(false)
    }, [pathname])

    // Click outside to close profile dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                profileRef.current &&
                !profileRef.current.contains(event.target as Node)
            ) {
                setIsProfileOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const isActive = (path: string) => pathname === path

    const getInitials = (u?: User | null) => {
        if (!u) return 'U'
        if (u.name) return u.name[0].toUpperCase()
        if (u.email) return u.email[0].toUpperCase()
        return 'U'
    }

    return (
        <>
            <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/80 backdrop-blur-xl transition-all">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">

                    {/* Brand */}
                    <div className="flex items-center gap-8">
                        <Link
                            href="/"
                            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
                        >
                            <div className="relative flex items-center justify-center">
                                <img
                                    src="/assets/logo.svg"
                                    alt="Logo"
                                    className="h-8 w-8"
                                />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-brand-600 to-brand-400">
                                SyncNotes
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1 absolute left-1/2 transform -translate-x-1/2">
                        <div className="p-1 flex items-center bg-surface-subtle rounded-full border border-border backdrop-blur-md">
                            <Link
                                href="/"
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                                    isActive('/')
                                        ? 'bg-surface shadow-sm text-brand-600'
                                        : 'text-text-secondary hover:text-text-primary hover:bg-surface/50'
                                }`}
                            >
                                <Home size={16} />
                                <span>Home</span>
                            </Link>

                            {isAuthenticated && (
                                <Link
                                    href="/notes"
                                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                                        isActive('/notes')
                                            ? 'bg-surface shadow-sm text-brand-600'
                                            : 'text-text-secondary hover:text-text-primary hover:bg-surface/50'
                                    }`}
                                >
                                    <StickyNote size={16} />
                                    <span>Notes</span>
                                </Link>
                            )}
                        </div>
                    </nav>

                    {/* Right Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-text-secondary hover:bg-surface-subtle transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? (
                                <Moon size={20} />
                            ) : (
                                <Sun size={20} />
                            )}
                        </button>

                        <div className="h-4 w-px bg-border" />

                        {isAuthenticated ? (
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() =>
                                        setIsProfileOpen(!isProfileOpen)
                                    }
                                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-surface-subtle transition-colors group"
                                >
                                    {user?.avatarUrl ? (
                                        <img
                                            src={user.avatarUrl}
                                            alt={user.name || 'User'}
                                            className="h-8 w-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-border transition-all"
                                        />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                            {getInitials(user)}
                                        </div>
                                    )}
                                    <ChevronDown
                                        size={14}
                                        className={`text-text-secondary transition-transform duration-200 ${
                                            isProfileOpen ? 'rotate-180' : ''
                                        }`}
                                    />
                                </button>

                                {/* Dropdown */}
                                {isProfileOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-60 bg-surface rounded-2xl shadow-xl border border-border p-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                        <div className="px-3 py-2.5 mb-2 bg-surface-subtle rounded-xl">
                                            <p className="text-sm font-semibold text-text-primary">
                                                {user?.name}
                                            </p>
                                            <p className="text-xs text-text-secondary truncate">
                                                {user?.email}
                                            </p>
                                        </div>

                                        <div className="space-y-0.5">
                                            <Link
                                                href="/profile"
                                                className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-text-secondary rounded-xl hover:bg-surface-subtle transition-colors opacity-50 cursor-not-allowed"
                                            >
                                                <UserIcon size={16} />
                                                Profile
                                            </Link>
                                            <Link
                                                href="/settings"
                                                className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-text-secondary rounded-xl hover:bg-surface-subtle transition-colors opacity-50 cursor-not-allowed"
                                            >
                                                <Settings size={16} />
                                                Settings
                                            </Link>
                                        </div>

                                        <div className="mt-2 pt-2 border-t border-border">
                                            <button
                                                onClick={() => {
                                                    logout()
                                                    setIsProfileOpen(false)
                                                }}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
                                            >
                                                <LogOut size={16} />
                                                Log Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-2 rounded-full bg-text-primary text-surface text-sm font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="flex md:hidden items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-text-secondary hover:bg-surface-subtle transition-colors"
                        >
                            {theme === 'dark' ? (
                                <Moon size={20} />
                            ) : (
                                <Sun size={20} />
                            )}
                        </button>
                        <button
                            onClick={() => setIsMobileOpen(true)}
                            className="p-2 text-text-primary hover:bg-surface-subtle rounded-full transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation Drawer */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${
                    isMobileOpen
                        ? 'opacity-100'
                        : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsMobileOpen(false)}
            />

            <aside
                className={`fixed top-0 right-0 h-full w-[280px] bg-surface shadow-2xl z-50 transform transition-transform duration-300 ease-out md:hidden flex flex-col border-l border-border ${
                    isMobileOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="p-5 flex items-center justify-between border-b border-border">
                    <span className="font-bold text-lg text-text-primary">
                        Menu
                    </span>
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="p-2 text-text-secondary hover:bg-surface-subtle rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
                    <Link
                        href="/"
                        className={`flex items-center gap-3 p-3 rounded-xl font-medium transition-all ${
                            isActive('/')
                                ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400'
                                : 'text-text-secondary hover:bg-surface-subtle'
                        }`}
                        onClick={() => setIsMobileOpen(false)}
                    >
                        <Home size={20} />
                        Home
                    </Link>

                    {isAuthenticated && (
                        <Link
                            href="/notes"
                            className={`flex items-center gap-3 p-3 rounded-xl font-medium transition-all ${
                                isActive('/notes')
                                    ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400'
                                    : 'text-text-secondary hover:bg-surface-subtle'
                            }`}
                            onClick={() => setIsMobileOpen(false)}
                        >
                            <StickyNote size={20} />
                            Notes
                        </Link>
                    )}

                    <div className="my-4 border-t border-border" />

                    {isAuthenticated ? (
                        <>
                            <div className="px-3 py-2 flex items-center gap-3 mb-4 bg-surface-subtle rounded-2xl">
                                {user?.avatarUrl ? (
                                    <img
                                        src={user.avatarUrl}
                                        alt="Avatar"
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold shadow-sm">
                                        {getInitials(user)}
                                    </div>
                                )}
                                <div className="flex flex-col overflow-hidden">
                                    <span className="font-semibold text-sm text-text-primary truncate">
                                        {user?.name}
                                    </span>
                                    <span className="text-xs text-text-secondary truncate">
                                        {user?.email}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    logout()
                                    setIsMobileOpen(false)
                                }}
                                className="flex items-center gap-3 p-3 rounded-xl font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                            >
                                <LogOut size={20} />
                                Log Out
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col gap-3 mt-auto">
                            <Link
                                href="/login"
                                className="w-full py-3 text-center font-semibold text-text-primary border border-border rounded-2xl hover:bg-surface-subtle transition-colors"
                                onClick={() => setIsMobileOpen(false)}
                            >
                                Log In
                            </Link>
                            <Link
                                href="/register"
                                className="w-full py-3 text-center font-bold text-surface bg-text-primary rounded-2xl shadow-xl transition-transform active:scale-95"
                                onClick={() => setIsMobileOpen(false)}
                            >
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            </aside>
        </>
    )
}
