"""
Step 7 - Testing and validation.

Each case below was tallied BY HAND against the questionnaire before being
encoded here (see the comment above each case). If someone changes a number in
app/data/questionnaire.json without updating the source document to match,
one of these should fail.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.rule_engine import run_pipeline  # noqa: E402


def test_case1_metabolic_primary_by_tally_no_override():
    # Hand tally: BMI/WHR(1) + acanthosis(1) + skin tags(1) + postprandial(1)
    # + glucose/insulin(1) + HbA1c(1) + HOMA-IR(1) + lipid ratio(1) = 8/10 = 80%
    # sedentary=no, ultraprocessed=no -> both negative. Insulin 6 and HOMA-IR 1.8
    # are both below the >10 / >2.0 override thresholds, so no override fires.
    answers = {
        "weight_kg": 85, "height_cm": 160, "waist_cm": 95, "hip_cm": 100,
        "acanthosis_nigricans": "yes",
        "skin_tags": "yes",
        "postprandial_slump": "yes",
        "fasting_glucose": 100, "fasting_insulin": 6,
        "hba1c": 5.6,
        "homa_ir": 1.8,
        "triglycerides": 160, "hdl": 40,
        "sedentary": "no",
        "ultraprocessed_food": "no",
    }
    result = run_pipeline(answers)
    scores, classification = result["scores"], result["classification"]

    assert scores["metabolic"]["positive_count"] == 8
    assert scores["metabolic"]["percentage"] == 80.0
    assert scores["metabolic"]["severity"] == "Severe Driver / Primary Target"
    assert scores["metabolic"]["biochemical_positive_count"] == 4  # glucose/insulin, hba1c, homa-ir, lipids
    assert scores["adrenal"]["positive_count"] == 0
    assert scores["hormonal"]["positive_count"] == 0
    assert scores["inflammatory"]["positive_count"] == 0

    assert classification["overrides_triggered"] == []
    assert classification["classification"] == "Primary Phenotype"
    assert classification["primary_phenotype"] == "metabolic"
    assert classification["tally_leaders"] == ["metabolic"]


def test_case2_adrenal_override_beats_hormonal_tally_leader():
    # Hormonal tally (hand count): cycle length 45d(1) + severe hirsutism(1)
    # + alopecia(1) + acne(1) = 4/10 = 40% -> tally leader.
    # Adrenal tally: only DHEA-S 400 (>350, outside 100-250) = 1/10 = 10%.
    # But DHEA-S > 350 with insulin/HOMA-IR unset (=> "normal") triggers the
    # Adrenal override, which must win over the 40% Hormonal tally leader.
    answers = {
        "cycle_length_days": 45,
        "hirsutism_severity": "Severe",
        "alopecia": "yes",
        "sym_acne": "yes",  # shared field: also ticks Inflammatory's acne question
        "dhea_s": 400,
    }
    result = run_pipeline(answers)
    scores, classification = result["scores"], result["classification"]

    assert scores["hormonal"]["positive_count"] == 4
    assert scores["adrenal"]["positive_count"] == 1
    assert scores["inflammatory"]["positive_count"] == 1  # shared acne field

    assert classification["tally_leaders"] == ["hormonal"]
    override_ids = [o["id"] for o in classification["overrides_triggered"]]
    assert override_ids == ["adrenal_override"]
    assert classification["classification"] == "Primary Phenotype (Biomarker Override)"
    assert classification["primary_phenotype"] == "adrenal"


def test_case3_mixed_phenotype_on_tied_tally():
    # Metabolic: acanthosis(1) + skin tags(1) + postprandial(1) = 3/10 = 30%
    # Inflammatory: joint pain(1) + heavy metal(1) + autoimmune(1) = 3/10 = 30%
    # Tie at 30%, nothing else scores higher, and no lab values were entered
    # so no override can fire -> Mixed/Combination Phenotype.
    answers = {
        "acanthosis_nigricans": "yes",
        "skin_tags": "yes",
        "postprandial_slump": "yes",
        "joint_pain": "yes",
        "heavy_metal_exposure": "yes",
        "autoimmune_history": "yes",
    }
    result = run_pipeline(answers)
    scores, classification = result["scores"], result["classification"]

    assert scores["metabolic"]["positive_count"] == 3
    assert scores["inflammatory"]["positive_count"] == 3
    assert classification["overrides_triggered"] == []
    assert classification["classification"] == "Mixed/Combination Phenotype"
    assert classification["primary_phenotype"] is None
    assert set(classification["phenotypes_involved"]) == {"inflammatory", "metabolic"}


def test_case4_inconclusive_when_everything_optimal():
    result = run_pipeline({})
    classification = result["classification"]
    assert classification["classification"] == "Inconclusive / Minimal Findings"
    assert classification["primary_phenotype"] is None
    for pid in ("adrenal", "hormonal", "inflammatory", "metabolic"):
        assert result["scores"][pid]["positive_count"] == 0


def test_case5_multiple_overrides_force_mixed_classification():
    # Fasting insulin 12 > 10 -> Metabolic override.
    # hs-CRP 2.0 > 1.5 -> Inflammatory override.
    # Both fire at once regardless of tally -> Mixed/Combination Phenotype.
    answers = {"fasting_insulin": 12, "hs_crp": 2.0}
    result = run_pipeline(answers)
    classification = result["classification"]

    override_phenotypes = sorted(o["phenotype"] for o in classification["overrides_triggered"])
    assert override_phenotypes == ["inflammatory", "metabolic"]
    assert classification["classification"] == "Mixed/Combination Phenotype"
    assert classification["primary_phenotype"] is None
    assert set(classification["phenotypes_involved"]) == {"inflammatory", "metabolic"}


def test_biomarker_support_flag_surfaces_without_forcing_primary():
    # 4 biochemical findings in Metabolic (glucose/insulin, HbA1c, HOMA-IR
    # under the 2.0 override line, lipids) should flip the informational
    # "3+ positive biomarkers" flag on, even though tally alone already made
    # Metabolic primary here -- this checks the flag computes independently.
    answers = {
        "fasting_glucose": 100, "fasting_insulin": 6,
        "hba1c": 5.6, "homa_ir": 1.8,
        "triglycerides": 160, "hdl": 40,
    }
    result = run_pipeline(answers)
    scores = result["scores"]
    assert scores["metabolic"]["biochemical_positive_count"] == 4
    assert scores["metabolic"]["biomarker_support_flag"] is True
    assert "metabolic" in result["classification"]["biomarker_supported_phenotypes"]
