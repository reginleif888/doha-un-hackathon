import { useState, useEffect } from "react";
import {
  CheckCircle2Icon,
  ChevronRightIcon,
  ChevronLeftIcon,
  RotateCcwIcon,
  StarIcon,
  BookmarkIcon,
  XIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/shared/lib/cn";
import { flashcardMemoryService } from "@/entities/flashcards";

import type { FlashcardsModule as FlashcardsModuleType } from "@/shared/types";

interface FlashcardsModuleProps {
  module: FlashcardsModuleType;
  topicId: string;
  lessonId: string;
  isCompleted: boolean;
  onComplete: () => { xpEarned: number; totalXp: number };
  onContinue: () => void;
  isLastModule: boolean;
}

export const FlashcardsModule = ({
  module,
  topicId,
  lessonId,
  isCompleted,
  onComplete,
  onContinue,
  isLastModule,
}: FlashcardsModuleProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewedCards, setViewedCards] = useState<Set<string>>(new Set());
  const [savedCards, setSavedCards] = useState<Set<string>>(new Set());
  const [showCompletion, setShowCompletion] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  useEffect(() => {
    setShowCompletion(false);
    setCurrentIndex(0);
    setIsFlipped(false);
    setViewedCards(new Set());

    const saved = new Set<string>();
    module.cards.forEach((card) => {
      if (flashcardMemoryService.isFlashcardSaved(card.id)) {
        saved.add(card.id);
      }
    });
    setSavedCards(saved);
  }, [module.id, module.cards]);

  const currentCard = module.cards[currentIndex];
  const totalCards = module.cards.length;
  const allViewed = viewedCards.size === totalCards;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      setViewedCards((prev) => new Set(prev).add(currentCard.id));
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setViewedCards(new Set());
  };

  const handleSave = () => {
    if (!currentCard || savedCards.has(currentCard.id)) return;

    flashcardMemoryService.saveFlashcard({
      id: currentCard.id,
      lessonId,
      topicId,
      moduleId: module.id,
      front: currentCard.front,
      back: currentCard.back,
      emoji: currentCard.emoji || "📝",
    });

    setSavedCards((prev) => new Set(prev).add(currentCard.id));
    handleNext();
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleComplete = () => {
    const result = onComplete();
    setXpEarned(result.xpEarned);
    setShowCompletion(true);
  };

  if (showCompletion) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
        <Card className="text-center py-8 sm:py-12">
          <CardContent className="px-4 sm:px-6">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2Icon className="w-8 h-8 sm:w-10 sm:h-10 text-success" />
              </div>
            </div>
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-2">
                Flashcards Completed!
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                You have reviewed all {totalCards} flashcards.
              </p>
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
              <Button
                variant="outline"
                onClick={() => {
                  setShowCompletion(false);
                  handleReset();
                }}
                className="h-9 sm:h-10 text-sm"
              >
                <RotateCcwIcon className="w-4 h-4 mr-1" />
                Review Again
              </Button>
              <Button onClick={onContinue} className="h-9 sm:h-10 text-sm">
                {isLastModule ? "Finish Lesson" : "Continue"}
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </Button>
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
            Card {currentIndex + 1} of {totalCards}
          </span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <Progress
            value={(viewedCards.size / totalCards) * 100}
            className="h-1.5 sm:h-2 flex-1"
          />
          <span className="text-xs sm:text-sm text-muted-foreground">
            {viewedCards.size}/{totalCards}
          </span>
        </div>
      </div>

      <div className="perspective-1000 mb-6 sm:mb-8">
        <div className="relative w-full aspect-4/3 sm:aspect-3/2">
          {savedCards.has(currentCard.id) && (
            <div className="absolute -top-2 -right-2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-success flex items-center justify-center shadow-lg">
              <BookmarkIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white" />
            </div>
          )}

          <div
            className={cn(
              "relative w-full h-full",
              !isFlipped && "cursor-pointer"
            )}
            onClick={() => !isFlipped && handleFlip()}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isFlipped ? "back" : "front"}
                initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <Card
                  className={cn(
                    "h-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 text-center",
                    isFlipped ? "bg-brand-50" : "bg-card"
                  )}
                >
                  <CardContent className="flex flex-col items-center justify-center h-full p-0 w-full">
                    {!isFlipped && (
                      <>
                        <div className="mb-3 sm:mb-4 text-3xl sm:text-4xl">
                          {currentCard.emoji || "📝"}
                        </div>
                        <p className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground mb-3 sm:mb-4">
                          Question - Tap to reveal
                        </p>
                        <p className="text-sm sm:text-base lg:text-lg font-semibold leading-relaxed text-foreground">
                          {currentCard.front}
                        </p>
                      </>
                    )}
                    {isFlipped && (
                      <div className="w-full space-y-4 sm:space-y-6">
                        <div>
                          <p className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground mb-3 sm:mb-4">
                            Answer
                          </p>
                          <p className="text-sm sm:text-base lg:text-lg font-semibold leading-relaxed text-primary">
                            {currentCard.back}
                          </p>
                        </div>
                        <div className="flex items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4">
                          <Button
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSkip();
                            }}
                            className="flex-1 max-w-[140px] h-10 sm:h-11"
                          >
                            <XIcon className="w-4 h-4 mr-2" />
                            Skip
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSave();
                            }}
                            disabled={savedCards.has(currentCard.id)}
                            className="flex-1 max-w-[140px] h-10 sm:h-11"
                          >
                            <BookmarkIcon className="w-4 h-4 mr-2" />
                            {savedCards.has(currentCard.id) ? "Saved" : "Save"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="w-full sm:w-auto h-9 sm:h-10 text-sm order-2 sm:order-1"
        >
          <ChevronLeftIcon className="w-4 h-4 mr-1" />
          Previous
        </Button>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center order-1 sm:order-2">
          {module.cards.map((card, i) => (
            <button
              key={card.id}
              onClick={() => {
                setCurrentIndex(i);
                setIsFlipped(false);
              }}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                i === currentIndex
                  ? "bg-primary"
                  : viewedCards.has(card.id)
                    ? "bg-success"
                    : "bg-muted"
              )}
            />
          ))}
        </div>

        <div className="w-full sm:w-auto order-3">
          {currentIndex === totalCards - 1 ? (
            allViewed && !isCompleted ? (
              <Button
                onClick={handleComplete}
                className="w-full sm:w-auto h-9 sm:h-10 text-sm"
              >
                <CheckCircle2Icon className="w-4 h-4 mr-1" />
                Complete
              </Button>
            ) : isCompleted ? (
              <Button
                onClick={onContinue}
                className="w-full sm:w-auto h-9 sm:h-10 text-sm"
              >
                {isLastModule ? "Finish Lesson" : "Continue"}
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                variant="outline"
                disabled
                className="w-full sm:w-auto h-9 sm:h-10 text-sm"
              >
                View all cards
              </Button>
            )
          ) : (
            <Button
              onClick={handleNext}
              className="w-full sm:w-auto h-9 sm:h-10 text-sm"
            >
              Next
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
