import GlassCard from './GlassCard.jsx'

const RECOMMENDED_TESTS = [
  {
    name: 'Fasting Serum Insulin & HOMA-IR',
    why: 'General consultations frequently only test Fasting Blood Sugar, missing early hyperinsulinemia.',
    clinical: 'Uncovers hidden insulin resistance even when blood sugar numbers appear normal.',
    icon: '⚡',
  },
  {
    name: 'DHEA-S (Dehydroepiandrosterone Sulfate)',
    why: 'Often omitted during basic gynecological panels focused solely on ovarian testosterone.',
    clinical: 'Identifies HPA-axis stress driving Adrenal PCOS.',
    icon: '🧠',
  },
  {
    name: 'hs-CRP (High-Sensitivity C-Reactive Protein)',
    why: 'Rarely included in routine hormonal workups.',
    clinical: 'Detects systemic low-grade vascular & tissue inflammation.',
    icon: '🔥',
  },
  {
    name: 'Sex Hormone-Binding Globulin (SHBG)',
    why: 'Total testosterone can look falsely normal if SHBG protein is depleted.',
    clinical: 'Calculates active free bioavailable testosterone level.',
    icon: '🧪',
  },
  {
    name: 'Serum 25-OH Vitamin D3',
    why: 'Considered a lifestyle nutrient rather than a core hormonal regulator.',
    clinical: 'Vitamin D deficiency worsens both insulin resistance and menstrual irregularity.',
    icon: '☀️',
  },
]

export default function RecommendedTests() {
  return (
    <GlassCard className="p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <span className="chip text-[11px] font-semibold text-bio-200">Doctor Recommendation Slot</span>
          <h3 className="font-display text-lg font-bold text-white mt-1">
            Crucial PCOS Blood Tests Frequently Neglected by General Practitioners
          </h3>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {RECOMMENDED_TESTS.map((test) => (
          <div
            key={test.name}
            className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 space-y-2 hover:border-bio-300/40 transition-all"
          >
            <div className="flex items-center gap-2 font-display text-sm font-semibold text-bio-200">
              <span className="text-base">{test.icon}</span>
              <span>{test.name}</span>
            </div>
            <div className="text-xs text-amber-300/90 font-medium">
              <span className="text-amber-400 font-semibold">Why Neglected: </span>
              {test.why}
            </div>
            <div className="text-xs text-slate-300">
              <span className="text-slate-400 font-semibold">Root Cause Insight: </span>
              {test.clinical}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
