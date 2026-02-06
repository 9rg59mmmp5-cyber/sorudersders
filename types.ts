
export interface StudyLog {
  id: string;
  date: string;
  lessonId: string;
  topic: string;
  duration: number; // in minutes
  questionsSolved: number;
  notes?: string;
}

export interface Lesson {
  id: string;
  name: string;
  color: string;
  topics: string[];
}

export type TimeRange = 'daily' | 'weekly' | 'monthly';

export interface DashboardStats {
  totalStudyTime: number;
  totalQuestions: number;
  studiedDaysCount: number;
  mostStudiedLesson: string;
}
