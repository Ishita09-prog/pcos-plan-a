import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AIChatbot from '../components/AIChatbot.jsx'
import GlassCard from '../components/GlassCard.jsx'
import MedicalTermTooltip from '../components/MedicalTermTooltip.jsx'
import PhenotypeRadar from '../components/PhenotypeRadar.jsx'
import SeverityRing from '../components/SeverityRing.jsx'
import { fetchResult } from '../lib/api.js'

const PHENOTYPE_META = {
  adrenal: { label: 'Adrenal', color: '#f59e0b' },
  hormonal: { label: 'Hormonal', color: '#fbbf24' },
  inflammatory: { label: 'Inflammatory', color: '#ea580c' },
  metabolic: { label: 'Metabolic', color: '#fef08a' },
  mitochondrial: { label: 'Mitochondrial', color: '#d97706' },
}

export default function Results() {
  const { id } = useParams()
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const cached = sessionStorage.getItem('pcos_last_result')
    if (cached) {
      setResult(JSON.parse(cached))
      return
    }
    if (id) {
      fetchResult(id).then(setResult).catch(() => setError('Could not load this result.'))
    } else {
      setError('No result to show yet.')
    }
  }, [id])

  if (error) return <EmptyState message={error} />
  if (!result) return <LoadingState />

  const { scores, classification, recommendation, rotterdam, body_type } = result
  const isMixed = classification.classification.startsWith('Mixed')
  const isInconclusive = classification.classification.startsWith('Inconclusive')

  return (
    <div className="relative pb-24">
      <div className="relative mx-auto max-w-6xl px-6 py-14 space-y-8">
        {/* Classification & Rotterdam Banner */}
        <ClassificationBanner
          classification={classification}
          rotterdam={rotterdam}
          isMixed={isMixed}
          isInconclusive={isInconclusive}
        />

        {/* Body Type Protocol Summary */}
        {(body_type || recommendation.body_type_protocol) && (
          <BodyTypeBanner bodyType={body_type || recommendation.body_type_protocol} />
        )}

        {/* Radar + severity rings */}
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <GlassCard strong className="flex items-center justify-center p-6">
            <PhenotypeRadar scores={scores} primaryPhenotype={classification.primary_phenotype} />
          </GlassCard>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {['metabolic', 'hormonal', 'adrenal', 'inflammatory'].map((pid) => (
              <SeverityRing
                key={pid}
                label={PHENOTYPE_META[pid].label}
                percentage={scores[pid].percentage}
                severity={scores[pid].severity}
                positiveCount={scores[pid].positive_count}
                total={scores[pid].total_questions}
                highlighted={classification.phenotypes_involved.includes(pid)}
              />
            ))}

            <div className="col-span-2 sm:col-span-4">
              <GlassCard className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3 text-xs">
                  <span className="chip !bg-amber-400/10 !border-amber-400/30 !text-amber-200">
                    Energy Screen
                  </span>
                  <span className="text-slate-300">
                    Fatigue &amp; Hypoxia Screen:{' '}
                    <strong className="text-white">
                      {scores.mitochondrial.positive_count}/{scores.mitochondrial.total_questions}
                    </strong>
                  </span>
                </div>
                {scores.mitochondrial.flag && (
                  <span className="chip !border-amber-400/40 !text-amber-300">
                    Flagged — Mitochondrial Support Track
                  </span>
                )}
              </GlassCard>
            </div>
          </div>
        </div>

        {/* Overrides + biomarker support */}
        {(classification.overrides_triggered.length > 0 ||
          classification.biomarker_supported_phenotypes.length > 0) && (
          <div className="grid gap-4 sm:grid-cols-2 text-xs">
            {classification.overrides_triggered.length > 0 && (
              <GlassCard className="border-alert-500/30 p-5">
                <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-alert-400">
                  <span>⚠️</span> Hard Biomarker Overrides Triggered
                </h3>
                <ul className="space-y-2">
                  {classification.overrides_triggered.map((o) => (
                    <li key={o.id} className="text-slate-300">
                      <span className="font-medium text-slate-100">
                        {PHENOTYPE_META[o.phenotype]?.label}:
                      </span>{' '}
                      {o.label}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            )}

            {classification.biomarker_supported_phenotypes.length > 0 && (
              <GlassCard className="p-5">
                <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-bio-300">
                  <span>🧪</span> Supporting Lab Biomarkers
                </h3>
                <p className="text-slate-400">
                  3+ abnormal biochemical markers in:{' '}
                  {classification.biomarker_supported_phenotypes
                    .map((p) => PHENOTYPE_META[p].label)
                    .join(', ')}
                </p>
              </GlassCard>
            )}
          </div>
        )}

        {/* Recommendation blocks */}
        {!isInconclusive && (
          <div className="mt-14 space-y-10">
            <SectionHeading
              eyebrow="Section 4 · Tailored Protocol"
              title={isMixed ? 'Your Dual-Targeted Protocol' : 'Your Targeted Phenotype Protocol'}
              desc={`Customized to your ${recommendation.phenotype_blocks[0]?.regional_suggestions.region} cuisine & ${recommendation.phenotype_blocks[0]?.day_plan.diet_type} preference.`}
            />

            {recommendation.phenotype_blocks.map((block) => (
              <PhenotypeProtocolBlock key={block.phenotype} block={block} />
            ))}

            <MitochondrialBlock block={recommendation.mitochondrial_support} />
          </div>
        )}

        <div className="mt-14 flex flex-wrap items-center justify-center gap-4 print:hidden">
          <Link to="/assessment" className="btn-ghost text-xs">
            Retake Assessment
          </Link>
          <button type="button" onClick={() => window.print()} className="btn-primary text-xs">
            Save / Print Phenotype Report
          </button>
        </div>
      </div>

      <AIChatbot />
    </div>
  )
}

function ClassificationBanner({ classification, rotterdam, isMixed, isInconclusive }) {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <GlassCard strong className="relative overflow-hidden p-8">
        <div className="relative space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="chip">
              <span className="h-1.5 w-1.5 rounded-full bg-bio-300 animate-pulse" />
              Automated Rule Engine Score
            </span>

            {rotterdam && (
              <span
                className={`chip font-semibold ${
                  rotterdam.is_diagnosed
                    ? '!bg-bio-400/20 !border-bio-300/50 !text-bio-200'
                    : '!bg-amber-400/20 !border-amber-400/40 !text-amber-200'
                }`}
              >
                Rotterdam Criteria: {rotterdam.positive_count}/3 Met
              </span>
            )}
          </div>

          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
            {isInconclusive ? (
              'Inconclusive — Minimal Findings'
            ) : isMixed ? (
              <>
                Mixed Phenotype:{' '}
                <span className="text-gradient-bio">
                  {classification.phenotypes_involved.map((p) => PHENOTYPE_META[p].label).join(' + ')}
                </span>
              </>
            ) : (
              <>
                Primary Phenotype:{' '}
                <span className="text-gradient-bio">
                  {PHENOTYPE_META[classification.primary_phenotype]?.label}
                </span>
              </>
            )}
          </h1>

          <p className="max-w-2xl text-xs text-slate-300 leading-relaxed">{classification.reason}</p>
        </div>
      </GlassCard>
    </motion.div>
  )
}

function BodyTypeBanner({ bodyType }) {
  const isObese = bodyType.type === 'obese_pcos' || bodyType.body_type === 'obese_pcos'
  return (
    <GlassCard className="p-6 space-y-3 border-bio-300/30">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{isObese ? '🏋️' : '🏃'}</span>
          <h3 className="font-display text-base font-bold text-white">
            {bodyType.label || bodyType.title}
          </h3>
        </div>
        {bodyType.bmi && (
          <span className="chip text-xs font-semibold text-bio-200">
            Calculated BMI: {bodyType.bmi} kg/m²
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 text-xs">
        <div>
          <h4 className="font-semibold text-bio-300 mb-1">Nutrition &amp; Caloric Strategy</h4>
          <p className="text-slate-300 leading-relaxed">
            {bodyType.nutrition_focus || (isObese ? 'Moderate calorie deficit (15%), low GI foods, high fiber (>35g), 30g+ protein per meal.' : 'Nutrient dense meals, zero aggressive deficit, stress reduction & gut healing focus.')}
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-plasma-400 mb-1">Exercise &amp; Workout Pattern</h4>
          <p className="text-slate-300 leading-relaxed">
            {bodyType.exercise || (isObese ? 'Heavy resistance training 3x/week + 10,000 daily steps for GLUT4 muscle activation.' : 'Progressive strength training for lean muscle building & cortisol control. Avoid intense cardio.')}
          </p>
        </div>
      </div>
    </GlassCard>
  )
}

function PhenotypeProtocolBlock({ block }) {
  const meta = PHENOTYPE_META[block.phenotype] || PHENOTYPE_META.metabolic
  const meals = block.day_plan.meals
  return (
    <GlassCard className="overflow-hidden p-0 text-xs">
      <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.02] px-6 py-4">
        <span
          className="h-2.5 w-2.5 rounded-full shadow-glow"
          style={{ background: meta.color, boxShadow: `0 0 12px ${meta.color}` }}
        />
        <h3 className="font-display text-lg font-semibold text-white">{meta.label} PCOS</h3>
        <span className="text-slate-400">— {block.focus}</span>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-3">
        <InfoList title="Diet Strategy" items={block.diet_strategy} icon="leaf" />
        <InfoList title="Exercise & Training" items={block.exercise} icon="pulse" />
        <InfoList title="Why This Works" items={block.priorities} icon="target" />
      </div>

      <div className="grid gap-6 border-t border-white/5 p-6 lg:grid-cols-2">
        <div>
          <h4 className="mb-3 font-semibold uppercase tracking-wider text-bio-300">
            {block.regional_suggestions.region} Cuisine Suggestions
          </h4>
          <dl className="space-y-2.5">
            {Object.entries(block.regional_suggestions.suggestions).map(([k, v]) => (
              <div key={k}>
                <dt className="font-medium text-slate-400">{k}</dt>
                <dd className="text-slate-200 mt-0.5">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h4 className="mb-3 font-semibold uppercase tracking-wider text-plasma-400">
            {block.day_plan.diet_type} Day Meal Plan
          </h4>
          <dl className="space-y-2.5">
            {['Breakfast', 'Lunch', 'Dinner'].map((meal) =>
              meals[meal] ? (
                <div key={meal}>
                  <dt className="font-medium text-slate-400">{meal}</dt>
                  <dd className="text-slate-200 mt-0.5">{meals[meal]}</dd>
                </div>
              ) : null
            )}
          </dl>
        </div>
      </div>
    </GlassCard>
  )
}

function MitochondrialBlock({ block }) {
  const highPriority = block.recommended_priority === 'high'
  return (
    <GlassCard className={`overflow-hidden p-0 text-xs ${highPriority ? 'ring-1 ring-amber-400/40' : ''}`}>
      <div className="flex flex-wrap items-center gap-3 border-b border-white/10 bg-white/[0.02] px-6 py-4">
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-glow" />
        <h3 className="font-display text-lg font-semibold text-white">Mitochondrial &amp; Energy Support</h3>
        <span className={`chip ${highPriority ? '!border-amber-400/40 !text-amber-300' : ''}`}>
          {highPriority ? 'High Priority' : 'Foundational'}
        </span>
      </div>
      <p className="px-6 pt-4 text-slate-400">{block.note}</p>
      <div className="grid gap-6 p-6 lg:grid-cols-3">
        <InfoList title="Diet & Supplements" items={block.diet_strategy} icon="leaf" />
        <InfoList title="Movement Protocol" items={block.exercise} icon="pulse" />
        <InfoList title="Why This Works" items={block.priorities} icon="target" />
      </div>
    </GlassCard>
  )
}

function InfoList({ title, items, icon }) {
  return (
    <div>
      <h4 className="mb-3 font-semibold uppercase tracking-wider text-slate-400">{title}</h4>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-slate-300">
            <span className="text-bio-300">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SectionHeading({ eyebrow, title, desc }) {
  return (
    <div>
      <span className="chip">{eyebrow}</span>
      <h2 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">{title}</h2>
      <p className="mt-2 text-xs text-slate-400">{desc}</p>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-bio-300/30 border-t-bio-300" />
        <p className="text-xs text-slate-400">Scoring your phenotype &amp; generating multi-cuisine plan…</p>
      </div>
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <GlassCard className="max-w-md p-8 text-center text-xs">
        <p className="text-slate-300">{message}</p>
        <Link to="/assessment" className="btn-primary mt-6 inline-flex">Start Assessment</Link>
      </GlassCard>
    </div>
  )
}
