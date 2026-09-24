import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import GlassCard from '../components/GlassCard.jsx'
import ProgressRail from '../components/ProgressRail.jsx'
import QuestionCard from '../components/QuestionCard.jsx'
import { submitAssessment } from '../lib/api.js'
import { questionnaire } from '../lib/ruleEngine.js'

const PHENOTYPE_KEYS = ['metabolic', 'hormonal', 'adrenal', 'inflammatory']
const PHENOTYPE_STEPS = PHENOTYPE_KEYS.map((id) => ({
  key: id,
  label: questionnaire.phenotypes[id].label.split(' ')[0],
  fullLabel: questionnaire.phenotypes[id].label,
  questions: questionnaire.phenotypes[id].questions,
}))

const STEPS = [
  { key: 'first_line', label: 'First-Line Testing', fullLabel: questionnaire.first_line?.label || 'First-Line Testing', questions: questionnaire.first_line?.questions || [] },
  ...PHENOTYPE_STEPS,
  { key: 'exclusions', label: 'Exclusions', fullLabel: questionnaire.exclusions?.label || 'Exclusions', questions: questionnaire.exclusions?.questions || [] },
  { key: 'goals', label: 'Your Goals' },
  { key: 'review', label: 'Review' },
]

export default function Questionnaire() {
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [goals, setGoals] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Simulate auto-filling from uploaded reports
    const mockData = sessionStorage.getItem('mock_extracted_data')
    if (mockData) {
      try {
        setAnswers(prev => ({ ...prev, ...JSON.parse(mockData) }))
      } catch (e) {
        // Ignore parse error
      }
    }
  }, [])

  const step = STEPS[stepIndex]

  const handleAnswerChange = (key, value) => setAnswers((a) => ({ ...a, [key]: value }))
  const toggleGoal = (goal) =>
    setGoals((g) => (g.includes(goal) ? g.filter((x) => x !== goal) : [...g, goal]))

  const canAdvance = true // Validations can be added here if needed

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      // In a real flow, you'd pull demographics from context/store saved during Registration
      const payload = {
        demographics: {}, 
        answers,
        primary_goals: goals,
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
    setAnswers({
      irregular_cycle: 'yes',
      high_testosterone_symptoms: 'yes',
      polycystic_ovaries_usg: 'yes',
      stress_psq: 8,
      anxiety_phq2: 2,
      anxiety_phq2_2: 3,
      triglycerides: 180,
      hdl: 40,
      height_cm: 160,
      weight_kg: 80,
      fatigue: 'yes',
      sleep_apnea: 'yes',
      hypoxia: 'yes',
      body_type: 'Obese'
    })
    setGoals(['Balance mood & lower stress levels', 'Improve sleep quality', 'Overcome chronic fatigue & brain fog'])
    setStepIndex(STEPS.length - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div className="relative mx-auto max-w-4xl px-6 py-14 pt-24">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={fillDemoData}
            className="btn-ghost !px-4 !py-2 text-xs text-slate-400 hover:text-bio-200"
            title="Fills the whole form with sample data"
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
            {step.key === 'goals' && (
              <GoalsStep goals={goals} onToggle={toggleGoal} />
            )}

            {step.key === 'review' && (
              <ReviewStep answers={answers} goals={goals} />
            )}

            {step.questions && (
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
        desc="Fill in the relevant details below."
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

function GoalsStep({ goals, onToggle }) {
  return (
    <>
      <SectionIntro
        title="Primary health goal(s)"
        desc="Pick as many as apply. These don't change your phenotype score, but they're shown alongside your protocol."
      />
      <GlassCard className="grid gap-2.5 p-6 sm:grid-cols-2">
        {questionnaire.primary_goals?.map((g) => (
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

function ReviewStep({ answers, goals }) {
  const answeredCount = Object.values(answers).filter((v) => v !== '' && v !== undefined).length
  return (
    <>
      <SectionIntro title="Review & submit" desc="Your answers are scored automatically." />
      <GlassCard className="space-y-4 p-6">
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
