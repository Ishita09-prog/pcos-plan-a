import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GlassCard from '../components/GlassCard.jsx'
import ProgressRail from '../components/ProgressRail.jsx'
import QuestionCard from '../components/QuestionCard.jsx'
import ReportUploader from '../components/ReportUploader.jsx'
import MedicalTermTooltip from '../components/MedicalTermTooltip.jsx'
import { submitAssessment } from '../lib/api.js'
import { questionnaire } from '../lib/ruleEngine.js'

const PHENOTYPE_ORDER = ['metabolic', 'hormonal', 'adrenal', 'inflammatory']

const PHENOTYPE_STEPS = PHENOTYPE_ORDER.map((pid) => {
  const p = questionnaire.phenotypes[pid]
  return {
    key: pid,
    label: p.label.split(' ')[0],
    fullLabel: p.label,
    questions: p.questions,
  }
})

const STEPS = [
  { key: 'intro', label: 'Patient Profile' },
  { key: 'report', label: 'Blood Report Slot' },
  { key: 'rotterdam', label: 'Rotterdam Check' },
  ...PHENOTYPE_STEPS,
  { key: 'mitochondrial', label: 'Energy & Fatigue' },
  { key: 'goals', label: 'Your Goals' },
  { key: 'review', label: 'Review & Submit' },
]

const DEMO_DEMOGRAPHICS = {
  full_name: 'Ananya Sharma',
  gender: 'Female',
  date_of_birth: '2003-05-14',
  age: 22,
  ethnicity: 'South Indian',
  occupation: 'Student',
  pcos_diagnosis_age: 20,
  region_preference: 'South Indian',
  diet_type: 'Eggetarian',
}

const DEMO_ANSWERS = {
  height_cm: 160,
  weight_kg: 68,
  acanthosis_nigricans: 'yes',
  fasting_insulin: 14.5,
  triglycerides: 165,
  hdl: 42,
  hba1c: 5.8,
  total_testosterone: 52.0,
  lh: 12.0,
  fsh: 4.5,
  hirsutism_severity: 'Moderate (chest/abdomen)',
  shbg: 24.0,
  dhea_s: 380.0,
  stress_scale: 8,
  sleep_quality: 'yes',
  hs_crp: 3.5,
  gut_health_issue: 'yes',
  vitamin_d3: 18.0,
  mitochondrial_fatigue: 'yes',
  mitochondrial_apnea: 'no',
  mitochondrial_hypoxia: 'yes',
  mitochondrial_pem: 'no',
  irregular_cycle_flag: 'yes',
}

const DEMO_GOALS = [
  'Regulate my menstrual cycles and periods',
  'Boost daily energy & eliminate brain fog',
  'Clear skin, acne, and reduce facial hair (hirsutism)',
  'Support weight management & lower stubborn belly fat',
]

export default function Questionnaire() {
  const [stepIndex, setStepIndex] = useState(0)
  const [demographics, setDemographics] = useState(() => {
    const savedReg = sessionStorage.getItem('pcos_patient_registration')
    if (savedReg) {
      try {
        return JSON.parse(savedReg)
      } catch (e) {}
    }
    return {
      gender: 'Female',
      region_preference: 'South Indian',
      diet_type: 'Eggetarian',
    }
  })
  const [answers, setAnswers] = useState({})
  const [goals, setGoals] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const step = STEPS[stepIndex]

  const hasLabReportData = useMemo(() => {
    return !!(answers.fasting_insulin || answers.total_testosterone || answers.dhea_s || answers.hs_crp)
  }, [answers])

  const handleDemographicChange = (key, value) => {
    setDemographics((d) => {
      const updated = { ...d, [key]: value }
      if (key === 'date_of_birth' && value) {
        const birthYear = new Date(value).getFullYear()
        const currentYear = new Date().getFullYear()
        if (birthYear && birthYear > 1900 && birthYear <= currentYear) {
          updated.age = currentYear - birthYear
        }
      }
      return updated
    })
  }

  const handleAnswerChange = (key, value) => setAnswers((a) => ({ ...a, [key]: value }))

  const handleAutoFillFromReport = (extractedData) => {
    setAnswers((prev) => ({ ...prev, ...extractedData }))
  }

  const toggleGoal = (goal) =>
    setGoals((g) => (g.includes(goal) ? g.filter((x) => x !== goal) : [...g, goal]))

  // Always enable step advancement to prevent getting stuck
  const canAdvance = true

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        demographics,
        answers,
        primary_goals: goals,
        region_preference: demographics.region_preference || 'South Indian',
        diet_type: demographics.diet_type || 'Eggetarian',
      }
      const result = await submitAssessment(payload)
      sessionStorage.setItem('pcos_last_result', JSON.stringify(result))
      navigate(result.source === 'backend' ? `/results/${result.id}` : '/results')
    } catch (e) {
      setError('Something went wrong scoring your responses. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function next() {
    if (stepIndex === STEPS.length - 1) return handleSubmit()
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function back() {
    setStepIndex((i) => Math.max(i - 1, 0))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function fillDemoData() {
    setDemographics(DEMO_DEMOGRAPHICS)
    setAnswers(DEMO_ANSWERS)
    setGoals(DEMO_GOALS)
    setStepIndex(STEPS.length - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div className="relative mx-auto max-w-4xl px-6 py-14">
        <div className="mb-4 flex justify-between items-center">
          <span className="chip text-[11px] font-semibold text-bio-200">
            Step {stepIndex + 1} of {STEPS.length} · {step.label}
          </span>
          <button
            type="button"
            onClick={fillDemoData}
            className="btn-ghost !px-3 !py-1 text-xs text-bio-200 border-bio-300/30 hover:bg-bio-400/10"
            title="Fills form with a sample case and jumps to Review"
          >
            ⚡ Auto-Feed Sample System Data
          </button>
        </div>

        <ProgressRail steps={STEPS} currentIndex={stepIndex} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step.key}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {step.key === 'intro' && (
              <IntroStep demographics={demographics} onChange={handleDemographicChange} />
            )}

            {step.key === 'report' && (
              <div>
                <SectionIntro
                  title="Patient Blood Report Upload Slot"
                  desc="Upload your blood report (PDF, JPG, JPEG, PNG, TXT) to automatically populate test values and verify reference ranges."
                />
                <ReportUploader onAutoFill={handleAutoFillFromReport} />
              </div>
            )}

            {step.key === 'rotterdam' && (
              <RotterdamStep answers={answers} onChange={handleAnswerChange} />
            )}

            {PHENOTYPE_STEPS.some((p) => p.key === step.key) && (
              <div>
                {hasLabReportData && (
                  <div className="mb-4 rounded-xl border border-bio-300/40 bg-bio-400/10 p-3 text-xs text-bio-200 flex items-center gap-2">
                    <span>✓</span>
                    <span>
                      <strong>Blood Report Values Applied:</strong> Your lab test parameters were auto-extracted. Below, please answer the <strong>symptom &amp; lifestyle questions</strong> not measured in blood reports.
                    </span>
                  </div>
                )}
                <PhenotypeStep step={step} answers={answers} onChange={handleAnswerChange} />
              </div>
            )}

            {step.key === 'mitochondrial' && (
              <>
                <SectionIntro
                  title="Energy, Sleep & Cellular Vitality (Non-Blood Questions)"
                  desc="Evaluates daily fatigue levels, brain fog, sleep quality, and energy crashes."
                />
                {questionnaire.mitochondrial_axis.questions.map((q, i) => (
                  <QuestionCard key={q.id} question={q} index={i} answers={answers} onChange={handleAnswerChange} />
                ))}
              </>
            )}

            {step.key === 'goals' && (
              <GoalsStep goals={goals} onToggle={toggleGoal} />
            )}

            {step.key === 'review' && (
              <ReviewStep demographics={demographics} answers={answers} goals={goals} />
            )}
          </motion.div>
        </AnimatePresence>

        {error && (
          <div className="mt-6 rounded-xl border border-alert-500/30 bg-alert-500/10 px-4 py-3 text-sm text-alert-400">
            {error}
          </div>
        )}

        <div className="mt-10 flex items-center justify-between">
          <button
            type="button"
            onClick={back}
            disabled={stepIndex === 0}
            className="btn-ghost disabled:pointer-events-none disabled:opacity-30 text-xs"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={next}
            disabled={submitting}
            className="btn-primary disabled:opacity-40 text-xs shadow-glow"
          >
            {submitting ? (
              'Scoring Engine…'
            ) : stepIndex === STEPS.length - 1 ? (
              'See My Phenotype Results →'
            ) : (
              'Continue →'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function SectionIntro({ title, desc }) {
  return (
    <div className="mb-2">
      <h2 className="font-display text-2xl font-bold text-white">{title}</h2>
      <p className="mt-1 text-sm text-slate-400">{desc}</p>
    </div>
  )
}

function IntroStep({ demographics, onChange }) {
  const CUISINES = [
    'South Indian',
    'North Indian',
    'East Indian',
    'West Indian',
    'Eggetarian',
    'Vegetarian',
    'Non-Vegetarian',
    'Vegan',
    'Continental',
    'Mediterranean',
    'Asian',
    'Middle Eastern',
    'Fusion / Global',
  ]
  const DIETS = ['Eggetarian', 'Vegetarian', 'Non-Vegetarian', 'Vegan']

  return (
    <>
      <SectionIntro
        title="Patient Details & Registration Profile"
        desc="Enter your details. Age is automatically calculated if Date of Birth is selected; otherwise enter age manually."
      />
      <GlassCard className="grid gap-4 p-6 sm:grid-cols-2 text-xs">
        <div>
          <label className="field-label">Full Name</label>
          <input
            type="text"
            className="input-glass"
            value={demographics.full_name || ''}
            onChange={(e) => onChange('full_name', e.target.value)}
            placeholder="e.g. Ananya Sharma"
          />
        </div>

        <div>
          <label className="field-label">Date of Birth (Auto-Calculates Age)</label>
          <input
            type="date"
            className="input-glass"
            value={demographics.date_of_birth || ''}
            onChange={(e) => onChange('date_of_birth', e.target.value)}
          />
        </div>

        <div>
          <label className="field-label">Age (Years)</label>
          <input
            type="number"
            className="input-glass font-bold text-bio-200"
            value={demographics.age || ''}
            onChange={(e) => onChange('age', e.target.value)}
            placeholder="Enter age directly if DOB unknown"
          />
        </div>

        <div>
          <label className="field-label">Ethnicity / Geographic Origin</label>
          <input
            type="text"
            className="input-glass"
            value={demographics.ethnicity || ''}
            onChange={(e) => onChange('ethnicity', e.target.value)}
            placeholder="e.g. South Asian / Indian"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="field-label">Occupation &amp; Shift Work Pattern</label>
          <input
            type="text"
            className="input-glass"
            value={demographics.occupation || ''}
            onChange={(e) => onChange('occupation', e.target.value)}
            placeholder="e.g. Software Engineer / Night Shift"
          />
        </div>
      </GlassCard>

      <SectionIntro
        title="Dietary & Regional Cuisine Preferences"
        desc="Select all preferred regional and global cuisines for your customized meal protocol."
      />
      <GlassCard className="grid gap-6 p-6 sm:grid-cols-2 text-xs">
        <div>
          <label className="field-label">Cuisine Preference (All Regions Included)</label>
          <div className="flex flex-wrap gap-2 pt-1">
            {CUISINES.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => onChange('region_preference', c)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  demographics.region_preference === c
                    ? 'border-bio-300/60 bg-bio-400/15 text-bio-100 shadow-glow font-bold'
                    : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25'
                }`}
              >
                {c === 'Eggetarian' ? '🥚 Eggetarian' : c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="field-label">Primary Diet Type</label>
          <div className="flex flex-wrap gap-2 pt-1">
            {DIETS.map((d) => (
              <button
                type="button"
                key={d}
                onClick={() => onChange('diet_type', d)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  demographics.diet_type === d
                    ? 'border-bio-300/60 bg-bio-400/15 text-bio-100 shadow-glow font-bold'
                    : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25'
                }`}
              >
                {d === 'Eggetarian' ? '🥚 Eggetarian' : d}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>
    </>
  )
}

function RotterdamStep({ answers, onChange }) {
  return (
    <>
      <SectionIntro
        title="First-Line Rotterdam Diagnostic Testing"
        desc="According to Rotterdam consensus, meeting at least 2 of the 3 criteria confirms PCOS diagnosis before phenotype breakdown."
      />
      <GlassCard className="p-6 space-y-5 text-xs">
        <div className="rounded-xl border border-bio-300/30 bg-bio-400/10 p-4 space-y-1">
          <h4 className="font-display text-sm font-bold text-bio-200">Rotterdam Consensus (2003/2018) Diagnostic Rule</h4>
          <p className="text-slate-300">
            If <strong>any 2 of these 3 features</strong> are positive, formal diagnosis of PCOS is established.
          </p>
        </div>

        {/* 1-Line Exclusion Criteria Block */}
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 space-y-2">
          <h4 className="font-display text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>🛡️</span> Mandatory Clinical Exclusion Criteria (1-Line Summary)
          </h4>
          <ul className="grid gap-1.5 sm:grid-cols-2 text-[11px] text-slate-300">
            <li className="flex items-center gap-1.5">
              <span className="text-amber-400">✓</span>
              <span><strong>Thyroid:</strong> TSH (0.4–4.0 µIU/mL) rules out hypo/hyperthyroidism.</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-amber-400">✓</span>
              <span><strong>Prolactin:</strong> Serum Prolactin (&lt;25 ng/mL) rules out prolactinoma.</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-amber-400">✓</span>
              <span><strong>NCAH:</strong> 17-OHP (&lt;200 ng/dL) rules out adrenal hyperplasia.</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-amber-400">✓</span>
              <span><strong>Cushing&apos;s:</strong> Cortisol rules out adrenal hypersecretion.</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
            <h4 className="font-semibold text-white text-sm">Criterion 1: Ovulatory Dysfunction</h4>
            <p className="text-slate-400">Do you experience irregular or missed menstrual cycles?</p>
            <div className="flex gap-3">
              {['yes', 'no'].map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => onChange('irregular_cycle_flag', opt)}
                  className={`rounded-lg border px-4 py-2 capitalize font-medium transition-all ${
                    answers.irregular_cycle_flag === opt
                      ? 'border-bio-300 bg-bio-400/20 text-bio-200'
                      : 'border-white/10 text-slate-300 hover:border-white/25'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
            <h4 className="font-semibold text-white text-sm">
              Criterion 2: Hyperandrogenism (Testosterone &gt; 45 ng/dL or Hirsutism)
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="field-label">Total Serum Testosterone (ng/dL)</label>
                <input
                  type="number"
                  className="input-glass"
                  value={answers.total_testosterone ?? ''}
                  onChange={(e) => onChange('total_testosterone', Number(e.target.value))}
                  placeholder="e.g. 52.0"
                />
              </div>
              <div>
                <label className="field-label">Clinical Hirsutism Severity</label>
                <select
                  className="input-glass"
                  value={answers.hirsutism_severity || 'None'}
                  onChange={(e) => onChange('hirsutism_severity', e.target.value)}
                >
                  <option value="None">None</option>
                  <option value="Mild (chin/lip)">Mild (chin/lip)</option>
                  <option value="Moderate (chest/abdomen)">Moderate (chest/abdomen)</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
            <h4 className="font-semibold text-white text-sm">Criterion 3: Polycystic Ovaries on Ultrasound</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="field-label">Follicle Count per Ovary</label>
                <input
                  type="number"
                  className="input-glass"
                  value={answers.follicle_count ?? ''}
                  onChange={(e) => onChange('follicle_count', Number(e.target.value))}
                  placeholder="e.g. 22"
                />
              </div>
              <div>
                <label className="field-label">Ovarian Volume (mL)</label>
                <input
                  type="number"
                  className="input-glass"
                  value={answers.ovarian_volume_ml ?? ''}
                  onChange={(e) => onChange('ovarian_volume_ml', Number(e.target.value))}
                  placeholder="e.g. 11.5"
                />
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </>
  )
}

function PhenotypeStep({ step, answers, onChange }) {
  return (
    <>
      <SectionIntro
        title={step.fullLabel}
        desc="Lab values are optional — leave any field blank if unavailable. Symptom questions still count toward phenotype tally."
      />
      {step.questions.map((q, i) => (
        <QuestionCard
          key={q.id}
          question={q}
          index={i}
          answers={answers}
          onChange={onChange}
        />
      ))}
    </>
  )
}

const PATIENT_PERSPECTIVE_GOALS = [
  '🌸 Get predictable, regular monthly periods without delays',
  '⚡ Feel energetic all day & eliminate afternoon fatigue crashes',
  '✨ Clear facial acne, pimples, & reduce unwanted facial hair',
  '🌿 Trim stubborn belly fullness & maintain healthy weight',
  '😴 Improve deep night sleep & wake up refreshed without brain fog',
  '🧘 Calm mood swings, stress anxiety, & daily tension',
  '🥗 Follow simple, delicious regional meal plans with your favorite foods',
]

function GoalsStep({ goals, onToggle }) {
  return (
    <>
      <SectionIntro
        title="Your Personal Health Goals"
        desc="Select what matters most to you. We tailor your diet, lifestyle, and exercise plan to reach these goals."
      />
      <GlassCard className="grid gap-3 p-6 sm:grid-cols-2">
        {PATIENT_PERSPECTIVE_GOALS.map((g) => (
          <button
            type="button"
            key={g}
            onClick={() => onToggle(g)}
            className={`flex items-center justify-between rounded-xl border p-4 text-left text-xs transition-all ${
              goals.includes(g)
                ? 'border-bio-300/60 bg-bio-400/15 text-bio-100 font-semibold shadow-glow'
                : 'border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/25'
            }`}
          >
            <span>{g}</span>
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
                goals.includes(g) ? 'border-bio-300 bg-bio-300' : 'border-white/20'
              }`}
            >
              {goals.includes(g) && (
                <svg viewBox="0 0 12 12" className="h-3 w-3 text-slate-900" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M2 6l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
          </button>
        ))}
      </GlassCard>
    </>
  )
}

function ReviewStep({ demographics, answers, goals }) {
  const answeredCount = Object.values(answers).filter((v) => v !== '' && v !== undefined).length
  return (
    <>
      <SectionIntro
        title="Review &amp; Generate Phenotype Plan"
        desc="Your inputs will run through the deterministic rule engine, Rotterdam diagnostic verification, and multi-cuisine diet protocol builder."
      />
      <GlassCard className="space-y-4 p-6 text-xs">
        <Row label="Patient Name" value={demographics.full_name || '—'} />
        <Row label="Gender" value={demographics.gender || 'Female'} />
        <Row label="Age / Date of Birth" value={`${demographics.age || '—'} Yrs (${demographics.date_of_birth || 'No DOB'})`} />
        <Row label="Cuisine & Diet Preference" value={`${demographics.region_preference || 'South Indian'} · ${demographics.diet_type || 'Eggetarian'}`} />
        <Row label="Answered Fields" value={`${answeredCount}`} />
        <Row label="Selected Health Goals" value={`${goals.length}`} />
      </GlassCard>
    </>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-slate-100">{value}</span>
    </div>
  )
}
