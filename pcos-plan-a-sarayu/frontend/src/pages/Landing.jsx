import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import GlassCard from '../components/GlassCard.jsx'
import MedicalTermTooltip from '../components/MedicalTermTooltip.jsx'
import RecommendedTests from '../components/RecommendedTests.jsx'

const PHENOTYPES = [
  {
    id: 'metabolic',
    name: 'Metabolic PCOS',
    tag: 'Insulin Resistant',
    desc: 'Hyperinsulinemia and high blood sugar stimulate ovarian theca cells to produce excess testosterone.',
    color: 'from-amber-400/25 to-amber-400/0',
    ring: 'ring-amber-300/40',
    icon: <path d="M4 14h4l2-6 4 12 2-8h4" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    id: 'hormonal',
    name: 'Hormonal PCOS',
    tag: 'Ovarian / Post-Pill',
    desc: 'Elevated LH to FSH pulsatility ratio drives irregular cycles, acne, and androgen excess.',
    color: 'from-bio-400/25 to-bio-400/0',
    ring: 'ring-bio-300/40',
    icon: <path d="M9 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM9 13v8M6 18h6" strokeLinecap="round" strokeLinejoin="round" />,
  },
  {
    id: 'adrenal',
    name: 'Adrenal PCOS',
    tag: 'Stress-Driven',
    desc: 'HPA-axis overactivation and elevated DHEA-S raise adrenal androgen levels during chronic stress.',
    color: 'from-plasma-500/25 to-plasma-500/0',
    ring: 'ring-plasma-400/40',
    icon: <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" strokeLinecap="round" />,
  },
  {
    id: 'inflammatory',
    name: 'Inflammatory PCOS',
    tag: 'Immune / Gut-Driven',
    desc: 'Gut mucosal permeability and chronic low-grade inflammation (hs-CRP) disrupt hormone signaling.',
    color: 'from-alert-500/20 to-alert-500/0',
    ring: 'ring-alert-400/40',
    icon: <path d="M12 21s-7-4.35-9.5-8.8C.5 8.4 2.6 4.6 6.2 4.2c2-.2 3.6.8 5.8 3 2.2-2.2 3.8-3.2 5.8-3 3.6.4 5.7 4.2 3.7 8-2.5 4.45-9.5 8.8-9.5 8.8Z" strokeLinejoin="round" />,
  },
]

export default function Landing() {
  return (
    <div className="space-y-24 pb-28">
      {/* TOP ANNOUNCEMENT BAR */}
      <div className="-mt-4 -mx-4 sm:-mx-8 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 p-2.5 text-center text-xs font-bold text-slate-950 shadow-md">
        <span>🚀 Announcing HelixDx 2.0 – Integrated PCOS Phenotype Classifier, Blood Report Parser &amp; Eggetarian Nutrition Matrix</span>
      </div>

      {/* HERO SECTION */}
      <section className="relative isolate overflow-hidden pt-6 sm:pt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl space-y-6"
          >
            <span className="chip mx-auto shadow-glow">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              Evidence-Based · 0% AI Delusions · Rotterdam Consensus Verified
            </span>

            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
              Precision PCOS Phenotype Classification
              <br />
              <span className="text-gradient-bio">&amp; Digital Health Platform</span>
            </h1>

            <p className="mx-auto max-w-3xl text-sm sm:text-lg text-slate-300 leading-relaxed font-normal">
              Transform blood report values and symptom patterns into clear Metabolic, Hormonal, Adrenal, and Inflammatory protocols — with Rotterdam diagnostic verification and multi-cuisine eggetarian meal plans.
            </p>

            {/* Standard Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] font-mono text-amber-200">
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">Rotterdam 2018 Standard</span>
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">HOMA-IR Insulin Check</span>
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">DHEA-S Adrenal Marker</span>
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">hs-CRP Inflammation</span>
              <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">Eggetarian &amp; All Cuisines</span>
            </div>

            {/* Hero CTAs */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link to="/register" className="btn-primary !px-8 !py-4 text-sm font-bold shadow-glow flex items-center gap-2">
                <span>📝 Patient Registration</span>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>

              <Link to="/assessment" className="btn-ghost !px-6 !py-4 text-sm font-semibold border-amber-400/40 text-amber-200 hover:bg-amber-400/10">
                📄 Upload Report / Start Assessment
              </Link>

              <Link to="/doctor-tests" className="btn-ghost !px-6 !py-4 text-sm font-semibold border-amber-400/30 text-amber-300 hover:bg-amber-400/10">
                🩺 Doctor Recommended Tests
              </Link>
            </div>
          </motion.div>

          {/* VELVION LUXURY BENTO DASHBOARD (Matching User's Reference Screenshot) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mx-auto max-w-6xl pt-8"
          >
            <div className="grid gap-6 lg:grid-cols-12 text-left">
              {/* Left Big Biological Score Card (Matching Image Left side) */}
              <div className="lg:col-span-7 glass-velvion bento-card p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden min-h-[380px] border-amber-400/30 shadow-2xl">
                {/* Glowing Aura Ring behind big number */}
                <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-gradient-to-tr from-amber-400/30 via-rose-500/20 to-transparent blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-2">
                  <span className="chip !text-amber-300 font-semibold text-xs">
                    ⚡ Live Phenotype Engine Snapshot
                  </span>
                  <div className="text-xs uppercase tracking-widest text-slate-400 font-mono pt-2">
                    Estimated Biological Vitality &amp; Phenotype Score
                  </div>
                </div>

                {/* Big Center Number 4 (From Image) */}
                <div className="relative z-10 py-6">
                  <div className="font-display text-7xl sm:text-8xl font-black text-white tracking-tight drop-shadow-2xl">
                    4
                  </div>
                  <div className="text-xs text-amber-300/90 font-medium tracking-wide mt-1">
                    Metabolic · Hormonal · Adrenal · Inflammatory Profiles
                  </div>
                </div>

                {/* Bottom Track Slider */}
                <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>Rotterdam Consensus: <strong>2 of 3 Criteria Met ✓</strong></span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">3 Years Health Advantage</span>
                </div>
              </div>

              {/* Right Side Bento Grid Cards (Matching Image Right side) */}
              <div className="lg:col-span-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {/* Card 1: Upcoming Activities */}
                <Link
                  to="/doctor-tests"
                  className="glass-velvion bento-card p-5 flex items-center justify-between border-white/10 hover:border-amber-400/40 group"
                >
                  <div className="space-y-1">
                    <h3 className="font-display text-sm font-bold text-white">Upcoming Activities</h3>
                    <div className="flex items-center gap-2">
                      <span className="chip !py-0.5 !px-2 text-[10px] text-slate-300">4 events</span>
                      <span className="text-[11px] text-slate-400">Lab Upload &amp; Doctor Tests</span>
                    </div>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 group-hover:bg-amber-400 group-hover:text-slate-950 transition-all">
                    →
                  </div>
                </Link>

                {/* Card 2: Your Insights (Frosted Gradient Rose/Copper Glow Card from Image) */}
                <Link
                  to="/assessment"
                  className="card-gradient-copper bento-card p-5 flex items-center justify-between group shadow-xl"
                >
                  <div className="space-y-2">
                    <h3 className="font-display text-base font-bold text-white">Your Insights</h3>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white border border-white/30 backdrop-blur-md">
                        8 Biomarkers / Risks
                      </span>
                    </div>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white group-hover:bg-white group-hover:text-slate-950 transition-all">
                    →
                  </div>
                </Link>

                {/* Bottom Sub-grid: Snapshot & Action Plan */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Card 3: Health Snapshot */}
                  <div className="glass-velvion bento-card p-4 flex flex-col justify-between border-white/10 hover:border-amber-400/40">
                    <div className="space-y-1">
                      <h4 className="font-display text-xs font-bold text-white">Your Health Snapshot</h4>
                      <p className="text-[10px] text-slate-400">Rotterdam Checks</p>
                    </div>
                    <div className="pt-3 flex justify-end">
                      <div className="h-7 w-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs text-slate-300">
                        ↑
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Action Plan (Warm Gold Glow Card from Image) */}
                  <Link
                    to="/assessment"
                    className="card-gradient-gold bento-card p-4 flex flex-col justify-between group"
                  >
                    <div className="space-y-1">
                      <h4 className="font-display text-xs font-bold text-white">Action Plan</h4>
                      <p className="text-[10px] text-amber-200">Nutrition Matrix</p>
                    </div>
                    <div className="pt-3 flex items-center justify-between">
                      <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                        Details
                      </span>
                      <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center text-xs text-white group-hover:bg-white group-hover:text-slate-950 transition-all">
                        →
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ABOUT US & INTRODUCTION TO PCOS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-2 items-stretch">
          <GlassCard className="p-8 space-y-5 flex flex-col justify-between">
            <div>
              <span className="chip text-[11px]">About HelixDx</span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-2">
                About Us &amp; Our Scientific Mission
              </h2>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                HelixDx was designed to replace vague, one-size-fits-all PCOS advice with a transparent, rule-based clinical platform. Every woman experiences PCOS differently — some face severe insulin resistance, while others have stress-driven adrenal DHEA-S elevation or gut mucosal inflammation.
              </p>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                Our mission is to empower patients to uncover their exact primary root cause, understand laboratory parameters clearly, and adopt sustainable lifestyle, diet, and exercise protocols.
              </p>
            </div>
          </GlassCard>

          <GlassCard className="p-8 space-y-5 flex flex-col justify-between">
            <div>
              <span className="chip text-[11px]">Introduction to PCOS</span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-2">
                What is PCOS?
              </h2>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                Polycystic Ovary Syndrome (PCOS) is a multi-system endocrine and metabolic state affecting up to 1 in 5 women globally. It is not purely an ovarian condition, but a complex interaction between insulin sensitivity, steroidogenesis, hypothalamic stress signaling, and systemic inflammation.
              </p>
              <div className="mt-4 rounded-xl border border-bio-300/30 bg-bio-400/10 p-4 text-xs text-bio-200">
                💡 <span className="font-semibold">Clinical Insight:</span> PCOS is manageable! Identifying your specific phenotype driver allows targeted natural recovery rather than generic restrictive dieting.
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* EARLY TREATMENT AWARENESS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-8">
        <GlassCard className="p-8 sm:p-12 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="chip mx-auto">Early Health Intervention</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Why PCOS Should Be Addressed Early
            </h2>
            <p className="text-sm text-slate-300">
              Unmanaged PCOS elevates long-term metabolic and cardiovascular risks. Early root-cause intervention restores ovulatory cycles and protects metabolic vitality.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 pt-2">
            {[
              {
                title: 'Prevent Type 2 Diabetes',
                desc: 'Over 50% of women with unmanaged metabolic PCOS develop prediabetes or Type 2 Diabetes before age 40.',
                icon: '🩸',
              },
              {
                title: 'Protect Cardiovascular Health',
                desc: 'Elevated triglycerides and low HDL cholesterol increase long-term vascular strain and atherogenic risk.',
                icon: '❤️',
              },
              {
                title: 'Restore Ovulatory Fertility',
                desc: 'Early lifestyle alignment restores natural LH/FSH pulsatility and regular ovulatory cycles.',
                icon: '🌸',
              },
              {
                title: 'Lower Anxiety & Fatigue',
                desc: 'Calming chronic HPA-axis stress and gut inflammation prevents fatigue crashes and emotional distress.',
                icon: '🌿',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-3 hover:border-bio-300/40 transition-all">
                <div className="text-3xl">{item.icon}</div>
                <h3 className="font-display text-base font-bold text-white">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      {/* ROTTERDAM CRITERIA & EXCLUSION SAFETY */}
      <section className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Rotterdam Criteria */}
          <GlassCard className="p-8 space-y-6">
            <div>
              <span className="chip text-[11px]">First-Line Diagnostic Consensus</span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-2">
                The <MedicalTermTooltip term="Rotterdam Criteria">Rotterdam Criteria</MedicalTermTooltip>
              </h2>
              <p className="mt-2 text-xs text-slate-300">
                A formal clinical diagnosis of PCOS requires meeting at least <strong>2 out of 3</strong> key consensus features:
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="rounded-2xl border border-bio-300/30 bg-white/5 p-4 flex gap-4 items-start">
                <span className="font-display font-bold text-bio-300 text-xl shrink-0">01</span>
                <div>
                  <h4 className="font-bold text-white text-sm">Hyperandrogenism</h4>
                  <p className="text-slate-400 mt-1">High total/free testosterone in blood reports (&gt;45 ng/dL) or physical signs like facial hair (hirsutism) or severe acne.</p>
                </div>
              </div>

              <div className="rounded-2xl border border-bio-300/30 bg-white/5 p-4 flex gap-4 items-start">
                <span className="font-display font-bold text-bio-300 text-xl shrink-0">02</span>
                <div>
                  <h4 className="font-bold text-white text-sm">Ovulatory Dysfunction</h4>
                  <p className="text-slate-400 mt-1">Irregular menstrual cycles (&lt;21 days or &gt;35 days) or fewer than 9 periods per year.</p>
                </div>
              </div>

              <div className="rounded-2xl border border-bio-300/30 bg-white/5 p-4 flex gap-4 items-start">
                <span className="font-display font-bold text-bio-300 text-xl shrink-0">03</span>
                <div>
                  <h4 className="font-bold text-white text-sm">Polycystic Ovaries on Ultrasound</h4>
                  <p className="text-slate-400 mt-1">Presence of &gt;=20 follicles per ovary or an ovarian volume &gt;=10 mL on pelvic ultrasound.</p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Exclusion Criteria */}
          <GlassCard className="p-8 space-y-6 flex flex-col justify-between">
            <div>
              <span className="chip text-[11px] text-amber-300 border-amber-400/30">Clinical Differential Safety</span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mt-2">
                Clinical Exclusion Criteria
              </h2>
              <p className="mt-2 text-xs text-slate-300">
                To guarantee diagnostic accuracy and rule out false secondary signals, these conditions must be excluded by your physician:
              </p>

              <ul className="mt-5 space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <span className="text-amber-400 text-base">🛡️</span>
                  <span><strong>Thyroid Dysfunction:</strong> Checked via TSH (0.4–4.0 µIU/mL) to rule out primary hypo/hyperthyroidism.</span>
                </li>
                <li className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <span className="text-amber-400 text-base">🛡️</span>
                  <span><strong>Hyperprolactinemia:</strong> Checked via Serum Prolactin (&lt;25 ng/mL) to rule out prolactinoma.</span>
                </li>
                <li className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <span className="text-amber-400 text-base">🛡️</span>
                  <span><strong>NCAH:</strong> Checked via 17-OHP (&lt;200 ng/dL) to rule out 21-hydroxylase deficiency.</span>
                </li>
                <li className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <span className="text-amber-400 text-base">🛡️</span>
                  <span><strong>Cushing&apos;s Syndrome:</strong> Checked via 24h Cortisol to rule out adrenal hypersecretion.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-xs text-amber-200">
              🛡️ Ruling out these secondary conditions ensures your phenotype protocol targets your true root cause.
            </div>
          </GlassCard>
        </div>
      </section>

      {/* FOUR ROOT-CAUSE PHENOTYPES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="chip mx-auto">Root Cause Classification</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">Four Root-Cause Phenotypes</h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Every patient&apos;s symptom pattern and blood biomarkers map to these 4 biological profiles:
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PHENOTYPES.map((p) => (
            <GlassCard key={p.id} className={`p-6 space-y-4 ring-1 ${p.ring} hover:-translate-y-1 transition-transform`}>
              <div className="h-11 w-11 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-slate-100">
                <svg viewBox="0 0 24 24" className="h-5.5 w-5.5" fill="none" stroke="currentColor" strokeWidth="1.6">
                  {p.icon}
                </svg>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white">{p.name}</h3>
                <div className="text-[11px] uppercase tracking-wider text-bio-300 font-semibold mt-0.5">{p.tag}</div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* RECOMMENDED DOCTOR TESTS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-8">
        <RecommendedTests />
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="mx-auto max-w-5xl px-4 sm:px-8">
        <GlassCard strong className="p-10 sm:p-14 text-center space-y-6">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
            Ready to discover your PCOS phenotype breakdown?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Takes 5–8 minutes. Upload your patient blood report or fill in symptom markers to generate your phenotype score and customized multi-cuisine meal protocol.
          </p>
          <div className="pt-2">
            <Link to="/assessment" className="btn-primary !px-8 !py-4 text-sm font-bold shadow-glow">
              ⚡ Begin Assessment Now
            </Link>
          </div>
        </GlassCard>
      </section>
    </div>
  )
}
