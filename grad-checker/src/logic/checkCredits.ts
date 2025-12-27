import { Requirement } from "./types";

export type CheckResult = {
  category: string;
  earned: number;
  required: number;
  passed: boolean;
};

export class GraduationChecker {
  constructor(
    private requirements: Requirement[],
    private courses: { category: string; credits: number }[]
  ) {}

  calculate() {
    for (const course of this.courses) {
      const req = this.requirements.find(r => r.category === course.category);
      if (req) req.addCredits(course.credits);
    }
  }

  getResults(): CheckResult[] {
    return this.requirements.map(req => ({
      category: req.category,
      earned: req.earnedCredits,
      required: req.requiredCredits,
      passed: req.isSatisfied(),
    }));
  }

  getUnfulfilled(): CheckResult[] {
    return this.getResults().filter(r => !r.passed);
  }
}
