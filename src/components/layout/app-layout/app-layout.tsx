import { useState, useEffect } from "react";
import { useLocation } from "@tanstack/react-router";
import { MenuIcon } from "lucide-react";

import { Sidebar } from "@/components/layout/sidebar";
import { CourseSidebar } from "@/components/layout/course-sidebar";
import { courseService } from "@/entities/course";
import { progressService } from "@/entities/progress";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/cn";

import type { Course } from "@/shared/types";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCourseSidebarOpen, setIsMobileCourseSidebarOpen] =
    useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState({ totalXp: 0, percentage: 0 });

  const isCoursePage = location.pathname.startsWith("/course");

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileCourseSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const loadCourseData = async () => {
      const courseData = await courseService.getCourse();
      setCourse(courseData);

      const userProgress = progressService.getProgress();
      const courseProgress =
        progressService.calculateCourseProgress(courseData);

      setProgress({
        totalXp: userProgress.totalXpEarned,
        percentage: courseProgress.percentage,
      });
    };

    loadCourseData();

    const handleProgressUpdate = () => {
      if (course) {
        const userProgress = progressService.getProgress();
        const courseProgress = progressService.calculateCourseProgress(course);
        setProgress({
          totalXp: userProgress.totalXpEarned,
          percentage: courseProgress.percentage,
        });
      }
    };

    window.addEventListener("progress-updated", handleProgressUpdate);
    return () =>
      window.removeEventListener("progress-updated", handleProgressUpdate);
  }, [course]);

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            isCollapsed={isCollapsed}
            onToggle={() => setIsCollapsed(!isCollapsed)}
            totalXp={progress.totalXp}
            progress={progress.percentage}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 md:hidden transition-transform duration-300",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <Sidebar
            isCollapsed={false}
            onToggle={() => setIsMobileMenuOpen(false)}
            totalXp={progress.totalXp}
            progress={progress.percentage}
          />
        </div>

        {/* Desktop Course Sidebar */}
        {isCoursePage && (
          <div className="hidden lg:block">
            <CourseSidebar />
          </div>
        )}

        {/* Mobile Course Sidebar Overlay */}
        {isMobileCourseSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileCourseSidebarOpen(false)}
          />
        )}

        {/* Mobile Course Sidebar */}
        {isCoursePage && (
          <div
            className={cn(
              "fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300",
              isMobileCourseSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <CourseSidebar
              onClose={() => setIsMobileCourseSidebarOpen(false)}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <header className="flex md:hidden items-center justify-between px-4 py-3 border-b border-border bg-background">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <MenuIcon className="w-5 h-5" />
            </Button>
            <span className="font-semibold text-foreground">Academy</span>
            {isCoursePage ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileCourseSidebarOpen(true)}
                className="text-xs"
              >
                Progress
              </Button>
            ) : (
              <div className="w-10" />
            )}
          </header>

          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
};
