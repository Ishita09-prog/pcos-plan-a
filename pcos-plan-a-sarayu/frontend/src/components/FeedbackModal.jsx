import { useState } from 'react'
import GlassCard from './GlassCard.jsx'
import { submitFeedback } from '../lib/api.js'

export default function FeedbackModal({ isOpen, onClose }) {
  const [rating, setRating] = useState(5)
  const [category, setCategory] = useState('Website Layout & Experience')
  const [comments, setComments] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!comments.trim()) {
      setError('Please enter your feedback comments before submitting.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await submitFeedback({ rating, category, comments })
      setSubmitted(true)
    } catch (err) {
      setError('Failed to submit feedback. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <GlassCard className="w-full max-w-lg p-6 space-y-4 relative border-bio-300/40">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg"
        >
          ✕
        </button>

        <div>
          <span className="chip text-[11px]">Continuous Platform Improvement</span>
          <h3 className="font-display text-xl font-bold text-white mt-1">Website Feedback</h3>
          <p className="text-xs text-slate-400 mt-1">
            Help us improve our PCOS health platform layout, features, and clarity.
          </p>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="text-3xl text-bio-300">✨</div>
            <h4 className="font-display text-lg font-bold text-white">Thank you for your feedback!</h4>
            <p className="text-xs text-slate-300 max-w-xs mx-auto">
              Your suggestions have been recorded and will guide our ongoing platform updates.
            </p>
            <button type="button" onClick={onClose} className="btn-primary mt-4 text-xs">
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="field-label">Overall Rating</label>
              <div className="flex gap-2 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`h-9 w-9 rounded-xl border font-bold text-sm transition-all ${
                      rating >= star
                        ? 'border-bio-300 bg-bio-400/20 text-bio-200'
                        : 'border-white/10 text-slate-400 hover:border-white/25'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="field-label">Feedback Category</label>
              <select
                className="input-glass w-full"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Website Layout & Experience">Website Layout & Experience</option>
                <option value="Questionnaire Clarity">Questionnaire Clarity</option>
                <option value="Lab Report Parser">Lab Report Parser</option>
                <option value="Diet & Exercise Plans">Diet & Exercise Plans</option>
                <option value="Scientific Terms & Tooltips">Scientific Terms & Tooltips</option>
                <option value="Other Suggestions">Other Suggestions</option>
              </select>
            </div>

            <div>
              <label className="field-label">Your Feedback / Suggestions</label>
              <textarea
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Share your thoughts or ideas to make this platform better..."
                className="input-glass w-full text-xs"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-alert-500/30 bg-alert-500/10 p-2.5 text-xs text-alert-400">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="btn-ghost text-xs">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn-primary text-xs">
                {submitting ? 'Submitting…' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        )}
      </GlassCard>
    </div>
  )
}
