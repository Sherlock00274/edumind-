from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, Field

from app.schemas.common import StudyMode
from app.schemas.concept import CardView


class FeedbackValue(StrEnum):
    MASTERED = "mastered"
    UNSURE = "unsure"


class StudySessionCreate(BaseModel):
    mode: StudyMode
    concept_id: str | None = Field(default=None, alias="conceptId")
    chapter_id: str | None = Field(default=None, alias="chapterId")


class StudySessionRead(BaseModel):
    session_id: str = Field(alias="sessionId")
    mode: StudyMode
    cards: list[CardView]
    insert_quiz_every: int = Field(default=3, alias="insertQuizEvery")


class StudyFeedbackCreate(BaseModel):
    concept_id: str = Field(alias="conceptId")
    feedback: FeedbackValue
    response_time: float = Field(alias="responseTime", ge=0)
    timestamp: datetime


class SessionStatsRead(BaseModel):
    total: int
    mastered: int
    unsure: int
