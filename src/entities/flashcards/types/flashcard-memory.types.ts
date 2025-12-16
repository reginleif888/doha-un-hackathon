export enum FlashcardMemoryType {
  SHORT_TERM = "short-term",
  LONG_TERM = "long-term",
}

export enum RecallDifficulty {
  EASY = "easy",
  HARD = "hard",
  DONT_REMEMBER = "dont-remember",
}

export interface SavedFlashcard {
  id: string;
  lessonId: string;
  topicId: string;
  moduleId: string;
  front: string;
  back: string;
  emoji: string;
  memoryType: FlashcardMemoryType;
  savedAt: string;
  lastRecalledAt?: string;
  nextRecallAt?: string;
  easyCount: number;
  recallCount: number;
}

export interface FlashcardMemory {
  flashcards: Record<string, SavedFlashcard>;
}

export interface RecallSession {
  flashcards: SavedFlashcard[];
  currentIndex: number;
  completed: number;
}

