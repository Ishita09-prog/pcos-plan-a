import { useState } from 'react'

const MEDICAL_GLOSSARY = {
  'HOMA-IR': 'Insulin Resistance Index. In plain English: A test showing if your body makes extra insulin to process blood sugar. A score > 2.0 indicates insulin resistance.',
  'DHEA-S': 'Adrenal Stress Hormone. In plain English: A hormone made by your stress glands (adrenals) when under chronic physical or mental stress.',
  'hs-CRP': 'Body Inflammation Marker. In plain English: Measures hidden swelling or irritation in your body and gut.',
  'LH:FSH Ratio': 'Ovulation Hormone Balance. In plain English: Shows if hormone signals to your ovaries are balanced. A 2:1 ratio causes missed or irregular periods.',
  'Acanthosis Nigricans': 'Dark Skin Patches. In plain English: Dark, velvety skin patches on the neck or underarms caused by elevated insulin levels.',
  'Rotterdam Criteria': 'Standard 3-Point PCOS Diagnostic Check. In plain English: The official medical guidelines requiring at least 2 of 3 features (high testosterone, irregular periods, polycystic ovaries) to confirm PCOS.',
  'SHBG': 'Hormone Carrier Protein. In plain English: A protein that holds male hormones in check. When low, excess free testosterone causes acne and hair growth.',
  'Fasting Insulin': 'Sugar-Control Hormone. In plain English: Measures how hard your pancreas works while resting. Optimal level is under 10 µIU/mL.',
  'Triglyceride/HDL Ratio': 'Blood Fat Ratio. In plain English: Compares stored blood fats to good protective cholesterol to spot early metabolic strain.',
  'Post-Exertional Malaise': 'Crash After Exertion. In plain English: Extreme fatigue or physical weakness occurring 12-48 hours after exercise or high activity.',
  'Hyperandrogenism': 'Excess Male Hormones. In plain English: Elevated male hormones leading to facial hair, acne, or scalp hair thinning.',
  'Ovulatory Dysfunction': 'Irregular Ovulation. In plain English: Having irregular, delayed, or missed periods (fewer than 9 per year).',
}

export default function MedicalTermTooltip({ term, children }) {
  const [isOpen, setIsOpen] = useState(false)
  const explanation = MEDICAL_GLOSSARY[term] || 'Medical biomarker / clinical term used in PCOS diagnostic assessment.'

  return (
    <span className="relative inline-block font-medium">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="inline-flex items-center gap-1 rounded border-b border-dashed border-bio-300/80 text-bio-200 hover:text-white transition-colors px-0.5"
      >
        {children || term}
        <span className="text-[10px] font-bold text-bio-300">ⓘ</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-1/2 z-50 mb-2 w-64 -translate-x-1/2 rounded-xl border border-bio-300/30 bg-slate-900/95 p-3 text-xs text-slate-200 shadow-2xl backdrop-blur-md">
          <div className="font-semibold text-bio-300 mb-1 flex items-center justify-between">
            <span>{term}</span>
            <span className="text-[10px] text-slate-400">Glossary</span>
          </div>
          <p className="leading-relaxed text-slate-300">{explanation}</p>
          <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </span>
  )
}
