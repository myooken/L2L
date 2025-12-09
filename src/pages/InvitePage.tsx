import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
// import { QRCodeSVG } from "qrcode.react"; // Removed in favor of QRCodeCanvas inside component
import QuizForm from "../components/QuizForm";
import { QUESTION_MAP } from "../domain/questions";
import { buildPairViewFromResult, calculatePairResult, calculatePersonalResult, getDuoVariantProfile } from "../domain/scoring";
import { useP2P, type P2PStatus } from "../hooks/useP2P";
import type { InvitePayload, PairResultPayload, Role, UserAnswers } from "../domain/types";
import { decodePayload, encodePayload } from "../utils/urlState";
import { copyToClipboard, shareLink } from "../utils/share";
import type { P2PMessage } from "../p2p/messages";
import { isP2PMessage } from "../p2p/messages";
import { useAppStatus } from "../context/AppStatusContext";
// import HighlightSelector, { type HighlightChoice } from "../components/result/HighlightSelector"; // Moved to ResultView
// import BonusAnswerBlock from "../components/result/BonusAnswerBlock"; // Moved to ResultView
import ResultView from "../components/result/ResultView";
import { QRModal } from "../components/QRModal";
import { INVITE_LINK_RESET_MS, P2P_MAX_RETRIES, P2P_RETRY_DELAY_MS, P2P_STATUS_TEXT } from "../const/p2p";

type PairPayloads = { A: PairResultPayload; B: PairResultPayload };

const InvitePage = () => {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const locationState = (location.state as {
        ownerAnswers?: UserAnswers;
        bonusQuestionText?: string;
        bonusLabelText?: string;
        bonusScaleMin?: string;
        bonusScaleMax?: string;
    }) || {};
    const { pushMessage } = useAppStatus();
    const lastStatusRef = useRef<P2PStatus | null>(null);

    const encoded = searchParams.get("d") ?? "";
    const inviteResult = useMemo(() => decodePayload<InvitePayload>(encoded), [encoded]);
    const invite = inviteResult.ok ? inviteResult.value : null;

    useEffect(() => {
        if (!invite) pushMessage("招待リンクが無効です。もう一度作成してください。", "error");
    }, [invite, pushMessage]);

    const isOwner = Boolean(locationState.ownerAnswers);
    const [localAnswers, setLocalAnswers] = useState<UserAnswers | null>(locationState.ownerAnswers ?? null);
    const [remoteAnswers, setRemoteAnswers] = useState<UserAnswers | null>(null);
    const [pairPayloadFromRemote, setPairPayloadFromRemote] = useState<PairPayloads | null>(null);
    const [guestStarted, setGuestStarted] = useState(false);
    const [showInviteQR, setShowInviteQR] = useState(false);
    const [showMyQR, setShowMyQR] = useState(false);
    const [copyInviteLinkStatus, setCopyInviteLinkStatus] = useState<"idle" | "copied">("idle");
    const inviteSectionRef = useRef<HTMLElement | null>(null);

    const handleCopyInviteLink = () => {
        copyToClipboard(inviteLink).then((ok) => {
            if (ok) {
                setCopyInviteLinkStatus("copied");
                setTimeout(() => setCopyInviteLinkStatus("idle"), INVITE_LINK_RESET_MS);
            } else {
                pushMessage("コピーに失敗しました", "error");
            }
        });
    };

    const p2p = useP2P({
        sessionId: invite?.sid,
        role: isOwner ? ("owner" as Role) : "guest",
        onMessage: handleIncoming,
        guard: isP2PMessage,
        autoStart: Boolean(invite?.sid),
        maxRetries: P2P_MAX_RETRIES, // unlimited retries for stability
        retryDelayMs: P2P_RETRY_DELAY_MS,
    });

    useEffect(() => {
        if (!invite) return;
        if (!isOwner && p2p.status === "idle") {
            p2p.connect(invite.sid);
        }
    }, [invite, isOwner, p2p]);

    useEffect(() => {
        if (!invite) return;
        const status = p2p.status;
        if (status === lastStatusRef.current) return;
        lastStatusRef.current = status;
        if (status === "connected") {
            pushMessage("接続しました", "success");
        } else if (status === "error" && p2p.error) {
            pushMessage(p2p.error, "error");
        }
    }, [invite, p2p.status, p2p.error, pushMessage]);

    function handleIncoming(msg: P2PMessage) {
        if (!isP2PMessage(msg)) return;
        if (msg.kind === "ANSWER_SUMMARY") {
            setRemoteAnswers(msg.payload);
        }
        if (msg.kind === "PAIR_RESULT") {
            // If we already have a full payload with answers, don't overwrite it with a minimal one
            if (pairPayloadFromRemote?.A?.answers) return;

            const rId = msg.payload;
            const payloadA: PairResultPayload = { v: 1 as const, sid: invite?.sid ?? "", view: "A", resultId: rId };
            const payloadB: PairResultPayload = { v: 1 as const, sid: invite?.sid ?? "", view: "B", resultId: rId };
            setPairPayloadFromRemote({ A: payloadA, B: payloadB });
        }
        if (msg.kind === "PAIR_RESULT_PAYLOAD") {
            setPairPayloadFromRemote(msg.payload);
        }
    }

    useEffect(() => {
        if (!localAnswers || p2p.status !== "connected") return;
        p2p.send({ kind: "ANSWER_SUMMARY", payload: localAnswers });
    }, [localAnswers, p2p.status, p2p.send]);

    const pairResult = useMemo(() => {
        if (!isOwner) return null;
        if (!localAnswers || !remoteAnswers) return null;
        return calculatePairResult(localAnswers, remoteAnswers);
    }, [isOwner, localAnswers, remoteAnswers]);

    const soloResult = useMemo(() => {
        if (!localAnswers) return null;
        return calculatePersonalResult(localAnswers);
    }, [localAnswers]);
    const remoteSoloResult = useMemo(() => {
        if (!remoteAnswers) return null;
        return calculatePersonalResult(remoteAnswers);
    }, [remoteAnswers]);

    const computedPayloads = useMemo(() => {
        if (!pairResult || !invite || !localAnswers || !remoteAnswers || !soloResult || !remoteSoloResult) return null;

        const allAnsweredIds = Array.from(
            new Set([
                ...Object.keys(localAnswers.answers).map((n) => Number(n)),
                ...Object.keys(remoteAnswers.answers).map((n) => Number(n)),
            ]),
        ).sort((a, b) => a - b);
        const defaultQuestionId = allAnsweredIds[0] ?? null;
        const defaultQuestion = defaultQuestionId ? QUESTION_MAP.get(defaultQuestionId) : null;
        const highlightA = defaultQuestion
            ? {
                question: defaultQuestion.text,
                myAnswer: localAnswers.answers[defaultQuestion.id] ?? null,
                partnerAnswer: remoteAnswers.answers[defaultQuestion.id] ?? null,
            }
            : undefined;
        const highlightB = defaultQuestion
            ? {
                question: defaultQuestion.text,
                myAnswer: remoteAnswers.answers[defaultQuestion.id] ?? null,
                partnerAnswer: localAnswers.answers[defaultQuestion.id] ?? null,
            }
            : undefined;

        const bonusDetail = invite.bonusQ
            ? {
                question: invite.bonusQ,
                label: invite.bonusLabel,
                minLabel: invite.bonusMin,
                maxLabel: invite.bonusMax,
                ownerAnswer: localAnswers.bonusAnswerValue ?? null,
                partnerAnswer: remoteAnswers.bonusAnswerValue ?? null,
            }
            : undefined;

        const answersA = { self: localAnswers.answers, partner: remoteAnswers.answers };
        const answersB = { self: remoteAnswers.answers, partner: localAnswers.answers };

        return {
            A: {
                v: 1 as const,
                sid: invite.sid,
                view: "A" as const,
                resultId: pairResult.resultId,
                duoVariant: pairResult.duoVariant,
                soloVariantSelf: soloResult.variantId,
                soloVariantPartner: remoteSoloResult.variantId,
                soloAvatarSelf: soloResult.variantProfile?.avatar ?? soloResult.type.avatar,
                soloAvatarPartner: remoteSoloResult.variantProfile?.avatar ?? remoteSoloResult.type.avatar,
                ...(highlightA ? { highlight: highlightA } : {}),
                bonusDetail,
                answers: answersA,
            },
            B: {
                v: 1 as const,
                sid: invite.sid,
                view: "B" as const,
                resultId: pairResult.resultId,
                duoVariant: pairResult.duoVariant,
                soloVariantSelf: remoteSoloResult.variantId,
                soloVariantPartner: soloResult.variantId,
                soloAvatarSelf: remoteSoloResult.variantProfile?.avatar ?? remoteSoloResult.type.avatar,
                soloAvatarPartner: soloResult.variantProfile?.avatar ?? soloResult.type.avatar,
                ...(highlightB ? { highlight: highlightB } : {}),
                bonusDetail,
                answers: answersB,
            },
        } satisfies PairPayloads;
    }, [pairResult, invite, localAnswers, remoteAnswers, soloResult, remoteSoloResult]);

    useEffect(() => {
        if (!isOwner) return;
        if (!computedPayloads) return;
        if (p2p.status !== "connected") return;
        p2p.send({ kind: "PAIR_RESULT_PAYLOAD", payload: computedPayloads });
    }, [isOwner, computedPayloads, p2p.status, p2p.send]);

    const effectivePayloads = pairPayloadFromRemote ?? computedPayloads;
    const pairResultId = effectivePayloads?.A.resultId ?? null;

    const currentView: "A" | "B" = isOwner ? "A" : "B";
    const payloadForView = effectivePayloads ? (currentView === "A" ? effectivePayloads.A : effectivePayloads.B) : null;
    const duoProfile = payloadForView?.duoVariant ? getDuoVariantProfile(payloadForView.duoVariant) : null;
    const pairView =
        (duoProfile && { title: `${duoProfile.title} ${duoProfile.emoji}`, message: duoProfile.message, tips: duoProfile.tips }) ||
        (pairResultId && invite ? buildPairViewFromResult(pairResultId, currentView) : null);
    const inviteLink = `${window.location.origin}${window.location.pathname}#/invite?d=${encoded}`;

    const statusDotClass =
        p2p.status === "connected"
            ? "on"
            : p2p.status === "error"
                ? "error"
                : ["connecting", "retrying", "listening"].includes(p2p.status)
                    ? "wait"
                    : "";

    const hasLocal = Boolean(localAnswers);
    const hasRemote = Boolean(remoteAnswers);
    const bothAnswered = hasLocal && hasRemote;

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!isOwner || hasRemote) return;
        if (!inviteSectionRef.current) return;
        const ua = window.navigator?.userAgent || "";
        if (/jsdom/i.test(ua)) return; // tests: scrollIntoView未実装
        try {
            inviteSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch {
            if (typeof window.scrollTo === "function") {
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        }
    }, [isOwner, hasRemote]);

    const renderGuestQuiz = () => {
        if (isOwner || localAnswers) return null;
        if (!guestStarted) {
            return (
                <div className="card">
                    <h3>あなたの診断を開始</h3>
                    <p>全10問＋鍵質問に答えると、相手と自動で同期します。</p>
                    <button className="btn primary" onClick={() => setGuestStarted(true)}>診断を始める</button>
                </div>
            );
        }
        return (
            <QuizForm
                role="guest"
                headline="あなたの回答"
                bonusQuestionText={invite?.bonusQ ?? ''}
                bonusLabelText={invite?.bonusLabel ?? ''}
                bonusScaleMinText={invite?.bonusMin ?? 'まったり'}
                bonusScaleMaxText={invite?.bonusMax ?? 'しっかり'}
                onComplete={(answers) => {
                    setLocalAnswers(answers);
                    if (invite?.sid) {
                        p2p.connect(invite.sid);
                    }
                    setGuestStarted(false);
                }}
            />
        );
    };

    const renderResult = () => {
        if (!pairResultId || !pairView || !effectivePayloads) return null;
        return (
            <ResultView
                pairView={pairView}
                effectivePayloads={effectivePayloads}
                currentView={currentView}
                onShowMyQR={() => setShowMyQR(true)}
            />
        );
    };

    return (
        <div className="page">
            {/* Invite Card - Only shown when partner is NOT connected/answered AND is Owner */}
            {isOwner && !hasRemote && (
                <section className="card" ref={inviteSectionRef}>
                    <p className="eyebrow">招待リンク</p>
                    <h2>{isOwner ? "QRを共有して相手を招待" : "招待リンクで参加しています"}</h2>
                    <p>合言葉（ID）: <strong>{invite?.sid ?? '-'}</strong></p>
                    <div className="qr-block capture">
                        <div className="cta-row">
                            <div className="btn-wrapper">
                                <button className="btn small" onClick={() => setShowInviteQR(true)}>📱 QRコードを表示</button>
                            </div>
                            <div className="btn-wrapper">
                                {copyInviteLinkStatus === "copied" && <span className="copy-feedback">コピーしました！</span>}
                                <button className="btn small" onClick={handleCopyInviteLink}>🔗 リンクをコピー</button>
                            </div>
                            <div className="btn-wrapper">
                                <button className="btn small" onClick={() => shareLink(inviteLink, "招待リンク")}>
                                    📤 共有
                                </button>
                            </div>
                        </div>
                        <p className="qr-helper">必要なときだけQRを開いてスクショできます。</p>
                    </div>
                </section>
            )}



            {renderGuestQuiz()}

            {soloResult && (
                <section className="card result-card">
                    <p className="eyebrow">あなたのソロ結果</p>
                    <h2>
                        SOLO STYLE: {soloResult.variantProfile?.avatar ?? soloResult.type.avatar}
                        {soloResult.variantProfile?.emoji && ` ${soloResult.variantProfile.emoji}`}
                    </h2>
                    <p style={{ color: 'var(--text-main)', opacity: 1, fontWeight: 500 }}>
                        {soloResult.variantProfile?.description ?? soloResult.type.headline}
                    </p>
                    <ul>
                        <li>強み: {soloResult.type.strengths.join(' / ')}</li>
                        <li>気をつける: {soloResult.type.caution}</li>
                    </ul>
                </section>
            )}

            {renderResult()}

            {/* Status Card - Always shown (Moved to bottom) */}
            <section className="card">
                {!isOwner && hasLocal && !pairResultId && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3>回答を送信しました</h3>
                        <p>相手の回答と接続がそろうと自動で結果が表示されます。</p>
                    </div>
                )}
                <p className="eyebrow">接続状況</p>
                <div className="status">
                    <span className={"status-dot " + statusDotClass} />
                    {P2P_STATUS_TEXT[p2p.status] ?? ("接続状態: " + p2p.status)}
                </div>
                <div className="status secondary">
                    <span className={"status-dot " + (hasLocal ? "on" : "wait")} />
                    あなた: {hasLocal ? "回答済み" : "回答中"}
                </div>
                <div className="status secondary">
                    <span className={"status-dot " + (hasRemote ? "on" : "wait")} />
                    相手: {hasRemote ? "回答受信済み" : "回答を待っています"}
                </div>
                {!pairResultId && (
                    <div className="status secondary">
                        {bothAnswered ? (
                            <>
                                <span className="spinner" aria-hidden />
                                <span>結果を生成中…もう少し待ってね</span>
                            </>
                        ) : (
                            <span>二人とも答え終わると自動で結果が出ます</span>
                        )}
                    </div>
                )}
                {p2p.status !== "connected" && (
                    <div className="cta-row">
                        <button className="btn small" onClick={() => isOwner ? p2p.restart() : invite && p2p.connect(invite.sid)}>
                            手動で再接続
                        </button>
                    </div>
                )}
                {bothAnswered && !pairResultId && (
                    <div className="cta-row">
                        <button className="btn small ghost" disabled>結果生成中…</button>
                    </div>
                )}
            </section>

            {!pairResultId && (
                <section className="card subtle">
                    <h4>接続がうまくいかないとき</h4>
                    <ul>
                        <li>お互いのブラウザでこのページを開いたままにする</li>
                        <li>15〜20秒待っても繋がらなければ再読み込みする</li>
                        <li>それでもだめなら個人結果（単独モード）を使ってもOK</li>
                    </ul>
                </section>
            )}

            {showInviteQR && invite && <QRModal title="招待リンクのQR" link={inviteLink} onClose={() => setShowInviteQR(false)} />}
            {showMyQR && effectivePayloads && (
                <QRModal
                    title="結果QR（あなた用）"
                    link={`${window.location.origin}${window.location.pathname}# / result ? d = ${encodePayload(effectivePayloads[currentView])} `}
                    onClose={() => setShowMyQR(false)}
                />
            )}
            {/* Partner QR Modal Removed */}
        </div>
    );
};

export default InvitePage;
