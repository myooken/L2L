import { useEffect, useMemo } from 'react';
import projectLicense from '../../LICENSE?raw';

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

const licenseDocModules = import.meta.glob('../../docs/licenses/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const THIRD_PARTY_URL = 'https://github.com/byoo-myoo/L2L/blob/main/THIRD-PARTY-LICENSES.md';
const LICENSES_JSON_URL = 'https://github.com/byoo-myoo/L2L/blob/main/licenses.json';
const REPO_URL = 'https://github.com/byoo-myoo/L2L';

type FileEntry = { id: string; fileName: string; content: string };

const normalizeEntries = (
  modules: Record<string, string>,
  options?: { keepExtension?: boolean },
): FileEntry[] =>
  Object.entries(modules)
    .map(([key, content]) => {
      const fileName = key.split('/').pop() ?? key;
      const id = options?.keepExtension ? fileName : fileName.replace(/\.[^.]+$/i, '');
      return { id, fileName, content };
    })
    .sort((a, b) => a.id.localeCompare(b.id));

const pickDoc = (entries: FileEntry[], target: string) =>
  entries.find((entry) => entry.fileName.toLowerCase() === target.toLowerCase());

const LicensePage = () => {
  const licenseTexts = useMemo(() => normalizeEntries(licenseTextModules), []);
  const noticeFiles = useMemo(() => normalizeEntries(noticeModules, { keepExtension: true }), []);
  const docFiles = useMemo(() => normalizeEntries(licenseDocModules, { keepExtension: true }), []);

  const thirdPartyDoc = useMemo(
    () => pickDoc(docFiles, 'THIRD-PARTY-LICENSES.md'),
    [docFiles],
  );
  const attributionDoc = useMemo(() => pickDoc(docFiles, 'ATTRIBUTION.md'), [docFiles]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <div className="page">
      <section className="card">
        <p className="eyebrow">Legal</p>
        <h1 className="page-title">Licenses</h1>
        <p className="hint">
          docs/licenses 配下のテキストファイルをビルド時に読み込み、プレーンテキストのまま表示します。
        </p>
        <div className="license-links">
          <a className="btn small" href={REPO_URL} target="_blank" rel="noreferrer">
            GitHub repository
          </a>
          <a className="btn small" href={THIRD_PARTY_URL} target="_blank" rel="noreferrer">
            Third-party list
          </a>
          <a className="btn small ghost" href={LICENSES_JSON_URL} target="_blank" rel="noreferrer">
            licenses.json
          </a>
        </div>
      </section>

      <section className="card" id="project-license">
        <p className="eyebrow">This project</p>
        <h3 className="page-title">MIT License</h3>
        <p className="small">package.json の license と同じ内容です。</p>
        <pre className="license-text">{projectLicense}</pre>
      </section>

      <section className="card" id="third-party">
        <p className="eyebrow">Third-party</p>
        <h3 className="page-title">依存ライブラリ一覧</h3>
        <p className="small">docs/licenses/THIRD-PARTY-LICENSES.md をそのまま表示します。</p>
        {thirdPartyDoc?.content.trim() ? (
          <pre className="license-text">{thirdPartyDoc.content}</pre>
        ) : (
          <div className="license-box license-error" role="alert">
            <p className="small">
              docs/licenses/THIRD-PARTY-LICENSES.md が見つかりません。`npm run licenses:scan`
              を実行して生成してください。
            </p>
          </div>
        )}
      </section>

      <section className="card" id="license-texts">
        <p className="eyebrow">License texts</p>
        <h3 className="page-title">依存ライセンス本文</h3>
        <p className="small">docs/licenses/texts 配下の *.txt をフォルダ走査して表示します。</p>
        {licenseTexts.length === 0 ? (
          <div className="license-box license-error" role="alert">
            <p className="small">
              docs/licenses/texts が空です。`npm run licenses:check` で不足を確認してください。
            </p>
          </div>
        ) : (
          <div className="license-list">
            {licenseTexts.map((entry) => (
              <article key={entry.fileName} className="license-block">
                <div className="license-block-header">
                  <span className="license-name">{entry.id}</span>
                  <span className="license-file">{entry.fileName}</span>
                </div>
                <pre className="license-text">{entry.content}</pre>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="card" id="notices">
        <p className="eyebrow">Notices</p>
        <h3 className="page-title">Apache NOTICE</h3>
        <p className="small">docs/licenses/notices 配下をフォルダ走査して表示します。</p>
        {noticeFiles.length === 0 ? (
          <div className="license-box">
            <p className="small">収集済み NOTICE はありません。</p>
          </div>
        ) : (
          <div className="license-list">
            {noticeFiles.map((entry) => (
              <article key={entry.fileName} className="license-block">
                <div className="license-block-header">
                  <span className="license-name">{entry.id}</span>
                  <span className="license-file">{entry.fileName}</span>
                </div>
                <pre className="license-text">{entry.content}</pre>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="card" id="attribution">
        <p className="eyebrow">Attribution</p>
        <h3 className="page-title">CC-BY 系の出典</h3>
        {attributionDoc?.content.trim() ? (
          <pre className="license-text">{attributionDoc.content}</pre>
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
