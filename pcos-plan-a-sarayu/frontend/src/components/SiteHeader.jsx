import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import FeedbackModal from './FeedbackModal.jsx'

export default function SiteHeader() {
  const location = useLocation()
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  // Get patient name from registration profile
  const patientProfile = (() => {
    try {
      const saved = sessionStorage.getItem('pcos_patient_registration')
      return saved ? JSON.parse(saved) : null
    } catch (e) {
      return null
    }
  })()

  const patientName = patientProfile?.full_name || 'Ananya Sharma'

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 backdrop-blur-2xl bg-slate-950/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Brand Logo (VELVION Style Wings + HelixDx) */}
          <Link to="/" className="group flex items-center gap-3">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/30 to-orange-500/30 ring-1 ring-amber-400/40 shadow-glow">
              <span className="absolute inset-0 rounded-2xl bg-amber-400/20 blur-md group-hover:blur-lg transition-all" />
              <svg viewBox="0 0 24 24" className="relative h-6 w-6 text-amber-300" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 3v18M6 8l6-5 6 5M6 16l6 5 6-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="flex flex-col">
              <span className="font-display text-xl font-extrabold tracking-tight text-white flex items-center gap-1">
                Helix<span className="text-gradient-bio">Dx</span>
              </span>
              <span className="text-[10px] text-amber-300/80 font-mono tracking-widest uppercase">
                PCOS Phenotype Health System
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-slate-300">
            <Link
              to="/"
              className={`hover:text-amber-300 transition-colors ${
                location.pathname === '/' ? 'text-amber-300 font-bold' : ''
              }`}
            >
              Overview
            </Link>
            <Link
              to="/doctor-tests"
              className={`hover:text-amber-300 transition-colors ${
                location.pathname === '/doctor-tests' ? 'text-amber-300 font-bold' : ''
              }`}
            >
              Doctor Tests
            </Link>
            <Link
              to="/register"
              className={`hover:text-amber-300 transition-colors ${
                location.pathname === '/register' ? 'text-amber-300 font-bold' : ''
              }`}
            >
              Registration
            </Link>
            <Link
              to="/journey"
              className={`hover:text-amber-300 transition-colors ${
                location.pathname === '/journey' ? 'text-amber-300 font-bold' : ''
              }`}
            >
              Journey Log
            </Link>
            <Link
              to="/assessment"
              className={`hover:text-amber-300 transition-colors ${
                location.pathname === '/assessment' ? 'text-amber-300 font-bold' : ''
              }`}
            >
              Assessment
            </Link>
          </nav>

          {/* Right Action Bar & User Profile Avatar Pill (Matching Screenshot) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFeedbackOpen(true)}
              className="btn-ghost !px-3 !py-1.5 text-xs text-amber-300/90 border-amber-400/30 hover:bg-amber-400/10"
            >
              💬 Feedback
            </button>

            {/* Profile Avatar Pill */}
            <Link
              to="/register"
              className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 pl-3 pr-1.5 py-1 text-xs transition-all hover:border-amber-400/40 hover:bg-white/10"
            >
              <div className="flex flex-col text-right">
                <span className="font-bold text-white leading-tight">{patientName}</span>
                <span className="text-[9px] text-amber-300 font-mono">Patient Profile</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-0.5 shadow-md flex items-center justify-center text-slate-950 font-bold text-xs">
                {patientName.charAt(0)}
              </div>
            </Link>
          </div>
        </div>
      </header>

      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  )
}
