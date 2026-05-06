from __future__ import annotations

import re

from pydantic import BaseModel, Field, ValidationError

from app.schemas.course import ChapterCreate, CourseDetails, CourseStructureDraft
from app.services.ai_gateway.service import AiGatewayError, generate_json


class SyllabusPayload(BaseModel):
    code: str | None = None
    title: str
    subject: str | None = None
    details: CourseDetails = Field(default_factory=CourseDetails)
    chapters: list[ChapterCreate] = Field(min_length=1, max_length=24)


SYLLABUS_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "required": ["code", "title", "subject", "details", "chapters"],
    "properties": {
        "code": {"type": ["string", "null"]},
        "title": {"type": "string"},
        "subject": {"type": ["string", "null"]},
        "details": {
            "type": "object",
            "additionalProperties": False,
            "required": [
                "gradingPolicy",
                "assessmentScheme",
                "examFormat",
                "learningOutcomes",
                "schedule",
            ],
            "properties": {
                "gradingPolicy": {"type": ["string", "null"]},
                "assessmentScheme": {"type": ["string", "null"]},
                "examFormat": {"type": ["string", "null"]},
                "learningOutcomes": {"type": "array", "items": {"type": "string"}},
                "schedule": {"type": ["string", "null"]},
            },
        },
        "chapters": {
            "type": "array",
            "minItems": 1,
            "maxItems": 24,
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["title", "description", "keywords"],
                "properties": {
                    "title": {"type": "string"},
                    "description": {"type": ["string", "null"]},
                    "keywords": {"type": "array", "items": {"type": "string"}},
                },
            },
        },
    },
}


def parse_syllabus_to_structure(
    text: str,
    filename: str = "syllabus",
    *,
    api_key: str | None = None,
) -> CourseStructureDraft:
    try:
        return parse_syllabus_with_ai(text, filename, api_key=api_key)
    except (AiGatewayError, ValidationError, ValueError):
        return parse_syllabus_fallback(text, filename)


def parse_syllabus_with_ai(text: str, filename: str, *, api_key: str | None = None) -> CourseStructureDraft:
    prompt = f"""
Extract a course setup draft from this syllabus.

Rules:
- Course-level assessment, marking scheme, grading policy, exam format, schedule, and learning outcomes go into `details`.
- Do not create chapters named "Assessment", "Marking Scheme", "Course Policy", or similar administrative sections.
- Chapters should be teachable content units/modules/topics only.
- Preserve course codes such as CSIT5900 when present.
- Keep chapter titles concise and editable.

Filename: {filename}

Syllabus:
{text[:12000]}
"""
    raw = generate_json(
        prompt,
        SYLLABUS_SCHEMA,
        system_prompt="You parse university syllabi into course structure JSON. Return JSON only.",
        temperature=0.1,
        api_key=api_key,
    )
    payload = SyllabusPayload.model_validate(raw)
    return CourseStructureDraft.model_validate(payload.model_dump(by_alias=True))


def parse_syllabus_fallback(text: str, filename: str) -> CourseStructureDraft:
    lines = [line.strip(" -:\t") for line in text.splitlines() if line.strip()]
    sample = "\n".join(lines[:80])
    code_match = re.search(r"\b([A-Z]{3,5}\s?\d{4}[A-Z]?)\b", sample)
    code = code_match.group(1).replace(" ", "") if code_match else None
    title = infer_title(lines, code, filename)

    chapter_candidates: list[str] = []
    for line in lines:
        lowered = line.lower()
        if any(term in lowered for term in ("assessment", "marking", "grading", "policy", "office hour")):
            continue
        if re.match(r"^(week|lecture|module|topic|chapter)\s*\d+", lowered):
            chapter_candidates.append(clean_chapter_title(line))
        elif re.match(r"^\d+[\).\s-]+[A-Z][A-Za-z ,/&:-]{4,}$", line):
            chapter_candidates.append(clean_chapter_title(line))

    if not chapter_candidates:
        chapter_candidates = ["Course Foundations", "Core Concepts", "Applications and Review"]

    chapters = [
        ChapterCreate(title=title, description=None, keywords=keywords_from_title(title))
        for title in dedupe(chapter_candidates)[:16]
    ]

    return CourseStructureDraft(
        code=code,
        title=title,
        subject=None,
        details=CourseDetails(
            gradingPolicy=extract_detail(sample, ("grading", "marking", "assessment")),
            assessmentScheme=extract_detail(sample, ("assessment", "exam", "quiz", "homework")),
            examFormat=extract_detail(sample, ("final exam", "midterm", "exam format")),
            learningOutcomes=[],
            schedule=extract_detail(sample, ("week", "schedule", "lecture")),
        ),
        chapters=chapters,
    )


def infer_title(lines: list[str], code: str | None, filename: str) -> str:
    for line in lines[:12]:
        if code and code.lower() in line.lower():
            return re.sub(re.escape(code), "", line, flags=re.IGNORECASE).strip(" -:") or line
        if len(line.split()) >= 2 and not any(term in line.lower() for term in ("syllabus", "course outline")):
            return line[:120]
    return filename.rsplit(".", 1)[0]


def clean_chapter_title(line: str) -> str:
    cleaned = re.sub(r"^(week|lecture|module|topic|chapter)\s*\d+\s*[:.)-]?\s*", "", line, flags=re.I)
    cleaned = re.sub(r"^\d+[\).\s-]+", "", cleaned)
    return cleaned.strip()[:120] or line[:120]


def keywords_from_title(title: str) -> list[str]:
    return [part.lower() for part in re.findall(r"[A-Za-z][A-Za-z0-9+*#-]{2,}", title)[:6]]


def extract_detail(text: str, keywords: tuple[str, ...]) -> str | None:
    for line in text.splitlines():
        lowered = line.lower()
        if any(keyword in lowered for keyword in keywords):
            return line[:500]
    return None


def dedupe(values: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        key = value.lower()
        if key not in seen:
            seen.add(key)
            result.append(value)
    return result
