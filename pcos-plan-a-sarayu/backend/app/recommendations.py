"""
Recommendation mapping module for PCOS phenotype, body type, and multi-cuisine diet strategies.
"""
from typing import Any, Dict, List

from .rule_engine import DIET_PROTOCOLS


def _phenotype_block(phenotype_id: str, region: str, diet_type: str) -> Dict[str, Any]:
    general = DIET_PROTOCOLS["general_protocol"].get(
        phenotype_id, DIET_PROTOCOLS["general_protocol"]["metabolic"]
    )
    regional_dict = DIET_PROTOCOLS["regional_suggestions"].get(phenotype_id, {})
    primary_focus = regional_dict.get("primary_focus", general["diet_strategy"])
    cuisine_suggestions = regional_dict.get(region, regional_dict.get("South Indian", {}))
    meal_plan_options = DIET_PROTOCOLS["meal_plans"].get(
        diet_type, DIET_PROTOCOLS["meal_plans"]["Vegetarian"]
    )

    return {
        "phenotype": phenotype_id,
        "focus": general["focus"],
        "diet_strategy": general["diet_strategy"],
        "exercise": general["exercise"],
        "priorities": general["priorities"],
        "regional_suggestions": {
            "region": region,
            "primary_focus": primary_focus,
            "suggestions": cuisine_suggestions,
        },
        "day_plan": {
            "diet_type": diet_type,
            "meals": meal_plan_options,
            "mid_meals_and_beverages": DIET_PROTOCOLS["mid_meals"],
        },
    }


def build_recommendation(
    classification: Dict[str, Any],
    scores: Dict[str, Any],
    region: str,
    diet_type: str,
    body_type_data: Dict[str, Any] = None,
) -> Dict[str, Any]:
    involved = classification.get("phenotypes_involved", ["metabolic"])
    if not involved:
        involved = ["metabolic"]

    is_mixed = classification.get("classification", "").startswith("Mixed")

    blocks: List[Dict[str, Any]] = [_phenotype_block(pid, region, diet_type) for pid in involved]

    mito_flag = scores.get("mitochondrial", {}).get("flag", False)
    mitochondrial_block = _phenotype_block("mitochondrial", region, diet_type)

    b_type = body_type_data.get("type", "lean_pcos") if body_type_data else "lean_pcos"
    body_type_block = DIET_PROTOCOLS["body_type_protocols"].get(
        b_type, DIET_PROTOCOLS["body_type_protocols"]["lean_pcos"]
    )

    return {
        "is_mixed": is_mixed,
        "body_type_protocol": {
            "body_type": b_type,
            "label": body_type_data.get("label", "Lean PCOS") if body_type_data else "Lean PCOS",
            "bmi": body_type_data.get("bmi") if body_type_data else None,
            **body_type_block,
        },
        "phenotype_blocks": blocks,
        "mitochondrial_support": {
            "recommended_priority": "high" if mito_flag else "foundational",
            "note": (
                "Cellular Energy & Hypoxia screen flagged 2+ positive symptoms. "
                "Incorporate mitochondrial support & diaphragmatic breathing into your daily routine."
                if mito_flag
                else "Foundational energy support; incorporate if fatigue or shallow breathing persists."
            ),
            **mitochondrial_block,
        },
    }
