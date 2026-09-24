"""
Step 7 - Testing and validation.

Each case below was tallied BY HAND against the questionnaire before being
encoded here (see the comment above each case). If someone changes a number in
app/data/questionnaire.json without updating the source document to match,
one of these should fail.

Every phenotype-tally case below also satisfies the Rotterdam first-line gate
(irregular_cycle + polycystic_ovaries_usg = 2 of 3) added per mentor feedback,
since the 4-phenotype tally no longer runs at all for someone who doesn't meet
Rotterdam criteria -- see the dedicated Rotterdam-gate tests at the bottom.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.rule_engine import run_pipeline  # noqa: E402
from app.recommendations import build_recommendation  # noqa: E402

ROTTERDAM_PASS = {"irregular_cycle": "yes", "polycystic_ovaries_usg": "yes"}


def test_case1_metabolic_primary_by_tally_no_override():
    # Hand tally: BMI/WHR(1) + acanthosis(1) + skin tags(1) + postprandial(1)
    # + glucose/insulin(1) + HbA1c(1) + HOMA-IR(1) + lipid ratio(1) = 8/10 = 80%
    # sedentary=no, ultraprocessed=no -> both negative. Insulin 6 and HOMA-IR 1.8
    # are both below the >10 / >2.0 override thresholds, so no override fires.
    # (metabolic_lipid, a second lipid-panel question added per mentor
    # feedback, also fires off the same triglycerides/hdl values -> +1 tick.)
    answers = {
        **ROTTERDAM_PASS,
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

    assert scores["metabolic"]["positive_count"] == 9
    assert scores["metabolic"]["biochemical_positive_count"] == 5  # glucose/insulin, hba1c, homa-ir, lipid ratio, lipid panel
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
        **ROTTERDAM_PASS,
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
    # Adrenal: fatigue(1) + worried(1) + poor concentration(1) = 3/10 = 30%
    # Hormonal: alopecia(1) + absent cycle(1) + severe hirsutism(1) = 3/10 = 30%
    # (Metabolic now carries 13 questions instead of 10 after the mentor-feedback
    # additions -- BMI/lipid/apnea/body-type -- so it can no longer tie cleanly
    # against a 10-question phenotype; Adrenal and Hormonal are both still
    # 10-question categories, so they're used for the tie case instead.)
    # Tie at 30%, no lab values entered, so no override can fire ->
    # Mixed/Combination Phenotype.
    answers = {
        **ROTTERDAM_PASS,
        "adrenal_fatigue": "yes",
        "worried": "yes",
        "poor_concentration": "yes",
        "alopecia": "yes",
        "cycle_absent": "yes",
        "hirsutism_severity": "Severe",
    }
    result = run_pipeline(answers)
    scores, classification = result["scores"], result["classification"]

    assert scores["adrenal"]["positive_count"] == 3
    assert scores["hormonal"]["positive_count"] == 3
    assert classification["overrides_triggered"] == []
    assert classification["classification"] == "Mixed/Combination Phenotype"
    assert classification["primary_phenotype"] is None
    assert set(classification["phenotypes_involved"]) == {"adrenal", "hormonal"}


def test_case4_inconclusive_when_rotterdam_met_but_no_findings():
    # Rotterdam criteria met, but nothing else answered -> still a valid PCOS
    # diagnosis with an inconclusive phenotype (not "excluded"/"not_pcos").
    result = run_pipeline(dict(ROTTERDAM_PASS))
    classification = result["classification"]
    assert classification["classification"] == "Inconclusive / Minimal Findings"
    assert classification["primary_phenotype"] is None
    for pid in ("adrenal", "hormonal", "inflammatory", "metabolic"):
        assert result["scores"][pid]["positive_count"] == 0


def test_case5_multiple_overrides_force_mixed_classification():
    # Fasting insulin 12 > 10 -> Metabolic override.
    # hs-CRP 2.0 > 1.5 -> Inflammatory override.
    # Both fire at once regardless of tally -> Mixed/Combination Phenotype.
    answers = {**ROTTERDAM_PASS, "fasting_insulin": 12, "hs_crp": 2.0}
    result = run_pipeline(answers)
    classification = result["classification"]

    override_phenotypes = sorted(o["phenotype"] for o in classification["overrides_triggered"])
    assert override_phenotypes == ["inflammatory", "metabolic"]
    assert classification["classification"] == "Mixed/Combination Phenotype"
    assert classification["primary_phenotype"] is None
    assert set(classification["phenotypes_involved"]) == {"inflammatory", "metabolic"}


def test_biomarker_support_flag_surfaces_without_forcing_primary():
    # 5 biochemical findings in Metabolic (glucose/insulin, HbA1c, HOMA-IR
    # under the 2.0 override line, lipid ratio, lipid panel) should flip the
    # informational "3+ positive biomarkers" flag on, even though tally alone
    # already made Metabolic primary here -- this checks the flag computes
    # independently.
    answers = {
        **ROTTERDAM_PASS,
        "fasting_glucose": 100, "fasting_insulin": 6,
        "hba1c": 5.6, "homa_ir": 1.8,
        "triglycerides": 160, "hdl": 40,
    }
    result = run_pipeline(answers)
    scores = result["scores"]
    assert scores["metabolic"]["biochemical_positive_count"] == 5
    assert scores["metabolic"]["biomarker_support_flag"] is True
    assert "metabolic" in result["classification"]["biomarker_supported_phenotypes"]


# ---------------------------------------------------------------------------
# Rotterdam first-line gate + exclusion criteria (mentor feedback, Sep 2026):
# these run BEFORE the 4-phenotype tally and can short-circuit it entirely.
# ---------------------------------------------------------------------------
def test_rotterdam_not_met_short_circuits_before_scoring():
    # No Rotterdam criteria answered at all -> gated out before phenotyping,
    # even though these lab values would otherwise trigger a Metabolic tally.
    answers = {"acanthosis_nigricans": "yes", "skin_tags": "yes"}
    result = run_pipeline(answers)
    classification = result["classification"]
    assert classification["classification"] == "Inconclusive — Does not meet Rotterdam Criteria"
    assert classification["primary_phenotype"] is None
    assert classification["phenotypes_involved"] == []


def test_rotterdam_met_by_testosterone_lab_value_alone():
    # Total testosterone 60 ng/dL (> 45) satisfies the "high testosterone"
    # criterion without needing the symptom checkbox.
    answers = {"irregular_cycle": "yes", "total_testosterone": 60}
    result = run_pipeline(answers)
    assert result["classification"]["classification"] != "Inconclusive — Does not meet Rotterdam Criteria"


def test_excluded_when_other_disorder_flagged():
    # Exclusion criteria (CAH, androgen-secreting tumor, Cushing's, etc.)
    # short-circuits everything, even if Rotterdam would otherwise be met.
    answers = {**ROTTERDAM_PASS, "exclusion_other_disorders": "yes"}
    result = run_pipeline(answers)
    classification = result["classification"]
    assert classification["classification"] == "Excluded"
    assert classification["primary_phenotype"] is None


# ---------------------------------------------------------------------------
# Body-type diet branching (mentor feedback): an Obese-phenotype and a
# Lean-phenotype person with the *same* classification should get different
# diet/exercise guidance layered on top of the shared phenotype protocol.
# ---------------------------------------------------------------------------
def test_body_type_changes_diet_strategy_for_same_phenotype():
    classification = {"phenotypes_involved": ["metabolic"], "classification": "Primary Phenotype"}
    scores = {"mitochondrial": {"flag": False}}

    obese = build_recommendation(classification, scores, "South Indian", "Vegetarian", "Obese")
    lean = build_recommendation(classification, scores, "South Indian", "Vegetarian", "Lean")
    neither = build_recommendation(classification, scores, "South Indian", "Vegetarian", None)

    obese_strategy = obese["phenotype_blocks"][0]["diet_strategy"]
    lean_strategy = lean["phenotype_blocks"][0]["diet_strategy"]
    neither_strategy = neither["phenotype_blocks"][0]["diet_strategy"]

    assert obese_strategy != lean_strategy
    assert len(obese_strategy) > len(neither_strategy)
    assert len(lean_strategy) > len(neither_strategy)
    assert obese["phenotype_blocks"][0]["body_type"] == "Obese"
