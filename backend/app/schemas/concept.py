from pydantic import BaseModel, Field

from app.schemas.common import EvidenceLevel
from app.schemas.question import QuestionView


class ChapterRead(BaseModel):
    id: str
    course_id: str
    title: str
    order_index: int


class ConceptRead(BaseModel):
    id: str
    course_id: str
    chapter_id: str | None = None
    name_en: str = Field(alias="nameEn")
    name_zh: str | None = Field(default=None, alias="nameZh")
    description: str
    importance: float = Field(ge=0, le=1)
    exam_weight: float = Field(alias="examWeight", ge=0, le=1)
    prerequisites: list[str] = []
    source_chunk_ids: list[str] = Field(default_factory=list, alias="sourceChunkIds")
    evidence_level: EvidenceLevel = Field(alias="evidenceLevel")


class ConceptStateRead(BaseModel):
    concept_id: str = Field(alias="conceptId")
    mastery: float = Field(ge=0, le=1)
    confidence: float = Field(ge=0, le=1)
    avg_response_time: float = Field(alias="avgResponseTime")
    error_count: int = Field(alias="errorCount")
    last_reviewed_at: str | None = Field(default=None, alias="lastReviewedAt")
    next_review_at: str | None = Field(default=None, alias="nextReviewAt")
    error_patterns: list[str] = Field(default_factory=list, alias="errorPatterns")


class CardView(BaseModel):
    id: str
    chapter: str
    concept_en: str = Field(alias="conceptEn")
    concept_zh: str | None = Field(default=None, alias="conceptZh")
    description: str
    description_zh: str | None = Field(default=None, alias="descriptionZh")
    description_en: str | None = Field(default=None, alias="descriptionEn")
    source: str
    source_chunk_ids: list[str] = Field(default_factory=list, alias="sourceChunkIds")
    error_count: int = Field(alias="errorCount")
    mastery: float = Field(ge=0, le=1)
    evidence_level: EvidenceLevel = Field(alias="evidenceLevel")
    inline_quiz: QuestionView = Field(alias="inlineQuiz")


class ActiveConceptsUpdate(BaseModel):
    concept_ids: list[str] = Field(alias="conceptIds")
