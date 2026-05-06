from __future__ import annotations

from pydantic import BaseModel, Field, ValidationError

from app.schemas.common import Difficulty, EvidenceLevel, QuestionType
from app.schemas.concept import CardView
from app.schemas.question import QuestionView, QuizOption
from app.services.ai_gateway.service import AiGatewayError, generate_json
from app.services.in_memory import new_id


class ExtractedOption(BaseModel):
    id: str
    text: str


class ExtractedQuiz(BaseModel):
    question: str
    options: list[ExtractedOption] = Field(min_length=2, max_length=5)
    correctAnswer: str


class ExtractedCard(BaseModel):
    chapter: str
    conceptEn: str
    conceptZh: str | None = None
    description: str
    descriptionZh: str | None = None
    descriptionEn: str | None = None
    source: str
    inlineQuiz: ExtractedQuiz


class ExtractedCardsPayload(BaseModel):
    cards: list[ExtractedCard] = Field(min_length=1, max_length=12)


EXTRACTION_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "required": ["cards"],
    "properties": {
        "cards": {
            "type": "array",
            "minItems": 1,
            "maxItems": 12,
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": [
                    "chapter",
                    "conceptEn",
                    "conceptZh",
                    "description",
                    "source",
                    "inlineQuiz",
                ],
                "properties": {
                    "chapter": {"type": "string"},
                    "conceptEn": {"type": "string"},
                    "conceptZh": {"type": ["string", "null"]},
                    "description": {"type": "string"},
                    "descriptionZh": {"type": ["string", "null"]},
                    "descriptionEn": {"type": ["string", "null"]},
                    "source": {"type": "string"},
                    "inlineQuiz": {
                        "type": "object",
                        "additionalProperties": False,
                        "required": ["question", "options", "correctAnswer"],
                        "properties": {
                            "question": {"type": "string"},
                            "options": {
                                "type": "array",
                                "minItems": 2,
                                "maxItems": 5,
                                "items": {
                                    "type": "object",
                                    "additionalProperties": False,
                                    "required": ["id", "text"],
                                    "properties": {
                                        "id": {"type": "string"},
                                        "text": {"type": "string"},
                                    },
                                },
                            },
                            "correctAnswer": {"type": "string"},
                        },
                    },
                },
            },
        }
    },
}


def parse_text_to_cards(course_id: str, content: str, *, api_key: str | None = None) -> list[CardView]:
    try:
        return parse_text_to_cards_with_ai(course_id, content, api_key=api_key)
    except (AiGatewayError, ValidationError, ValueError):
        return parse_text_to_cards_fallback(course_id, content)


def parse_text_to_cards_with_ai(
    course_id: str,
    content: str,
    *,
    api_key: str | None = None,
) -> list[CardView]:
    prompt = f"""
Extract key concepts from this course material for a final-exam revision system.

Rules:
- Return 4 to 12 high-value concepts, unless the material is too short.
- Each card must be grounded only in the provided material.
- Prefer the instructor/course terminology from the material.
- Use `chapter` in the format "Uploaded Material > <section>".
- Use `source` as a short citation such as "Uploaded material, paragraph 3".
- `description` should be concise but sufficient for active recall.
- `descriptionZh` should explain the concept in clear Chinese for the learner.
- `descriptionEn` should preserve the closest English source wording or English explanation.
- `inlineQuiz` must have exactly one correct answer.
- Use English concept names in conceptEn and Chinese translations in conceptZh when possible.
- Do not claim exam prediction. These are course-aligned revision cards.

Material:
{content[:12000]}
"""
    raw = generate_json(
        prompt,
        EXTRACTION_SCHEMA,
        system_prompt=(
            "You are EduMind's controlled course parsing engine. "
            "Extract course-grounded concepts and quizzes. Return JSON only."
        ),
        temperature=0.15,
        api_key=api_key,
    )
    payload = ExtractedCardsPayload.model_validate(raw)
    return [
        _card_from_extracted(course_id, index, card)
        for index, card in enumerate(payload.cards, 1)
    ]


def parse_text_to_cards_fallback(course_id: str, content: str) -> list[CardView]:
    lines = [line.strip() for line in content.splitlines() if line.strip()]
    concepts = lines[:8] or [content.strip()[:80] or "Untitled Concept"]

    cards: list[CardView] = []
    for index, concept in enumerate(concepts, start=1):
        concept_id = new_id("concept")
        chunk_id = f"chunk_{course_id}_{index}"
        question = QuestionView(
            id=new_id("question"),
            conceptId=concept_id,
            type=QuestionType.MCQ,
            difficulty=Difficulty.EASY,
            stem=f"Which statement best matches this concept: {concept[:80]}?",
            options=[
                QuizOption(id="A", text=concept[:140]),
                QuizOption(id="B", text="An unrelated distractor not supported by the source."),
            ],
            answer="A",
            explanation="The answer is grounded in the uploaded source text.",
            sourceChunkIds=[chunk_id],
            evidenceLevel=EvidenceLevel.LOW,
        )
        cards.append(
            CardView(
                id=concept_id,
                chapter="Uploaded Material > Extracted Concepts",
                conceptEn=concept[:80],
                conceptZh=None,
                description=concept,
                descriptionZh=None,
                descriptionEn=concept,
                source=f"Uploaded material, chunk {index}",
                sourceChunkIds=[chunk_id],
                errorCount=0,
                mastery=0.3,
                evidenceLevel=EvidenceLevel.LOW,
                inlineQuiz=question,
            )
        )
    return cards


def _card_from_extracted(course_id: str, index: int, extracted: ExtractedCard) -> CardView:
    concept_id = new_id("concept")
    chunk_id = f"chunk_{course_id}_{index}"
    option_ids = {option.id for option in extracted.inlineQuiz.options}
    if extracted.inlineQuiz.correctAnswer not in option_ids:
        raise ValueError("AI output correctAnswer must match one option id.")

    question = QuestionView(
        id=new_id("question"),
        conceptId=concept_id,
        type=QuestionType.MCQ,
        difficulty=Difficulty.MEDIUM,
        stem=extracted.inlineQuiz.question,
        options=[
            QuizOption(id=option.id, text=option.text)
            for option in extracted.inlineQuiz.options
        ],
        answer=extracted.inlineQuiz.correctAnswer,
        explanation="Generated from uploaded course material.",
        sourceChunkIds=[chunk_id],
        evidenceLevel=EvidenceLevel.LOW,
    )
    return CardView(
        id=concept_id,
        chapter=extracted.chapter,
        conceptEn=extracted.conceptEn,
        conceptZh=extracted.conceptZh,
        description=extracted.description,
        descriptionZh=extracted.descriptionZh,
        descriptionEn=extracted.descriptionEn or extracted.description,
        source=extracted.source,
        sourceChunkIds=[chunk_id],
        errorCount=0,
        mastery=0.3,
        evidenceLevel=EvidenceLevel.LOW,
        inlineQuiz=question,
    )
