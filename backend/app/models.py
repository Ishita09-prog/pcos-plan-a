import uuid
from datetime import datetime

from sqlalchemy import JSON, Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID

from .database import Base, engine


def _uuid_column():
    # UUID type on Postgres, plain string on the SQLite fallback.
    if engine.dialect.name == "postgresql":
        return Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    return Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))


class Submission(Base):
    """
    One patient's raw answers + the resulting classification, exactly as the
    rule engine produced it. Storing the full result alongside the raw answers
    keeps every past result reproducible and auditable even if the JSON rules
    change later (Step 1's "single source of truth" promise).
    """
    __tablename__ = "submissions"

    id = _uuid_column()
    created_at = Column(DateTime, default=datetime.utcnow)
    demographics = Column(JSON, nullable=False, default=dict)
    answers = Column(JSON, nullable=False, default=dict)
    primary_goals = Column(JSON, nullable=False, default=list)
    region_preference = Column(String, nullable=True)
    diet_type = Column(String, nullable=True)

    scores = Column(JSON, nullable=False, default=dict)
    classification = Column(JSON, nullable=False, default=dict)
    recommendation = Column(JSON, nullable=False, default=dict)
    questionnaire_version = Column(String, nullable=False, default="1.0.0")


Base.metadata.create_all(bind=engine)
