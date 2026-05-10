import { useState } from 'react'
import { ChatArea } from './components/Chat/ChatArea'
import { Sidebar } from './components/Sidebar/Sidebar'

/**
 * App — root layout.
 *
 * Desktop (md+): sidebar always visible as a fixed left column.
 * Mobile:        sidebar hidden behind an overlay; toggled via hamburger.
 *
 * State classification (per state_management_flow.md):
 *   sidebarOpen → local UI state → useState (used only here)
 */
export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden font-sans">
      {/* ── Mobile overlay backdrop ────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────────────── */}
      {/*
       * On mobile:   absolutely positioned, slides in/out with translate.
       * On desktop:  relative, always visible (translate reset by md:translate-x-0).
       */}
      <div
        className={[
          'fixed inset-y-0 left-0 z-30 shrink-0 transition-transform duration-200 ease-in-out',
          'md:relative md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* ── Main chat area ─────────────────────────────────────────────── */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <ChatArea onMenuClick={() => setSidebarOpen(true)} />
      </main>
    </div>
  )
}
