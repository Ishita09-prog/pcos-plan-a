import uuid
from datetime import datetime

from sqlalchemy import JSON, Column, DateTime, Integer, String
from sqlalchemy.dialects.postgresql import UUID

from .database import Base, engine


def _uuid_column():
    if engine.dialect.name == "postgresql":
        return Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    return Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))


class Submission(Base):
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
    questionnaire_version = Column(String, nullable=False, default="2.0.0")


class Feedback(Base):
    __tablename__ = "feedback"

    id = _uuid_column()
    created_at = Column(DateTime, default=datetime.utcnow)
    rating = Column(Integer, nullable=False, default=5)
    category = Column(String, nullable=False, default="General Website Experience")
    comments = Column(String, nullable=False)


Base.metadata.create_all(bind=engine)
