import { InterviewQuestion } from './interview-schema.js';

export class AnswerNormalizer {
    normalize(question: InterviewQuestion, rawAnswer: any): any {
        if (rawAnswer === undefined || rawAnswer === null) return undefined;

        switch (question.answerType) {
            case 'boolean':
                return this.normalizeBoolean(rawAnswer);
            case 'number':
                return this.normalizeNumber(rawAnswer);
            case 'list':
                return this.normalizeList(rawAnswer);
            case 'single_select':
            case 'single_select_or_text':
                return this.normalizeSingleSelect(question, rawAnswer);
            case 'multi_select':
                return this.normalizeMultiSelect(question, rawAnswer);
            default:
                return rawAnswer;
        }
    }

    private normalizeBoolean(value: any): boolean | undefined {
        if (typeof value === 'boolean') return value;
        const s = String(value).toLowerCase().trim();
        if (['true', 'yes', 'y', '1', 'on'].includes(s)) return true;
        if (['false', 'no', 'n', '0', 'off'].includes(s)) return false;
        return undefined;
    }

    private normalizeNumber(value: any): number | undefined {
        if (typeof value === 'number') return value;
        const n = Number(value);
        return isNaN(n) ? undefined : n;
    }

    private normalizeList(value: any): string[] {
        if (Array.isArray(value)) return value.map(v => String(v).trim());
        if (typeof value === 'string') {
            return value.split(/[,;\n]/).map(v => v.trim()).filter(v => v.length > 0);
        }
        return [String(value).trim()];
    }

    private normalizeSingleSelect(question: InterviewQuestion, value: any): string | undefined {
        const s = String(value).trim();
        if (question.options?.includes(s)) return s;
        if (question.answerType === 'single_select_or_text') return s;

        // Fuzzy match if options exist
        if (question.options) {
            const match = question.options.find(o => o.toLowerCase() === s.toLowerCase());
            if (match) return match;
        }
        return undefined;
    }

    private normalizeMultiSelect(question: InterviewQuestion, value: any): string[] {
        const list = this.normalizeList(value);
        if (!question.options) return list;
        return list.filter(item => question.options!.some(o => o.toLowerCase() === item.toLowerCase()));
    }
}
