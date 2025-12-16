import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import {
  CheckCircle2Icon,
  CircleIcon,
  LockIcon,
  BookOpenIcon,
  HelpCircleIcon,
  LayoutGridIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  XIcon,
} from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { courseService } from "@/entities/course";
import { progressService } from "@/entities/progress";

import type { Course, Topic, Lesson, ModuleType } from "@/shared/types";

const moduleTypeIcons: Record<ModuleType, typeof BookOpenIcon> = {
  info: BookOpenIcon,
  quiz: HelpCircleIcon,
  flashcards: LayoutGridIcon,
};

interface CourseSidebarProps {
  onClose?: () => void;
}

export const CourseSidebar = ({ onClose }: CourseSidebarProps) => {
  const params = useParams({ strict: false }) as {
    topicId?: string;
    lessonId?: string;
    moduleId?: string;
  };
  const [course, setCourse] = useState<Course | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const loadCourse = async () => {
      const data = await courseService.getCourse();
      setCourse(data);
    };
    loadCourse();
  }, []);

  useEffect(() => {
    if (params.topicId) {
      setExpandedTopics((prev) => new Set(prev).add(params.topicId!));
    }
    if (params.lessonId && params.topicId) {
      setExpandedLessons((prev) =>
        new Set(prev).add(`${params.topicId}-${params.lessonId}`)
      );
    }
  }, [params.topicId, params.lessonId]);

  if (!course) return null;

  const toggleTopic = (topicId: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  };

  const toggleLesson = (topicId: string, lessonId: string) => {
    const key = `${topicId}-${lessonId}`;
    setExpandedLessons((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const courseProgress = progressService.calculateCourseProgress(course);

  const renderTopic = (topic: Topic, topicIndex: number) => {
    const isExpanded = expandedTopics.has(topic.id);
    const topicProgress = progressService.calculateTopicProgress(
      course,
      topic.id
    );
    const isCompleted = topicProgress.percentage === 100;
    const isActive = params.topicId === topic.id;

    return (
      <div key={topic.id} className="mb-1">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => toggleTopic(topic.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left min-w-0",
                  isActive
                    ? "bg-brand-50 text-primary"
                    : "hover:bg-muted text-foreground"
                )}
              >
                <div className="flex items-center justify-center w-6 h-6 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2Icon className="w-5 h-5 text-success" />
                  ) : topicProgress.percentage > 0 ? (
                    <div className="relative w-5 h-5">
                      <CircleIcon className="w-5 h-5 text-muted-foreground" />
                      <div
                        className="absolute inset-0 flex items-center justify-center text-[10px] font-medium"
                        style={{ color: "var(--primary)" }}
                      >
                        {topicIndex + 1}
                      </div>
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                      {topicIndex + 1}
                    </div>
                  )}
                </div>
                <span className="flex-1 min-w-0 truncate font-medium">
                  {topic.title}
                </span>
                {isExpanded ? (
                  <ChevronDownIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <p className="font-medium">{topic.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {topicProgress.completedModules}/{topicProgress.totalModules}{" "}
                modules completed
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {isExpanded && (
          <div className="ml-4 mt-1 border-l-2 border-border pl-2">
            {topic.lessons.map((lesson, lessonIndex) =>
              renderLesson(topic, lesson, lessonIndex)
            )}
          </div>
        )}
      </div>
    );
  };

  const renderLesson = (topic: Topic, lesson: Lesson, lessonIndex: number) => {
    const key = `${topic.id}-${lesson.id}`;
    const isExpanded = expandedLessons.has(key);
    const lessonProgress = progressService.getLessonProgress(
      topic.id,
      lesson.id
    );
    const isCompleted = lessonProgress?.completed ?? false;
    const isAccessible = progressService.isLessonAccessible(
      course!,
      topic.id,
      lesson.id
    );
    const isActive = params.lessonId === lesson.id;
    const completedModules = lesson.modules.filter(
      (m) => lessonProgress?.modules[m.id]?.completed
    ).length;

    return (
      <div key={lesson.id} className="mb-1">
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() =>
                  isAccessible && toggleLesson(topic.id, lesson.id)
                }
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-left min-w-0",
                  !isAccessible && "opacity-50 cursor-not-allowed",
                  isActive
                    ? "bg-brand-50/50 text-primary"
                    : isAccessible
                      ? "hover:bg-muted text-muted-foreground"
                      : "text-muted-foreground"
                )}
              >
                <div className="flex items-center justify-center w-5 h-5 shrink-0">
                  {!isAccessible ? (
                    <LockIcon className="w-3.5 h-3.5" />
                  ) : isCompleted ? (
                    <CheckCircle2Icon className="w-4 h-4 text-success" />
                  ) : completedModules > 0 ? (
                    <CircleIcon className="w-4 h-4 text-warning" />
                  ) : (
                    <span className="text-xs">{lessonIndex + 1}</span>
                  )}
                </div>
                <span className="flex-1 min-w-0 truncate">{lesson.title}</span>
                {isAccessible &&
                  (isExpanded ? (
                    <ChevronDownIcon className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <ChevronRightIcon className="w-3.5 h-3.5 shrink-0" />
                  ))}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <p className="font-medium text-sm">{lesson.title}</p>
              {!isAccessible ? (
                <p className="text-xs text-muted-foreground mt-1">
                  Complete previous lessons to unlock
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">
                  {completedModules}/{lesson.modules.length} modules completed
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {isExpanded && isAccessible && (
          <div className="ml-3 mt-1 space-y-0.5">
            {lesson.modules.map((module) => {
              const moduleProgress = lessonProgress?.modules[module.id];
              const moduleCompleted = moduleProgress?.completed ?? false;
              const moduleAccessible = progressService.isModuleAccessible(
                course!,
                topic.id,
                lesson.id,
                module.id
              );
              const isModuleActive = params.moduleId === module.id;
              const Icon = moduleTypeIcons[module.type];

              return (
                <TooltipProvider key={module.id} delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to="/course/$topicId/$lessonId/$moduleId"
                        params={{
                          topicId: topic.id,
                          lessonId: lesson.id,
                          moduleId: module.id,
                        }}
                        onClick={(e) => {
                          if (!moduleAccessible) {
                            e.preventDefault();
                          } else {
                            onClose?.();
                          }
                        }}
                        className={cn(
                          "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors min-w-0",
                          !moduleAccessible && "opacity-50 cursor-not-allowed",
                          isModuleActive
                            ? "bg-primary text-primary-foreground"
                            : moduleAccessible
                              ? "hover:bg-muted text-muted-foreground"
                              : "text-muted-foreground"
                        )}
                      >
                        <div className="flex items-center justify-center w-4 h-4 shrink-0">
                          {!moduleAccessible ? (
                            <LockIcon className="w-3 h-3" />
                          ) : moduleCompleted ? (
                            <CheckCircle2Icon className="w-3.5 h-3.5 text-success" />
                          ) : (
                            <Icon className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <span className="flex-1 min-w-0 truncate">
                          {module.title}
                        </span>
                        <span className="text-[10px] opacity-70 shrink-0">
                          +{module.kt}
                        </span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p className="text-sm">{module.title}</p>
                      {!moduleAccessible ? (
                        <p className="text-xs text-muted-foreground mt-1">
                          Complete previous modules to unlock
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">
                          {moduleCompleted ? "Completed" : "Not started"} •{" "}
                          {module.kt} KT
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-72 h-full border-r border-border bg-background flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <Link
            to="/course"
            onClick={() => onClose?.()}
            className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            <BookOpenIcon className="w-4 h-4" />
            <span>Course Progress</span>
          </Link>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden -mr-2"
            >
              <XIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>{courseProgress.percentage}% complete</span>
            <span>
              {courseProgress.completedModules}/{courseProgress.totalModules}
            </span>
          </div>
          <Progress value={courseProgress.percentage} className="h-1.5" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {course.topics.map((topic, index) => renderTopic(topic, index))}
      </div>
    </aside>
  );
};
