import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "@tanstack/react-router";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircle2Icon,
  LockIcon,
  BookOpenIcon,
  HelpCircleIcon,
  LayoutGridIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { courseService } from "@/entities/course";
import { progressService } from "@/entities/progress";

import type { Course, Topic, Lesson, ModuleType } from "@/shared/types";

const moduleTypeIcons: Record<ModuleType, typeof BookOpenIcon> = {
  info: BookOpenIcon,
  quiz: HelpCircleIcon,
  flashcards: LayoutGridIcon,
};

const moduleTypeLabels: Record<ModuleType, string> = {
  info: "Information",
  quiz: "Quiz",
  flashcards: "Flashcards",
};

export const LessonPage = () => {
  const params = useParams({ strict: false });
  const { topicId, lessonId } = params;
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
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
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [topicId, lessonId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  if (!course || !topic || !lesson || !topicId || !lessonId) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] gap-4 p-4">
        <p className="text-muted-foreground text-center">Lesson not found</p>
        <Button asChild>
          <Link to="/course">Back to Course</Link>
        </Button>
      </div>
    );
  }

  const lessonProgress = progressService.getLessonProgress(topicId, lessonId);
  const completedModules = lesson.modules.filter(
    (m) => lessonProgress?.modules[m.id]?.completed
  ).length;
  const progressPercentage =
    lesson.modules.length > 0
      ? (completedModules / lesson.modules.length) * 100
      : 0;

  const handleModuleClick = (moduleId: string) => {
    if (progressService.isModuleAccessible(course, topicId, lessonId, moduleId)) {
      navigate({
        to: "/course/$topicId/$lessonId/$moduleId",
        params: { topicId, lessonId, moduleId },
      });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <Button variant="ghost" asChild className="mb-3 sm:mb-4 -ml-2 h-8 sm:h-9 text-xs sm:text-sm">
          <Link
            to="/course/$topicId"
            params={{ topicId }}
            className="flex items-center gap-1"
          >
            <ChevronLeftIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="truncate max-w-[150px] sm:max-w-none">Back to {topic.title}</span>
          </Link>
        </Button>

        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-2">
          {lesson.title}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
          {lesson.description}
        </p>

        <div className="flex items-center gap-3 sm:gap-4">
          <Progress value={progressPercentage} className="h-2 flex-1" />
          <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
            {completedModules}/{lesson.modules.length}
          </span>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {lesson.modules.map((module, index) => {
          const moduleProgress = lessonProgress?.modules[module.id];
          const isCompleted = moduleProgress?.completed ?? false;
          const isAccessible = progressService.isModuleAccessible(
            course,
            topicId,
            lessonId,
            module.id
          );
          const Icon = moduleTypeIcons[module.type];

          return (
            <Card
              key={module.id}
              className={
                isAccessible
                  ? "hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                  : "opacity-60 cursor-not-allowed"
              }
              onClick={() => handleModuleClick(module.id)}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-muted shrink-0">
                    {isCompleted ? (
                      <CheckCircle2Icon className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                    ) : !isAccessible ? (
                      <LockIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                    ) : (
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-0.5">
                      <span className="text-[10px] sm:text-xs text-muted-foreground">
                        Module {index + 1}
                      </span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline">
                        •
                      </span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline">
                        {moduleTypeLabels[module.type]}
                      </span>
                      <span className="text-[10px] sm:text-xs text-primary font-medium">
                        +{module.kt} KT
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">
                      {module.title}
                    </h3>
                    {module.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 mt-0.5 hidden sm:block">
                        {module.description}
                      </p>
                    )}
                  </div>
                  {isAccessible && (
                    <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
