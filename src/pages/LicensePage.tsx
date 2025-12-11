import licenseText from '../../LICENSE?raw';
import thirdPartyLicenses from '../../THIRD-PARTY-LICENSES.md?raw';
import { useEffect } from 'react';

const THIRD_PARTY_URL = 'https://github.com/byoo-myoo/L2L/blob/main/THIRD-PARTY-LICENSES.md';
const LICENSES_JSON_URL = 'https://github.com/byoo-myoo/L2L/blob/main/licenses.json';
const REPO_URL = 'https://github.com/byoo-myoo/L2L';

const LicensePage = () => {
  const hasThirdParty = Boolean(thirdPartyLicenses?.trim());

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'smooth' });
  }, []);

  return (
    <div className="page">
      <section className="card">
        <p className="eyebrow">Legal</p>
        <h1 className="page-title">License & Credits</h1>
        <p className="hint">L2L本体と依存ライブラリのライセンス情報をまとめています。</p>
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
        <p className="eyebrow">Project</p>
        <h3 className="page-title">L2L License (MIT)</h3>
        <p className="hint">package.json の license と同じ内容です。</p>
        <div className="license-text" aria-label="MIT License">
          <pre>{licenseText}</pre>
        </div>
      </section>

      <section className="card" id="third-party">
        <p className="eyebrow">Dependencies</p>
        <h3 className="page-title">Third-party licenses</h3>
        <p className="small">
          依存ライブラリのライセンス一覧は CI で生成する THIRD-PARTY-LICENSES.md にまとまっています。ビルド時にバンドルされる
          ので、静的ホスティングでも 404 になりません。
        </p>
        <ul className="small">
          <li>THIRD-PARTY-LICENSES.md … license-checker で生成する集約版（バンドル済み）</li>
          <li>licenses.json … 生の license-checker 出力（GitHub 参照）</li>
        </ul>

        <div className="license-links">
          <a className="btn small" href={THIRD_PARTY_URL} target="_blank" rel="noreferrer">
            Open on GitHub
          </a>
          <a className="btn small ghost" href={LICENSES_JSON_URL} target="_blank" rel="noreferrer">
            licenses.json
          </a>
        </div>

        {hasThirdParty ? (
          <div className="license-text license-box" aria-label="Third-party licenses">
            <pre>{thirdPartyLicenses}</pre>
          </div>
        ) : (
          <div className="license-box license-error" role="alert">
            <p className="small">
              THIRD-PARTY-LICENSES.md がビルドに含まれていません。CI のライセンス生成を実行し、ファイルを更新してください。
            </p>
            <div className="license-links">
              <a className="btn small" href={THIRD_PARTY_URL} target="_blank" rel="noreferrer">
                GitHub で確認
              </a>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default LicensePage;
