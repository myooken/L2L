import { useEffect, useState } from 'react';

const LICENSE_PATH = `${import.meta.env.BASE_URL ?? './'}THIRD-PARTY-LICENSE.md`;

const LicensePage = () => {
  const [licenseText, setLicenseText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLicense = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(LICENSE_PATH);
        if (!res.ok) {
          throw new Error(`THIRD-PARTY-LICENSE.md not found (HTTP ${res.status})`);
        }
        const text = await res.text();
        setLicenseText(text.trimEnd());
      } catch (err) {
        const message = err instanceof Error ? err.message : 'failed to load license file';
        setError(message);
        setLicenseText('');
      } finally {
        setIsLoading(false);
      }
    };

    window.scrollTo({ top: 0, behavior: 'auto' });
    fetchLicense();
  }, []);

  return (
    <div className="page">
      <section className="card">
        <p className="eyebrow">Legal</p>
        <h1 className="page-title">Third-party licenses</h1>
        <p className="hint">
          `npm run licenses:generate` で生成する THIRD-PARTY-LICENSE.md をそのまま表示します。
        </p>
      </section>

      <section className="card" id="third-party-license">
        <p className="eyebrow">Output</p>
        <h3 className="page-title">THIRD-PARTY-LICENSE.md</h3>

        {isLoading && <div className="license-box license-loading">Loading...</div>}

        {error && (
          <div className="license-box license-error" role="alert">
            <p className="small">
              ライセンスファイルを読み込めませんでした。生成済みか確認してください。
            </p>
            <p className="small">{error}</p>
            <p className="small code">npm run licenses:generate</p>
          </div>
        )}

        {!isLoading && !error && (
          <pre className="license-text" aria-label="THIRD-PARTY-LICENSE">
            {licenseText}
          </pre>
        )}
      </section>
    </div>
  );
};

export default LicensePage;
