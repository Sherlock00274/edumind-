from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, Field


class EvidenceLevel(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Difficulty(StrEnum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class QuestionType(StrEnum):
    MCQ = "MCQ"
    TF = "TF"
    APPLICATION = "Application"


class StudyMode(StrEnum):
    NORMAL = "NORMAL"
    WEAKNESS = "WEAKNESS"
    SINGLE = "SINGLE"
    CHAPTER = "CHAPTER"


class Timestamped(BaseModel):
    created_at: datetime | None = None
    updated_at: datetime | None = None


class JobStatus(BaseModel):
    job_id: str = Field(alias="jobId")
    status: str
    progress: int = Field(ge=0, le=100)
    message: str | None = None
