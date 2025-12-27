export class GraduationChecker {
    constructor(requirements, courses) {
        this.requirements = requirements;
        this.courses = courses;
    }
    calculate() {
        for (const course of this.courses) {
            const req = this.requirements.find(r => r.category === course.category);
            if (req)
                req.addCredits(course.credits);
        }
    }
    getResults() {
        return this.requirements.map(req => ({
            category: req.category,
            earned: req.earnedCredits,
            required: req.requiredCredits,
            passed: req.isSatisfied(),
        }));
    }
    getUnfulfilled() {
        return this.getResults().filter(r => !r.passed);
    }
}
