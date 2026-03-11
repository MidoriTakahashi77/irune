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

# マイグレーション適用
supabase migration up
```

`supabase start` の出力からAPI URLとanon keyをコピーし、`.env` を更新:

```bash
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_KEY=<出力されたanon key>
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

## E2Eテスト

[Maestro](https://maestro.mobile.dev/) を使ったUIの自動テスト。Supabase Cloud上にテストユーザーを作成し、ディープリンクでセッションを注入してログイン済み状態でテストを実行する。

### 前提条件

- Xcode（App Store版、フルインストール）
- Java 17以上
- Maestro CLI
- Supabase Cloudプロジェクト（テスト用）

### 環境構築

#### 1. Xcode developer toolsの設定

```bash
# Xcode本体のツール群を有効にする（simctl等が必要）
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

#### 2. Java 17 のインストール

```bash
brew install openjdk@17
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### 3. Maestro CLI のインストール

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

> **注意**: `brew install maestro` は別ソフト（AI agent tool）なので使わないこと。

インストール後、ターミナルを再起動するか `source ~/.zshrc` を実行。

#### 4. Development Build の作成

Expo Go ではカスタムURLスキーム（`irune://`）やバンドルID（`com.irune.app`）が使えないため、ネイティブビルドが必要。

```bash
# dev-client パッケージを追加
bun add expo-dev-client

# ネイティブプロジェクト (ios/) を生成
npx expo prebuild --platform ios

# ビルドしてシミュレータにインストール
npx expo run:ios
```

- 初回ビルドは数分かかる
- `ios/` ディレクトリが生成される（`.gitignore` に含まれているのでリポジトリには入らない）

#### 5. Supabase 環境変数の設定

```bash
cp .env.e2e.example .env.e2e
```

`.env.e2e` を編集して、Supabase Cloudプロジェクトのキーを設定:

```bash
# Supabase Dashboard → Settings → API Keys で確認
SUPABASE_SECRET_KEY=sb_secret_...
```

`SUPABASE_URL` と `SUPABASE_PUBLISHABLE_KEY` は `.env` から自動で読み込まれるため、通常は設定不要。

#### 6. DBマイグレーションの適用（初回のみ）

Supabase Cloudにテーブルが未作成の場合:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

または Supabase Dashboard → SQL Editor で `supabase/migrations/` 内のSQLを実行。

### テスト実行

```bash
# 全E2Eテスト実行
bun run e2e

# 特定テストのみ
E2E_TEST_FILE=.maestro/calendar-create-event.yaml bun run e2e
```

### テストファイル

| ファイル | 内容 |
|----------|------|
| `calendar-create-event.yaml` | 予定作成の全機能テスト（15テスト） |
| `calendar-recurrence-verify.yaml` | 繰り返し予定が未来日に表示されるか検証 |
| `calendar-multiday-event.yaml` | 複数日にまたがる予定の作成と表示 |

### トラブルシューティング

| エラー | 原因と対処 |
|--------|-----------|
| `0 devices connected` | シミュレータが起動していない → `open -a Simulator` |
| `Failed to get app binary directory` | Development Build が未インストール → `npx expo run:ios` |
| `Java 17 or higher is required` | Java未インストール → `brew install openjdk@17` |
| `command not found: maestro` | Maestro未インストール or PATH未設定 → ターミナル再起動 |
| `Could not find the table` | DB未マイグレーション → `supabase db push` |
| `SUPABASE_SECRET_KEY is required` | `.env.e2e` 未作成 → `cp .env.e2e.example .env.e2e` して編集 |
