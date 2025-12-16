import {
  FlashcardMemoryType,
  RecallDifficulty,
  type SavedFlashcard,
  type FlashcardMemory,
} from "../types/flashcard-memory.types";

const FLASHCARD_MEMORY_KEY = "flashcard_memory";

export const flashcardMemoryService = {
  getMemory: (): FlashcardMemory => {
    const data = localStorage.getItem(FLASHCARD_MEMORY_KEY);
    if (!data) {
      return { flashcards: {} };
    }

    try {
      return JSON.parse(data) as FlashcardMemory;
    } catch {
      return { flashcards: {} };
    }
  },

  saveMemory: (memory: FlashcardMemory): void => {
    localStorage.setItem(FLASHCARD_MEMORY_KEY, JSON.stringify(memory));
  },

  saveFlashcard: (flashcard: {
    id: string;
    lessonId: string;
    topicId: string;
    moduleId: string;
    front: string;
    back: string;
    emoji: string;
  }): void => {
    const memory = flashcardMemoryService.getMemory();

    if (memory.flashcards[flashcard.id]) {
      return;
    }

    const savedFlashcard: SavedFlashcard = {
      ...flashcard,
      memoryType: FlashcardMemoryType.SHORT_TERM,
      savedAt: new Date().toISOString(),
      easyCount: 0,
      recallCount: 0,
    };

    memory.flashcards[flashcard.id] = savedFlashcard;
    flashcardMemoryService.saveMemory(memory);
  },

  removeFlashcard: (flashcardId: string): void => {
    const memory = flashcardMemoryService.getMemory();
    delete memory.flashcards[flashcardId];
    flashcardMemoryService.saveMemory(memory);
  },

  isFlashcardSaved: (flashcardId: string): boolean => {
    const memory = flashcardMemoryService.getMemory();
    return !!memory.flashcards[flashcardId];
  },

  getAllFlashcards: (): SavedFlashcard[] => {
    const memory = flashcardMemoryService.getMemory();
    return Object.values(memory.flashcards);
  },

  getFlashcardsByType: (type: FlashcardMemoryType): SavedFlashcard[] => {
    const memory = flashcardMemoryService.getMemory();
    return Object.values(memory.flashcards).filter(
      (fc) => fc.memoryType === type
    );
  },

  getDueFlashcards: (): SavedFlashcard[] => {
    const memory = flashcardMemoryService.getMemory();
    const now = new Date();

    return Object.values(memory.flashcards)
      .filter((fc) => {
        if (fc.memoryType === FlashcardMemoryType.LONG_TERM) {
          return false;
        }

        if (!fc.nextRecallAt) {
          return true;
        }

        return new Date(fc.nextRecallAt) <= now;
      })
      .sort((a, b) => {
        const aTime = a.nextRecallAt
          ? new Date(a.nextRecallAt).getTime()
          : new Date(a.savedAt).getTime();
        const bTime = b.nextRecallAt
          ? new Date(b.nextRecallAt).getTime()
          : new Date(b.savedAt).getTime();
        return aTime - bTime;
      });
  },

  recordRecall: (
    flashcardId: string,
    difficulty: RecallDifficulty
  ): void => {
    const memory = flashcardMemoryService.getMemory();
    const flashcard = memory.flashcards[flashcardId];

    if (!flashcard) return;

    const now = new Date();
    flashcard.lastRecalledAt = now.toISOString();
    flashcard.recallCount++;

    switch (difficulty) {
      case RecallDifficulty.DONT_REMEMBER:
        flashcard.nextRecallAt = undefined;
        flashcard.easyCount = 0;
        break;

      case RecallDifficulty.HARD:
        const hardTime = new Date(now.getTime() + 5 * 60 * 1000);
        flashcard.nextRecallAt = hardTime.toISOString();
        flashcard.easyCount = 0;
        break;

      case RecallDifficulty.EASY:
        const easyTime = new Date(now.getTime() + 60 * 60 * 1000);
        flashcard.nextRecallAt = easyTime.toISOString();
        flashcard.easyCount++;

        if (flashcard.easyCount >= 2) {
          flashcard.memoryType = FlashcardMemoryType.LONG_TERM;
          flashcard.nextRecallAt = undefined;
        }
        break;
    }

    memory.flashcards[flashcardId] = flashcard;
    flashcardMemoryService.saveMemory(memory);
  },

  moveToRecall: (flashcardId: string): void => {
    const memory = flashcardMemoryService.getMemory();
    const flashcard = memory.flashcards[flashcardId];

    if (!flashcard) return;

    flashcard.nextRecallAt = undefined;
    flashcard.easyCount = 0;
    flashcard.memoryType = FlashcardMemoryType.SHORT_TERM;

    memory.flashcards[flashcardId] = flashcard;
    flashcardMemoryService.saveMemory(memory);
  },

  getStats: () => {
    const memory = flashcardMemoryService.getMemory();
    const flashcards = Object.values(memory.flashcards);

    return {
      total: flashcards.length,
      shortTerm: flashcards.filter(
        (fc) => fc.memoryType === FlashcardMemoryType.SHORT_TERM
      ).length,
      longTerm: flashcards.filter(
        (fc) => fc.memoryType === FlashcardMemoryType.LONG_TERM
      ).length,
      dueNow: flashcardMemoryService.getDueFlashcards().length,
    };
  },
};

