import { PERSONAL_TYPES, SOLO_VARIANTS } from "../../const/scoring";
import { QUESTION_MAP } from "../questions";
import type { Question, UserAnswers, PersonalTypeProfile, SoloVariant } from "../types";
import type { PersonalResult } from "./types";

export function pickAvatar(profile: PersonalTypeProfile, seed: number): string {
    const options = profile.avatarOptions && profile.avatarOptions.length > 0 ? profile.avatarOptions : [profile.avatar];
    const idx = Math.abs(seed) % options.length;
    return options[idx];
}

export function pickType(score: { distance: number; initiative: number; security: number; affection: number }): PersonalTypeProfile {
    // 距離感: 負が「近い」、正が「距離を取りたい」
    const closeness = -score.distance;

    if (score.affection >= 2 || (closeness >= 2 && score.affection >= 1)) {
        return PERSONAL_TYPES[3]; // スキンシップ型
    }
    if (score.initiative >= 2) {
        return PERSONAL_TYPES[2]; // リード型
    }
    if (score.distance >= 2) {
        return PERSONAL_TYPES[1]; // マイペース型
    }
    return PERSONAL_TYPES[0]; // ハーモニー型
}

export function calculatePersonalResult(answers: UserAnswers): PersonalResult {
    const baseScore = accumulateScoreForAnswers(answers.answers, (q) => q.id < 200);
    const type = pickType(baseScore);

    const axisOrder: Array<keyof typeof baseScore> = ['distance', 'initiative', 'security', 'affection'];
    const rankedAxes = [...axisOrder].sort((a, b) => Math.abs(baseScore[b]) - Math.abs(baseScore[a]));
    const topAxis = rankedAxes[0];
    const secondAxis = rankedAxes[1];

    const signForAxis = (axis: keyof typeof baseScore): 'pos' | 'neg' => {
        const answeredFollowup = Object.entries(answers.answers)
            .map(([id, val]) => {
                const q = QUESTION_MAP.get(Number(id));
                if (!q || !q.focus || q.id < 200) return null;
                const opt = q.options.find((o) => o.value === val);
                if (!opt) return null;
                return { axis: q.focus, score: opt.score[q.focus] ?? 0 };
            })
            .filter((item) => item !== null && (item as any).axis === axis) as Array<{ axis: typeof axis; score: number }>;
        const followScore = answeredFollowup[0]?.score;
        if (followScore !== undefined) return followScore >= 0 ? 'pos' : 'neg';
        const baseVal = baseScore[axis];
        return baseVal >= 0 ? 'pos' : 'neg';
    };

    const sign1 = signForAxis(topAxis);
    const sign2 = signForAxis(secondAxis);
    const variantId = `${type.id}-${sign1}-${sign2}` as SoloVariant;
    const variantProfile = SOLO_VARIANTS[variantId];

    return { typeId: type.id, type, score: baseScore, variantId, variantProfile };
}

function accumulateScoreForAnswers(
    answerMap: Record<number, number>,
    filter?: (q: Question) => boolean,
) {
    const score = {
        distance: 0,
        initiative: 0,
        security: 0,
        affection: 0,
    };

    Object.entries(answerMap).forEach(([qId, aVal]) => {
        const question: Question | undefined = QUESTION_MAP.get(Number(qId));
        if (!question) return;
        if (filter && !filter(question)) return;
        const option = question.options.find((o) => o.value === aVal);
        if (!option) return;
        score.distance += option.score.distance ?? 0;
        score.initiative += option.score.initiative ?? 0;
        score.security += option.score.security ?? 0;
        score.affection += option.score.affection ?? 0;
    });

    return score;
}

export function calculateScoreVector(answerMap: Record<number, number>) {
    return accumulateScoreForAnswers(answerMap);
}
