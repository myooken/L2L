import { useEffect, useMemo } from 'react';
import projectLicense from '../../LICENSE?raw';
import thirdPartyMd from '../../docs/licenses/THIRD-PARTY-LICENSES.md?raw';
import attributionMd from '../../docs/licenses/ATTRIBUTION.md?raw';

// docs/ 配下を自動列挙して、ファイルを増やすだけで UI にも反映されるようにする
const licenseTextModules = import.meta.glob('../../docs/licenses/texts/*.txt', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;
const noticeModules = import.meta.glob('../../docs/licenses/notices/*.txt', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const THIRD_PARTY_URL = 'https://github.com/byoo-myoo/L2L/blob/main/THIRD-PARTY-LICENSES.md';
const LICENSES_JSON_URL = 'https://github.com/byoo-myoo/L2L/blob/main/licenses.json';
const REPO_URL = 'https://github.com/byoo-myoo/L2L';

type FileEntry = { id: string; fileName: string; content: string };

const normalizeEntries = (modules: Record<string, string>): FileEntry[] =>
  Object.entries(modules)
    .map(([key, content]) => {
      const fileName = key.split('/').pop() ?? key;
      const id = fileName.replace(/\.txt$/i, '');
      return { id, fileName, content };
    })
    .sort((a, b) => a.id.localeCompare(b.id));

const LicensePage = () => {
  const licenseTexts = useMemo(() => normalizeEntries(licenseTextModules), []);
  const noticeFiles = useMemo(() => normalizeEntries(noticeModules), []);
  const hasThirdParty = Boolean(thirdPartyMd?.trim());
  const hasAttribution = Boolean(attributionMd?.trim());

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'smooth' });
  }, []);

  return (
    <div className="page">
      <section className="card">
        <p className="eyebrow">Legal</p>
        <h1 className="page-title">Licenses & Notices</h1>
        <p className="hint">
          プロジェクト本体（MIT）と依存ライブラリのライセンス・NOTICE・Attribution をまとめて表示します。
        </p>
        <div className="license-links">
          <a className="btn small" href={REPO_URL} target="_blank" rel="noreferrer">
            GitHub repository
          </a>
          <a className="btn small" href={THIRD_PARTY_URL} target="_blank" rel="noreferrer">
            Third-party licenses (GitHub)
          </a>
        </div>
      </section>

      <section className="card" id="project-license">
        <p className="eyebrow">This Project</p>
        <h3 className="page-title">MIT License</h3>
        <p className="hint">package.json の `license` と同じ内容です。</p>
        <details className="license-box" open>
          <summary className="small">Full text</summary>
          <pre className="license-text">{projectLicense}</pre>
        </details>
      </section>

      <section className="card" id="third-party">
        <p className="eyebrow">Third-Party Summary</p>
        <h3 className="page-title">依存ライブラリ一覧</h3>
        <p className="small">
          CI で生成した THIRD-PARTY-LICENSES.md をそのまま埋め込んでいます。GitHub 版や licenses.json も参照できます。
        </p>
        <div className="license-links">
          <a className="btn small" href={THIRD_PARTY_URL} target="_blank" rel="noreferrer">
            Open on GitHub
          </a>
          <a className="btn small ghost" href={LICENSES_JSON_URL} target="_blank" rel="noreferrer">
            licenses.json
          </a>
        </div>
        {hasThirdParty ? (
          <details className="license-box" open>
            <summary className="small">THIRD-PARTY-LICENSES.md</summary>
            <pre className="license-text">{thirdPartyMd}</pre>
          </details>
        ) : (
          <div className="license-box license-error" role="alert">
            <p className="small">
              THIRD-PARTY-LICENSES.md がビルドに含まれていません。`npm run licenses:scan` で生成してください。
            </p>
          </div>
        )}
      </section>

      <section className="card" id="license-texts">
        <p className="eyebrow">License Texts</p>
        <h3 className="page-title">依存ライセンス本文</h3>
        <p className="small">docs/licenses/texts/ をディレクトリ走査して <code>{'<details>'}</code> で列挙しています。</p>
        {licenseTexts.length === 0 ? (
          <div className="license-box license-error" role="alert">
            <p className="small">
              docs/licenses/texts が空です。`npm run licenses:check` で不足を確認し、必要な本文を追加してください。
            </p>
          </div>
        ) : (
          <div className="license-list">
            {licenseTexts.map((entry) => (
              <details key={entry.fileName} className="license-box">
                <summary className="small">{entry.id}</summary>
                <pre className="license-text">{entry.content}</pre>
              </details>
            ))}
          </div>
        )}
      </section>

      <section className="card" id="notices">
        <p className="eyebrow">Notices</p>
        <h3 className="page-title">Apache NOTICE</h3>
        <p className="small">docs/licenses/notices/ をディレクトリ走査しています（Apache-2.0 で NOTICE があるもののみ）。</p>
        {noticeFiles.length === 0 ? (
          <div className="license-box">
            <p className="small">収集済み NOTICE はありません。</p>
          </div>
        ) : (
          <div className="license-list">
            {noticeFiles.map((entry) => (
              <details key={entry.fileName} className="license-box">
                <summary className="small">{entry.fileName}</summary>
                <pre className="license-text">{entry.content}</pre>
              </details>
            ))}
          </div>
        )}
      </section>

      <section className="card" id="attribution">
        <p className="eyebrow">Attribution</p>
        <h3 className="page-title">CC-BY 系の出典</h3>
        {hasAttribution ? (
          <details className="license-box" open>
            <summary className="small">ATTRIBUTION.md</summary>
            <pre className="license-text">{attributionMd}</pre>
          </details>
        ) : (
          <div className="license-box">
            <p className="small">必要な Attribution はありません。</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default LicensePage;
