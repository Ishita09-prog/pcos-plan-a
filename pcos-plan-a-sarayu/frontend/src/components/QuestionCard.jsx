import { motion } from 'framer-motion'

function NumberInput({ field, value, onChange }) {
  return (
    <div>
      <label className="field-label">
        {field.label} {field.unit && <span className="text-slate-500">({field.unit})</span>}
      </label>
      <input
        type="number"
        step={field.step ?? 'any'}
        min={field.min}
        max={field.max}
        className="input-glass"
        placeholder="Optional — leave blank if unknown"
        value={value ?? ''}
        onChange={(e) => onChange(field.key, e.target.value === '' ? '' : Number(e.target.value))}
      />
    </div>
  )
}

function YesNoInput({ field, value, onChange }) {
  return (
    <div>
      <label className="field-label">{field.label}</label>
      <div className="grid grid-cols-2 gap-2.5">
        {['yes', 'no'].map((opt) => (
          <button
            type="button"
            key={opt}
            className="tick-toggle"
            data-active={value === opt}
            onClick={() => onChange(field.key, opt)}
          >
            <span className="text-sm font-medium capitalize text-slate-200">{opt}</span>
            <span
              className={`h-4 w-4 rounded-full border transition-all ${
                value === opt ? 'border-bio-300 bg-bio-300 shadow-glow' : 'border-white/20'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

function SelectInput({ field, value, onChange }) {
  return (
    <div>
      <label className="field-label">{field.label}</label>
      <div className="flex flex-wrap gap-2">
        {field.options.map((opt) => (
          <button
            type="button"
            key={opt}
            onClick={() => onChange(field.key, opt)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
              value === opt
                ? 'border-bio-300/60 bg-bio-400/15 text-bio-100 shadow-glow'
                : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function ScaleInput({ field, value, onChange }) {
  const v = value === '' || value === undefined ? field.min : Number(value)
  return (
    <div>
      <div className="field-label flex items-center justify-between">
        <span>{field.label}</span>
        <span className="font-mono text-bio-300">{value === '' || value === undefined ? '—' : v}</span>
      </div>
      <input
        type="range"
        min={field.min}
        max={field.max}
        value={v}
        onChange={(e) => onChange(field.key, Number(e.target.value))}
        className="w-full accent-bio-400"
      />
      <div className="mt-1 flex justify-between text-xs text-slate-500">
        <span>{field.min}</span>
        <span>{field.max}</span>
      </div>
    </div>
  )
}

function TextInput({ field, value, onChange }) {
  return (
    <div>
      <label className="field-label">{field.label}</label>
      <input
        type="text"
        className="input-glass"
        value={value ?? ''}
        onChange={(e) => onChange(field.key, e.target.value)}
      />
    </div>
  )
}

function FieldRenderer({ field, value, onChange }) {
  if (field.type === 'number') return <NumberInput field={field} value={value} onChange={onChange} />
  if (field.type === 'yesno') return <YesNoInput field={field} value={value} onChange={onChange} />
  if (field.type === 'select') return <SelectInput field={field} value={value} onChange={onChange} />
  if (field.type === 'scale') return <ScaleInput field={field} value={value} onChange={onChange} />
  return <TextInput field={field} value={value} onChange={onChange} />
}

const CATEGORY_STYLE = {
  'Clinical Evaluation': 'text-bio-300 border-bio-300/30 bg-bio-400/10',
  'Biochemical Evaluation': 'text-plasma-400 border-plasma-400/30 bg-plasma-500/10',
  'Root Cause Analysis': 'text-amber-300 border-amber-300/30 bg-amber-400/10',
}

const EXPLANATION_MAP = {
  acanthosis_nigricans: {
    statement: 'Dark, velvety skin patches on the back of your neck or underarms caused by elevated insulin levels.',
    icon: '🔍',
  },
  hirsutism_severity: {
    statement: 'Unwanted coarse hair growth on the upper lip, chin, chest, or stomach due to excess male hormones.',
    icon: '✨',
  },
  fasting_insulin: {
    statement: 'Measures sugar-regulating insulin. High levels (>10 µIU/mL) show your body works extra hard to handle carbs.',
    icon: '🩸',
  },
  dhea_s: {
    statement: 'Adrenal stress hormone produced by your stress glands during chronic physical or emotional strain.',
    icon: '🌿',
  },
  hs_crp: {
    statement: 'Body inflammation marker showing hidden swelling or immune irritation in your tissues and gut.',
    icon: '🔥',
  },
  shbg: {
    statement: 'Hormone carrier protein. When low (<30 nmol/L), excess male hormones remain active, causing breakouts.',
    icon: '🛡️',
  },
  gut_health_issue: {
    statement: 'Frequent stomach bloating, acid reflux, or food sensitivities linked to gut lining inflammation.',
    icon: '🥑',
  },
  mitochondrial_fatigue: {
    statement: 'Persistent low energy or heavy afternoon crashes despite getting a full night of sleep.',
    icon: '⚡',
  },
  mitochondrial_apnea: {
    statement: 'Snoring, night gasping, or waking up breathless during sleep cycles.',
    icon: '😴',
  },
}

export default function QuestionCard({ question, index, answers, onChange, carriedOver }) {
  const matchingKey = question.fields.find((f) => EXPLANATION_MAP[f.key])?.key
  const explanation = matchingKey ? EXPLANATION_MAP[matchingKey] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.03 }}
    >
      <div className="glass rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/5 font-mono text-[11px] text-slate-400">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="font-display text-sm font-semibold text-slate-100 sm:text-base">{question.label}</h3>
          </div>
          <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${CATEGORY_STYLE[question.category] || ''}`}>
            {question.category}
          </span>
        </div>

        {/* Plain Statement Explanation & Visual Reference */}
        {explanation && (
          <div className="rounded-xl border border-bio-300/30 bg-bio-400/10 p-3 text-xs flex items-start gap-2.5">
            <span className="text-base shrink-0">{explanation.icon}</span>
            <div className="text-slate-200">
              <strong className="text-bio-200 font-semibold">In Plain Statements:</strong> {explanation.statement}
            </div>
          </div>
        )}

        {question.reference && (
          <div className="field-ref text-[11px] text-slate-400">Reference: {question.reference}</div>
        )}

        {carriedOver ? (
          <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-400">
            Already answered in an earlier section — reused here automatically.
          </div>
        ) : (
          <div className={`grid gap-4 ${question.fields.length > 1 ? 'sm:grid-cols-2' : ''}`}>
            {question.fields.map((field) => (
              <FieldRenderer
                key={field.key}
                field={field}
                value={answers[field.key]}
                onChange={onChange}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
