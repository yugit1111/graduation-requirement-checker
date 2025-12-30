import * as fs from "fs";
import * as path from "path";
import { JsonValidator } from "../src/JsonValidator";
import { Requirement, Course } from "../src/logic/types";

type TestResult = {
  validator?: string;
  checker?: string;
  cli?: string;
};

export class IntegratedInvalidJsonTestRunner {
  constructor(
    private targetPath: string,
    private cliPath: string
  ) {}

  runAll(): Record<string, TestResult> {
    const results: Record<string, TestResult> = {};
    const files = this.collectJsonFiles(this.targetPath);

    for (const file of files) {
      const fullPath = path.resolve(this.targetPath, file);
      results[file] = {};

      /* ------------------------------
       * 1. JSON 読み込み
       * ------------------------------ */
      let rawData: unknown;

      try {
        rawData = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
      } catch (e: any) {
        results[file].validator = `JSON parse error: ${e.message}`;
        continue;
      }

      /* ------------------------------
       * 2. JsonValidator チェック
       * ------------------------------ */
      const validation = new JsonValidator().validateFromObject(rawData);

      if (validation.ok === false) {
        results[file].validator = validation.error;
        continue;
      }

      results[file].validator = "NO ERROR (失敗)";

      /* ------------------------------
       * 3. Checker ロジック
       * ------------------------------ */
      const reqs: Requirement[] = validation.value.requirements.map(
        r => new Requirement(r.category, r.requiredCredits)
      );

      const courses: Course[] = validation.value.courses.map(
        c => new Course(c.name, c.category, c.credits)
      );

      const resultsChecker = reqs.map(r => {
        const sum = courses
          .filter(c => c.category === r.category)
          .reduce((acc, c) => acc + c.credits, 0);

        r.addCredits(sum);

        return {
          category: r.category,
          earned: r.earnedCredits,
          required: r.requiredCredits,
          passed: r.isSatisfied(),
        };
      });

      if (resultsChecker.every(r => r.passed)) {
        results[file].checker = "NO ERROR (失敗)";
      } else {
        results[file].checker = "例外（未達成あり）";
      }

      /* ------------------------------
       * 4. CLI 実行チェック
       * ------------------------------ */
      try {
        const { execSync } = require("child_process");
        execSync(`npx ts-node ${this.cliPath} ${fullPath}`, {
          stdio: ["ignore", "pipe", "pipe"],
        });
        results[file].cli = "NO ERROR (失敗)";
      } catch (e: any) {
        results[file].cli = (e.stderr || e.message).toString();
      }
    }

    return results;
  }

  private collectJsonFiles(target: string): string[] {
    const stat = fs.statSync(target);

    if (stat.isFile()) {
      return [path.basename(target)];
    }

    if (stat.isDirectory()) {
      return fs.readdirSync(target).filter(f => f.endsWith(".json"));
    }

    throw new Error("指定されたパスはファイルでもディレクトリでもありません");
  }
}
