import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2Icon,
  SmileIcon,
  MehIcon,
  FrownIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/shared/lib/cn";
import {
  flashcardMemoryService,
  RecallDifficulty,
  type SavedFlashcard,
} from "@/entities/flashcards";

export const FlashcardsRecallPage = () => {
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState<SavedFlashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    const dueCards = flashcardMemoryService.getDueFlashcards();

    if (dueCards.length === 0) {
      navigate({ to: "/flashcards" });
      return;
    }

    setFlashcards(dueCards);
  }, [navigate]);

  if (flashcards.length === 0) {
    return null;
  }

  const currentCard = flashcards[currentIndex];
  const progress = (completed / flashcards.length) * 100;

  const handleFlip = () => {
    setIsFlipped(true);
  };

  const handleRecall = (difficulty: RecallDifficulty) => {
    flashcardMemoryService.recordRecall(currentCard.id, difficulty);

    if (difficulty === RecallDifficulty.DONT_REMEMBER) {
      setFlashcards([...flashcards, currentCard]);
    }

    setCompleted(completed + 1);

    if (currentIndex >= flashcards.length - 1) {
      setShowCompletion(true);
    } else {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handleFinish = () => {
    navigate({ to: "/flashcards" });
  };

  if (showCompletion) {
    return (
      <div className="min-h-screen bg-background-primary">
        <div className="h-screen flex flex-col lg:flex-row">
          {/* Video Side */}
          <div className="w-full lg:w-1/2 h-48 sm:h-64 lg:h-full bg-black flex items-center justify-center overflow-hidden relative">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              <source
                src="https://wntexajvlhsyexlxqylk.supabase.co/storage/v1/object/public/course_videos/dancing.MP4"
                type="video/mp4"
              />
            </video>
          </div>

          {/* Content Side */}
          <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 overflow-y-auto">
            <div className="w-full max-w-lg space-y-8">
              {/* Header */}
              <div className="text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
                  Recall Session Complete!
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground">
                  Great job! You&apos;ve reviewed {completed} flashcard
                  {completed !== 1 ? "s" : ""}.
                </p>
              </div>

              {/* Message */}
              <div className="space-y-4">
                <p className="text-base sm:text-lg text-foreground leading-relaxed">
                  You&apos;re building strong knowledge foundations through consistent practice. Each review session strengthens your memory and deepens your understanding.
                </p>

                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Keep up this momentum and continue your learning journey!
                </p>
              </div>

              {/* CTA */}
              <div className="pt-4">
                <Button
                  onClick={handleFinish}
                  size="lg"
                  className="w-full sm:w-auto sm:min-w-[240px] h-12 text-base font-semibold"
                >
                  Back to Library
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              Recall Session
            </h1>
            <span className="text-sm text-muted-foreground">
              {completed} / {flashcards.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="mb-8 sm:mb-12">
          <div className="relative w-full aspect-4/3 sm:aspect-3/2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCard.id + (isFlipped ? "-back" : "-front")}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                <Card
                  className={cn(
                    "h-full flex flex-col items-center justify-center p-6 sm:p-8 text-center cursor-pointer",
                    isFlipped ? "bg-brand-50" : "bg-card"
                  )}
                  onClick={() => !isFlipped && handleFlip()}
                >
                  <CardContent className="flex flex-col items-center justify-center h-full p-0">
                    {!isFlipped ? (
                      <>
                        <div className="mb-4 text-4xl sm:text-5xl">
                          {currentCard.emoji}
                        </div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-4">
                          Can you recall the answer?
                        </p>
                        <p className="text-lg sm:text-xl lg:text-2xl font-semibold leading-relaxed text-foreground mb-6">
                          {currentCard.front}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Tap to reveal answer
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-4">
                          Answer
                        </p>
                        <p className="text-lg sm:text-xl lg:text-2xl font-semibold leading-relaxed text-primary mb-8">
                          {currentCard.back}
                        </p>
                        <p className="text-sm text-muted-foreground mb-6">
                          How well did you recall this?
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3"
          >
            <Button
              variant="outline"
              onClick={() => handleRecall(RecallDifficulty.DONT_REMEMBER)}
              className="h-auto py-4 sm:py-5 flex flex-col gap-2"
            >
              <FrownIcon className="w-6 h-6 text-error" />
              <span className="font-semibold">Don&apos;t Remember</span>
              <span className="text-xs text-muted-foreground">
                See again soon
              </span>
            </Button>

            <Button
              variant="outline"
              onClick={() => handleRecall(RecallDifficulty.HARD)}
              className="h-auto py-4 sm:py-5 flex flex-col gap-2"
            >
              <MehIcon className="w-6 h-6 text-warning" />
              <span className="font-semibold">Hard</span>
              <span className="text-xs text-muted-foreground">
                In 5 minutes
              </span>
            </Button>

            <Button
              onClick={() => handleRecall(RecallDifficulty.EASY)}
              className="h-auto py-4 sm:py-5 flex flex-col gap-2"
            >
              <SmileIcon className="w-6 h-6" />
              <span className="font-semibold">Easy</span>
              <span className="text-xs">In 1 hour</span>
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
