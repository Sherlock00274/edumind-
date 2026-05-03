from pydantic import BaseModel, Field

from app.schemas.concept import CardView, ConceptStateRead


class StudySessionSummary(BaseModel):
    id: str
    timestamp: int
    duration: int
    concepts_count: int = Field(alias="conceptsCount")
    mastery_rate: float = Field(alias="masteryRate")


class UpcomingReview(BaseModel):
    concept_id: str = Field(alias="conceptId")
    concept_name: str = Field(alias="conceptName")
    scheduled_time: int = Field(alias="scheduledTime")


class CourseAnalyticsRead(BaseModel):
    mastery_rate: float = Field(alias="masteryRate")
    resolved_today: int = Field(alias="resolvedToday")
    weak_pool_count: int = Field(alias="weakPoolCount")
    weak_concepts: list[CardView] = Field(alias="weakConcepts")
    concept_states: list[ConceptStateRead] = Field(alias="conceptStates")
    sessions: list[StudySessionSummary]
    upcoming_reviews: list[UpcomingReview] = Field(alias="upcomingReviews")
