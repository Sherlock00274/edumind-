from datetime import date, datetime
from enum import StrEnum

from pydantic import BaseModel, Field


class TaskType(StrEnum):
    LEARN = "learn"
    REVIEW = "review"
    TEST = "test"


class StudyPlanTask(BaseModel):
    id: str
    concept_id: str = Field(alias="conceptId")
    duration_minutes: int = Field(alias="durationMinutes")
    type: TaskType
    priority: float
    scheduled_for: date | datetime = Field(alias="scheduledFor")


class StudyPlanRead(BaseModel):
    id: str
    course_id: str = Field(alias="courseId")
    generated_at: datetime = Field(alias="generatedAt")
    days_left: int = Field(alias="daysLeft")
    tasks: list[StudyPlanTask]


class StudyPlanCreate(BaseModel):
    days_left: int = Field(alias="daysLeft", ge=0)
    minutes_per_day: int = Field(alias="minutesPerDay", gt=0)
