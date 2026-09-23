import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GlassCard from '../components/GlassCard.jsx'

export default function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(() => {
    const saved = sessionStorage.getItem('pcos_patient_registration')
    return saved
      ? JSON.parse(saved)
      : {
          full_name: '',
          email: '',
          phone: '',
          date_of_birth: '',
          age: '',
          height_cm: '',
          weight_kg: '',
          region_preference: 'South Indian',
          marital_status: 'Single',
          occupation: '',
          work_shift: 'Regular Day Shift',
          diet_type: 'Eggetarian',
          menarche_age: '',
          typical_cycle_days: '35+',
          pcos_diagnosed: 'Unsure / Seeking Diagnosis',
          medical_notes: '',
        }
  })

  const [savedSuccess, setSavedSuccess] = useState(false)

  // Live BMI calculation
  const bmiCalculation = useMemo(() => {
    const h = parseFloat(formData.height_cm) / 100
    const w = parseFloat(formData.weight_kg)
    if (h > 0 && w > 0) {
      const bmi = (w / (h * h)).toFixed(1)
      let category = 'Normal Weight'
      let phenotypeStyle = 'Lean PCOS Profile'
      if (bmi < 18.5) {
        category = 'Underweight'
        phenotypeStyle = 'Lean PCOS Profile'
      } else if (bmi >= 25.0) {
        category = 'Overweight / Elevated BMI'
        phenotypeStyle = 'Classical Metabolic PCOS Profile'
      } else if (bmi >= 23.0) {
        category = 'Overweight (Asian Cutoff)'
        phenotypeStyle = 'Metabolic Risk Profile'
      }
      return { bmi, category, phenotypeStyle }
    }
    return null
  }, [formData.height_cm, formData.weight_kg])

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value }
      if (field === 'date_of_birth' && value) {
        const birthYear = new Date(value).getFullYear()
        const currentYear = new Date().getFullYear()
        if (birthYear > 1900 && birthYear <= currentYear) {
          updated.age = currentYear - birthYear
        }
      }
      return updated
    })
  }

  const handleAutoFeedSampleData = () => {
    const sample = {
      full_name: 'Ananya Sharma',
      email: 'ananya.sharma@example.com',
      phone: '+91 98765 43210',
      date_of_birth: '2003-05-14',
      age: 22,
      height_cm: 160,
      weight_kg: 68,
      region_preference: 'South Indian',
      marital_status: 'Single',
      occupation: 'Student / Software Engineer',
      work_shift: 'Regular Day Shift',
      diet_type: 'Eggetarian',
      menarche_age: 13,
      typical_cycle_days: '35-60',
      pcos_diagnosed: 'Confirmed by Gynecologist',
      medical_notes: 'Experiencing irregular periods, mild acne, and afternoon fatigue crashes.',
    }
    setFormData(sample)
    sessionStorage.setItem('pcos_patient_registration', JSON.stringify(sample))
  }

  const handleSaveAndProceed = (e) => {
    e.preventDefault()
    sessionStorage.setItem('pcos_patient_registration', JSON.stringify(formData))
    setSavedSuccess(true)
    setTimeout(() => {
      navigate('/assessment')
    }, 600)
  }

  return (
    <div className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center items-center gap-3">
            <span className="chip shadow-glow">
              <span className="h-2 w-2 rounded-full bg-bio-300 animate-pulse" />
              Patient Profile Registration · Step 1
            </span>
            <button
              type="button"
              onClick={handleAutoFeedSampleData}
              className="btn-ghost !px-3 !py-1 text-xs text-bio-200 border-bio-300/30 hover:bg-bio-400/10"
              title="Fills form with sample patient profile automatically"
            >
              ⚡ Auto-Feed Sample System Data
            </button>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-white sm:text-5xl">
            Patient Profile &amp; Registration
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-slate-300">
            Fill in your personal details or click &quot;Auto-Feed Sample System Data&quot; to populate your profile automatically.
          </p>
        </div>

        <form onSubmit={handleSaveAndProceed} className="space-y-6">
          {/* Personal Information */}
          <GlassCard className="p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <span className="text-xl">👤</span>
              <h2 className="font-display text-lg font-bold text-white">1. Personal &amp; Contact Details</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div>
                <label className="field-label">Full Name *</label>
                <input
                  type="text"
                  required
                  className="input-glass"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  placeholder="e.g. Ananya Sharma"
                />
              </div>

              <div>
                <label className="field-label">Email Address *</label>
                <input
                  type="email"
                  required
                  className="input-glass"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="ananya@example.com"
                />
              </div>

              <div>
                <label className="field-label">Phone / WhatsApp Number</label>
                <input
                  type="tel"
                  className="input-glass"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="field-label">Date of Birth (Auto-Calculates Age)</label>
                <input
                  type="date"
                  className="input-glass"
                  value={formData.date_of_birth}
                  onChange={(e) => handleChange('date_of_birth', e.target.value)}
                />
              </div>

              <div>
                <label className="field-label">Age (Years) — Manual entry if DOB blank</label>
                <input
                  type="number"
                  className="input-glass font-bold text-bio-200"
                  value={formData.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  placeholder="e.g. 22"
                />
              </div>
            </div>
          </GlassCard>

          {/* Physical Measurements & Body Mass Index */}
          <GlassCard className="p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚖️</span>
                <h2 className="font-display text-lg font-bold text-white">2. Physical Parameters &amp; BMI</h2>
              </div>
              <span className="text-[10px] text-slate-400">Auto-calculated</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div>
                <label className="field-label">Height (in cm)</label>
                <input
                  type="number"
                  step="0.5"
                  className="input-glass"
                  value={formData.height_cm}
                  onChange={(e) => handleChange('height_cm', e.target.value)}
                  placeholder="e.g. 162"
                />
              </div>

              <div>
                <label className="field-label">Weight (in kg)</label>
                <input
                  type="number"
                  step="0.5"
                  className="input-glass"
                  value={formData.weight_kg}
                  onChange={(e) => handleChange('weight_kg', e.target.value)}
                  placeholder="e.g. 64"
                />
              </div>
            </div>

            {bmiCalculation && (
              <div className="rounded-2xl border border-bio-300/30 bg-bio-400/10 p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Calculated Body Mass Index (BMI):</span>
                  <span className="ml-2 font-display text-xl font-bold text-white">{bmiCalculation.bmi} kg/m²</span>
                </div>
                <div className="flex gap-2">
                  <span className="chip !text-bio-200">{bmiCalculation.category}</span>
                  <span className="chip !text-amber-200">{bmiCalculation.phenotypeStyle}</span>
                </div>
              </div>
            )}
          </GlassCard>

          {/* Location, Lifestyle & Cuisines */}
          <GlassCard className="p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <span className="text-xl">🥗</span>
              <h2 className="font-display text-lg font-bold text-white">3. Regional Cuisines &amp; Diet Preference</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div>
                <label className="field-label">Cuisine Preference (All Regional &amp; Global Cuisines)</label>
                <select
                  className="input-glass font-semibold text-bio-200"
                  value={formData.region_preference}
                  onChange={(e) => handleChange('region_preference', e.target.value)}
                >
                  <option value="South Indian">South Indian (Idli, Dosa, Sambar, Curd Rice)</option>
                  <option value="North Indian">North Indian (Roti, Dal Makhani, Paneer, Chole)</option>
                  <option value="East Indian">East Indian (Rice, Fish curry, Dal, Posto)</option>
                  <option value="West Indian">West Indian (Poha, Gujarati Thali, Maharashtrian)</option>
                  <option value="Eggetarian">🥚 Eggetarian (Includes Eggs, Dairy & Veg)</option>
                  <option value="Vegetarian">🌱 Vegetarian (Plant-based + Dairy)</option>
                  <option value="Non-Vegetarian">🍗 Non-Vegetarian (Poultry & Fish)</option>
                  <option value="Vegan">🌿 Vegan (Strictly Plant-Based)</option>
                  <option value="Continental">Continental (Oats, Eggs, Salads, Whole wheat)</option>
                  <option value="Mediterranean">Mediterranean (Olive oil, Quinoa, Beans, Hummus)</option>
                  <option value="Asian">Asian (Stir fry, Tofu, Rice noodles, Edamame)</option>
                  <option value="Middle Eastern">Middle Eastern (Falafel, Lentils, Pita)</option>
                  <option value="Fusion / Global">Fusion / Global Multi-Cuisine</option>
                </select>
              </div>

              <div>
                <label className="field-label">Dietary Preference Type</label>
                <select
                  className="input-glass font-semibold text-bio-200"
                  value={formData.diet_type}
                  onChange={(e) => handleChange('diet_type', e.target.value)}
                >
                  <option value="Eggetarian">🥚 Eggetarian (Includes Eggs &amp; Dairy)</option>
                  <option value="Vegetarian">🌱 Vegetarian (Plant-based + Dairy)</option>
                  <option value="Non-Vegetarian">🍗 Non-Vegetarian (Includes Poultry/Fish)</option>
                  <option value="Vegan">🌿 Vegan (Strictly Plant-Based)</option>
                </select>
              </div>

              <div>
                <label className="field-label">Occupation &amp; Activity</label>
                <input
                  type="text"
                  className="input-glass"
                  value={formData.occupation}
                  onChange={(e) => handleChange('occupation', e.target.value)}
                  placeholder="e.g. IT Professional / Student / Homemaker"
                />
              </div>

              <div>
                <label className="field-label">Work Shift Pattern</label>
                <select
                  className="input-glass"
                  value={formData.work_shift}
                  onChange={(e) => handleChange('work_shift', e.target.value)}
                >
                  <option value="Regular Day Shift">Regular Day Shift</option>
                  <option value="Night Shift / Rotational">Night Shift / Rotational</option>
                  <option value="Flexible / Freelance">Flexible / Remote</option>
                </select>
              </div>
            </div>
          </GlassCard>

          {/* Menstrual History & Medical Notes */}
          <GlassCard className="p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <span className="text-xl">🌸</span>
              <h2 className="font-display text-lg font-bold text-white">4. Menstrual Background &amp; Medical Notes</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div>
                <label className="field-label">Age at First Period (Menarche)</label>
                <input
                  type="number"
                  className="input-glass"
                  value={formData.menarche_age}
                  onChange={(e) => handleChange('menarche_age', e.target.value)}
                  placeholder="e.g. 13"
                />
              </div>

              <div>
                <label className="field-label">Typical Cycle Length (Days)</label>
                <select
                  className="input-glass"
                  value={formData.typical_cycle_days}
                  onChange={(e) => handleChange('typical_cycle_days', e.target.value)}
                >
                  <option value="21-35">21 – 35 Days (Regular)</option>
                  <option value="35-60">35 – 60 Days (Delayed)</option>
                  <option value="60+">60+ Days (Severe Delay)</option>
                  <option value="Absent">Absent / Amenorrhea (&gt;3 months)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="field-label">PCOS Diagnosis Status</label>
                <select
                  className="input-glass"
                  value={formData.pcos_diagnosed}
                  onChange={(e) => handleChange('pcos_diagnosed', e.target.value)}
                >
                  <option value="Unsure / Seeking Diagnosis">Unsure / Seeking Diagnosis</option>
                  <option value="Confirmed by Gynecologist">Confirmed by Doctor / Ultrasound</option>
                  <option value="Self-Suspected Symptoms">Self-Suspected based on symptoms</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="field-label">Medical History / Personal Notes (Optional)</label>
                <textarea
                  rows={3}
                  className="input-glass w-full"
                  value={formData.medical_notes}
                  onChange={(e) => handleChange('medical_notes', e.target.value)}
                  placeholder="Mention any past medications, birth control history, thyroid issues, or specific health concerns..."
                />
              </div>
            </div>
          </GlassCard>

          {/* Submission Button */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-ghost text-xs"
            >
              ← Back to Home
            </button>

            <button
              type="submit"
              className="btn-primary !px-8 !py-4 text-sm font-bold shadow-glow flex items-center gap-2"
            >
              <span>{savedSuccess ? 'Saved! Redirecting...' : 'Save Profile & Proceed to Assessment →'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
