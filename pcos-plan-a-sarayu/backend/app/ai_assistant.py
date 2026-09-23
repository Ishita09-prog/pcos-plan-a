"""
AI Assistant module for PCOS Health Platform.
Provides educational assistance on PCOS phenotypes, lab reports, diet strategies, and lifestyle guidance.
Grounded in medical literature (Springer PCOS Reference 10.1007/978-981-96-2120-0).
Strictly non-diagnostic for patient privacy & safety.
"""
from typing import Any, Dict

PCOS_KNOWLEDGE_BASE = {
    "rotterdam": (
        "The Rotterdam Criteria (2003/2018) require meeting at least 2 of 3 features for a formal PCOS diagnosis: "
        "(1) Hyperandrogenism (elevated testosterone or hirsutism/acne), "
        "(2) Ovulatory Dysfunction (irregular or absent periods), "
        "(3) Polycystic Ovaries on Ultrasound (>=20 follicles or ovarian volume >=10 mL). "
        "Additionally, thyroid dysfunction, hyperprolactinemia, and adrenal hyperplasia must be excluded."
    ),
    "lean_vs_obese": (
        "PCOS presents differently based on body composition. Lean PCOS (BMI < 23 kg/m²) is frequently driven by "
        "adrenal stress, gut dysbiosis, or post-pill rebound, requiring stress reduction and high nutrient density without calorie restriction. "
        "Obese PCOS (BMI >= 23 kg/m²) involves prominent hyperinsulinemia, benefiting from low-glycemic eating, 30g+ protein per meal, "
        "and progressive strength training."
    ),
    "diet": (
        "Nutrition for PCOS should be customized by phenotype and cuisine: "
        "1. Metabolic: Low GI, high fiber (>35g/day), protein-first food sequence. "
        "2. Adrenal: Regular meal timing, complex carbs at dinner to regulate cortisol. "
        "3. Inflammatory: Remove seed oils, gluten/dairy elimination trial, high omega-3s. "
        "4. Hormonal: Cruciferous veggies (DIM) & flaxseed (boosts SHBG). "
        "Eggetarian options incorporate egg whites, poached eggs, and sprout batters across South Indian, North Indian, and global cuisines."
    ),
    "disclaimer": (
        "Note: I am an AI Educational Assistant. I provide evidence-based health information and literature insights, "
        "but I do NOT diagnose medical conditions or replace personal consultations with your healthcare practitioner."
    ),
}


def answer_pcos_query(user_query: str) -> Dict[str, Any]:
    q_lower = user_query.lower()

    if "rotterdam" in q_lower or "diagnos" in q_lower or "criteria" in q_lower:
        topic = "Rotterdam Diagnostic Criteria"
        reply = PCOS_KNOWLEDGE_BASE["rotterdam"]
    elif "lean" in q_lower or "obese" in q_lower or "bmi" in q_lower or "weight" in q_lower:
        topic = "Lean vs Obese PCOS Management"
        reply = PCOS_KNOWLEDGE_BASE["lean_vs_obese"]
    elif "diet" in q_lower or "food" in q_lower or "egg" in q_lower or "cuisine" in q_lower or "eat" in q_lower:
        topic = "PCOS Nutrition & Meal Planning"
        reply = PCOS_KNOWLEDGE_BASE["diet"]
    elif "dhea" in q_lower or "stress" in q_lower or "cortisol" in q_lower:
        topic = "Adrenal PCOS & Stress Response"
        reply = (
            "DHEA-S is an adrenal androgen driven by HPA-axis stress. High DHEA-S (>350 µg/dL) indicates Adrenal PCOS. "
            "Management focuses on 7-8 hours sleep, magnesium, ashwagandha, avoiding intense HIIT, and regular meal timing."
        )
    elif "insulin" in q_lower or "homa" in q_lower or "glucose" in q_lower:
        topic = "Insulin Resistance & Metabolic Health"
        reply = (
            "Hyperinsulinemia stimulates ovarian theca cells to produce excess testosterone. "
            "Optimal fasting insulin is < 10 µIU/mL. Key strategies include strength training, 10k daily steps, inositol supplementation, and fiber >35g/day."
        )
    elif "testosterone" in q_lower or "hirsutism" in q_lower or "hair" in q_lower or "acne" in q_lower:
        topic = "Androgen Excess & Symptoms"
        reply = (
            "Elevated total testosterone (>45 ng/dL) or low SHBG (<30 nmol/L) increases free active testosterone, "
            "causing hirsutism and acne. Spearmint tea (2 cups/day), zinc, and ground flaxseed help lower free androgen levels."
        )
    else:
        topic = "General PCOS Guidance"
        reply = (
            "PCOS is an endocrine & metabolic state driven by 4 primary root-cause phenotypes: Metabolic, Hormonal, Adrenal, and Inflammatory. "
            "Identifying your primary phenotype allows targeted diet, exercise, and lifestyle interventions rather than generic advice."
        )

    return {
        "topic": topic,
        "response": reply,
        "disclaimer": PCOS_KNOWLEDGE_BASE["disclaimer"],
        "reference": "Springer PCOS Reference (10.1007/978-981-96-2120-0)",
    }
