import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import FeedbackModal from './FeedbackModal.jsx'

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const location = useLocation()
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  const NAV_ITEMS = [
    {
      group: 'MAIN DASHBOARD',
      items: [
        { path: '/', label: 'Overview & About Us', icon: '🏠' },
        { path: '/journey', label: 'My PCOS Journey', icon: '🌸' },
      ],
    },
    {
      group: 'DIAGNOSTIC PIPELINE',
      items: [
        { path: '/assessment', label: 'Full Assessment', icon: '📋' },
      ],
    },
    {
      group: 'RESULTS & PROTOCOLS',
      items: [
        { path: '/results', label: 'Phenotype Dashboard', icon: '📊' },
      ],
    },
  ]

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950/95 border-r border-white/10 backdrop-blur-xl transition-transform duration-300 flex flex-col justify-between ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Logo & Brand Header */}
          <Link to="/" className="group flex items-center gap-3 border-b border-white/10 pb-5">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-bio-400/30 to-plasma-500/30 ring-1 ring-white/15 shadow-glow">
              <span className="absolute inset-0 rounded-xl bg-bio-300/20 blur-md group-hover:blur-lg transition-all" />
              <svg viewBox="0 0 24 24" className="relative h-5 w-5 text-bio-200" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M7 3c0 4 10 4 10 8s-10 4-10 8M17 3c0 4-10 4-10 8s10 4 10 8" strokeLinecap="round" />
              </svg>
            </span>
            <div className="flex flex-col">
              <span className="font-display text-xl font-bold tracking-tight text-white">
                Helix<span className="text-gradient-bio">Dx</span>
              </span>
              <span className="text-[10px] text-bio-300 font-mono uppercase tracking-wider">
                PCOS Phenotype Platform
              </span>
            </div>
          </Link>

          {/* Navigation Groups */}
          <nav className="space-y-5 text-xs">
            {NAV_ITEMS.map((section) => (
              <div key={section.group} className="space-y-1.5">
                <div className="px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">
                  {section.group}
                </div>
                {section.items.map((item) => {
                  const active = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-all ${
                        active
                          ? 'border border-bio-300/40 bg-bio-400/15 text-bio-100 shadow-glow'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="p-4 border-t border-white/10 space-y-2 bg-slate-900/40 text-xs">
          <button
            type="button"
            onClick={() => setFeedbackOpen(true)}
            className="w-full btn-ghost !py-2 text-xs flex items-center justify-center gap-2 border-amber-400/30 text-amber-300 hover:bg-amber-400/10"
          >
            <span>💬</span> Share Website Feedback
          </button>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-[11px] text-slate-400 text-center">
            <span className="text-bio-300 font-semibold">HelixDx v2.0</span> · Deterministic Rule Engine
          </div>
        </div>
      </aside>

      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  )
}
