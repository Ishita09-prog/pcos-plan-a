import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import GlassCard from '../components/GlassCard.jsx'
import { questionnaire } from '../lib/ruleEngine.js'
import { extractReportData } from '../lib/reportExtractor.js'

// Everything except region/diet (rendered as their own labelled pickers
// below) comes straight from questionnaire.json, so this page stays in sync
// automatically if a field is added/removed there.
const CONTEXT_FIELDS = questionnaire.demographics.filter(
  (f) => !['region_preference', 'diet_type'].includes(f.id)
)

export default function Registration() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    dob: '',
    age: '',
    region_preference: 'South Indian',
    diet_type: 'Vegetarian',
  })
  const [uploadStatus, setUploadStatus] = useState(null)
  const [uploadError, setUploadError] = useState(null)

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

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setUploadStatus('Reading report locally in your browser…')
    try {
      const flagged = await extractReportData(file)
      sessionStorage.setItem('pcos_extracted_report', JSON.stringify(flagged))
      const count = Object.keys(flagged).length
      setUploadStatus(`${count} value${count === 1 ? '' : 's'} found and pre-filled — nothing left this browser.`)
    } catch (err) {
      setUploadStatus(null)
      setUploadError(err.message || 'Could not read this file.')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Everything here stays on-device (sessionStorage) and is read by the
    // Questionnaire/Results pages -- nothing is sent anywhere until the
    // person submits the assessment itself.
    sessionStorage.setItem('pcos_registration', JSON.stringify(formData))
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
            Please fill in your personal details to begin the assessment. This stays in your
            browser and is used only to personalise your results.
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

              {CONTEXT_FIELDS.map((f) => (
                <div key={f.id}>
                  <label className="block text-sm font-medium text-slate-300 mb-1">{f.label}</label>
                  {f.type === 'select' ? (
                    <select
                      name={f.id}
                      value={formData[f.id] ?? ''}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white focus:border-bio-400 focus:outline-none focus:ring-1 focus:ring-bio-400 transition-colors"
                    >
                      <option value="" disabled>Select…</option>
                      {f.options.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text'}
                      name={f.id}
                      value={formData[f.id] ?? ''}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-bio-400 focus:outline-none focus:ring-1 focus:ring-bio-400 transition-colors"
                    />
                  )}
                </div>
              ))}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Regional cuisine</label>
                  <select
                    name="region_preference"
                    value={formData.region_preference}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white focus:border-bio-400 focus:outline-none focus:ring-1 focus:ring-bio-400 transition-colors"
                  >
                    <option value="South Indian">South Indian</option>
                    <option value="North Indian">North Indian</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Diet type</label>
                  <select
                    name="diet_type"
                    value={formData.diet_type}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white focus:border-bio-400 focus:outline-none focus:ring-1 focus:ring-bio-400 transition-colors"
                  >
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Eggetarian">Eggetarian</option>
                    <option value="Non-Vegetarian">Non-Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Upload a Lab Report (Optional)</label>
                <div className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-center text-slate-400 border-dashed hover:bg-white/10 transition-colors">
                  <input
                    type="file"
                    className="hidden"
                    id="report-upload"
                    accept=".pdf"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="report-upload" className="cursor-pointer flex flex-col items-center">
                    <svg viewBox="0 0 24 24" className="mx-auto h-8 w-8 text-bio-300 mb-2" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {uploadStatus ? (
                      <span className="font-medium text-bio-300">{uploadStatus}</span>
                    ) : (
                      <>
                        <span className="font-medium text-bio-300">Click to upload</span> a PDF lab report<br />
                        Parsed entirely in your browser — nothing is uploaded anywhere
                      </>
                    )}
                  </label>
                </div>
                {uploadError && (
                  <p className="mt-2 text-xs text-alert-400">{uploadError}</p>
                )}
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
