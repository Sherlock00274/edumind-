from __future__ import annotations

from datetime import UTC, date, datetime, timedelta
from hashlib import sha256
from uuid import uuid4

from sqlalchemy import delete, select
from sqlalchemy.exc import OperationalError

from app.db.models import (
    ActiveConceptModel,
    AuthTokenModel,
    CardModel,
    ChapterModel,
    ConceptModel,
    CourseModel,
    SourceDocumentModel,
    StudySessionModel,
    UserModel,
)
from app.db.session import SessionLocal, init_db
from app.schemas.common import Difficulty, EvidenceLevel, QuestionType, StudyMode
from app.schemas.concept import CardView, ConceptRead
from app.schemas.course import (
    ChapterCreate,
    ChapterRead,
    CourseCreate,
    CourseDetails,
    CourseRead,
    CourseStructureUpdate,
    DocumentScope,
    DocumentType,
    ParseStatus,
    SourceDocumentRead,
)
from app.schemas.question import QuestionView, QuizOption
from app.schemas.study import StudySessionRead
from app.schemas.user import ActivityDay, ProfileStatsRead, UserCreate, UserRead

DEMO_CARD_IDS = {"concept_demo_a_star"}


def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid4().hex[:12]}"


class PersistentStore:
    def __init__(self) -> None:
        init_db()

    def create_course(self, payload: CourseCreate, user_id: str) -> CourseRead:
        with SessionLocal() as db:
            course = CourseModel(
                id=new_id("course"),
                user_id=user_id,
                code=payload.code,
                title=payload.title,
                subject=payload.subject,
                exam_date=payload.exam_date,
                details=payload.details.model_dump(mode="json", by_alias=True),
                created_at=datetime.now(UTC),
            )
            db.add(course)
            db.commit()
            if payload.chapters:
                self.set_chapters(course.id, payload.chapters)
            return course_to_schema(course)

    def list_courses(self, user_id: str) -> list[CourseRead]:
        with SessionLocal() as db:
            courses = db.scalars(
                select(CourseModel)
                .where(CourseModel.user_id == user_id)
                .order_by(CourseModel.created_at.desc())
            ).all()
            return [course_to_schema(course) for course in courses]

    def get_course(self, course_id: str, user_id: str | None = None) -> CourseRead | None:
        with SessionLocal() as db:
            course = db.get(CourseModel, course_id)
            if course is None or (user_id is not None and course.user_id != user_id):
                return None
            return course_to_schema(course)

    def update_course_structure(
        self,
        course_id: str,
        payload: CourseStructureUpdate,
        user_id: str,
    ) -> CourseRead | None:
        with SessionLocal() as db:
            course = db.get(CourseModel, course_id)
            if course is None or course.user_id != user_id:
                return None
            course.code = payload.code
            course.title = payload.title
            course.subject = payload.subject
            course.details = payload.details.model_dump(mode="json", by_alias=True)
            db.commit()
            db.refresh(course)
        self.set_chapters(course_id, payload.chapters)
        return self.get_course(course_id, user_id)

    def set_chapters(self, course_id: str, chapters: list[ChapterCreate]) -> list[ChapterRead]:
        with SessionLocal() as db:
            existing = db.scalars(
                select(ChapterModel).where(ChapterModel.course_id == course_id)
            ).all()
            existing_by_title = {chapter.title.strip().lower(): chapter.id for chapter in existing}
            db.execute(delete(ChapterModel).where(ChapterModel.course_id == course_id))
            stored = [
                ChapterModel(
                    id=existing_by_title.get(chapter.title.strip().lower(), new_id("chapter")),
                    course_id=course_id,
                    title=chapter.title,
                    order_index=index,
                    description=chapter.description,
                    keywords=chapter.keywords,
                )
                for index, chapter in enumerate(chapters, start=1)
            ]
            db.add_all(stored)
            db.commit()
            return [chapter_to_schema(chapter) for chapter in stored]

    def list_chapters(self, course_id: str) -> list[ChapterRead]:
        with SessionLocal() as db:
            chapters = db.scalars(
                select(ChapterModel)
                .where(ChapterModel.course_id == course_id)
                .order_by(ChapterModel.order_index)
            ).all()
            return [chapter_to_schema(chapter) for chapter in chapters]

    def create_user(self, payload: UserCreate) -> UserRead:
        with SessionLocal() as db:
            if self._get_user_model_by_email(db, payload.email) is not None:
                raise ValueError("Email already registered")
            user = UserModel(
                id=new_id("user"),
                name=payload.name,
                email=payload.email.lower(),
                subject=payload.subject,
                level=1,
                password_hash=hash_password(payload.password),
                created_at=datetime.now(UTC),
            )
            db.add(user)
            db.commit()
            return user_to_schema(user)

    def get_user_by_email(self, email: str) -> UserRead | None:
        with SessionLocal() as db:
            user = self._get_user_model_by_email(db, email)
            return user_to_schema(user) if user is not None else None

    def authenticate_user(self, email: str, password: str) -> UserRead | None:
        with SessionLocal() as db:
            user = self._get_user_model_by_email(db, email)
            if user is None or user.password_hash != hash_password(password):
                return None
            return user_to_schema(user)

    def create_token(self, user_id: str) -> str:
        with SessionLocal() as db:
            token = new_id("token")
            db.add(AuthTokenModel(token=token, user_id=user_id, created_at=datetime.now(UTC)))
            db.commit()
            return token

    def get_user_by_token(self, token: str) -> UserRead | None:
        try:
            with SessionLocal() as db:
                auth_token = db.get(AuthTokenModel, token)
                if auth_token is None:
                    return None
                user = db.get(UserModel, auth_token.user_id)
                return user_to_schema(user) if user is not None else None
        except OperationalError:
            init_db()
            return None

    def get_demo_user(self) -> UserRead:
        existing = self.get_user_by_email("felix@example.com")
        if existing is not None:
            return existing
        return self.create_user(
            UserCreate(
                name="Felix Wang",
                email="felix@example.com",
                password="password",
                subject="Computer Science",
            )
        )

    def get_profile_stats(self, user_id: str) -> ProfileStatsRead:
        cards = [
            card
            for course in self.list_courses(user_id)
            for card in self.get_cards(course.id)
        ]
        mastery_rate = sum(card.mastery for card in cards) / max(len(cards), 1)
        completed_sessions = [
            session
            for session in self.list_session_records(user_id)
            if session.completed_at is not None
        ]
        total_study_time = sum(session.duration for session in completed_sessions)
        activity = build_activity_distribution(completed_sessions)
        first_half = activity[:14]
        second_half = activity[14:]
        old_minutes = sum(day.minutes for day in first_half)
        recent_minutes = sum(day.minutes for day in second_half)
        retention_growth = 0 if old_minutes == 0 else (recent_minutes - old_minutes) / old_minutes
        return ProfileStatsRead(
            totalStudyTime=total_study_time,
            masteryRate=mastery_rate,
            retentionGrowth=retention_growth,
            activityDistribution=activity,
        )

    def add_text_document(
        self,
        course_id: str,
        filename: str,
        document_type: DocumentType,
        scope: DocumentScope = DocumentScope.COURSE,
        chapter_ids: list[str] | None = None,
    ) -> SourceDocumentRead:
        with SessionLocal() as db:
            document = SourceDocumentModel(
                id=new_id("doc"),
                course_id=course_id,
                type=document_type.value,
                filename=filename,
                scope=scope.value,
                chapter_ids=chapter_ids or [],
                parse_status=ParseStatus.PARSED.value,
                created_at=datetime.now(UTC),
            )
            db.add(document)
            db.commit()
            return document_to_schema(document)

    def list_documents(self, course_id: str) -> list[SourceDocumentRead]:
        with SessionLocal() as db:
            documents = db.scalars(
                select(SourceDocumentModel)
                .where(SourceDocumentModel.course_id == course_id)
                .order_by(SourceDocumentModel.created_at.desc())
            ).all()
            return [document_to_schema(document) for document in documents]

    def set_generated_cards(self, course_id: str, cards: list[CardView]) -> None:
        concepts = [
            ConceptRead(
                id=card.id,
                course_id=course_id,
                chapter_id=find_chapter_id(self.list_chapters(course_id), card.chapter),
                nameEn=card.concept_en,
                nameZh=card.concept_zh,
                description=card.description,
                importance=0.6,
                examWeight=0.5,
                prerequisites=[],
                sourceChunkIds=card.source_chunk_ids,
                evidenceLevel=card.evidence_level,
            )
            for card in cards
        ]
        with SessionLocal() as db:
            db.execute(delete(CardModel).where(CardModel.course_id == course_id))
            db.execute(delete(ConceptModel).where(ConceptModel.course_id == course_id))
            db.execute(delete(ActiveConceptModel).where(ActiveConceptModel.course_id == course_id))
            db.add_all(
                [
                    CardModel(
                        id=card.id,
                        course_id=course_id,
                        order_index=index,
                        payload=card.model_dump(mode="json", by_alias=True),
                    )
                    for index, card in enumerate(cards)
                ]
            )
            db.add_all(
                [
                    ConceptModel(
                        id=concept.id,
                        course_id=course_id,
                        payload=concept.model_dump(mode="json", by_alias=True),
                    )
                    for concept in concepts
                ]
            )
            db.add_all(
                [
                    ActiveConceptModel(course_id=course_id, concept_id=card.id, order_index=index)
                    for index, card in enumerate(cards)
                ]
            )
            db.commit()

    def append_generated_cards(self, course_id: str, cards: list[CardView]) -> None:
        existing_cards = self.get_cards(course_id)
        self.set_generated_cards(course_id, [*existing_cards, *cards])

    def get_cards(self, course_id: str) -> list[CardView]:
        with SessionLocal() as db:
            cards = db.scalars(
                select(CardModel)
                .where(CardModel.course_id == course_id)
                .order_by(CardModel.order_index)
            ).all()
            if cards:
                return [
                    CardView.model_validate(card.payload)
                    for card in cards
                    if card.id not in DEMO_CARD_IDS
                ]
        return []

    def list_concepts(self, course_id: str) -> list[ConceptRead]:
        with SessionLocal() as db:
            concepts = db.scalars(
                select(ConceptModel).where(ConceptModel.course_id == course_id)
            ).all()
            return [
                ConceptRead.model_validate(concept.payload)
                for concept in concepts
                if concept.id not in DEMO_CARD_IDS
            ]

    def get_concept(self, concept_id: str, user_id: str) -> ConceptRead | None:
        with SessionLocal() as db:
            concept = db.get(ConceptModel, concept_id)
            if concept is None:
                return None
            course = db.get(CourseModel, concept.course_id)
            if course is None or course.user_id != user_id:
                return None
            return ConceptRead.model_validate(concept.payload)

    def list_active_concept_ids(self, course_id: str) -> list[str]:
        with SessionLocal() as db:
            rows = db.scalars(
                select(ActiveConceptModel)
                .where(ActiveConceptModel.course_id == course_id)
                .order_by(ActiveConceptModel.order_index)
            ).all()
            return [row.concept_id for row in rows]

    def update_active_concepts(self, course_id: str, concept_ids: list[str]) -> None:
        with SessionLocal() as db:
            db.execute(delete(ActiveConceptModel).where(ActiveConceptModel.course_id == course_id))
            db.add_all(
                [
                    ActiveConceptModel(
                        course_id=course_id,
                        concept_id=concept_id,
                        order_index=index,
                    )
                    for index, concept_id in enumerate(concept_ids)
                ]
            )
            db.commit()

    def create_session(
        self,
        user_id: str,
        course_id: str,
        mode: StudyMode,
        cards: list[CardView],
    ) -> StudySessionRead:
        with SessionLocal() as db:
            session_id = new_id("sess")
            db.add(
                StudySessionModel(
                    id=session_id,
                    user_id=user_id,
                    course_id=course_id,
                    mode=mode.value,
                    cards=[card.model_dump(mode="json", by_alias=True) for card in cards],
                    mastered=0,
                    unsure=0,
                    started_at=datetime.now(UTC),
                    completed_at=None,
                    duration=0,
                )
            )
            db.commit()
            return StudySessionRead(sessionId=session_id, mode=mode, cards=cards)

    def get_session(self, session_id: str, user_id: str) -> StudySessionModel | None:
        with SessionLocal() as db:
            session = db.get(StudySessionModel, session_id)
            if session is None or session.user_id != user_id:
                return None
            db.expunge(session)
            return session

    def record_feedback(
        self,
        session_id: str,
        user_id: str,
        concept_id: str,
        mastered: bool,
    ) -> StudySessionModel | None:
        with SessionLocal() as db:
            session = db.get(StudySessionModel, session_id)
            if session is None or session.user_id != user_id:
                return None
            if mastered:
                session.mastered += 1
            else:
                session.unsure += 1

            card = db.get(CardModel, concept_id)
            if card is not None and card.course_id == session.course_id:
                payload = dict(card.payload)
                if mastered:
                    payload["mastery"] = min(float(payload.get("mastery", 0)) + 0.15, 1)
                    payload["errorCount"] = max(int(payload.get("errorCount", 0)) - 1, 0)
                else:
                    payload["mastery"] = max(float(payload.get("mastery", 0)) - 0.1, 0)
                    payload["errorCount"] = int(payload.get("errorCount", 0)) + 1
                card.payload = payload

            db.commit()
            db.refresh(session)
            db.expunge(session)
            return session

    def complete_session(self, session_id: str, user_id: str) -> StudySessionModel | None:
        with SessionLocal() as db:
            session = db.get(StudySessionModel, session_id)
            if session is None or session.user_id != user_id:
                return None
            now = datetime.now(UTC)
            session.duration = max(int(now.timestamp() - session.started_at.timestamp()), 0)
            session.completed_at = now
            db.commit()
            db.refresh(session)
            db.expunge(session)
            return session

    def list_session_records(
        self,
        user_id: str,
        course_id: str | None = None,
    ) -> list[StudySessionModel]:
        with SessionLocal() as db:
            statement = select(StudySessionModel).where(StudySessionModel.user_id == user_id)
            if course_id is not None:
                statement = statement.where(StudySessionModel.course_id == course_id)
            sessions = db.scalars(statement.order_by(StudySessionModel.started_at.desc())).all()
            for session in sessions:
                db.expunge(session)
            return list(sessions)

    @staticmethod
    def _get_user_model_by_email(db, email: str) -> UserModel | None:
        return db.scalar(select(UserModel).where(UserModel.email == email.lower()))


def demo_cards(course_id: str) -> list[CardView]:
    question = QuestionView(
        id="question_demo_a_star",
        conceptId="concept_demo_a_star",
        type=QuestionType.MCQ,
        difficulty=Difficulty.MEDIUM,
        stem="What property must h(n) satisfy for A* search to guarantee optimality?",
        options=[
            QuizOption(id="A", text="It must overestimate the real cost."),
            QuizOption(id="B", text="It must be admissible and never overestimate cost."),
            QuizOption(id="C", text="It must always equal zero."),
        ],
        answer="B",
        explanation="Admissibility prevents A* from ignoring an optimal path.",
        sourceChunkIds=["chunk_demo_lecture_3_slide_19"],
        evidenceLevel=EvidenceLevel.MEDIUM,
    )
    return [
        CardView(
            id="concept_demo_a_star",
            chapter="CSIT 5900 > Heuristic Search",
            conceptEn="A* Search",
            conceptZh="A* 搜索算法",
            description=(
                "A* uses f(n) = g(n) + h(n). If the heuristic is admissible, "
                "A* can guarantee an optimal solution."
            ),
            source="Lecture 3, Slide 19",
            sourceChunkIds=["chunk_demo_lecture_3_slide_19"],
            errorCount=0,
            mastery=0.5,
            evidenceLevel=EvidenceLevel.MEDIUM,
            inlineQuiz=question,
        )
    ]


def user_to_schema(user: UserModel) -> UserRead:
    return UserRead(
        id=user.id,
        name=user.name,
        email=user.email,
        subject=user.subject,
        level=user.level,
    )


def course_to_schema(course: CourseModel) -> CourseRead:
    return CourseRead(
        id=course.id,
        user_id=course.user_id,
        code=course.code,
        title=course.title,
        subject=course.subject,
        exam_date=course.exam_date,
        details=CourseDetails.model_validate(course.details),
        created_at=course.created_at,
    )


def chapter_to_schema(chapter: ChapterModel) -> ChapterRead:
    return ChapterRead(
        id=chapter.id,
        courseId=chapter.course_id,
        title=chapter.title,
        orderIndex=chapter.order_index,
        description=chapter.description,
        keywords=chapter.keywords,
    )


def document_to_schema(document: SourceDocumentModel) -> SourceDocumentRead:
    return SourceDocumentRead(
        id=document.id,
        course_id=document.course_id,
        type=DocumentType(document.type),
        filename=document.filename,
        scope=DocumentScope(document.scope),
        chapterIds=document.chapter_ids,
        parse_status=ParseStatus(document.parse_status),
        created_at=document.created_at,
    )


def find_chapter_id(chapters: list[ChapterRead], chapter_title: str) -> str | None:
    normalized = chapter_title.split(">")[-1].strip().lower()
    for chapter in chapters:
        if chapter.title.strip().lower() == normalized:
            return chapter.id
    return None


def hash_password(password: str) -> str:
    return sha256(password.encode("utf-8")).hexdigest()


def build_activity_distribution(sessions: list[StudySessionModel]) -> list[ActivityDay]:
    today = date.today()
    days = [today - timedelta(days=offset) for offset in range(27, -1, -1)]
    minutes_by_day = {day.isoformat(): 0 for day in days}
    for session in sessions:
        completed_at = session.completed_at
        if not isinstance(completed_at, datetime):
            continue
        key = completed_at.date().isoformat()
        if key in minutes_by_day:
            minutes_by_day[key] += max(session.duration // 60, 1)
    max_minutes = max(minutes_by_day.values(), default=0)
    return [
        ActivityDay(
            date=day.isoformat(),
            minutes=minutes_by_day[day.isoformat()],
            intensity=(
                0
                if max_minutes == 0
                else min(4, round(minutes_by_day[day.isoformat()] / max_minutes * 4))
            ),
        )
        for day in days
    ]


store = PersistentStore()
