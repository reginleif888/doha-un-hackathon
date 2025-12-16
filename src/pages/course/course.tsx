import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronRightIcon,
  CheckCircle2Icon,
  CircleIcon,
  BookOpenIcon,
} from "lucide-react";

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

import type { Course } from "@/shared/types";

export const CoursePage = () => {
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const data = await courseService.getCourse();
        setCourse(data);
      } finally {
        setIsLoading(false);
      }
    };
    loadCourse();
  }, []);

  if (isLoading || !course) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  const courseProgress = progressService.calculateCourseProgress(course);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-50 shrink-0">
            <BookOpenIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground truncate">
              {course.title}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {course.topics.length} topics • {course.totalXp} XP total
            </p>
          </div>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground mb-4">
          {course.description}
        </p>
        <div className="flex items-center gap-3 sm:gap-4">
          <Progress value={courseProgress.percentage} className="h-2 flex-1" />
          <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
            {courseProgress.percentage}%
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:gap-4">
        {course.topics.map((topic, index) => {
          const topicProgress = progressService.calculateTopicProgress(
            course,
            topic.id
          );
          const isCompleted = topicProgress.percentage === 100;
          const lessonsCount = topic.lessons.length;
          const modulesCount = topic.lessons.reduce(
            (acc, l) => acc + l.modules.length,
            0
          );

          return (
            <Link
              key={topic.id}
              to="/course/$topicId"
              params={{ topicId: topic.id }}
              className="block"
            >
              <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
                <CardHeader className="p-3 sm:p-4 lg:p-6 pb-2 sm:pb-3">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-brand-50 text-lg sm:text-xl shrink-0">
                      {topic.icon || "📚"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] sm:text-xs text-muted-foreground">
                          Topic {index + 1}
                        </span>
                        {isCompleted && (
                          <CheckCircle2Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success" />
                        )}
                        {!isCompleted && topicProgress.percentage > 0 && (
                          <CircleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-warning" />
                        )}
                      </div>
                      <CardTitle className="text-sm sm:text-base lg:text-lg mt-0.5 sm:mt-1">
                        {topic.title}
                      </CardTitle>
                      <CardDescription className="mt-0.5 sm:mt-1 line-clamp-2 text-xs sm:text-sm">
                        {topic.description}
                      </CardDescription>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0 mt-0.5" />
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                    <span>{lessonsCount} lessons</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">{modulesCount} modules</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress
                      value={topicProgress.percentage}
                      className="h-1.5 flex-1"
                    />
                    <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                      {topicProgress.completedModules}/
                      {topicProgress.totalModules}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
