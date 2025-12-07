import { QUESTION_MAP } from './questions';
import type {
    PairView,
    PersonalTypeProfile,
    Question,
    UserAnswers,
    SoloVariant,
    SoloVariantProfile,
    DuoVariant,
    DuoVariantProfile,
} from './types';

export interface PersonalResult {
    typeId: number;
    type: PersonalTypeProfile;
    score: {
        distance: number;
        initiative: number;
        security: number;
        affection: number;
    };
    variantId?: SoloVariant;
    variantProfile?: SoloVariantProfile;
}

export interface PairResult {
    resultId: number;
    keyMatch: boolean;
    typeA: number;
    typeB: number;
    viewA: PairView;
    viewB: PairView;
    duoVariant?: DuoVariant;
}

const PERSONAL_TYPES: PersonalTypeProfile[] = [
    {
        id: 1,
        name: 'ハーモニー型',
        headline: '相手とのバランスを大切にする調整上手',
        avatar: 'フェネック・ナビゲーター',
        avatarOptions: [
            'フェネック・ナビゲーター',
            'カモシカ・ハーモナイザー',
            'パフィン・コンダクター',
            'フェネック・シールド',
        ],
        strengths: ['空気を読む', '相手のペースに合わせる', '衝突を避ける'],
        caution: '自分の希望が薄まりやすいのでたまに主張を',
    },
    {
        id: 2,
        name: 'マイペース型',
        headline: '自分の時間を持つことで安心する',
        avatar: 'コアラ・ガーディアン',
        avatarOptions: [
            'コアラ・ガーディアン',
            'パンダ・ポケットタイム',
            'スロース・ドリフター',
            'オッター・カームキャリー',
        ],
        strengths: ['相手に自由を与える', '冷静な判断', '相手を縛らない'],
        caution: '距離を置きすぎると「興味がない」と誤解されがち',
    },
    {
        id: 3,
        name: 'リード型',
        headline: '段取りと決断で関係を前に進める',
        avatar: 'ホーク・ドライバー',
        avatarOptions: [
            'ホーク・ドライバー',
            'ウルフ・クエストリーダー',
            'ライオン・スタープランナー',
            'ファルコン・セーフプランナー',
        ],
        strengths: ['行動力', '提案力', '頼れる存在'],
        caution: '相手のペースを置き去りにしない呼吸を',
    },
    {
        id: 4,
        name: 'スキンシップ型',
        headline: '感情を表に出し、温度感を共有したい',
        avatar: 'キャット・グロウテイマー',
        avatarOptions: [
            'キャット・グロウテイマー',
            'フォックス・フレンドリーフレア',
            'オッター・エンゲージダイブ',
            'リンクス・クールバランス',
        ],
        strengths: ['表現力', '共感の厚さ', '距離を縮める早さ'],
        caution: '求める距離感が高すぎると相手が驚くかも',
    },
];

const PERSONAL_TYPE_MAP = new Map(PERSONAL_TYPES.map((t) => [t.id, t]));

function pickAvatar(profile: PersonalTypeProfile, seed: number): string {
    const options = profile.avatarOptions && profile.avatarOptions.length > 0 ? profile.avatarOptions : [profile.avatar];
    const idx = Math.abs(seed) % options.length;
    return options[idx];
}

const HOST_BONUS_TIPS: Record<number, string> = {
    1: '※あなたへ: 相手は調整派。日程や場所は「A案/B案」を先に示すと安心されます',
    2: '※あなたへ: 相手はマイペース型。余裕のある日を一緒にキープしてもらう案が効果的',
    3: '※あなたへ: 相手はリード派。テーマだけ共有して、段取りは相手に任せるとスムーズ',
    4: '※あなたへ: 相手はスキンシップ型。場の雰囲気づくりをあなたがリードすると喜ばれます',
};

const SOLO_VARIANTS: Record<SoloVariant, SoloVariantProfile> = {
    '1-pos-pos': {
        id: '1-pos-pos',
        label: 'フェネック・ナビゲーター',
        description: 'ハーモニー型＋近い×前向き。相手の温度を素早く読み取り、会話のリズムも場の空気も柔らかく整える生粋の調整役。困ったときには自然と橋渡しをして場を丸く収められる。',
        avatar: 'フェネック・ナビゲーター',
    },
    '1-pos-neg': {
        id: '1-pos-neg',
        label: 'カモシカ・ハーモナイザー',
        description: 'ハーモニー型＋近い×慎重。静かに相手の気配を感じ取り、過度に踏み込まず寄り添うサポーター。慎重さゆえに安心感を与え、信頼を積み上げるタイプ。',
        avatar: 'カモシカ・ハーモナイザー',
    },
    '1-neg-pos': {
        id: '1-neg-pos',
        label: 'パフィン・コンダクター',
        description: 'ハーモニー型＋距離×前向き。適度な距離を保ちながら全体を俯瞰し、さりげなく流れを整えるコーディネーター。場を明るくする一言を差し込むのが得意。',
        avatar: 'パフィン・コンダクター',
    },
    '1-neg-neg': {
        id: '1-neg-neg',
        label: 'フェネック・シールド',
        description: 'ハーモニー型＋距離×慎重。安全第一で動き、周囲が落ち着くまで環境を整える守護的存在。リスクを減らし、安心な場づくりに徹するプロテクター。',
        avatar: 'フェネック・シールド',
    },

    '2-pos-pos': {
        id: '2-pos-pos',
        label: 'コアラ・ガーディアン',
        description: 'マイペース型＋近い×前向き。穏やかで親しみやすく、相手が安心して甘えられるクッション役。緩やかなペースでも一緒に楽しめる余白を作るのが上手。',
        avatar: 'コアラ・ガーディアン',
    },
    '2-pos-neg': {
        id: '2-pos-neg',
        label: 'パンダ・ポケットタイム',
        description: 'マイペース型＋近い×慎重。小さな輪を大事にするホーム型。静かな時間を共有しながら、相手の疲れをふっと和らげるような優しい間合いを作る。',
        avatar: 'パンダ・ポケットタイム',
    },
    '2-neg-pos': {
        id: '2-neg-pos',
        label: 'スロース・ドリフター',
        description: 'マイペース型＋距離×前向き。自分時間をしっかり確保しつつ、誘われれば柔らかく応じる自由人。束縛しないスタンスで、相手に安心感を与える。',
        avatar: 'スロース・ドリフター',
    },
    '2-neg-neg': {
        id: '2-neg-neg',
        label: 'オッター・カームキャリー',
        description: 'マイペース型＋距離×慎重。静かに見守りながら、必要なときだけそっと支えるシェルター役。無理に踏み込まず、相手のペースを最大限尊重する。',
        avatar: 'オッター・カームキャリー',
    },

    '3-pos-pos': {
        id: '3-pos-pos',
        label: 'ホーク・ドライバー',
        description: 'リード型＋近い×前向き。段取りと意思決定が速く、チームの推進力になれる攻めのリーダー。周囲を巻き込みながらゴールに向けて引っ張るエンジン。',
        avatar: 'ホーク・ドライバー',
    },
    '3-pos-neg': {
        id: '3-pos-neg',
        label: 'ウルフ・クエストリーダー',
        description: 'リード型＋近い×慎重。相手を立てつつ舵を取るバランス型リーダー。合意形成や根回しも得意で、みんなが乗りやすい船を静かに作るタイプ。',
        avatar: 'ウルフ・クエストリーダー',
    },
    '3-neg-pos': {
        id: '3-neg-pos',
        label: 'ライオン・スタープランナー',
        description: 'リード型＋距離×前向き。少し距離を置きつつ計画を描く戦略家。全体像を示しながら、必要なときだけ前に出てアクセルを踏むスマートな指揮役。',
        avatar: 'ライオン・スタープランナー',
    },
    '3-neg-neg': {
        id: '3-neg-neg',
        label: 'ファルコン・セーフプランナー',
        description: 'リード型＋距離×慎重。安全マージンをしっかり取り、リスクを潰しながら進める堅実なリーダー。準備とバックアップを重視し、安心感を提供する。',
        avatar: 'ファルコン・セーフプランナー',
    },

    '4-pos-pos': {
        id: '4-pos-pos',
        label: 'キャット・グロウテイマー',
        description: 'スキンシップ型＋近い×前向き。感情表現が豊かで、場を一気に温めるムードメーカー。愛情をストレートに伝え、相手の心を明るく灯す。',
        avatar: 'キャット・グロウテイマー',
    },
    '4-pos-neg': {
        id: '4-pos-neg',
        label: 'フォックス・フレンドリーフレア',
        description: 'スキンシップ型＋近い×慎重。そっと寄り添い、安心できる密度で温度感を合わせる包容力タイプ。相手の反応を見ながら柔らかく距離を縮める。',
        avatar: 'フォックス・フレンドリーフレア',
    },
    '4-neg-pos': {
        id: '4-neg-pos',
        label: 'オッター・エンゲージダイブ',
        description: 'スキンシップ型＋距離×前向き。開放的で、心地よい距離を探りながら関わるダイバー。時に大胆に飛び込み、時に引いて呼吸を合わせる柔軟さを持つ。',
        avatar: 'オッター・エンゲージダイブ',
    },
    '4-neg-neg': {
        id: '4-neg-neg',
        label: 'リンクス・クールバランス',
        description: 'スキンシップ型＋距離×慎重。温度差を丁寧に測りながら、ほどよい距離で見守るクールなケアタイプ。相手が構えずに安心できるスペースを作る。',
        avatar: 'リンクス・クールバランス',
    },
};

const DUO_VARIANTS: Record<DuoVariant, DuoVariantProfile> = {
    'sync-strong': {
        id: 'sync-strong',
        title: 'DUO: シンク・ブースト',
        message: '軸ががっちり一致。テンポも距離感も揃いやすい黄金タッグ。得意が重なるので短期の行動力も抜群。二人で一気に加速するなら、この「揃っている強さ」を武器に。',
        tips: ['共通の得意軸を最初に活かす', '予定決めはテンポ良く一気に', '高まるときこそ休憩ポイントを挟む', '勢いで決めた後のフォローアップ日程をセットする'],
    },
    'sync-soft': {
        id: 'sync-soft',
        title: 'DUO: シンク・ソフト',
        message: '方向性は揃っていて穏やか。大きな衝突は起きづらいものの、小さなズレが積み重なるとモヤモヤに。早めの共有と「ちょうどいい」を探る会話が鍵。',
        tips: ['ペース確認をこまめに', '小さいプランから一緒に試す', 'スキンシップ/距離の好みを先出し', '合意したことを簡単にメモしておく'],
    },
    'complement-active': {
        id: 'complement-active',
        title: 'DUO: コンプリ・スパーク',
        message: '得意と不得意が補完関係。役割を決めれば爆発力が出るコンビ。主導とサポートを適度に入れ替え、相手の強みを引き出すと大きく前進。',
        tips: ['段取り役とアイデア役を分ける', '合意形成のタイミングを決めておく', '「ここは任せる」宣言を活用', '決め役をローテーションして公平感を保つ'],
    },
    'complement-gentle': {
        id: 'complement-gentle',
        title: 'DUO: コンプリ・ジェントル',
        message: 'ゆるやかに補完し合うペア。派手さはないが居心地の良さが強み。小さくリードを回し合うと、無理なく長続きする関係に育つ。',
        tips: ['小さなタスクで試してから大事を決める', '感じた不安は早めに共有', 'ペースダウンもOKと伝えておく', '相手の「やりやすい環境」を確認して整える'],
    },
    'contrast-explore': {
        id: 'contrast-explore',
        title: 'DUO: コントラスト・エクスプローラ',
        message: '価値観の差が大きく、刺激と発見に満ちた探究型。違いをテーマ化して「実験」する姿勢が楽しさを増す。結論を急がず、旅の途中を味わうスタイルがおすすめ。',
        tips: ['週1で「違いトーク」時間を作る', 'お互いのやり方を試し合う', '結論を急がずプロセスを楽しむ', '違いをゲーム的に楽しむルールを決める'],
    },
    'contrast-guard': {
        id: 'contrast-guard',
        title: 'DUO: コントラスト・ガード',
        message: 'ズレが大きいときは守りからスタート。境界線を先に明示し、安心できる枠組みを作れば徐々に歩み寄れる。慎重な橋渡しで信頼を積むペア。',
        tips: ['NG/OKゾーンを先に共有', 'こまめな温度確認', 'スモールステップで進行', '困ったときの「合図」を決めておく'],
    },
    'drift-stable': {
        id: 'drift-stable',
        title: 'DUO: ドリフト・ステディ',
        message: 'どちらかのペースが強めに出やすい組み合わせ。リード側が「待つ合図」を持ち、受け側は希望を短く伝える練習をすると、走りと休みのバランスが安定。',
        tips: ['リード側は一呼吸置く合図を決める', '受け側は希望を短く伝える練習', '週1の振り返りで調整', '決定事項を簡潔に共有しておく'],
    },
    'drift-bridge': {
        id: 'drift-bridge',
        title: 'DUO: ドリフト・ブリッジ',
        message: '離れがちなペースを橋渡しするタイプ。中間案や第三案をストックし、どちらかに寄りすぎない合意点を見つけると安心感が生まれる。',
        tips: ['選択肢を3つ用意してから決める', '「ここだけ譲ってほしい」を具体的に伝える', '休憩ポイントをあらかじめ設定', 'お互いの優先順位を事前に並べてから決定する'],
    },
};

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

export function getSoloVariantProfile(id: SoloVariant): SoloVariantProfile | undefined {
    return SOLO_VARIANTS[id];
}

export function getDuoVariantProfile(id: DuoVariant): DuoVariantProfile | undefined {
    return DUO_VARIANTS[id];
}

export const SOLO_VARIANT_LIST: SoloVariantProfile[] = Object.values(SOLO_VARIANTS);
export const DUO_VARIANT_LIST: DuoVariantProfile[] = Object.values(DUO_VARIANTS);

function determineDuoVariant(
    host: PersonalResult,
    guest: PersonalResult,
): DuoVariant {
    const axes: Array<keyof typeof host.score> = ['distance', 'initiative', 'security', 'affection'];
    const rankedHostAxes = [...axes].sort((a, b) => Math.abs(host.score[b]) - Math.abs(host.score[a]));
    const top3 = rankedHostAxes.slice(0, 3);

    const guestScore = guest.score;
    const matchCount = top3.reduce((acc, axis) => {
        const signHost = host.score[axis] >= 0 ? 1 : -1;
        const signGuest = guestScore[axis] >= 0 ? 1 : -1;
        return acc + (signHost === signGuest ? 1 : 0);
    }, 0);
    const diffSum = top3.reduce((acc, axis) => acc + Math.abs(host.score[axis] - guestScore[axis]), 0);

    if (matchCount >= 2) {
        if (diffSum <= 6) return 'sync-strong';
        return 'sync-soft';
    }

    if (matchCount === 1) {
        const initGap = Math.abs(host.score.initiative - guestScore.initiative);
        return initGap >= 4 ? 'complement-active' : 'complement-gentle';
    }

    // matchCount === 0
    const distanceGap = Math.abs(host.score.distance - guestScore.distance);
    const securityGap = Math.abs(host.score.security - guestScore.security);
    const initiativeGap = Math.abs(host.score.initiative - guestScore.initiative);

    if (diffSum >= 12) {
        return securityGap >= distanceGap ? 'contrast-guard' : 'contrast-explore';
    }

    return initiativeGap >= 4 ? 'drift-bridge' : 'drift-stable';
}
