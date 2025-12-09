import React, { useMemo, useState } from 'react';
import { pickFollowupQuestions, shuffleBaseQuestions } from '../domain/questions';
import type { Role, UserAnswers, Question } from '../domain/types';
import BonusQuestionEditor from './quiz/BonusQuestionEditor';
import ProgressBar from './quiz/ProgressBar';
import BaseQuestionSection from './quiz/BaseQuestionSection';
import FollowupQuestionList, { type FollowupBlock } from './quiz/FollowupQuestionList';
import { calculateScoreVector } from '../domain/scoring';
import { BONUS_CREATION_HINT, DEFAULT_BONUS_MAX_LABEL, DEFAULT_BONUS_MIN_LABEL, FOLLOWUP_QUESTION_COUNT } from '../const/quiz';

interface QuizFormProps {
    role: Role;
    headline?: string;
    onComplete: (answers: UserAnswers) => void;
    bonusQuestionText?: string;
    onBonusQuestionChange?: (text: string) => void;
    bonusLabelText?: string; // kept for compatibility (mirrors question text)
    onBonusLabelChange?: (text: string) => void;
    bonusScaleMinText?: string;
    bonusScaleMaxText?: string;
    onBonusScaleMinChange?: (text: string) => void;
    onBonusScaleMaxChange?: (text: string) => void;
}

const QuizForm: React.FC<QuizFormProps> = ({
    role,
    headline,
    onComplete,
    bonusQuestionText = '',
    onBonusQuestionChange,
    bonusLabelText = '',
    onBonusLabelChange,
    bonusScaleMinText = DEFAULT_BONUS_MIN_LABEL,
    bonusScaleMaxText = DEFAULT_BONUS_MAX_LABEL,
    onBonusScaleMinChange,
    onBonusScaleMaxChange,
}: QuizFormProps) => {
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [followups, setFollowups] = useState<Question[]>([]);
    const [step, setStep] = useState<'base' | 'followup'>('base');
    const [bonusAnswer, setBonusAnswer] = useState<number | null>(null);

    const baseQuestions = useMemo(() => shuffleBaseQuestions(), []);

    const hasBonusText = bonusQuestionText.trim().length > 0;
    const bonusAriaLabel = bonusLabelText.trim() || bonusQuestionText;

    // Scroll to top when moving into the followup (追加質問作成) step
    React.useEffect(() => {
        if (step !== 'followup') return;
        if (typeof window === 'undefined') return;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [step]);

    const baseAnsweredCount = baseQuestions.filter((q) => answers[q.id] !== undefined).length;
    const baseAnsweredAll = baseAnsweredCount === baseQuestions.length;
    const followupsAnsweredCount =
        followups.filter((q) => answers[q.id] !== undefined).length + (hasBonusText && bonusAnswer !== null ? 1 : 0);
    const followupsReady = followups.length > 0;
    const canPrepareFollowups = baseAnsweredAll && !followupsReady;
    const followupCountWithBonus = followups.length + (hasBonusText ? 1 : 0);

    const totalQuestions =
        step === 'base' ? baseQuestions.length : baseQuestions.length + followupCountWithBonus;
    const answeredQuestions =
        step === 'base' ? baseAnsweredCount : baseAnsweredCount + followupsAnsweredCount;
    const progress = Math.min((answeredQuestions / totalQuestions) * 100, 100);

    const followupsAnsweredAll = followupsReady && followups.every((q) => answers[q.id] !== undefined);

    const canSubmit =
        step === 'followup' &&
        baseAnsweredAll &&
        followupsReady &&
        followupsAnsweredAll &&
        (!hasBonusText || bonusAnswer !== null);

    const canSubmitGuest = canSubmit;
    const canSubmitOwner = canSubmit; // オーナーの追加質問は編集のみ

    // 先行して深掘り5問を準備（表示は「次へ」以降）
    React.useEffect(() => {
        if (!canPrepareFollowups) return;
        const baseOnly: Record<number, number> = {};
        baseQuestions.forEach((q) => {
            const val = answers[q.id];
            if (val !== undefined) baseOnly[q.id] = val;
        });
        const scoreVec = calculateScoreVector(baseOnly);
        setFollowups(pickFollowupQuestions(scoreVec, FOLLOWUP_QUESTION_COUNT));
    }, [canPrepareFollowups, baseQuestions, answers]);

    // renderLikertQuestion function removed.

    const shuffledFollowupBlocks: FollowupBlock[] = useMemo(() => {
        if (step !== 'followup') return [];
        const items: FollowupBlock[] = [
            ...followups.map((q) => ({ kind: 'followup' as const, question: q })),
            ...(hasBonusText ? [{ kind: 'bonus' as const }] : []),
        ];
        const arr = [...items];
        for (let i = arr.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }, [followups, hasBonusText, step]);

    const handleOptionSelect = (questionId: number, value: number) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    };

    const handleProceedToFollowup = () => {
        if (!baseAnsweredAll) {
            const missing = baseQuestions.find((q) => answers[q.id] === undefined);
            if (missing) {
                const el = document.getElementById(`q-block-${missing.id}`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        if (!followupsReady) {
            const baseOnly: Record<number, number> = {};
            baseQuestions.forEach((q) => {
                const val = answers[q.id];
                if (val !== undefined) baseOnly[q.id] = val;
            });
            const scoreVec = calculateScoreVector(baseOnly);
            setFollowups(pickFollowupQuestions(scoreVec, 5));
        }
        setStep('followup');
        // No auto-scroll on step change as requested
    };

    const handleSubmit = () => {
        // Validation & Scroll logic
        if (!followupsAnsweredAll) {
            const missing = followups.find((q) => answers[q.id] === undefined);
            if (missing) {
                const el = document.getElementById(`q-block-${missing.id}`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        if (hasBonusText && bonusAnswer === null) {
            // For guest, the ID is q-block-bonus handled in the loop.
            // For owner, duplicate answer block is hidden, so scroll to editor.
            // But we can just use the same ID 'q-block-bonus' if we assign it to the editor too?
            // Actually, for owner, the editor is at the bottom.
            // Let's use specific IDs.
            let el: HTMLElement | null = null;
            if (role === 'owner') {
                // The editor container
                // We need to add an ID to BonusQuestionEditor or its container?
                // BonusQuestionEditor is a component.
                // Let's try to scroll to the editor section or general area.
                // Or we can assume 'q-block-bonus' might not exist for owner in the list, but we can wrap editor?
                // But wait, in existing code, BonusQuestionEditor doesn't have an ID passed.
                // However, we can look for ".card" containing "追加質問（任意）" or similar.
                // Simplest: scroll to bottom if owner? Or specific selector.
                // Let's rely on checking if 'q-block-bonus' exists (guest), otherwise maybe the editor.
                el = document.getElementById('q-block-bonus'); // Guest
                // Owner doesn't render q-block-bonus in list, so it's null.
                if (!el) {
                    // Try to find the editor inputs
                    const inputs = document.querySelectorAll('input[type="text"]');
                    if (inputs.length > 0) {
                        // The first input is likely the bonus question text if it's the editor
                        // But better to be safe.
                        // Let's just scroll to the bottom of the page?
                        // Or finding the last .card?
                        const cards = document.querySelectorAll('.card');
                        el = cards[cards.length - 1] as HTMLElement;
                    }
                }
            } else {
                el = document.getElementById('q-block-bonus');
            }

            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        const canSubmit = role === 'owner' ? canSubmitOwner : canSubmitGuest;
        if (!canSubmit) return;
        const userAnswers: UserAnswers = {
            answers,
            bonusAnswerValue: hasBonusText ? bonusAnswer : null,
        };
        onComplete(userAnswers);
    };

    return (
        <div className="quiz-form">
            {headline && <h1 className="page-title">{headline}</h1>}

            <ProgressBar progress={progress} label={`${answeredQuestions}/${totalQuestions}`} />

            {step === 'base' && (
                <BaseQuestionSection questions={baseQuestions} answers={answers} onSelect={handleOptionSelect} />
            )}

            {step === 'followup' && (
                <>
                    <FollowupQuestionList
                        role={role}
                        baseCount={baseQuestions.length}
                        blocks={shuffledFollowupBlocks}
                        answers={answers}
                        bonusAnswer={bonusAnswer}
                        bonusQuestionText={bonusQuestionText}
                        bonusScaleMinText={bonusScaleMinText}
                        bonusScaleMaxText={bonusScaleMaxText}
                        bonusAriaLabel={bonusAriaLabel}
                        onSelect={handleOptionSelect}
                        onBonusChange={setBonusAnswer}
                    />

                    {role === 'owner' && (
                        <div id="bonus-editor-container">
                            <BonusQuestionEditor
                                questionText={bonusQuestionText}
                                onQuestionChange={(text) => {
                                    onBonusQuestionChange?.(text);
                                    onBonusLabelChange?.(text); // compatibility
                                }}
                                scaleMin={bonusScaleMinText}
                                scaleMax={bonusScaleMaxText}
                                onScaleMinChange={(text) => onBonusScaleMinChange?.(text)}
                                onScaleMaxChange={(text) => onBonusScaleMaxChange?.(text)}
                                value={bonusAnswer}
                                onSelect={setBonusAnswer}
                                hasQuestion={hasBonusText}
                                creationHint={BONUS_CREATION_HINT}
                            />
                        </div>
                    )}
                </>
            )}

            <div className="cta-row">
                {step === 'base' ? (
                    <button className="btn primary" onClick={handleProceedToFollowup}>
                        次へ
                    </button>
                ) : role === 'owner' ? (
                    <button className="btn primary" onClick={handleSubmit}>
                        診断結果へ
                    </button>
                ) : (
                    <button className="btn primary" onClick={handleSubmit}>
                        送信する
                    </button>
                )}
            </div>

            <p className="role-note">
                モード: <strong>{role === 'owner' ? 'あなた（招待する側）' : '相手（招待された側）'}</strong>
            </p>
        </div>
    );
};

export default QuizForm;
