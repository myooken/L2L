import HeartScale from "./HeartScale";
import LikertQuestionBlock from "./LikertQuestionBlock";
import type { Question, Role } from "../../domain/types";

export type FollowupBlock = { kind: "followup"; question: Question } | { kind: "bonus" };

interface FollowupQuestionListProps {
    role: Role;
    baseCount: number;
    blocks: FollowupBlock[];
    answers: Record<number, number>;
    bonusAnswer: number | null;
    bonusQuestionText: string;
    bonusScaleMinText: string;
    bonusScaleMaxText: string;
    bonusAriaLabel: string;
    onSelect: (questionId: number, value: number) => void;
    onBonusChange: (value: number) => void;
}

const FollowupQuestionList = ({
    role,
    baseCount,
    blocks,
    answers,
    bonusAnswer,
    bonusQuestionText,
    bonusScaleMinText,
    bonusScaleMaxText,
    bonusAriaLabel,
    onSelect,
    onBonusChange,
}: FollowupQuestionListProps) => (
    <section className="card">
        <p className="eyebrow">質問の続き</p>
        {blocks
            .filter((item) => !(item.kind === "bonus" && role === "owner"))
            .map((item, idx) => {
                const displayIndex = baseCount + idx + 1;
                if (item.kind === "bonus") {
                    const selected = bonusAnswer ?? 0;
                    return (
                        <div key="bonus-block" id="q-block-bonus" className="question-block">
                            <p className="eyebrow">Q{displayIndex}</p>
                            <h2>{bonusQuestionText || "追加質問"}</h2>
                            <div className="likert-block" role="group" aria-label={bonusAriaLabel || "追加質問"}>
                                <div className="likert-label-row">
                                    <span className="likert-label">{bonusScaleMinText}</span>
                                    <span className="likert-label right">{bonusScaleMaxText}</span>
                                </div>
                                <HeartScale value={selected || null} onChange={onBonusChange} />
                            </div>
                        </div>
                    );
                }
                return (
                    <LikertQuestionBlock
                        key={item.question.id}
                        question={item.question}
                        displayIndex={displayIndex}
                        selected={answers[item.question.id] ?? 0}
                        onSelect={(v) => onSelect(item.question.id, v)}
                    />
                );
            })}
    </section>
);

export default FollowupQuestionList;
