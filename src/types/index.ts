import { LucideIcon } from 'lucide-react';

export type AppState = 'HOME' | 'PARSING' | 'MINDMAP' | 'STUDYING' | 'ANALYTICS' | 'QUIZ' | 'WEAKNESS_REPORT' | 'PROFILE';

export type StudyMode = 'NORMAL' | 'WEAKNESS' | 'SINGLE' | 'CHAPTER';

export interface QuizOption {
  id: string;
  text: string;
}

export interface InlineQuiz {
  question: string;
  options: QuizOption[];
  correctAnswer: string;
}

export interface Card {
  id: number;
  chapter: string;
  conceptEn: string;
  conceptZh: string;
  description: string;
  source: string;
  errorCount: number;
  inlineQuiz: InlineQuiz;
  tags?: string[];
  relevance?: number;
}

export interface Quiz {
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
    conceptId: number;
    conceptName: string;
    scheduledTime: number;
  }[];
}
