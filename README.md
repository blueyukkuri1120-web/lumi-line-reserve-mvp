# Lumi Line Reserve MVP

LINE から予約・確認・変更・キャンセルができる、一人営業サロン向け予約導線 MVP です。  
まつげ・眉毛・ネイル系の個人サロンを想定し、LIFF での導線、LINE Messaging API Webhook、Supabase 保存、管理画面をまとめて実装しています。

## プロジェクト概要

- LINE 内から開ける予約トップを用意
- 予約フォームで空き枠を見ながら予約を作成
- 予約番号で予約確認
- 予約番号で変更申請 / キャンセル申請
- 管理画面で予約一覧・詳細・メニュー・休業枠・店舗設定を管理
- LINE Webhook で最低限の自動応答を実装

見た目だけのモックではなく、実際に動く MVP として構成しています。

## 想定ユースケース

- 施術中で電話に出づらい一人サロンが、LINE 導線で予約受付したい
- 予約確認や変更申請をスタッフ不在でも受けられるようにしたい
- 営業用デモではなく、ポートフォリオとして「本当に作れる」ことを示したい

## 機能一覧

### ユーザー側

- LIFF 予約トップ
- 予約フォーム
- 空き枠取得 API
- 予約番号発行
- 予約確認
- 変更申請
- キャンセル申請
- アクセス案内

### 管理者側

- 管理画面ログイン
- 予約一覧
- 予約詳細
- ステータス更新
- 管理メモ更新
- 変更申請内容の確認
- 休業枠管理
- メニュー管理
- 店舗設定管理

### LINE 連携

- Webhook エンドポイント
- HMAC-SHA256 による署名検証
- `follow` / `message` / `postback` 対応
- キーワード応答
- 予約作成後の push メッセージ送信

## 技術スタック

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- Supabase PostgreSQL
- LINE Messaging API
- LIFF SDK
- Vercel デプロイ前提の構成

## ディレクトリ構成

```text
.
├─ src
│  ├─ app
│  │  ├─ admin
│  │  ├─ api
│  │  ├─ reservation
│  │  ├─ reserve
│  │  └─ access
│  ├─ components
│  ├─ lib
│  └─ types
├─ supabase
│  ├─ migrations
│  └─ seed.sql
├─ .env.example
├─ package.json
└─ README.md
```

## ローカル起動方法

### 1. 依存関係をインストール

```bash
npm install
```

### 2. 環境変数を設定

`.env.example` を `.env.local` にコピーして値を入れてください。

```bash
cp .env.example .env.local
```

### 3. Supabase に SQL を適用

順番:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/seed.sql`

### 4. 開発サーバー起動

```bash
npm run dev
```

### 5. 検証コマンド

```bash
npm run typecheck
npm run lint
npm run build
```

このリポジトリでは上記 3 つを通過済みです。

## 環境変数一覧

| 変数名 | 用途 |
|---|---|
| `NEXT_PUBLIC_APP_URL` | 公開 URL。Webhook 文面や LIFF 導線に使用 |
| `NEXT_PUBLIC_LIFF_ID` | LIFF ID。LIFF 初期化に使用 |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 将来のクライアント接続用。MVP では主に README 用 |
| `SUPABASE_SERVICE_ROLE_KEY` | サーバー側 DB 操作用 |
| `LINE_CHANNEL_SECRET` | Webhook 署名検証用 |
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE reply / push 用 |
| `ADMIN_EMAIL` | 管理画面ログイン ID |
| `ADMIN_PASSWORD` | 管理画面ログインパスワード |
| `ADMIN_SESSION_SECRET` | 管理画面セッション Cookie 署名鍵 |
| `APP_TIMEZONE` | 予約枠判定用タイムゾーン。初期値 `Asia/Tokyo` |

## Supabase 準備手順

1. Supabase プロジェクトを作成
2. `Project Settings` から `URL` と `Service Role Key` を取得
3. SQL Editor で `supabase/migrations/001_initial_schema.sql` を実行
4. 続けて `supabase/seed.sql` を実行
5. `.env.local` に `NEXT_PUBLIC_SUPABASE_URL` と `SUPABASE_SERVICE_ROLE_KEY` を設定

### 作成される主なテーブル

- `reservations`
- `menus`
- `blocked_slots`
- `business_settings`
- `message_logs`
- `reservation_histories`

### 補足

- `blocked_slots` には `is_all_day` を追加しています
- `reservation_histories` で変更 / キャンセル履歴を保持しています
- 予約作成は `create_reservation_with_lock` 関数で二重登録を避けています

## LINE Developers 準備手順

1. LINE Developers で Provider を作成
2. Messaging API Channel を作成
3. `Channel secret` と `Channel access token` を取得
4. Webhook を有効化
5. 応答メッセージを必要に応じて OFF にして、このアプリの Webhook 応答を優先

## Messaging API 設定手順

### Webhook URL 設定手順

本番 URL が `https://your-domain.com` の場合:

```text
https://your-domain.com/api/line/webhook
```

LINE Developers の Webhook URL に上記を設定し、検証してください。

### Webhook の実装内容

- 署名検証
- follow イベント時の案内
- message イベント時のキーワード応答
- postback イベント時の案内
- `message_logs` への保存

### 対応キーワード

- `予約`
- `予約確認`
- `変更`
- `キャンセル`
- `アクセス`

## LIFF 設定手順

1. LINE Developers で LIFF アプリを作成
2. Endpoint URL にトップページを設定

```text
https://your-domain.com/
```

3. LIFF ID を `NEXT_PUBLIC_LIFF_ID` に設定
4. LINE 内で開いて `window.liff.getProfile()` が取れるか確認

### 実装上の扱い

- LIFF SDK は `https://static.line-scdn.net/liff/edge/2/sdk.js` を読み込みます
- LIFF が有効な場合は LINE 表示名を予約フォームへ自動反映します
- LINE ログインが取れた場合は `line_user_id` も予約に保存します

## リッチメニュー設定例

MVP では「1つの LIFF トップから 4 導線へ分岐する」構成をおすすめします。

### 推奨パターン

- ボタン 1: `予約する` -> `https://your-domain.com/`
- ボタン 2: `予約確認` -> `https://your-domain.com/`
- ボタン 3: `変更・キャンセル` -> `https://your-domain.com/`
- ボタン 4: `アクセス` -> `https://your-domain.com/`

理由:

- 1 つの LIFF ID で運用しやすい
- LINE 内でトップを開いたまま 4 導線を選べる
- LINE プロフィール取得の導線を揃えやすい

### 直接リンクしたい場合

- `https://your-domain.com/reserve`
- `https://your-domain.com/reservation/check`
- `https://your-domain.com/reservation/manage`
- `https://your-domain.com/access`

この場合は通常の LINE 内ブラウザ動作になります。全画面で LIFF 文脈を強く使いたいなら、用途ごとに LIFF アプリを分ける案もあります。

## デプロイ方法

### Vercel

1. GitHub に push
2. Vercel でプロジェクトを import
3. 環境変数を Vercel に登録
4. デプロイ
5. デプロイ後 URL を `NEXT_PUBLIC_APP_URL` に反映
6. LINE Webhook URL と LIFF Endpoint URL を本番 URL に更新

## 実装メモ

### 予約フロー

1. LIFF トップを開く
2. 予約フォームへ遷移
3. メニューと日付から空き枠を取得
4. 予約保存
5. 予約番号発行
6. 完了画面表示
7. 管理画面へ即反映

### 変更フロー

1. 予約番号で検索
2. 新しい希望日時を入力
3. `reschedule_requested` に更新
4. `reservation_histories` に記録
5. 管理画面から確認して手動調整

### キャンセルフロー

1. 予約番号で検索
2. キャンセル申請
3. `cancelled` に更新
4. 履歴に保存

## 注意事項

- この MVP は一人営業前提です
- 同時施術やスタッフ別管理は未対応です
- 支払い連携は未実装です
- 高度な会員機能や CRM 分析は未実装です
- 管理者認証は MVP 向けのシンプル実装です

## セキュリティ上の注意

- `SUPABASE_SERVICE_ROLE_KEY` は絶対にクライアントへ公開しないでください
- `LINE_CHANNEL_SECRET` はサーバーでのみ使用してください
- Webhook は必ず HTTPS で公開してください
- 管理画面は Cookie 署名だけでなく、ページ側 / API 側の両方でセッション確認しています
- 環境変数が漏れた場合は必ずローテーションしてください
- `ADMIN_PASSWORD` は推測困難な長い値を使ってください

## 今後の拡張案

- 管理画面でのドラッグ型カレンダー表示
- 変更申請を承認すると自動で新枠へ移動する処理
- LINE Flex Message での見やすい予約案内
- Supabase Auth 連携による管理者認証強化
- 複数 LIFF アプリで各導線を直接起動
- リマインド通知
- スタッフ別 / 多店舗別の枠管理

## この時点でできること

- LINE Webhook を受ける
- LIFF 前提の予約トップを表示する
- 空き枠を見ながら予約する
- 予約番号で検索する
- 変更申請 / キャンセル申請を出す
- 管理画面で予約一覧 / 詳細を操作する
- メニュー・休業枠・店舗情報を更新する

## まだ未実装のもの

- 決済
- 自動承認フロー
- スタッフ別予約
- 多店舗管理
- 高度な通知分岐
- 顧客ランク / CRM 分析

## 補足

この MVP は「動くポートフォリオ」として説明しやすいよう、  
画面・API・DB・Webhook・README を全部同一リポジトリにまとめています。
