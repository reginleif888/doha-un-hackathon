import type { Course } from "@/shared/types";

let courseCache: Course | null = null;

export const courseService = {
  async getCourse(): Promise<Course> {
    if (courseCache) {
      return courseCache;
    }

    const response = await fetch("/data/course.json");
    if (!response.ok) {
      throw new Error("Failed to load course data");
    }

    const course = (await response.json()) as Course;
    courseCache = course;
    return course;
  },

  clearCache() {
    courseCache = null;
  },
};

