from app.schemas.common import Difficulty, QuestionType
from app.schemas.concept import ConceptRead
from app.schemas.question import QuestionView, QuizOption
from app.services.in_memory import new_id


def required_question_count(concepts: list[ConceptRead]) -> int:
    return len(concepts) * 2


def generate_diagnostic_questions(concepts: list[ConceptRead]) -> list[QuestionView]:
    questions: list[QuestionView] = []
    for concept in concepts:
        questions.extend(
            [
                _definition_question(concept),
                _understanding_question(concept),
                _application_question(concept),
            ]
        )
    return questions


def _definition_question(concept: ConceptRead) -> QuestionView:
    return QuestionView(
        id=new_id("question"),
        conceptId=concept.id,
        type=QuestionType.MCQ,
        difficulty=Difficulty.EASY,
        stem=f"Which statement best defines {concept.name_en}?",
        options=[
            QuizOption(id="A", text=concept.description[:220]),
            QuizOption(id="B", text="An unrelated administrative course policy."),
            QuizOption(id="C", text="A topic that is not supported by the course material."),
        ],
        answer="A",
        explanation="This option is grounded in the extracted course concept description.",
        sourceChunkIds=concept.source_chunk_ids,
        evidenceLevel=concept.evidence_level,
    )


def _understanding_question(concept: ConceptRead) -> QuestionView:
    prerequisite_text = (
        f"It builds on {', '.join(concept.prerequisites[:2])}."
        if concept.prerequisites
        else "It should be connected to the chapter context before application."
    )
    return QuestionView(
        id=new_id("question"),
        conceptId=concept.id,
        type=QuestionType.MCQ,
        difficulty=Difficulty.MEDIUM,
        stem=f"What is the best reasoning-oriented takeaway for {concept.name_en}?",
        options=[
            QuizOption(id="A", text=f"{concept.description[:180]} {prerequisite_text}"),
            QuizOption(id="B", text="Memorize the term without linking it to problem solving."),
            QuizOption(id="C", text="Ignore this concept when reviewing exam material."),
        ],
        answer="A",
        explanation="The correct option preserves the concept meaning and its learning context.",
        sourceChunkIds=concept.source_chunk_ids,
        evidenceLevel=concept.evidence_level,
    )


def _application_question(concept: ConceptRead) -> QuestionView:
    return QuestionView(
        id=new_id("question"),
        conceptId=concept.id,
        type=QuestionType.APPLICATION,
        difficulty=Difficulty.HARD,
        stem=f"In an exam problem, when should you apply {concept.name_en}?",
        options=[
            QuizOption(
                id="A",
                text="When the problem cues match the concept description and chapter context.",
            ),
            QuizOption(id="B", text="Whenever a question is long, regardless of the topic."),
            QuizOption(id="C", text="Only when no prerequisite knowledge is needed."),
        ],
        answer="A",
        explanation="Application should be triggered by concept-specific cues, not surface length.",
        sourceChunkIds=concept.source_chunk_ids,
        evidenceLevel=concept.evidence_level,
    )
