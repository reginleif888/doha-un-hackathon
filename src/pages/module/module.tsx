import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "@tanstack/react-router";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { courseService } from "@/entities/course";
import { progressService } from "@/entities/progress";
import { InfoModule } from "@/components/features/info-module";
import { QuizModule } from "@/components/features/quiz-module";
import { FlashcardsModule } from "@/components/features/flashcards-module";

import type {
  Course,
  Topic,
  Lesson,
  Module,
  InfoModule as InfoModuleType,
  QuizModule as QuizModuleType,
  FlashcardsModule as FlashcardsModuleType,
} from "@/shared/types";
import { ModuleType } from "@/shared/types";

export const ModulePage = () => {
  const params = useParams({ strict: false });
  const { topicId, lessonId, moduleId } = params;
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const courseData = await courseService.getCourse();
        setCourse(courseData);
        const topicData = courseData.topics.find((t) => t.id === topicId);
        setTopic(topicData || null);
        const lessonData = topicData?.lessons.find((l) => l.id === lessonId);
        setLesson(lessonData || null);
        const moduleData = lessonData?.modules.find((m) => m.id === moduleId);
        setModule(moduleData || null);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [topicId, lessonId, moduleId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  if (!course || !topic || !lesson || !module || !topicId || !lessonId || !moduleId) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] gap-4 p-4">
        <p className="text-muted-foreground text-center">Module not found</p>
        <Button asChild>
          <Link to="/course">Back to Course</Link>
        </Button>
      </div>
    );
  }

  const moduleIndex = lesson.modules.findIndex((m) => m.id === moduleId);
  const isLastModule = moduleIndex === lesson.modules.length - 1;
  const nextModule = isLastModule ? null : lesson.modules[moduleIndex + 1];

  const handleComplete = (score?: number) => {
    const result = progressService.completeModule(
      topicId,
      lessonId,
      module,
      score
    );

    progressService.updateLessonCompletion(course, topicId, lessonId);

    window.dispatchEvent(new Event("progress-updated"));

    return result;
  };

  const handleContinue = () => {
    if (nextModule) {
      navigate({
        to: "/course/$topicId/$lessonId/$moduleId",
        params: { topicId, lessonId, moduleId: nextModule.id },
      });
    } else {
      const lessonIndex = topic.lessons.findIndex((l) => l.id === lessonId);
      const nextLesson = topic.lessons[lessonIndex + 1];

      if (nextLesson) {
        navigate({
          to: "/course/$topicId/$lessonId",
          params: { topicId, lessonId: nextLesson.id },
        });
      } else {
        navigate({ to: "/course/$topicId", params: { topicId } });
      }
    }
  };

  const moduleProgress = progressService.getModuleProgress(
    topicId,
    lessonId,
    moduleId
  );
  const isCompleted = moduleProgress?.completed ?? false;

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border bg-background px-3 sm:px-6 py-2 sm:py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-4xl mx-auto gap-2">
          <Button variant="ghost" asChild className="-ml-2 h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3">
            <Link
              to="/course/$topicId/$lessonId"
              params={{ topicId, lessonId }}
              className="flex items-center gap-1"
            >
              <ChevronLeftIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Back to Lesson</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </Button>
          <div className="text-xs sm:text-sm text-muted-foreground">
            {moduleIndex + 1}/{lesson.modules.length}
          </div>
          {isCompleted ? (
            <Button onClick={handleContinue} size="sm" className="h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">
                {isLastModule ? "Finish Lesson" : "Next Module"}
              </span>
              <span className="sm:hidden">
                {isLastModule ? "Finish" : "Next"}
              </span>
              <ChevronRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
            </Button>
          ) : (
            <div className="w-16 sm:w-24" />
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {module.type === ModuleType.INFO && (
          <InfoModule
            module={module as InfoModuleType}
            isCompleted={isCompleted}
            onComplete={handleComplete}
            onContinue={handleContinue}
            isLastModule={isLastModule}
          />
        )}
        {module.type === ModuleType.QUIZ && (
          <QuizModule
            module={module as QuizModuleType}
            isCompleted={isCompleted}
            previousScore={moduleProgress?.score}
            onComplete={handleComplete}
            onContinue={handleContinue}
            isLastModule={isLastModule}
          />
        )}
        {module.type === ModuleType.FLASHCARDS && (
          <FlashcardsModule
            module={module as FlashcardsModuleType}
            topicId={topicId}
            lessonId={lessonId}
            isCompleted={isCompleted}
            onComplete={handleComplete}
            onContinue={handleContinue}
            isLastModule={isLastModule}
          />
        )}
      </div>
    </div>
  );
};
