import { GraduationChecker } from "../src/logic/checkCredits";
import { Requirement, Course } from "../src/logic/types";

test("専門が足りない場合は不合格になる", () => {
  const requirements = [
    new Requirement("専門", 50)
  ];

  const courses = [
    new Course("データ構造", "専門", 10)
  ];

  const checker = new GraduationChecker(requirements, courses);
  checker.calculate();

  const result = checker.getResults()[0];
  expect(result.passed).toBe(false);
});

test("必要単位を満たしていれば合格", () => {
  const requirements = [
    new Requirement("共通教育", 10)
  ];

  const courses = [
    new Course("英語", "共通教育", 10)
  ];

  const checker = new GraduationChecker(requirements, courses);
  checker.calculate();

  const result = checker.getResults()[0];
  expect(result.passed).toBe(true);
});
