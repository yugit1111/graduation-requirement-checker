import { GraduationChecker } from "../src/logic/checkCredits";
import { Requirement, Course } from "../src/logic/types";

test("卒業要件を満たさない場合 false", () => {
  const reqs = [new Requirement("専門", 10)];
  const courses = [new Course("数学", "専門", 4)];

  const checker = new GraduationChecker(reqs, courses);
  checker.calculate();

  const result = checker.getResults();
  expect(result[0].passed).toBe(false);
});
