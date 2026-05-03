# EduMind Backend

Python + FastAPI backend for EduMind.

This backend is intentionally structured as a modular monolith. Each domain engine has a clear service boundary so the MVP can stay simple while remaining testable.

## Modules

- `course_parsing`: document parsing, chunking, concept extraction, graph construction.
- `diagnostic`: diagnostic question generation and validation policy.
- `knowledge_state`: mastery, confidence, response-time, and weakness updates.
- `planning`: adaptive study plan generation.
- `learning_loop`: study session orchestration and card/quiz flow.
- `behavior_activation`: behavior-based scheduling hints.
- `evidence`: source traceability and evidence-level calculation.
- `ai_gateway`: provider-isolated AI calls with strict schema validation.

## Local Development

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
```

## AI Configuration

The backend calls DashScope through its OpenAI-compatible API. Keep all model credentials in `backend/.env`; the frontend should never receive an LLM API key.

```bash
cp .env.example .env
```

```env
LLM_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
LLM_API_KEY=your_key
LLM_MODEL=deepseek-v4-flash
```

Default model choice: `deepseek-v4-flash`, because course parsing is a high-frequency structured extraction task where latency and cost matter. Use `deepseek-v4-pro` through `LLM_MODEL` for harder reasoning, dense past-paper calibration, or long-form exam-style validation.

Health check:

```bash
curl http://localhost:8000/health
```

API docs:

```text
http://localhost:8000/docs
```

## Course Setup and Material Upload

EduMind follows a syllabus-first workflow:

1. Upload a syllabus and parse it into a course draft.
2. Let the user edit the course code, course title, assessment details, and chapters.
3. Create the course workspace.
4. Upload slides, notes, homework, tutorials, quizzes, past papers, or other files against a chapter, or leave chapter selection empty for automatic cross-chapter assignment.

Syllabus parsing:

```text
POST /api/v1/courses/from-syllabus
```

Course creation with confirmed chapters:

```text
POST /api/v1/courses
```

Chapter list:

```text
GET /api/v1/courses/{course_id}/chapters
```

Course-level or cross-chapter material upload:

```text
POST /api/v1/courses/{course_id}/documents/files
```

Chapter-specific material upload:

```text
POST /api/v1/courses/{course_id}/chapters/{chapter_id}/documents/files
```

Use multipart field `files` and upload one or more files. For `documents/files`, optional repeated form field `chapter_ids` pins the upload to one or more chapters; if omitted, EduMind infers chapter coverage from the course structure.

Supported formats:

- `.pdf`
- `.pptx` (`.ppt` is best-effort only; prefer exporting legacy decks to `.pptx`)
- `.docx`
- `.md` / `.markdown`
- `.txt`

EduMind extracts text from each file, classifies each document as one of the `DocumentType` values (`syllabus`, `slides`, `notes`, `past_paper`, `marking_scheme`, `tutorial`, `homework`, `quiz`, `other`), assigns course/chapter scope, then parses learning material into study cards and questions.
