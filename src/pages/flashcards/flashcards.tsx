import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BookOpenIcon,
  BrainIcon,
  TrashIcon,
  AlertCircleIcon,
  ArrowLeftIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  flashcardMemoryService,
  FlashcardMemoryType,
  type SavedFlashcard,
} from "@/entities/flashcards";

type FilterType = "all" | "short-term" | "long-term";

export const FlashcardsPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>("all");
  const [flashcards, setFlashcards] = useState<SavedFlashcard[]>([]);
  const [stats, setStats] = useState({ total: 0, shortTerm: 0, longTerm: 0, dueNow: 0 });

  const loadFlashcards = () => {
    let cards: SavedFlashcard[] = [];
    
    if (filter === "all") {
      cards = flashcardMemoryService.getAllFlashcards();
    } else if (filter === "short-term") {
      cards = flashcardMemoryService.getFlashcardsByType(FlashcardMemoryType.SHORT_TERM);
    } else if (filter === "long-term") {
      cards = flashcardMemoryService.getFlashcardsByType(FlashcardMemoryType.LONG_TERM);
    }

    setFlashcards(cards);
    setStats(flashcardMemoryService.getStats());
  };

  useEffect(() => {
    loadFlashcards();
  }, [filter]);

  const handleForgot = (flashcardId: string) => {
    flashcardMemoryService.moveToRecall(flashcardId);
    loadFlashcards();
  };

  const handleDelete = (flashcardId: string) => {
    flashcardMemoryService.removeFlashcard(flashcardId);
    loadFlashcards();
  };

  const handleStartRecall = () => {
    navigate({ to: "/flashcards/recall" });
  };

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-6">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2 mb-4">
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
            My Flashcards
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Review and manage your saved flashcards
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
                  <BookOpenIcon className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
                  <BrainIcon className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Short-term</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.shortTerm}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                  <BookOpenIcon className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Long-term</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.longTerm}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center shrink-0">
                  <AlertCircleIcon className="w-5 h-5 text-error" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Due now</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.dueNow}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {stats.dueNow > 0 && (
          <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-brand-50 to-brand-100/50 border-brand-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Ready to practice?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    You have {stats.dueNow} flashcard{stats.dueNow !== 1 ? "s" : ""} ready for recall
                  </p>
                </div>
                <Button onClick={handleStartRecall} size="lg" className="w-full sm:w-auto">
                  <BrainIcon className="w-4 h-4 mr-2" />
                  Start Recall Session
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            size="sm"
          >
            All ({stats.total})
          </Button>
          <Button
            variant={filter === "short-term" ? "default" : "outline"}
            onClick={() => setFilter("short-term")}
            size="sm"
          >
            Short-term ({stats.shortTerm})
          </Button>
          <Button
            variant={filter === "long-term" ? "default" : "outline"}
            onClick={() => setFilter("long-term")}
            size="sm"
          >
            Long-term ({stats.longTerm})
          </Button>
        </div>

        {flashcards.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <BookOpenIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No flashcards yet
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Save flashcards during lessons to build your personal library
              </p>
              <Link to="/course">
                <Button>Browse Course</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
            {flashcards.map((flashcard) => (
              <Card key={flashcard.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="text-3xl shrink-0">{flashcard.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                            flashcard.memoryType === FlashcardMemoryType.LONG_TERM
                              ? "bg-success/10 text-success"
                              : "bg-warning/10 text-warning"
                          }`}
                        >
                          {flashcard.memoryType === FlashcardMemoryType.LONG_TERM
                            ? "Long-term"
                            : "Short-term"}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-foreground mb-2">
                        {flashcard.front}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {flashcard.back}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-border-base-neutral">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleForgot(flashcard.id)}
                      className="flex-1"
                    >
                      <AlertCircleIcon className="w-3.5 h-3.5 mr-1.5" />
                      I forgot it!
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(flashcard.id)}
                      className="flex-1 text-error hover:text-error"
                    >
                      <TrashIcon className="w-3.5 h-3.5 mr-1.5" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

