"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCredits = checkCredits;
function checkCredits(requirements, courses) {
    const result = {};
    for (const req of requirements) {
        const sum = courses
            .filter(c => c.category === req.category)
            .reduce((acc, c) => acc + c.credits, 0);
        result[req.category] = sum;
    }
    return result;
}
