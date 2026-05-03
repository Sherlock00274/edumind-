from datetime import UTC, datetime

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser
from app.schemas.analytics import CourseAnalyticsRead, StudySessionSummary, UpcomingReview
from app.schemas.concept import ConceptStateRead
from app.services.in_memory import store

router = APIRouter(tags=["analytics"])


@router.get("/courses/{course_id}/analytics", response_model=CourseAnalyticsRead)
def get_course_analytics(course_id: str, user: CurrentUser) -> CourseAnalyticsRead:
    if store.get_course(course_id, user.id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    cards = store.get_cards(course_id)
    weak_cards = [card for card in cards if card.error_count > 0 or card.mastery < 0.6]
    mastery_rate = sum(card.mastery for card in cards) / max(len(cards), 1)
    sessions = store.list_session_records(user.id, course_id)
    return CourseAnalyticsRead(
        masteryRate=mastery_rate,
        resolvedToday=0,
        weakPoolCount=len(weak_cards),
        weakConcepts=weak_cards,
        conceptStates=[
            ConceptStateRead(
                conceptId=card.id,
                mastery=card.mastery,
                confidence=0.5,
                avgResponseTime=0,
                errorCount=card.error_count,
                lastReviewedAt=None,
                nextReviewAt=None,
                errorPatterns=[],
            )
            for card in cards
        ],
        sessions=[
            StudySessionSummary(
                id=session.id,
                timestamp=timestamp_ms(session.completed_at or session.started_at),
                duration=session.duration,
                conceptsCount=len(session.cards),
                masteryRate=session.mastered / max(len(session.cards), 1),
            )
            for session in sessions
        ],
        upcomingReviews=[
            UpcomingReview(conceptId=card.id, conceptName=card.concept_en, scheduledTime=0)
            for card in weak_cards[:3]
        ],
    )


@router.get("/users/me/progress")
def get_user_progress(user: CurrentUser) -> dict[str, object]:
    completed_sessions = [
        session
        for session in store.list_session_records(user.id)
        if session.completed_at is not None
    ]
    sessions = [
        {
            "id": session.id,
            "timestamp": timestamp_ms(session.completed_at),
            "duration": session.duration,
            "conceptsCount": len(session.cards),
            "masteryRate": session.mastered / max(len(session.cards), 1),
        }
        for session in completed_sessions
    ]
    weak_cards = [
        card
        for course in store.list_courses(user.id)
        for card in store.get_cards(course.id)
        if card.error_count > 0 or card.mastery < 0.6
    ]
    return {
        "totalStudyTime": sum(session["duration"] for session in sessions),
        "sessions": sessions,
        "upcomingReviews": [
            {
                "conceptId": card.id,
                "conceptName": card.concept_en,
                "scheduledTime": timestamp_ms(datetime.now(UTC)),
            }
            for card in weak_cards[:5]
        ],
    }


def timestamp_ms(value: object) -> int:
    if isinstance(value, datetime):
        return int(value.timestamp() * 1000)
    return 0
