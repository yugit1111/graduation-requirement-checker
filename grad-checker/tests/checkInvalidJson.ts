// tests/checkInvalidJson.ts
import * as fs from "fs";
import * as path from "path";

export class JsonValidator {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  // -----------------------------
  // JSON 読み込み
  // -----------------------------
  loadJson(): any {
    if (!fs.existsSync(this.filePath)) {
      throw new Error(`ファイルが存在しません: ${this.filePath}`);
    }
    const raw = fs.readFileSync(this.filePath, "utf-8");
    try {
      return JSON.parse(raw);
    } catch (e: any) {
      throw new Error(`JSON ファイルの読み込みに失敗しました: ${e.message}`);
    }
  }

  // -----------------------------
  // 型チェック
  // -----------------------------
  validate(data: any) {
    if (!data.requirements || !Array.isArray(data.requirements)) {
      throw new Error("'requirements' 配列が存在しません");
    }
    if (!data.courses || !Array.isArray(data.courses)) {
      throw new Error("'courses' 配列が存在しません");
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
  // 実行
  // -----------------------------
  run() {
    const data = this.loadJson();
    this.validate(data);
    console.log("読み込み成功:", data);
  }
}

// -----------------------------
// CLI 実行
// -----------------------------
if (require.main === module) {
  const invalidFile = path.resolve(__dirname, "invalid.json");
  try {
    const validator = new JsonValidator(invalidFile);
    validator.run();
  } catch (e: any) {
    console.log("例外が出ました:", e.message);
  }
}
