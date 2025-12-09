import { HOST_BONUS_TIPS, PERSONAL_TYPE_MAP } from "../../const/scoring";
import { determineDuoVariant } from "./matching";
import { calculatePersonalResult, pickAvatar } from "./personal";
import type { PairResult } from "./types";
import type { PairView, PersonalTypeProfile, UserAnswers } from "../types";

function encodeResultId(typeA: number, typeB: number, keyMatch: boolean): number {
    // 1xxx: key match, 2xxx: mismatch
    return (keyMatch ? 1000 : 2000) + typeA * 10 + typeB;
}

export function decodeResultId(resultId: number): { keyMatch: boolean; typeA: number; typeB: number } {
    const keyMatch = resultId < 2000;
    const remainder = resultId % 1000;
    const typeA = Math.floor(remainder / 10);
    const typeB = remainder % 10;
    return { keyMatch, typeA, typeB };
}

function ownerBonusTip(partner: PersonalTypeProfile, keyMatch: boolean, isOwner: boolean): string | null {
    if (!isOwner) return null;
    if (!keyMatch) return null;

    return HOST_BONUS_TIPS[partner.id] ?? '※あなたへ: 次の一歩の声かけは、招待したあなたがリードするとスムーズ';
}

function buildView(
    self: PersonalTypeProfile,
    partner: PersonalTypeProfile,
    selfAvatar: string,
    partnerAvatar: string,
    keyMatch: boolean,
    isOwner = false,
): PairView {
    const ownerBonus = ownerBonusTip(partner, keyMatch, isOwner);
    const firstTip = keyMatch
        ? '特別質問が一致しているので、素直な気持ちをシェアすると一気に距離が縮まる'
        : 'お互いの「大事にしたい感覚」を先に共有してからプランを立てると安心度が上がる';
    return {
        title: `DUO: ${selfAvatar} × ${partnerAvatar}`,
        message: `${partner.headline}。あなた（${selfAvatar}）と相手（${partnerAvatar}）の相性ポイントをまとめました。`,
        tips: [
            firstTip,
            `相手は「${partner.strengths[0]}」が得意。そこを尊重しつつ、あなたの強み「${self.strengths[0]}」を活かしてバランスを取ろう`,
            `注意点: ${partner.caution}`,
            ...(ownerBonus ? [ownerBonus] : []),
        ],
    };
}

export function calculatePairResult(answersA: UserAnswers, answersB: UserAnswers): PairResult {
    const personalA = calculatePersonalResult(answersA);
    const personalB = calculatePersonalResult(answersB);

    const hasKeyA = answersA.keyQuestionId !== undefined && answersA.keyAnswerValue !== undefined;
    const hasKeyB = answersB.keyQuestionId !== undefined && answersB.keyAnswerValue !== undefined;
    const keyMatch = hasKeyA && hasKeyB
        ? answersA.keyQuestionId === answersB.keyQuestionId && answersA.keyAnswerValue === answersB.keyAnswerValue
        : false;

    const resultId = encodeResultId(personalA.typeId, personalB.typeId, keyMatch);

    const avatarA = personalA.variantProfile?.avatar ?? pickAvatar(personalA.type, resultId);
    const avatarB = personalB.variantProfile?.avatar ?? pickAvatar(personalB.type, resultId + 7);

    const viewA = buildView(personalA.type, personalB.type, avatarA, avatarB, keyMatch, true);
    const viewB = buildView(personalB.type, personalA.type, avatarB, avatarA, keyMatch, false);

    const duoVariant = determineDuoVariant(personalA, personalB);

    return {
        resultId,
        keyMatch,
        typeA: personalA.typeId,
        typeB: personalB.typeId,
        viewA,
        viewB,
        duoVariant,
    };
}

export function buildPairViewFromResult(resultId: number, view: 'A' | 'B'): PairView {
    const { keyMatch, typeA, typeB } = decodeResultId(resultId);
    const self = view === 'A' ? PERSONAL_TYPE_MAP.get(typeA)! : PERSONAL_TYPE_MAP.get(typeB)!;
    const partner = view === 'A' ? PERSONAL_TYPE_MAP.get(typeB)! : PERSONAL_TYPE_MAP.get(typeA)!;
    const selfAvatar = pickAvatar(self, resultId + (view === 'A' ? 0 : 7));
    const partnerAvatar = pickAvatar(partner, resultId + (view === 'A' ? 7 : 0));
    return buildView(self, partner, selfAvatar, partnerAvatar, keyMatch, view === 'A');
}

export function getPersonalProfilesFromResult(resultId: number, view: 'A' | 'B') {
    const { typeA, typeB } = decodeResultId(resultId);
    const self = (view === 'A' ? PERSONAL_TYPE_MAP.get(typeA) : PERSONAL_TYPE_MAP.get(typeB))!;
    const partner = (view === 'A' ? PERSONAL_TYPE_MAP.get(typeB) : PERSONAL_TYPE_MAP.get(typeA))!;
    const selfAvatar = pickAvatar(self, resultId + (view === 'A' ? 0 : 7));
    const partnerAvatar = pickAvatar(partner, resultId + (view === 'A' ? 7 : 0));
    return { self, partner, selfAvatar, partnerAvatar };
}
