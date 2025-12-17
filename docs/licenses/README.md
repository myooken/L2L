# License Automation (MIT project)

This repo separates the project license (MIT) from third-party notices and publishes everything under `docs/licenses/` for GitHub Pages. License automation scripts live in `_script/` and are wrapped by npm scripts.

## Directories
- `docs/licenses/texts/*.txt`: SPDX license texts (one file per license id)
- `docs/licenses/notices/*.NOTICE.txt`: NOTICE files collected per package (`<pkg>@<version>`)
- `docs/licenses/ATTRIBUTION.md`: Required only when CC-BY* dependencies exist
- `docs/licenses/index.md`: Generated landing page that links everything above
- `docs/licenses/THIRD-PARTY-LICENSES.md`: Third-party licenses with full license texts (per package)
- `docs/licenses/THIRD-PARTY-NOTICES.md`: Aggregated NOTICE texts (per package)

## Local commands
```
npm run licenses:scan      # license-checker -> licenses.json + THIRD-PARTY-LICENSES.md (includes license text)
npm run licenses:notices   # collect NOTICE files -> docs/licenses/notices + THIRD-PARTY-NOTICES.md
npm run licenses:check     # policy: MIT project license, allowlist/denylist, texts/notices/attribution
npm run licenses:page      # build docs/licenses/index.md (+ copy third-party docs into docs/licenses)
```

## Policy highlights
- project license must be `MIT` (package.json)
- allow: MIT, MIT-0, ISC, BSD-2/3-Clause, Apache-2.0, CC0-1.0, CC-BY-3.0/4.0, BlueOak-1.0.0, Python-2.0
- deny: UNLICENSED/UNKNOWN, GPL*/AGPL*/LGPL*/MPL*, CC-BY-NC*
- every license used by a dependency must have `docs/licenses/texts/<ID>.txt`
- Deps with NOTICE must have `docs/licenses/notices/<pkg>@<ver>.NOTICE.txt`
- CC-BY* deps require `docs/licenses/ATTRIBUTION.md`

CI runs the same steps on `push` / `pull_request` via `.github/workflows/license.yml` and uploads `reports/` as artifacts on every run.
