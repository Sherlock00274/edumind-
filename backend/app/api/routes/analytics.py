from datetime import UTC, datetime

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser
from app.schemas.analytics import (
    BehaviorHintRead,
    CourseAnalyticsRead,
    StudySessionSummary,
    UpcomingReview,
)
from app.services.behavior_activation.service import analyze_behavior
from app.services.in_memory import store

router = APIRouter(tags=["analytics"])


@router.get("/courses/{course_id}/analytics", response_model=CourseAnalyticsRead)
def get_course_analytics(course_id: str, user: CurrentUser) -> CourseAnalyticsRead:
    if store.get_course(course_id, user.id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    cards = store.get_cards(course_id)
    mastery_rate = sum(card.mastery for card in cards) / max(len(cards), 1)
    sessions = store.list_session_records(user.id, course_id)
    completed_sessions = [session for session in sessions if session.completed_at is not None]
    concept_states = store.list_concept_states(course_id, user.id)
    state_by_id = {state.concept_id: state for state in concept_states}
    reviewed_states = [state for state in concept_states if state.last_reviewed_at is not None]
    reviewed_state_ids = {state.concept_id for state in reviewed_states}
    weak_state_ids = {
        state.concept_id
        for state in reviewed_states
        if state.error_count > 0 or state.mastery < 0.6
    }
    weak_cards = [card for card in cards if card.id in weak_state_ids]
    behavior_hint = analyze_behavior(completed_sessions, sessions)
    today = datetime.now(UTC).date()
    resolved_today = sum(
        session.mastered
        for session in completed_sessions
        if isinstance(session.completed_at, datetime) and session.completed_at.date() == today
    )
    return CourseAnalyticsRead(
        masteryRate=mastery_rate,
        resolvedToday=resolved_today,
        weakPoolCount=len(weak_cards),
        reviewedConceptCount=len(reviewed_states),
        unseenConceptCount=max(len(cards) - len(reviewed_state_ids), 0),
        weakConcepts=weak_cards,
        conceptStates=concept_states,
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
            UpcomingReview(
                conceptId=card.id,
                conceptName=card.concept_en,
                scheduledTime=review_time_for(card.id, state_by_id),
            )
            for card in weak_cards[:3]
        ],
        behaviorHint=BehaviorHintRead(
            recommendedMinutes=behavior_hint.recommended_minutes,
            bestHour=behavior_hint.best_hour,
            message=behavior_hint.message,
        ),
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
    weak_cards = []
    for course in store.list_courses(user.id):
        cards = store.get_cards(course.id)
        state_by_id = {
            state.concept_id: state
            for state in store.list_concept_states(course.id, user.id)
            if state.last_reviewed_at is not None
        }
        weak_cards.extend(
            card
            for card in cards
            if card.id in state_by_id
            and (state_by_id[card.id].error_count > 0 or state_by_id[card.id].mastery < 0.6)
        )
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


def review_time_for(concept_id: str, state_by_id: dict[str, object]) -> int:
    state = state_by_id.get(concept_id)
    next_review_at = getattr(state, "next_review_at", None)
    if isinstance(next_review_at, str):
        try:
            return int(datetime.fromisoformat(next_review_at).timestamp() * 1000)
        except ValueError:
            return timestamp_ms(datetime.now(UTC))
    return timestamp_ms(datetime.now(UTC))
