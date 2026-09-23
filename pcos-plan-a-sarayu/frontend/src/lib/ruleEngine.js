import diet from '../data/diet_protocols.json'
import questionnaire from '../data/questionnaire.json'

const PHENOTYPE_IDS = Object.keys(questionnaire.phenotypes)

function get(values, field) {
  const v = values[field]
  if (v === undefined || v === null || v === '') return null
  return v
}

export function evaluateRule(rule, values) {
  const { op } = rule
  if (op === 'any') return rule.rules.some((r) => evaluateRule(r, values))
  if (op === 'all') return rule.rules.every((r) => evaluateRule(r, values))
  if (op === 'not') return !evaluateRule(rule.rule, values)

  const v = get(values, rule.field)

  if (op === 'eq') return v !== null && String(v).toLowerCase() === String(rule.value).toLowerCase()
  if (op === 'in') return v !== null && rule.values.map(String).includes(String(v))
  if (v === null) return false
  const n = Number(v)
  if (op === 'gt') return n > rule.value
  if (op === 'gte') return n >= rule.value
  if (op === 'lt') return n < rule.value
  if (op === 'lte') return n <= rule.value
  if (op === 'outside') {
    const [low, high] = rule.range
    return n < low || n > high
  }
  throw new Error(`Unknown rule op: ${op}`)
}

const FORMULAS = {
  bmi: (v) => v.weight_kg / (v.height_cm / 100) ** 2,
  whr: (v) => v.waist_cm / v.hip_cm,
  tg_hdl_ratio: (v) => v.triglycerides / v.hdl,
  lh_fsh_ratio: (v) => v.lh / v.fsh,
}

export function computeDerivedFields(values) {
  const enriched = { ...values }

  if (enriched.height_cm && enriched.weight_kg) {
    const bmi = Number(enriched.weight_kg) / (Number(enriched.height_cm) / 100) ** 2
    enriched.bmi = Math.round(bmi * 100) / 100
  }

  if (enriched.triglycerides && enriched.hdl) {
    enriched.tg_hdl_ratio = Math.round((Number(enriched.triglycerides) / Number(enriched.hdl)) * 100) / 100
  }

  if (enriched.lh && enriched.fsh) {
    enriched.lh_fsh_ratio = Math.round((Number(enriched.lh) / Number(enriched.fsh)) * 100) / 100
  }

  for (const phenotype of Object.values(questionnaire.phenotypes)) {
    for (const q of phenotype.questions) {
      const computed = q.computed || {}
      for (const key of Object.keys(computed)) {
        const fn = FORMULAS[key]
        if (!fn) continue
        try {
          const result = fn(enriched)
          if (Number.isFinite(result)) enriched[key] = Math.round(result * 100) / 100
        } catch {
          /* missing inputs */
        }
      }
    }
  }
  return enriched
}

export function evaluateRotterdamCriteria(values) {
  const testo = get(values, 'total_testosterone')
  const freeT = get(values, 'free_testosterone')
  const hirsutism = values.hirsutism_severity
  const androgenPos = Boolean(
    (testo && Number(testo) > 45.0) ||
    (freeT && Number(freeT) > 0.8) ||
    ['Moderate (chest/abdomen)', 'Severe'].includes(hirsutism)
  )

  const irregularFlag = String(values.irregular_cycle_flag || '').toLowerCase() === 'yes'
  const cycleLen = get(values, 'cycle_length_days')
  const ovulatoryPos = Boolean(
    irregularFlag ||
    (cycleLen && (Number(cycleLen) < 21 || Number(cycleLen) > 35)) ||
    String(values.cycle_absent || '').toLowerCase() === 'yes'
  )

  const follicles = get(values, 'follicle_count')
  const volume = get(values, 'ovarian_volume_ml')
  const ultrasoundPos = Boolean(
    (follicles && Number(follicles) >= 20) ||
    (volume && Number(volume) >= 10.0)
  )

  const positiveCount = [androgenPos, ovulatoryPos, ultrasoundPos].filter(Boolean).length
  return {
    is_diagnosed: positiveCount >= 2,
    positive_count: positiveCount,
    required: 2,
    criteria: {
      hyperandrogenism: androgenPos,
      ovulatory_dysfunction: ovulatoryPos,
      polycystic_ovaries: ultrasoundPos,
    },
  }
}

export function determineBodyType(values) {
  const bmi = values.bmi
  if (bmi !== undefined && Number(bmi) >= 23.0) {
    return {
      type: 'obese_pcos',
      label: 'Obese / Overweight PCOS (BMI >= 23 kg/m²)',
      bmi: Number(bmi),
      protocol_key: 'obese_pcos',
    }
  }
  return {
    type: 'lean_pcos',
    label: 'Lean PCOS (BMI < 23 kg/m²)',
    bmi: bmi !== undefined ? Number(bmi) : null,
    protocol_key: 'lean_pcos',
  }
}

function severityLabel(positiveCount) {
  for (const band of questionnaire.severity_bands.bands) {
    if (positiveCount >= band.min && positiveCount <= band.max) return band.label
  }
  return 'Severe Driver / Primary Target'
}

export function scorePhenotypes(answers) {
  const values = computeDerivedFields(answers)
  const results = {}

  for (const [pid, phenotype] of Object.entries(questionnaire.phenotypes)) {
    let biochemicalPositive = 0
    const ticks = phenotype.questions.map((q) => {
      const positive = evaluateRule(q.rule, values)
      if (positive && q.category === 'Biochemical Evaluation') biochemicalPositive += 1
      return { id: q.id, label: q.label, category: q.category, reference: q.reference, positive }
    })
    const total = phenotype.questions.length
    const positiveCount = ticks.filter((t) => t.positive).length
    results[pid] = {
      label: phenotype.label,
      positive_count: positiveCount,
      total_questions: total,
      percentage: Math.round((positiveCount / total) * 1000) / 10,
      severity: severityLabel(positiveCount),
      biochemical_positive_count: biochemicalPositive,
      biomarker_support_flag: biochemicalPositive >= 3,
      ticks,
    }
  }

  const mito = questionnaire.mitochondrial_axis
  const mitoTicks = mito.questions.map((q) => ({
    id: q.id, label: q.label, reference: q.reference, positive: evaluateRule(q.rule, values),
  }))
  const mitoPositive = mitoTicks.filter((t) => t.positive).length
  results.mitochondrial = {
    label: mito.label,
    positive_count: mitoPositive,
    total_questions: mito.questions.length,
    percentage: Math.round((mitoPositive / mito.questions.length) * 1000) / 10,
    ticks: mitoTicks,
    flag: mitoPositive >= 2,
  }

  return { scores: results, values }
}

export function evaluateOverrides(values) {
  const triggered = []
  for (const override of questionnaire.overrides) {
    if (evaluateRule(override.rule, values)) {
      triggered.push({ id: override.id, phenotype: override.phenotype, label: override.label, reference: override.reference })
    }
  }
  return triggered
}

export function classify(scores, overridesTriggered) {
  const percentages = Object.fromEntries(PHENOTYPE_IDS.map((pid) => [pid, scores[pid].percentage]))
  const maxPct = Math.max(...Object.values(percentages))
  const tallyLeaders = PHENOTYPE_IDS.filter((pid) => percentages[pid] === maxPct)
  const overridePhenotypes = [...new Set(overridesTriggered.map((o) => o.phenotype))].sort()
  const biomarkerSupport = PHENOTYPE_IDS.filter((pid) => scores[pid].biomarker_support_flag)

  let classification, primary, involved, reason

  if (overridePhenotypes.length >= 2) {
    classification = 'Mixed/Combination Phenotype'
    primary = null
    involved = overridePhenotypes
    reason = `Multiple biomarker overrides triggered simultaneously (${overridesTriggered.map((o) => o.label).join(', ')}) — Key Biomarker Priority Overrules.`
  } else if (overridePhenotypes.length === 1) {
    const forced = overridePhenotypes[0]
    classification = 'Primary Phenotype (Biomarker Override)'
    primary = forced
    involved = [forced]
    const matching = overridesTriggered.find((o) => o.phenotype === forced)
    reason = `Biomarker override triggered: ${matching.label} — ${matching.reference}.`
  } else if (maxPct === 0) {
    classification = 'Inconclusive / Minimal Findings'
    primary = null
    involved = []
    reason = 'No positive ticks recorded in any phenotype category.'
  } else if (tallyLeaders.length === 1) {
    classification = 'Primary Phenotype'
    primary = tallyLeaders[0]
    involved = [primary]
    reason = `Highest tick percentage (${maxPct}%) with no conflicting biomarker override.`
  } else {
    classification = 'Mixed/Combination Phenotype'
    primary = null
    involved = tallyLeaders
    reason = `Tied highest tick percentage (${maxPct}%) between ${tallyLeaders.join(', ')}.`
  }

  return {
    classification,
    primary_phenotype: primary,
    phenotypes_involved: involved,
    reason,
    tally_leaders: tallyLeaders,
    overrides_triggered: overridesTriggered,
    biomarker_supported_phenotypes: biomarkerSupport,
  }
}

function phenotypeBlock(phenotypeId, region, dietType) {
  const general = diet.general_protocol[phenotypeId] || diet.general_protocol.metabolic
  const regionalDict = diet.regional_suggestions[phenotypeId] || {}
  const suggestions = regionalDict[region] || regionalDict['South Indian'] || {}
  const plan = diet.meal_plans[dietType] || diet.meal_plans.Vegetarian

  return {
    phenotype: phenotypeId,
    focus: general.focus,
    diet_strategy: general.diet_strategy,
    exercise: general.exercise,
    priorities: general.priorities,
    regional_suggestions: {
      region,
      primary_focus: regionalDict.primary_focus || general.diet_strategy,
      suggestions,
    },
    day_plan: {
      diet_type: dietType,
      meals: plan,
      mid_meals_and_beverages: diet.mid_meals,
    },
  }
}

export function buildRecommendation(classification, scores, region = 'South Indian', dietType = 'Eggetarian', bodyTypeData = null) {
  const involved = classification.phenotypes_involved.length > 0 ? classification.phenotypes_involved : ['metabolic']
  const isMixed = classification.classification.startsWith('Mixed')
  const blocks = involved.map((pid) => phenotypeBlock(pid, region, dietType))
  const mitoFlag = scores.mitochondrial?.flag
  const bType = bodyTypeData?.type || 'lean_pcos'
  const bodyTypeBlock = diet.body_type_protocols[bType] || diet.body_type_protocols.lean_pcos

  return {
    is_mixed: isMixed,
    body_type_protocol: {
      body_type: bType,
      label: bodyTypeData?.label || 'Lean PCOS',
      bmi: bodyTypeData?.bmi || null,
      ...bodyTypeBlock,
    },
    phenotype_blocks: blocks,
    mitochondrial_support: {
      recommended_priority: mitoFlag ? 'high' : 'foundational',
      note: mitoFlag
        ? 'Cellular energy screen flagged 2+ symptoms. Incorporate mitochondrial support track.'
        : 'Foundational energy support track.',
      ...phenotypeBlock('mitochondrial', region, dietType),
    },
  }
}

export function runPipeline(answers, region = 'South Indian', dietType = 'Eggetarian') {
  const { scores, values } = scorePhenotypes(answers)
  const rotterdam = evaluateRotterdamCriteria(values)
  const bodyType = determineBodyType(values)
  const overridesTriggered = evaluateOverrides(values)
  const classification = classify(scores, overridesTriggered)
  const recommendation = buildRecommendation(classification, scores, region, dietType, bodyType)
  return { scores, rotterdam, body_type: bodyType, classification, recommendation, computed_values: values }
}

export { questionnaire, diet as dietProtocols, PHENOTYPE_IDS }
