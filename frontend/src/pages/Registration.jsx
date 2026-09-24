import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import GlassCard from '../components/GlassCard.jsx'

const DIET_OPTIONS = [
  'South Indian',
  'North Indian',
  'Eggetarian',
  'Vegan',
  'Vegetarian',
  'Non-Vegetarian',
  'Keto',
  'Paleo',
  'Mediterranean',
  'Other'
]

export default function Registration() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    dob: '',
    age: '',
    dietPreference: 'South Indian',
  })

  // Calculate age from DOB
  useEffect(() => {
    if (formData.dob) {
      const birthDate = new Date(formData.dob)
      const today = new Date()
      let calculatedAge = today.getFullYear() - birthDate.getFullYear()
      const m = today.getMonth() - birthDate.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--
      }
      setFormData((prev) => ({ ...prev, age: calculatedAge >= 0 ? calculatedAge.toString() : '' }))
    } else {
      setFormData((prev) => ({ ...prev, age: '' }))
    }
  }, [formData.dob])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real app, send to backend here
    // Proceed to assessment
    navigate('/assessment')
  }

  return (
    <div className="relative mx-auto max-w-3xl px-6 py-20 pt-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-10">
          <span className="chip mx-auto mb-4">Step 1 · Registration</span>
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Tell us about yourself
          </h1>
          <p className="mt-3 text-sm text-slate-400 sm:text-base">
            Please fill in your personal details to begin the assessment.
          </p>
        </div>

        <GlassCard className="p-8 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-bio-400 focus:outline-none focus:ring-1 focus:ring-bio-400 transition-colors"
                  placeholder="Jane Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-bio-400 focus:outline-none focus:ring-1 focus:ring-bio-400 transition-colors"
                  placeholder="jane@example.com"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    required
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-bio-400 focus:outline-none focus:ring-1 focus:ring-bio-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Age (Calculated)</label>
                  <input
                    type="text"
                    name="age"
                    readOnly
                    value={formData.age}
                    className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-slate-400 cursor-not-allowed"
                    placeholder="Auto-calculated"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Dietary Preference</label>
                <select
                  name="dietPreference"
                  value={formData.dietPreference}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white focus:border-bio-400 focus:outline-none focus:ring-1 focus:ring-bio-400 transition-colors"
                >
                  {DIET_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Upload Patient Reports (Optional)</label>
                <div className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-center text-slate-400 border-dashed hover:bg-white/10 transition-colors">
                  <input
                    type="file"
                    className="hidden"
                    id="report-upload"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      if (e.target.files.length > 0) {
                        setFormData(prev => ({ ...prev, uploadStatus: 'Parsing...' }))
                        setTimeout(() => {
                          sessionStorage.setItem('mock_extracted_data', JSON.stringify({
                            total_testosterone: 52,
                            triglycerides: 160,
                            hdl: 45
                          }))
                          setFormData(prev => ({ ...prev, uploadStatus: 'Success: 3 values extracted!' }))
                        }, 1500)
                      }
                    }}
                  />
                  <label htmlFor="report-upload" className="cursor-pointer flex flex-col items-center">
                    <svg viewBox="0 0 24 24" className="mx-auto h-8 w-8 text-bio-300 mb-2" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {formData.uploadStatus ? (
                      <span className="font-medium text-bio-300">{formData.uploadStatus}</span>
                    ) : (
                      <>
                        <span className="font-medium text-bio-300">Click to upload</span> or drag and drop<br />
                        PDF, PNG, or JPG up to 10MB
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button type="submit" className="btn-primary w-full justify-center">
                Continue to Assessment
                <svg viewBox="0 0 24 24" className="h-4 w-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            
          </form>
        </GlassCard>
      </motion.div>
    </div>
  )
}
