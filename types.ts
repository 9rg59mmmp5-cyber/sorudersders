
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

export interface GoalTarget {
  questions: number;
}

export interface Goals {
  daily: GoalTarget;
  weekly: GoalTarget;
  monthly: GoalTarget;
  topicGoals: Record<string, number>; // Key: "lessonId:topicName", Value: Question Target
}

export type TimeRange = 'daily' | 'weekly' | 'monthly';

export interface DashboardStats {
  totalStudyTime: number;
  totalQuestions: number;
  studiedDaysCount: number;
  mostStudiedLesson: string;
}
