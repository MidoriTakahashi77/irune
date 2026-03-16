# セキュリティスキャン検出事項 (2026-03-16)

OWASP ZAP (DAST) による検出結果。Semgrep (SAST) は検出0件。

## 対応状況

| # | 問題 | リスク | 対応 | ファイル |
|---|------|--------|------|----------|
| 1 | CSP ヘッダー未設定 | Medium | 対応済 | `src/app/+html.tsx` (メタタグ) |
| 2 | クリックジャッキング対策未設定 | Medium | 対応済 | `src/app/+html.tsx` (CSP frame-ancestors) + `serve.json` (X-Frame-Options) |
| 3 | Cross-Origin 隔離ヘッダー未設定 | Low | 対応済 | `serve.json` (COOP/CORP)。COEP は Supabase Storage との互換性のため未設定 |
| 4 | バンドル内の eval() | Low | 許容 | 依存ライブラリ由来 (uuid, Metro bundler)。CSP で unsafe-eval を除外済 |
| 5 | Permissions-Policy 未設定 | Low | 対応済 | `serve.json` |
| 6 | X-Content-Type-Options 未設定 | Low | 対応済 | `serve.json` |

## 対応詳細

### Issue 1: CSP — `src/app/+html.tsx`

Expo Router の `+html.tsx` カスタムテンプレートで CSP メタタグを設定。

```
default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https://*.supabase.co;
connect-src 'self' https://*.supabase.co wss://*.supabase.co;
font-src 'self'; frame-ancestors 'none';
```

- `unsafe-inline` は Expo Router が生成するインラインスクリプト/スタイルに必要
- `unsafe-eval` は含めていない — Issue 4 の eval は CSP 違反になるがブラウザ環境では実行されないパス
- 本番デプロイ時は `https://*.supabase.co` を実際のプロジェクトURLに絞ることを推奨

### Issue 2: クリックジャッキング — CSP frame-ancestors + X-Frame-Options

- CSP `frame-ancestors 'none'` で対応 (Issue 1 に含む)
- `serve.json` で `X-Frame-Options: DENY` も設定（レガシーブラウザ向けフォールバック）

### Issue 3: Cross-Origin 隔離 — `serve.json`

- `Cross-Origin-Opener-Policy: same-origin` — 設定済
- `Cross-Origin-Resource-Policy: same-origin` — 設定済
- `Cross-Origin-Embedder-Policy` — 未設定（Supabase Storage からのクロスオリジン画像読み込みをブロックするため）

### Issue 4: eval() — 許容（依存ライブラリ由来）

調査の結果、3箇所すべてが依存ライブラリ由来:

- **uuid ライブラリ** (2箇所): `eval('require')('node:crypto')` — Node.js 環境フォールバック。ブラウザでは `crypto.randomUUID()` が使われるため eval は実行されない
- **Metro bundler** (1箇所): split bundle ロード用。静的エクスポートでは使用されない

CSP で `unsafe-eval` を許可していないため、万が一実行されても CSP がブロックする。

### Issue 5: Permissions-Policy — `serve.json`

```
camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()
```

### Issue 6: X-Content-Type-Options — `serve.json`

```
X-Content-Type-Options: nosniff
```

## 本番デプロイ時の注意

`serve.json` は開発・DAST スキャン用の設定。本番環境では、デプロイ先 (Vercel, Cloudflare Pages, Netlify 等) の設定でHTTPレスポンスヘッダーを付与すること。CSP メタタグ (`+html.tsx`) はビルド出力に含まれるため追加設定不要。
