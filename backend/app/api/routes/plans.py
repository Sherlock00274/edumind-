from datetime import UTC, date, datetime, timedelta

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
    states = {state.concept_id: state for state in store.list_concept_states(course_id, user.id)}
    allocation = allocate_daily_minutes(payload.minutes_per_day)
    days = max(payload.days_left, 1)
    prioritized = sorted(
        cards,
        key=lambda card: compute_priority(
            PriorityInput(
                mastery=states.get(card.id).mastery if card.id in states else card.mastery,
                importance=0.6,
                exam_weight=0.5,
                urgency=1 + (1 / days),
                prerequisite_factor=1.1 if card.error_count > 0 else 1,
            )
        ),
        reverse=True,
    )

    tasks: list[StudyPlanTask] = []
    today = date.today()
    weak_cards = [
        card
        for card in prioritized
        if card.error_count > 0 or mastery_for(card, states) < 0.6
    ]
    strong_cards = [card for card in prioritized if card not in weak_cards]
    for day_index in range(days):
        scheduled_for = today + timedelta(days=day_index)
        tasks.extend(
            build_tasks_for_bucket(
                weak_cards,
                day_index,
                allocation["weak"],
                "review",
                scheduled_for,
                states,
            )
        )
        tasks.extend(
            build_tasks_for_bucket(
                strong_cards,
                day_index,
                allocation["new"],
                "learn",
                scheduled_for,
                states,
            )
        )
        review_source = prioritized[day_index::days][:2]
        tasks.extend(
            build_tasks_for_bucket(
                review_source,
                0,
                allocation["review"],
                "test",
                scheduled_for,
                states,
            )
        )
    tasks.sort(key=lambda task: (task.scheduled_for, -task.priority))
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


def build_tasks_for_bucket(
    cards,
    day_index: int,
    minutes: int,
    task_type: str,
    scheduled_for: date,
    states: dict[str, object],
) -> list[StudyPlanTask]:
    if not cards or minutes <= 0:
        return []
    selected = cards[day_index::7][: max(1, min(3, len(cards)))]
    duration = max(minutes // max(len(selected), 1), 5)
    return [
        StudyPlanTask(
            id=new_id("task"),
            conceptId=card.id,
            durationMinutes=duration,
            type=task_type,
            priority=compute_priority(
                PriorityInput(
                    mastery=states.get(card.id).mastery if card.id in states else card.mastery,
                    importance=0.6,
                    exam_weight=0.5,
                )
            ),
            scheduledFor=scheduled_for,
        )
        for card in selected
    ]


def mastery_for(card, states: dict[str, object]) -> float:
    state = states.get(card.id)
    return state.mastery if state is not None else card.mastery
