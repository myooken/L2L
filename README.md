# L2L - Love Diagnosis (P2P 相性診断)

React / TypeScript / Vite で作った 2 人用の相性診断 SPA。10 問 + 追加質問に答えたあと QR / 共有リンクを渡し、PeerJS 経由で P2P 接続できた瞬間にペア結果を計算します。サーバーに回答を保存しない実験的なプロジェクトです。

## Application
- QR code: 

  ![L2L QR code](public/l2l-qr-code.png)  
  [https://myooken.github.io/L2L/](https://myooken.github.io/L2L/)

## Features
- 10 問 + 追加質問からなるラブスタイル診断。ソロ結果とペア結果を表示
- `owner` / `guest` の二段階フロー。回答後に招待 URL を LZ-string で圧縮し、QR 生成・コピー・Web Share API に対応
- PeerJS で P2P データ転送。双方が同じ `sid` で接続できたときだけペア結果を算出するサーバーレス構成
- HashRouter + `base: './'` で GitHub Pages 配信に対応
- Vitest + Testing Library / ESLint を導入。`licenses.json` と `THIRD-PARTY-LICENSES.md` は CI で自動生成

## Data & Privacy
- 本アプリは回答をサーバーに保存しません。回答は圧縮されて共有 URL に含まれ、招待を受け取った相手には閲覧可能です。
- URL を渡す相手・場所を慎重に選び、スクリーンショットやログなどで回答内容を外部に出さないでください。
- P2P 接続は PeerJS (WebRTC) で行います。TURN を設定しない場合は接続性が下がることがあります。
- TURN / PeerJS の資格情報をリポジトリやログに残さず、`.env.local` で管理してください。

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
- `_script/check-licenses.mjs`: 依存ライセンスの簡易チェッカー（CI から呼び出し）

## Setup
1. Node.js 18+ / npm 9+ を用意する
2. 依存インストール: `npm ci`
3. 開発サーバー: `npm run dev` を実行し `http://localhost:5173` へアクセス（HashRouter のため URL に `#/` が付きます）

### 環境変数（P2P 接続用）
`.env.local` に必要なら次を設定します。未設定なら PeerJS デフォルト + Google STUN で動作します。
```bash
VITE_PEERJS_HOST=your-peer-server.example.com
VITE_PEERJS_PORT=443
VITE_PEERJS_SECURE=true
VITE_PEERJS_PATH=/peerjs
VITE_TURN_URL=turn:example.com:3478
VITE_TURN_USERNAME=user
VITE_TURN_PASSWORD=pass
```
`VITE_TURN_URL` はカンマ区切りで複数指定も可。TURN 未設定でも動きますが接続性が下がります。

### npm scripts
- `npm run dev`: Vite 開発サーバー
- `npm run build`: 型チェック + 本番ビルド（`dist/` 出力）
- `npm run preview`: ビルド済み成果物のローカル確認
- `npm run test` / `npm run test:ci`: Vitest
- `npm run lint`: ESLint

## Deploy
- `vite.config.ts` の `base: './'` で GitHub Pages 配信を想定済み
- 手動: `npm run build` 後、`dist/` を `gh-pages` 等の公開ブランチへ配置
- 自動: `.github/workflows/deploy.yml` が `main` への push でビルドと Pages 反映

## Testing / QA
- P2P の動作確認はブラウザで 2 タブ開き、`owner` と `guest` で同じ `sid` を使って接続してください
- ライセンス更新は `npx license-checker --json > licenses.json` → `_script/check-licenses.mjs` → `THIRD-PARTY-LICENSES.md` の順で実施

## License
MIT License。依存ライブラリのライセンスは `THIRD-PARTY-LICENSES.md` を参照してください。

## Docs
- セットアップ: `SETUP.md`
- デプロイ: `DEPLOY.md`
