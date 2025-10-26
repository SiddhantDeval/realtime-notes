import { Link } from "@tanstack/react-router";
import logo from "../logo.svg?inline";

import { useState } from "react";
import { ChevronDown, ChevronRight, Home, Menu, Network, SquareFunction, StickyNote, X } from "lucide-react";

interface HeaderProps {
  toggleTheme?: () => void;
  theme?: "light" | "dark";
}
export default function Header(props: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [groupedExpanded, setGroupedExpanded] = useState<Record<string, boolean>>({});

  const handleSideNavOpen = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <header className="min-h-16 px-4 md:px-8 py-2 flex items-center border-b border-gray-200 dark:border-white/10 sm:flex-row">
        <h1 className="text-xl font-semibold flex items-center gap-3 text-text-primary-light dark:text-text-primary-dark">
          <Link to="/" className="fill-current">
            <img src={logo} alt="SyncNotes" className="h-10 w-10 fill-current" />
          </Link>
          <h2 className="text-xl font-bold">SyncNotes</h2>
        </h1>
        <div className="flex-1" />
        <nav className="hidden md:flex gap-4 items-center ">
          <Link
            to="/"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-primary/20 transition-colors"
            activeProps={
              {
                // className: "flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors",
              }
            }
          >
            <Home size={20} />
            <span className="font-medium">Home</span>
          </Link>

          <Link
            to="/notes"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-primary/20 transition-colors"
            activeProps={
              {
                // className: "flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors",
              }
            }
          >
            <SquareFunction size={20} />
            <span className="font-medium">Notes</span>
          </Link>

          <Link
            to="/login"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-primary/20 transition-colors"
            activeProps={
              {
                // className: "flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors",
              }
            }
          >
            <SquareFunction size={20} />
            <span className="font-medium">Login</span>
          </Link>
          {/* theme toggle  */}
          <button
            onClick={props.toggleTheme}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-primary/20 transition-colors"
            aria-label="Toggle theme"
          >
            {props.theme}
          </button>
        </nav>
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
          isOpen ? "translate-x-0" : "-translate-x-full"
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
            to="/"
            onClick={handleSideNavOpen}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
            activeProps={{
              className: "flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors",
            }}
          >
            <Home size={20} />
            <span className="font-medium">Home</span>
          </Link>

          <Link
            to="/notes"
            onClick={handleSideNavOpen}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
            activeProps={{
              className: "flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors",
            }}
          >
            <SquareFunction size={20} />
            <span className="font-medium">Notes</span>
          </Link>

          {/* Demo Links Start */}

          <Link
            to="/demo/start/server-funcs"
            onClick={handleSideNavOpen}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
            activeProps={{
              className: "flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
            }}
          >
            <SquareFunction size={20} />
            <span className="font-medium">Start - Server Functions</span>
          </Link>

          <Link
            to="/demo/start/api-request"
            onClick={handleSideNavOpen}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
            activeProps={{
              className: "flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
            }}
          >
            <Network size={20} />
            <span className="font-medium">Start - API Request</span>
          </Link>

          <div className="flex flex-row justify-between">
            <Link
              to="/demo/start/ssr"
              onClick={handleSideNavOpen}
              className="flex-1 flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
              activeProps={{
                className:
                  "flex-1 flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
              }}
            >
              <StickyNote size={20} />
              <span className="font-medium">Start - SSR Demos</span>
            </Link>
            <button
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              onClick={() =>
                setGroupedExpanded((prev) => ({
                  ...prev,
                  StartSSRDemo: !prev.StartSSRDemo,
                }))
              }
            >
              {groupedExpanded.StartSSRDemo ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>
          {groupedExpanded.StartSSRDemo && (
            <div className="flex flex-col ml-4">
              <Link
                to="/demo/start/ssr/spa-mode"
                onClick={handleSideNavOpen}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
                activeProps={{
                  className:
                    "flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
                }}
              >
                <StickyNote size={20} />
                <span className="font-medium">SPA Mode</span>
              </Link>

              <Link
                to="/demo/start/ssr/full-ssr"
                onClick={handleSideNavOpen}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
                activeProps={{
                  className:
                    "flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
                }}
              >
                <StickyNote size={20} />
                <span className="font-medium">Full SSR</span>
              </Link>

              <Link
                to="/demo/start/ssr/data-only"
                onClick={handleSideNavOpen}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
                activeProps={{
                  className:
                    "flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
                }}
              >
                <StickyNote size={20} />
                <span className="font-medium">Data Only</span>
              </Link>
            </div>
          )}

          {/* Demo Links End */}
        </nav>
      </aside>
    </>
  );
}
