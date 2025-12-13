# Deploy Guide — L2L

L2L は静的 SPA（HashRouter）なので、ビルド済み `dist/` を任意のホスティングへ配置するだけで動作します。`vite.config.ts` の `base: './'` で GitHub Pages 配信を前提に設定済みです。

---

## 🚀 GitHub Pages（推奨）
`.github/workflows/deploy.yml` が `main` への push / 手動実行で以下を行います:
1. Node 20 で `npm ci`
2. `npm run build`
3. `dist/` を Pages へ公開（`actions/deploy-pages`）

### 初回設定
- リポジトリ Settings → Pages で Source を「GitHub Actions」にする
- （任意）PeerJS / TURN の環境変数を使う場合は、リポジトリ Secrets に登録し、ワークフローの build ステップで `env:` として注入する

---

## 🧭 手動デプロイ
ローカルでビルドして `dist/` を任意ホスティング、または `gh-pages` ブランチに配置します。
```bash
npm ci
npm run build
# 例: gh-pages ブランチへ送る場合
git subtree push --prefix dist origin gh-pages
```

### ビルド確認
```bash
npm run preview
```
`http://localhost:4173` でビルド済みの挙動を確認できます。

---

## ✅ デプロイ前チェックリスト
- `npm run test` / `npm run lint` が通っている
- `VITE_PEERJS_*` / `VITE_TURN_*` を必要に応じて設定した状態で `npm run build` を実行
- GitHub Pages へ公開する場合、ルートに `#/` を含む HashRouter で遷移できることをブラウザで確認

---

## ℹ その他
- ライセンス情報は CI（`license-check` ジョブ）で `THIRD-PARTY-LICENSES.md` に更新されます。公開前に最新化してください。
- 他ホスティング（Vercel / Netlify 等）でも静的配信でそのまま動作します。
