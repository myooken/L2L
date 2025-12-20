# L2L - Love Diagnosis (P2P 相性診断)

React / TypeScript / Vite で作る 2 人用の相性診断 SPA です。10 問 + α に答え、PeerJS で P2P 接続できた瞬間にペア結果を計算します（サーバーレス）。

## Application
- QR code:  
  ![L2L QR code](public/l2l-qr-code.png)  
  [https://myooken.github.io/L2L/](https://myooken.github.io/L2L/)

## Features
- 10 問 + α のラブスタイル診断。ソロ結果とペア結果を表示
- `owner` / `guest` の二段階フロー。回答後に招待 URL を LZ-string で圧縮し、QR / コピー / Web Share API に対応。PeerJS で P2P データ転送し、同じ `sid` で接続できたときだけペア結果を算出するサーバーレス構成
- HashRouter + `base: './'` で GitHub Pages 配信に対応
- Vitest + Testing Library / ESLint を導入
- `npm run licenses:generate` で @myooken/license-output を使い THIRD-PARTY-LICENSE.md を生成（手動、GitHub Actions なし）

## Data & Privacy
- 回答はサーバーに保存しません。圧縮した回答を含む共有 URL を受け取った相手だけが閲覧できます
- P2P 接続は PeerJS (WebRTC) で行います。TURN 未設定の環境では接続性が下がることがあります
- TURN / PeerJS の認証情報はリポジトリに残さず `.env.local` で管理してください

## Tech Stack
- React 19, TypeScript, Vite
- PeerJS (WebRTC), lz-string, uuid
- react-router-dom (HashRouter), qrcode.react
- Vitest, @testing-library/react, ESLint

## Project Structure
- `src/pages`: Top / Quiz / Invite / Result / License ページ
- `src/components`: フォーム、結果ビュー、QR モーダル、ステータス表示などの UI パーツ
- `src/domain`: 質問データとスコアリング（ソロ / ペア）、タイプバリアント定義
- `src/p2p`・`src/hooks/useP2P.ts`: PeerJS ランチャーとメッセージ定義
- `src/utils`: URL 圧縮・共有ヘルパーなど

## Setup
1. Node.js 18+ / npm 9+ を用意
2. 依存インストール: `npm ci`
3. 開発サーバー: `npm run dev` を実行し `http://localhost:5173`（HashRouter なので `#/` 付き）へアクセス

### 環境変数（P2P 接続）
`.env.local` などに必要なら次を設定します。未設定ならデフォルトの PeerJS ホスト + Google STUN で動作します。
```bash
VITE_PEERJS_HOST=your-peer-server.example.com
VITE_PEERJS_PORT=443
VITE_PEERJS_SECURE=true
VITE_PEERJS_PATH=/peerjs
VITE_TURN_URL=turn:example.com:3478
VITE_TURN_USERNAME=user
VITE_TURN_PASSWORD=pass
```
`VITE_TURN_URL` はカンマ区切りで複数指定も可。

### npm scripts
- `npm run dev`: 開発サーバー
- `npm run build`: 型チェック + 本番ビルド（`dist/` 出力）
- `npm run preview`: ビルド済み成果物をローカル配信
- `npm run test` / `npm run test:ci`: Vitest
- `npm run lint`: ESLint
- `npm run format`: ESLint --fix
- `npm run licenses:generate`: @myooken/license-output で THIRD-PARTY-LICENSE.md / THIRD-PARTY-LICENSE-REVIEW.md を生成

## Deploy
- `vite.config.ts` の `base: './'` で GitHub Pages 配信を想定済み
- 手動: `npm run build` 後に `dist/` を Pages 用ブランチ等へ配置
- 自動: `.github/workflows/deploy.yml` で `main` への push からビルド & Pages 反映

## Testing / QA
- P2P の動作確認はブラウザで 2 タブ開き、`owner` と `guest` で同じ `sid` を使って接続
- 公開前に `npm run licenses:generate` で THIRD-PARTY-LICENSE.md を更新し、`/#/licenses` ページで表示を確認

## License
MIT License。依存ライブラリのライセンスは `THIRD-PARTY-LICENSE.md`（`npm run licenses:generate` で生成）を参照してください。

## Docs
- セットアップ: `SETUP.md`
- デプロイ: `DEPLOY.md`
