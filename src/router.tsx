import { lazy, Suspense } from "react";
import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
  redirect,
} from "@tanstack/react-router";

import { AppLayout } from "@/components/layout";
import { Spinner } from "@/components/ui/spinner";
import { userService } from "@/entities/user";
import { Onboarding } from "./pages/onboarding";
import { DashboardPage } from "./pages/dashboard";
import { CoursePage } from "./pages/course";
import { FlashcardsPage } from "./pages/flashcards";

const CharacterPage = lazy(() =>
  import("./pages/character").then((m) => ({ default: m.Character }))
);

const FlashcardsRecallPage = lazy(() =>
  import("./pages/flashcards-recall").then((m) => ({
    default: m.FlashcardsRecallPage,
  }))
);

const TopicPage = lazy(() =>
  import("./pages/topic").then((m) => ({ default: m.TopicPage }))
);

const LessonPage = lazy(() =>
  import("./pages/lesson").then((m) => ({ default: m.LessonPage }))
);

const ModulePage = lazy(() =>
  import("./pages/module").then((m) => ({ default: m.ModulePage }))
);

const PageFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <Spinner className="w-8 h-8 text-primary" />
  </div>
);

const rootRoute = createRootRoute({
  component: () => (
    <Suspense fallback={<PageFallback />}>
      <Outlet />
    </Suspense>
  ),
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  component: Onboarding,
  beforeLoad: () => {
    if (userService.hasCompletedOnboarding()) {
      throw redirect({ to: "/dashboard" });
    }
  },
});

const protectedLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_protected",
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
  beforeLoad: () => {
    if (!userService.hasCompletedOnboarding()) {
      throw redirect({ to: "/onboarding" });
    }
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const characterRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/character",
  component: CharacterPage,
});

const flashcardsRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/flashcards",
  component: FlashcardsPage,
});

const flashcardsRecallRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/flashcards/recall",
  component: FlashcardsRecallPage,
});

const courseRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/course",
  component: CoursePage,
});

const topicRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/course/$topicId",
  component: TopicPage,
});

const lessonRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/course/$topicId/$lessonId",
  component: LessonPage,
});

const moduleRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/course/$topicId/$lessonId/$moduleId",
  component: ModulePage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    if (userService.hasCompletedOnboarding()) {
      throw redirect({ to: "/dashboard" });
    } else {
      throw redirect({ to: "/onboarding" });
    }
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  onboardingRoute,
  protectedLayoutRoute.addChildren([
    dashboardRoute,
    characterRoute,
    flashcardsRoute,
    flashcardsRecallRoute,
    courseRoute,
    topicRoute,
    lessonRoute,
    moduleRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
