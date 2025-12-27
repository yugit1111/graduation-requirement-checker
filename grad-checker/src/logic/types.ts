// Requirement.ts
// types.ts
export class Requirement {
  category: string;
  requiredCredits: number;
  earnedCredits: number = 0;

  constructor(category: string, requiredCredits: number) {
    this.category = category;
    this.requiredCredits = requiredCredits;
  }

  addCredits(credits: number) {
    this.earnedCredits += credits;
  }

  isSatisfied(): boolean {
    return this.earnedCredits >= this.requiredCredits;
  }
}

export class Course {
  name: string;
  category: string;
  credits: number;

  constructor(name: string, category: string, credits: number) {
    this.name = name;
    this.category = category;
    this.credits = credits;
  }
}

export type GraduationResult = {
  category: string;
  earned: number;
  required: number;
  passed: boolean;
};
