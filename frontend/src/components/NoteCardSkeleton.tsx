export default function NoteCardSkeleton() {
    return (
        <div className="flex flex-col items-stretch justify-start rounded-xl bg-surface shadow-sm overflow-hidden h-full animate-pulse border border-border">
            <div className="w-full aspect-16/10 bg-surface-subtle"></div>
            <div className="flex w-full grow flex-col items-stretch justify-center gap-3 p-5">
                <div className="h-6 bg-surface-subtle rounded w-3/4"></div>
                <div className="flex flex-col gap-2 mt-1">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-surface-subtle"></div>
                        <div className="h-4 bg-surface-subtle rounded w-1/3"></div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-surface-subtle"></div>
                        <div className="h-4 bg-surface-subtle rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
