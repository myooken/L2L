import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TEXT } from '../const/text';
import { SOLO_VARIANT_LIST, DUO_VARIANT_LIST } from '../domain/scoring';
import { copyToClipboard, shareLink } from '../utils/share';
import { QRModal } from '../components/QRModal';

const TopPage = () => {
    const navigate = useNavigate();
    const [showQR, setShowQR] = useState(false);
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
    const shareTarget = `${window.location.origin}${window.location.pathname}`;

    const baseColorMap: Record<'1' | '2' | '3' | '4', string> = {
        '1': '#2fba62', // harmony / green
        '2': '#2fbad3', // calm / aqua
        '3': '#ffb347', // lead / amber
        '4': '#ff4940', // passion / red
    };
    const duoColorMap: Record<string, string> = {
        'sync-strong': '#2fba62',
        'sync-soft': '#2fbad3',
        'complement-active': '#ffb347',
        'complement-gentle': '#ffb347',
        'contrast-explore': '#ff4940',
        'contrast-guard': '#ff4940',
        'drift-stable': '#9b8cf8',
        'drift-bridge': '#9b8cf8',
    };

    const handleCopy = () => {
        copyToClipboard(shareTarget).then((ok) => {
            if (ok) {
                setCopyStatus('copied');
                setTimeout(() => setCopyStatus('idle'), 2000);
            }
        });
    };

    return (
        <div className="page">
            <section className="hero">
                <div className="hero-content">
                    {/* <p className="eyebrow">{TEXT.hero.eyebrow}</p> */}
                    <h1 style={{ whiteSpace: 'pre-wrap' }}>{TEXT.hero.title}</h1>
                    <p className="lede">{TEXT.hero.lead}</p>
                    <div className="cta-row">
                        <button className="btn primary" onClick={() => navigate('/quiz')}>
                            {TEXT.hero.ctaPrimary}
                        </button>
                    </div>
                    {/* <ul className="pill-list">
                        {TEXT.hero.pills.map((pill) => (
                            <li key={pill}>{pill}</li>
                        ))}
                    </ul> */}
                </div>
            </section>

            {/* <section className="grid two">
                <div className="card">
                    <h3>{TEXT.steps.do.title}</h3>
                    <p>{TEXT.steps.do.body}</p>
                </div>
                <div className="card">
                    <h3>{TEXT.steps.pair.title}</h3>
                    <p>{TEXT.steps.pair.body}</p>
                </div>
            </section> */}

            <section className="card">
                <p className="eyebrow">共有してね</p>
                <h3>すぐ誘えるシェアカード</h3>
                <p className="hint">リンクをコピー or QRを表示。ネイティブ共有にも対応しています。</p>
            <div className="cta-row">
                <div className="btn-wrapper">
                    <button className="btn small" onClick={handleCopy}>🔗 リンクをコピー</button>
                    {copyStatus === 'copied' && <span className="copy-feedback" style={{ marginLeft: 8 }}>コピーしました</span>}
                </div>
                <div className="btn-wrapper">
                    <button className="btn small" onClick={() => setShowQR(true)}>📱 QRコード</button>
                </div>
                <div className="btn-wrapper">
                    <button className="btn small" onClick={() => shareLink(shareTarget, 'Love Diagnosis')}>
                        📤 シェアする
                    </button>
                </div>
            </div>
            </section>

            <section className="card">
                <p className="eyebrow">ソロタイプ一覧（16）</p>
                <div className="grid two">
                    {SOLO_VARIANT_LIST.map((v) => (
                        <div
                            key={v.id}
                            className="mini-card"
                            style={{
                                border: `1px solid ${baseColorMap[v.id[0] as '1' | '2' | '3' | '4'] ?? '#d1d5db'}`,
                                borderRadius: 12,
                            }}
                        >
                            <h4>
                                {v.emoji ? `${v.emoji} ` : ''}{v.label}
                            </h4>
                            <p className="eyebrow" style={{ marginTop: '0.25rem' }}>{v.avatar}</p>
                            <p className="small">{v.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="card">
                <p className="eyebrow">デュオタイプ一覧（8）</p>
                <div className="grid two">
                    {DUO_VARIANT_LIST.map((v) => (
                        <div
                            key={v.id}
                            className="mini-card"
                            style={{
                                border: `1px solid ${duoColorMap[v.id] ?? '#d1d5db'}`,
                                borderRadius: 12,
                            }}
                        >
                            <h4>
                                {v.emoji ? `${v.emoji} ` : ''}{v.title}
                            </h4>
                            <p className="small">{v.message}</p>
                            <ul className="small">
                                {v.tips.slice(0, 2).map((t) => (
                                    <li key={t}>{t}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {showQR && (
                <QRModal
                    title="トップページのQR"
                    link={shareTarget}
                    onClose={() => setShowQR(false)}
                />
            )}
        </div>
    );
};

export default TopPage;
