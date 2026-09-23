import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import FeedbackModal from './FeedbackModal.jsx'

export default function TopHeader({ setMobileOpen }) {
  const location = useLocation()
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  const BREADCRUMBS = {
    '/': 'Overview & Educational Hub',
    '/journey': 'My PCOS Journey (Menstrual & Stress Tracking)',
    '/assessment': 'Diagnostic Questionnaire & Report Upload',
    '/results': 'Phenotype Dashboard & Tailored Protocols',
  }

  const title = BREADCRUMBS[location.pathname] || 'PCOS Platform'

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-md px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Mobile Menu & Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 hover:text-white lg:hidden"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
            </button>

            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <span className="text-bio-300 font-semibold">HelixDx</span>
                <span>/</span>
                <span>Dashboard</span>
              </div>
              <h2 className="font-display text-base font-bold text-white sm:text-lg">
                {title}
              </h2>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setFeedbackOpen(true)}
              className="btn-ghost !px-3 !py-1.5 text-xs text-amber-300 border-amber-400/30 hover:bg-amber-400/10 hidden sm:inline-flex"
            >
              💬 Feedback
            </button>

            <Link to="/assessment" className="btn-primary !px-4 !py-2 text-xs shadow-glow">
              ⚡ Begin Assessment
            </Link>

            {/* Profile Avatar Badge */}
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs">
              <div className="h-7 w-7 rounded-lg bg-bio-400/20 border border-bio-300/40 flex items-center justify-center font-bold text-bio-200 text-xs">
                PX
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="font-semibold text-white">Patient Profile</span>
                <span className="text-[10px] text-slate-400">Rotterdam Verified</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  )
}
