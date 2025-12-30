// src/test.ts
import * as fs from "fs";
import { GraduationChecker } from "./logic/checkCredits";
import { Requirement, Course } from "./logic/types";
export class TestRunner {
    constructor(filePath, mode = "text") {
        this.filePath = filePath;
        this.mode = mode;
    }
    // -----------------------------
    // JSON 読み込み
    // -----------------------------
    loadJson() {
        if (!fs.existsSync(this.filePath)) {
            throw new Error(`ファイルが存在しません: ${this.filePath}`);
        }
        const raw = fs.readFileSync(this.filePath, "utf-8");
        try {
            return JSON.parse(raw);
        }
        catch (e) {
            throw new Error(`JSON ファイルの読み込みに失敗しました: ${e.message}`);
        }
    }
    // -----------------------------
    // 型チェック
    // -----------------------------
    validateData(data) {
        if (!data.requirements || !Array.isArray(data.requirements)) {
            throw new Error("JSON に 'requirements' 配列が存在しません");
        }
        if (!data.courses || !Array.isArray(data.courses)) {
            throw new Error("JSON に 'courses' 配列が存在しません");
        }
        for (const r of data.requirements) {
            if (typeof r.category !== "string" || typeof r.required !== "number") {
                throw new Error("requirements の要素が不正です: " + JSON.stringify(r));
            }
        }
        for (const c of data.courses) {
            if (typeof c.name !== "string" || typeof c.category !== "string" || typeof c.credits !== "number") {
                throw new Error("courses の要素が不正です: " + JSON.stringify(c));
            }
        }
    }
    // -----------------------------
    // GraduationChecker 実行
    // -----------------------------
    run() {
        const data = this.loadJson();
        this.validateData(data);
        const requirements = data.requirements.map((r) => new Requirement(r.category, r.required));
        const courses = data.courses.map((c) => new Course(c.name, c.category, c.credits));
        const checker = new GraduationChecker(requirements, courses);
        checker.calculate();
        if (this.mode === "json") {
            console.log(JSON.stringify(checker.getResults(), null, 2));
            return;
        }
        console.log("=== 未達成項目 ===");
        checker.getResults().filter(r => !r.passed).forEach(r => {
            console.log(`${r.category}: ${r.earned}/${r.required}`);
        });
        console.log("=== 卒業要件チェック結果 ===");
        checker.getResults().forEach(r => {
            console.log(`${r.category}: ${r.earned}/${r.required} 単位 ${r.passed ? "✅" : "❌"}`);
        });
    }
}
// -----------------------------
// CLI 実行
// -----------------------------
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error("使い方: node dist/test.js <data.json> [--json|--text]");
        process.exit(1);
    }
    const filePath = args[0];
    const mode = args.includes("--json") ? "json" : "text";
    try {
        const runner = new TestRunner(filePath, mode);
        runner.run();
    }
    catch (e) {
        console.error(e.message);
        process.exit(1);
    }
}
