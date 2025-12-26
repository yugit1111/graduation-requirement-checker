import { Requirement, Course } from "./types.js";

export function checkCredits(
  requirements: Requirement[],
  courses: Course[]
) {
  const result: Record<string, number> = {};

  for (const req of requirements) {
    const sum = courses
      .filter(c => c.category === req.category)
      .reduce((acc, c) => acc + c.credits, 0);

    result[req.category] = sum;
  }

  return result;
}
