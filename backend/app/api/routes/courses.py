import re
from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status

from app.api.deps import CurrentUser
from app.core.config import settings
from app.schemas.concept import CardView
from app.schemas.course import (
    BatchDocumentIngestRead,
    ChapterRead,
    CourseCreate,
    CourseRead,
    CourseStructureDraft,
    CourseStructureUpdate,
    DocumentScope,
    SourceDocumentRead,
    TextIngestRequest,
)
from app.schemas.question import QuestionView, UserAnswerCreate, UserAnswerResult
from app.services.course_parsing.document_ingest import extract_uploaded_document
from app.services.course_parsing.service import parse_text_to_cards
from app.services.course_parsing.syllabus_parser import parse_syllabus_to_structure
from app.services.diagnostic.service import generate_diagnostic_questions
from app.services.in_memory import store

router = APIRouter(prefix="/courses", tags=["courses"])


@router.post("", response_model=CourseRead, status_code=status.HTTP_201_CREATED)
def create_course(payload: CourseCreate, user: CurrentUser) -> CourseRead:
    return store.create_course(payload, user.id)


@router.post("/from-syllabus", response_model=CourseStructureDraft)
async def analyze_syllabus(
    file: Annotated[UploadFile, File()],
    user: CurrentUser,
) -> CourseStructureDraft:
    content = await file.read()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Syllabus file is empty",
        )
    api_key = store.resolve_llm_api_key(user.id, settings.llm_api_key)
    extracted = await extract_uploaded_document(file.filename or "syllabus", content, api_key=api_key)
    return parse_syllabus_to_structure(extracted.text, extracted.filename, api_key=api_key)


@router.get("", response_model=list[CourseRead])
def list_courses(user: CurrentUser) -> list[CourseRead]:
    return store.list_courses(user.id)


@router.get("/{course_id}", response_model=CourseRead)
def get_course(course_id: str, user: CurrentUser) -> CourseRead:
    course = store.get_course(course_id, user.id)
    if course is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return course


@router.patch("/{course_id}/structure", response_model=CourseRead)
def update_course_structure(
    course_id: str,
    payload: CourseStructureUpdate,
    user: CurrentUser,
) -> CourseRead:
    course = store.update_course_structure(course_id, payload, user.id)
    if course is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return course


@router.get("/{course_id}/chapters", response_model=list[ChapterRead])
def list_chapters(course_id: str, user: CurrentUser) -> list[ChapterRead]:
    if store.get_course(course_id, user.id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return store.list_chapters(course_id)


@router.post("/{course_id}/documents/text", response_model=SourceDocumentRead)
def ingest_text_document(
    course_id: str,
    payload: TextIngestRequest,
    user: CurrentUser,
) -> SourceDocumentRead:
    if store.get_course(course_id, user.id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    document = store.add_text_document(course_id, payload.filename, payload.document_type)
    cards = parse_text_to_cards(
        course_id,
        payload.content,
        api_key=store.resolve_llm_api_key(user.id, settings.llm_api_key),
    )
    store.set_generated_cards(course_id, cards)
    return document


@router.post("/{course_id}/documents/files", response_model=BatchDocumentIngestRead)
async def ingest_file_documents(
    course_id: str,
    files: Annotated[list[UploadFile], File()],
    user: CurrentUser,
    chapter_ids: Annotated[list[str] | None, Form()] = None,
) -> BatchDocumentIngestRead:
    chapter_ids = chapter_ids or []
    if store.get_course(course_id, user.id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one file is required",
        )

    scope = document_scope(chapter_ids)
    api_key = store.resolve_llm_api_key(user.id, settings.llm_api_key)
    documents: list[SourceDocumentRead] = []
    cards: list[CardView] = []
    chapters = store.list_chapters(course_id)
    course = store.get_course(course_id, user.id)
    for file in files:
        content = await file.read()
        if not content:
            continue
        extracted = await extract_uploaded_document(
            file.filename or "uploaded-file",
            content,
            api_key=api_key,
        )
        assigned_chapters = chapter_ids or infer_chapter_ids(
            extracted.text,
            chapters,
        )
        document = store.add_text_document(
            course_id,
            extracted.filename,
            extracted.document_type,
            scope=document_scope(assigned_chapters) if not chapter_ids else scope,
            chapter_ids=assigned_chapters,
        )
        documents.append(document)
        section = (
            f"Filename: {extracted.filename}\n"
            f"Document type: {extracted.document_type.value}\n\n"
            f"{extracted.text}"
        )
        parsed_cards = parse_text_to_cards(course_id, section, api_key=api_key)
        if course is not None:
            assign_cards_to_chapters(parsed_cards, course, chapters, assigned_chapters)
        cards.extend(parsed_cards)

    if not documents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded files were empty",
        )

    store.append_generated_cards(course_id, cards)
    return BatchDocumentIngestRead(documents=documents, cards_count=len(cards))


@router.post(
    "/{course_id}/chapters/{chapter_id}/documents/files",
    response_model=BatchDocumentIngestRead,
)
async def ingest_chapter_file_documents(
    course_id: str,
    chapter_id: str,
    files: Annotated[list[UploadFile], File()],
    user: CurrentUser,
) -> BatchDocumentIngestRead:
    if store.get_course(course_id, user.id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    if chapter_id not in {chapter.id for chapter in store.list_chapters(course_id)}:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chapter not found")
    return await ingest_file_documents(course_id, files, user, [chapter_id])


@router.get("/{course_id}/documents", response_model=list[SourceDocumentRead])
def list_documents(course_id: str, user: CurrentUser) -> list[SourceDocumentRead]:
    if store.get_course(course_id, user.id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return store.list_documents(course_id)


@router.get("/{course_id}/diagnostic/questions", response_model=list[QuestionView])
def get_diagnostic_questions(course_id: str, user: CurrentUser) -> list[QuestionView]:
    if store.get_course(course_id, user.id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return generate_diagnostic_questions(store.list_concepts(course_id))


@router.post("/{course_id}/answers", response_model=UserAnswerResult)
def submit_answer(
    course_id: str,
    payload: UserAnswerCreate,
    user: CurrentUser,
) -> UserAnswerResult:
    if store.get_course(course_id, user.id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    result = store.record_quiz_answer(user.id, course_id, payload)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    return result


def document_scope(chapter_ids: list[str]) -> DocumentScope:
    if len(chapter_ids) == 1:
        return DocumentScope.CHAPTER
    if len(chapter_ids) > 1:
        return DocumentScope.MULTI_CHAPTER
    return DocumentScope.COURSE


def infer_chapter_ids(text: str, chapters: list[ChapterRead]) -> list[str]:
    scored: list[tuple[int, str]] = []
    for chapter in chapters:
        score = chapter_match_score(text, chapter)
        if score >= 2:
            scored.append((score, chapter.id))
    scored.sort(reverse=True)
    return [chapter_id for _, chapter_id in scored[:3]]


def assign_cards_to_chapters(
    cards: list[CardView],
    course: CourseRead,
    chapters: list[ChapterRead],
    candidate_chapter_ids: list[str],
) -> None:
    candidates = [
        chapter
        for chapter in chapters
        if not candidate_chapter_ids or chapter.id in candidate_chapter_ids
    ]
    if len(candidates) == 1:
        single_candidate = candidates[0]
        for card in cards:
            card.chapter = format_card_chapter(course, single_candidate)
        return

    for card in cards:
        matched_chapter = best_matching_chapter(card, candidates or chapters)
        if matched_chapter is None and candidates:
            matched_chapter = candidates[0]
        if matched_chapter is not None:
            card.chapter = format_card_chapter(course, matched_chapter)


def best_matching_chapter(card: CardView, chapters: list[ChapterRead]) -> ChapterRead | None:
    haystack = " ".join(
        [
            getattr(card, "chapter", ""),
            getattr(card, "concept_en", ""),
            getattr(card, "concept_zh", "") or "",
            getattr(card, "description", ""),
            getattr(card, "description_zh", "") or "",
            getattr(card, "description_en", "") or "",
            getattr(card, "source", ""),
        ]
    ).lower()
    best_score = 0
    best_chapter: ChapterRead | None = None
    for chapter in chapters:
        score = chapter_match_score(haystack, chapter)
        if score > best_score:
            best_score = score
            best_chapter = chapter
    return best_chapter if best_score >= 1 else None


def format_card_chapter(course: CourseRead, chapter: ChapterRead) -> str:
    return f"{course.title} > {chapter.title}"


def chapter_match_score(text: str, chapter: ChapterRead) -> int:
    haystack = text.lower()
    haystack_tokens = normalized_tokens(haystack)
    score = 0
    for term in [chapter.title, *chapter.keywords]:
        term_score = term_match_score(term, haystack, haystack_tokens)
        score += term_score
    return score


def term_match_score(term: str, haystack: str, haystack_tokens: set[str]) -> int:
    normalized = term.strip().lower()
    if not normalized:
        return 0

    if len(normalized) <= 3 or not normalized.isalpha():
        return 3 if re.search(rf"(?<![a-z0-9]){re.escape(normalized)}(?![a-z0-9])", haystack) else 0

    if re.search(rf"(?<![a-z0-9]){re.escape(normalized)}(?![a-z0-9])", haystack):
        return 4

    term_tokens = normalized_tokens(normalized)
    if not term_tokens:
        return 0
    overlap = term_tokens & haystack_tokens
    if len(term_tokens) == 1:
        return 2 if overlap else 0
    return min(len(overlap), 3) if overlap else 0


def normalized_tokens(text: str) -> set[str]:
    stopwords = {
        "and",
        "or",
        "the",
        "of",
        "to",
        "in",
        "with",
        "under",
        "large",
        "simple",
    }
    tokens = set()
    for token in re.findall(r"[a-z0-9]+", text.lower()):
        if len(token) <= 2 or token in stopwords:
            continue
        tokens.add(token[:-1] if token.endswith("s") and len(token) > 4 else token)
    return tokens
