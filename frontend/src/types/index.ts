import { LucideIcon } from 'lucide-react';

export type AppState = 'HOME' | 'PARSING' | 'COURSE_REVIEW' | 'MINDMAP' | 'STUDYING' | 'ANALYTICS' | 'QUIZ' | 'PRIORITY_REVIEW' | 'WEAKNESS_REPORT' | 'PROFILE';

export type StudyMode = 'NORMAL' | 'WEAKNESS' | 'SINGLE' | 'CHAPTER';

export interface QuizOption {
  id: string;
  text: string;
}

export interface InlineQuiz {
  id: string;
  question: string;
  options: QuizOption[];
  correctAnswer: string;
}

export interface Card {
  id: string;
  chapter: string;
  conceptEn: string;
  conceptZh: string;
  description: string;
  descriptionZh?: string | null;
  descriptionEn?: string | null;
  source: string;
  errorCount: number;
  mastery: number;
  inlineQuiz: InlineQuiz;
  tags?: string[];
  relevance?: number;
}

export type DocumentType =
  | 'syllabus'
  | 'slides'
  | 'notes'
  | 'past_paper'
  | 'marking_scheme'
  | 'tutorial'
  | 'homework'
  | 'quiz'
  | 'other';

export interface SourceDocument {
  id: string;
  courseId: string;
  type: DocumentType;
  filename: string;
  parseStatus: string;
  createdAt: string;
}

export interface CourseDetails {
  gradingPolicy?: string | null;
  assessmentScheme?: string | null;
  examFormat?: string | null;
  learningOutcomes: string[];
  schedule?: string | null;
}

export interface Chapter {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  description?: string | null;
  keywords: string[];
}

export interface ChapterDraft {
  title: string;
  description?: string | null;
  keywords: string[];
}

export interface Course {
  id: string;
  userId: string;
  code?: string | null;
  title: string;
  subject?: string | null;
  details: CourseDetails;
}

export interface CourseStructureDraft {
  code?: string | null;
  title: string;
  subject?: string | null;
  details: CourseDetails;
  chapters: ChapterDraft[];
}

export interface Quiz {
  id: string;
  conceptId: string;
  question: string;
  options: QuizOption[];
  correctAnswer: string;
}

export interface SessionStats {
  total: number;
  mastered: number;
  unsure: number;
}

export interface StudySession {
  id: string;
  timestamp: number;
  duration: number; // in seconds
  conceptsCount: number;
  masteryRate: number;
}

export interface UserProgress {
  totalStudyTime: number; // in seconds
  sessions: StudySession[];
  upcomingReviews: {
    conceptId: string;
    conceptName: string;
    scheduledTime: number;
  }[];
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  level: number;
}

export interface ActivityDay {
  date: string;
  minutes: number;
  intensity: number;
}

export interface ProfileStats {
  totalStudyTime: number;
  masteryRate: number;
  retentionGrowth: number;
  activityDistribution: ActivityDay[];
}

export interface UserLlmSettings {
  apiUrl: string;
  model: string;
  hasUserApiKey: boolean;
  hasEffectiveApiKey: boolean;
  apiKeyPreview?: string | null;
}

export interface StudyPlanTask {
  id: string;
  conceptId: string;
  durationMinutes: number;
  type: 'learn' | 'review' | 'test';
  priority: number;
  scheduledFor: string;
}

export interface StudyPlan {
  id: string;
  courseId: string;
  generatedAt: string;
  daysLeft: number;
  tasks: StudyPlanTask[];
}

export interface BehaviorHint {
  recommendedMinutes: number;
  bestHour: number | null;
  message: string;
}
