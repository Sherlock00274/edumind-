from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser
from app.schemas.concept import ActiveConceptsUpdate, CardView, ConceptRead
from app.services.in_memory import store

router = APIRouter(tags=["concepts"])


@router.get("/courses/{course_id}/concepts", response_model=list[ConceptRead])
def list_concepts(course_id: str, user: CurrentUser) -> list[ConceptRead]:
    if store.get_course(course_id, user.id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return store.list_concepts(course_id)


@router.get("/courses/{course_id}/card-views", response_model=list[CardView])
def list_card_views(course_id: str, user: CurrentUser) -> list[CardView]:
    if store.get_course(course_id, user.id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    return store.get_cards(course_id)


@router.patch("/courses/{course_id}/active-concepts")
def update_active_concepts(
    course_id: str,
    payload: ActiveConceptsUpdate,
    user: CurrentUser,
) -> dict[str, object]:
    if store.get_course(course_id, user.id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    store.update_active_concepts(course_id, payload.concept_ids)
    return {"courseId": course_id, "activeConceptIds": payload.concept_ids}


@router.get("/concepts/{concept_id}", response_model=ConceptRead)
def get_concept(concept_id: str, user: CurrentUser) -> ConceptRead:
    concept = store.get_concept(concept_id, user.id)
    if concept is not None:
        return concept
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Concept not found")
