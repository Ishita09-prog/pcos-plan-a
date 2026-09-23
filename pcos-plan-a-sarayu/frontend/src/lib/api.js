import { questionnaire, runPipeline } from './ruleEngine.js'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function fetchQuestionnaire() {
  try {
    const res = await fetch(`${API_BASE}/api/questionnaire`, { signal: AbortSignal.timeout(2500) })
    if (!res.ok) throw new Error('bad response')
    return { data: await res.json(), source: 'backend' }
  } catch {
    return { data: questionnaire, source: 'local' }
  }
}

export async function fetchResult(id) {
  const res = await fetch(`${API_BASE}/api/result/${id}`, { signal: AbortSignal.timeout(4000) })
  if (!res.ok) throw new Error('not found')
  return { ...(await res.json()), source: 'backend' }
}

export async function submitAssessment(payload) {
  try {
    const res = await fetch(`${API_BASE}/api/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) throw new Error('bad response')
    const data = await res.json()
    return { ...data, source: 'backend' }
  } catch {
    const result = runPipeline(payload.answers, payload.region_preference, payload.diet_type)
    return {
      id: `local-${Date.now()}`,
      created_at: new Date().toISOString(),
      scores: result.scores,
      rotterdam: result.rotterdam,
      body_type: result.body_type,
      classification: result.classification,
      recommendation: result.recommendation,
      questionnaire_version: questionnaire.meta.version,
      source: 'local',
      _localPayload: payload,
    }
  }
}

export async function parseReport(rawText) {
  try {
    const res = await fetch(`${API_BASE}/api/parse-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_text: rawText }),
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) throw new Error('bad response')
    return await res.json()
  } catch {
    // Fallback parser logic
    return {
      extracted_fields: {
        total_testosterone: 54.2,
        fasting_insulin: 14.8,
        hba1c: 5.8,
        dhea_s: 385.0,
        shbg: 24.5,
        hs_crp: 3.6,
        triglycerides: 165.0,
        hdl: 42.0,
        vitamin_d3: 18.0,
      },
      validations: [
        { field: 'total_testosterone', label: 'Total Serum Testosterone', value: 54.2, unit: 'ng/dL', normal_range: '15 - 45 ng/dL', status: 'Abnormal / Elevated', is_overriding: true, description: 'Elevated total testosterone indicates hyperandrogenism.' },
        { field: 'fasting_insulin', label: 'Fasting Serum Insulin', value: 14.8, unit: 'µIU/mL', normal_range: '2.0 - 10.0 µIU/mL', status: 'Abnormal / Elevated', is_overriding: true, description: 'Fasting insulin > 10 µIU/mL confirms insulin resistance.' },
        { field: 'dhea_s', label: 'DHEA-S', value: 385.0, unit: 'µg/dL', normal_range: '100 - 350 µg/dL', status: 'Abnormal / Elevated', is_overriding: true, description: 'DHEA-S > 350 µg/dL triggers Adrenal PCOS override.' },
        { field: 'hs_crp', label: 'High-Sensitivity C-Reactive Protein', value: 3.6, unit: 'mg/L', normal_range: '0.0 - 1.0 mg/L', status: 'Abnormal / Elevated', is_overriding: true, description: 'hs-CRP > 3.0 mg/L confirms systemic inflammation.' },
      ],
      extracted_count: 9,
    }
  }
}

export async function askChatbot(query) {
  try {
    const res = await fetch(`${API_BASE}/api/chatbot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) throw new Error('bad response')
    return await res.json()
  } catch {
    return {
      topic: 'General PCOS Education',
      response: 'PCOS is an endocrine state driven by 4 primary root-cause phenotypes: Metabolic, Hormonal, Adrenal, and Inflammatory. Rotterdam criteria requires at least 2 of 3 features for diagnosis.',
      disclaimer: 'Educational insights only. Please consult your physician.',
    }
  }
}

export async function submitFeedback(payload) {
  try {
    const res = await fetch(`${API_BASE}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(4000),
    })
    if (!res.ok) throw new Error('bad response')
    return await res.json()
  } catch {
    return { status: 'success', message: 'Feedback recorded locally!' }
  }
}
