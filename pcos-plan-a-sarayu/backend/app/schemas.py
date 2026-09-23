from datetime import date
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict


class SubmissionCreate(BaseModel):
    model_config = ConfigDict(extra="allow")

    demographics: Dict[str, Any] = {}
    answers: Dict[str, Any]
    primary_goals: List[str] = []
    region_preference: str = "South Indian"
    diet_type: str = "Vegetarian"


class SubmissionResult(BaseModel):
    id: str
    created_at: str
    scores: Dict[str, Any]
    rotterdam: Optional[Dict[str, Any]] = None
    body_type: Optional[Dict[str, Any]] = None
    classification: Dict[str, Any]
    recommendation: Dict[str, Any]
    questionnaire_version: str

    model_config = ConfigDict(from_attributes=True)


class ReportParseRequest(BaseModel):
    raw_text: str


class ChatbotQueryRequest(BaseModel):
    query: str


class FeedbackCreate(BaseModel):
    rating: int = 5
    category: str = "General Website Experience"
    comments: str
