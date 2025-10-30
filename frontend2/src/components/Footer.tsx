export default function Footer() {
  return (
    <footer className="px-4 md:px-8 py-2 flex flex-col items-center justify-between gap-4 border-t border-gray-200 dark:border-white/10 md:flex-row">
      <p className="text-sm text-text-primary dark:text-text-secondary">© {new Date().getFullYear()} SyncNotes</p>
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        <a
          className="p-3.5 text-sm font-medium text-text-secondary transition-colors hover:text-surface-primary dark:text-gray-400 dark:hover:text-surface-primary"
          href="#"
        >
          About
        </a>
        <a
          className="p-3.5 text-sm font-medium text-text-secondary transition-colors hover:text-surface-primary dark:text-gray-400 dark:hover:text-surface-primary"
          href="#"
        >
          Docs
        </a>
        <a
          className="p-3.5 text-sm font-medium text-text-secondary transition-colors hover:text-surface-primary dark:text-gray-400 dark:hover:text-surface-primary"
          href="#"
        >
          Contact
        </a>
      </div>
    </footer>
  );
}
