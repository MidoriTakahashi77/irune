# irune

3世代家族向けライフアプリ。カレンダー・日記・ノート・緊急連絡機能を備えた家族共有アプリ。

## 技術スタック

- **フレームワーク**: Expo SDK 55 (React Native) + Expo Router v7
- **バックエンド**: Supabase (Auth / PostgreSQL / Realtime / Storage)
- **状態管理**: TanStack Query v5 + Zustand
- **フォーム**: React Hook Form + Zod v3
- **カレンダー**: react-native-calendars (Wix)
- **i18n**: i18next (日本語デフォルト)
- **パッケージマネージャー**: bun

## 環境構築

### 前提条件

- [Node.js](https://nodejs.org/) v22+
- [bun](https://bun.sh/)
- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (ローカルSupabase用)
- [Expo Go](https://expo.dev/go) (実機テスト用) または iOS Simulator / Android Emulator

### セットアップ

```bash
# 依存パッケージのインストール
bun install

# ローカルSupabaseの起動 (Docker必須)
supabase start

# マイグレーション適用 (初回 or スキーマ変更時)
supabase db reset
```

`supabase start` の出力からAPI URLとanon keyをコピーし、`.env` を更新:

```bash
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<出力されたanon key>
```

### ポート競合時

別のSupabaseプロジェクトが動いている場合:

```bash
# 既存プロジェクトを停止
supabase stop --project-id <project-id>

# または supabase/config.toml でポートを変更
```

## 開発

```bash
# 開発サーバー起動
bun start

# iOS Simulator
bun run ios

# Android Emulator
bun run android

# Web
bun run web
```

Expo Goアプリで表示されるQRコードを読み取ると実機でテスト可能。

### Supabase Studio

ローカルSupabase起動中は http://127.0.0.1:54323 でStudio (DB管理画面) にアクセス可能。テーブル閲覧・データ編集・SQLエディタが使える。

### 型チェック

```bash
bunx tsc --noEmit
```

## プロジェクト構成

```
src/
├── app/                  # Expo Router ルート
│   ├── (auth)/           # ログイン・登録・家族作成
│   ├── (tabs)/           # メインタブ (ホーム/ノート/カレンダー/緊急)
│   └── settings/
├── components/
│   ├── ui/               # Button, Card, Input, FAB
│   └── calendar/         # MonthlyCalendar, ScheduleCard, ScheduleList
├── hooks/                # useAuth, useEvents, useDiaryEntries, useCalendarStore
├── services/             # Supabaseクエリ
├── lib/                  # supabase, queryClient, i18n
├── types/                # database.ts, events.ts
├── constants/            # theme.ts, categories.ts
├── locales/              # ja.json, en.json
└── utils/                # date.ts, validation.ts
```

## DBスキーマ

マイグレーションファイル: `supabase/migrations/00001_initial_schema.sql`

主要テーブル: families, profiles, events, diary_entries, diary_media, notes, emergency_contacts

RLSにより全データが family_id 単位で分離される。
