import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GlassCard from '../components/GlassCard.jsx'
import ProgressRail from '../components/ProgressRail.jsx'
import QuestionCard from '../components/QuestionCard.jsx'
import { submitAssessment } from '../lib/api.js'
import { questionnaire } from '../lib/ruleEngine.js'

const PHENOTYPE_STEPS = Object.entries(questionnaire.phenotypes).map(([id, p]) => ({
  key: id,
  label: p.label.split(' ')[0],
  fullLabel: p.label,
  questions: p.questions,
}))

const STEPS = [
  { key: 'intro', label: 'About You' },
  ...PHENOTYPE_STEPS,
  { key: 'mitochondrial', label: 'Energy Screen' },
  { key: 'goals', label: 'Your Goals' },
  { key: 'review', label: 'Review' },
]

// Demo/presentation helper -- fills every field with a consistent, plausible
// Adrenal-phenotype case (tally leader + biomarker override both point the
// same way) so a live demo lands on a clean, explainable Primary result
// instead of a tie or Inconclusive. Not wired to any backend; purely local.
const DEMO_DEMOGRAPHICS = {
  full_name: 'Ananya Sharma',
  date_of_birth: '2003-05-14',
  age: 22,
  sex: 'Female',
  occupation: 'Student',
  relationship_status: 'Single, no pregnancy goals yet',
  ethnicity: 'South Indian',
  living_environment: 'Urban',
  pcos_diagnosis_age: 20,
  irregular_cycle_flag: 'yes',
  region_preference: 'South Indian',
  diet_type: 'Vegetarian',
}

const DEMO_ANSWERS = {
  // Adrenal -- all positive, plus DHEA-S drives the biomarker override
  systolic: 130, diastolic: 90, heart_rate: 85, spo2: 93,
  dhea_s: 400, cortisol_am: 25,
  stress_scale: 8, burnout_history: 'yes',
  sleep_hours: 5, sleep_poor_quality: 'yes',
  adrenal_fatigue: 'yes', worried: 'yes', poor_concentration: 'yes',
  shallow_breathing: 'yes', mood_swings: 'yes',
  // Hormonal -- kept normal so Adrenal stays the clear tally leader
  cycle_length_days: 28, cycle_absent: 'no',
  hirsutism_severity: 'None', alopecia: 'no', sym_acne: 'no',
  follicle_count: 15, ovarian_volume_ml: 8,
  total_testosterone: 30, free_testosterone: 0.5,
  lh_fsh_ratio: 1.0, shbg: 60, post_pill_amenorrhea: 'no',
  // Inflammatory -- kept normal
  joint_pain: 'no', hs_crp: 0.5, tsh: 1.5, tpo_ab_positive: 'no',
  vitamin_d3: 50, serum_zinc: 100, edc_exposure: 'Low',
  heavy_metal_exposure: 'no', gut_health_issue: 'no', gut_dysbiosis_severe: 'no',
  autoimmune_history: 'no', low_sun_exposure: 'no', vitd_deficiency_symptoms: 'no',
  // Metabolic -- kept normal; insulin/HOMA-IR specifically kept low so the
  // Metabolic override doesn't also fire and muddy the result into Mixed
  height_cm: 160, weight_kg: 55, waist_cm: 70, hip_cm: 95,
  acanthosis_nigricans: 'no', skin_tags: 'no', postprandial_slump: 'no',
  fasting_glucose: 85, fasting_insulin: 3, hba1c: 5.0, homa_ir: 1.0,
  triglycerides: 100, hdl: 60, sedentary: 'no', ultraprocessed_food: 'no',
  // Energy screen
  mito_depression: 'yes', mito_hypoxia: 'yes', mito_pem: 'no', mito_detraining: 'no',
}

const DEMO_GOALS = [
  'Balance mood & lower stress levels',
  'Improve sleep quality',
  'Overcome chronic fatigue & brain fog',
]

export default function Questionnaire() {
  const [stepIndex, setStepIndex] = useState(0)
  const [demographics, setDemographics] = useState({})
  const [answers, setAnswers] = useState({})
  const [goals, setGoals] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const step = STEPS[stepIndex]

  const handleDemographicChange = (key, value) => setDemographics((d) => ({ ...d, [key]: value }))
  const handleAnswerChange = (key, value) => setAnswers((a) => ({ ...a, [key]: value }))
  const toggleGoal = (goal) =>
    setGoals((g) => (g.includes(goal) ? g.filter((x) => x !== goal) : [...g, goal]))

  const canAdvance = useMemo(() => {
    if (step.key === 'intro') {
      return demographics.region_preference && demographics.diet_type
    }
    return true
  }, [step, demographics])

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        demographics,
        answers,
        primary_goals: goals,
        region_preference: demographics.region_preference,
        diet_type: demographics.diet_type,
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
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={fillDemoData}
            className="btn-ghost !px-4 !py-2 text-xs text-slate-400 hover:text-bio-200"
            title="Fills the whole form with a sample Adrenal-phenotype case and jumps to Review, for presentations/demos"
          >
            ⚡ Fill Demo Data
          </button>
        </div>
        <ProgressRail steps={STEPS} currentIndex={stepIndex} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step.key}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            {step.key === 'intro' && (
              <IntroStep demographics={demographics} onChange={handleDemographicChange} />
            )}

            {step.key === 'mitochondrial' && (
              <>
                <SectionIntro
                  title={questionnaire.mitochondrial_axis.label}
                  desc="A short screen for cellular energy / hypoxia issues that can sit underneath any of the four phenotypes."
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

            {PHENOTYPE_STEPS.some((p) => p.key === step.key) && (
              <PhenotypeStep step={step} answers={answers} onChange={handleAnswerChange} />
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
            onClick={back}
            disabled={stepIndex === 0}
            className="btn-ghost disabled:pointer-events-none disabled:opacity-30"
          >
            Back
          </button>
          <button onClick={next} disabled={!canAdvance || submitting} className="btn-primary disabled:opacity-40">
            {submitting ? (
              <>
                <Spinner /> Scoring…
              </>
            ) : stepIndex === STEPS.length - 1 ? (
              'See My Results'
            ) : (
              'Continue'
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
      <p className="mt-1.5 text-sm text-slate-400">{desc}</p>
    </div>
  )
}

function PhenotypeStep({ step, answers, onChange }) {
  return (
    <>
      <SectionIntro
        title={step.fullLabel}
        desc="Lab values are optional — leave any field blank if you don't have the number; symptom questions still count toward the tally."
      />
      {step.questions.map((q, i) => {
        const carriedOver = Boolean(
          q.shared_field && answers[q.shared_field] !== undefined && step.key !== 'hormonal'
        )
        return (
          <QuestionCard
            key={q.id}
            question={q}
            index={i}
            answers={answers}
            onChange={onChange}
            carriedOver={carriedOver}
          />
        )
      })}
    </>
  )
}

function IntroStep({ demographics, onChange }) {
  const textFields = questionnaire.demographics.filter((f) => !['region_preference', 'diet_type'].includes(f.id))
  return (
    <>
      <SectionIntro
        title="A little about you"
        desc="Section 1 of the questionnaire. Nothing here affects your phenotype score — it's context for your care team."
      />
      <GlassCard className="grid gap-4 p-6 sm:grid-cols-2">
        {textFields.map((f) => (
          <div key={f.id} className={f.type === 'text' && ['occupation', 'relationship_status'].includes(f.id) ? 'sm:col-span-2' : ''}>
            <label className="field-label">{f.label}</label>
            {f.type === 'select' ? (
              <select
                className="input-glass"
                value={demographics[f.id] ?? ''}
                onChange={(e) => onChange(f.id, e.target.value)}
              >
                <option value="" disabled>Select…</option>
                {f.options.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            ) : f.type === 'yesno' ? (
              <div className="flex gap-2">
                {['yes', 'no'].map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => onChange(f.id, opt)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm capitalize transition-all ${
                      demographics[f.id] === opt
                        ? 'border-bio-300/50 bg-bio-400/10 text-bio-200'
                        : 'border-white/10 text-slate-300 hover:border-white/25'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type={f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text'}
                className="input-glass"
                value={demographics[f.id] ?? ''}
                onChange={(e) => onChange(f.id, e.target.value)}
              />
            )}
          </div>
        ))}
      </GlassCard>

      <SectionIntro title="Diet preference" desc="Used only at the end, to map your phenotype to a diet & exercise protocol (Section 4)." />
      <GlassCard className="grid gap-6 p-6 sm:grid-cols-2">
        <div>
          <label className="field-label">Regional cuisine</label>
          <div className="flex flex-wrap gap-2">
            {['South Indian', 'North Indian'].map((opt) => (
              <button
                type="button"
                key={opt}
                onClick={() => onChange('region_preference', opt)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                  demographics.region_preference === opt
                    ? 'border-bio-300/60 bg-bio-400/15 text-bio-100 shadow-glow'
                    : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="field-label">Diet type</label>
          <div className="flex flex-wrap gap-2">
            {['Vegetarian', 'Non-Vegetarian', 'Vegan'].map((opt) => (
              <button
                type="button"
                key={opt}
                onClick={() => onChange('diet_type', opt)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                  demographics.diet_type === opt
                    ? 'border-bio-300/60 bg-bio-400/15 text-bio-100 shadow-glow'
                    : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>
    </>
  )
}

function GoalsStep({ goals, onToggle }) {
  return (
    <>
      <SectionIntro
        title="Primary health goal(s)"
        desc="Pick as many as apply. These don't change your phenotype score, but they're shown alongside your protocol."
      />
      <GlassCard className="grid gap-2.5 p-6 sm:grid-cols-2">
        {questionnaire.primary_goals.map((g) => (
          <button
            type="button"
            key={g}
            onClick={() => onToggle(g)}
            className="tick-toggle"
            data-active={goals.includes(g)}
          >
            <span className="text-sm text-slate-200">{g}</span>
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all ${
                goals.includes(g) ? 'border-bio-300 bg-bio-300' : 'border-white/20'
              }`}
            >
              {goals.includes(g) && (
                <svg viewBox="0 0 12 12" className="h-3 w-3 text-void" fill="none" stroke="currentColor" strokeWidth="2">
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
      <SectionIntro title="Review & submit" desc="Your answers are scored automatically — nothing is sent to any AI model." />
      <GlassCard className="space-y-4 p-6">
        <Row label="Name" value={demographics.full_name || '—'} />
        <Row label="Region / Diet" value={`${demographics.region_preference || '—'} · ${demographics.diet_type || '—'}`} />
        <Row label="Fields answered" value={`${answeredCount}`} />
        <Row label="Goals selected" value={`${goals.length}`} />
      </GlassCard>
      <p className="px-1 text-xs text-slate-500">
        Click "See My Results" to run the scoring engine, override checks, and classification.
      </p>
    </>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="font-medium text-slate-100">{value}</span>
    </div>
  )
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}
