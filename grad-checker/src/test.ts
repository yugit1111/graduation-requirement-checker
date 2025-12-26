import { checkCredits } from "./logic/checkCredits.js";
import { Requirement, Course } from "./logic/types.js";

// 卒業要件例
const requirements: Requirement[] = [
  { category: "共通教育", requiredCredits: 30 },
  { category: "専門", requiredCredits: 50 }
];

// 履修科目例
const courses: Course[] = [
  { name: "数学A", category: "共通教育", credits: 2 },
  { name: "物理B", category: "専門", credits: 4 },
  { name: "化学C", category: "専門", credits: 3 }
];

const results = checkCredits(requirements, courses);
console.log(results);
