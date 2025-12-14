# Contributing Guide

## 基本方針
- 小さな変更単位で PR を作成してください
- 挙動変更や仕様追加は事前に Issue を立てて合意してください
- P2P / 非保存の設計を壊さないようにしてください（回答を永続化しない、URL 共有の前提を尊重する）

## セットアップ
```bash
npm ci
npm run dev
```
- 環境変数は `.env.local` などに配置し、リポジトリへコミットしないでください
- PeerJS / TURN の資格情報や共有リンクをログやスクリーンショットに残さないようにしてください

## npm scripts
- `npm run dev`: Vite 開発サーバー
- `npm run build`: 型チェック + 本番ビルド
- `npm run preview`: ビルド済み成果物のプレビュー
- `npm run test` / `npm run test:ci`: Vitest
- `npm run lint`: ESLint（警告ゼロを維持）
- `npm run format`: ESlint で成形

## コーディングルール
- TypeScript / ESLint の警告は原則ゼロにする
- 意図が分かりにくい処理や P2P 周りの分岐には短いコメントを添える
- 新しい依存追加時はライセンス確認と `licenses.json` 更新を行う

## テスト
```bash
npm run test
npm run lint
npm run build
```
変更規模が小さくても、少なくとも lint + 必要な単体テストを実行してください。
