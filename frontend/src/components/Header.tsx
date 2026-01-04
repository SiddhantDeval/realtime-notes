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
            <header className="sticky top-0 z-40 w-full border-b border-gray-200/50 dark:border-gray-800/50 bg-white/60 dark:bg-black/60 backdrop-blur-xl transition-all">
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
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                                SyncNotes
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1 absolute left-1/2 transform -translate-x-1/2">
                        <div className="p-1 flex items-center bg-gray-100/50 dark:bg-white/5 rounded-full border border-gray-200/50 dark:border-white/5 backdrop-blur-md">
                            <Link
                                href="/"
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                                    isActive('/')
                                        ? 'bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-white/5'
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
                                            ? 'bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-white/5'
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
                            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? (
                                <Moon size={20} />
                            ) : (
                                <Sun size={20} />
                            )}
                        </button>

                        <div className="h-4 w-px bg-gray-200 dark:bg-gray-800" />

                        {isAuthenticated ? (
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() =>
                                        setIsProfileOpen(!isProfileOpen)
                                    }
                                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors group"
                                >
                                    {user?.avatarUrl ? (
                                        <img
                                            src={user.avatarUrl}
                                            alt={user.name || 'User'}
                                            className="h-8 w-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-gray-200 dark:group-hover:ring-gray-700 transition-all"
                                        />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                            {getInitials(user)}
                                        </div>
                                    )}
                                    <ChevronDown
                                        size={14}
                                        className={`text-gray-500 transition-transform duration-200 ${
                                            isProfileOpen ? 'rotate-180' : ''
                                        }`}
                                    />
                                </button>

                                {/* Dropdown */}
                                {isProfileOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                        <div className="px-3 py-2.5 mb-2 bg-gray-50 dark:bg-white/5 rounded-xl">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {user?.name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                {user?.email}
                                            </p>
                                        </div>

                                        <div className="space-y-0.5">
                                            <Link
                                                href="/profile"
                                                className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors opacity-50 cursor-not-allowed"
                                            >
                                                <UserIcon size={16} />
                                                Profile
                                            </Link>
                                            <Link
                                                href="/settings"
                                                className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors opacity-50 cursor-not-allowed"
                                            >
                                                <Settings size={16} />
                                                Settings
                                            </Link>
                                        </div>

                                        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                                            <button
                                                onClick={() => {
                                                    logout()
                                                    setIsProfileOpen(false)
                                                }}
                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
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
                                    className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    Log In
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-2 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-bold shadow-lg shadow-gray-900/20 hover:scale-105 active:scale-95 transition-all"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="flex md:hidden items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        >
                            {theme === 'dark' ? (
                                <Moon size={20} />
                            ) : (
                                <Sun size={20} />
                            )}
                        </button>
                        <button
                            onClick={() => setIsMobileOpen(true)}
                            className="p-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
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
                className={`fixed top-0 right-0 h-full w-[280px] bg-white dark:bg-[#131121] shadow-2xl z-50 transform transition-transform duration-300 ease-out md:hidden flex flex-col border-l border-gray-100 dark:border-gray-800 ${
                    isMobileOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="p-5 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                    <span className="font-bold text-lg text-gray-900 dark:text-white">
                        Menu
                    </span>
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
                    <Link
                        href="/"
                        className={`flex items-center gap-3 p-3 rounded-xl font-medium transition-all ${
                            isActive('/')
                                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
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
                                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'
                            }`}
                            onClick={() => setIsMobileOpen(false)}
                        >
                            <StickyNote size={20} />
                            Notes
                        </Link>
                    )}

                    <div className="my-4 border-t border-gray-100 dark:border-gray-800" />

                    {isAuthenticated ? (
                        <>
                            <div className="px-3 py-2 flex items-center gap-3 mb-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                                {user?.avatarUrl ? (
                                    <img
                                        src={user.avatarUrl}
                                        alt="Avatar"
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold shadow-sm">
                                        {getInitials(user)}
                                    </div>
                                )}
                                <div className="flex flex-col overflow-hidden">
                                    <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                        {user?.name}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
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
                                className="w-full py-3 text-center font-semibold text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                onClick={() => setIsMobileOpen(false)}
                            >
                                Log In
                            </Link>
                            <Link
                                href="/register"
                                className="w-full py-3 text-center font-bold text-white bg-gray-900 dark:bg-white dark:text-black rounded-2xl shadow-xl transition-transform active:scale-95"
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
