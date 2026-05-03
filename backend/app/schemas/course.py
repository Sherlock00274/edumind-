from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, Field


class DocumentType(StrEnum):
    SYLLABUS = "syllabus"
    SLIDES = "slides"
    NOTES = "notes"
    PAST_PAPER = "past_paper"
    MARKING_SCHEME = "marking_scheme"
    TUTORIAL = "tutorial"
    HOMEWORK = "homework"
    QUIZ = "quiz"
    OTHER = "other"


class ParseStatus(StrEnum):
    PENDING = "pending"
    PROCESSING = "processing"
    PARSED = "parsed"
    FAILED = "failed"


class DocumentScope(StrEnum):
    COURSE = "course"
    CHAPTER = "chapter"
    MULTI_CHAPTER = "multi_chapter"


class CourseDetails(BaseModel):
    grading_policy: str | None = Field(default=None, alias="gradingPolicy")
    assessment_scheme: str | None = Field(default=None, alias="assessmentScheme")
    exam_format: str | None = Field(default=None, alias="examFormat")
    learning_outcomes: list[str] = Field(default_factory=list, alias="learningOutcomes")
    schedule: str | None = None


class ChapterCreate(BaseModel):
    title: str
    description: str | None = None
    keywords: list[str] = []


class ChapterRead(BaseModel):
    id: str
    course_id: str = Field(alias="courseId")
    title: str
    order_index: int = Field(alias="orderIndex")
    description: str | None = None
    keywords: list[str] = []


class CourseStructureDraft(BaseModel):
    code: str | None = None
    title: str
    subject: str | None = None
    details: CourseDetails = Field(default_factory=CourseDetails)
    chapters: list[ChapterCreate]


class CourseCreate(BaseModel):
    title: str
    code: str | None = None
    subject: str | None = None
    exam_date: datetime | None = None
    details: CourseDetails = Field(default_factory=CourseDetails)
    chapters: list[ChapterCreate] = []


class CourseRead(BaseModel):
    id: str
    user_id: str
    code: str | None = None
    title: str
    subject: str | None = None
    exam_date: datetime | None = None
    details: CourseDetails = Field(default_factory=CourseDetails)
    created_at: datetime


class SourceDocumentRead(BaseModel):
    id: str
    course_id: str
    type: DocumentType
    filename: str
    scope: DocumentScope = DocumentScope.COURSE
    chapter_ids: list[str] = Field(default_factory=list, alias="chapterIds")
    parse_status: ParseStatus
    created_at: datetime


class BatchDocumentIngestRead(BaseModel):
    documents: list[SourceDocumentRead]
    cards_count: int


class CourseStructureUpdate(BaseModel):
    code: str | None = None
    title: str
    subject: str | None = None
    details: CourseDetails = Field(default_factory=CourseDetails)
    chapters: list[ChapterCreate]


class TextIngestRequest(BaseModel):
    document_type: DocumentType = DocumentType.NOTES
    filename: str = "pasted-material.txt"
    content: str
