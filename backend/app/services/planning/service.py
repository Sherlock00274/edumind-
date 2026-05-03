from dataclasses import dataclass


@dataclass(frozen=True)
class PriorityInput:
    mastery: float
    importance: float
    exam_weight: float
    urgency: float = 1.0
    prerequisite_factor: float = 1.0


def compute_priority(payload: PriorityInput) -> float:
    return (
        (1 - payload.mastery)
        * payload.importance
        * payload.exam_weight
        * payload.urgency
        * payload.prerequisite_factor
    )


def allocate_daily_minutes(total_minutes: int) -> dict[str, int]:
    weak = round(total_minutes * 0.60)
    new = round(total_minutes * 0.30)
    review = max(total_minutes - weak - new, 0)
    return {"weak": weak, "new": new, "review": review}
