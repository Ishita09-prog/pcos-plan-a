import { motion } from 'framer-motion'
import { useState } from 'react'
import GlassCard from '../components/GlassCard.jsx'
import MedicalTermTooltip from '../components/MedicalTermTooltip.jsx'

const RECOMMENDED_DOCTOR_TESTS = [
  {
    id: 'fasting_insulin',
    name: 'Fasting Serum Insulin & HOMA-IR Index',
    plainName: 'Insulin Resistance & Sugar-Control Test',
    whyNeglected: 'General doctors often order only Fasting Blood Glucose, which stays normal for years while insulin levels climb dangerously high.',
    whyCrucial: 'Uncovers hidden insulin resistance early before prediabetes develops, pointing directly to Metabolic PCOS.',
    normalRange: 'Fasting Insulin < 10 µIU/mL | HOMA-IR < 2.0',
    category: 'Metabolic Marker',
  },
  {
    id: 'dhea_s',
    name: 'DHEA-S (Dehydroepiandrosterone Sulfate)',
    plainName: 'Adrenal Stress Hormone Test',
    whyNeglected: 'Routine blood panels usually check only ovarian testosterone, missing stress-driven adrenal hormones.',
    whyCrucial: 'Identifies Adrenal PCOS triggered by chronic nervous system stress and HPA-axis activation.',
    normalRange: '100 – 350 µg/dL (Values > 350 trigger Adrenal PCOS)',
    category: 'Adrenal / Stress Marker',
  },
  {
    id: 'hs_crp',
    name: 'High-Sensitivity C-Reactive Protein (hs-CRP)',
    plainName: 'Body & Gut Inflammation Check',
    whyNeglected: 'Inflammation markers are rarely included in standard reproductive hormone workups.',
    whyCrucial: 'Detects low-grade tissue and gut mucosal swelling that damages ovarian follicle health.',
    normalRange: '< 1.0 mg/L (Values > 3.0 indicate Inflammatory PCOS)',
    category: 'Inflammation Marker',
  },
  {
    id: 'shbg',
    name: 'Sex Hormone-Binding Globulin (SHBG)',
    plainName: 'Free Active Hormone Carrier Check',
    whyNeglected: 'Doctors often measure only Total Testosterone, which can look deceptively normal if SHBG is low.',
    whyCrucial: 'Allows calculation of Free Bioavailable Testosterone—the actual active hormone causing acne and facial hair.',
    normalRange: '30 – 100 nmol/L (Values < 30 nmol/L mean higher active male hormones)',
    category: 'Hormonal Carrier',
  },
  {
    id: 'vitamin_d3',
    name: 'Serum 25-OH Vitamin D3',
    plainName: 'Sunlight & Hormone Co-factor Test',
    whyNeglected: 'Often treated as a general lifestyle nutrient rather than a critical endocrine regulator.',
    whyCrucial: 'Vitamin D deficiency (< 20 ng/mL) severely worsens insulin resistance, menstrual delays, and tiredness.',
    normalRange: '30 – 100 ng/mL (Optimal for PCOS > 40 ng/mL)',
    category: 'Nutritional Co-factor',
  },
  {
    id: '17_ohp',
    name: '17-OH Progesterone (17-OHP)',
    plainName: 'Adrenal Hyperplasia Exclusion Check',
    whyNeglected: 'Often skipped unless specifically requested for differential diagnostic ruling.',
    whyCrucial: 'Rules out Non-Classic Congenital Adrenal Hyperplasia (NCAH), a genetic condition that mimics PCOS.',
    normalRange: '< 200 ng/dL (Fasting morning sample)',
    category: 'Differential Exclusion',
  },
  {
    id: 'thyroid_prolactin',
    name: 'TSH & Serum Prolactin Profile',
    plainName: 'Thyroid & Pituitary Gland Rule-Out',
    whyNeglected: 'Must be tested upfront to prevent misdiagnosing thyroid sluggishness as PCOS.',
    whyCrucial: 'Excludes primary hypothyroidism and elevated prolactin, ensuring accurate phenotype treatment.',
    normalRange: 'TSH: 0.4 – 4.0 µIU/mL | Prolactin: < 25 ng/mL',
    category: 'Differential Exclusion',
  },
]

export default function DoctorTests() {
  const [copied, setCopied] = useState(false)

  const handleCopyChecklist = () => {
    const text = `DOCTOR DISCUSSION CHECKLIST - RECOMMENDED PCOS BLOOD TESTS\n` +
      `--------------------------------------------------\n` +
      RECOMMENDED_DOCTOR_TESTS.map(
        (t, i) => `${i + 1}. ${t.name} (${t.plainName})\n   • Why needed: ${t.whyCrucial}\n   • Target: ${t.normalRange}`
      ).join('\n\n') +
      `\n--------------------------------------------------\nRequested via HelixDx PCOS Health Platform`

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4 max-w-3xl mx-auto"
      >
        <span className="chip mx-auto shadow-glow">
          <span className="h-2 w-2 rounded-full bg-bio-300 animate-pulse" />
          Patient Advocacy &amp; Diagnostic Guidance
        </span>

        <h1 className="font-display text-3xl font-extrabold text-white sm:text-5xl">
          Doctor-Recommended PCOS Blood Tests
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          Many patients spend years with unresolved PCOS symptoms because standard lab panels omit key root-cause markers. Here are the critical blood tests generally neglected by routine checkups that help identify your exact phenotype.
        </p>

        <div className="pt-2 flex justify-center">
          <button
            type="button"
            onClick={handleCopyChecklist}
            className="btn-primary !px-6 !py-3 text-xs font-bold shadow-glow flex items-center gap-2"
          >
            <span>{copied ? '✓ Checklist Copied to Clipboard!' : '📋 Copy Doctor Visit Discussion Checklist'}</span>
          </button>
        </div>
      </motion.div>

      {/* Cards List */}
      <div className="grid gap-6 sm:grid-cols-2">
        {RECOMMENDED_DOCTOR_TESTS.map((test) => (
          <GlassCard key={test.id} className="p-6 space-y-4 flex flex-col justify-between border-white/10 hover:border-bio-300/40 transition-all">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="chip text-[10px] !text-bio-200">{test.category}</span>
                <span className="text-xs text-slate-400 font-mono">Ref: {test.normalRange}</span>
              </div>

              <div>
                <h3 className="font-display text-lg font-bold text-white">
                  <MedicalTermTooltip term={test.name.split(' ')[0]}>
                    {test.name}
                  </MedicalTermTooltip>
                </h3>
                <p className="text-xs font-semibold text-bio-300 mt-0.5">
                  💡 In Plain English: {test.plainName}
                </p>
              </div>

              <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs space-y-1">
                <div className="font-semibold text-amber-300">⚠️ Why Doctors Commonly Neglect This Test:</div>
                <p className="text-slate-300 text-[11px] leading-relaxed">{test.whyNeglected}</p>
              </div>

              <div className="rounded-xl border border-bio-300/30 bg-bio-400/10 p-3 text-xs space-y-1">
                <div className="font-semibold text-bio-200">🔍 Why It Is Crucial for Root Cause:</div>
                <p className="text-slate-300 text-[11px] leading-relaxed">{test.whyCrucial}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Printable / Downloadable Banner */}
      <GlassCard strong className="p-8 text-center space-y-4">
        <h2 className="font-display text-2xl font-bold text-white">
          Take Control of Your Medical Appointments
        </h2>
        <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
          Show this list to your endocrinologist or gynecologist. Requesting these specific biomarkers provides the complete picture needed to pinpoint whether your PCOS is Metabolic, Adrenal, Inflammatory, or Hormonal.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={handleCopyChecklist}
            className="btn-primary !px-6 !py-3 text-xs font-bold shadow-glow"
          >
            {copied ? '✓ Checklist Copied!' : '📋 Copy List to Take to Doctor'}
          </button>
          <a
            href="/assessment"
            className="btn-ghost !px-6 !py-3 text-xs font-semibold"
          >
            ⚡ Start Assessment with Uploaded Tests →
          </a>
        </div>
      </GlassCard>
    </div>
  )
}
