from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser
from app.schemas.common import JobStatus
from app.services.in_memory import store

router = APIRouter(tags=["parsing"])


@router.post("/courses/{course_id}/parse", response_model=JobStatus)
def start_parse(course_id: str, user: CurrentUser) -> JobStatus:
    if store.get_course(course_id, user.id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return JobStatus(jobId=f"parse_{course_id}", status="completed", progress=100, message="Parsed")


@router.get("/jobs/{job_id}", response_model=JobStatus)
def get_job(job_id: str, user: CurrentUser) -> JobStatus:
    del user
    return JobStatus(jobId=job_id, status="completed", progress=100, message="Completed")


@router.get("/courses/{course_id}/graph")
def get_course_graph(course_id: str, user: CurrentUser) -> dict[str, object]:
    if store.get_course(course_id, user.id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    cards = store.get_cards(course_id)
    concepts = store.list_concepts(course_id)
    return {
        "courseId": course_id,
        "chapters": sorted({card.chapter for card in cards}),
        "concepts": [card.model_dump(by_alias=True) for card in cards],
        "dependencies": build_dependencies(concepts),
    }


def build_dependencies(concepts) -> list[dict[str, object]]:
    dependencies: list[dict[str, object]] = []
    ids = {concept.id for concept in concepts}
    for concept in concepts:
        for prerequisite in concept.prerequisites:
            if prerequisite in ids:
                dependencies.append(
                    {
                        "from": prerequisite,
                        "to": concept.id,
                        "type": "prerequisite",
                        "weight": 1.0,
                    }
                )

    by_chapter: dict[str, list[object]] = {}
    for concept in concepts:
        key = concept.chapter_id or "course"
        by_chapter.setdefault(key, []).append(concept)
    ordered_groups = list(by_chapter.values())
    for index, group in enumerate(ordered_groups[:-1]):
        next_group = ordered_groups[index + 1]
        if group and next_group:
            dependencies.append(
                {
                    "from": group[-1].id,
                    "to": next_group[0].id,
                    "type": "chapter_sequence",
                    "weight": 0.35,
                }
            )
    return dependencies
