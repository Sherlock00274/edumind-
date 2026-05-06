from datetime import UTC, datetime
from types import SimpleNamespace

from app.schemas.common import EvidenceLevel
from app.schemas.concept import ConceptRead
from app.services.behavior_activation.service import analyze_behavior, recommended_task_minutes
from app.services.diagnostic.service import generate_diagnostic_questions
from app.services.knowledge_state.service import MasteryUpdateInput, update_mastery
from app.services.planning.service import PriorityInput, allocate_daily_minutes, compute_priority


def sample_concept() -> ConceptRead:
    return ConceptRead(
        id="concept_a",
        course_id="course_a",
        chapter_id="chapter_a",
        nameEn="A* Search",
        nameZh="A* 搜索",
        description="A* uses path cost plus an admissible heuristic to guide search.",
        importance=0.8,
        examWeight=0.7,
        prerequisites=[],
        sourceChunkIds=["chunk_a"],
        evidenceLevel=EvidenceLevel.HIGH,
    )


def test_mastery_update_uses_correctness_latency_and_confidence() -> None:
    result = update_mastery(
        MasteryUpdateInput(
            mastery=0.5,
            confidence=0.5,
            avg_response_time=20,
            error_count=0,
            correct=False,
            answer_confidence=0.2,
            response_time=40,
        )
    )

    assert result.mastery == 0.2
    assert result.error_count == 1
    assert result.avg_response_time == 24
    assert result.confidence < 0.5


def test_diagnostic_generates_three_question_levels_per_concept() -> None:
    questions = generate_diagnostic_questions([sample_concept()])

    assert len(questions) == 3
    assert {question.difficulty for question in questions} == {"easy", "medium", "hard"}
    assert all(question.concept_id == "concept_a" for question in questions)


def test_planning_priority_and_allocation() -> None:
    assert allocate_daily_minutes(100) == {"weak": 60, "new": 30, "review": 10}
    weak = compute_priority(PriorityInput(mastery=0.2, importance=0.8, exam_weight=0.7))
    strong = compute_priority(PriorityInput(mastery=0.8, importance=0.8, exam_weight=0.7))

    assert weak > strong


def test_behavior_hint_shortens_tasks_for_drop_off() -> None:
    completed = [
        SimpleNamespace(
            completed_at=datetime(2026, 5, 6, 20, tzinfo=UTC),
            mastered=4,
            cards=[1, 2, 3, 4],
        )
    ]
    attempted = [
        *completed,
        SimpleNamespace(completed_at=None, mastered=0, cards=[1, 2]),
    ]
    hint = analyze_behavior(completed, attempted)

    assert recommended_task_minutes(0.5) == 5
    assert hint.recommended_minutes == 5
    assert hint.best_hour == 20
