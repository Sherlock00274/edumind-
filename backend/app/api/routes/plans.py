from datetime import UTC, date, datetime

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser
from app.schemas.plan import StudyPlanCreate, StudyPlanRead, StudyPlanTask
from app.services.in_memory import new_id, store
from app.services.planning.service import PriorityInput, allocate_daily_minutes, compute_priority

router = APIRouter(tags=["plans"])


@router.post("/courses/{course_id}/plans", response_model=StudyPlanRead)
def create_plan(
    course_id: str,
    payload: StudyPlanCreate,
    user: CurrentUser,
) -> StudyPlanRead:
    if store.get_course(course_id, user.id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    cards = store.get_cards(course_id)
    allocation = allocate_daily_minutes(payload.minutes_per_day)
    tasks = [
        StudyPlanTask(
            id=new_id("task"),
            conceptId=card.id,
            durationMinutes=max(allocation["weak"] // max(len(cards), 1), 5),
            type="review" if card.error_count > 0 else "learn",
            priority=compute_priority(
                PriorityInput(mastery=card.mastery, importance=0.6, exam_weight=0.5)
            ),
            scheduledFor=date.today(),
        )
        for card in cards
    ]
    return StudyPlanRead(
        id=new_id("plan"),
        courseId=course_id,
        generatedAt=datetime.now(UTC),
        daysLeft=payload.days_left,
        tasks=tasks,
    )


@router.get("/courses/{course_id}/plans/current", response_model=StudyPlanRead)
def get_current_plan(course_id: str, user: CurrentUser) -> StudyPlanRead:
    return create_plan(course_id, StudyPlanCreate(daysLeft=7, minutesPerDay=30), user)
