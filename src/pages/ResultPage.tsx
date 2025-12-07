import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// import { QRCodeSVG } from 'qrcode.react'; // Removed in favor of QRModal component
import { buildPairViewFromResult, getDuoVariantProfile, getPersonalProfilesFromResult, getSoloVariantProfile } from '../domain/scoring';
import { QUESTION_MAP } from '../domain/questions';
import type { PairResultPayload } from '../domain/types';
import { decodePayload } from '../utils/urlState';
import { copyToClipboard, shareLink } from '../utils/share';
import { useAppStatus } from '../context/AppStatusContext';
import HighlightSelector, { type HighlightChoice } from '../components/result/HighlightSelector';
import BonusAnswerBlock from '../components/result/BonusAnswerBlock';
import { QRModal } from '../components/QRModal';

const ResultPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { pushMessage } = useAppStatus();
    const [showQR, setShowQR] = useState(false);
    const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
    const [lockedHighlight, setLockedHighlight] = useState(false);
    const [copyLinkStatus, setCopyLinkStatus] = useState<'idle' | 'copied'>('idle');

    const handleCopyLink = () => {
        copyToClipboard(location.href).then((ok) => {
            if (ok) {
                setCopyLinkStatus('copied');
                setTimeout(() => setCopyLinkStatus('idle'), 2000);
            } else {
                pushMessage('リンクのコピーに失敗しました', 'error');
            }
        });
    };

    const encoded = searchParams.get('d') ?? '';
    const payloadResult = useMemo(() => decodePayload<PairResultPayload>(encoded), [encoded]);
    const payload = payloadResult.ok ? payloadResult.value : null;

    useEffect(() => {
        if (!payload) {
            pushMessage('結果データが見つかりません。トップへ戻ります', 'error');
        }
    }, [payload, pushMessage]);

    if (!payload) {
        return (
            <div className="page">
                <div className="card">
                    <h2>結果データが見つかりませんでした</h2>
                    <button className="btn" onClick={() => navigate('/')}>トップに戻る</button>
                </div>
            </div>
        );
    }

    const duoProfile = payload.duoVariant ? getDuoVariantProfile(payload.duoVariant) : null;
    const view = duoProfile
        ? {
            title: duoProfile.emoji ? `${duoProfile.title} ${duoProfile.emoji}` : duoProfile.title,
            message: duoProfile.message,
            tips: duoProfile.tips,
        }
        : buildPairViewFromResult(payload.resultId, payload.view);
    const profiles = getPersonalProfilesFromResult(payload.resultId, payload.view);
    const selfVariantProfile = payload.soloVariantSelf ? getSoloVariantProfile(payload.soloVariantSelf) : undefined;
    const partnerVariantProfile = payload.soloVariantPartner ? getSoloVariantProfile(payload.soloVariantPartner) : undefined;
    const link = window.location.href;
    const answersBlock = payload.answers;
    const bonusDetail = payload.bonusDetail;
    const questionChoices: HighlightChoice[] = [];

    const insertAt = 3;
    let displayIndex = 1;
    const answeredIds = Array.from(
        new Set([
            ...Object.keys(answersBlock?.self ?? {}).map(Number),
            ...Object.keys(answersBlock?.partner ?? {}).map(Number),
        ]),
    ).sort((a, b) => a - b);

    answeredIds.forEach((id, idx) => {
        const q = QUESTION_MAP.get(id);
        if (!q) return;

        const showBonusHere = bonusDetail && payload.view !== 'A' && idx === insertAt;
        if (showBonusHere) {
            const myBonus = bonusDetail.partnerAnswer;
            const partnerBonus = bonusDetail.ownerAnswer;
            questionChoices.push({
                id: 'bonus',
                label: `Q${displayIndex}`,
                text: bonusDetail.question,
                my: myBonus,
                partner: partnerBonus,
            });
            displayIndex += 1;
        }

        const my = answersBlock?.self?.[q.id];
        const partner = answersBlock?.partner?.[q.id];
        questionChoices.push({
            id: `q-${q.id}`,
            label: `Q${displayIndex}`,
            text: q.text,
            my,
            partner,
        });
        displayIndex += 1;
    });

    if (bonusDetail && payload.view !== 'A' && answeredIds.length <= insertAt) {
        const myBonus = bonusDetail.partnerAnswer;
        const partnerBonus = bonusDetail.ownerAnswer;
        questionChoices.push({
            id: 'bonus',
            label: `Q${displayIndex}`,
            text: bonusDetail.question,
            my: myBonus,
            partner: partnerBonus,
        });
        displayIndex += 1;
    }

    if (payload.keyDetail) {
        questionChoices.push({
            id: 'key',
            label: '特別Q',
            text: payload.keyDetail.question,
            my: payload.keyDetail.selfAnswer,
            partner: payload.keyDetail.partnerAnswer,
        });
    }

    return (
        <div className="page">
            <section className="card result-card">
                <p className="eyebrow">ふたりの相性カード</p>
                <h2>{view.title}</h2>
                <p style={{ color: 'var(--text-main)', opacity: 1, fontWeight: 500 }}>{view.message}</p>
                <ul>
                    {view.tips.map((tip) => (
                        <li key={tip}>{tip}</li>
                    ))}
                </ul>
                <p className="small">resultId: {payload.resultId} / view: {payload.view}</p>
                <div className="cta-row stacked">
                    <div className="cta-row">
                        <div className="btn-wrapper">
                            <button className="btn small" onClick={() => setShowQR(true)}>QRを表示</button>
                        </div>
                        <div className="btn-wrapper">
                            {copyLinkStatus === 'copied' && <span className="copy-feedback">コピーしました</span>}
                            <button className="btn small" onClick={handleCopyLink}>リンクをコピー</button>
                        </div>
                    </div>
                    <div className="cta-row">
                        <button className="btn small ghost" onClick={() => shareLink(link, '二人の結果カード', view.title)}>シェアする</button>
                    </div>
                </div>
                <p className="qr-helper">スクショするならQRが便利です</p>
            </section>

            <section className="card result-card">
                <p className="eyebrow">あなたの個人結果</p>
                <h2>
                    SOLO STYLE: {selfVariantProfile?.avatar ?? profiles.self.avatar}
                    {selfVariantProfile?.emoji && ` ${selfVariantProfile.emoji}`}
                </h2>
                <p className="eyebrow" style={{ marginTop: '0.25rem' }}>
                    {selfVariantProfile?.label ?? profiles.self.name}
                </p>
                <p style={{ color: 'var(--text-main)', opacity: 1, fontWeight: 500 }}>
                    {selfVariantProfile?.description ?? profiles.self.headline}
                </p>
                <ul>
                    <li>強み: {profiles.self.strengths.join(' / ')}</li>
                    <li>気をつける: {profiles.self.caution}</li>
                    <li>今回の相手タイプ: {partnerVariantProfile?.label ?? profiles.partner.name}</li>
                </ul>
            </section>

            <section className="card">
                <p className="eyebrow">二人の答えた質問チェック</p>
                <p className="hint">気になる1問を選んでパートナーの答えを確認しよう</p>
                <HighlightSelector
                    choices={questionChoices}
                    selectedId={selectedQuestionId}
                    locked={lockedHighlight}
                    onSelect={(id) => {
                        setSelectedQuestionId(id);
                        setLockedHighlight(true);
                    }}
                />
            </section>

            {payload.bonusDetail && payload.view === 'A' && (
                <BonusAnswerBlock
                    question={payload.bonusDetail.question}
                    label={payload.bonusDetail.label}
                    minLabel={payload.bonusDetail.minLabel}
                    maxLabel={payload.bonusDetail.maxLabel}
                    myAnswer={payload.bonusDetail.ownerAnswer}
                    partnerAnswer={payload.bonusDetail.partnerAnswer}
                />
            )}

            {showQR && (
                <QRModal
                    title="結果QR"
                    link={link}
                    onClose={() => setShowQR(false)}
                />
            )}
        </div>
    );
};

export default ResultPage;
