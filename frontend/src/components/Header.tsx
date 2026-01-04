'use client'
import { useState, Activity } from 'react'
import { Home, Menu, StickyNote, X } from 'lucide-react'
import { useAuth } from '@/context/authContext'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface HeaderProps {
    toggleTheme?: () => void
    theme?: 'light' | 'dark'
}
export default function Header(props: HeaderProps) {
    const { isAuthenticated, logout } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const handleSideNavOpen = () => {
        setIsOpen((prev) => !prev)
    }
    const isCurrentPage = {
        login: pathname === '/login',
        register: pathname === '/register',
        notes: pathname === '/notes',
        home: pathname === '/',
    }

    return (
        <>
            <header className="min-h-16 px-4 md:px-8 py-2 flex items-center border-b border-gray-200 dark:border-white/10 sm:flex-row">
                <h1 className="text-xl font-semibold flex items-center gap-3 text-text-primary-light dark:text-text-primary-dark">
                    <Link
                        href="/"
                        className="flex items-center gap-3 fill-current"
                    >
                        <img
                            src="/assets/logo.svg"
                            alt="SyncNotes"
                            className="h-10 w-10 fill-current"
                        />
                        <span className="text-xl font-bold">SyncNotes</span>
                    </Link>
                </h1>
                <div className="flex-1" />
                <nav className="hidden md:flex gap-4 items-center">
                    <Activity mode={!isCurrentPage.home ? 'visible' : 'hidden'}>
                        <Link
                            href="/"
                            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-surface-primary/40 transition-colors"
                        >
                            <Home size={20} />
                            <span className="font-medium">Home</span>
                        </Link>
                    </Activity>
                    <Activity mode={isAuthenticated ? 'visible' : 'hidden'}>
                        <Link
                            href="/notes"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-primary/20 transition-colors"
                        >
                            <StickyNote size={20} />
                            <span className="font-medium">Notes</span>
                        </Link>
                    </Activity>

                    <Activity mode={!isAuthenticated ? 'visible' : 'hidden'}>
                        <Activity
                            mode={!isCurrentPage.login ? 'visible' : 'hidden'}
                        >
                            <Link
                                href="/login"
                                onClick={logout}
                                className="inline-flex items-center justify-center font-bold px-6 py-3 rounded-2xl btn-ghost focus-Activity:outline-[--color-surface-primary]"
                            >
                                <span className="font-medium">
                                    {isAuthenticated ? 'Logout' : 'Login'}
                                </span>
                            </Link>
                        </Activity>
                        <Activity
                            mode={
                                !isCurrentPage.register ? 'visible' : 'hidden'
                            }
                        >
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center font-bold px-6 p-3 rounded-2xl btn-primary focus-visible:outline-surface-primary"
                            >
                                <span className="truncate">Get Started</span>
                            </Link>
                        </Activity>
                    </Activity>
                </nav>

                {/* theme toggle  */}
                <button
                    onClick={props.toggleTheme}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-primary/20 transition-colors"
                    aria-label="Toggle theme"
                >
                    {props.theme}
                </button>
                <button
                    onClick={handleSideNavOpen}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors block md:hidden"
                    aria-label="Open menu"
                >
                    <Menu size={24} />
                </button>
            </header>

            <aside
                className={`fixed top-0 left-0 h-full w-80 bg-white dark:bg-surface-dark-light shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold">SyncNotes</h2>
                    <button
                        onClick={handleSideNavOpen}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        aria-label="Close menu"
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 p-4 overflow-y-auto">
                    <Link
                        href="/"
                        onClick={handleSideNavOpen}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
                        // activeProps={{
                        //   className: "flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors",
                        // }}
                    >
                        <Home size={20} />
                        <span className="font-medium">Home</span>
                    </Link>

                    <Link
                        href="/notes"
                        onClick={handleSideNavOpen}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
                        // activeProps={{
                        //   className: "flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors",
                        // }}
                    >
                        <StickyNote size={20} />
                        <span className="font-medium">Notes</span>
                    </Link>
                </nav>
            </aside>
        </>
    )
}
