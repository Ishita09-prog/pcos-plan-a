import { useState } from 'react'
import GlassCard from './GlassCard.jsx'
import { askChatbot } from '../lib/api.js'

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your AI PCOS Health Assistant. You can ask me questions about Rotterdam criteria, root cause phenotypes, lab report values, or customized diet and exercise strategies.',
      disclaimer: 'Privacy Notice: I provide evidence-based educational insights grounded in clinical literature (Springer PCOS 10.1007/978-981-96-2120-0), but I do NOT diagnose patient symptoms directly.',
    },
  ])
  const [loading, setLoading] = useState(false)

  async function handleSend(e) {
    e?.preventDefault()
    if (!query.trim() || loading) return

    const userText = query.trim()
    setQuery('')
    setMessages((prev) => [...prev, { sender: 'user', text: userText }])
    setLoading(true)

    try {
      const response = await askChatbot(userText)
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: response.response,
          topic: response.topic,
          disclaimer: response.disclaimer,
          reference: response.reference,
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'PCOS is an endocrine state driven by 4 primary root-cause phenotypes: Metabolic, Hormonal, Adrenal, and Inflammatory. Management focuses on targeted nutrition and stress reduction.',
          disclaimer: 'Educational insights only. Please consult your physician.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="btn-primary flex items-center gap-2 shadow-2xl !py-3 !px-4 hover:scale-105 transition-transform"
        >
          <span className="text-base">🤖</span>
          <span className="font-display text-xs font-semibold">PCOS AI Assistant</span>
        </button>
      )}

      {isOpen && (
        <GlassCard className="w-80 sm:w-96 p-4 shadow-2xl border-bio-300/40 flex flex-col h-[480px]">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-bio-400/20 border border-bio-300/40 flex items-center justify-center text-bio-200">
                🤖
              </div>
              <div>
                <h4 className="font-display text-sm font-bold text-white">PCOS AI Assistant</h4>
                <p className="text-[10px] text-bio-300">Educational & Literature Guidance</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white text-base px-1"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 py-3 px-1 text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 ${
                    msg.sender === 'user'
                      ? 'bg-bio-400/20 border border-bio-300/30 text-white rounded-tr-none'
                      : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {msg.topic && (
                    <div className="text-[10px] font-semibold text-bio-300 uppercase tracking-wider mb-1">
                      {msg.topic}
                    </div>
                  )}
                  <p className="leading-relaxed">{msg.text}</p>
                  {msg.disclaimer && (
                    <div className="mt-2 text-[9px] text-slate-400 border-t border-white/10 pt-1 font-sans">
                      🔒 {msg.disclaimer}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-slate-400 text-xs italic flex items-center gap-1">
                <span>🤖 Thinking…</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="pt-2 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about diet, lab values, or Rotterdam criteria..."
              className="input-glass flex-1 text-xs !py-1.5"
            />
            <button type="submit" disabled={loading || !query.trim()} className="btn-primary !py-1.5 !px-3 text-xs">
              Send
            </button>
          </form>
        </GlassCard>
      )}
    </div>
  )
}
