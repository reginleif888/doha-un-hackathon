import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon, SparklesIcon, HeartIcon, BookOpenIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { userService } from "@/entities/user";

export const Character = () => {
  const userProfile = userService.getUserProfile();

  if (!userProfile) {
    return null;
  }

  const characterImage = `/characters/${userProfile.character}.png`;

  return (
    <div className="min-h-screen bg-background-primary">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-6">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="bg-gradient-to-br from-brand-50 to-brand-100/50 rounded-2xl border border-border-base-neutral overflow-hidden">
          <div className="p-6 sm:p-10">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
              <div className="flex-shrink-0 mx-auto lg:mx-0">
                <div className="relative">
                  <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-2xl overflow-hidden border-4 border-background-primary shadow-2xl">
                    <img
                      src={characterImage}
                      alt="Gracie"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-warning rounded-full flex items-center justify-center border-4 border-background-primary shadow-lg">
                    <SparklesIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                    Meet Gracie
                  </h1>
                  <p className="text-lg text-brand-600 font-medium">Your AI Learning Companion</p>
                </div>

                <div className="prose prose-slate max-w-none">
                  <p className="text-base sm:text-lg text-foreground leading-relaxed">
                    Hello, {userProfile.name}! I'm Gracie, your dedicated guide through the world of anti-corruption education. Together, we'll explore the principles of integrity, transparency, and accountability that form the foundation of a just society.
                  </p>
                </div>

                <div className="bg-background-primary rounded-xl p-6 border border-border-base-neutral">
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <HeartIcon className="w-5 h-5 text-error" />
                    What I'm Here For
                  </h2>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                      <p className="text-sm sm:text-base text-muted-foreground">
                        <strong className="text-foreground">Guide your journey:</strong> I'll help you navigate through the United Nations Convention against Corruption, making complex topics accessible and engaging.
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                      <p className="text-sm sm:text-base text-muted-foreground">
                        <strong className="text-foreground">Support your learning:</strong> Through videos, quizzes, and interactive content, I'll ensure you understand and retain what matters most.
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 shrink-0" />
                      <p className="text-sm sm:text-base text-muted-foreground">
                        <strong className="text-foreground">Celebrate your progress:</strong> Every milestone you reach is a step toward building a corruption-free future. I'll be here to acknowledge your growth.
                      </p>
                    </li>
                  </ul>
                </div>

                <div className="bg-brand-50/50 rounded-xl p-5 border border-brand-200">
                  <div className="flex items-start gap-3">
                    <BookOpenIcon className="w-5 h-5 text-brand-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm sm:text-base text-foreground italic">
                        "Integrity is not just about following rules—it's about understanding why those rules exist and choosing to uphold them for the greater good. Let's learn together how we can each play a role in creating a fairer, more transparent world."
                      </p>
                      <p className="text-sm text-brand-600 font-medium mt-2">— Gracie</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-background-primary px-6 sm:px-10 py-6 border-t border-border-base-neutral">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                Ready to continue your anti-corruption education journey?
              </p>
              <Link to="/dashboard">
                <Button size="lg" className="gap-2">
                  <BookOpenIcon className="w-4 h-4" />
                  Return to Learning
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Part of the UNODC GRACE Initiative
          </p>
        </div>
      </div>
    </div>
  );
};

