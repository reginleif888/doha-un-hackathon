import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { userService } from "@/entities/user";

type OnboardingStep = "form" | "mentor";

export const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<OnboardingStep>("form");
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [mentorName] = useState("Gracie");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !birthday) return;

    setIsSubmitting(true);
    
    setTimeout(() => {
      setStep("mentor");
      setIsSubmitting(false);
    }, 500);
  };

  const handleContinue = () => {
    const character = userService.determineCharacter(birthday);
    
    userService.saveUserProfile({
      name: name.trim(),
      birthday,
      character,
      onboardingCompleted: true,
    });

    navigate({ to: "/course" });
  };

  const getMentorMessage = () => {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age <= 25) {
      return "Hi there! The future belongs to those with integrity. Let's learn how to spot corruption and build a fairer world together. Ready to lead the change?";
    } else {
      return "Welcome! Experience has taught us that integrity is the foundation of society. Let's sharpen your knowledge to safeguard our future against corruption.";
    }
  };

  if (step === "mentor") {
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
                src="https://wntexajvlhsyexlxqylk.supabase.co/storage/v1/object/public/course_videos/ambient_video.mp4"
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
                  Meet {mentorName}
                </h1>
                <p className="text-base sm:text-lg text-brand-600 font-medium">
                  Your AI Learning Companion
                </p>
              </div>

              {/* Message */}
              <div className="space-y-6">
                <p className="text-base sm:text-lg text-foreground leading-relaxed">
                  {getMentorMessage()}
                </p>

                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Together, we'll explore the UN Convention against Corruption and learn how to build a more transparent, accountable world.
                </p>
              </div>

              {/* CTA */}
              <div className="pt-4">
                <Button
                  onClick={handleContinue}
                  size="lg"
                  className="w-full sm:w-auto sm:min-w-[240px] h-12 text-base font-semibold"
                >
                  Start Learning Now
                </Button>
              </div>

              {/* Footer */}
              <p className="text-xs text-muted-foreground text-center lg:text-left pt-4">
                Part of the UNODC GRACE Initiative
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-background-primary to-brand-50/30 p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="bg-background-primary rounded-2xl shadow-2xl p-6 sm:p-10 border border-border-base-neutral">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎓</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Welcome to Your Learning Journey
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Anti-Corruption Education Platform
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">
                What's your name?
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 text-base"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthday" className="text-sm font-medium text-foreground">
                When is your birthday?
              </Label>
              <Input
                id="birthday"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                required
                className="h-11 text-base"
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 text-base font-semibold"
              disabled={!name.trim() || !birthday || isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Continue"}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border-base-neutral">
            <p className="text-xs text-center text-muted-foreground">
              Part of the UNODC GRACE Initiative
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

