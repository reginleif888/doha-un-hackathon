import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  BookOpenIcon,
  ChevronRightIcon,
  CheckCircle2Icon,
  CircleIcon,
  SparklesIcon,
  BrainIcon,
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
import { userService } from "@/entities/user";
import { flashcardMemoryService } from "@/entities/flashcards";

import type { Course } from "@/shared/types";

export const DashboardPage = () => {
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

  const userProgress = progressService.getProgress();
  const courseProgress = progressService.calculateCourseProgress(course);
  const userProfile = userService.getUserProfile();
  const flashcardStats = flashcardMemoryService.getStats();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">
          Welcome back, {userProfile?.name || "Learner"}!
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Continue your journey in building a corruption-free future
        </p>
      </div>

      <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-brand-50 to-brand-100/50 border-brand-200">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-brand-200 flex items-center justify-center shrink-0 overflow-hidden">
                {userProfile?.character && (
                  <img
                    src={`/characters/${userProfile.character}.png`}
                    alt="Gracie"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                  Gracie, Your Learning Companion
                  <SparklesIcon className="w-4 h-4 text-warning" />
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  I&apos;m here to guide you through anti-corruption education
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              asChild
              size="sm"
              className="w-full sm:w-auto shrink-0"
            >
              <Link to="/character">Meet Gracie</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6 sm:mb-8">
        <Card>
          <CardHeader className="pb-2 space-y-1">
            <CardDescription className="text-xs sm:text-sm">
              Course Progress
            </CardDescription>
            <CardTitle className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl">
                {courseProgress.percentage}%
              </span>
              <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                complete
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={courseProgress.percentage} className="h-2 mb-2" />
            <p className="text-xs sm:text-sm text-muted-foreground">
              {courseProgress.completedModules} of {courseProgress.totalModules}{" "}
              modules completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 space-y-1">
            <CardDescription className="text-xs sm:text-sm">
              Knowledge Tokens
            </CardDescription>
            <CardTitle className="flex items-center gap-2">
              <img
                src="/knowledge-token.png"
                alt="Knowledge Token"
                className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
              />
              <span className="text-2xl sm:text-3xl">
                {userProgress.totalKtEarned}
              </span>
              <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                / {course.totalKt} KT
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress
              value={(userProgress.totalKtEarned / course.totalKt) * 100}
              className="h-2"
              indicatorClassName="bg-warning"
            />
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2 space-y-1">
            <CardDescription className="text-xs sm:text-sm">
              Topics
            </CardDescription>
            <CardTitle className="flex items-center gap-2">
              <BookOpenIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              <span className="text-2xl sm:text-3xl">
                {course.topics.length}
              </span>
              <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                topics to explore
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/course">Start Learning</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {flashcardStats.total > 0 && (
        <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-purple-50 to-purple-100/50 border-purple-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-purple-200 flex items-center justify-center shrink-0">
                  <BrainIcon className="w-6 h-6 sm:w-7 sm:h-7 text-purple-700" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
                    Your Flashcard Library
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {flashcardStats.total} saved • {flashcardStats.dueNow} ready
                    for practice
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                asChild
                size="sm"
                className="w-full sm:w-auto shrink-0"
              >
                <Link to="/flashcards">View Flashcards</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">
            Course Topics
          </h2>
          <Button variant="ghost" asChild size="sm">
            <Link to="/course" className="flex items-center gap-1">
              View All
              <ChevronRightIcon className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-3 sm:gap-4">
          {course.topics.map((topic) => {
            const topicProgress = progressService.calculateTopicProgress(
              course,
              topic.id
            );
            const isCompleted = topicProgress.percentage === 100;

            return (
              <Link
                key={topic.id}
                to="/course/$topicId"
                params={{ topicId: topic.id }}
              >
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-brand-50 text-xl sm:text-2xl shrink-0">
                      {topic.icon || "📚"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">
                          {topic.title}
                        </h3>
                        {isCompleted ? (
                          <CheckCircle2Icon className="w-4 h-4 text-success shrink-0" />
                        ) : topicProgress.percentage > 0 ? (
                          <CircleIcon className="w-4 h-4 text-warning shrink-0" />
                        ) : null}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 hidden sm:block">
                        {topic.description}
                      </p>
                      <div className="flex items-center gap-3 sm:gap-4 mt-2">
                        <Progress
                          value={topicProgress.percentage}
                          className="h-1.5 flex-1"
                        />
                        <span className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                          {topicProgress.completedModules}/
                          {topicProgress.totalModules}
                        </span>
                      </div>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
