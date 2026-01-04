export default function Footer() {
    return (
        <footer className="px-4 md:px-8 py-6 flex flex-col items-center justify-between gap-4 border-t border-border bg-surface md:flex-row">
            <p className="text-sm text-text-muted">
                © {new Date().getFullYear()} SyncNotes
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                <a
                    className="p-2 text-sm font-medium text-text-muted transition-colors hover:text-primary"
                    href="#"
                >
                    About
                </a>
                <a
                    className="p-2 text-sm font-medium text-text-muted transition-colors hover:text-primary"
                    href="#"
                >
                    Docs
                </a>
                <a
                    className="p-2 text-sm font-medium text-text-muted transition-colors hover:text-primary"
                    href="#"
                >
                    Contact
                </a>
            </div>
        </footer>
    )
}
