# 誓約 ⚔ 契約 — Vow Pact

> **目標と試練を「誓い」に変え、達成すれば紋章を得る。**
> 自分との契約を形にする、中世ファンタジー風の自己鍛錬 SPA。

[![Production](https://img.shields.io/badge/production-vow--pact.onrender.com-8b1a1a)](https://vow-pact.onrender.com)
[![Ruby](https://img.shields.io/badge/Ruby-3.4-c01136)](https://www.ruby-lang.org/)
[![Rails](https://img.shields.io/badge/Rails-8.1-cc0000)](https://rubyonrails.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)](https://www.typescriptlang.org/)

---

## 目次

- [コンセプト](#コンセプト)
- [主要機能](#主要機能)
- [技術スタック](#技術スタック)
- [セットアップ](#セットアップ)
- [開発フロー](#開発フロー)
- [主要コマンド](#主要コマンド)
- [デプロイ](#デプロイ)
- [トラブルシューティング](#トラブルシューティング)
- [プロジェクト構造](#プロジェクト構造)
- [参考ドキュメント](#参考ドキュメント)

---

## コンセプト

「TODO」より重く、「誓い」として刻む自己鍛錬アプリ。

ユーザーは **目標 + 制約 + 期日** を契約として誓い、毎日チェックインで進捗を記録する。
契約期間中の遵守率が一定を超えると **紋章（4 段階レアリティ）** が授与される。

### 差別化ポイント

- **制約の明示**：単なる目標ではなく「やらないこと」もセットで誓う（例：「毎日 30 分読書する」+「夜 22 時以降スマホを触らない」）
- **紋章・称号付与**：達成体験をゲーム性で強化（common / rare / epic / legendary）
- **中世ファンタジー世界観**：羊皮紙風のデザインで「誓い」の重みを演出

本番デモ：**https://vow-pact.onrender.com**

---

## 主要機能

| 機能                 | 内容                                                              |
| -------------------- | ----------------------------------------------------------------- |
| 認証                 | メール + パスワード（Cookie セッション、Devise 不採用）          |
| 契約作成             | 4 ステップ（目標 → 制約 → 期日と難易度 → 確認）                   |
| AI 提案              | テーマ→目標案 / 目標→制約案 / 難易度判定 / おまかせランダム提案   |
| チェックイン         | 1 日 1 契約 1 件、訂正は同日 POST で UPDATE                       |
| 連続記録             | StreakCalculator が `users.streak_count` を自動更新                |
| 達成判定             | PactCompleter が compliance_rate ≥ 0.5 で `completed` 化         |
| 紋章生成             | CrestGenerator がレアリティ計算 + パーツ抽選で紋章を自動生成      |
| ランキング           | 月間達成数ランキング / 連続記録ランキング（dense rank）           |
| 𝕏 シェア             | 契約締結時に X 投稿画面を開く                                     |
| AI ロギング          | 全 AI 呼び出しを ai_generations に記録（コスト分析・問題再現）   |
| レート制限           | 1 ユーザー 1 分 10 回（429 で弾く）                              |

---

## 技術スタック

### バックエンド

| カテゴリ           | 採用                                    | 不採用                       |
| ------------------ | --------------------------------------- | ---------------------------- |
| 言語 / FW          | Ruby 3.4 / Rails 8.1                    | -                            |
| DB                 | PostgreSQL 18（dev: Docker / prod: Neon）| -                            |
| 認証               | Rails 8 標準ジェネレータ                | Devise                       |
| Job / Cache        | Solid Queue / Solid Cache               | Sidekiq / Redis              |
| Serializer         | alba                                    | active_model_serializers     |
| Test / Lint        | RSpec / factory_bot / faker / RuboCop   | Minitest                     |
| AI                 | OpenAI（gpt-5.4-nano）                  | -                            |

### フロントエンド

| カテゴリ           | 採用                                       |
| ------------------ | ------------------------------------------ |
| 言語 / FW          | TypeScript 5 / React 19                    |
| ビルド             | Vite + vite_rails（Rails 統合）            |
| ルーティング       | React Router v7                            |
| 状態管理           | TanStack Query v5（サーバ状態）/ React Context（ローカル状態）|
| スタイリング       | Tailwind CSS v4                            |
| Test / Lint        | Vitest + Testing Library / ESLint + Prettier|

### インフラ / 開発環境

| カテゴリ           | 採用                                       |
| ------------------ | ------------------------------------------ |
| 開発環境           | Docker Compose                             |
| 本番アプリ         | Render Free                                |
| 本番 DB            | Neon Free（PostgreSQL）                    |
| CI / CD            | GitHub Actions（lint + scan + Render auto-deploy）|
| Sleep 対策         | GitHub Actions Cron で `/up` を 14 分間隔 ping |

詳細は [`docs/architecture.md`](docs/architecture.md)（執筆予定）と [`CLAUDE.md`](CLAUDE.md)。

---

## セットアップ

### 前提

- **Docker Desktop**（推奨）
- **Git**
- **OpenAI API キー**（任意：AI 機能を試したい場合）

ローカル Ruby / Node のインストールは不要（すべて Docker コンテナ内で完結）。

### 手順

```bash
# 1. リポジトリ clone
git clone git@github.com:naganobol6212/vow_pact.git
cd vow_pact

# 2. 環境変数ファイルを作成
cp .env.example .env

# .env を開いて以下を設定：
#   POSTGRES_PASSWORD=（任意の値、例: password）
#   DATABASE_URL=postgresql://vow_pact:password@db:5432/vow_pact_development
#   OPENAI_API_KEY=sk-proj-...（AI 機能を試したい場合）

# 3. Docker コンテナを起動
docker compose up -d

# 4. DB 作成 + マイグレーション
docker compose exec web bin/rails db:create db:migrate

# 5. ブラウザでアクセス確認
open http://localhost:3000
```

### OpenAI API キーの取得（任意）

AI 機能（目標案 / 制約案 / 難易度判定など）を試したい場合：

1. [OpenAI Platform](https://platform.openai.com/api-keys) で API キー発行（`sk-proj-` で始まる）
2. **Billing にクレジット追加**（$5 程度。`gpt-5.4-nano` は安価で MVP で十分）
3. `.env` の `OPENAI_API_KEY=` に貼り付け
4. `docker compose down && docker compose up -d` でコンテナを **再作成**（restart では `.env` が再読込されない）

---

## 開発フロー

GitHub Flow（main + feature/\*）を採用。

```bash
# 最新の main から派生
git switch main && git pull origin main
git switch -c feature/issue-N-short-name

# 開発（TDD: Red → Green → Refactor）
./bin/rspec spec/path/to_spec.rb       # 部分実行
./bin/rspec                             # 全実行
docker compose exec web bundle exec rubocop -a
docker compose exec web npm run lint
docker compose exec web npm run typecheck

# コミット → push → PR
git add ...
git commit -m "意図を表すタイトル..."
git push -u origin feature/issue-N-short-name
gh pr create --title "..." --body "..."

# CI 通過確認 → CodeRabbit レビュー対応 → マージ
gh pr checks <PR番号>
gh pr merge <PR番号>
```

### コミットメッセージ規約

- **言語**：日本語（コード自体は英語）
- **意図ファースト**：「何を変えたか」より「なぜ変えたか」を本文に
- **Refs / Closes**：`Refs #19` / `closes #13`

例：

```
チェックイン API を追加（POST / GET / DELETE）

エンドポイント:
- POST   /api/v1/pacts/:pact_id/check_ins  記録 / 訂正
- GET    /api/v1/pacts/:pact_id/check_ins  履歴取得（?month=YYYY-MM 対応）
- DELETE /api/v1/pacts/:pact_id/check_ins/:id  訂正削除

Refs #19
```

詳細は [`CLAUDE.md`](CLAUDE.md) のコミットルール参照。

---

## 主要コマンド

### Docker

```bash
docker compose up -d                  # コンテナ起動（バックグラウンド）
docker compose down                   # 停止 + コンテナ削除
docker compose restart web            # web 再起動（.env 変更時は up -d 再作成が必要）
docker compose logs web --tail=50     # 直近 50 行のログ
docker compose exec web bash          # web コンテナにシェルで入る
```

### Rails

```bash
docker compose exec web bin/rails console
docker compose exec web bin/rails db:migrate
docker compose exec web bin/rails db:rollback
docker compose exec web bin/rails db:migrate:status
docker compose exec web bin/rails routes | grep pacts
```

### テスト

```bash
./bin/rspec                                          # 全テスト
./bin/rspec spec/models/check_in_spec.rb            # 特定ファイル
./bin/rspec spec/models/check_in_spec.rb:42         # 特定行
docker compose exec web npm run test                # フロント Vitest
docker compose exec web npm run test:watch          # フロント watch モード
```

`./bin/rspec` ラッパーを使うのが**必須**。理由は[トラブルシューティング](#トラブルシューティング)参照。

### Lint / 型チェック

```bash
docker compose exec web bundle exec rubocop -a       # 自動修正付き
docker compose exec web npm run lint                 # ESLint
docker compose exec web npm run lint:fix             # ESLint 自動修正
docker compose exec web npm run typecheck            # TypeScript 型チェック
```

### フロントエンド

```bash
# Vite 開発サーバーは Rails 起動時に自動で立ち上がる（ポート 3036）
# ブラウザでは http://localhost:3000 にアクセス（Rails 経由で配信）

docker compose exec web npm run build                # 本番ビルド
docker compose exec web npm install <package>        # パッケージ追加
```

### `.zshrc` エイリアス（推奨）

```bash
alias dcw="docker compose exec web"
alias dcr="./bin/rspec"
```

これで `dcw bin/rails console` / `dcr spec/...` のように短く打てる。

---

## デプロイ

main ブランチに push すると **Render が自動でデプロイ**する（`render.yaml` 参照）。

### Render 環境変数（4 つ）

| 変数              | 値                                                    |
| ----------------- | ----------------------------------------------------- |
| `DATABASE_URL`   | Neon の **Pooled connection URL**（`pgbouncer=true` 必須）|
| `RAILS_MASTER_KEY`| `config/master.key` の中身（**改行混入注意**）        |
| `OPENAI_API_KEY` | OpenAI ダッシュボードで発行                           |
| `RAILS_ENV`      | `production`                                          |

`RAILS_MASTER_KEY` は **改行を含めない**ように注意（Mac の場合 `tr -d '\n' | pbcopy` で確実）：

```bash
cat config/master.key | tr -d '\n' | pbcopy
```

### Sleep 対策

Render Free は 15 分無アクセスで Sleep するため、GitHub Actions で 14 分間隔で `/up` を ping している。詳細は `.github/workflows/keepalive.yml` 参照。

---

## トラブルシューティング

### `bin/rspec` ラッパーを使う理由

`docker-compose.yml` は `RAILS_ENV=development` と `DATABASE_URL`（development DB）を固定している。
素のまま `docker compose exec web bundle exec rspec` を叩くと **development 環境 / development DB** で動作し、`config/environments/test.rb` 側の設定（CSRF disable / hosts 緩和など）が反映されず request spec が 403 で失敗する。

**必ず `./bin/rspec` を使う**こと（内部で `RAILS_ENV=test` + test DB を上書き指定している）。

### `RAILS_MASTER_KEY` が「16 bytes じゃない」エラー

```
ArgumentError: key must be 16 bytes
```

→ Render UI から登録した値に **改行が混入**している。`tr -d '\n' | pbcopy` で再コピーして上書き登録。

### `OPENAI_API_KEY is not set` がコンテナ内で消えない

`.env` を変更したのに反映されない場合、`docker compose restart` ではなく **`down → up -d`** が必要：

```bash
docker compose down && docker compose up -d
```

`docker compose` は `.env` を **コンテナ起動時にしか読まない**ため。

### `npm ci` で「Missing X from lock file」

```bash
docker compose exec web npm install
git add package-lock.json
git commit -m "package-lock.json を再生成"
```

### 紋章 / streak が更新されない

CheckIn の after_save コールバックが走らないと StreakCalculator / PactCompleter が起動しない。spec で transactional fixtures + after_commit が動作しない問題があったため、`after_save` + `update_columns` + `with_lock` の組み合わせで実装している。詳細は `app/models/check_in.rb`。

---

## プロジェクト構造

```
vow_pact/
├── app/
│   ├── controllers/
│   │   ├── api/v1/                  # API エンドポイント（auth, pacts, check_ins, rankings, ai）
│   │   ├── concerns/                # 認証 / レート制限など横断関心
│   │   └── home_controller.rb       # SPA shell（HTML 配信のみ）
│   ├── models/                      # users, pacts, check_ins, crests, ai_generations, sessions
│   ├── services/                    # PactCompleter, StreakCalculator, CrestGenerator, ai/*
│   ├── serializers/                 # alba ベース
│   └── frontend/                    # vite_rails 規約
│       ├── pages/                   # HomePage, AuthPage, CreatePactStep1〜4, SignedPage 等
│       ├── components/              # Layout, Button, FormField, ShareButton 等
│       ├── hooks/                   # useAuth, useAi
│       ├── contexts/                # CreatePactContext
│       ├── lib/                     # api fetch wrapper, share builder
│       ├── constants/               # 文言テンプレート
│       └── types/                   # TypeScript 型定義
│
├── spec/                            # RSpec
│   ├── models/
│   ├── requests/api/v1/
│   ├── services/
│   └── factories/
│
├── docs/
│   ├── data_model.md                # ER 図 + テーブル仕様
│   ├── api_design.md                # API 設計判断記録
│   ├── setup_guide.md               # 詳細セットアップ手順
│   └── VowPact_mock/                # デザインモック（jsx）
│
├── .github/workflows/
│   ├── ci.yml                       # lint + scan
│   └── keepalive.yml                # Render Sleep 対策（14 分間隔 ping）
│
├── docker-compose.yml
├── Dockerfile.dev                   # 開発用
├── render.yaml                      # 本番デプロイ設定
├── bin/render-build.sh              # 本番ビルドスクリプト
├── bin/rspec                        # RSpec ラッパー（test 環境を強制）
├── CLAUDE.md                        # Claude Code 用プロジェクトガイド
└── README.md                        # ← この文書
```

---

## 参考ドキュメント

| 文書                                          | 内容                                       |
| --------------------------------------------- | ------------------------------------------ |
| [`CLAUDE.md`](CLAUDE.md)                      | プロジェクト全体の規約・設計判断・コーディング規約 |
| [`docs/data_model.md`](docs/data_model.md)    | ER 図 + 各テーブルの仕様                  |
| [`docs/api_design.md`](docs/api_design.md)    | API エンドポイント仕様                     |
| [`docs/setup_guide.md`](docs/setup_guide.md)  | 詳細なセットアップ手順                    |

---

## ライセンス

このプロジェクトは個人開発・学習目的で公開されています。商用利用や再配布については別途連絡してください。

---

**作者**：[masagin](https://github.com/naganobol6212)
**本番**：https://vow-pact.onrender.com
