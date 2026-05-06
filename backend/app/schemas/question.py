from pydantic import BaseModel, Field

from app.schemas.common import Difficulty, EvidenceLevel, QuestionType


class QuizOption(BaseModel):
    id: str
    text: str


class QuestionView(BaseModel):
    id: str
    concept_id: str = Field(alias="conceptId")
    type: QuestionType
    difficulty: Difficulty
    stem: str
    options: list[QuizOption]
    answer: str
    explanation: str | None = None
    source_chunk_ids: list[str] = Field(default_factory=list, alias="sourceChunkIds")
    evidence_level: EvidenceLevel = Field(alias="evidenceLevel")


class UserAnswerCreate(BaseModel):
    question_id: str = Field(alias="questionId")
    confidence: float = Field(ge=0, le=1)
    response_time: float = Field(alias="responseTime", ge=0)
    selected_answer: str = Field(alias="selectedAnswer")


class UserAnswerResult(BaseModel):
    question_id: str = Field(alias="questionId")
    concept_id: str = Field(alias="conceptId")
    correct: bool
    answer: str
    mastery: float
    confidence: float
    avg_response_time: float = Field(alias="avgResponseTime")
    error_count: int = Field(alias="errorCount")
