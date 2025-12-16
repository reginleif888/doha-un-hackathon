import { Link, useLocation } from "@tanstack/react-router";
import {
  BookOpenIcon,
  HomeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GraduationCapIcon,
  XIcon,
  BrainIcon,
} from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  totalKt: number;
  progress: number;
}

const navItems = [
  { path: "/dashboard", icon: HomeIcon, label: "Dashboard" },
  { path: "/course", icon: BookOpenIcon, label: "Course" },
  { path: "/flashcards", icon: BrainIcon, label: "Flashcards" },
];

export const Sidebar = ({
  isCollapsed,
  onToggle,
  totalKt,
  progress,
}: SidebarProps) => {
  const location = useLocation();
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <aside
      className={cn(
        "h-screen border-r border-border bg-sidebar flex flex-col transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
              <GraduationCapIcon className="w-5 h-5" />
            </div>
            <span className="font-semibold text-foreground">Academy</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn("shrink-0", isCollapsed && "mx-auto")}
        >
          {isMobile ? (
            <XIcon className="w-4 h-4" />
          ) : isCollapsed ? (
            <ChevronRightIcon className="w-4 h-4" />
          ) : (
            <ChevronLeftIcon className="w-4 h-4" />
          )}
        </Button>
      </div>

      <Separator />

      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              item.path === "/dashboard"
                ? location.pathname === "/" || location.pathname === "/dashboard"
                : location.pathname.startsWith(item.path);

            const linkContent = (
              <Link
                to={item.path}
                onClick={isMobile ? onToggle : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={item.path} delayDuration={0}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.path}>{linkContent}</div>;
          })}
        </nav>
      </ScrollArea>

      <Separator />

      <div className={cn("p-4", isCollapsed && "px-2")}>
        {isCollapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center w-full p-2 rounded-lg bg-brand-50">
                <img 
                  src="/knowledge-token.png" 
                  alt="Knowledge Token" 
                  className="w-5 h-5 object-contain"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <div className="text-sm">
                <p className="font-medium">{totalKt} KT</p>
                <p className="text-muted-foreground">{progress}% complete</p>
              </div>
            </TooltipContent>
          </Tooltip>
        ) : (
          <div className="p-3 rounded-lg bg-brand-50">
            <div className="flex items-center gap-2 mb-2">
              <img 
                src="/knowledge-token.png" 
                alt="Knowledge Token" 
                className="w-5 h-5 object-contain"
              />
              <span className="text-sm font-medium text-foreground">
                {totalKt} KT
              </span>
            </div>
            <Progress value={progress} className="h-1.5" />
            <p className="mt-2 text-xs text-muted-foreground">
              {progress}% course completed
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
