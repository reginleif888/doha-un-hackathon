import {
  UserProgress,
  TopicProgress,
  LessonProgress,
  ModuleProgress,
  Course,
  Module,
  ModuleType,
} from "@/shared/types";
import { USER_PROGRESS_KEY, COURSE_ID } from "@/shared/constants";

const getStoredProgress = (): UserProgress | null => {
  const stored = localStorage.getItem(USER_PROGRESS_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as UserProgress;
  } catch {
    return null;
  }
};

const saveProgress = (progress: UserProgress): void => {
  localStorage.setItem(USER_PROGRESS_KEY, JSON.stringify(progress));
};

const createEmptyProgress = (): UserProgress => ({
  courseId: COURSE_ID,
  topics: {},
  totalXpEarned: 0,
  lastAccessedAt: new Date().toISOString(),
});

export const progressService = {
  getProgress(): UserProgress {
    return getStoredProgress() || createEmptyProgress();
  },

  getTopicProgress(topicId: string): TopicProgress | null {
    const progress = this.getProgress();
    return progress.topics[topicId] || null;
  },

  getLessonProgress(topicId: string, lessonId: string): LessonProgress | null {
    const topicProgress = this.getTopicProgress(topicId);
    if (!topicProgress) return null;
    return topicProgress.lessons[lessonId] || null;
  },

  getModuleProgress(
    topicId: string,
    lessonId: string,
    moduleId: string
  ): ModuleProgress | null {
    const lessonProgress = this.getLessonProgress(topicId, lessonId);
    if (!lessonProgress) return null;
    return lessonProgress.modules[moduleId] || null;
  },

  isModuleAccessible(
    course: Course,
    topicId: string,
    lessonId: string,
    moduleId: string
  ): boolean {
    const topic = course.topics.find((t) => t.id === topicId);
    if (!topic) return false;

    const lesson = topic.lessons.find((l) => l.id === lessonId);
    if (!lesson) return false;

    const moduleIndex = lesson.modules.findIndex((m) => m.id === moduleId);
    if (moduleIndex === -1) return false;

    if (moduleIndex === 0) return true;

    const previousModule = lesson.modules[moduleIndex - 1];
    const previousProgress = this.getModuleProgress(
      topicId,
      lessonId,
      previousModule.id
    );
    return previousProgress?.completed ?? false;
  },

  isLessonAccessible(
    course: Course,
    topicId: string,
    lessonId: string
  ): boolean {
    const topic = course.topics.find((t) => t.id === topicId);
    if (!topic) return false;

    const lessonIndex = topic.lessons.findIndex((l) => l.id === lessonId);
    if (lessonIndex === -1) return false;

    if (lessonIndex === 0) return true;

    const previousLesson = topic.lessons[lessonIndex - 1];
    const previousProgress = this.getLessonProgress(topicId, previousLesson.id);
    return previousProgress?.completed ?? false;
  },

  completeModule(
    topicId: string,
    lessonId: string,
    module: Module,
    score?: number
  ): { xpEarned: number; totalXp: number } {
    const progress = this.getProgress();

    if (!progress.topics[topicId]) {
      progress.topics[topicId] = {
        topicId,
        lessons: {},
        completed: false,
      };
    }

    if (!progress.topics[topicId].lessons[lessonId]) {
      progress.topics[topicId].lessons[lessonId] = {
        lessonId,
        modules: {},
        completed: false,
      };
    }

    const existingModuleProgress =
      progress.topics[topicId].lessons[lessonId].modules[module.id];
    if (existingModuleProgress?.completed) {
      return {
        xpEarned: 0,
        totalXp: progress.totalXpEarned,
      };
    }

    const xpEarned = this.calculateXp(module, score);

    progress.topics[topicId].lessons[lessonId].modules[module.id] = {
      moduleId: module.id,
      completed: true,
      score,
      xpEarned,
      completedAt: new Date().toISOString(),
    };

    progress.totalXpEarned += xpEarned;
    progress.lastAccessedAt = new Date().toISOString();

    saveProgress(progress);

    return {
      xpEarned,
      totalXp: progress.totalXpEarned,
    };
  },

  calculateXp(module: Module, score?: number): number {
    if (module.type === ModuleType.QUIZ && score !== undefined) {
      return Math.floor((score / 100) * module.xp);
    }
    return module.xp;
  },

  updateLessonCompletion(
    course: Course,
    topicId: string,
    lessonId: string
  ): void {
    const progress = this.getProgress();
    const topic = course.topics.find((t) => t.id === topicId);
    const lesson = topic?.lessons.find((l) => l.id === lessonId);

    if (!lesson || !progress.topics[topicId]?.lessons[lessonId]) return;

    const lessonProgress = progress.topics[topicId].lessons[lessonId];
    const allModulesCompleted = lesson.modules.every(
      (m) => lessonProgress.modules[m.id]?.completed
    );

    lessonProgress.completed = allModulesCompleted;
    saveProgress(progress);

    if (allModulesCompleted) {
      this.updateTopicCompletion(course, topicId);
    }
  },

  updateTopicCompletion(course: Course, topicId: string): void {
    const progress = this.getProgress();
    const topic = course.topics.find((t) => t.id === topicId);

    if (!topic || !progress.topics[topicId]) return;

    const topicProgress = progress.topics[topicId];
    const allLessonsCompleted = topic.lessons.every(
      (l) => topicProgress.lessons[l.id]?.completed
    );

    topicProgress.completed = allLessonsCompleted;
    saveProgress(progress);
  },

  calculateCourseProgress(course: Course): {
    completedModules: number;
    totalModules: number;
    percentage: number;
  } {
    const progress = this.getProgress();
    let completed = 0;
    let total = 0;

    for (const topic of course.topics) {
      for (const lesson of topic.lessons) {
        for (const module of lesson.modules) {
          total++;
          if (
            progress.topics[topic.id]?.lessons[lesson.id]?.modules[module.id]
              ?.completed
          ) {
            completed++;
          }
        }
      }
    }

    return {
      completedModules: completed,
      totalModules: total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  },

  calculateTopicProgress(
    course: Course,
    topicId: string
  ): {
    completedModules: number;
    totalModules: number;
    percentage: number;
  } {
    const progress = this.getProgress();
    const topic = course.topics.find((t) => t.id === topicId);

    if (!topic) {
      return { completedModules: 0, totalModules: 0, percentage: 0 };
    }

    let completed = 0;
    let total = 0;

    for (const lesson of topic.lessons) {
      for (const module of lesson.modules) {
        total++;
        if (
          progress.topics[topicId]?.lessons[lesson.id]?.modules[module.id]
            ?.completed
        ) {
          completed++;
        }
      }
    }

    return {
      completedModules: completed,
      totalModules: total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  },

  resetProgress(): void {
    localStorage.removeItem(USER_PROGRESS_KEY);
  },
};
