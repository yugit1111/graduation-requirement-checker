class RequirementsManager {
  private specializedInput: HTMLInputElement;
  private generalEduInput: HTMLInputElement;
  private obtainedSpecializedInput: HTMLInputElement;
  private obtainedGeneralEduInput: HTMLInputElement;

  constructor() {
    this.specializedInput = document.getElementById("reqSpecialized") as HTMLInputElement;
    this.generalEduInput = document.getElementById("reqGeneralEducation") as HTMLInputElement;
    this.obtainedSpecializedInput = document.getElementById("obtainedSpecialized") as HTMLInputElement;
    this.obtainedGeneralEduInput = document.getElementById("obtainedGeneralEducation") as HTMLInputElement;

    this.addListeners();
    this.load();
  }

  private addListeners() {
    [this.specializedInput, this.generalEduInput, this.obtainedSpecializedInput, this.obtainedGeneralEduInput].forEach(input => {
      input.addEventListener("input", () => {
        if (Number(input.value) < 0) input.value = "0";
        this.save();
      });
    });
  }

  save() {
    localStorage.setItem("requirements", JSON.stringify({
      specialized: this.specializedInput.value,
      generalEdu: this.generalEduInput.value,
      obtainedSpecialized: this.obtainedSpecializedInput.value,
      obtainedGeneralEducation: this.obtainedGeneralEduInput.value
    }));
  }

  load() {
    const data = JSON.parse(localStorage.getItem("requirements") || "{}");
    if (data.specialized !== undefined) this.specializedInput.value = String(Math.max(0, data.specialized));
    if (data.generalEdu !== undefined) this.generalEduInput.value = String(Math.max(0, data.generalEdu));
    if (data.obtainedSpecialized !== undefined) this.obtainedSpecializedInput.value = String(Math.max(0, data.obtainedSpecialized));
    if (data.obtainedGeneralEducation !== undefined) this.obtainedGeneralEduInput.value = String(Math.max(0, data.obtainedGeneralEducation));
  }

  getRequirements() {
    return {
      specialized: Number(this.specializedInput.value),
      generalEdu: Number(this.generalEduInput.value),
      obtainedSpecialized: Number(this.obtainedSpecializedInput.value),
      obtainedGeneralEducation: Number(this.obtainedGeneralEduInput.value)
    };
  }
}

interface Course {
  name: string;
  category: string;
  credits: number;
  completed: boolean;
}

class CourseManager {
  private courses: Course[];
  private courseTable: HTMLElement;
  private searchInput: HTMLInputElement;

  private electiveLimits = {
    "専門基礎科目_選択": {min:4, max:8},
    "系科目_選択": {min:4, max:8},
    "コース科目_選択": {min:16, max:Infinity},
    "他コース科目_選択": {min:0, max:6}
  };

  constructor() {
    this.courses = JSON.parse(localStorage.getItem("courses") || "[]");
    this.courseTable = document.getElementById("courseTable")!;
    this.searchInput = document.getElementById("searchInput") as HTMLInputElement;

    this.searchInput.addEventListener("input", () => this.render());
    this.render();
  }

  addCourse(course: Course) {
    this.courses.push(course);
    this.save();
    this.render();
  }

  checkAllRequired() {
    this.courses.forEach(c => {
      if (c.category.endsWith("_必須")) c.completed = true;
    });
    this.save();
    this.render();
  }

  getCourses() {
    return this.courses;
  }

  save() {
    localStorage.setItem("courses", JSON.stringify(this.courses));
  }

  render() {
    this.courseTable.innerHTML = "";
    const keyword = this.searchInput.value.toLowerCase();

    const categories: Record<string, Course[]> = {};
    this.courses.forEach(c => {
      if (keyword && !c.name.toLowerCase().includes(keyword)) return;
      const mainCat = c.category.split("_")[0];
      if (!categories[mainCat]) categories[mainCat] = [];
      categories[mainCat].push(c);
    });

    for (const catName in categories) {
      const trCat = document.createElement("tr");
      const th = document.createElement("th");
      th.colSpan = 5;
      th.textContent = catName;
      trCat.appendChild(th);
      this.courseTable.appendChild(trCat);

      categories[catName].forEach(c => {
        const tr = document.createElement("tr");

        const chk = document.createElement("input");
        chk.type = "checkbox";
        chk.checked = c.completed;
        chk.onchange = () => { c.completed = chk.checked; this.save(); };

        const del = document.createElement("button");
        del.textContent = "削除";
        del.onclick = () => { this.courses.splice(this.courses.indexOf(c),1); this.save(); this.render(); };

        const nameCell = document.createElement("td");
        nameCell.textContent = c.name;
        if (c.category.endsWith("_必須")) {
          const mark = document.createElement("span");
          mark.textContent = "★必須";
          mark.className = "required-mark";
          nameCell.appendChild(mark);
        }

        tr.appendChild(document.createElement("td")).appendChild(chk);
        tr.appendChild(nameCell);
        tr.appendChild(document.createElement("td")).textContent = c.category;
        tr.appendChild(document.createElement("td")).textContent = c.credits.toString();
        tr.appendChild(document.createElement("td")).appendChild(del);

        this.courseTable.appendChild(tr);
      });
    }
  }
}

class GraduationChecker {
  private requirementsManager: RequirementsManager;
  private courseManager: CourseManager;
  private resultDiv: HTMLElement;
  private warningDiv: HTMLElement;

  private maxOtherCourseCredits = 6;
  private electiveLimits = {
    "専門基礎科目_選択": {min:4, max:8},
    "系科目_選択": {min:4, max:8},
    "コース科目_選択": {min:16, max:Infinity},
    "他コース科目_選択": {min:0, max:6}
  };

  constructor(requirementsManager: RequirementsManager, courseManager: CourseManager) {
    this.requirementsManager = requirementsManager;
    this.courseManager = courseManager;
    this.resultDiv = document.getElementById("result")!;
    this.warningDiv = document.getElementById("requiredWarning")!;
  }

  run() {
    const reqs = this.requirementsManager.getRequirements();
    const totals: Record<string, number> = {
      "専門基礎科目_必須": reqs.obtainedSpecialized,
      "専門基礎科目_選択": 0,
      "系科目_必須": 0,
      "系科目_選択": 0,
      "コース科目_必須": 0,
      "コース科目_選択": 0,
      "他コース科目_選択": 0
    };

    const courses = this.courseManager.getCourses();
    courses.forEach(c => {
      if (c.completed && c.category in totals) totals[c.category] += c.credits;
    });

    const uncheckedRequired = courses.filter(c => c.category.endsWith("_必須") && !c.completed);

    if (uncheckedRequired.length > 0) {
      this.warningDiv.textContent = "必須科目が未チェックです：" + uncheckedRequired.map(c => c.name).join("、");
    } else {
      this.warningDiv.textContent = "";
    }

    // 上限適用
    for (const cat in this.electiveLimits) {
      const limit = this.electiveLimits[cat as keyof typeof this.electiveLimits];
      if (totals[cat] > limit.max) totals[cat] = limit.max;
    }

    const specializedTotal = totals["専門基礎科目_必須"] + totals["専門基礎科目_選択"] +
                             totals["系科目_必須"] + totals["系科目_選択"] +
                             totals["コース科目_必須"] + totals["コース科目_選択"] +
                             totals["他コース科目_選択"];

    const electiveTotalForCheck = totals["コース科目_選択"] + totals["他コース科目_選択"];

    const checkElective = (cat: string) => {
      const obtained = totals[cat];
      if (cat === "コース科目_選択") return `${obtained} 単位`;
      const limit = this.electiveLimits[cat as keyof typeof this.electiveLimits];
      if (!limit) return `${obtained} 単位`;
      return `${obtained} 単位（${limit.min}〜${limit.max} 単位）`;
    };

    const html = `<div class="card ${specializedTotal >= reqs.specialized && electiveTotalForCheck>=this.electiveLimits["コース科目_選択"].min ? "pass" : "fail"}">
      <h3>専門教育科目</h3>
      <p>専門基礎必須: ${totals["専門基礎科目_必須"]} 単位</p>
      <p>専門基礎選択: ${checkElective("専門基礎科目_選択")}</p>
      <p>系科目必須: ${totals["系科目_必須"]} 単位</p>
      <p>系科目選択: ${checkElective("系科目_選択")}</p>
      <p>コース科目必須: ${totals["コース科目_必須"]} 単位</p>
      <p>コース科目選択: ${checkElective("コース科目_選択")}</p>
      <p>他コース選択: ${checkElective("他コース科目_選択")} (上限 ${this.maxOtherCourseCredits})</p>
      <p>選択単位合計（コース＋他コース）: ${electiveTotalForCheck} / ${this.electiveLimits["コース科目_選択"].min} 単位以上</p>
      <p>合計: ${specializedTotal} / 必要単位: ${reqs.specialized}</p>
      <p>${specializedTotal >= reqs.specialized && electiveTotalForCheck>=this.electiveLimits["コース科目_選択"].min ? "合格" : "不合格"}</p>
    </div>`;

    const totalCredits = specializedTotal + reqs.obtainedGeneralEducation;
    const graduationPass = totalCredits >= 126;
    const htmlGraduation = `<div class="card ${graduationPass ? "pass" : "fail"}">
      <h3>卒業判定</h3>
      <p>合計: ${totalCredits} / 126 単位</p>
      <p>${graduationPass ? "卒業可能" : "卒業不可能"}</p>
    </div>`;

    this.resultDiv.innerHTML = html + htmlGraduation;
  }
}

// 初期化
const requirementsManager = new RequirementsManager();
const courseManager = new CourseManager();
const graduationChecker = new GraduationChecker(requirementsManager, courseManager);

(document.getElementById("addCourse") as HTMLButtonElement).onclick = () => {
  const name = (document.getElementById("courseName") as HTMLInputElement).value.trim();
  const cat = (document.getElementById("courseCategory") as HTMLSelectElement).value;
  const credits = Number((document.getElementById("courseCredits") as HTMLInputElement).value);
  if (!name || credits < 0) return alert("入力不足または負の値です");
  courseManager.addCourse({name, category: cat, credits, completed: false});
};

(document.getElementById("checkAllRequired") as HTMLButtonElement).onclick = () => {
  courseManager.checkAllRequired();
};

(document.getElementById("run") as HTMLButtonElement).onclick = () => {
  graduationChecker.run();
};

// 学科テンプレート読み込み
(document.getElementById("loadTemplate") as HTMLButtonElement).onclick = async () => {
  try {
    const res = await fetch("template_info_engineering_2023.json");
    const data = await res.json();

    requirementsManager["specializedInput"].value = String(Math.max(0, data.categories.reduce((sum: number, c: any) => sum + (c.requiredCredits||0), 0)));
    if (data.generalEducationRequired !== undefined) {
      requirementsManager["generalEduInput"].value = String(Math.max(0, data.generalEducationRequired));
    }

    courseManager["courses"] = [];
    data.categories.forEach((cat: any) => {
      cat.courses.forEach((c: any) => {
        const subCat = c.subCategory || (c.required ? `${cat.name}_必須` : `${cat.name}_選択`);
        courseManager.addCourse({name: c.name, category: subCat, credits: c.credits, completed: false});
      });
    });

    courseManager.save();
    requirementsManager.save();
    courseManager.render();
    alert("学科テンプレートを読み込みました！");
  } catch(e) {
    alert("テンプレートの読み込みに失敗しました");
    console.error(e);
  }
};

// 使い方折りたたみ
(document.getElementById("toggleRules") as HTMLButtonElement).onclick = () => {
  const sec = document.getElementById("rulesSection")!;
  sec.style.display = (sec.style.display === "none") ? "block" : "none";
};
