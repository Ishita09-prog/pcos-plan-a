import { useState } from 'react'
import { Link } from 'react-router-dom'
import GlassCard from '../components/GlassCard.jsx'
import MedicalTermTooltip from '../components/MedicalTermTooltip.jsx'

export default function Journey() {
  const [cycleNotes, setCycleNotes] = useState('')
  const [cycleDays, setCycleDays] = useState('35-60')
  const [sleepHours, setSleepHours] = useState(7)
  const [sleepQuality, setSleepQuality] = useState('Good')
  const [stressScale, setStressScale] = useState(5)
  const [phq2Score, setPhq2Score] = useState(1)
  const [phq9Score, setPhq9Score] = useState(2)
  const [saved, setSaved] = useState(false)

  function handleSave(e) {
    e.preventDefault()
    const journeyData = {
      cycleNotes,
      cycleDays,
      sleepHours,
      sleepQuality,
      stressScale,
      phq2Score,
      phq9Score,
    }
    sessionStorage.setItem('pcos_journey_data', JSON.stringify(journeyData))
    setSaved(true)
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 500)
  }

  return (
    <div className="relative mx-auto max-w-4xl px-6 py-14 space-y-8">
      <div>
        <span className="chip mb-3">Personal Health Log &amp; Progress Tracker</span>
        <h1 className="font-display text-3xl font-extrabold text-white sm:text-5xl">
          My PCOS Journey Tracker
        </h1>
        <p className="mt-2 text-slate-300 text-sm max-w-2xl leading-relaxed">
          Log and track your menstrual cycle regularity, sleep duration, fatigue patterns, and PHQ-2 / PHQ-9 vitality scales to monitor your PCOS recovery over time.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Menstrual Cycle Tracking */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <span className="text-xl">🌸</span>
            <div>
              <h3 className="font-display text-lg font-bold text-white">1. Menstrual Cycle Regularity Log</h3>
              <p className="text-xs text-slate-400">Track cycle lengths, missed periods, and flow changes</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            <div>
              <label className="field-label">Typical Cycle Length Range</label>
              <select
                className="input-glass"
                value={cycleDays}
                onChange={(e) => setCycleDays(e.target.value)}
              >
                <option value="21-35">21 – 35 Days (Regular Monthly Period)</option>
                <option value="35-60">35 – 60 Days (Delayed / Irregular Period)</option>
                <option value="60+">60+ Days (Severe Delay / 2+ Months Missed)</option>
                <option value="Absent">Absent / Amenorrhea (3+ Months Skipped)</option>
              </select>
            </div>

            <div>
              <label className="field-label">Period Irregularity Notes</label>
              <input
                type="text"
                className="input-glass"
                value={cycleNotes}
                onChange={(e) => setCycleNotes(e.target.value)}
                placeholder="e.g. Skipped 2 months last season, painful cramping, spotty flow..."
              />
            </div>
          </div>
        </GlassCard>

        {/* Section 2: Sleep & Circadian Rhythm */}
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <span className="text-xl">🌙</span>
            <div>
              <h3 className="font-display text-lg font-bold text-white">2. Sleep Duration &amp; Sleep Quality Tracker</h3>
              <p className="text-xs text-slate-400">Restful sleep regulates evening cortisol and balances androgen hormones</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="field-label text-xs">Average Night Sleep Duration</label>
                <span className="font-display font-bold text-bio-200 text-sm">{sleepHours} Hours</span>
              </div>
              <input
                type="range"
                min={3}
                max={12}
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                className="w-full accent-bio-300 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>3h (Deprived)</span>
                <span>7-8h (Optimal)</span>
                <span>12h+</span>
              </div>
            </div>

            <div>
              <label className="field-label">Overall Sleep Quality</label>
              <select
                className="input-glass font-medium text-bio-200"
                value={sleepQuality}
                onChange={(e) => setSleepQuality(e.target.value)}
              >
                <option value="Restful">Deep &amp; Restful Sleep (Wake up energized)</option>
                <option value="Good">Good Sleep (Occasional waking)</option>
                <option value="Restless">Restless Sleep (Frequent waking, night sweating)</option>
                <option value="Insomnia / Exhausted">Insomnia / Wake Up Tired Every Morning</option>
              </select>
            </div>
          </div>
        </GlassCard>

        {/* Section 3: PHQ-2 & PHQ-9 Vitality & Mental Well-being Screening */}
        <GlassCard className="p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <span className="text-xl">🧠</span>
            <div>
              <h3 className="font-display text-lg font-bold text-white">3. PHQ-2 &amp; PHQ-9 Vitality &amp; Mood Scale</h3>
              <p className="text-xs text-slate-400">
                Validated clinical screening scales for stress, anxiety, and daily energy levels
              </p>
            </div>
          </div>

          {/* PHQ-2 Scale */}
          <div className="space-y-3 rounded-2xl border border-bio-300/30 bg-bio-400/5 p-5 text-xs">
            <h4 className="font-display text-sm font-bold text-bio-200 flex items-center gap-1.5">
              <span>🌿</span> PHQ-2 Scale: Anxiety &amp; Interest Check
            </h4>
            <p className="text-slate-400 text-[11px]">
              Over the last 2 weeks, how often have you felt nervous, anxious, or little interest in doing things?
            </p>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {[
                { score: 0, label: '0 — Not at all', desc: 'Feeling calm, settled, and motivated' },
                { score: 1, label: '1 — Several days', desc: 'Mild occasional nervousness or low energy' },
                { score: 2, label: '2 — Over half the days', desc: 'Frequent tension, worry, or lack of interest' },
                { score: 3, label: '3 — Nearly every day', desc: 'Constant overwhelm & persistent tiredness' },
              ].map((opt) => (
                <button
                  key={opt.score}
                  type="button"
                  onClick={() => setPhq2Score(opt.score)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    phq2Score === opt.score
                      ? 'border-bio-300/60 bg-bio-400/20 text-white font-semibold shadow-glow'
                      : 'border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/25'
                  }`}
                >
                  <div className="font-bold text-bio-200">{opt.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* PHQ-9 Scale */}
          <div className="space-y-3 rounded-2xl border border-plasma-400/30 bg-plasma-500/5 p-5 text-xs">
            <h4 className="font-display text-sm font-bold text-plasma-300 flex items-center gap-1.5">
              <span>⚡</span> PHQ-9 Scale: Fatigue &amp; Vitality Status
            </h4>
            <p className="text-slate-400 text-[11px]">
              Over the last 2 weeks, how often have you felt sluggish, experienced fatigue crashes, or sleep disturbances?
            </p>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {[
                { score: 1, label: 'Minimal Fatigue (1-4)', desc: 'High daily energy and clear focus' },
                { score: 2, label: 'Mild Sluggishness (5-9)', desc: 'Occasional afternoon energy dips' },
                { score: 3, label: 'Moderate Exhaustion (10-14)', desc: 'Regular heavy fatigue & brain fog' },
                { score: 4, label: 'Severe Burnout (15+)', desc: 'Persistent exhaustion crashes daily' },
              ].map((opt) => (
                <button
                  key={opt.score}
                  type="button"
                  onClick={() => setPhq9Score(opt.score)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    phq9Score === opt.score
                      ? 'border-plasma-400/60 bg-plasma-500/20 text-white font-semibold shadow-glow'
                      : 'border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/25'
                  }`}
                >
                  <div className="font-bold text-plasma-300">{opt.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        {saved && (
          <div className="rounded-xl border border-bio-300/40 bg-bio-400/10 p-4 text-center text-xs text-bio-200 font-semibold">
            ✓ Your PCOS Journey tracking log has been saved!
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <Link to="/" className="btn-ghost text-xs">
            ← Back to Overview
          </Link>
          <button type="submit" className="btn-primary text-xs font-bold shadow-glow">
            Save Journey Log &amp; Feed to Assessment →
          </button>
        </div>
      </form>
    </div>
  )
}
