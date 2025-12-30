// JsonValidatorBrowser.ts
export class JsonValidatorBrowser {
    validate(data) {
        if (!data.requirements || !Array.isArray(data.requirements)) {
            throw new Error("'requirements' 配列が存在しません");
        }
        if (!data.courses || !Array.isArray(data.courses)) {
            throw new Error("'courses' 配列が存在しません");
        }
        for (const r of data.requirements) {
            if (typeof r.category !== "string" || typeof r.requiredCredits !== "number") {
                throw new Error("requirements の要素が不正です: " + JSON.stringify(r));
            }
        }
        for (const c of data.courses) {
            if (typeof c.name !== "string" || typeof c.category !== "string" || typeof c.credits !== "number") {
                throw new Error("courses の要素が不正です: " + JSON.stringify(c));
            }
        }
    }
    validateFromJsonText(jsonText) {
        const data = JSON.parse(jsonText);
        this.validate(data);
        const results = data.requirements.map((r) => {
            const sum = data.courses
                .filter((c) => c.category === r.category)
                .reduce((acc, c) => acc + c.credits, 0);
            return {
                category: r.category,
                required: r.requiredCredits,
                earned: sum,
                passed: sum >= r.requiredCredits
            };
        });
        return { results, rawData: data };
    }
}
// ブラウザ用にグローバルに公開
// @ts-ignore
window.JsonValidatorBrowser = JsonValidatorBrowser;
