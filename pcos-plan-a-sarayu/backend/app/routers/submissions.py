from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..ai_assistant import answer_pcos_query
from ..database import get_db
from ..recommendations import build_recommendation
from ..report_parser import get_recommended_doctor_tests, parse_lab_text
from ..rule_engine import QUESTIONNAIRE, run_pipeline

router = APIRouter(prefix="/api", tags=["submissions"])


@router.get("/questionnaire")
def get_questionnaire():
    return QUESTIONNAIRE


@router.post("/submit", response_model=schemas.SubmissionResult)
def submit(payload: schemas.SubmissionCreate, db: Session = Depends(get_db)):
    result = run_pipeline(payload.answers)
    recommendation = build_recommendation(
        result["classification"],
        result["scores"],
        payload.region_preference,
        payload.diet_type,
        body_type_data=result.get("body_type"),
    )

    record = models.Submission(
        demographics=payload.demographics,
        answers=payload.answers,
        primary_goals=payload.primary_goals,
        region_preference=payload.region_preference,
        diet_type=payload.diet_type,
        scores=result["scores"],
        classification=result["classification"],
        recommendation=recommendation,
        questionnaire_version=QUESTIONNAIRE["meta"]["version"],
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return schemas.SubmissionResult(
        id=str(record.id),
        created_at=record.created_at.isoformat(),
        scores=record.scores,
        rotterdam=result.get("rotterdam"),
        body_type=result.get("body_type"),
        classification=record.classification,
        recommendation=record.recommendation,
        questionnaire_version=record.questionnaire_version,
    )


@router.get("/result/{submission_id}", response_model=schemas.SubmissionResult)
def get_result(submission_id: str, db: Session = Depends(get_db)):
    record = db.query(models.Submission).filter(models.Submission.id == submission_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Submission not found")
    return schemas.SubmissionResult(
        id=str(record.id),
        created_at=record.created_at.isoformat(),
        scores=record.scores,
        rotterdam=record.recommendation.get("rotterdam"),
        body_type=record.recommendation.get("body_type_protocol"),
        classification=record.classification,
        recommendation=record.recommendation,
        questionnaire_version=record.questionnaire_version,
    )


@router.post("/parse-report")
def parse_report(payload: schemas.ReportParseRequest):
    return parse_lab_text(payload.raw_text)


@router.get("/recommended-tests")
def recommended_tests():
    return get_recommended_doctor_tests()


@router.post("/chatbot")
def chatbot(payload: schemas.ChatbotQueryRequest):
    return answer_pcos_query(payload.query)


@router.post("/feedback")
def submit_feedback(payload: schemas.FeedbackCreate, db: Session = Depends(get_db)):
    fb = models.Feedback(rating=payload.rating, category=payload.category, comments=payload.comments)
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return {"status": "success", "id": str(fb.id), "message": "Thank you for your feedback!"}
