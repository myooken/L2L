# Setup Guide — L2L

L2L は React / TypeScript / Vite で作る 2 人用の相性診断 SPA です。QR / 共有リンクを介して P2P で結果を照合するため、ローカル環境でもサーバーレスで動作します。

---

## ✔ 必要要件
- Node.js 18 以上
- npm 9 以上
- Git
- （任意）独自の PeerJS / TURN サーバー

---

## 📦 クローンとインストール
```bash
git clone <your-repo-url> L2L
cd L2L
npm ci
```

依存関係は package-lock.json に固定されています。`npm install` ではなく `npm ci` を推奨します。

---

## ⚙ 環境変数（P2P 接続）
`.env.local` に必要であれば次を設定してください。未指定でもデフォルトの PeerJS ホスト + Google STUN で動作します。
```bash
VITE_PEERJS_HOST=your-peer-server.example.com
VITE_PEERJS_PORT=443
VITE_PEERJS_SECURE=true
VITE_PEERJS_PATH=/peerjs
VITE_TURN_URL=turn:example.com:3478
VITE_TURN_USERNAME=user
VITE_TURN_PASSWORD=pass
```
- `VITE_TURN_URL` はカンマ区切りで複数指定可  
- TURN を入れない場合、NAT 越えが難しい環境では接続が不安定になることがあります

---

## ▶ 開発サーバー起動
```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開くとアプリが表示されます（HashRouter のため URL に `#/` が入ります）。

### ざっくり動作フロー
1. Owner が「診断を始める」で 10+α の質問に回答  
2. 結果画面の招待 URL / QR をパートナーに共有（`sid` が招待コードに相当）  
3. Guest が回答すると PeerJS で双方接続し、端末内でペア結果を算出・表示

---

## 🧰 よく使う npm scripts
- `npm run dev` — 開発サーバー
- `npm run build` — 型チェック + 本番ビルド（`dist/`）
- `npm run preview` — ビルド済みをローカル配信
- `npm run test` / `npm run test:ci` — Vitest
- `npm run lint` — ESLint

---

## 🧪 テスト / 品質
- 単体・UI テスト: `npm run test`
- Lint: `npm run lint`
- 依存ライセンス更新:
  1. `npx license-checker --json > licenses.json`
  2. `node _script/check-licenses.mjs`
  3. `npx license-checker --production --relativeLicensePath --markdown > THIRD-PARTY-LICENSES.md`

---

## 💡 トラブルシューティング
- P2P がつながらない: `VITE_PEERJS_*` / `VITE_TURN_*` を設定、HTTPS でアクセス、双方が同じ `sid` を使っているか確認
- `vite preview` で表示されない: ルートパスではなく `index.html` を開き、HashRouter の `#/` 付き URL を確認
- 依存エラー: Node/npm のバージョンが要件を満たしているか確認し、`rm -rf node_modules && npm ci` を再実行
