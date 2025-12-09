import React, { useState } from "react";
import { type PairResultPayload } from "../../domain/types";
import { encodePayload } from "../../utils/urlState";
import { copyToClipboard, shareLink } from "../../utils/share";
import HighlightSelector, { type HighlightChoice } from "./HighlightSelector";
import BonusAnswerBlock from "./BonusAnswerBlock";
import { QUESTION_MAP } from "../../domain/questions";
import type { PairView } from "../../domain/types";
import { BONUS_INSERT_INDEX } from "../../const/quiz";

interface ResultViewProps {
    pairView: PairView;
    effectivePayloads: { A: PairResultPayload; B: PairResultPayload };
    currentView: "A" | "B";
    onShowMyQR: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({
    pairView,
    effectivePayloads,
    currentView,
    onShowMyQR,
}) => {
    const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
    const [lockedHighlight, setLockedHighlight] = useState(false);

    const payloadForMe = currentView === "A" ? effectivePayloads.A : effectivePayloads.B;
    const myResultLink = `${window.location.origin}${window.location.pathname}#/result?d=${encodePayload(payloadForMe)}`;
    const answersBlock = payloadForMe.answers;
    const bonusDetail = payloadForMe.bonusDetail;
    const questionChoices: HighlightChoice[] = [];

    const insertAt = BONUS_INSERT_INDEX; // Q4にボーナスを挿入
    let displayIndex = 1;

    const answeredIds = Array.from(
        new Set([
            ...Object.keys(answersBlock?.partner ?? {}).map(Number),
        ]),
    ).sort((a, b) => a - b);

    answeredIds.forEach((id, idx) => {
        const q = QUESTION_MAP.get(id);
        if (!q) return;

        const partner = answersBlock?.partner?.[q.id];
        if (partner === undefined) return; // Only show what partner answered

        const showBonusHere = bonusDetail && currentView !== "A" && idx === insertAt;
        if (showBonusHere) {
            const myBonus = bonusDetail.partnerAnswer;
            const partnerBonus = bonusDetail.ownerAnswer;
            // For bonus, only show if partner answered
            if (partnerBonus !== undefined && partnerBonus !== null) {
                questionChoices.push({
                    id: "bonus",
                    label: `Q${displayIndex}`,
                    text: bonusDetail.question,
                    my: myBonus,
                    partner: partnerBonus,
                });
                displayIndex += 1;
            }
        }

        const my = answersBlock?.self?.[q.id];
        questionChoices.push({
            id: `q-${q.id}`,
            label: `Q${displayIndex}`,
            text: q.text,
            my,
            partner,
        });
        displayIndex += 1;
    });

    if (bonusDetail && currentView !== "A" && answeredIds.length <= insertAt) {
        const myBonus = bonusDetail.partnerAnswer;
        const partnerBonus = bonusDetail.ownerAnswer;
        if (partnerBonus !== undefined && partnerBonus !== null) {
            questionChoices.push({
                id: "bonus",
                label: `Q${displayIndex}`,
                text: bonusDetail.question,
                my: myBonus,
                partner: partnerBonus,
            });
            displayIndex += 1;
        }
    }

    return (
        <section className="card result-card">
            <p className="eyebrow">二人用結果が解放されました</p>
            <h2>{pairView.title}</h2>
            <p style={{ color: 'var(--text-main)', opacity: 1, fontWeight: 500 }}>{pairView.message}</p>
            <ul>
                {pairView.tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                ))}
            </ul>
            {questionChoices.length > 0 && (
                <HighlightSelector
                    choices={questionChoices}
                    selectedId={selectedQuestionId}
                    locked={lockedHighlight}
                    onSelect={(id) => {
                        setSelectedQuestionId(id);
                        setLockedHighlight(true);
                    }}
                />
            )}

            {payloadForMe.bonusDetail && currentView === "A" && (
                <BonusAnswerBlock
                    question={payloadForMe.bonusDetail.question}
                    label={payloadForMe.bonusDetail.label}
                    minLabel={payloadForMe.bonusDetail.minLabel}
                    maxLabel={payloadForMe.bonusDetail.maxLabel}
                    myAnswer={payloadForMe.bonusDetail.ownerAnswer}
                    partnerAnswer={payloadForMe.bonusDetail.partnerAnswer}
                />
            )}

            <div className="qr-grid">
                <div className="qr-block capture">
                    <p className="eyebrow">この端末の結果</p>
                <div className="cta-row">
                    <div className="btn-wrapper">
                        <button className="btn small" onClick={onShowMyQR}>
                            📱 QRコードを表示
                        </button>
                    </div>
                    <div className="btn-wrapper">
                        <button className="btn small" onClick={() => copyToClipboard(myResultLink)}>
                            🔗 リンクをコピー
                        </button>
                    </div>
                    <div className="btn-wrapper">
                        <button className="btn small" onClick={() => shareLink(myResultLink, "二人用結果（自分向け）")}>
                            📤 共有
                        </button>
                    </div>
                </div>
                    <p className="qr-helper">「結果QR」を開いてスクショしてください。</p>
                </div>
            </div>
        </section>
    );
};

export default ResultView;
