from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser
from app.schemas.study import (
    SessionStatsRead,
    StudyFeedbackCreate,
    StudySessionCreate,
    StudySessionRead,
)
from app.services.in_memory import store
from app.services.learning_loop.service import select_session_cards

router = APIRouter(tags=["sessions"])


@router.post("/courses/{course_id}/sessions", response_model=StudySessionRead)
def create_session(
    course_id: str,
    payload: StudySessionCreate,
    user: CurrentUser,
) -> StudySessionRead:
    if store.get_course(course_id, user.id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    cards = store.get_cards(course_id)
    if payload.mode == "NORMAL":
        active_ids = store.list_active_concept_ids(course_id)
        if active_ids:
            cards = [card for card in cards if card.id in active_ids]
    selected_cards = select_session_cards(
        cards,
        payload.mode,
        payload.concept_id or payload.chapter_id,
    )
    return store.create_session(user.id, course_id, payload.mode, selected_cards)


@router.get("/sessions/{session_id}", response_model=StudySessionRead)
def get_session(session_id: str, user: CurrentUser) -> StudySessionRead:
    session = store.get_session(session_id, user.id)
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return StudySessionRead(
        sessionId=session_id,
        mode=session.mode,
        cards=session.cards,
    )


@router.post("/sessions/{session_id}/feedback", response_model=SessionStatsRead)
def submit_feedback(
    session_id: str,
    payload: StudyFeedbackCreate,
    user: CurrentUser,
) -> SessionStatsRead:
    session = store.record_feedback(
        session_id,
        user.id,
        payload.concept_id,
        payload.feedback == "mastered",
    )
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    return SessionStatsRead(
        total=len(session.cards),
        mastered=session.mastered,
        unsure=session.unsure,
    )


@router.post("/sessions/{session_id}/complete", response_model=SessionStatsRead)
def complete_session(session_id: str, user: CurrentUser) -> SessionStatsRead:
    session = store.complete_session(session_id, user.id)
    if session is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return SessionStatsRead(
        total=len(session.cards),
        mastered=session.mastered,
        unsure=session.unsure,
    )
