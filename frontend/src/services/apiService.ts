import {
  Card,
  Chapter,
  Course,
  CourseStructureDraft,
  BehaviorHint,
  Quiz,
  SessionStats,
  SourceDocument,
  StudyPlan,
  StudyMode,
  ProfileStats,
  UserAccount,
  UserLlmSettings,
  UserProgress,
} from "../types";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");

export const isBackendApiConfigured = API_BASE_URL.length > 0;

interface BackendQuizOption {
  id: string;
  text: string;
}

interface BackendQuestionView {
  id: string;
  conceptId: string;
  stem: string;
  options: BackendQuizOption[];
  answer: string;
}

interface BackendCardView {
  id: string;
  chapter: string;
  conceptEn: string;
  conceptZh?: string | null;
  description: string;
  descriptionZh?: string | null;
  descriptionEn?: string | null;
  source: string;
  errorCount: number;
  mastery: number;
  inlineQuiz: BackendQuestionView;
}

interface CourseRead {
  id: string;
  user_id: string;
  code?: string | null;
  title: string;
  subject?: string | null;
  details: Course["details"];
}

interface BackendChapterRead {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  description?: string | null;
  keywords: string[];
}

interface BackendSourceDocumentRead {
  id: string;
  course_id: string;
  type: SourceDocument["type"];
  filename: string;
  parse_status: string;
  created_at: string;
}

interface BackendBatchDocumentIngestRead {
  documents: BackendSourceDocumentRead[];
  cards_count: number;
}

interface BackendStudySessionRead {
  sessionId: string;
  mode: StudyMode;
  cards: BackendCardView[];
  insertQuizEvery: number;
}

interface BackendCourseAnalyticsRead {
  masteryRate: number;
  resolvedToday: number;
  weakPoolCount: number;
  reviewedConceptCount: number;
  unseenConceptCount: number;
  weakConcepts: BackendCardView[];
  behaviorHint: BehaviorHint;
  sessions: {
    id: string;
    timestamp: number;
    duration: number;
    conceptsCount: number;
    masteryRate: number;
  }[];
  upcomingReviews: {
    conceptId: string;
    conceptName: string;
    scheduledTime: number;
  }[];
}

interface AuthRead {
  token: string;
  user: UserAccount;
}

const AUTH_TOKEN_KEY = "edumind_auth_token";

const authHeaders = (): HeadersInit => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    if (response.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    throw new Error(body || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

export const logout = () => localStorage.removeItem(AUTH_TOKEN_KEY);

export const login = async (email: string, password: string): Promise<UserAccount> => {
  const auth = await requestJson<AuthRead>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem(AUTH_TOKEN_KEY, auth.token);
  return auth.user;
};

export const register = async (
  name: string,
  email: string,
  password: string,
  subject?: string,
): Promise<UserAccount> => {
  const auth = await requestJson<AuthRead>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, subject }),
  });
  localStorage.setItem(AUTH_TOKEN_KEY, auth.token);
  return auth.user;
};

export const getCurrentUser = async (): Promise<UserAccount> => {
  return requestJson<UserAccount>("/auth/me");
};

export const getProfileStats = async (): Promise<ProfileStats> => {
  return requestJson<ProfileStats>("/users/me/profile");
};

export const getUserLlmSettings = async (): Promise<UserLlmSettings> => {
  return requestJson<UserLlmSettings>("/users/me/llm-settings");
};

export const updateUserLlmSettings = async (apiKey: string): Promise<UserLlmSettings> => {
  return requestJson<UserLlmSettings>("/users/me/llm-settings", {
    method: "PUT",
    body: JSON.stringify({ apiKey }),
  });
};

export interface CourseMaterialResult {
  cards: Card[];
  documents: SourceDocument[];
}

export interface StudySessionResult {
  sessionId: string;
  cards: Card[];
}

export interface CourseAnalytics {
  masteryRate: number;
  resolvedToday: number;
  weakPool: string[];
  weakCards: Card[];
  reviewedConceptCount: number;
  unseenConceptCount: number;
  userProgress: UserProgress;
  behaviorHint: BehaviorHint;
}

export const listCourses = async (): Promise<CourseRead[]> => {
  return requestJson<CourseRead[]>("/courses");
};

export const analyzeSyllabus = async (file: File): Promise<CourseStructureDraft> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_BASE_URL}/courses/from-syllabus`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  if (!response.ok) {
    const body = await response.text();
    if (response.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    throw new Error(body || `Request failed with ${response.status}`);
  }
  return response.json() as Promise<CourseStructureDraft>;
};

export const createCourseFromDraft = async (draft: CourseStructureDraft): Promise<Course> => {
  const course = await requestJson<CourseRead>("/courses", {
    method: "POST",
    body: JSON.stringify(draft),
  });
  return toFrontendCourse(course);
};

export const getCourseChapters = async (courseId: string): Promise<Chapter[]> => {
  const chapters = await requestJson<BackendChapterRead[]>(`/courses/${courseId}/chapters`);
  return chapters;
};

export const getCourseCards = async (courseId: string): Promise<Card[]> => {
  const cards = await requestJson<BackendCardView[]>(`/courses/${courseId}/card-views`);
  return cards.map(toFrontendCard);
};

export const getCourseDocuments = async (courseId: string): Promise<SourceDocument[]> => {
  const documents = await requestJson<BackendSourceDocumentRead[]>(`/courses/${courseId}/documents`);
  return documents.map(toFrontendDocument);
};

export const updateActiveConcepts = async (courseId: string, conceptIds: string[]): Promise<void> => {
  await requestJson(`/courses/${courseId}/active-concepts`, {
    method: "PATCH",
    body: JSON.stringify({ conceptIds }),
  });
};

export const getCourseAnalytics = async (courseId: string): Promise<CourseAnalytics> => {
  const analytics = await requestJson<BackendCourseAnalyticsRead>(`/courses/${courseId}/analytics`);
  return {
    masteryRate: analytics.masteryRate,
    resolvedToday: analytics.resolvedToday,
    weakPool: analytics.weakConcepts.map(card => card.id),
    weakCards: analytics.weakConcepts.map(toFrontendCard),
    reviewedConceptCount: analytics.reviewedConceptCount,
    unseenConceptCount: analytics.unseenConceptCount,
    userProgress: {
      totalStudyTime: analytics.sessions.reduce((total, session) => total + session.duration, 0),
      sessions: analytics.sessions,
      upcomingReviews: analytics.upcomingReviews,
    },
    behaviorHint: analytics.behaviorHint,
  };
};

export const getCurrentStudyPlan = async (courseId: string): Promise<StudyPlan> => {
  return requestJson<StudyPlan>(`/courses/${courseId}/plans/current`);
};

export const getUserProgress = async (): Promise<UserProgress> => {
  return requestJson<UserProgress>("/users/me/progress");
};

export const uploadStudyMaterials = async (
  courseId: string,
  files: File[],
  chapterIds: string[] = [],
): Promise<CourseMaterialResult> => {
  const formData = new FormData();
  files.forEach(file => formData.append("files", file));
  chapterIds.forEach(chapterId => formData.append("chapter_ids", chapterId));

  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/documents/files`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const body = await response.text();
    if (response.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    throw new Error(body || `Request failed with ${response.status}`);
  }

  const uploadResult = (await response.json()) as BackendBatchDocumentIngestRead;
  const cards = await requestJson<BackendCardView[]>(`/courses/${courseId}/card-views`);
  return {
    cards: cards.map(toFrontendCard),
    documents: uploadResult.documents.map(toFrontendDocument),
  };
};

export const createStudySession = async (
  courseId: string,
  mode: StudyMode,
  payload?: string,
): Promise<StudySessionResult> => {
  const body: { mode: StudyMode; conceptId?: string; chapterId?: string } = { mode };
  if (mode === "SINGLE" && payload) body.conceptId = payload;
  if (mode === "CHAPTER" && payload) body.chapterId = payload;

  const session = await requestJson<BackendStudySessionRead>(`/courses/${courseId}/sessions`, {
    method: "POST",
    body: JSON.stringify(body),
  });

  return {
    sessionId: session.sessionId,
    cards: session.cards.map(toFrontendCard),
  };
};

export const submitStudyFeedback = async (
  sessionId: string,
  conceptId: string,
  isMastered: boolean,
  responseTime: number,
): Promise<SessionStats> => {
  return requestJson<SessionStats>(`/sessions/${sessionId}/feedback`, {
    method: "POST",
    body: JSON.stringify({
      conceptId,
      feedback: isMastered ? "mastered" : "unsure",
      responseTime,
      timestamp: new Date().toISOString(),
    }),
  });
};

export const submitQuizAnswer = async (
  courseId: string,
  questionId: string,
  selectedAnswer: string,
  confidence: number,
  responseTime: number,
) => {
  return requestJson(`/courses/${courseId}/answers`, {
    method: "POST",
    body: JSON.stringify({
      questionId,
      selectedAnswer,
      confidence,
      responseTime,
    }),
  });
};

export const completeStudySession = async (sessionId: string): Promise<SessionStats> => {
  return requestJson<SessionStats>(`/sessions/${sessionId}/complete`, {
    method: "POST",
  });
};

export const toQuiz = (card: Card): Quiz => ({
  id: card.inlineQuiz.id,
  conceptId: card.id,
  question: card.inlineQuiz.question,
  options: card.inlineQuiz.options,
  correctAnswer: card.inlineQuiz.correctAnswer,
});

const toFrontendCard = (card: BackendCardView): Card => ({
  id: card.id,
  chapter: card.chapter,
  conceptEn: card.conceptEn,
  conceptZh: card.conceptZh ?? card.conceptEn,
  description: card.description,
  descriptionZh: card.descriptionZh ?? null,
  descriptionEn: card.descriptionEn ?? card.description,
  source: card.source,
  errorCount: card.errorCount ?? 0,
  mastery: card.mastery,
  inlineQuiz: {
    id: card.inlineQuiz.id,
    question: card.inlineQuiz.stem,
    options: card.inlineQuiz.options,
    correctAnswer: card.inlineQuiz.answer,
  },
});

const toFrontendDocument = (document: BackendSourceDocumentRead): SourceDocument => ({
  id: document.id,
  courseId: document.course_id,
  type: document.type,
  filename: document.filename,
  parseStatus: document.parse_status,
  createdAt: document.created_at,
});

const toFrontendCourse = (course: CourseRead): Course => ({
  id: course.id,
  userId: course.user_id,
  code: course.code,
  title: course.title,
  subject: course.subject,
  details: course.details,
});
