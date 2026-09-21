import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import GlassCard from '../components/GlassCard.jsx'

const PHENOTYPES = [
  {
    id: 'adrenal',
    name: 'Adrenal',
    tag: 'Stress-Driven',
    desc: 'HPA-axis overactivation raises DHEA-S and cortisol, pushing androgen production.',
    color: 'from-plasma-500/25 to-plasma-500/0',
    ring: 'ring-plasma-400/30',
    icon: (
      <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" strokeLinecap="round" />
    ),
  },
  {
    id: 'hormonal',
    name: 'Hormonal',
    tag: 'Ovarian / Post-Pill',
    desc: 'Elevated LH:FSH ratio and androgens drive irregular cycles, hirsutism, and acne.',
    color: 'from-bio-400/25 to-bio-400/0',
    ring: 'ring-bio-300/30',
    icon: <path d="M9 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM9 13v8M6 18h6" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    id: 'inflammatory',
    name: 'Inflammatory',
    tag: 'Immune / Gut-Driven',
    desc: 'Gut dysbiosis and systemic inflammation (hs-CRP) disrupt ovarian signaling.',
    color: 'from-alert-500/20 to-alert-500/0',
    ring: 'ring-alert-400/30',
    icon: <path d="M12 21s-7-4.35-9.5-8.8C.5 8.4 2.6 4.6 6.2 4.2c2-.2 3.6.8 5.8 3 2.2-2.2 3.8-3.2 5.8-3 3.6.4 5.7 4.2 3.7 8-2.5 4.45-9.5 8.8-9.5 8.8Z" strokeLinejoin="round" />,
  },
  {
    id: 'metabolic',
    name: 'Metabolic',
    tag: 'Insulin-Resistant',
    desc: 'Insulin resistance (HOMA-IR) is the dominant driver of androgen excess and weight.',
    color: 'from-amber-400/20 to-amber-400/0',
    ring: 'ring-amber-300/30',
    icon: <path d="M4 14h4l2-6 4 12 2-8h4" strokeLinecap="round" strokeLinejoin="round" />,
  },
]

const STEPS = [
  { n: '01', t: 'Digitised questionnaire', d: 'Every question, threshold, and weight from the diagnostic document becomes the single JSON source of truth.' },
  { n: '02', t: 'Scoring engine', d: 'Ticks tallied per phenotype out of 10, banded into Mild / Moderate / Severe.' },
  { n: '03', t: 'Biomarker overrides', d: 'Four hard lab-value rules can confirm — or flip — the tally-based result.' },
  { n: '04', t: 'Classification', d: 'Primary phenotype, or a Mixed/Combination protocol when two tie.' },
  { n: '05', t: 'Targeted protocol', d: 'Diet & exercise mapped by phenotype, region, and dietary preference.' },
]

export default function Landing() {
  return (
    <div>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6 pb-28 pt-20 sm:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="chip mx-auto mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-bio-300 animate-pulse" />
              Evidence-Based · Fully Transparent Results
            </span>
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
              Trace every PCOS phenotype
              <br className="hidden sm:block" />
              <span className="text-gradient-bio"> back to a rule you can read.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-balance text-base text-slate-300 sm:text-lg">
              A questionnaire-driven classifier for Adrenal, Hormonal, Inflammatory, and
              Metabolic PCOS phenotypes — with biomarker overrides and a targeted
              South/North Indian diet &amp; exercise protocol at the end.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link to="/assessment" className="btn-primary">
                Begin Assessment
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <a
                href="#how-it-works"
                className="btn-ghost"
                onClick={(e) => {
                  // The app uses HashRouter for routing, which treats any
                  // "#..." href as a route change -- a plain in-page anchor
                  // here would get intercepted and navigate to a non-existent
                  // route instead of scrolling. Scroll manually and skip the
                  // router entirely.
                  e.preventDefault()
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                How the engine works
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="relative mx-auto mt-16 max-w-4xl"
          >
            <GlassCard strong className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-4 sm:p-8">
              {[
                ['44', 'Diagnostic questions'],
                ['4', 'Root-cause phenotypes'],
                ['4', 'Hard biomarker overrides'],
                ['0', 'AI models used'],
              ].map(([stat, label]) => (
                <div key={label} className="text-center">
                  <div className="font-display text-3xl font-bold text-gradient-bio sm:text-4xl">{stat}</div>
                  <div className="mt-1 text-xs text-slate-400 sm:text-sm">{label}</div>
                </div>
              ))}
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* PHENOTYPES */}
      <section className="relative mx-auto max-w-7xl px-6 py-20">
        <SectionHeading
          eyebrow="Section 2 · Evaluation"
          title="Four root-cause phenotypes"
          desc="Every answer is tallied into exactly one of these categories — no black box, just addition."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PHENOTYPES.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
            >
              <GlassCard className={`group h-full overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1.5 ring-1 ${p.ring}`}>
                <div className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${p.color} blur-2xl`} />
                <div className="relative">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    <svg viewBox="0 0 24 24" className="h-5.5 w-5.5 text-slate-100" fill="none" stroke="currentColor" strokeWidth="1.6">
                      {p.icon}
                    </svg>
                  </div>
                  <div className="font-display text-lg font-semibold text-white">{p.name}</div>
                  <div className="mt-0.5 text-xs font-medium uppercase tracking-wider text-bio-300/80">{p.tag}</div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">{p.desc}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="relative mx-auto max-w-5xl px-6 py-20">
        <SectionHeading
          eyebrow="Methodology"
          title="A transparent pipeline, start to finish"
          desc="Every one of these steps is a plain, explainable calculation — nothing learned, nothing inferred."
        />
        <div className="relative mt-14 space-y-4">
          <div className="absolute left-[27px] top-2 bottom-2 hidden w-px bg-gradient-to-b from-bio-400/50 via-plasma-400/30 to-transparent sm:block" />
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.15 + i * 0.08 }}
              className="relative flex gap-5 sm:pl-0"
            >
              <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl glass font-display text-sm font-bold text-bio-200">
                {s.n}
              </div>
              <GlassCard className="flex-1 p-5">
                <div className="font-display text-base font-semibold text-white">{s.t}</div>
                <p className="mt-1 text-sm text-slate-400">{s.d}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-5xl px-6 pb-28">
        <GlassCard strong className="relative overflow-hidden p-10 text-center sm:p-16">
          <div className="pointer-events-none absolute inset-0 scanline-veil" />
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Ready to see your phenotype breakdown?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-slate-400 sm:text-base">
            About 5–8 minutes. Lab values are optional — the tally still works from
            symptoms alone, and any biomarkers you add can trigger an override.
          </p>
          <Link to="/assessment" className="btn-primary mt-8">
            Begin Assessment
          </Link>
        </GlassCard>
      </section>

      <footer className="relative border-t border-white/5 px-6 py-8 text-center text-xs text-slate-500">
        Built for the PCOS phenotype classification project · No patient data leaves this
        deployment unless you connect it to a backend you control.
      </footer>
    </div>
  )
}

function SectionHeading({ eyebrow, title, desc }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="chip mx-auto">{eyebrow}</span>
      <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">{title}</h2>
      <p className="mt-3 text-sm text-slate-400 sm:text-base">{desc}</p>
    </div>
  )
}
