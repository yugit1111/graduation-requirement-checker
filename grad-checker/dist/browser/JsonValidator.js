export class JsonValidator {
    validateFromObject(data) {
        if (typeof data !== "object" || data === null) {
            return { ok: false, error: "JSON がオブジェクトではありません" };
        }
        const obj = data;
        if (!Array.isArray(obj.requirements)) {
            return { ok: false, error: "requirements が配列ではありません" };
        }
        if (!Array.isArray(obj.courses)) {
            return { ok: false, error: "courses が配列ではありません" };
        }
        for (const r of obj.requirements) {
            if (typeof r.category !== "string" ||
                typeof r.requiredCredits !== "number") {
                return {
                    ok: false,
                    error: "requirements の要素が不正です",
                };
            }
        }
        for (const c of obj.courses) {
            if (typeof c.name !== "string" ||
                typeof c.category !== "string" ||
                typeof c.credits !== "number") {
                return {
                    ok: false,
                    error: "courses の要素が不正です",
                };
            }
        }
        return {
            ok: true,
            value: obj,
        };
    }
}
