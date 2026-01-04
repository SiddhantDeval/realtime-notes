'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/authContext'
import { client } from '@/api/client'
import NoteCard from '@/components/NoteCard'
import NoteCardSkeleton from '@/components/NoteCardSkeleton'
import { ChevronDown, CircleX, Plus, SearchIcon } from 'lucide-react'
import InfiniteScroll from 'react-infinite-scroll-component'

interface NoteItem {
    id: string
    title: string
    updatedAt: string
    content: string
    ownerId: string
    owner: {
        name: string
        email: string
    }
}

export default function Notes() {
    const [notes, setNotes] = useState<NoteItem[]>([])
    const [search, setSearch] = useState('')
    const [sort, setSort] = useState('updatedAt:desc')
    const [cursor, setCursor] = useState<string | undefined>(undefined)
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(false)
    const [initialLoaded, setInitialLoaded] = useState(false)

    const router = useRouter()
    const { user } = useAuth()

    const loadNotes = useCallback(
        async (reset = false) => {
            if (loading && !reset) return
            setLoading(true)

            try {
                const currentCursor = reset ? undefined : cursor
                const res = await client.getNotes({
                    search,
                    sort,
                    cursor: currentCursor,
                    limit: 20,
                })

                const data = res.data || res
                const newNotes = data.notes || []
                const nextCursor = data.nextCursor

                if (reset) {
                    setNotes(newNotes)
                } else {
                    setNotes((prev) => [...prev, ...newNotes])
                }

                setCursor(nextCursor)
                setHasMore(!!nextCursor)
            } catch (error) {
                console.error('Failed to fetch notes', error)
            } finally {
                setLoading(false)
                setInitialLoaded(true)
            }
        },
        [search, sort, cursor, loading]
    )

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setCursor(undefined)
            setHasMore(true)
            setNotes([])
            loadNotes(true)
        }, 500)
        return () => clearTimeout(timeoutId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, sort])

    const handleCreateNote = async () => {
        try {
            const newNote = await client.createNote({
                title: 'Untitled Discussion',
                content: '',
            })
            const note = newNote.data || newNote
            if (note?.id) {
                router.push(`/notes/${note.id}`)
            }
        } catch (error) {
            console.error('Failed to create note', error)
        }
    }

    return (
        <div className="bg-surface-subtle dark:bg-surface-subtle min-h-screen flex flex-col">
            <div className="relative h-full flex flex-col flex-1">
                <div
                    className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto h-[calc(100vh-64px)]"
                    id="scrollableDiv"
                >
                    <div className="w-full max-w-6xl mx-auto">
                        <div className="flex flex-col gap-6 mb-8">
                            <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                                <label className="flex flex-col w-full group">
                                    <div className="flex w-full flex-1 items-stretch rounded-xl h-12 shadow-sm transition-all duration-200 ring-1 ring-border focus-within:ring-2 focus-within:ring-primary/50 bg-surface dark:bg-surface">
                                        <div className="text-text-tertiary flex items-center justify-center pl-4">
                                            <SearchIcon className="w-5 h-5" />
                                        </div>
                                        <input
                                            className="flex w-full min-w-0 flex-1 bg-transparent border-none h-full placeholder:text-text-tertiary px-4 pl-2 text-sm text-text-secondary focus:outline-none"
                                            placeholder="Search discussions..."
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(e.target.value)
                                            }
                                        />
                                        {search && (
                                            <button
                                                onClick={() => setSearch('')}
                                                className="px-4 text-text-tertiary hover:text-text-primary transition-colors"
                                            >
                                                <CircleX className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </label>

                                <div className="min-w-[160px]">
                                    <div className="relative h-12 w-full">
                                        <select
                                            value={sort}
                                            onChange={(e) =>
                                                setSort(e.target.value)
                                            }
                                            className="text-xs appearance-none w-full h-full px-4 rounded-xl bg-surface text-text-secondary border border-border focus:ring-2 focus:ring-primary/50 cursor-pointer shadow-sm pr-10 font-medium outline-none"
                                        >
                                            <option value="updatedAt:desc">
                                                Recently Updated
                                            </option>
                                            <option value="updatedAt:asc">
                                                Oldest Updated
                                            </option>
                                            <option value="title:asc">
                                                Title (A-Z)
                                            </option>
                                            <option value="title:desc">
                                                Title (Z-A)
                                            </option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-tertiary">
                                            <ChevronDown className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCreateNote}
                                    className="btn-primary flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-8 gap-2 text-base font-bold leading-normal tracking-[0.015em] hover:shadow-lg active:scale-95 transition-all duration-200"
                                >
                                    <span className="flex items-center justify-center">
                                        <Plus className="w-6 h-6 font-extrabold" />
                                    </span>
                                    <span className="flex items-center justify-center">
                                        Note
                                    </span>
                                </button>
                            </div>
                        </div>

                        {loading && notes.length === 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                                {[...Array(6)].map((_, i) => (
                                    <div key={`initial-skeleton-${i}`}>
                                        <NoteCardSkeleton />
                                    </div>
                                ))}
                            </div>
                        )}

                        {notes.length === 0 && !loading && initialLoaded && (
                            <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in duration-500">
                                <div className="bg-surface p-6 rounded-full shadow-sm mb-6 border border-border">
                                    <div className="text-primary/50">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-12 h-12"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-text-primary">
                                    {search
                                        ? 'No matching notes found'
                                        : 'Start your first discussion'}
                                </h3>
                                <p className="text-text-secondary mt-2 max-w-sm">
                                    {search
                                        ? `We couldn't find any notes matching "${search}". Try a different keyword.`
                                        : 'Create a new note to start collaborating with your team.'}
                                </p>
                                {!search && (
                                    <button
                                        onClick={handleCreateNote}
                                        className="mt-6 px-6 py-2 bg-brand-50 text-brand-600 font-bold rounded-full hover:bg-brand-100 transition-colors"
                                    >
                                        Create New Note
                                    </button>
                                )}
                            </div>
                        )}

                        <InfiniteScroll
                            dataLength={notes.length}
                            next={() => loadNotes(false)}
                            hasMore={hasMore}
                            loader={
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-8 mt-6">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={`skeleton-${i}`}>
                                            <NoteCardSkeleton />
                                        </div>
                                    ))}
                                </div>
                            }
                            scrollableTarget="scrollableDiv"
                            className="overflow-hidden"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                                {notes.map((note) => (
                                    <div
                                        key={note.id}
                                        className="animate-in fade-in zoom-in duration-300"
                                    >
                                        <NoteCard note={note} />
                                    </div>
                                ))}
                            </div>
                        </InfiniteScroll>
                    </div>
                </div>
            </div>
        </div>
    )
}
