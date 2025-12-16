import { useState, useEffect } from "react";
import {
  CheckCircle2Icon,
  ChevronRightIcon,
  StarIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VideoIntro } from "@/components/features/video-intro";
import { userService } from "@/entities/user";

import type { InfoModule as InfoModuleType } from "@/shared/types";

interface InfoModuleProps {
  module: InfoModuleType;
  isCompleted: boolean;
  onComplete: () => { ktEarned: number; totalKt: number };
  onContinue: () => void;
  isLastModule: boolean;
}

export const InfoModule = ({
  module,
  isCompleted,
  onComplete,
  onContinue,
  isLastModule,
}: InfoModuleProps) => {
  const [showCompletion, setShowCompletion] = useState(false);
  const userProfile = userService.getUserProfile();

  useEffect(() => {
    setShowCompletion(false);
  }, [module.id]);

  const handleMarkComplete = () => {
    onComplete();
    setShowCompletion(true);
  };

  const renderContent = (content: string) => {
    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];
    let listType: "ul" | "ol" | null = null;
    let currentBlockquote: string[] = [];

    const formatText = (text: string) => {
      return text.replace(/\*\*(.*?)\*\*/g, "<strong class='font-semibold text-foreground'>$1</strong>");
    };

    const flushList = () => {
      if (currentList.length > 0) {
        const ListTag = listType === "ol" ? "ol" : "ul";
        elements.push(
          <ListTag
            key={elements.length}
            className={`${listType === "ol" ? "list-decimal" : "list-disc"} pl-4 sm:pl-6 my-3 sm:my-4 space-y-1.5 sm:space-y-2`}
          >
            {currentList.map((item, i) => (
              <li
                key={i}
                className="text-sm sm:text-base text-foreground"
                dangerouslySetInnerHTML={{ __html: formatText(item) }}
              />
            ))}
          </ListTag>
        );
        currentList = [];
        listType = null;
      }
    };

    const flushBlockquote = () => {
      if (currentBlockquote.length > 0) {
        elements.push(
          <blockquote
            key={elements.length}
            className="border-l-4 border-primary/30 pl-4 sm:pl-6 py-2 my-3 sm:my-4 bg-muted/30 rounded-r"
          >
            {currentBlockquote.map((line, i) => (
              <p
                key={i}
                className="text-sm sm:text-base text-muted-foreground italic"
                dangerouslySetInnerHTML={{ __html: formatText(line) }}
              />
            ))}
          </blockquote>
        );
        currentBlockquote = [];
      }
    };

    lines.forEach((line, i) => {
      if (line.startsWith("## ")) {
        flushList();
        flushBlockquote();
        elements.push(
          <h2
            key={i}
            className="text-base sm:text-lg lg:text-xl font-semibold text-foreground mt-6 sm:mt-8 mb-3 sm:mb-4"
          >
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        flushList();
        flushBlockquote();
        elements.push(
          <h3
            key={i}
            className="text-sm sm:text-base lg:text-lg font-semibold text-foreground mt-4 sm:mt-6 mb-2 sm:mb-3"
          >
            {line.slice(4)}
          </h3>
        );
      } else if (line.startsWith("> ")) {
        flushList();
        currentBlockquote.push(line.slice(2));
      } else if (line.startsWith("- ")) {
        flushBlockquote();
        if (listType !== "ul") flushList();
        listType = "ul";
        currentList.push(line.slice(2));
      } else if (/^\d+\.\s/.test(line)) {
        flushBlockquote();
        if (listType !== "ol") flushList();
        listType = "ol";
        currentList.push(line.replace(/^\d+\.\s/, ""));
      } else if (line.trim() === "") {
        flushList();
        flushBlockquote();
      } else {
        flushList();
        flushBlockquote();
        elements.push(
          <p
            key={i}
            className="text-sm sm:text-base text-muted-foreground my-3 sm:my-4"
            dangerouslySetInnerHTML={{ __html: formatText(line) }}
          />
        );
      }
    });

    flushList();
    flushBlockquote();
    return elements;
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
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-2">
                Module Completed!
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                You have successfully completed this module.
              </p>
            </div>
            <div>
              <Button onClick={onContinue} size="lg" className="h-10 sm:h-11 text-sm sm:text-base">
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
      <div className="mb-6 sm:mb-8">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-2">
          {module.title}
        </h1>
        {module.description && (
          <p className="text-sm sm:text-base text-muted-foreground">
            {module.description}
          </p>
        )}
      </div>

      {module.video && (
        <div className="mb-6 sm:mb-8">
          <VideoIntro 
            src={userProfile?.character === "X" ? module.video.X : module.video.Y} 
          />
        </div>
      )}

      <div className="prose prose-slate max-w-none">
        {renderContent(module.content)}
      </div>

      <div className="mt-8 sm:mt-12 flex justify-end">
        {isCompleted ? (
          <Button onClick={onContinue} className="h-9 sm:h-10 text-sm">
            {isLastModule ? "Finish Lesson" : "Continue"}
            <ChevronRightIcon className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleMarkComplete} className="h-9 sm:h-10 text-sm">
            <CheckCircle2Icon className="w-4 h-4 mr-1" />
            Mark as Complete
          </Button>
        )}
      </div>
    </div>
  );
};
