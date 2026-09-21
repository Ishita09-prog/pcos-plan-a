from datetime import date
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict


class SubmissionCreate(BaseModel):
    model_config = ConfigDict(extra="allow")

    demographics: Dict[str, Any] = {}
    answers: Dict[str, Any]
    primary_goals: List[str] = []
    region_preference: str  # "South Indian" | "North Indian"
    diet_type: str  # "Vegetarian" | "Non-Vegetarian" | "Vegan"


class SubmissionResult(BaseModel):
    id: str
    created_at: str
    scores: Dict[str, Any]
    classification: Dict[str, Any]
    recommendation: Dict[str, Any]
    questionnaire_version: str

    model_config = ConfigDict(from_attributes=True)
