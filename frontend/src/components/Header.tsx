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
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User } from '@/types'

interface HeaderProps {
    toggleTheme?: () => void
    theme?: 'light' | 'dark'
}

export default function Header({ toggleTheme, theme }: HeaderProps) {
    const { isAuthenticated, user, logout } = useAuth()
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
            <header className="sticky top-0 z-40 w-full border-b border-border-default/50 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md transition-all">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="flex items-center gap-2.5 group"
                        title="SyncNotes Home"
                    >
                        <div className="relative flex items-center justify-center">
                            <img
                                src="/assets/logo.svg"
                                alt="Logo"
                                className="h-9 w-9 transition-transform group-hover:scale-110"
                            />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-surface-primary to-purple-600 dark:to-indigo-400">
                            SyncNotes
                        </span>
                    </Link>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-6">
                        {/* Navigation */}
                        <nav className="flex items-center gap-1">
                            <Link
                                href="/"
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    isActive('/')
                                        ? 'bg-surface-primary/10 text-surface-primary'
                                        : 'text-text-secondary hover:text-text-primary hover:bg-gray-100 dark:hover:bg-white/5'
                                }`}
                            >
                                <Home size={18} />
                                Home
                            </Link>
                            
                            {isAuthenticated && (
                                <Link
                                    href="/notes"
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                        isActive('/notes')
                                            ? 'bg-surface-primary/10 text-surface-primary'
                                            : 'text-text-secondary hover:text-text-primary hover:bg-gray-100 dark:hover:bg-white/5'
                                    }`}
                                >
                                    <StickyNote size={18} />
                                    Notes
                                </Link>
                            )}
                        </nav>

                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2" />

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-text-secondary hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 transition-colors"
                            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        >
                            {theme === 'dark' ? (
                                <Moon size={20} />
                            ) : (
                                <Sun size={20} />
                            )}
                        </button>

                        {/* User Profile or Auth Buttons */}
                        {isAuthenticated ? (
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent hover:border-border-default/50 transition-all"
                                >
                                    {user?.avatarUrl ? (
                                        <img
                                            src={user.avatarUrl}
                                            alt={user.name || 'User'}
                                            className="h-8 w-8 rounded-full object-cover ring-2 ring-surface-primary/20"
                                        />
                                    ) : (
                                        <div className="h-8 w-8 rounded-full bg-linear-to-br from-surface-primary to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                            {getInitials(user)}
                                        </div>
                                    )}
                                    <span className="text-sm font-medium max-w-[100px] truncate hidden lg:block">
                                        {user?.name || 'User'}
                                    </span>
                                    <ChevronDown size={14} className={`text-text-secondary transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                {isProfileOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#1e1b36] rounded-xl shadow-xl border border-border-default dark:border-gray-700 py-1.5 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50 mb-1">
                                            <p className="text-sm font-semibold text-text-primary dark:text-gray-100">
                                                {user?.name}
                                            </p>
                                            <p className="text-xs text-text-secondary truncate dark:text-gray-400">
                                                {user?.email}
                                            </p>
                                        </div>
                                        
                                        <div className="px-1.5">
                                            <Link 
                                                href="/profile" 
                                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 pointer-events-none opacity-50"
                                            >
                                                <UserIcon size={16} />
                                                Profile
                                            </Link>
                                            <Link 
                                                href="/settings" 
                                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 pointer-events-none opacity-50"
                                            >
                                                <Settings size={16} />
                                                Settings
                                            </Link>
                                        </div>
                                        
                                        <div className="mt-1 border-t border-gray-100 dark:border-gray-700/50 px-1.5 pt-1.5">
                                            <button
                                                onClick={() => {
                                                    logout()
                                                    setIsProfileOpen(false)
                                                }}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <LogOut size={16} />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/login"
                                    className="px-5 py-2 text-sm font-bold text-text-primary hover:text-surface-primary transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-5 py-2 rounded-full bg-surface-primary text-white text-sm font-bold shadow-lg shadow-surface-primary/25 hover:brightness-110 hover:shadow-surface-primary/40 active:scale-95 transition-all"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="flex md:hidden items-center gap-2">
                         <button
                            onClick={toggleTheme}
                             className="p-2 rounded-full text-text-secondary hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        >
                             {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                        <button
                            onClick={() => setIsMobileOpen(true)}
                            className="p-2 text-text-primary hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation Drawer */}
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMobileOpen(false)}
            />
            
            {/* Drawer */}
            <aside
                className={`fixed top-0 right-0 h-full w-[280px] bg-white dark:bg-surface-dark shadow-2xl z-50 transform transition-transform duration-300 ease-out md:hidden flex flex-col ${
                    isMobileOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                    <span className="font-bold text-lg">Menu</span>
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
                    <Link
                        href="/"
                        className={`flex items-center gap-3 p-3 rounded-xl font-medium transition-colors ${
                            isActive('/') 
                            ? 'bg-surface-primary/10 text-surface-primary' 
                            : 'hover:bg-gray-100 dark:hover:bg-white/5'
                        }`}
                    >
                        <Home size={20} />
                        Home
                    </Link>
                    
                    {isAuthenticated && (
                        <Link
                            href="/notes"
                            className={`flex items-center gap-3 p-3 rounded-xl font-medium transition-colors ${
                                isActive('/notes') 
                                ? 'bg-surface-primary/10 text-surface-primary' 
                                : 'hover:bg-gray-100 dark:hover:bg-white/5'
                            }`}
                        >
                            <StickyNote size={20} />
                            Notes
                        </Link>
                    )}

                    <div className="my-2 border-t border-gray-100 dark:border-gray-800" />

                    {isAuthenticated ? (
                        <>
                             <div className="px-3 py-2 flex items-center gap-3 mb-2">
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-surface-primary/20 text-surface-primary flex items-center justify-center font-bold">
                                        {getInitials(user)}
                                    </div>
                                )}
                                <div className="flex flex-col">
                                    <span className="font-medium text-sm">{user?.name}</span>
                                    <span className="text-xs text-text-secondary">{user?.email}</span>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="flex items-center gap-3 p-3 rounded-xl font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            >
                                <LogOut size={20} />
                                Logout
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col gap-2 p-2">
                            <Link
                                href="/login"
                                className="w-full py-2.5 text-center font-bold text-text-primary border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5"
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="w-full py-2.5 text-center font-bold text-white bg-surface-primary rounded-xl shadow-md"
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
