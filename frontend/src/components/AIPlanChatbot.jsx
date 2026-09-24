import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function AIPlanChatbot() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hi! I can help you create a personalized diet and exercise plan based on your phenotype. Ask me anything!' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = input
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setInput('')
    setLoading(true)

    // Mock API call to an AI service
    setTimeout(() => {
      let aiResponse = "Based on your Metabolic phenotype, I recommend focusing on a low-glycemic index diet with plenty of fiber. For exercise, resistance training 3 times a week is highly effective."
      
      // Basic safeguard for symptoms
      if (userMsg.toLowerCase().includes('symptom') || userMsg.toLowerCase().includes('pain') || userMsg.toLowerCase().includes('medication')) {
        aiResponse = "For privacy and safety, I only provide guidance on diet and exercise. Please consult a healthcare professional for symptom management or medical advice."
      }

      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }])
      setLoading(false)
    }, 1500)
  }

  return (
    <div className="flex flex-col h-96 bg-white/5 rounded-xl border border-white/10 overflow-hidden mt-6">
      <div className="p-4 border-b border-white/10 bg-white/[0.02]">
        <h3 className="font-display font-semibold text-white">Local Rule-Based Assistant</h3>
        <p className="text-xs text-slate-400">Diet & Exercise Plans (No external AI)</p>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-bio-500 text-white rounded-br-none'
                  : 'bg-white/10 text-slate-200 rounded-bl-none'
              }`}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/10 text-slate-400 rounded-xl rounded-bl-none px-4 py-2 text-sm flex space-x-1 items-center">
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-white/10 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about diet or exercises..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-bio-400 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-bio-500 hover:bg-bio-400 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  )
}
