import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.recommendations import build_recommendation  # noqa: E402
from app.report_parser import parse_lab_text  # noqa: E402
from app.rule_engine import determine_body_type, evaluate_rotterdam_criteria, run_pipeline  # noqa: E402


def test_rotterdam_criteria_evaluation():
    # Test case meeting 2 of 3 criteria (Hyperandrogenism + Ovulatory dysfunction)
    answers = {
        "total_testosterone": 52.0,
        "irregular_cycle_flag": "yes",
    }
    result = run_pipeline(answers)
    rotterdam = result["rotterdam"]

    assert rotterdam["is_diagnosed"] is True
    assert rotterdam["positive_count"] == 2
    assert rotterdam["criteria"]["hyperandrogenism"] is True
    assert rotterdam["criteria"]["ovulatory_dysfunction"] is True
    assert rotterdam["criteria"]["polycystic_ovaries"] is False


def test_determine_body_type_lean_vs_obese():
    # Height 160 cm, Weight 50 kg -> BMI = 19.53 (< 23) -> Lean PCOS
    lean_answers = {"height_cm": 160, "weight_kg": 50}
    res_lean = run_pipeline(lean_answers)
    assert res_lean["body_type"]["type"] == "lean_pcos"

    # Height 160 cm, Weight 70 kg -> BMI = 27.34 (>= 23) -> Obese PCOS
    obese_answers = {"height_cm": 160, "weight_kg": 70}
    res_obese = run_pipeline(obese_answers)
    assert res_obese["body_type"]["type"] == "obese_pcos"


def test_eggetarian_and_multicuisine_recommendation():
    answers = {"fasting_insulin": 14.0}
    result = run_pipeline(answers)
    rec = build_recommendation(
        result["classification"],
        result["scores"],
        region="South Indian",
        diet_type="Eggetarian",
        body_type_data=result["body_type"],
    )

    assert rec["body_type_protocol"]["body_type"] in ["lean_pcos", "obese_pcos"]
    assert rec["phenotype_blocks"][0]["day_plan"]["diet_type"] == "Eggetarian"
    assert "Eggetarian" in rec["phenotype_blocks"][0]["day_plan"]["meals"]


def test_report_parser_extraction():
    sample_text = """
    Patient Lab Report:
    TOTAL TESTOSTERONE: 58.5 ng/dL
    FASTING INSULIN: 16.2 uIU/mL
    DHEA-S: 395 ug/dL
    hs-CRP: 3.5 mg/L
    TSH: 2.1 uIU/mL
    """
    parsed = parse_lab_text(sample_text)
    assert parsed["extracted_count"] >= 4
    extracted = parsed["extracted_fields"]
    assert extracted["total_testosterone"] == 58.5
    assert extracted["fasting_insulin"] == 16.2
    assert extracted["dhea_s"] == 395.0
    assert extracted["hs_crp"] == 3.5
