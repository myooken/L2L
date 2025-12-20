# Contributing Guide

## 基本方針
- 小さな変更単位で PR を作成してください
- 挙動変更や大きな仕様追加は事前に Issue で合意してください
- P2P / 非保存の設計を壊さないでください（回答を永続化しない・URL 共有前提を尊重）

## セットアップ
```bash
npm ci
npm run dev
```
- 環境変数は `.env.local` などに配置し、リポジトリへコミットしない
- PeerJS / TURN の認証情報や招待リンクをログやスクリーンショットに残さない

## npm scripts
- `npm run dev`: Vite 開発サーバー
- `npm run build`: 型チェック + 本番ビルド
- `npm run preview`: ビルド済み成果物のプレビュー
- `npm run test` / `npm run test:ci`: Vitest
- `npm run lint`: ESLint（警告ゼロを維持）
- `npm run format`: ESLint --fix で整形
- `npm run licenses:generate`: @myooken/license-output で THIRD-PARTY-LICENSE.md / THIRD-PARTY-LICENSE-REVIEW.md を生成

## コードのルール
- TypeScript / ESLint の警告は原則ゼロにする
- 意図が分かりにくい処理や P2P 周りの分岐には短いコメントを添える
- ライセンス出力は手動実行（GitHub Actions なし）なので、変更があれば `npm run licenses:generate` を走らせる

## チェック
```bash
npm run test
npm run lint
npm run build
```
変更規模が小さくても、少なくとも lint と必要な単体テストを実行してください。
