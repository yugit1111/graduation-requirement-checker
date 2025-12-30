// src/GraduationChecker.ts

export interface RequirementData {
  category: string;
  requiredCredits: number;
}

export interface CourseData {
  name: string;
  category: string;
  credits: number;
}

export interface RequirementResult {
  category: string;
  earned: number;
  required: number;
  passed: boolean;
}

export interface CheckerResult {
  results: RequirementResult[];
  rawData: {
    requirements: RequirementData[];
    courses: CourseData[];
  };
}

export class GraduationChecker {
  private data: CheckerResult | null = null;

  constructor() {}

  run(jsonText: string): CheckerResult {
    let parsed: any;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e: any) {
      throw new Error("JSONの解析に失敗しました: " + e.message);
    }

    this.validate(parsed);

    const results: RequirementResult[] = parsed.requirements.map((r: RequirementData) => {
      const sum = parsed.courses
        .filter((c: CourseData) => c.category === r.category)
        .reduce((acc: number, c: CourseData) => acc + c.credits, 0);
      return {
        category: r.category,
        earned: sum,
        required: r.requiredCredits,
        passed: sum >= r.requiredCredits
      };
    });

    this.data = {
      results,
      rawData: {
        requirements: parsed.requirements,
        courses: parsed.courses
      }
    };

    return this.data;
  }

  private validate(parsed: any) {
    if (!parsed.requirements || !Array.isArray(parsed.requirements)) {
      throw new Error("'requirements' 配列が存在しません");
    }
    if (!parsed.courses || !Array.isArray(parsed.courses)) {
      throw new Error("'courses' 配列が存在しません");
    }
    parsed.requirements.forEach((r: any) => {
      if (typeof r.category !== "string" || typeof r.requiredCredits !== "number") {
        throw new Error("requirements の要素が不正です: " + JSON.stringify(r));
      }
    });
    parsed.courses.forEach((c: any) => {
      if (typeof c.name !== "string" || typeof c.category !== "string" || typeof c.credits !== "number") {
        throw new Error("courses の要素が不正です: " + JSON.stringify(c));
      }
    });
  }

  getHtmlResult(): HTMLElement {
    if (!this.data) throw new Error("まだ判定が実行されていません");

    const container = document.createElement("div");

    // 全体判定
    const allPassed = this.data.results.every(r => r.passed);
    const totalEarned = this.data.results.reduce((sum, r) => sum + r.earned, 0);
    const totalRequired = this.data.results.reduce((sum, r) => sum + r.required, 0);

    const overallDiv = document.createElement("div");
    overallDiv.className = "overall " + (allPassed ? "passed" : "failed");
    overallDiv.textContent = `全体判定：${allPassed ? "合格" : "不合格"}（取得単位 ${totalEarned} / 必要単位 ${totalRequired}）`;
    container.appendChild(overallDiv);

    // カテゴリごとのカード
    this.data.results.forEach(r => {
      const card = document.createElement("div");
      card.className = "card " + (r.passed ? "passed" : "failed");

      const title = document.createElement("h3");
      title.textContent = `${r.category}：取得単位 ${r.earned} / 必要単位 ${r.required} → ${r.passed ? "合格" : "不合格"}`;
      card.appendChild(title);

      const tableContainer = document.createElement("div");
      tableContainer.className = "table-container";

      const table = document.createElement("table");
      const header = document.createElement("tr");
      ["科目名", "単位"].forEach(text => {
        const th = document.createElement("th");
        th.textContent = text;
        header.appendChild(th);
      });
      table.appendChild(header);

      const courses = this.data!.rawData.courses.filter(c => c.category === r.category);
      courses.forEach(c => {
        const tr = document.createElement("tr");
        const tdName = document.createElement("td");
        tdName.textContent = c.name;
        const tdCredits = document.createElement("td");
        tdCredits.textContent = c.credits.toString();
        tr.appendChild(tdName);
        tr.appendChild(tdCredits);
        table.appendChild(tr);
      });

      tableContainer.appendChild(table);
      card.appendChild(tableContainer);
      container.appendChild(card);
    });

    return container;
  }

  getCsv(): string {
    if (!this.data) throw new Error("まだ判定が実行されていません");

    const lines: string[] = [];
    lines.push("カテゴリ,取得単位,必要単位,合否,科目名,単位");

    this.data.results.forEach(r => {
      const catCourses = this.data!.rawData.courses.filter(c => c.category === r.category);
      if (catCourses.length === 0) {
        lines.push(`${r.category},${r.earned},${r.required},${r.passed ? "合格" : "不合格"},,`);
      } else {
        catCourses.forEach((c, idx) => {
          if (idx === 0) {
            lines.push(`${r.category},${r.earned},${r.required},${r.passed ? "合格" : "不合格"},${c.name},${c.credits}`);
          } else {
            lines.push(`,,, ,${c.name},${c.credits}`);
          }
        });
      }
    });

    return lines.join("\n");
  }
}
