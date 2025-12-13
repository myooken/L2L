# L2L — Love Diagnosis (P2P 相性診断)

React / TypeScript / Vite で作った 2 人用の相性診断 SPA です。10+α の質問に答えたあと QR / 共有リンクを渡し、PeerJS 経由で P2P 接続した瞬間にペア結果を計算します。サーバーに回答を保存しない実験的な学習プロジェクトです。

## 🚀 Demo
- GitHub Pages（準備中 / デプロイ済みならここに URL）

## ✨ Features
- 10 問 + 追加質問からなるラブスタイル診断。ソロ結果とペア結果を表示
- `owner` → `guest` の二段階フロー。回答後に招待 URL を LZ-string で圧縮し、QR コード生成・コピー・Web Share API に対応
- PeerJS で P2P データ転送。双方が同じ `sid` で接続できたときだけペア結果を算出（サーバーレス）
- HashRouter + `base: './'` で GitHub Pages 配信に対応
- Vitest + Testing Library / ESLint を導入。`licenses.json` と `THIRD-PARTY-LICENSES.md` は CI で自動生成

## 🛠 Tech Stack
- React 19, TypeScript, Vite
- PeerJS (WebRTC), lz-string, uuid
- react-router-dom (HashRouter), qrcode.react
- Vitest, @testing-library/react, ESLint

## 📂 Project Structure
- `src/pages`: Top / Quiz / Invite / Result / License ページ
- `src/components`: フォーム、結果ビュー、QR モーダル、ステータス表示などの UI パーツ
- `src/domain`: 質問データとスコアリング（ソロ / ペア）、タイプバリアント定義
- `src/p2p`・`src/hooks/useP2P.ts`: PeerJS ラッパーとメッセージ定義
- `src/utils`: URL 圧縮・共有ヘルパーなど
- `_script/check-licenses.mjs`: 依存ライセンスの簡易チェック（CI から呼び出し）

## 📦 Setup
1. Node.js 18+ / npm 9+ を用意  
2. 依存インストール: `npm ci`  
3. 開発サーバー: `npm run dev` を実行し `http://localhost:5173` へアクセス（HashRouter のため URL に `#/` が付きます）

### 環境変数（P2P 接続）
`.env.local` に必要なら次を設定します。未設定なら PeerJS デフォルトホスト + Google STUN で動作します。
```bash
VITE_PEERJS_HOST=your-peer-server.example.com
VITE_PEERJS_PORT=443
VITE_PEERJS_SECURE=true
VITE_PEERJS_PATH=/peerjs
VITE_TURN_URL=turn:example.com:3478
VITE_TURN_USERNAME=user
VITE_TURN_PASSWORD=pass
```
`VITE_TURN_URL` はカンマ区切り指定可。TURN 未設定でも動きますが接続性が下がります。

### npm scripts
- `npm run dev`: Vite 開発サーバー
- `npm run build`: 型チェック + 本番ビルド（`dist/`）
- `npm run preview`: ビルド済み成果物のローカル確認
- `npm run test` / `npm run test:ci`: Vitest
- `npm run lint`: ESLint

## 🚀 Deploy
- `vite.config.ts` の `base: './'` で GitHub Pages 配信を想定済み
- 手動: `npm run build` 後、`dist/` を `gh-pages` 等の公開ブランチへ配置
- 自動: `.github/workflows/deploy.yml` が `main` への push でビルド → Pages 反映

## 🧪 Testing / QA
- P2P の動作確認はブラウザを 2 タブ開き、`owner` と `guest` で同じ `sid` を使って接続してください
- ライセンス更新は `npx license-checker --json > licenses.json` → `_script/check-licenses.mjs` → `THIRD-PARTY-LICENSES.md` の順（CI でも実施）

## 📜 License
MIT License。依存ライブラリのライセンスは `THIRD-PARTY-LICENSES.md` を参照。

## 🗒️ Docs
- 環境構築: `SETUP.md`
- デプロイ: `DEPLOY.md`
