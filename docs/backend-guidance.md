# EduMind Backend Guidance

Status: design guidance for the Python + FastAPI backend.

Decision: this document is project guidance, not a skill or harness. A skill would tell an agent how to repeat a workflow, and a harness would be an executable evaluation scaffold. EduMind first needs a durable backend design contract that can guide implementation, testing, and frontend integration.

中文定位：

- 我选择把这份材料做成 `guidance`，因为当前最重要的是确定后端的系统边界、模块职责、数据模型、API 契约和测试指标。
- 暂时不做成 `skill`，因为 skill 更适合描述“以后让代理重复执行某个工作流”的操作指南，而不是产品后端架构本身。
- 暂时不做成 `harness`，因为 harness 应该是可执行的评估/测试框架；它适合在后端 MVP 稳定后，用固定 fixtures 检测概念抽取、题目质量、mastery 预测和 exam alignment。
- 这份文档后续可以拆成两部分：`backend-guidance.md` 继续作为架构设计，另建 `evaluation-harness.md` 或 `tests/evaluation/` 作为可执行评估体系。

## 1. Current Frontend Contract

The current React frontend is a local-state prototype. Backend work should preserve its product flow while replacing mock/client-only state with persistent, testable services.

Observed frontend entities:

- `Card`: learning card shown in the study loop. It includes chapter, bilingual concept names, explanation, source, error count, inline quiz, tags, and relevance.
- `Quiz`: standalone quiz inserted after every 3 study cards.
- `StudyMode`: `NORMAL`, `WEAKNESS`, `SINGLE`, `CHAPTER`.
- `weakPool`: concept/card ids needing review.
- `UserProgress`: total study time, study sessions, upcoming reviews.
- `SessionStats`: total, mastered, unsure.
- `AppState`: home, parsing, mind map, studying, analytics, quiz, weakness report, profile.

Important frontend behavior to support:

- User uploads or pastes course material.
- System parses content into concepts/cards and a selectable knowledge map.
- User confirms active scope.
- User studies cards, marks concepts as mastered/unsure, and periodically receives quizzes.
- Wrong/unsure concepts enter the weakness pool.
- Analytics ranks weak concepts by error count.
- Profile shows study history, mastery, and scheduled reviews.

Backend implications:

- AI generation must move from the browser into the backend. The frontend must not hold provider API keys.
- Card ids should become stable string ids, not array indexes or generated numbers.
- A `Card` should be a view model derived from `Concept`, `ConceptState`, `SourceChunk`, and `Question`, not the primary source of truth.
- Every generated card and question should carry source evidence and confidence level.

## 2. System Goal

EduMind is an adaptive learning system for final exam preparation. The backend should transform course material into a grounded knowledge graph, model a student's knowledge state, generate adaptive study plans, and run a closed learning loop.

Core principle:

```text
AI = controlled content processing
System = deterministic decision engine
```

AI may extract concepts, draft questions, and generate explanations. It must not be the unverified authority for mastery, planning, scheduling, exam-alignment claims, or behavioral decisions.

## 3. Backend Architecture

Use a modular monolith first. Keep module boundaries explicit so later extraction into services is possible without premature distribution.

Recommended package layout:

```text
backend/
  app/
    main.py
    api/
      routes/
        courses.py
        parsing.py
        concepts.py
        questions.py
        sessions.py
        mastery.py
        plans.py
        analytics.py
    core/
      config.py
      security.py
      errors.py
      time.py
    db/
      base.py
      session.py
      models.py
      migrations/
    schemas/
      course.py
      concept.py
      question.py
      study.py
      mastery.py
      plan.py
    services/
      course_parsing/
      diagnostic/
      knowledge_state/
      planning/
      learning_loop/
      behavior_activation/
      evidence/
      ai_gateway/
    tests/
```

Recommended stack:

- FastAPI for HTTP APIs.
- Pydantic v2 for request/response schemas.
- SQLAlchemy 2.x plus Alembic for persistence.
- PostgreSQL for production; SQLite is acceptable only for early local development.
- Background tasks for document parsing and AI generation. Start with FastAPI background tasks or ARQ/Celery if processing becomes long-running.
- Object storage for uploaded documents. Local filesystem is acceptable for MVP; use S3-compatible storage later.

## 4. Domain Model

### 4.1 Course

```text
Course {
  id: string
  userId: string
  title: string
  subject: string | null
  examDate: datetime | null
  createdAt: datetime
}
```

### 4.2 SourceDocument

```text
SourceDocument {
  id: string
  courseId: string
  type: "syllabus" | "slides" | "notes" | "past_paper" | "marking_scheme" | "tutorial" | "homework" | "quiz" | "other"
  filename: string
  storageUri: string
  parseStatus: "pending" | "processing" | "parsed" | "failed"
  metadata: object
  createdAt: datetime
}
```

### 4.3 SourceChunk

```text
SourceChunk {
  id: string
  documentId: string
  courseId: string
  chapterId: string | null
  text: string
  page: int | null
  slide: int | null
  tokenCount: int
  embeddingId: string | null
}
```

Every concept, card, and question should trace back to one or more `SourceChunk` records.

### 4.4 Chapter

```text
Chapter {
  id: string
  courseId: string
  title: string
  orderIndex: int
}
```

### 4.5 Concept

```text
Concept {
  id: string
  courseId: string
  chapterId: string | null
  nameEn: string
  nameZh: string | null
  description: string
  importance: float        // 0..1
  examWeight: float        // 0..1, derived from past papers when available
  prerequisites: string[]
  sourceChunkIds: string[]
  evidenceLevel: "low" | "medium" | "high"
  createdAt: datetime
}
```

Evidence level:

- `high`: supported by syllabus plus tutorials/past papers or marking schemes.
- `medium`: supported by syllabus plus slides/notes.
- `low`: supported by one source only or generated from sparse material.

### 4.6 Question

```text
Question {
  id: string
  courseId: string
  conceptId: string
  type: "MCQ" | "TF" | "Application"
  difficulty: "easy" | "medium" | "hard"
  stem: string
  options: [{ id: string, text: string }]
  answer: string
  explanation: string | null
  sourceChunkIds: string[]
  qualityStatus: "draft" | "validated" | "rejected"
  evidenceLevel: "low" | "medium" | "high"
}
```

### 4.7 ConceptState

```text
ConceptState {
  id: string
  userId: string
  courseId: string
  conceptId: string
  mastery: float           // 0..1
  confidence: float        // 0..1
  avgResponseTime: float
  errorCount: int
  lastReviewedAt: datetime | null
  nextReviewAt: datetime | null
  errorPatterns: string[]
  updatedAt: datetime
}
```

### 4.8 UserAnswer

```text
UserAnswer {
  id: string
  userId: string
  courseId: string
  conceptId: string
  questionId: string
  correct: bool
  confidence: float
  responseTime: float
  source: "diagnostic" | "inline_quiz" | "review_quiz" | "mock_exam"
  timestamp: datetime
}
```

### 4.9 StudySession

```text
StudySession {
  id: string
  userId: string
  courseId: string
  mode: "NORMAL" | "WEAKNESS" | "SINGLE" | "CHAPTER"
  startedAt: datetime
  endedAt: datetime | null
  durationSeconds: int
  conceptsCount: int
  masteredCount: int
  unsureCount: int
}
```

### 4.10 StudyPlan

```text
StudyPlan {
  id: string
  userId: string
  courseId: string
  generatedAt: datetime
  daysLeft: int
  tasks: [
    {
      id: string
      conceptId: string
      durationMinutes: int
      type: "learn" | "review" | "test"
      priority: float
      scheduledFor: date | datetime
    }
  ]
}
```

## 5. Core Modules

### 5.1 Course Parsing Engine

Goal: convert unstructured course material into a grounded course graph.

Pipeline:

```text
upload documents
  -> parse text
  -> chunk by document structure
  -> detect chapters
  -> extract candidate concepts
  -> AI-filter and normalize concepts
  -> merge duplicates
  -> infer prerequisites
  -> assign importance/evidence level
  -> persist course graph
```

MVP parsing:

- PDF: PyMuPDF.
- PPT/PPTX: python-pptx.
- Plain text and markdown: direct ingestion.
- DOCX: python-docx if needed.

Concept extraction:

- Step 1: deterministic candidate extraction with TF-IDF, TextRank, heading frequency, glossary-like patterns, bold/title signals when available.
- Step 2: AI normalization into strict JSON schema.
- Step 3: deterministic validation: required fields, duplicate threshold, source chunk traceability.

Prerequisite inference:

- Weak rule: earlier chapters weakly precede later chapters.
- Strong rule: explicit source phrases such as "requires", "based on", "before", "prerequisite".
- AI judgment may propose edges, but the graph builder must store confidence and keep edges reviewable.

Metrics:

- Concept precision/recall against human-labeled samples.
- Coverage target: more than 95% for syllabus learning outcomes.
- Duplicate rate target: less than 5%.
- Source traceability target: 100% for generated concepts.

### 5.2 Diagnostic Engine

Goal: generate and schedule an initial assessment for each concept.

Question generation policy:

```text
for each active concept:
  generate at least:
    - 1 definition or recognition question
    - 1 understanding question
    - 1 application question when source material supports it
```

MVP output:

- At least 2 questions per concept.
- Difficulty distribution configurable per course.
- All questions include `conceptId`, `sourceChunkIds`, `evidenceLevel`, and `qualityStatus`.

Question validation:

- One clear correct answer.
- Distractors plausible but not ambiguous.
- Question tests the target concept.
- Application questions require reasoning, not paraphrase only.
- No unsupported claims beyond source chunks.

Metrics:

- Coverage per concept.
- Difficulty distribution.
- Human quality score.
- Rejection rate by validator.

### 5.3 Knowledge State Engine

Goal: estimate each student's mastery for every concept.

MVP rule-based update:

```text
delta = 0
if answer.correct:
  delta += 0.10
else:
  delta -= 0.20

if answer.responseTime > threshold:
  delta -= 0.05

if answer.confidence < 0.50:
  delta -= 0.05

mastery = clamp(previousMastery + delta, 0, 1)
```

Additional state updates:

- Increment `errorCount` on wrong or unsure answers.
- Update `avgResponseTime` with exponential moving average.
- Set `lastReviewedAt` after every card/quiz interaction.
- Compute `nextReviewAt` using mastery and error count.
- Add error pattern tags when a wrong answer maps to a known misconception.

Important constraint:

- Mastery is a backend-owned estimate. The frontend can collect "mastered" or "unsure" feedback, but it should not directly set final mastery.

Future model:

- Bayesian Knowledge Tracing per concept.
- Item Response Theory when enough item-level performance data exists.

Metrics:

- Next-question correctness prediction AUC.
- Calibration curve.
- Convergence speed after diagnostic.
- Stability under small answer-order changes.

### 5.4 Planning Engine

Goal: generate adaptive study paths from concept state, course graph, exam deadline, and available study time.

Priority function:

```text
priority = (1 - mastery) * importance * examWeight * urgency * prerequisiteFactor
```

Defaults:

- `importance`: from syllabus and source frequency.
- `examWeight`: from past papers if available, otherwise conservative default.
- `urgency`: increases as exam date approaches.
- `prerequisiteFactor`: boosts prerequisite concepts that block later concepts.

Daily allocation:

```text
60% weak concepts
30% new or low-exposure concepts
10% spaced review
```

Plan output must map to frontend modes:

- `NORMAL`: current day's mixed queue.
- `WEAKNESS`: high-priority weak pool.
- `SINGLE`: direct concept repair.
- `CHAPTER`: chapter-scoped queue.

Metrics:

- Plan completion rate.
- Mastery gain per hour.
- Weakness hit rate.
- Replanning latency after new answer data.

### 5.5 Learning Loop Engine

Goal: run the card, quiz, feedback, weakness, and review loop.

Flow:

```text
create session
  -> fetch planned card queue
  -> show card
  -> collect mastered/unsure feedback
  -> every 3 cards insert quiz
  -> collect answer and response time
  -> update ConceptState
  -> update weak pool
  -> close session
  -> schedule next reviews
```

Card view model:

```text
CardView {
  id: string                 // concept id or generated card id
  chapter: string
  conceptEn: string
  conceptZh: string | null
  description: string
  source: string
  sourceChunkIds: string[]
  errorCount: int
  mastery: float
  evidenceLevel: "low" | "medium" | "high"
  inlineQuiz: QuestionView
}
```

Metrics:

- Session completion rate.
- Correctness improvement across repeated tests.
- Error recurrence rate.
- Retention after 1 day and 7 days.

### 5.6 Behavior Activation Engine

Goal: improve execution without corrupting learning decisions.

Inputs:

- Study session timestamps.
- Completion rate.
- Drop-off points.
- Response time trends.
- Notification interaction logs.

MVP behavior rules:

- If the user completes more evening sessions, schedule harder tasks in evening windows.
- If the user frequently abandons sessions, generate 5-minute tasks.
- If a concept repeatedly fails, schedule shorter but more frequent review.

Metrics:

- Notification-to-study activation rate.
- D1 and D7 retention.
- Drop-off rate.
- Completion rate by task length.

## 6. Exam Alignment and Risk Control

The largest product risk is that students practice plausible AI-generated questions that do not match the actual exam. EduMind must distinguish course alignment from exam alignment.

### 6.1 Input Sufficiency

Minimum usable input:

- Syllabus.
- Lecture slides or lecture notes.

Better input:

- Minimum inputs plus tutorials, homework, problem sets, weekly quizzes.

Ideal input:

- Better inputs plus past papers and marking schemes/model answers.

### 6.2 Output Labeling

Without past papers, do not call generated output a predicted exam paper.

Allowed labels:

- Course-aligned practice set.
- Syllabus-grounded diagnostic set.
- Concept-based revision questions.

Only use mock exam or exam-style calibration labels when past papers or equivalent benchmark materials are available.

### 6.3 Evidence on Every Question

Every question must expose:

- Concept id.
- Source chapter.
- Supporting source chunk ids.
- Document type evidence.
- Evidence level.
- Question type and difficulty.

### 6.4 Exam Alignment Score

Store exam alignment as a metric, not an assumption.

Dimensions:

- Syllabus coverage.
- Concept frequency match.
- Question type match.
- Difficulty match.
- Wording/style match.
- Marking-depth match.

Without past papers, only syllabus coverage and partial concept frequency can be computed. Full exam alignment requires benchmark-grade inputs.

## 7. API Design

Use `/api/v1` prefix. Responses should be typed and frontend-friendly. Long parsing/generation operations should return jobs.

### 7.1 Courses and Documents

```text
POST /api/v1/courses
GET  /api/v1/courses
GET  /api/v1/courses/{course_id}
PATCH /api/v1/courses/{course_id}

POST /api/v1/courses/{course_id}/documents
GET  /api/v1/courses/{course_id}/documents
GET  /api/v1/documents/{document_id}
```

### 7.2 Parsing Jobs

```text
POST /api/v1/courses/{course_id}/parse
GET  /api/v1/jobs/{job_id}
GET  /api/v1/courses/{course_id}/graph
```

`POST /parse` starts parsing and returns:

```json
{
  "jobId": "job_123",
  "status": "pending"
}
```

`GET /jobs/{job_id}` returns progress:

```json
{
  "jobId": "job_123",
  "status": "processing",
  "progress": 64,
  "message": "Extracting concepts"
}
```

### 7.3 Concepts and Knowledge Map

```text
GET   /api/v1/courses/{course_id}/concepts
GET   /api/v1/concepts/{concept_id}
PATCH /api/v1/courses/{course_id}/active-concepts
GET   /api/v1/courses/{course_id}/card-views
```

`active-concepts` replaces the current frontend onboarding selection.

### 7.4 Questions and Diagnostics

```text
POST /api/v1/courses/{course_id}/diagnostics
GET  /api/v1/courses/{course_id}/questions
GET  /api/v1/concepts/{concept_id}/questions
POST /api/v1/questions/{question_id}/answers
```

### 7.5 Study Sessions

```text
POST /api/v1/courses/{course_id}/sessions
GET  /api/v1/sessions/{session_id}
POST /api/v1/sessions/{session_id}/feedback
POST /api/v1/sessions/{session_id}/answers
POST /api/v1/sessions/{session_id}/complete
```

Create session request:

```json
{
  "mode": "WEAKNESS",
  "conceptId": null,
  "chapterId": null
}
```

Session response:

```json
{
  "sessionId": "sess_123",
  "mode": "WEAKNESS",
  "cards": [],
  "insertQuizEvery": 3
}
```

Feedback request:

```json
{
  "conceptId": "concept_123",
  "feedback": "unsure",
  "responseTime": 8.4,
  "timestamp": "2026-04-29T10:00:00Z"
}
```

### 7.6 Mastery, Plans, and Analytics

```text
GET  /api/v1/courses/{course_id}/concept-states
GET  /api/v1/courses/{course_id}/weaknesses
POST /api/v1/courses/{course_id}/plans
GET  /api/v1/courses/{course_id}/plans/current
GET  /api/v1/courses/{course_id}/analytics
GET  /api/v1/users/me/progress
```

Analytics should return the data now computed in `App.tsx`:

```json
{
  "masteryRate": 0.82,
  "resolvedToday": 3,
  "weakPoolCount": 5,
  "weakConcepts": [],
  "sessions": [],
  "upcomingReviews": []
}
```

## 8. Frontend Migration Plan

Phase 1: keep UI behavior, replace data source.

- Replace `src/data/mockData.ts` with API calls.
- Replace `src/services/geminiService.ts` with backend parsing endpoints.
- Keep local UI state for screen transitions, selected options, and animations.
- Move persistent state to backend: cards, active concepts, weak pool, sessions, progress, mastery.

Phase 2: backend-owned learning loop.

- `handleStartStudy` calls `POST /sessions`.
- `handleFeedback` calls `POST /sessions/{id}/feedback`.
- Quiz answers call `POST /sessions/{id}/answers`.
- Session completion calls `POST /sessions/{id}/complete`.

Phase 3: adaptive planning.

- Home roadmap uses `GET /plans/current`.
- Analytics uses `GET /analytics`.
- Profile plan tab uses `GET /users/me/progress`.

## 9. Test Strategy

### 9.1 Unit Tests

Course Parsing Engine:

- Chunking preserves source references.
- Duplicate concept merge works.
- Evidence level is assigned conservatively.
- Concepts without source chunks are rejected.

Knowledge State Engine:

- Correct answers increase mastery.
- Wrong answers decrease mastery more strongly.
- Slow responses reduce mastery slightly.
- Low confidence reduces mastery slightly.
- Mastery is clamped between 0 and 1.

Planning Engine:

- Lower mastery increases priority.
- Higher importance increases priority.
- Weak concepts receive about 60% of daily allocation.
- Replanning changes after new answer events.

Learning Loop Engine:

- Quiz is inserted every 3 cards.
- Wrong/unsure feedback enters weak pool.
- Mastered feedback can remove concept from weak pool only when mastery threshold is met.

### 9.2 Integration Tests

Core flows:

- Upload material -> parse job -> concepts -> card views.
- Confirm active concepts -> create normal session -> submit feedback -> update concept state.
- Submit wrong quiz answer -> weak pool and analytics update.
- Generate plan -> retrieve current plan -> create session from plan.

### 9.3 Evaluation Harness Later

After backend MVP exists, add an evaluation harness for:

- Concept extraction precision/recall.
- Question groundedness.
- Question quality.
- Next-question correctness prediction AUC.
- Exam alignment score when past papers exist.

This harness should be separate from this guidance document and should run against fixed fixtures.

## 10. MVP Implementation Order

1. Create FastAPI project skeleton, settings, database session, and health endpoint.
2. Implement SQLAlchemy models and Pydantic schemas for courses, documents, chunks, concepts, questions, concept states, answers, sessions, plans.
3. Implement Course Parsing Engine for pasted text first; add PDF/PPT upload after the API contract is stable.
4. Implement AI gateway with strict JSON schema and provider isolation.
5. Implement concept/card view endpoints to replace mock frontend data.
6. Implement Knowledge State Engine and session feedback endpoints.
7. Implement weakness analytics and user progress endpoints.
8. Implement Planning Engine MVP with rule-based priority.
9. Add question generation and diagnostics.
10. Add risk-control metadata in UI: source evidence, confidence/evidence level, and output label.

## 11. Non-Goals for MVP

- Do not build a full LMS.
- Do not claim exam prediction without past-paper benchmarks.
- Do not implement complex BKT before enough answer data exists.
- Do not let AI directly update mastery or planning decisions.
- Do not rely on generated numeric ids that change across sessions.

## 12. Acceptance Criteria

The backend MVP is acceptable when:

- A user can create a course and upload or paste material.
- The system produces traceable concepts and card views.
- The frontend can start normal, weakness, single-concept, and chapter sessions from backend data.
- Feedback and quiz answers update `ConceptState`.
- Weak concepts and analytics persist across reloads.
- Study history and upcoming reviews are returned by API.
- Generated content is labeled by evidence level.
- Without past papers, the product labels output as course-aligned practice, not predicted exam content.
