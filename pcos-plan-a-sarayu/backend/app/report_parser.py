"""
Lab Blood Report Parser & Reference Verifier for PCOS Health Platform.
Extracts lab values from PDF / Image text uploads and validates parameters against online standard laboratory reference limits.
"""
import re
from typing import Any, Dict, List

STANDARD_REFERENCE_RANGES = {
    "total_testosterone": {
        "label": "Total Testosterone (Male Hormone Level)",
        "unit": "ng/dL",
        "normal_min": 15.0,
        "normal_max": 45.0,
        "override_threshold": 45.0,
        "flag_type": "high",
        "description": "Elevated testosterone (>45 ng/dL) signals excess male hormone production, causing facial hair, acne, or period delays.",
    },
    "free_testosterone": {
        "label": "Free Testosterone (Active Male Hormone)",
        "unit": "pg/mL",
        "normal_min": 0.1,
        "normal_max": 0.8,
        "override_threshold": 0.8,
        "flag_type": "high",
        "description": "High active testosterone (>0.8 pg/mL) directly triggers skin breakouts and unwanted hair growth.",
    },
    "fasting_insulin": {
        "label": "Fasting Insulin (Sugar-Control Hormone)",
        "unit": "µIU/mL",
        "normal_min": 2.0,
        "normal_max": 10.0,
        "override_threshold": 10.0,
        "flag_type": "high",
        "description": "Fasting insulin above 10 µIU/mL shows your body works extra hard to handle blood sugar, driving Metabolic PCOS.",
    },
    "fasting_glucose": {
        "label": "Fasting Blood Sugar",
        "unit": "mg/dL",
        "normal_min": 70.0,
        "normal_max": 99.0,
        "override_threshold": 100.0,
        "flag_type": "high",
        "description": "Fasting blood sugar 100 mg/dL or higher suggests your body needs help processing daily carbohydrates.",
    },
    "hba1c": {
        "label": "HbA1c (3-Month Blood Sugar Average)",
        "unit": "%",
        "normal_min": 4.0,
        "normal_max": 5.6,
        "override_threshold": 5.7,
        "flag_type": "high",
        "description": "HbA1c of 5.7% or higher indicates early sugar imbalance and insulin resistance.",
    },
    "dhea_s": {
        "label": "DHEA-S (Adrenal Stress Hormone)",
        "unit": "µg/dL",
        "normal_min": 100.0,
        "normal_max": 350.0,
        "override_threshold": 350.0,
        "flag_type": "high",
        "description": "DHEA-S above 350 µg/dL shows stress glands (adrenals) are releasing extra androgen hormones.",
    },
    "lh": {
        "label": "Luteinizing Hormone (LH - Period Trigger)",
        "unit": "mIU/mL",
        "normal_min": 2.0,
        "normal_max": 10.0,
        "override_threshold": 12.0,
        "flag_type": "high",
        "description": "High LH level disrupts your body's monthly ovulation cycle timing.",
    },
    "fsh": {
        "label": "FSH (Egg Maturation Hormone)",
        "unit": "mIU/mL",
        "normal_min": 3.0,
        "normal_max": 10.0,
        "override_threshold": 3.0,
        "flag_type": "low",
        "description": "Low FSH relative to LH prevents eggs from maturing fully each month.",
    },
    "shbg": {
        "label": "SHBG (Hormone Carrier Protein)",
        "unit": "nmol/L",
        "normal_min": 30.0,
        "normal_max": 100.0,
        "override_threshold": 30.0,
        "flag_type": "low",
        "description": "Low SHBG (<30 nmol/L) leaves more male hormones free to cause acne and hirsutism.",
    },
    "hs_crp": {
        "label": "hs-CRP (Body Inflammation Marker)",
        "unit": "mg/L",
        "normal_min": 0.0,
        "normal_max": 1.0,
        "override_threshold": 3.0,
        "flag_type": "high",
        "description": "hs-CRP above 3.0 mg/L confirms low-grade swelling or immune irritation in your tissues or gut.",
    },
    "triglycerides": {
        "label": "Blood Triglycerides (Blood Fats)",
        "unit": "mg/dL",
        "normal_min": 50.0,
        "normal_max": 150.0,
        "override_threshold": 150.0,
        "flag_type": "high",
        "description": "Triglycerides over 150 mg/dL indicate metabolic strain and high blood fat storage.",
    },
    "hdl": {
        "label": "HDL Cholesterol (Good Cholesterol)",
        "unit": "mg/dL",
        "normal_min": 50.0,
        "normal_max": 90.0,
        "override_threshold": 50.0,
        "flag_type": "low",
        "description": "Good HDL cholesterol under 50 mg/dL means your blood lacks protective fat scavengers.",
    },
    "tsh": {
        "label": "TSH (Thyroid Function Check)",
        "unit": "µIU/mL",
        "normal_min": 0.4,
        "normal_max": 4.5,
        "override_threshold": 4.5,
        "flag_type": "high",
        "description": "TSH over 4.5 µIU/mL indicates thyroid sluggishness, which must be ruled out before PCOS treatment.",
    },
    "vitamin_d3": {
        "label": "Vitamin D3 (Sunlight & Hormone Co-factor)",
        "unit": "ng/mL",
        "normal_min": 30.0,
        "normal_max": 100.0,
        "override_threshold": 20.0,
        "flag_type": "low",
        "description": "Low Vitamin D (<20 ng/mL) makes insulin resistance and tiredness worse.",
    },
}

PATTERNS = {
    "total_testosterone": [r"total\s*testosterone[^\d]*(\d+\.?\d*)", r"testosterone[^\d]*(\d+\.?\d*)"],
    "fasting_insulin": [r"fasting\s*insulin[^\d]*(\d+\.?\d*)", r"insulin[^\d]*(\d+\.?\d*)"],
    "fasting_glucose": [r"fasting\s*glucose[^\d]*(\d+\.?\d*)", r"fasting\s*sugar[^\d]*(\d+\.?\d*)"],
    "hba1c": [r"hba1c[^\d]*(\d+\.?\d*)", r"glycated\s*hemoglobin[^\d]*(\d+\.?\d*)"],
    "dhea_s": [r"dhea[_\-\s]*s[^\d]*(\d+\.?\d*)", r"dheas[^\d]*(\d+\.?\d*)"],
    "lh": [r"\blh\b[^\d]*(\d+\.?\d*)", r"luteinizing[^\d]*(\d+\.?\d*)"],
    "fsh": [r"\bfsh\b[^\d]*(\d+\.?\d*)", r"follicle[^\d]*(\d+\.?\d*)"],
    "shbg": [r"shbg[^\d]*(\d+\.?\d*)", r"sex\s*hormone[^\d]*(\d+\.?\d*)"],
    "hs_crp": [r"hs[_\-\s]*crp[^\d]*(\d+\.?\d*)", r"c[_\-\s]*reactive[^\d]*(\d+\.?\d*)"],
    "triglycerides": [r"triglycerides[^\d]*(\d+\.?\d*)", r"triglyceride[^\d]*(\d+\.?\d*)"],
    "hdl": [r"\bhdl\b[^\d]*(\d+\.?\d*)", r"hdl\s*cholesterol[^\d]*(\d+\.?\d*)"],
    "tsh": [r"\btsh\b[^\d]*(\d+\.?\d*)", r"thyroid\s*stimulating[^\d]*(\d+\.?\d*)"],
    "vitamin_d3": [r"vitamin\s*d3?[^\d]*(\d+\.?\d*)", r"25[_\-\s]*oh[^\d]*(\d+\.?\d*)"],
}


def parse_lab_text(raw_text: str) -> Dict[str, Any]:
    text_lower = raw_text.lower()
    extracted_fields = {}
    validation_results = []

    for key, regexes in PATTERNS.items():
        val = None
        for pattern in regexes:
            match = re.search(pattern, text_lower)
            if match:
                try:
                    val = float(match.group(1))
                    break
                except ValueError:
                    continue

        if val is not None:
            extracted_fields[key] = val
            ref = STANDARD_REFERENCE_RANGES[key]
            status = "Normal"
            is_overriding = False

            if ref["flag_type"] == "high":
                if val > ref["override_threshold"]:
                    status = "Abnormal / Elevated"
                    is_overriding = True
                elif val > ref["normal_max"]:
                    status = "Borderline High"
            elif ref["flag_type"] == "low":
                if val < ref["override_threshold"]:
                    status = "Abnormal / Deficient"
                    is_overriding = True
                elif val < ref["normal_min"]:
                    status = "Borderline Low"

            validation_results.append(
                {
                    "field": key,
                    "label": ref["label"],
                    "value": val,
                    "unit": ref["unit"],
                    "normal_range": f"{ref['normal_min']} - {ref['normal_max']} {ref['unit']}",
                    "status": status,
                    "is_overriding": is_overriding,
                    "description": ref["description"],
                }
            )

    return {
        "extracted_fields": extracted_fields,
        "validations": validation_results,
        "extracted_count": len(extracted_fields),
    }


def get_recommended_doctor_tests() -> List[Dict[str, Any]]:
    return [
        {
            "test_name": "Fasting Insulin & HOMA-IR",
            "why_neglected": "General practitioners frequently only order Fasting Glucose, missing early hyperinsulinemia.",
            "clinical_relevance": "Uncovers hidden metabolic insulin resistance even when blood sugar is normal.",
        },
        {
            "test_name": "DHEA-S (Dehydroepiandrosterone Sulfate)",
            "why_neglected": "Often omitted during basic gynecological panels focused solely on ovarian testosterone.",
            "clinical_relevance": "Identifies HPA-axis stress driving Adrenal PCOS.",
        },
        {
            "test_name": "hs-CRP (High-Sensitivity C-Reactive Protein)",
            "why_neglected": "Rarely included in routine hormonal workups.",
            "clinical_relevance": "Detects systemic low-grade inflammation driving follicle impairment.",
        },
        {
            "test_name": "SHBG (Sex Hormone-Binding Globulin)",
            "why_neglected": "Total testosterone can appear falsely normal if SHBG is low.",
            "clinical_relevance": "Calculates free bioavailable androgen levels.",
        },
        {
            "test_name": "Serum 25-OH Vitamin D3",
            "why_neglected": "Considered a lifestyle nutrient rather than a core hormonal co-factor.",
            "clinical_relevance": "Vitamin D deficiency worsens both insulin resistance and menstrual irregularity.",
        },
    ]
