import Link from 'next/link'

interface Note {
    id: string
    title: string
    updatedAt: string
    owner?: {
        name: string
        email: string
    }
}

interface NoteCardProps {
    note: Note
}

function getRelativeTime(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + 'y ago'
    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + 'mo ago'
    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + 'd ago'
    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + 'h ago'
    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + 'm ago'
    return 'Just now'
}

function getInitials(name: string) {
    return name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
}

// Generate a deterministic gradient based on the note ID or title
function getGradient(id: string) {
    const gradients = [
        'from-blue-400 to-indigo-500',
        'from-emerald-400 to-teal-500',
        'from-orange-400 to-pink-500',
        'from-purple-400 to-fuchsia-500',
        'from-cyan-400 to-blue-500',
    ];
    const index = id.charCodeAt(0) % gradients.length;
    return gradients[index];
}

export default function NoteCard({ note }: NoteCardProps) {
    return (
        <Link href={`/notes/${note.id}`} className="block h-full group">
            <div className="relative flex flex-col h-full overflow-hidden transition-all duration-300 bg-card border border-border rounded-2xl hover:shadow-xl hover:-translate-y-1 hover:border-brand-300/50 dark:hover:border-brand-500/30">
                
                {/* Decorative Top Gradient / Image Placeholder */}
                <div className={`h-32 w-full bg-linear-to-br ${getGradient(note.id)} relative opacity-90 group-hover:opacity-100 transition-opacity`}>
                   {/* Overlay pattern or texture could go here */}
                   <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                   
                   {/* Date Badge */}
                   <div className="absolute top-3 right-3 px-2.5 py-1 text-xs font-medium text-white/90 bg-black/20 backdrop-blur-md rounded-full border border-white/10">
                        {note.updatedAt ? getRelativeTime(note.updatedAt) : 'New'}
                   </div>
                </div>

                {/* Content Body */}
                <div className="flex flex-col flex-1 p-5">
                    <h3 className="text-lg font-bold text-text-primary leading-tight line-clamp-2 mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {note.title || 'Untitled Note'}
                    </h3>
                    
                    <p className="text-sm text-text-muted line-clamp-3 mb-4">
                        {/* Placeholder for description if it existed, or just spacing */}
                        Capture ideas, refine your thoughts, and collaborate in real-time.
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/50">
                        {/* Author Info */}
                        <div className="flex items-center gap-2">
                             <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-surface-muted border border-border text-xs font-bold text-text-secondary group-hover:bg-brand-50 group-hover:text-brand-600 dark:group-hover:bg-brand-900/30 dark:group-hover:text-brand-300 transition-colors">
                                {getInitials(note.owner?.name || 'U')}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-text-primary line-clamp-1">
                                    {note.owner?.name || 'Unknown'}
                                </span>
                                <span className="text-[10px] text-text-muted">Author</span>
                            </div>
                        </div>

                        {/* Action Icon (Hidden by default, shown on hover/group-hover) */}
                         <div className="w-8 h-8 flex items-center justify-center rounded-full text-text-tertiary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 bg-surface-muted hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/30">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}
