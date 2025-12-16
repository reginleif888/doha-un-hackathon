export enum ModuleType {
  INFO = "info",
  QUIZ = "quiz",
  FLASHCARDS = "flashcards",
}

export enum QuizType {
  SINGLE = "single",
  MULTIPLE = "multiple",
}

export interface VideoContent {
  X: string;
  Y: string;
}

export interface InfoModule {
  id: string;
  type: ModuleType.INFO;
  title: string;
  description?: string;
  content: string;
  video?: VideoContent;
  xp: number;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: QuizType;
  options: QuizOption[];
  explanation?: string;
}

export interface QuizModule {
  id: string;
  type: ModuleType.QUIZ;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  passingScore: number;
  xp: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  emoji?: string;
}

export interface FlashcardsModule {
  id: string;
  type: ModuleType.FLASHCARDS;
  title: string;
  description?: string;
  cards: Flashcard[];
  xp: number;
}

export type Module = InfoModule | QuizModule | FlashcardsModule;

export interface Lesson {
  id: string;
  title: string;
  description: string;
  modules: Module[];
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  icon?: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  topics: Topic[];
  totalXp: number;
}

export interface ModuleProgress {
  moduleId: string;
  completed: boolean;
  score?: number;
  xpEarned: number;
  completedAt?: string;
}

export interface LessonProgress {
  lessonId: string;
  modules: Record<string, ModuleProgress>;
  completed: boolean;
}

export interface TopicProgress {
  topicId: string;
  lessons: Record<string, LessonProgress>;
  completed: boolean;
}

export interface UserProgress {
  principal?: string;
  courseId: string;
  topics: Record<string, TopicProgress>;
  totalXpEarned: number;
  lastAccessedAt: string;
}

