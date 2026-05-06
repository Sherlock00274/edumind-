from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class BehaviorHint:
    recommended_minutes: int
    best_hour: int | None
    message: str


def recommended_task_minutes(drop_off_rate: float) -> int:
    if drop_off_rate >= 0.5:
        return 5
    if drop_off_rate >= 0.25:
        return 10
    return 20


def analyze_behavior(
    completed_sessions: list[object],
    attempted_sessions: list[object],
) -> BehaviorHint:
    drop_off_rate = 0.0
    if attempted_sessions:
        drop_off_rate = 1 - (len(completed_sessions) / len(attempted_sessions))

    hours = Counter()
    for session in completed_sessions:
        completed_at = getattr(session, "completed_at", None)
        mastered = int(getattr(session, "mastered", 0) or 0)
        total = len(getattr(session, "cards", []) or [])
        if isinstance(completed_at, datetime) and total > 0:
            hours[completed_at.hour] += max(mastered / total, 0.1)

    best_hour = hours.most_common(1)[0][0] if hours else None
    minutes = recommended_task_minutes(drop_off_rate)
    if best_hour is None:
        message = f"Start with a {minutes}-minute review block to build behavior history."
    elif drop_off_rate >= 0.5:
        message = f"Use {minutes}-minute micro tasks near {best_hour:02d}:00 to reduce drop-off."
    else:
        message = f"Schedule harder review near {best_hour:02d}:00, your current strongest window."

    return BehaviorHint(recommended_minutes=minutes, best_hour=best_hour, message=message)
