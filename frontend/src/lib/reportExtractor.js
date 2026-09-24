// Local-only lab report auto-fill (mentor feedback: "uploading data via
// patient reports ... for every field it should calculate if that value is
// correct or over-riding"). Everything here runs in the browser with
// pdf.js -- no report text, image, or extracted value is ever sent to any
// server, external API, or AI model. Only text-based PDFs are supported for
// now (most digitally-generated lab reports); scanned/photographed reports
// need OCR, which is out of scope for this pass.
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { questionnaire, evaluateRule } from './ruleEngine.js'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

// Each entry: the questionnaire field key to fill, and one or more regexes
// that match "<lab name> ... <number>" in the extracted report text. Kept
// deliberately simple (plain regex, no ML) so every match is traceable back
// to the exact text it came from -- same "no black box" principle as the
// rule engine itself.
const FIELD_PATTERNS = [
  { key: 'dhea_s', patterns: [/dhea[-\s]?s[^0-9]{0,20}(\d+(?:\.\d+)?)/i] },
  { key: 'cortisol_am', patterns: [/cortisol[^0-9]{0,20}(\d+(?:\.\d+)?)/i] },
  { key: 'total_testosterone', patterns: [/total\s+testosterone[^0-9]{0,20}(\d+(?:\.\d+)?)/i] },
  { key: 'free_testosterone', patterns: [/free\s+testosterone[^0-9]{0,20}(\d+(?:\.\d+)?)/i] },
  { key: 'lh_fsh_ratio', patterns: [/lh\s*[:/]\s*fsh[^0-9]{0,20}(\d+(?:\.\d+)?)/i] },
  { key: 'shbg', patterns: [/shbg[^0-9]{0,20}(\d+(?:\.\d+)?)/i] },
  { key: 'hs_crp', patterns: [/hs[-\s]?crp[^0-9]{0,20}(\d+(?:\.\d+)?)/i, /c[-\s]?reactive\s+protein[^0-9]{0,20}(\d+(?:\.\d+)?)/i] },
  { key: 'tsh', patterns: [/\btsh\b[^0-9]{0,20}(\d+(?:\.\d+)?)/i] },
  { key: 'vitamin_d3', patterns: [/vitamin\s*d3?[^0-9]{0,25}(\d+(?:\.\d+)?)/i] },
  { key: 'serum_zinc', patterns: [/(?:serum\s+)?zinc[^0-9]{0,20}(\d+(?:\.\d+)?)/i] },
  { key: 'triglycerides', patterns: [/triglycerides[^0-9]{0,20}(\d+(?:\.\d+)?)/i] },
  { key: 'hdl', patterns: [/\bhdl\b(?:\s*cholesterol)?[^0-9]{0,20}(\d+(?:\.\d+)?)/i] },
  { key: 'fasting_glucose', patterns: [/fasting\s+(?:blood\s+)?glucose[^0-9]{0,20}(\d+(?:\.\d+)?)/i] },
  { key: 'fasting_insulin', patterns: [/fasting\s+insulin[^0-9]{0,20}(\d+(?:\.\d+)?)/i] },
  { key: 'hba1c', patterns: [/hba1c[^0-9]{0,20}(\d+(?:\.\d+)?)/i] },
  { key: 'homa_ir', patterns: [/homa[-\s]?ir[^0-9]{0,20}(\d+(?:\.\d+)?)/i] },
  { key: 'height_cm', patterns: [/height[^0-9]{0,20}(\d+(?:\.\d+)?)\s*cm/i] },
  { key: 'weight_kg', patterns: [/weight[^0-9]{0,20}(\d+(?:\.\d+)?)\s*kg/i] },
]

export async function extractTextFromPdf(file) {
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map((it) => it.str).join(' ') + '\n'
  }
  return text
}

export function parseLabValues(text) {
  const found = {}
  for (const { key, patterns } of FIELD_PATTERNS) {
    for (const re of patterns) {
      const m = text.match(re)
      if (m) {
        const value = Number(m[1])
        if (Number.isFinite(value)) {
          found[key] = value
          break
        }
      }
    }
  }
  return found
}

// Walks a (possibly compound any/all/not) rule tree and evaluates only the
// leaf condition(s) that reference `fieldKey`, against a single-field value
// map -- so a multi-field question's threshold for THIS field can be judged
// without needing every other field on that question filled in too.
function leafFlagsField(rule, fieldKey, values) {
  if (rule.op === 'any') return rule.rules.some((r) => leafFlagsField(r, fieldKey, values))
  if (rule.op === 'all') return rule.rules.every((r) => leafFlagsField(r, fieldKey, values))
  if (rule.op === 'not') return leafFlagsField(rule.rule, fieldKey, values)
  if (rule.field !== fieldKey) return null // this leaf isn't about our field
  return evaluateRule(rule, values)
}

function findOwningRule(fieldKey) {
  for (const phenotype of Object.values(questionnaire.phenotypes)) {
    for (const q of phenotype.questions) {
      if (q.fields?.some((f) => f.key === fieldKey)) return q.rule
    }
  }
  for (const q of questionnaire.first_line?.questions || []) {
    if (q.fields?.some((f) => f.key === fieldKey)) return q.rule
  }
  return null
}

// Returns { fieldKey: { value, flag: 'normal' | 'overriding' | 'unknown' } }
export function flagExtractedValues(extracted) {
  const flagged = {}
  for (const [key, value] of Object.entries(extracted)) {
    const rule = findOwningRule(key)
    if (!rule) {
      flagged[key] = { value, flag: 'unknown' }
      continue
    }
    const result = leafFlagsField(rule, key, { [key]: value })
    flagged[key] = { value, flag: result === true ? 'overriding' : result === false ? 'normal' : 'unknown' }
  }
  return flagged
}

// End-to-end: PDF File -> { fieldKey: { value, flag } }. Throws if the PDF
// has no extractable text (e.g. a scanned image) so the caller can tell the
// user this report needs manual entry instead of silently returning nothing.
export async function extractReportData(file) {
  const text = await extractTextFromPdf(file)
  const values = parseLabValues(text)
  if (Object.keys(values).length === 0) {
    throw new Error('No recognisable lab values found in this PDF. It may be a scanned image rather than a text PDF -- please enter values manually.')
  }
  return flagExtractedValues(values)
}
