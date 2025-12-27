import * as fs from "fs";
import { GraduationChecker } from "./logic/checkCredits";
import { Requirement, Course } from "./logic/types";

// コマンドライン引数
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("使い方: node dist/test.js <data.json> [--json|--text]");
  process.exit(1);
}

const filePath = args[0];
const mode = args.includes("--json") ? "json" : "text";

if (!filePath) {
  console.error("使い方: node dist/test.js <data.json>");
  process.exit(1);
}

const raw = fs.readFileSync(filePath, "utf-8");
const data = JSON.parse(raw);

const requirements = data.requirements.map(
  (r: any) => new Requirement(r.category, r.required)
);

const courses = data.courses.map(
  (c: any) => new Course(c.name, c.category, c.credits)
);

// =====================
// 卒業判定
// =====================
const checker = new GraduationChecker(requirements, courses);
checker.calculate();

// =====================
// 出力
// =====================
console.log("=== 未達成項目 ===");
for (const r of checker.getResults().filter(r => !r.passed)) {
  console.log(`${r.category}: ${r.earned}/${r.required}`);
}

console.log("=== 卒業要件チェック結果 ===");
for (const r of checker.getResults()) {
  console.log(`${r.category}: ${r.earned}/${r.required} 単位 ${r.passed ? "✅" : "❌"}`);
}

console.log("=== JSON 出力 ===");
console.log(JSON.stringify(checker.getResults(), null, 2));
