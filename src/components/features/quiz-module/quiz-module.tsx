import { useState, useEffect } from "react";
import {
  CheckCircle2Icon,
  XCircleIcon,
  ChevronRightIcon,
  StarIcon,
  RefreshCwIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/shared/lib/cn";

import type { QuizModule as QuizModuleType, QuizType } from "@/shared/types";

interface QuizModuleProps {
  module: QuizModuleType;
  isCompleted: boolean;
  previousScore?: number;
  onComplete: (score: number) => { xpEarned: number; totalXp: number };
  onContinue: () => void;
  isLastModule: boolean;
}

export const QuizModule = ({
  module,
  isCompleted,
  previousScore,
  onComplete,
  onContinue,
  isLastModule,
}: QuizModuleProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  useEffect(() => {
    setShowResults(false);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSubmitted(false);
  }, [module.id]);

  const currentQuestion = module.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === module.questions.length - 1;
  const currentAnswer = answers[currentQuestion.id] || [];

  const handleSingleSelect = (optionId: string) => {
    if (submitted) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: [optionId],
    }));
  };

  const handleMultipleSelect = (optionId: string, checked: boolean) => {
    if (submitted) return;
    setAnswers((prev) => {
      const current = prev[currentQuestion.id] || [];
      if (checked) {
        return { ...prev, [currentQuestion.id]: [...current, optionId] };
      }
      return {
        ...prev,
        [currentQuestion.id]: current.filter((id) => id !== optionId),
      };
    });
  };

  const handleSubmitAnswer = () => {
    setSubmitted(true);
  };

  const handleNext = () => {
    setSubmitted(false);
    if (isLastQuestion) {
      calculateResults();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const calculateResults = () => {
    let correct = 0;
    module.questions.forEach((question) => {
      const userAnswer = answers[question.id] || [];
      const correctAnswers = question.options
        .filter((o) => o.isCorrect)
        .map((o) => o.id);

      if (
        userAnswer.length === correctAnswers.length &&
        userAnswer.every((a) => correctAnswers.includes(a))
      ) {
        correct++;
      }
    });

    const calculatedScore = Math.round(
      (correct / module.questions.length) * 100
    );
    setScore(calculatedScore);

    if (!isCompleted || calculatedScore > (previousScore || 0)) {
      const result = onComplete(calculatedScore);
      setXpEarned(result.xpEarned);
    }

    setShowResults(true);
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSubmitted(false);
    setShowResults(false);
    setScore(0);
    setXpEarned(0);
  };

  const isAnswerCorrect = (optionId: string) => {
    const option = currentQuestion.options.find((o) => o.id === optionId);
    return option?.isCorrect ?? false;
  };

  const isSelected = (optionId: string) => currentAnswer.includes(optionId);

  if (showResults) {
    const passed = score >= module.passingScore;

    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <Card className="text-center py-8 sm:py-12">
          <CardContent className="px-4 sm:px-6">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <div
                className={cn(
                  "w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center",
                  passed ? "bg-success/10" : "bg-error/10"
                )}
              >
                {passed ? (
                  <CheckCircle2Icon className="w-8 h-8 sm:w-10 sm:h-10 text-success" />
                ) : (
                  <XCircleIcon className="w-8 h-8 sm:w-10 sm:h-10 text-error" />
                )}
              </div>
            </div>
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-2">
                {passed ? "Quiz Passed!" : "Quiz Not Passed"}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                {passed
                  ? "Congratulations! You have passed this quiz."
                  : `You need ${module.passingScore}% to pass. Try again!`}
              </p>
            </div>
            <div className="text-4xl sm:text-5xl font-bold text-foreground mb-4 sm:mb-6">
              {score}%
            </div>
            {xpEarned > 0 && (
              <div className="mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 sm:px-6 bg-warning/10 rounded-lg">
                  <StarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
                  <span className="text-sm sm:text-base font-semibold text-foreground">
                    +{xpEarned} XP earned
                  </span>
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {!passed && (
                <Button variant="outline" onClick={handleRetry} className="h-9 sm:h-10 text-sm">
                  <RefreshCwIcon className="w-4 h-4 mr-1" />
                  Retry Quiz
                </Button>
              )}
              {passed && (
                <Button onClick={onContinue} className="h-9 sm:h-10 text-sm">
                  {isLastModule ? "Finish Lesson" : "Continue"}
                  <ChevronRightIcon className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
          <h1 className="text-base sm:text-lg lg:text-xl font-bold text-foreground">
            {module.title}
          </h1>
          <span className="text-xs sm:text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {module.questions.length}
          </span>
        </div>
        <Progress
          value={((currentQuestionIndex + 1) / module.questions.length) * 100}
          className="h-1.5 sm:h-2"
        />
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-sm sm:text-base lg:text-lg">
            {currentQuestion.question}
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {currentQuestion.type === ("multiple" as QuizType)
              ? "Select all that apply"
              : "Select one answer"}
          </p>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-2 sm:space-y-3">
          {currentQuestion.type === ("single" as QuizType) ? (
            <RadioGroup
              value={currentAnswer[0] || ""}
              onValueChange={handleSingleSelect}
              disabled={submitted}
            >
              {currentQuestion.options.map((option) => (
                <label
                  key={option.id}
                  className={cn(
                    "flex items-center gap-3 p-3 sm:p-4 rounded-lg border cursor-pointer transition-colors",
                    submitted && isAnswerCorrect(option.id)
                      ? "border-success bg-success/5"
                      : submitted && isSelected(option.id)
                        ? "border-error bg-error/5"
                        : isSelected(option.id)
                          ? "border-primary bg-brand-50"
                          : "border-border hover:border-primary/50"
                  )}
                >
                  <RadioGroupItem value={option.id} />
                  <span className="flex-1 text-sm sm:text-base">{option.text}</span>
                  {submitted && isAnswerCorrect(option.id) && (
                    <CheckCircle2Icon className="w-4 h-4 sm:w-5 sm:h-5 text-success shrink-0" />
                  )}
                  {submitted && isSelected(option.id) && !isAnswerCorrect(option.id) && (
                    <XCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-error shrink-0" />
                  )}
                </label>
              ))}
            </RadioGroup>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {currentQuestion.options.map((option) => (
                <label
                  key={option.id}
                  className={cn(
                    "flex items-center gap-3 p-3 sm:p-4 rounded-lg border cursor-pointer transition-colors",
                    submitted && isAnswerCorrect(option.id)
                      ? "border-success bg-success/5"
                      : submitted && isSelected(option.id) && !isAnswerCorrect(option.id)
                        ? "border-error bg-error/5"
                        : isSelected(option.id)
                          ? "border-primary bg-brand-50"
                          : "border-border hover:border-primary/50"
                  )}
                >
                  <Checkbox
                    checked={isSelected(option.id)}
                    onCheckedChange={(checked) =>
                      handleMultipleSelect(option.id, checked as boolean)
                    }
                    disabled={submitted}
                  />
                  <span className="flex-1 text-sm sm:text-base">{option.text}</span>
                  {submitted && isAnswerCorrect(option.id) && (
                    <CheckCircle2Icon className="w-4 h-4 sm:w-5 sm:h-5 text-success shrink-0" />
                  )}
                  {submitted && isSelected(option.id) && !isAnswerCorrect(option.id) && (
                    <XCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-error shrink-0" />
                  )}
                </label>
              ))}
            </div>
          )}

          {submitted && currentQuestion.explanation && (
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-muted rounded-lg">
              <p className="text-xs sm:text-sm font-medium text-foreground mb-1">
                Explanation
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {currentQuestion.explanation}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 sm:mt-6 flex justify-end">
        {!submitted ? (
          <Button
            onClick={handleSubmitAnswer}
            disabled={currentAnswer.length === 0}
            className="h-9 sm:h-10 text-sm"
          >
            Submit Answer
          </Button>
        ) : (
          <Button onClick={handleNext} className="h-9 sm:h-10 text-sm">
            {isLastQuestion ? "See Results" : "Next Question"}
            <ChevronRightIcon className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
};
