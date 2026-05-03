from dataclasses import dataclass, replace


@dataclass(frozen=True)
class MasteryUpdateInput:
    mastery: float
    confidence: float
    avg_response_time: float
    error_count: int
    correct: bool
    answer_confidence: float
    response_time: float
    slow_threshold: float = 30.0


@dataclass(frozen=True)
class MasteryUpdateResult:
    mastery: float
    confidence: float
    avg_response_time: float
    error_count: int


def clamp(value: float, lower: float = 0.0, upper: float = 1.0) -> float:
    return max(lower, min(upper, value))


def update_mastery(payload: MasteryUpdateInput) -> MasteryUpdateResult:
    delta = 0.10 if payload.correct else -0.20

    if payload.response_time > payload.slow_threshold:
        delta -= 0.05

    if payload.answer_confidence < 0.50:
        delta -= 0.05

    avg_response_time = (
        payload.response_time
        if payload.avg_response_time <= 0
        else payload.avg_response_time * 0.80 + payload.response_time * 0.20
    )

    return MasteryUpdateResult(
        mastery=clamp(payload.mastery + delta),
        confidence=clamp(payload.confidence * 0.80 + payload.answer_confidence * 0.20),
        avg_response_time=avg_response_time,
        error_count=payload.error_count if payload.correct else payload.error_count + 1,
    )


def apply_feedback_as_answer(payload: MasteryUpdateInput, mastered: bool) -> MasteryUpdateResult:
    return update_mastery(replace(payload, correct=mastered, answer_confidence=0.8 if mastered else 0.3))
