import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import QuizForm from '../components/QuizForm';
import { calculatePersonalResult } from '../domain/scoring';
import { encodePayload } from '../utils/urlState';
import type { InvitePayload, Role, UserAnswers } from '../domain/types';

const QuizPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const role = (searchParams.get('role') as Role) ?? 'owner';
    const sidFromQuery = searchParams.get('sid');

    const sessionId = useMemo(() => sidFromQuery ?? uuid(), [sidFromQuery]);

    const [bonusQuestionText, setBonusQuestionText] = useState<string>('');
    const [bonusLabelText, setBonusLabelText] = useState<string>('');
    const [bonusScaleMin, setBonusScaleMin] = useState<string>('まったり');
    const [bonusScaleMax, setBonusScaleMax] = useState<string>('しっかり');

    const handleComplete = (answers: UserAnswers) => {
        window.scrollTo(0, 0);
        const personal = calculatePersonalResult(answers);

        if (role === 'owner') {
            const invitePayload: InvitePayload = {
                v: 1,
                role: 'owner',
                sid: sessionId,
                typeHint: personal.typeId,
                bonusQ: bonusQuestionText.trim() || undefined,
                bonusLabel: bonusLabelText.trim() || undefined,
                bonusMin: bonusScaleMin.trim() || undefined,
                bonusMax: bonusScaleMax.trim() || undefined,
            };
            const encoded = encodePayload(invitePayload);
            navigate(`/invite?d=${encoded}`, {
                state: {
                    ownerAnswers: answers,
                    personalResult: personal,
                    sessionId,
                    bonusQuestionText,
                    bonusLabelText,
                    bonusScaleMin,
                    bonusScaleMax,
                },
            });
        } else {
            navigate('/', { replace: true });
        }
    };

    return (
        <div className="page">
            <QuizForm
                role={role}
                headline="質問に答えてね"
                onComplete={handleComplete}
                bonusQuestionText={bonusQuestionText}
                onBonusQuestionChange={setBonusQuestionText}
                bonusLabelText={bonusLabelText}
                onBonusLabelChange={setBonusLabelText}
                bonusScaleMinText={bonusScaleMin}
                bonusScaleMaxText={bonusScaleMax}
                onBonusScaleMinChange={setBonusScaleMin}
                onBonusScaleMaxChange={setBonusScaleMax}
            />
        </div>
    );
};

export default QuizPage;
