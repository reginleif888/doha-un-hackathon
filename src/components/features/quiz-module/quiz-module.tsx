import { useState, useEffect, useMemo } from "react";
import {
  CheckCircle2Icon,
  XCircleIcon,
  ChevronRightIcon,
  RefreshCwIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/shared/lib/cn";

import type { QuizModule as QuizModuleType, QuizType } from "@/shared/types";

const SUCCESS_IMAGES = [
  "/success/1765887577838.png",
  "/success/1765887618495.png",
  "/success/1765887655744.png",
  "/success/1765887701345.png",
  "/success/1765887745502.png",
];

const getRandomSuccessImage = () => {
  return SUCCESS_IMAGES[Math.floor(Math.random() * SUCCESS_IMAGES.length)];
};

interface QuizModuleProps {
  module: QuizModuleType;
  isCompleted: boolean;
  previousScore?: number;
  onComplete: (score: number) => { ktEarned: number; totalKt: number };
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
  const [ktEarned, setKtEarned] = useState(0);

  const successImage = useMemo(() => getRandomSuccessImage(), [showResults, ktEarned]);

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

    // Only earn KT on first completion
    if (!isCompleted) {
      const result = onComplete(calculatedScore);
      setKtEarned(result.ktEarned);
    } else {
      // Already completed, just mark as complete but no KT
      onComplete(calculatedScore);
      setKtEarned(0);
    }

    setShowResults(true);
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSubmitted(false);
    setShowResults(false);
    setScore(0);
    setKtEarned(0);
  };

  const isAnswerCorrect = (optionId: string) => {
    const option = currentQuestion.options.find((o) => o.id === optionId);
    return option?.isCorrect ?? false;
  };

  const isSelected = (optionId: string) => currentAnswer.includes(optionId);

  if (showResults) {
    const passed = score >= module.passingScore;
    const showEnhancedSuccess = passed && ktEarned > 0;

    // Enhanced success modal with illustration (when KT is earned)
    if (showEnhancedSuccess) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-4xl w-full overflow-hidden">
            <div className="grid md:grid-cols-2 min-h-[500px]">
              {/* Image Side - Full Height */}
              <div className="relative bg-gradient-to-br from-success/10 to-success/20 hidden md:block">
                <img
                  src={successImage}
                  alt="Success"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content Side */}
              <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-12">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle2Icon className="w-8 h-8 text-success" />
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-3">
                  Outstanding!
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground text-center mb-6">
                  You've mastered this quiz with flying colors.
                </p>

                <div className="text-5xl sm:text-6xl font-bold text-foreground text-center mb-8">
                  {score}%
                </div>

                <div className="mb-8">
                  <div className="inline-flex w-full items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-warning/10 to-warning/20 rounded-xl border border-warning/20">
                    <img 
                      src="/knowledge-token.png" 
                      alt="Knowledge Token" 
                      className="w-6 h-6 object-contain"
                    />
                    <span className="text-lg font-bold text-foreground">
                      +{ktEarned} KT earned
                    </span>
                  </div>
                </div>

                <Button 
                  onClick={onContinue} 
                  size="lg" 
                  className="w-full h-12 text-base font-semibold"
                >
                  {isLastModule ? "Finish Lesson" : "Continue Learning"}
                  <ChevronRightIcon className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    // Standard result modal (for failures or retakes without KT)
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
            {isCompleted && passed && ktEarned === 0 && (
              <div className="mb-6 sm:mb-8">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Quiz already passed. KT earned only on first attempt.
                </p>
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
