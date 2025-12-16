import { useState, useEffect } from "react";
import { Link, useParams } from "@tanstack/react-router";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  CheckCircle2Icon,
  LockIcon,
  PlayCircleIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { courseService } from "@/entities/course";
import { progressService } from "@/entities/progress";

import type { Course, Topic } from "@/shared/types";

export const TopicPage = () => {
  const params = useParams({ strict: false });
  const { topicId } = params;
  const [course, setCourse] = useState<Course | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const courseData = await courseService.getCourse();
        setCourse(courseData);
        const topicData = courseData.topics.find((t) => t.id === topicId);
        setTopic(topicData || null);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [topicId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  if (!course || !topic) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] gap-4 p-4">
        <p className="text-muted-foreground text-center">Topic not found</p>
        <Button asChild>
          <Link to="/course">Back to Course</Link>
        </Button>
      </div>
    );
  }

  const topicProgress = progressService.calculateTopicProgress(course, topicId);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <Button variant="ghost" asChild className="mb-3 sm:mb-4 -ml-2 h-8 sm:h-9 text-xs sm:text-sm">
          <Link to="/course" className="flex items-center gap-1">
            <ChevronLeftIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Back to Course
          </Link>
        </Button>

        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-brand-50 text-2xl sm:text-3xl shrink-0">
            {topic.icon || "📚"}
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
              {topic.title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {topic.lessons.length} lessons
            </p>
          </div>
        </div>

        <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
          {topic.description}
        </p>

        <div className="flex items-center gap-3 sm:gap-4">
          <Progress value={topicProgress.percentage} className="h-2 flex-1" />
          <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
            {topicProgress.percentage}%
          </span>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {topic.lessons.map((lesson, index) => {
          const lessonProgress = progressService.getLessonProgress(
            topicId,
            lesson.id
          );
          const isAccessible = progressService.isLessonAccessible(
            course,
            topicId,
            lesson.id
          );
          const isCompleted = lessonProgress?.completed ?? false;
          const completedModules = lesson.modules.filter(
            (m) => lessonProgress?.modules[m.id]?.completed
          ).length;

          return (
            <Card
              key={lesson.id}
              className={
                isAccessible
                  ? "hover:border-primary/50 hover:shadow-md transition-all"
                  : "opacity-60"
              }
            >
              <CardHeader className="p-3 sm:p-4 lg:p-6 pb-2 sm:pb-3">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-muted text-xs sm:text-sm font-medium shrink-0">
                    {isCompleted ? (
                      <CheckCircle2Icon className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                    ) : !isAccessible ? (
                      <LockIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm sm:text-base lg:text-lg">
                      {lesson.title}
                    </CardTitle>
                    <CardDescription className="mt-0.5 sm:mt-1 text-xs sm:text-sm line-clamp-2">
                      {lesson.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Progress
                      value={
                        lesson.modules.length > 0
                          ? (completedModules / lesson.modules.length) * 100
                          : 0
                      }
                      className="h-1.5 w-24 sm:w-32"
                    />
                    <span className="text-[10px] sm:text-xs text-muted-foreground">
                      {completedModules}/{lesson.modules.length} modules
                    </span>
                  </div>
                  {isAccessible && (
                    <Button asChild size="sm" className="w-full sm:w-auto h-8 sm:h-9 text-xs sm:text-sm">
                      <Link to={`/course/${topicId}/${lesson.id}`}>
                        {isCompleted ? (
                          "Review"
                        ) : completedModules > 0 ? (
                          "Continue"
                        ) : (
                          <>
                            <PlayCircleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                            Start
                          </>
                        )}
                        <ChevronRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                      </Link>
                    </Button>
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
