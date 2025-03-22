# Hokori note

Obsidian のノートをブログとして公開するための Web アプリケーションです。

## 概要

このプロジェクトは、Obsidian の特定ディレクトリ下のノートをブログとして公開するためのシンプルなアプリケーションです。Markdown 形式で書かれたノートを美しく表示し、タグによる整理や検索機能を提供します。

## 機能

- 📝 Obsidian ノートのブログ形式での表示
- 🔍 タグとタイトルによる検索
- 🌙 ダークテーマのみのシンプルな UI
- 📱 レスポンシブデザイン
- 🔗 ノート間のリンク対応

## 技術スタック

- React + React Router 7
- Tailwind CSS
- TypeScript

## 開発環境

### 必要条件

- Node.js 18 以上
- npm または yarn

### インストール

```bash
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

アプリケーションは `http://localhost:5173` で利用できます。

### ビルド

```bash
npm run build
```

## Obsidian の設定

- `_published/` ディレクトリ以下のノートが公開対象となります
- 添付ファイルは `_config/attachment` に保存してください
- 各ノートには以下のプロパティを設定してください:
  - aliases: slug（URL）として使用されます
  - tags: ブログのタグとなります
  - create_date: 作成日 (YYYY-MM-DD)
  - update_date: 更新日 (YYYY-MM-DD)
  - uid: ユニーク ID
  - published: true の場合のみ公開されます

---

© 2024 Hokori note
