// ===== 型定義 =====
type Course = {
  name: string;
  category: string;
  credits: number;
  completed: boolean;
  hidden: boolean;
};

// テンプレート用型
interface TemplateCourse {
  name: string;
  credits: number;
  required?: boolean;
}

interface TemplateCategory {
  id: string;
  name: string;
  requiredCredits: number;
  courses: TemplateCourse[];
}

interface TemplateData {
  department: string;
  version: string;
  categories: TemplateCategory[];
}

// ===== DOM =====
const reqSpecializedInput = document.getElementById("reqSpecialized") as HTMLInputElement;
const reqGeneralInput = document.getElementById("reqGeneral") as HTMLInputElement;
const reqLiberalInput = document.getElementById("reqLiberal") as HTMLInputElement; // 教養追加
const courseNameInput = document.getElementById("courseName") as HTMLInputElement;
const courseCategorySelect = document.getElementById("courseCategory") as HTMLSelectElement;
const courseCreditsInput = document.getElementById("courseCredits") as HTMLInputElement;
const addCourseButton = document.getElementById("addCourse")!;
const courseTableBody = document.querySelector("#courseTable tbody")!;
const runButton = document.getElementById("run")!;
const output = document.getElementById("result")!;
const searchInput = document.getElementById("searchInput") as HTMLInputElement;
const loadTemplateButton = document.getElementById("loadTemplate")!;

let courses: Course[] = [];

// ===== 保存・復元 =====
function saveData() {
  localStorage.setItem("courses", JSON.stringify(courses));
  localStorage.setItem("reqSpecialized", reqSpecializedInput.value);
  localStorage.setItem("reqGeneral", reqGeneralInput.value);
  localStorage.setItem("reqLiberal", reqLiberalInput.value);
}

function loadData() {
  const saved = localStorage.getItem("courses");
  if (saved) courses = JSON.parse(saved);

  reqSpecializedInput.value = localStorage.getItem("reqSpecialized") ?? "0";
  reqGeneralInput.value = localStorage.getItem("reqGeneral") ?? "0";
  reqLiberalInput.value = localStorage.getItem("reqLiberal") ?? "30"; // 教養初期値
}

// ===== 表示 =====
function renderCourseTable() {
  courseTableBody.innerHTML = "";
  const keyword = searchInput.value.toLowerCase();

  courses.forEach((c, i) => {
    if (c.hidden) return;
    if (keyword && !c.name.toLowerCase().includes(keyword)) return;

    const tr = document.createElement("tr");

    const checkTd = document.createElement("td");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = c.completed;
    checkbox.onchange = () => { c.completed = checkbox.checked; saveData(); };
    checkTd.appendChild(checkbox);

    const nameTd = document.createElement("td"); nameTd.textContent = c.name;
    const catTd = document.createElement("td"); catTd.textContent = c.category;
    const creditTd = document.createElement("td"); creditTd.textContent = String(c.credits);

    const delTd = document.createElement("td");
    const delBtn = document.createElement("button");
    delBtn.textContent = "削除";
    delBtn.onclick = () => { c.hidden = true; saveData(); renderCourseTable(); };
    delTd.appendChild(delBtn);

    tr.append(checkTd, nameTd, catTd, creditTd, delTd);
    courseTableBody.appendChild(tr);
  });
}

// ===== 科目追加 =====
addCourseButton.addEventListener("click", () => {
  const name = courseNameInput.value.trim();
  const category = courseCategorySelect.value;
  const credits = Number(courseCreditsInput.value);

  if (!name || !credits) { alert("科目名と単位を入力してください"); return; }

  courses.push({ name, category, credits, completed: false, hidden: false });
  courseNameInput.value = ""; courseCreditsInput.value = "";
  saveData(); renderCourseTable();
});

// ===== 検索 =====
searchInput.addEventListener("input", renderCourseTable);

// ===== 判定 =====
runButton.addEventListener("click", () => {
  const reqS = Number(reqSpecializedInput.value);
  const reqG = Number(reqGeneralInput.value);
  const reqL = Number(reqLiberalInput.value);

  let s = 0, g = 0, l = reqL; // 教養は初期値
  courses.forEach(c => {
    if (!c.completed) return;
    if (c.category === "必須") s += c.credits;
    if (c.category === "選択") g += c.credits;
  });

  const sRate = reqS ? Math.min(100, (s / reqS) * 100) : 0;
  const gRate = reqG ? Math.min(100, (g / reqG) * 100) : 0;
  const lRate = reqL ? Math.min(100, (l / reqL) * 100) : 0;

  output.innerHTML = `
    <div class="card ${s >= reqS ? "pass" : "fail"}">
      <h3>必須</h3><p>${s} / ${reqS}</p>
      <div class="progress-box"><div class="progress-bar" style="width:${sRate}%"></div></div>
    </div>
    <div class="card ${g >= reqG ? "pass" : "fail"}">
      <h3>選択</h3><p>${g} / ${reqG}</p>
      <div class="progress-box"><div class="progress-bar" style="width:${gRate}%"></div></div>
    </div>
    <div class="card ${l >= reqL ? "pass" : "fail"}">
      <h3>教養</h3><p>${l} / ${reqL}</p>
      <div class="progress-box"><div class="progress-bar" style="width:${lRate}%"></div></div>
    </div>
  `;
});

// ===== 学科テンプレート読み込み =====
loadTemplateButton.addEventListener("click", async () => {
  try {
    const res = await fetch("template_info_engineering_2024.json");
    const data: TemplateData = await res.json();

    // 必要単位を自動セット
    const specializedCredits = data.categories.find(c => c.id === "specialized")?.requiredCredits ?? 0;
    const generalCredits = data.categories.find(c => c.id === "foundation")?.requiredCredits ?? 0;

    reqSpecializedInput.value = String(specializedCredits);
    reqGeneralInput.value = String(generalCredits);
    reqLiberalInput.value = "30"; // 教養は固定30単位

    // 科目を平らな配列に展開
    courses = [];
    data.categories.forEach((cat: TemplateCategory) => {
      cat.courses.forEach((c: TemplateCourse) => {
        courses.push({ name: c.name, category: cat.id === "specialized" ? "必須" : "選択", credits: c.credits, completed: false, hidden: false });
      });
    });

    saveData(); renderCourseTable();
    alert("学科テンプレートを読み込みました！");
  } catch (e) {
    console.error(e);
    alert("テンプレートの読み込みに失敗しました");
  }
});

// ===== 初期化 =====
loadData();
renderCourseTable();
