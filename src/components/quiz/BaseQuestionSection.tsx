import LikertQuestionBlock from "./LikertQuestionBlock";
import type { Question } from "../../domain/types";

interface BaseQuestionSectionProps {
    questions: Question[];
    answers: Record<number, number>;
    onSelect: (questionId: number, value: number) => void;
}

const BaseQuestionSection = ({ questions, answers, onSelect }: BaseQuestionSectionProps) => (
    <section className="card">
        <p className="eyebrow">最初の10問</p>
        {questions.map((q, idx) => (
            <LikertQuestionBlock
                key={q.id}
                question={q}
                displayIndex={idx + 1}
                selected={answers[q.id] ?? 0}
                onSelect={(v) => onSelect(q.id, v)}
            />
        ))}
    </section>
);

export default BaseQuestionSection;
