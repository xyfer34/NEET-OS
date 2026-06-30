export type SubjectType = "Biology" | "Physics" | "Chemistry";

export type MasteryStatus = "not_started" | "weak" | "revision_due" | "mastered";

export interface StudentProfile {
  examDate: string;
  daysRemaining: number;
  currentMarks: number;
  physicsMarks: number;
  chemistryMarks: number;
  biologyMarks: number;
  targetScore: number;
  dailyStudyHours: number;
  schoolMode: "Dummy" | "Regular" | "Completed";
  coachingMode: "Self Study" | "Online Coaching" | "Offline Coaching";
  currentBacklog: "None" | "Mild (1-5 chapters)" | "Moderate (6-15 chapters)" | "Severe (15+ chapters)";
  weakChapters: string[];
  strongChapters: string[];
  chaptersCompleted: string[];
  mockTestsGiven: number;
  currentAccuracy: number;
  preferredStudyTime: "Morning" | "Afternoon" | "Late Night" | "Flexible";
  wakeUpTime: string;
  sleepTime: string;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
}

export interface SyllabusChapter {
  id: string;
  subject: SubjectType;
  name: string;
  classGrade: 11 | 12;
  theoryDone: boolean;
  ncertReadCount: number; // 0 to 3+
  notesReviewed: boolean;
  formulaRevised: boolean;
  questionPracticeCount: number; // MCQ count
  pyqsDone: boolean;
  mockTested: boolean;
  revisionDueDate?: string;
  masteryStatus: MasteryStatus;
  highlighted?: boolean;
}

export interface PracticeLog {
  id: string;
  date: string;
  subject: SubjectType;
  chapterId: string;
  chapterName: string;
  correct: number;
  wrong: number;
  skipped: number;
  timeTakenMinutes: number;
  guessAccuracy: number;
  timestamp: string;
}

export interface MockTestLog {
  id: string;
  date: string;
  physicsMarks: number;
  chemistryMarks: number;
  biologyMarks: number;
  totalMarks: number;
  correct: number;
  wrong: number;
  skipped: number;
  timeLeftMinutes: number;
  weakChapters: string[];
  mistakeReasons: string[];
  timestamp: string;
}

export interface MistakeItem {
  id: string;
  subject: SubjectType;
  chapterId: string;
  chapterName: string;
  questionText: string;
  correctAnswer: string;
  yourAnswer: string;
  tag: "Concept Error" | "Formula Error" | "Calculation Error" | "Guess" | "Time Pressure" | "Silly Mistake" | "NCERT Fact" | "Forgot Revision";
  notes: string;
  date: string;
  reviewCount: number;
}

export interface FormulaItem {
  id: string;
  subject: "Physics" | "Chemistry" | "Biology";
  chapterId: string;
  chapterName: string;
  title: string;
  formula: string;
  description: string;
  isBookmarked: boolean;
}

export interface Flashcard {
  id: string;
  subject: SubjectType;
  chapterId: string;
  chapterName: string;
  question: string;
  answer: string;
  box: number; // Leitner box (1 to 5)
  nextReviewDate: string;
}

export interface JournalEntry {
  date: string;
  wins: string;
  mistakes: string;
  goals: string;
}

export interface HealthLog {
  date: string;
  sleepHours: number;
  waterCups: number;
  exerciseMinutes: number;
  mood: "Great" | "Good" | "Average" | "Anxious" | "Exhausted";
}
