import type { Question, KeyQuestion } from './types';

export const BASE_QUESTIONS: Question[] = [
    {
        id: 1,
        text: '週末のデート、理想の過ごし方は？',
        options: [
            { value: 1, text: '一緒にのんびりお家デート', score: { distance: -2, security: 2 } },
            { value: 2, text: '近所で軽くカフェめぐり・散歩', score: { distance: -1, security: 1 } },
            { value: 3, text: '話題のスポットへおでかけ', score: { distance: 0, initiative: 1 } },
            { value: 4, text: '予定を立てて遠出する', score: { distance: 1, initiative: 1 } },
            { value: 5, text: '別行動で各々の趣味を満喫', score: { distance: 2, initiative: -1 } },
        ],
    },
    {
        id: 2,
        text: '連絡の頻度、どれくらいが心地いい？',
        options: [
            { value: 1, text: 'こまめに随時メッセージしたい', score: { distance: -2, affection: 1 } },
            { value: 2, text: '1日数回やりとりしたい', score: { distance: -1, security: 1 } },
            { value: 3, text: '朝と夜の挨拶くらいがちょうどいい', score: { distance: 0, security: 1 } },
            { value: 4, text: '用事があるときだけでOK', score: { distance: 1, initiative: -1 } },
            { value: 5, text: 'ほぼ連絡なしでも平気', score: { distance: 2, initiative: -1 } },
        ],
    },
    {
        id: 3,
        text: '相手が落ち込んでいるとき、どうする？',
        options: [
            { value: 1, text: 'すぐに会ってとことん話を聞く', score: { security: 2, affection: 1 } },
            { value: 2, text: '電話などでじっくり寄り添う', score: { security: 1, affection: 1 } },
            { value: 3, text: '美味しいご飯に連れていく', score: { initiative: 1, affection: 1 } },
            { value: 4, text: '励ましつつ距離はキープ', score: { distance: 1, security: -1 } },
            { value: 5, text: 'そっとしておいて見守る', score: { distance: 2, security: -1 } },
        ],
    },
    {
        id: 4,
        text: '記念日のプレゼント、どう決める？',
        options: [
            { value: 1, text: 'サプライズをがっつり準備', score: { initiative: 2, affection: 2 } },
            { value: 2, text: '軽めのサプライズ＋事前リサーチ', score: { initiative: 1, affection: 1 } },
            { value: 3, text: '一緒に買いに行く', score: { distance: -1, security: 1 } },
            { value: 4, text: '欲しいものをリクエストし合う', score: { initiative: -1, security: 2 } },
            { value: 5, text: '特に決めずお互い自由に', score: { distance: 1, initiative: -1 } },
        ],
    },
    {
        id: 5,
        text: '喧嘩をしてしまったら？',
        options: [
            { value: 1, text: 'すぐ謝って仲直りしたい', score: { initiative: -1, security: 2 } },
            { value: 2, text: '少し時間を置いてから謝る', score: { distance: 0, security: 1 } },
            { value: 3, text: 'お互い落ち着いて話し合う', score: { distance: 0, initiative: 1 } },
            { value: 4, text: 'しばらく距離を置いて整理する', score: { distance: 1, initiative: 1 } },
            { value: 5, text: '話題にせず流す', score: { distance: 2, security: -1 } },
        ],
    },
    {
        id: 6,
        text: '愛情表現は？',
        options: [
            { value: 1, text: 'よく言葉で伝える', score: { affection: 2, initiative: 1 } },
            { value: 2, text: '言葉＋行動でバランス派', score: { affection: 1, initiative: 0 } },
            { value: 3, text: '行動多め・言葉少なめ', score: { affection: 1, initiative: -1 } },
            { value: 4, text: 'たまに照れながら伝える', score: { affection: 0, distance: 0 } },
            { value: 5, text: 'かなり控えめ', score: { affection: -1, distance: 1 } },
        ],
    },
    {
        id: 7,
        text: 'デートの行き先が決まらないときは？',
        options: [
            { value: 1, text: '自分で決める力強め', score: { initiative: 2 } },
            { value: 2, text: '自分でいくつか提案する', score: { initiative: 1 } },
            { value: 3, text: '一緒に相談して決める', score: { distance: 0 } },
            { value: 4, text: '相手の案を聞いて決める', score: { initiative: -1 } },
            { value: 5, text: '相手にお任せ', score: { initiative: -2 } },
        ],
    },
    {
        id: 8,
        text: '嫉妬はする？',
        options: [
            { value: 1, text: 'かなり嫉妬する', score: { distance: -2, security: -2 } },
            { value: 2, text: '少し嫉妬する', score: { distance: -1, security: -1 } },
            { value: 3, text: '状況と相手による', score: { distance: 0 } },
            { value: 4, text: 'ほとんどしない', score: { distance: 1, security: 1 } },
            { value: 5, text: '全く気にしない', score: { distance: 2, security: 2 } },
        ],
    },
    {
        id: 9,
        text: '将来の話、いつ頃からしたい？',
        options: [
            { value: 1, text: '早めにしっかり話したい', score: { distance: -2, security: 1 } },
            { value: 2, text: '数か月以内には話したい', score: { distance: -1, security: 1 } },
            { value: 3, text: '1年くらい様子見つつ', score: { distance: 0, security: 0 } },
            { value: 4, text: 'もっと後でゆっくり', score: { distance: 1, initiative: -1 } },
            { value: 5, text: '自然な流れに任せたい', score: { distance: 2, initiative: -1 } },
        ],
    },
    {
        id: 10,
        text: '理想の関係性は？',
        options: [
            { value: 1, text: '親友のような対等さ重視', score: { distance: 0, initiative: 0 } },
            { value: 2, text: 'すごく甘え合える関係', score: { distance: -1, affection: 1 } },
            { value: 3, text: 'しっかり甘やかし甘やかされる', score: { distance: -2, affection: 2 } },
            { value: 4, text: 'お互い刺激し合える関係', score: { distance: 1, initiative: 1 } },
            { value: 5, text: 'それぞれ自立しつつサポートし合う', score: { distance: 2, initiative: 1 } },
        ],
    },
];

export const FOLLOWUP_QUESTION_POOL: Question[] = [
    {
        id: 201,
        text: '旅行の計画はどう決めたい？',
        focus: 'initiative',
        options: [
            { value: 1, text: '自分が主導で決めたい', score: { initiative: 2 } },
            { value: 2, text: '主導したいが相談もしたい', score: { initiative: 1 } },
            { value: 3, text: '半々で決めたい', score: { initiative: 0 } },
            { value: 4, text: '相手の案をベースに調整', score: { initiative: -1 } },
            { value: 5, text: '相手に任せる', score: { initiative: -2 } },
        ],
    },
    {
        id: 202,
        text: 'サプライズをされたら？',
        focus: 'security',
        options: [
            { value: 1, text: '大歓迎で嬉しい', score: { security: 2, affection: 1 } },
            { value: 2, text: '嬉しいけど控えめがいい', score: { security: 1 } },
            { value: 3, text: '内容次第で判断', score: { security: 0 } },
            { value: 4, text: 'あまり得意ではない', score: { security: -1 } },
            { value: 5, text: 'サプライズは苦手', score: { security: -2 } },
        ],
    },
    {
        id: 203,
        text: '忙しい時期の連絡頻度は？',
        focus: 'distance',
        options: [
            { value: 1, text: '変わらず連絡したい', score: { distance: -2, affection: 1 } },
            { value: 2, text: '少し減らす程度', score: { distance: -1 } },
            { value: 3, text: '必要最低限でOK', score: { distance: 0 } },
            { value: 4, text: 'ほぼ連絡不要', score: { distance: 1 } },
            { value: 5, text: '連絡なしで問題なし', score: { distance: 2 } },
        ],
    },
    {
        id: 204,
        text: '記念日の過ごし方は？',
        focus: 'affection',
        options: [
            { value: 1, text: '盛大に祝いたい', score: { affection: 2, initiative: 1 } },
            { value: 2, text: '少し特別なことをする', score: { affection: 1 } },
            { value: 3, text: 'いつもより丁寧に過ごす程度', score: { affection: 0 } },
            { value: 4, text: 'シンプルに過ごす', score: { affection: -1 } },
            { value: 5, text: '特別視しない', score: { affection: -2 } },
        ],
    },
    {
        id: 205,
        text: 'デートの費用はどう分担したい？',
        focus: 'initiative',
        options: [
            { value: 1, text: '自分が多めに負担したい', score: { initiative: 2 } },
            { value: 2, text: '少し多めに払う', score: { initiative: 1 } },
            { value: 3, text: '基本は割り勘', score: { initiative: 0 } },
            { value: 4, text: '相手に少し多めに払ってほしい', score: { initiative: -1 } },
            { value: 5, text: '相手に任せたい', score: { initiative: -2 } },
        ],
    },
    {
        id: 206,
        text: '二人の趣味の時間は？',
        focus: 'distance',
        options: [
            { value: 1, text: 'ほぼ一緒に過ごしたい', score: { distance: -2, affection: 1 } },
            { value: 2, text: '週の多くを共有したい', score: { distance: -1 } },
            { value: 3, text: '半々くらい', score: { distance: 0 } },
            { value: 4, text: '各自の時間を多めに', score: { distance: 1 } },
            { value: 5, text: 'ほとんど別々でOK', score: { distance: 2 } },
        ],
    },
    {
        id: 207,
        text: '相談ごとはどう扱いたい？',
        focus: 'security',
        options: [
            { value: 1, text: 'すぐ共有して一緒に考える', score: { security: 2 } },
            { value: 2, text: '早めに共有したい', score: { security: 1 } },
            { value: 3, text: 'タイミングを見て話す', score: { security: 0 } },
            { value: 4, text: '基本は自分で処理する', score: { security: -1 } },
            { value: 5, text: 'ほとんど共有しない', score: { security: -2 } },
        ],
    },
    {
        id: 208,
        text: 'スキンシップの頻度は？',
        focus: 'affection',
        options: [
            { value: 1, text: '毎日たくさん欲しい', score: { affection: 2, distance: -1 } },
            { value: 2, text: '毎日少しでも触れ合いたい', score: { affection: 1 } },
            { value: 3, text: '週数回くらいで十分', score: { affection: 0 } },
            { value: 4, text: 'たまにでいい', score: { affection: -1, distance: 1 } },
            { value: 5, text: 'ほとんどなくていい', score: { affection: -2, distance: 2 } },
        ],
    },
    {
        id: 209,
        text: '相手の交友関係への関わり方は？',
        focus: 'distance',
        options: [
            { value: 1, text: '積極的に一緒に過ごしたい', score: { distance: -2 } },
            { value: 2, text: '紹介してもらえると嬉しい', score: { distance: -1 } },
            { value: 3, text: '必要に応じて顔を出す程度', score: { distance: 0 } },
            { value: 4, text: 'ほとんど関わらない', score: { distance: 1 } },
            { value: 5, text: '全く関与しない', score: { distance: 2 } },
        ],
    },
    {
        id: 210,
        text: 'デートの頻度は？',
        focus: 'security',
        options: [
            { value: 1, text: '毎週会いたい', score: { security: 2, affection: 1 } },
            { value: 2, text: '2週に1回くらい', score: { security: 1 } },
            { value: 3, text: '月1回くらいで十分', score: { security: 0 } },
            { value: 4, text: '忙しければ隔月でもOK', score: { security: -1 } },
            { value: 5, text: 'あまり頻度にこだわらない', score: { security: -2 } },
        ],
    },
    {
        id: 211,
        text: '同棲を考えるタイミングは？',
        focus: 'security',
        options: [
            { value: 1, text: '早めに始めたい', score: { security: 2 } },
            { value: 2, text: '1年以内には検討したい', score: { security: 1 } },
            { value: 3, text: '数年様子を見てから', score: { security: 0 } },
            { value: 4, text: 'しばらくは別々がいい', score: { security: -1 } },
            { value: 5, text: 'あまり考えていない', score: { security: -2 } },
        ],
    },
    {
        id: 212,
        text: 'サプライズをするとしたら？',
        focus: 'initiative',
        options: [
            { value: 1, text: '大規模な企画で驚かせたい', score: { initiative: 2, affection: 1 } },
            { value: 2, text: '小さな工夫で喜ばせたい', score: { initiative: 1 } },
            { value: 3, text: '相手の様子を見て控えめに', score: { initiative: 0 } },
            { value: 4, text: '基本はしない', score: { initiative: -1 } },
            { value: 5, text: 'サプライズは苦手', score: { initiative: -2 } },
        ],
    },
    {
        id: 213,
        text: '相談や悩みの共有度合いは？',
        focus: 'security',
        options: [
            { value: 1, text: '細かいことも全部共有したい', score: { security: 2 } },
            { value: 2, text: '大事なことは共有したい', score: { security: 1 } },
            { value: 3, text: '必要に応じて共有する', score: { security: 0 } },
            { value: 4, text: '重い話だけ共有する', score: { security: -1 } },
            { value: 5, text: 'ほぼ共有しない', score: { security: -2 } },
        ],
    },
    {
        id: 214,
        text: 'プレゼント選びで大事にするのは？',
        focus: 'affection',
        options: [
            { value: 1, text: 'ロマン重視', score: { affection: 2 } },
            { value: 2, text: '思い出重視', score: { affection: 1 } },
            { value: 3, text: '実用性とバランス', score: { affection: 0 } },
            { value: 4, text: 'コスパ重視', score: { affection: -1 } },
            { value: 5, text: 'ほぼ気にしない', score: { affection: -2 } },
        ],
    },
    {
        id: 215,
        text: '記念日に欲しい言葉は？',
        focus: 'affection',
        options: [
            { value: 1, text: '愛情たっぷりのメッセージ', score: { affection: 2 } },
            { value: 2, text: '感謝と労いの言葉', score: { affection: 1 } },
            { value: 3, text: 'シンプルな一言', score: { affection: 0 } },
            { value: 4, text: '特にこだわらない', score: { affection: -1 } },
            { value: 5, text: '言葉はなくてもOK', score: { affection: -2 } },
        ],
    },
    {
        id: 216,
        text: '過ごす場所の好みは？',
        focus: 'distance',
        options: [
            { value: 1, text: '家デートが一番好き', score: { distance: -2, security: 1 } },
            { value: 2, text: '家と外を半々くらい', score: { distance: -1 } },
            { value: 3, text: 'バランスよくどちらも', score: { distance: 0 } },
            { value: 4, text: '外出多め', score: { distance: 1, initiative: 1 } },
            { value: 5, text: '外出中心で動きたい', score: { distance: 2, initiative: 2 } },
        ],
    },
    {
        id: 217,
        text: '連絡スタイルの理想は？',
        focus: 'affection',
        options: [
            { value: 1, text: 'こまめに気持ちを伝えたい', score: { affection: 2, distance: -1 } },
            { value: 2, text: '短いメッセージでも頻度重視', score: { affection: 1 } },
            { value: 3, text: '必要な時にしっかり話す', score: { affection: 0 } },
            { value: 4, text: '要点だけ伝える', score: { affection: -1 } },
            { value: 5, text: '最低限で十分', score: { affection: -2, distance: 1 } },
        ],
    },
    {
        id: 218,
        text: '同棲中の家事分担は？',
        focus: 'initiative',
        options: [
            { value: 1, text: '自分が多めにやりたい', score: { initiative: 2 } },
            { value: 2, text: '少し多めにやる', score: { initiative: 1 } },
            { value: 3, text: 'ほぼ半々で分担', score: { initiative: 0 } },
            { value: 4, text: '相手に少し多く頼みたい', score: { initiative: -1 } },
            { value: 5, text: 'ほぼ相手に任せたい', score: { initiative: -2 } },
        ],
    },
    {
        id: 219,
        text: '安心できるコミュニケーションは？',
        focus: 'security',
        options: [
            { value: 1, text: '毎日状況を共有し合う', score: { security: 2 } },
            { value: 2, text: '要所で状況を共有する', score: { security: 1 } },
            { value: 3, text: '大事なときだけ共有', score: { security: 0 } },
            { value: 4, text: '必要最低限でOK', score: { security: -1 } },
            { value: 5, text: 'ほぼ共有しない', score: { security: -2 } },
        ],
    },
    {
        id: 220,
        text: '相手への期待値コントロールは？',
        focus: 'security',
        options: [
            { value: 1, text: '高めに期待してワクワクしたい', score: { security: -1, affection: 1 } },
            { value: 2, text: 'そこそこ期待したい', score: { security: 0 } },
            { value: 3, text: '期待値を抑えめにしておく', score: { security: 1 } },
            { value: 4, text: 'ほぼ期待しない', score: { security: 2 } },
            { value: 5, text: '期待を持たないで過ごす', score: { security: 2, distance: 1 } },
        ],
    },
];

export const QUESTIONS: Question[] = [...BASE_QUESTIONS, ...FOLLOWUP_QUESTION_POOL];
export const QUESTION_MAP = new Map(QUESTIONS.map((q) => [q.id, q]));

function shuffleArray<T>(items: T[]): T[] {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export const SCORE_AXES: Array<'distance' | 'initiative' | 'security' | 'affection'> = [
    'distance',
    'initiative',
    'security',
    'affection',
];

export function pickFollowupQuestions(
    scores: Record<(typeof SCORE_AXES)[number], number>,
    count = 5,
): Question[] {
    const rankedAxes = [...SCORE_AXES].sort((a, b) => Math.abs(scores[b]) - Math.abs(scores[a]));
    const primaryAxis = rankedAxes[0];

    const chosen: Question[] = [];
    const usedIds = new Set<number>();

    // 個人深掘り: 主軸から2問
    const primaryCandidates = shuffleArray(
        FOLLOWUP_QUESTION_POOL.filter((q) => q.focus === primaryAxis && !usedIds.has(q.id)),
    );
    primaryCandidates.slice(0, 2).forEach((q) => {
        chosen.push(q);
        usedIds.add(q.id);
    });

    // 相性確認: 残り3問を他軸から優先しつつ埋める
    const secondaryCandidates = shuffleArray(
        FOLLOWUP_QUESTION_POOL.filter(
            (q) => q.focus && q.focus !== primaryAxis && !usedIds.has(q.id),
        ),
    );
    secondaryCandidates.forEach((q) => {
        if (chosen.length >= count) return;
        chosen.push(q);
        usedIds.add(q.id);
    });

    // まだ足りなければ全体から埋める
    if (chosen.length < count) {
        const remaining = shuffleArray(
            FOLLOWUP_QUESTION_POOL.filter((q) => !usedIds.has(q.id)),
        );
        remaining.forEach((q) => {
            if (chosen.length >= count) return;
            chosen.push(q);
            usedIds.add(q.id);
        });
    }

    return chosen.slice(0, count);
}

export function shuffleBaseQuestions(): Question[] {
    return shuffleArray(BASE_QUESTIONS);
}

export const KEY_QUESTIONS: KeyQuestion[] = [
    {
        id: 101,
        text: 'もし魔法が使えるなら？',
        options: [
            { value: 1, text: '相手の心が読める魔法' },
            { value: 2, text: '喧嘩をなかったことにできる魔法' },
            { value: 3, text: 'ずっと一緒にいられる魔法' },
        ],
    },
    {
        id: 102,
        text: '無人島に一つだけ持っていくなら？',
        options: [
            { value: 1, text: '思い出の写真' },
            { value: 2, text: '遊べるゲーム' },
            { value: 3, text: 'サバイバルナイフ' },
        ],
    },
    {
        id: 103,
        text: '生まれ変わるなら？',
        options: [
            { value: 1, text: '自由気ままな猫' },
            { value: 2, text: '大空を飛ぶ鳥' },
            { value: 3, text: '深海を泳ぐ魚' },
        ],
    },
];
