from app.schemas.concept import ConceptRead


def required_question_count(concepts: list[ConceptRead]) -> int:
    return len(concepts) * 2
