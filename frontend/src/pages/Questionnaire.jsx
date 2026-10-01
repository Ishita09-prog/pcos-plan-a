import { AnimatePresence, motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import GlassCard from '../components/GlassCard.jsx'
import ProgressRail from '../components/ProgressRail.jsx'
import QuestionCard from '../components/QuestionCard.jsx'
import { submitAssessment } from '../lib/api.js'
import { questionnaire, liveBmi } from '../lib/ruleEngine.js'

// Order per mentor feedback (Sep 2026): Metabolic -> Hormonal -> Adrenal ->
// Inflammatory, with the Rotterdam first-line gate ahead of everything and
// the mitochondrial "Energy Screen" kept reachable right after the four
// phenotypes (it was dropped from the flow in an earlier pass -- restored
// here since its questions still feed the mitochondrial-support recommendation).
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
  { key: 'mitochondrial', label: 'Energy Screen', fullLabel: questionnaire.mitochondrial_axis?.label || 'Energy Screen', questions: questionnaire.mitochondrial_axis?.questions || [] },
  { key: 'exclusions', label: 'Exclusions', fullLabel: questionnaire.exclusions?.label || 'Exclusions', questions: questionnaire.exclusions?.questions || [] },
  { key: 'goals', label: 'Your Goals' },
  { key: 'review', label: 'Review' },
]

// For a field shared by two questions in two different steps (e.g. sym_acne
// in Hormonal+Inflammatory, sleep_apnea/hypoxia in Metabolic+Energy Screen),
// only the step where it's asked FIRST in the flow should collect it -- every
// later step just shows it as already answered.
const PRIMARY_STEP_FOR_SHARED_FIELD = {}
for (const step of STEPS) {
  for (const q of step.questions || []) {
    if (q.shared_field && !(q.shared_field in PRIMARY_STEP_FOR_SHARED_FIELD)) {
      PRIMARY_STEP_FOR_SHARED_FIELD[q.shared_field] = step.key
    }
  }
}

export default function Questionnaire() {
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [goals, setGoals] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const [extractedFlags, setExtractedFlags] = useState({})

  useEffect(() => {
    // Auto-fill from a lab report parsed locally on the Registration page
    // (see lib/reportExtractor.js) -- each value also carries a normal /
    // overriding flag computed against this same questionnaire's thresholds.
    const extracted = sessionStorage.getItem('pcos_extracted_report')
    if (extracted) {
      try {
        const flagged = JSON.parse(extracted)
        setAnswers((prev) => {
          const next = { ...prev }
          for (const [key, { value }] of Object.entries(flagged)) next[key] = value
          return next
        })
        setExtractedFlags(flagged)
      } catch (e) {
        // Ignore parse error -- user can still fill the form by hand
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
      const registration = JSON.parse(sessionStorage.getItem('pcos_registration') || '{}')
      const { region_preference, diet_type, ...demographics } = registration
      const payload = {
        demographics,
        answers,
        primary_goals: goals,
        region_preference: region_preference || 'South Indian',
        diet_type: diet_type || 'Vegetarian',
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

  // Presentation/demo helper -- two complete, every-field-filled profiles for
  // walking a reviewer through the live questionnaire page by page (not just
  // jumping to a result). PCOS_CASE clearly meets the Rotterdam gate and
  // tallies Metabolic as a clean primary phenotype (no override triggered,
  // for a simple story); HEALTHY_CASE deliberately fails the Rotterdam gate
  // and has normal values on every single field, demonstrating the tool
  // correctly recognizing a true negative. Neither is wired to the backend --
  // purely local state, same as the original single demo button.
  const PCOS_CASE = {
    registration: {
      fullName: 'Ananya Sharma',
      email: 'ananya.demo@example.com',
      dob: '2003-05-14',
      age: '22',
      occupation: 'Student',
      relationship_status: 'Single, no pregnancy goals yet',
      ethnicity: 'South Indian',
      living_environment: 'Urban - Polluted',
      pcos_diagnosis_age: '20',
      region_preference: 'South Indian',
      diet_type: 'Vegetarian',
    },
    goals: ['Get my periods more regular', 'Help my body respond better to insulin', 'Overcome constant tiredness & brain fog'],
    answers: {
      // First-line / Rotterdam -- 3 of 3 met
      irregular_cycle: 'yes',
      high_testosterone_symptoms: 'yes',
      polycystic_ovaries_usg: 'yes',
      exclusion_other_disorders: 'no',
      // Metabolic -- clean tally leader, below both override thresholds
      height_cm: 160, weight_kg: 82, waist_cm: 94, hip_cm: 102,
      triglycerides: 180, hdl: 38,
      acanthosis_nigricans: 'yes', skin_tags: 'yes', postprandial_slump: 'yes',
      fasting_glucose: 99, fasting_insulin: 8, hba1c: 5.6, homa_ir: 1.9,
      sedentary: 'yes', ultraprocessed_food: 'yes',
      sleep_apnea: 'no', hypoxia: 'no',
      body_type: 'Obese',
      // Hormonal -- some findings, below Metabolic's tally
      cycle_length_days: 45, cycle_absent: 'no',
      hirsutism_severity: 'Mild', alopecia: 'no', sym_acne: 'yes',
      follicle_count: 24, ovarian_volume_ml: 8,
      total_testosterone: 65, free_testosterone: 0.5,
      lh_fsh_ratio: 1.5, shbg: 70, post_pill_amenorrhea: 'no',
      // Adrenal -- mild findings, no override
      systolic: 118, diastolic: 76, heart_rate: 88, spo2: 97,
      dhea_s: 200, cortisol_am: 15,
      pss_1: 2, pss_2: 2, pss_3: 2, pss_4: 2, pss_5: 2, pss_6: 2, pss_7: 2, pss_8: 2, pss_9: 2, pss_10: 2,
      phq2_1: 1, phq2_2: 1,
      sleep_hours: 6.5, sleep_poor_quality: 'yes',
      adrenal_fatigue: 'yes', worried: 'yes', poor_concentration: 'no', shallow_breathing: 'no', mood_swings: 'no',
      // Inflammatory -- some findings, no override
      joint_pain: 'no', hs_crp: 0.8,
      tsh: 2.5, tpo_ab_positive: 'no',
      vitamin_d3: 35, serum_zinc: 95,
      edc_exposure: 'Moderate', heavy_metal_exposure: 'no',
      gut_health_issue: 'yes', gut_dysbiosis_severe: 'no',
      autoimmune_history: 'no',
      low_sun_exposure: 'yes', vitd_deficiency_symptoms: 'no',
      // Energy Screen -- flag triggers (2+ positive)
      mito_fatigue: 'yes', mito_pem: 'no', mito_detraining: 'yes',
    },
  }

  const HEALTHY_CASE = {
    registration: {
      fullName: 'Priya Reddy',
      email: 'priya.demo@example.com',
      dob: '2002-11-02',
      age: '23',
      occupation: 'Student',
      relationship_status: 'Single, no pregnancy goals yet',
      ethnicity: 'South Indian',
      living_environment: 'Urban - Not polluted',
      pcos_diagnosis_age: '',
      region_preference: 'South Indian',
      diet_type: 'Vegetarian',
    },
    goals: ['Sleep better', 'Have more energy & stamina'],
    answers: {
      // First-line / Rotterdam -- 0 of 3 met -> correctly gated out as "not PCOS"
      irregular_cycle: 'no',
      high_testosterone_symptoms: 'no',
      polycystic_ovaries_usg: 'no',
      exclusion_other_disorders: 'no',
      // Metabolic -- all normal
      height_cm: 162, weight_kg: 58, waist_cm: 70, hip_cm: 92,
      triglycerides: 90, hdl: 65,
      acanthosis_nigricans: 'no', skin_tags: 'no', postprandial_slump: 'no',
      fasting_glucose: 85, fasting_insulin: 4, hba1c: 5.0, homa_ir: 0.9,
      sedentary: 'no', ultraprocessed_food: 'no',
      sleep_apnea: 'no', hypoxia: 'no',
      body_type: 'Lean',
      // Hormonal -- all normal
      cycle_length_days: 28, cycle_absent: 'no',
      hirsutism_severity: 'None', alopecia: 'no', sym_acne: 'no',
      follicle_count: 8, ovarian_volume_ml: 6,
      total_testosterone: 30, free_testosterone: 0.4,
      lh_fsh_ratio: 1.0, shbg: 60, post_pill_amenorrhea: 'no',
      // Adrenal -- all normal, low stress
      systolic: 112, diastolic: 72, heart_rate: 70, spo2: 99,
      dhea_s: 180, cortisol_am: 14,
      pss_1: 0, pss_2: 0, pss_3: 0, pss_4: 4, pss_5: 4, pss_6: 0, pss_7: 4, pss_8: 4, pss_9: 0, pss_10: 0,
      phq2_1: 0, phq2_2: 0,
      sleep_hours: 8, sleep_poor_quality: 'no',
      adrenal_fatigue: 'no', worried: 'no', poor_concentration: 'no', shallow_breathing: 'no', mood_swings: 'no',
      // Inflammatory -- all normal
      joint_pain: 'no', hs_crp: 0.5,
      tsh: 2.0, tpo_ab_positive: 'no',
      vitamin_d3: 45, serum_zinc: 80,
      edc_exposure: 'Low', heavy_metal_exposure: 'no',
      gut_health_issue: 'no', gut_dysbiosis_severe: 'no',
      autoimmune_history: 'no',
      low_sun_exposure: 'no', vitd_deficiency_symptoms: 'no',
      // Energy Screen -- no flag
      mito_fatigue: 'no', mito_pem: 'no', mito_detraining: 'no',
    },
  }

  const [demoProfile, setDemoProfile] = useState(null)

  function loadDemo(profileKey) {
    const profile = profileKey === 'pcos' ? PCOS_CASE : HEALTHY_CASE
    sessionStorage.setItem('pcos_registration', JSON.stringify(profile.registration))
    setAnswers(profile.answers)
    setGoals(profile.goals)
    setDemoProfile(profileKey)
    // Deliberately NOT changing stepIndex -- stays on whatever step you're
    // currently viewing so the form in front of you fills in immediately,
    // and every step you walk to next (Back/Continue) is already filled too.
  }

  return (
    <div className="relative">
      <div className="relative mx-auto max-w-4xl px-6 py-14 pt-24">
        <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
          {demoProfile && (
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400">
              Demo loaded: <span className="text-bio-200">{demoProfile === 'pcos' ? 'PCOS case' : 'Healthy / no-PCOS case'}</span>
            </span>
          )}
          <button
            type="button"
            onClick={() => loadDemo('pcos')}
            className="btn-ghost !px-4 !py-2 text-xs text-slate-400 hover:text-bio-200"
            title="Fills every step with a sample PCOS-positive case (clears Rotterdam criteria, Metabolic-primary)"
          >
            ⚡ Fill PCOS Case
          </button>
          <button
            type="button"
            onClick={() => loadDemo('healthy')}
            className="btn-ghost !px-4 !py-2 text-xs text-slate-400 hover:text-bio-200"
            title="Fills every step with a sample healthy case (normal values throughout, does not meet Rotterdam criteria)"
          >
            ⚡ Fill Healthy Case
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
              <PhenotypeStep step={step} answers={answers} onChange={handleAnswerChange} extractedFlags={extractedFlags} />
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

function PhenotypeStep({ step, answers, onChange, extractedFlags = {} }) {
  const bmi = step.key === 'metabolic' ? liveBmi(answers.height_cm, answers.weight_kg) : null
  return (
    <>
      <SectionIntro
        title={step.fullLabel}
        desc="Fill in the relevant details below."
      />
      {bmi && (
        <GlassCard className="flex items-center justify-between px-5 py-3">
          <span className="text-sm text-slate-400">Your BMI (live, as you type)</span>
          <span className="font-display text-lg font-semibold text-bio-200">
            {bmi.bmi} <span className="text-sm font-normal text-slate-400">· {bmi.category}</span>
          </span>
        </GlassCard>
      )}
      {step.questions.map((q, i) => {
        const carriedOver = Boolean(
          q.shared_field &&
          answers[q.shared_field] !== undefined &&
          step.key !== PRIMARY_STEP_FOR_SHARED_FIELD[q.shared_field]
        )
        const reportFlag = q.fields?.map((f) => extractedFlags[f.key]).find(Boolean)
        return (
          <QuestionCard
            key={q.id}
            question={q}
            index={i}
            answers={answers}
            onChange={onChange}
            carriedOver={carriedOver}
            reportFlag={reportFlag}
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
